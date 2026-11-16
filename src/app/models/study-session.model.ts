export type SessionMode = 'standard' | 'quiz' | 'socratic';
export type SourceType = 'text' | 'topic';

export interface ConceptNode {
  id: string;
  label: string;
  description?: string;
  children?: ConceptNode[];
  status?: 'not_started' | 'exploring' | 'mastered';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty?: 'easy' | 'good' | 'hard';
  nextReviewDate?: number;
  repetitions?: number;
  interval?: number; // interval in days
  easeFactor?: number; // SM-2 ease factor, defaults to 2.5
  lastReviewedDate?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  userSelectedIndex?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isHint?: boolean;
  relatedConceptId?: string;
}

export interface StudySession {
  id: string;
  createdAt: number;
  title: string;
  summary: string;
  conceptMap: ConceptNode[];
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  chatMessages?: ChatMessage[];
  mode?: SessionMode;
  sourceType?: SourceType;
  sourceContent?: string;
  activeConceptId?: string;
}

export interface AppSettings {
  apiKey: string;
  provider: 'gemini' | 'openai';
  model: string;
  temperature: number;
  offlineDemoMode: boolean;
}
