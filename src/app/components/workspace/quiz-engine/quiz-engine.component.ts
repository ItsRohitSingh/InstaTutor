import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionStoreService } from '../../../services/session-store.service';
import { QuizQuestion } from '../../../models/study-session.model';
import confetti from 'canvas-confetti';
import { 
  LucideAngularModule, 
  HelpCircle, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Sparkles, 
  ArrowRight,
  Check,
  X,
  MessageSquare,
  Flame
} from 'lucide-angular';

@Component({
  selector: 'app-quiz-engine',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-6 animate-fade-in max-w-3xl mx-auto">
      
      <!-- Quiz Top Bar -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base font-bold text-white">Micro-Quiz Engine</h2>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Immediate Diagnostic
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Test retention with instant response validation and deep explanations.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <div class="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span class="text-slate-400">Answered:</span>
            <span class="font-bold text-teal-400 ml-1">
              {{ store.quizStats().answered }}/{{ store.quizStats().total }}
            </span>
          </div>

          <button 
            type="button"
            (click)="retakeFullQuiz()"
            title="Reset Quiz"
            class="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors">
            <lucide-icon [img]="RotateCcwIcon" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Question Palette Nav -->
      <div class="flex items-center justify-between gap-2 overflow-x-auto py-1">
        <div class="flex items-center gap-2">
          @for (q of questions(); track q.id; let i = $index) {
            <button 
              type="button"
              (click)="currentIndex.set(i)"
              class="w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all"
              [ngClass]="{
                'ring-2 ring-teal-400 font-extrabold': i === currentIndex(),
                'bg-emerald-500 text-slate-950': q.userSelectedIndex !== undefined && q.userSelectedIndex === q.correctIndex,
                'bg-rose-500 text-white': q.userSelectedIndex !== undefined && q.userSelectedIndex !== q.correctIndex,
                'bg-slate-800 text-slate-300 hover:bg-slate-700': q.userSelectedIndex === undefined
              }">
              {{ i + 1 }}
            </button>
          }
        </div>

        @if (isAllAnswered()) {
          <button 
            type="button"
            (click)="showAnalytics.set(true)"
            class="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white flex items-center gap-1.5 transition-all shrink-0">
            <lucide-icon [img]="AwardIcon" class="w-3.5 h-3.5"></lucide-icon>
            <span>View Scorecard</span>
          </button>
        }
      </div>

      <!-- Main Question Stage (if not in full analytics mode) -->
      @if (!showAnalytics() && currentQuestion(); as q) {
        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <!-- Header -->
          <div class="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-4">
            <span class="font-bold text-teal-400">Question {{ currentIndex() + 1 }} of {{ questions().length }}</span>
            @if (q.userSelectedIndex !== undefined) {
              @if (q.userSelectedIndex === q.correctIndex) {
                <span class="text-emerald-400 font-bold flex items-center gap-1">
                  <lucide-icon [img]="CheckCircle2Icon" class="w-4 h-4"></lucide-icon>
                  Correct Answer
                </span>
              } @else {
                <span class="text-rose-400 font-bold flex items-center gap-1">
                  <lucide-icon [img]="XCircleIcon" class="w-4 h-4"></lucide-icon>
                  Incorrect Choice
                </span>
              }
            } @else {
              <span class="text-slate-400">Select the best answer</span>
            }
          </div>

          <!-- Question Prompt -->
          <h3 class="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {{ q.question }}
          </h3>

          <!-- Options List -->
          <div class="space-y-3">
            @for (option of q.options; track $index; let optIdx = $index) {
              <button 
                type="button"
                [disabled]="q.userSelectedIndex !== undefined"
                (click)="selectOption(q.id, optIdx)"
                class="w-full p-4 rounded-2xl text-left border text-sm font-medium transition-all flex items-start gap-3.5"
                [ngClass]="getOptionClasses(q, optIdx)">
                
                <div class="w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5"
                  [ngClass]="getOptionBadgeClasses(q, optIdx)">
                  {{ ['A', 'B', 'C', 'D'][optIdx] }}
                </div>

                <div class="flex-1 leading-snug">
                  {{ option }}
                </div>

                @if (q.userSelectedIndex !== undefined) {
                  @if (optIdx === q.correctIndex) {
                    <lucide-icon [img]="CheckIcon" class="w-5 h-5 text-emerald-400 shrink-0"></lucide-icon>
                  } @else if (optIdx === q.userSelectedIndex) {
                    <lucide-icon [img]="XIcon" class="w-5 h-5 text-rose-400 shrink-0"></lucide-icon>
                  }
                }
              </button>
            }
          </div>

          <!-- Explanation Reveal -->
          @if (q.userSelectedIndex !== undefined) {
            <div class="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 animate-fade-in">
              <div class="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <lucide-icon [img]="SparklesIcon" class="w-3.5 h-3.5"></lucide-icon>
                Explanation & Deep Dive
              </div>
              <p class="text-sm text-slate-200 leading-relaxed">
                {{ q.explanation }}
              </p>
            </div>
          }

          <!-- Prev / Next Navigation -->
          <div class="flex items-center justify-between pt-4 border-t border-slate-800">
            <button 
              type="button"
              (click)="prevQuestion()"
              [disabled]="currentIndex() === 0"
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all">
              <lucide-icon [img]="ChevronLeftIcon" class="w-4 h-4"></lucide-icon>
              <span>Previous</span>
            </button>

            @if (currentIndex() < questions().length - 1) {
              <button 
                type="button"
                (click)="nextQuestion()"
                class="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all">
                <span>Next Question</span>
                <lucide-icon [img]="ChevronRightIcon" class="w-4 h-4"></lucide-icon>
              </button>
            } @else {
              <button 
                type="button"
                (click)="showAnalytics.set(true)"
                class="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all">
                <lucide-icon [img]="AwardIcon" class="w-4 h-4"></lucide-icon>
                <span>Complete & View Analytics</span>
              </button>
            }
          </div>

        </div>
      }

      <!-- End of Session Score Analytics View -->
      @if (showAnalytics()) {
        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 animate-scale-in">
          
          <!-- Score Banner -->
          <div class="text-center space-y-3">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-500 to-indigo-500 p-0.5 shadow-xl shadow-teal-500/20 mx-auto">
              <div class="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center">
                <span class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-300">
                  {{ store.quizStats().percentage }}%
                </span>
              </div>
            </div>

            <h3 class="text-2xl font-black text-white">
              @if (store.quizStats().percentage >= 80) {
                Outstanding Mastery! 🎉
              } @else if (store.quizStats().percentage >= 60) {
                Solid Understanding! 👍
              } @else {
                Concept Review Recommended 💡
              }
            </h3>

            <p class="text-xs text-slate-400 max-w-md mx-auto">
              You scored {{ store.quizStats().correct }} correct out of {{ store.quizStats().total }} questions.
            </p>
          </div>

          <!-- Analytics Summary Cards -->
          <div class="grid grid-cols-3 gap-3">
            <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div class="text-xl font-bold text-white">{{ store.quizStats().total }}</div>
              <div class="text-[11px] text-slate-400 mt-1 uppercase font-semibold">Total</div>
            </div>
            <div class="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-center">
              <div class="text-xl font-bold text-emerald-400">{{ store.quizStats().correct }}</div>
              <div class="text-[11px] text-emerald-300 mt-1 uppercase font-semibold">Correct</div>
            </div>
            <div class="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-center">
              <div class="text-xl font-bold text-rose-400">{{ store.quizStats().total - store.quizStats().correct }}</div>
              <div class="text-[11px] text-rose-300 mt-1 uppercase font-semibold">Missed</div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
            @if (store.quizStats().total - store.quizStats().correct > 0) {
              <button 
                type="button"
                (click)="retryMissed()"
                class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/15 transition-all">
                <lucide-icon [img]="RotateCcwIcon" class="w-4 h-4"></lucide-icon>
                <span>Retry Missed Questions ({{ store.quizStats().total - store.quizStats().correct }})</span>
              </button>
            }

            <button 
              type="button"
              (click)="retakeFullQuiz()"
              class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-all">
              <lucide-icon [img]="RotateCcwIcon" class="w-4 h-4"></lucide-icon>
              <span>Retake Full Quiz</span>
            </button>

            <button 
              type="button"
              (click)="discussMissedInChat()"
              class="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all">
              <lucide-icon [img]="MessageSquareIcon" class="w-4 h-4"></lucide-icon>
              <span>Review Missed Concepts with Socratic Tutor</span>
            </button>

            <button 
              type="button"
              (click)="showAnalytics.set(false); currentIndex.set(0)"
              class="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors">
              Back to Questions
            </button>
          </div>

          <!-- Question Review Breakdown Table -->
          <div class="space-y-3 pt-4 border-t border-slate-800">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Answer Breakdown</h4>
            
            <div class="space-y-3">
              @for (q of questions(); track q.id; let i = $index) {
                <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                  <div class="w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5"
                    [ngClass]="q.userSelectedIndex === q.correctIndex ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'">
                    {{ i + 1 }}
                  </div>

                  <div class="flex-1 text-xs space-y-1">
                    <p class="font-bold text-white">{{ q.question }}</p>
                    <div class="text-slate-400">
                      Your answer: 
                      <span [ngClass]="q.userSelectedIndex === q.correctIndex ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'">
                        {{ q.userSelectedIndex !== undefined ? q.options[q.userSelectedIndex] : 'Unanswered' }}
                      </span>
                    </div>
                    @if (q.userSelectedIndex !== q.correctIndex) {
                      <div class="text-emerald-400 font-semibold">
                        Correct: {{ q.options[q.correctIndex] }}
                      </div>
                    }
                    <p class="text-slate-400 pt-1 leading-relaxed">{{ q.explanation }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>
      }

    </div>
  `
})
export class QuizEngineComponent {
  store = inject(SessionStoreService);

  HelpCircleIcon = HelpCircle;
  AwardIcon = Award;
  CheckCircle2Icon = CheckCircle2;
  XCircleIcon = XCircle;
  ChevronLeftIcon = ChevronLeft;
  ChevronRightIcon = ChevronRight;
  RotateCcwIcon = RotateCcw;
  SparklesIcon = Sparkles;
  ArrowRightIcon = ArrowRight;
  CheckIcon = Check;
  XIcon = X;
  MessageSquareIcon = MessageSquare;
  FlameIcon = Flame;

  currentIndex = signal<number>(0);
  showAnalytics = signal<boolean>(false);

  questions = computed<QuizQuestion[]>(() => {
    return this.store.activeSession()?.quizQuestions || [];
  });

  currentQuestion = computed<QuizQuestion | null>(() => {
    const list = this.questions();
    const idx = this.currentIndex();
    if (idx >= 0 && idx < list.length) {
      return list[idx];
    }
    return list.length > 0 ? list[0] : null;
  });

  isAllAnswered = computed<boolean>(() => {
    const list = this.questions();
    return list.length > 0 && list.every(q => q.userSelectedIndex !== undefined);
  });

  constructor() {
    // Blast celebratory confetti on high quiz score
    effect(() => {
      if (this.showAnalytics()) {
        const stats = this.store.quizStats();
        if (stats.percentage >= 80) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
      }
    });
  }

  getOptionClasses(q: QuizQuestion, optIdx: number): string {
    if (q.userSelectedIndex === undefined) {
      return 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-200 cursor-pointer';
    }

    if (optIdx === q.correctIndex) {
      return 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-md shadow-emerald-500/10';
    }

    if (optIdx === q.userSelectedIndex) {
      return 'bg-rose-950/40 border-rose-500/60 text-rose-200 shadow-md shadow-rose-500/10';
    }

    return 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
  }

  getOptionBadgeClasses(q: QuizQuestion, optIdx: number): string {
    if (q.userSelectedIndex === undefined) {
      return 'bg-slate-800 text-slate-300';
    }
    if (optIdx === q.correctIndex) {
      return 'bg-emerald-500 text-slate-950 font-bold';
    }
    if (optIdx === q.userSelectedIndex) {
      return 'bg-rose-500 text-white font-bold';
    }
    return 'bg-slate-900 text-slate-600';
  }

  selectOption(questionId: string, optionIndex: number) {
    this.store.answerQuizQuestion(questionId, optionIndex);
  }

  nextQuestion() {
    if (this.currentIndex() < this.questions().length - 1) {
      this.currentIndex.update(i => i + 1);
    }
  }

  prevQuestion() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    }
  }

  retakeFullQuiz() {
    const session = this.store.activeSession();
    if (!session) return;
    this.store.resetQuiz(session.id, false);
    this.currentIndex.set(0);
    this.showAnalytics.set(false);
  }

  retryMissed() {
    const session = this.store.activeSession();
    if (!session) return;
    this.store.resetQuiz(session.id, true);
    
    // Jump to first unanswered question
    const updated = this.questions();
    const firstUnanswered = updated.findIndex(q => q.userSelectedIndex === undefined);
    this.currentIndex.set(firstUnanswered >= 0 ? firstUnanswered : 0);
    this.showAnalytics.set(false);
  }

  discussMissedInChat() {
    const missed = this.questions().filter(q => q.userSelectedIndex !== q.correctIndex);
    const missedTopics = missed.map(m => `"${m.question}"`).slice(0, 3).join(', ');
    
    this.store.setActiveTab('chat');
    this.store.sendChatMessage(
      `I just finished the quiz and struggled with the following questions: ${missedTopics}. Can you guide me through the underlying principles using Socratic hints?`,
      false
    );
  }
}
