import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionStoreService, WorkspaceTab } from '../../services/session-store.service';
import { SocraticChatComponent } from './socratic-chat/socratic-chat.component';
import { FlashcardDeckComponent } from './flashcard-deck/flashcard-deck.component';
import { ConceptMapComponent } from './concept-map/concept-map.component';
import { QuizEngineComponent } from './quiz-engine/quiz-engine.component';
import { 
  LucideAngularModule, 
  MessageSquare, 
  Layers, 
  GitFork, 
  HelpCircle, 
  ChevronLeft, 
  Download, 
  Trash2,
  Sparkles, 
  Clock, 
  Award, 
  Brain,
  Info
} from 'lucide-angular';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule,
    SocraticChatComponent,
    FlashcardDeckComponent,
    ConceptMapComponent,
    QuizEngineComponent
  ],
  template: `
    @if (store.activeSession(); as session) {
      <div class="study-workspace max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 animate-fade-in">
        
        <!-- Header & Breadcrumb -->
        <div class="workspace-heading flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2">
              <button 
                type="button"
                (click)="store.createNewSessionView()"
                class="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors">
                <lucide-icon [img]="ChevronLeftIcon" class="w-3.5 h-3.5"></lucide-icon>
                <span>All Sessions</span>
              </button>
              <span class="text-slate-600 text-xs">/</span>
              <span class="text-xs text-slate-400 font-mono">
                {{ session.createdAt | date:'mediumDate' }}
              </span>
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                {{ session.mode || 'Standard' }} Mode
              </span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-extrabold text-white">
              {{ session.title }}
            </h1>

            <p class="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {{ session.summary }}
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center gap-2 shrink-0 self-start md:self-center">
            <button 
              type="button"
              (click)="openImportExport.emit()"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all">
              <lucide-icon [img]="DownloadIcon" class="w-4 h-4 text-teal-400"></lucide-icon>
              <span>Export Session</span>
            </button>
            <button
              type="button"
              (click)="deleteSession(session.id)"
              [attr.aria-label]="'Delete session: ' + session.title"
              title="Delete session"
              class="p-2 rounded-xl text-slate-400 hover:text-rose-300 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/60 transition-colors">
              <lucide-icon [img]="Trash2Icon" class="w-4 h-4"></lucide-icon>
            </button>
          </div>
        </div>

        <!-- 4 Core Modules Navigation Bar -->
        <div class="module-tabs flex items-center gap-2 border-b border-slate-800 overflow-x-auto no-scrollbar" role="tablist" aria-label="Study tools">
          
          <!-- Socratic Tutor Tab -->
          <button 
            type="button"
            (click)="store.setActiveTab('chat')"
              role="tab"
              [attr.aria-selected]="store.activeTab() === 'chat'"
              [class.active-tab]="store.activeTab() === 'chat'"
            [class]="store.activeTab() === 'chat'
              ? 'module-tab pb-3.5 px-4 text-sm font-bold text-teal-400 border-b-2 border-teal-400 flex items-center gap-2 transition-all'
              : 'module-tab pb-3.5 px-4 text-sm font-medium text-slate-400 hover:text-slate-200 flex items-center gap-2 transition-all'">
            <lucide-icon [img]="MessageSquareIcon" class="w-4 h-4"></lucide-icon>
            <span>Socratic Tutor</span>
            <span class="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
              {{ session.chatMessages?.length || 1 }}
            </span>
          </button>

          <!-- 3D Flashcards Tab -->
          <button 
            type="button"
            (click)="store.setActiveTab('flashcards')"
              role="tab"
              [attr.aria-selected]="store.activeTab() === 'flashcards'"
              [class.active-tab]="store.activeTab() === 'flashcards'"
            [class]="store.activeTab() === 'flashcards'
              ? 'module-tab pb-3.5 px-4 text-sm font-bold text-teal-400 border-b-2 border-teal-400 flex items-center gap-2 transition-all'
              : 'module-tab pb-3.5 px-4 text-sm font-medium text-slate-400 hover:text-slate-200 flex items-center gap-2 transition-all'">
            <lucide-icon [img]="LayersIcon" class="w-4 h-4"></lucide-icon>
            <span>Flashcards</span>
            @if (store.flashcardStats().due > 0) {
              <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {{ store.flashcardStats().due }} Due
              </span>
            } @else {
              <span class="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                {{ session.flashcards.length }}
              </span>
            }
          </button>

          <!-- Concept Map Tab -->
          <button 
            type="button"
            (click)="store.setActiveTab('conceptMap')"
              role="tab"
              [attr.aria-selected]="store.activeTab() === 'conceptMap'"
              [class.active-tab]="store.activeTab() === 'conceptMap'"
            [class]="store.activeTab() === 'conceptMap'
              ? 'module-tab pb-3.5 px-4 text-sm font-bold text-teal-400 border-b-2 border-teal-400 flex items-center gap-2 transition-all'
              : 'module-tab pb-3.5 px-4 text-sm font-medium text-slate-400 hover:text-slate-200 flex items-center gap-2 transition-all'">
            <lucide-icon [img]="GitForkIcon" class="w-4 h-4"></lucide-icon>
            <span>Concept Map</span>
            @if (store.activeConcept(); as active) {
              <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-teal-500 text-slate-950">
                Focused
              </span>
            }
          </button>

          <!-- Micro-Quiz Engine Tab -->
          <button 
            type="button"
            (click)="store.setActiveTab('quiz')"
              role="tab"
              [attr.aria-selected]="store.activeTab() === 'quiz'"
              [class.active-tab]="store.activeTab() === 'quiz'"
            [class]="store.activeTab() === 'quiz'
              ? 'module-tab pb-3.5 px-4 text-sm font-bold text-teal-400 border-b-2 border-teal-400 flex items-center gap-2 transition-all'
              : 'module-tab pb-3.5 px-4 text-sm font-medium text-slate-400 hover:text-slate-200 flex items-center gap-2 transition-all'">
            <lucide-icon [img]="HelpCircleIcon" class="w-4 h-4"></lucide-icon>
            <span>Quiz</span>
            <span class="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
              {{ store.quizStats().answered }}/{{ session.quizQuestions.length }}
            </span>
          </button>

        </div>

        <!-- Tab Content Routing -->
        <main class="workspace-content min-h-[500px]">
          @switch (store.activeTab()) {
            @case ('chat') {
              <app-socratic-chat></app-socratic-chat>
            }
            @case ('flashcards') {
              <app-flashcard-deck></app-flashcard-deck>
            }
            @case ('conceptMap') {
              <app-concept-map></app-concept-map>
            }
            @case ('quiz') {
              <app-quiz-engine></app-quiz-engine>
            }
          }
        </main>

      </div>
    }
  `
})
export class WorkspaceComponent {
  store = inject(SessionStoreService);
  openImportExport = output<void>();

  MessageSquareIcon = MessageSquare;
  LayersIcon = Layers;
  GitForkIcon = GitFork;
  HelpCircleIcon = HelpCircle;
  ChevronLeftIcon = ChevronLeft;
  DownloadIcon = Download;
  Trash2Icon = Trash2;
  SparklesIcon = Sparkles;
  ClockIcon = Clock;
  AwardIcon = Award;
  BrainIcon = Brain;
  InfoIcon = Info;

  deleteSession(id: string): void {
    if (confirm('Delete this study session? This cannot be undone.')) {
      this.store.deleteSession(id);
    }
  }
}
