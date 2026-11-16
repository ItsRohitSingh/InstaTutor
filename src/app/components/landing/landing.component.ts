import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionStoreService } from '../../services/session-store.service';
import { SessionMode, SourceType } from '../../models/study-session.model';
import { 
  LucideAngularModule, 
  Sparkles, 
  Brain, 
  Layers, 
  HelpCircle, 
  FileText, 
  Search, 
  ArrowRight, 
  Trash2, 
  CheckCircle2, 
  Key, 
  ShieldCheck,
  Flame,
  Clock,
  BookOpen,
  Settings,
  Zap
} from 'lucide-angular';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="landing-layout max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      
      <!-- Hero Section -->
      <div class="landing-intro space-y-3 max-w-4xl">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-medium text-teal-300">
          <lucide-icon [img]="SparklesIcon" class="w-3.5 h-3.5 text-teal-400"></lucide-icon>
          <span>Your study desk</span>
        </div>

        <h1 class="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
          Make a difficult subject <span class="headline-accent">click.</span>
        </h1>

        <p class="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
          Start with a topic or your own notes. Get a focused study space with a tutor, flashcards, a concept map, and a quiz.
        </p>

        <!-- AI Connection Status Pill -->
        <div class="pt-2">
          @if (isLiveAiConfigured()) {
            <div class="connection-status inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                <strong>{{ store.settings().provider === 'gemini' ? 'Gemini' : 'OpenAI' }} connected</strong>
              </span>
              <button 
                (click)="openSettings.emit()" 
                class="ml-2 px-2.5 py-0.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 font-semibold border border-emerald-700/50 transition-colors">
                Configure
              </button>
            </div>
          } @else {
            <div class="connection-status inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-500/40 text-amber-200 text-xs">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>
                <strong>Offline mode</strong>
              </span>
              <button 
                (click)="openSettings.emit()" 
                class="ml-2 px-3 py-1 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold shadow-md transition-all flex items-center gap-1.5">
                <lucide-icon [img]="KeyIcon" class="w-3.5 h-3.5"></lucide-icon>
                <span>Connect AI</span>
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Main Input & Setup Card -->
      <div class="study-builder bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6">
        
        <!-- Dual Mode Toggle -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div class="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button 
              type="button"
              (click)="sourceType.set('topic')"
              [class]="sourceType() === 'topic'
                ? 'px-4 py-2 rounded-lg text-xs font-semibold bg-teal-500 text-slate-950 shadow-md transition-all'
                : 'px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-all'">
              Topic Mode
            </button>
            <button 
              type="button"
              (click)="sourceType.set('text')"
              [class]="sourceType() === 'text'
                ? 'px-4 py-2 rounded-lg text-xs font-semibold bg-teal-500 text-slate-950 shadow-md transition-all'
                : 'px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-all'">
              Raw Text / Paper Mode
            </button>
          </div>

          <div class="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <lucide-icon [img]="ShieldCheckIcon" class="w-4 h-4 text-emerald-400"></lucide-icon>
            <span>Runs locally in your browser</span>
          </div>
        </div>

        <!-- Inputs -->
        @if (sourceType() === 'topic') {
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-200">
              Start with a topic
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <lucide-icon [img]="SearchIcon" class="w-5 h-5 text-teal-400"></lucide-icon>
              </div>
              <input 
                type="text"
                [(ngModel)]="topicInput"
                (keydown.enter)="generateSession()"
                placeholder="e.g. Quantum Computing, Transformer Attention, CRISPR, Macroeconomic Policy..."
                class="study-input w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-base text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <!-- Quick Topic Pills -->
            <div class="flex flex-wrap items-center gap-2 pt-1">
              <span class="text-xs text-slate-500">Examples</span>
              @for (preset of (showMoreTopics() ? sampleTopics : sampleTopics.slice(0, 3)); track preset) {
                <button 
                  type="button"
                  (click)="setTopic(preset)"
                  [attr.aria-pressed]="topicInput === preset"
                  [class.selected-topic]="topicInput === preset"
                  class="topic-suggestion px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-teal-300 border border-slate-700/60 transition-colors">
                  {{ preset }}
                </button>
              }
              <button
                type="button"
                (click)="showMoreTopics.set(!showMoreTopics())"
                [attr.aria-expanded]="showMoreTopics()"
                class="topic-more px-2 py-1 text-xs text-teal-300 hover:text-teal-200 transition-colors">
                {{ showMoreTopics() ? 'Less' : 'More' }}
              </button>
            </div>
          </div>
        } @else {
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Paste Source Text, Notes, or Research Paper
              </label>
              <div class="flex items-center gap-2">
                <button 
                  type="button"
                  (click)="loadSamplePaper()" 
                  class="text-xs text-teal-400 hover:text-teal-300 underline underline-offset-2">
                  Load sample paper
                </button>
                <span class="text-xs text-slate-500">|</span>
                <span class="text-xs text-slate-400">{{ textInput.length }} chars</span>
              </div>
            </div>

            <textarea 
              [(ngModel)]="textInput"
              rows="6"
              placeholder="Paste raw article, research paper excerpt, markdown notes, documentation, or study guide..."
              class="study-input w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm text-slate-200 placeholder-slate-500 outline-none resize-y transition-all font-mono">
            </textarea>
          </div>
        }

        <!-- Learning Mode Selection -->
        <div class="space-y-3 pt-2">
          <label class="block text-sm font-medium text-slate-200">
            Learning style
          </label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            <button 
              type="button"
              (click)="selectedMode.set('standard')"
              [attr.aria-pressed]="selectedMode() === 'standard'"
              [class.selected-mode]="selectedMode() === 'standard'"
              [class]="selectedMode() === 'standard' 
                ? 'study-mode p-4 rounded-2xl border-2 border-teal-500 bg-teal-500/10 text-left transition-all' 
                : 'study-mode p-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:border-slate-700 text-left transition-all'">
              <div class="flex items-center justify-between mb-2">
                <div class="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <lucide-icon [img]="BrainIcon" class="w-4 h-4"></lucide-icon>
                </div>
                @if (selectedMode() === 'standard') {
                  <span class="w-2 h-2 rounded-full bg-teal-400"></span>
                }
              </div>
              <div class="text-sm font-semibold text-white">Standard Tutor</div>
              <div class="text-xs text-slate-400 mt-1 leading-snug">
                Tutor, cards, map and quiz.
              </div>
            </button>

            <button 
              type="button"
              (click)="selectedMode.set('quiz')"
              [attr.aria-pressed]="selectedMode() === 'quiz'"
              [class.selected-mode]="selectedMode() === 'quiz'"
              [class]="selectedMode() === 'quiz' 
                ? 'study-mode p-4 rounded-2xl border-2 border-indigo-500 bg-indigo-500/10 text-left transition-all' 
                : 'study-mode p-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:border-slate-700 text-left transition-all'">
              <div class="flex items-center justify-between mb-2">
                <div class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <lucide-icon [img]="HelpCircleIcon" class="w-4 h-4"></lucide-icon>
                </div>
                @if (selectedMode() === 'quiz') {
                  <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
                }
              </div>
              <div class="text-sm font-semibold text-white">Fast Quiz Mode</div>
              <div class="text-xs text-slate-400 mt-1 leading-snug">
                Focused questions for quick recall.
              </div>
            </button>

            <button 
              type="button"
              (click)="selectedMode.set('socratic')"
              [attr.aria-pressed]="selectedMode() === 'socratic'"
              [class.selected-mode]="selectedMode() === 'socratic'"
              [class]="selectedMode() === 'socratic' 
                ? 'study-mode p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-500/10 text-left transition-all' 
                : 'study-mode p-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:border-slate-700 text-left transition-all'">
              <div class="flex items-center justify-between mb-2">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <lucide-icon [img]="SparklesIcon" class="w-4 h-4"></lucide-icon>
                </div>
                @if (selectedMode() === 'socratic') {
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                }
              </div>
              <div class="text-sm font-semibold text-white">Deep Socratic Mode</div>
              <div class="text-xs text-slate-400 mt-1 leading-snug">
                Explore ideas through guided questions.
              </div>
            </button>

          </div>
        </div>

        <!-- Action Button -->
        <div class="builder-actions pt-4 border-t border-slate-800 flex items-center justify-end">

          <button 
            type="button"
            [disabled]="isGenerateDisabled() || store.isGenerating()"
            (click)="generateSession()"
            class="px-6 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 disabled:opacity-50 disabled:pointer-events-none text-slate-950 flex items-center gap-2.5 shadow-xl shadow-teal-500/20 transition-all">
            @if (store.isGenerating()) {
              <div class="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>
                {{ isLiveAiConfigured() ? 'Synthesizing with Live AI...' : 'Generating Micro-Modules...' }}
              </span>
            } @else {
              <lucide-icon [img]="SparklesIcon" class="w-4 h-4"></lucide-icon>
              <span>Create study session</span>
              <lucide-icon [img]="ArrowRightIcon" class="w-4 h-4"></lucide-icon>
            }
          </button>
        </div>

      </div>

      <!-- Past Sessions Library / History -->
      @if (store.sessions().length > 0) {
        <div class="session-library space-y-4 pt-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <lucide-icon [img]="BookOpenIcon" class="w-5 h-5 text-teal-400"></lucide-icon>
              <h2 class="text-lg font-bold text-white">Your Study Sessions</h2>
              <span class="text-xs text-slate-500">{{ store.sessions().length }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (session of store.sessions(); track session.id) {
              <div class="session-card group relative bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all flex flex-col justify-between">
                <div>
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <span class="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20">
                      {{ session.mode || 'Standard' }}
                    </span>
                    <button 
                      (click)="deleteSession(session.id, $event)"
                      title="Delete Session"
                      class="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors">
                      <lucide-icon [img]="Trash2Icon" class="w-3.5 h-3.5"></lucide-icon>
                    </button>
                  </div>

                  <h3 class="text-base font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-2">
                    {{ session.title }}
                  </h3>
                  
                  <p class="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {{ session.summary }}
                  </p>
                </div>

                <div class="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div class="flex items-center gap-3 text-xs text-slate-400">
                    <span class="flex items-center gap-1">
                      <lucide-icon [img]="LayersIcon" class="w-3.5 h-3.5 text-slate-400"></lucide-icon>
                      {{ session.flashcards.length }} cards
                    </span>
                    <span class="flex items-center gap-1">
                      <lucide-icon [img]="HelpCircleIcon" class="w-3.5 h-3.5 text-slate-400"></lucide-icon>
                      {{ session.quizQuestions.length }} quiz
                    </span>
                  </div>

                  <button 
                    (click)="store.selectSession(session.id)"
                    class="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Study</span>
                    <lucide-icon [img]="ArrowRightIcon" class="w-3 h-3"></lucide-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

    </div>
  `
})
export class LandingComponent {
  store = inject(SessionStoreService);
  openSettings = output<void>();

  SparklesIcon = Sparkles;
  BrainIcon = Brain;
  LayersIcon = Layers;
  HelpCircleIcon = HelpCircle;
  FileTextIcon = FileText;
  SearchIcon = Search;
  ArrowRightIcon = ArrowRight;
  Trash2Icon = Trash2;
  CheckCircle2Icon = CheckCircle2;
  KeyIcon = Key;
  ShieldCheckIcon = ShieldCheck;
  FlameIcon = Flame;
  ClockIcon = Clock;
  BookOpenIcon = BookOpen;
  SettingsIcon = Settings;
  ZapIcon = Zap;

  sourceType = signal<SourceType>('topic');
  selectedMode = signal<SessionMode>('standard');
  showMoreTopics = signal(false);
  topicInput = '';
  textInput = '';

  sampleTopics = [
    'Quantum Computing & Superposition',
    'Transformer Attention Mechanisms',
    'CRISPR Gene Editing',
    'Macroeconomics & Monetary Policy',
    'Distributed Systems & Consensus',
    'Neuroscience of Working Memory'
  ];

  isLiveAiConfigured(): boolean {
    const s = this.store.settings();
    return !!(s.apiKey?.trim() && !s.offlineDemoMode);
  }

  setTopic(topic: string) {
    this.topicInput = topic;
  }

  isGenerateDisabled(): boolean {
    if (this.sourceType() === 'topic') {
      return !this.topicInput.trim();
    }
    return !this.textInput.trim() || this.textInput.trim().length < 20;
  }

  loadSamplePaper() {
    this.textInput = `Neural Machine Translation by Jointly Learning to Align and Translate (Bahdanau et al.)
Abstract: Neural machine translation is a recently proposed approach to machine translation. Unlike traditional statistical machine translation, neural machine translation aims at building a single neural network that can be jointly tuned to maximize the translation performance. The models proposed recently for neural machine translation often belong to a family of encoder-decoders and encode a source sentence into a fixed-length vector from which a decoder generates a translation. In this paper, we conjecture that the use of a fixed-length vector is a bottleneck in improving the performance of this basic encoder-decoder architecture, and propose an extension to this which allows a model to automatically (soft-)search for parts of a source sentence that are relevant to predicting a target word, without having to form these parts as a hard segment explicitly. The new architecture achieves translation performance comparable to the existing state-of-the-art phrase-based system on the task of English-to-French translation.`;
  }

  async generateSession() {
    if (this.isGenerateDisabled() || this.store.isGenerating()) return;

    const content = this.sourceType() === 'topic' ? this.topicInput.trim() : this.textInput.trim();
    const success = await this.store.createSession(content, this.sourceType(), this.selectedMode());
    if (success) {
      this.topicInput = '';
      this.textInput = '';
    }
  }

  deleteSession(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Delete this study session from your local storage?')) {
      this.store.deleteSession(id);
    }
  }
}
