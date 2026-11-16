import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { StudySession, ConceptNode, Flashcard, QuizQuestion, ChatMessage, AppSettings } from '../models/study-session.model';
import { StorageService } from './storage.service';
import { MockDataService } from './mock-data.service';
import { LlmService } from './llm.service';
import { SpacedRepetitionService } from './spaced-repetition.service';

export type WorkspaceTab = 'chat' | 'flashcards' | 'conceptMap' | 'quiz';

@Injectable({
  providedIn: 'root'
})
export class SessionStoreService {
  private storage = inject(StorageService);
  private mockData = inject(MockDataService);
  private llmService = inject(LlmService);
  private srs = inject(SpacedRepetitionService);

  // Core reactive signals
  readonly sessions = signal<StudySession[]>([]);
  readonly activeSessionId = signal<string | null>(null);
  readonly activeConceptId = signal<string | null>(null);
  readonly activeTab = signal<WorkspaceTab>('chat');
  readonly settings = signal<AppSettings>(this.storage.loadSettings());
  
  // Loading & async status signals
  readonly isGenerating = signal<boolean>(false);
  readonly isChatLoading = signal<boolean>(false);
  readonly toast = signal<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Derived / Computed state
  readonly activeSession = computed<StudySession | null>(() => {
    const id = this.activeSessionId();
    if (!id) return null;
    return this.sessions().find(s => s.id === id) || null;
  });

  readonly activeConcept = computed<ConceptNode | null>(() => {
    const session = this.activeSession();
    const conceptId = this.activeConceptId();
    if (!session || !conceptId) return null;

    const findNode = (nodes: ConceptNode[]): ConceptNode | null => {
      for (const node of nodes) {
        if (node.id === conceptId) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findNode(session.conceptMap);
  });

  readonly flashcardStats = computed(() => {
    const session = this.activeSession();
    if (!session || !session.flashcards.length) {
      return { total: 0, due: 0, mastered: 0, hard: 0, good: 0, easy: 0 };
    }

    const cards = session.flashcards;
    const total = cards.length;
    let due = 0;
    let mastered = 0;
    let hard = 0;
    let good = 0;
    let easy = 0;

    for (const c of cards) {
      if (this.srs.isCardDue(c)) due++;
      if (this.srs.isCardMastered(c)) mastered++;
      if (c.difficulty === 'hard') hard++;
      if (c.difficulty === 'good') good++;
      if (c.difficulty === 'easy') easy++;
    }

    return { total, due, mastered, hard, good, easy };
  });

  readonly quizStats = computed(() => {
    const session = this.activeSession();
    if (!session || !session.quizQuestions.length) {
      return { total: 0, answered: 0, correct: 0, percentage: 0 };
    }

    const questions = session.quizQuestions;
    const total = questions.length;
    const answered = questions.filter(q => q.userSelectedIndex !== undefined).length;
    const correct = questions.filter(q => q.userSelectedIndex === q.correctIndex).length;
    const percentage = answered > 0 ? Math.round((correct / answered) * 100) : 0;

    return { total, answered, correct, percentage };
  });

  constructor() {
    this.initializeState();

    // Auto-sync sessions to localStorage
    effect(() => {
      const currentSessions = this.sessions();
      this.storage.saveSessions(currentSessions);
    });

    // Auto-sync activeSessionId
    effect(() => {
      const activeId = this.activeSessionId();
      this.storage.saveActiveSessionId(activeId);
    });

    // Auto-sync settings
    effect(() => {
      const currentSettings = this.settings();
      this.storage.saveSettings(currentSettings);
    });
  }

  private initializeState(): void {
    let savedSessions = this.storage.loadSessions();
    if (!savedSessions || savedSessions.length === 0) {
      savedSessions = this.mockData.getSampleSessions();
      this.storage.saveSessions(savedSessions);
    }
    this.sessions.set(savedSessions);

    const savedActiveId = this.storage.loadActiveSessionId();
    if (savedActiveId && savedSessions.some(s => s.id === savedActiveId)) {
      this.activeSessionId.set(savedActiveId);
    } else if (savedSessions.length > 0) {
      this.activeSessionId.set(savedSessions[0].id);
    }
  }

  // --- ACTIONS ---

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toast.set({ message, type });
    setTimeout(() => {
      if (this.toast()?.message === message) {
        this.toast.set(null);
      }
    }, 5000);
  }

  async testConnection(settings: AppSettings) {
    return this.llmService.testConnection(settings);
  }

  selectSession(id: string): void {
    if (this.sessions().some(s => s.id === id)) {
      this.activeSessionId.set(id);
      this.activeConceptId.set(null);
    }
  }

  createNewSessionView(): void {
    this.activeSessionId.set(null);
    this.activeConceptId.set(null);
  }

  setActiveTab(tab: WorkspaceTab): void {
    this.activeTab.set(tab);
  }

  setActiveConcept(conceptId: string | null): void {
    this.activeConceptId.set(conceptId);
  }

  async createSession(
    content: string,
    sourceType: 'text' | 'topic',
    mode: 'standard' | 'quiz' | 'socratic'
  ): Promise<boolean> {
    this.isGenerating.set(true);
    try {
      const newSession = await this.llmService.generateStudySession(
        content,
        sourceType,
        mode,
        this.settings()
      );

      this.sessions.update(list => [newSession, ...list]);
      this.activeSessionId.set(newSession.id);
      this.activeConceptId.set(null);

      if (mode === 'quiz') {
        this.activeTab.set('quiz');
      } else if (mode === 'socratic') {
        this.activeTab.set('chat');
      } else {
        this.activeTab.set('chat');
      }

      const isLiveAi = this.settings().apiKey?.trim() && !this.settings().offlineDemoMode;
      this.showToast(
        isLiveAi 
          ? `Created with live ${this.settings().provider.toUpperCase()}: "${newSession.title}"` 
          : `Created with simulation engine: "${newSession.title}"`, 
        'success'
      );
      return true;
    } catch (err: any) {
      console.error('Failed to create session with live AI', err);
      this.showToast(`Live AI error: ${err.message}. Switched to offline backup.`, 'error');
      
      // Generate fallback so user still gets an interactive session
      const fallback = this.mockData.generateProceduralSession(content, sourceType, mode);
      fallback.title = `${fallback.title} (Offline Backup)`;
      this.sessions.update(list => [fallback, ...list]);
      this.activeSessionId.set(fallback.id);
      return true;
    } finally {
      this.isGenerating.set(false);
    }
  }

  deleteSession(id: string): void {
    this.sessions.update(list => list.filter(s => s.id !== id));
    if (this.activeSessionId() === id) {
      const remaining = this.sessions();
      this.activeSessionId.set(remaining.length > 0 ? remaining[0].id : null);
      this.activeConceptId.set(null);
    }
    this.showToast('Session deleted', 'info');
  }

  rateFlashcard(cardId: string, rating: 'easy' | 'good' | 'hard'): void {
    const currentSession = this.activeSession();
    if (!currentSession) return;

    const updatedCards = currentSession.flashcards.map(card => {
      if (card.id === cardId) {
        return this.srs.processReview(card, rating);
      }
      return card;
    });

    this.updateActiveSession({ ...currentSession, flashcards: updatedCards });
  }

  resetFlashcards(sessionId: string): void {
    this.sessions.update(list => list.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          flashcards: s.flashcards.map(c => ({
            ...c,
            difficulty: undefined,
            nextReviewDate: undefined,
            repetitions: 0,
            interval: 1,
            easeFactor: 2.5
          }))
        };
      }
      return s;
    }));
    this.showToast('Flashcards reset to new state', 'info');
  }

  answerQuizQuestion(questionId: string, optionIndex: number): void {
    const currentSession = this.activeSession();
    if (!currentSession) return;

    const updatedQuestions = currentSession.quizQuestions.map(q => {
      if (q.id === questionId) {
        return { ...q, userSelectedIndex: optionIndex };
      }
      return q;
    });

    this.updateActiveSession({ ...currentSession, quizQuestions: updatedQuestions });
  }

  resetQuiz(sessionId: string, onlyMissed: boolean = false): void {
    this.sessions.update(list => list.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          quizQuestions: s.quizQuestions.map(q => {
            if (onlyMissed && q.userSelectedIndex === q.correctIndex) {
              return q;
            }
            return { ...q, userSelectedIndex: undefined };
          })
        };
      }
      return s;
    }));
    this.showToast(onlyMissed ? 'Retrying missed questions' : 'Quiz restarted', 'info');
  }

  async sendChatMessage(text: string, isShowAnswer: boolean = false): Promise<void> {
    const currentSession = this.activeSession();
    if (!currentSession) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      relatedConceptId: this.activeConceptId() || undefined
    };

    const updatedMessages = [...(currentSession.chatMessages || []), userMessage];
    this.updateActiveSession({ ...currentSession, chatMessages: updatedMessages });
    this.isChatLoading.set(true);

    try {
      const reply = await this.llmService.getSocraticReply(
        updatedMessages,
        currentSession,
        this.activeConcept(),
        this.settings(),
        isShowAnswer
      );

      const assistantMessage: ChatMessage = {
        id: `msg-rep-${Date.now()}`,
        role: 'assistant',
        content: reply.content,
        timestamp: Date.now(),
        isHint: reply.isHint,
        relatedConceptId: this.activeConceptId() || undefined
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      this.updateActiveSession({ ...currentSession, chatMessages: finalMessages });
    } catch (e: any) {
      console.error('Chat error', e);
      this.showToast(`AI Chat Error: ${e.message}`, 'error');
    } finally {
      this.isChatLoading.set(false);
    }
  }

  clearChat(sessionId: string): void {
    const currentSession = this.activeSession();
    if (!currentSession) return;

    const initialChatMessage: ChatMessage = {
      id: `msg-reset-${Date.now()}`,
      role: 'assistant',
      content: `Conversation restarted. What aspect of "${currentSession.title}" would you like to explore?`,
      timestamp: Date.now()
    };

    this.updateActiveSession({
      ...currentSession,
      chatMessages: [initialChatMessage]
    });
  }

  updateConceptStatus(nodeId: string, status: 'not_started' | 'exploring' | 'mastered'): void {
    const session = this.activeSession();
    if (!session) return;

    const updateRecursive = (nodes: ConceptNode[]): ConceptNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, status };
        }
        if (node.children) {
          return { ...node, children: updateRecursive(node.children) };
        }
        return node;
      });
    };

    this.updateActiveSession({
      ...session,
      conceptMap: updateRecursive(session.conceptMap)
    });
  }

  updateSettings(patch: Partial<AppSettings>): void {
    this.settings.update(curr => ({ ...curr, ...patch }));
    this.showToast('Settings saved to localStorage', 'success');
  }

  exportSessionJson(sessionId?: string): string {
    const targetId = sessionId || this.activeSessionId();
    const session = this.sessions().find(s => s.id === targetId);
    if (!session) return '{}';
    return JSON.stringify(session, null, 2);
  }

  exportAllSessionsJson(): string {
    return JSON.stringify({
      instatutorVersion: '1.0',
      exportedAt: Date.now(),
      sessions: this.sessions()
    }, null, 2);
  }

  importSessionJson(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);

      if (data.instatutorVersion && Array.isArray(data.sessions)) {
        const newSessions: StudySession[] = data.sessions;
        this.sessions.update(existing => {
          const ids = new Set(existing.map(s => s.id));
          const toAdd = newSessions.filter(s => !ids.has(s.id));
          return [...toAdd, ...existing];
        });
        if (newSessions.length > 0) {
          this.activeSessionId.set(newSessions[0].id);
        }
        this.showToast(`Imported ${newSessions.length} sessions!`, 'success');
        return true;
      } else if (data.id && data.title && Array.isArray(data.flashcards)) {
        const session: StudySession = data;
        this.sessions.update(list => {
          const filtered = list.filter(s => s.id !== session.id);
          return [session, ...filtered];
        });
        this.activeSessionId.set(session.id);
        this.showToast(`Imported "${session.title}"!`, 'success');
        return true;
      } else {
        throw new Error('Unrecognized JSON format. Must contain a valid StudySession object.');
      }
    } catch (e: any) {
      console.error('Import error', e);
      this.showToast(`Import failed: ${e.message}`, 'error');
      return false;
    }
  }

  private updateActiveSession(updated: StudySession): void {
    this.sessions.update(list => list.map(s => s.id === updated.id ? updated : s));
  }
}
