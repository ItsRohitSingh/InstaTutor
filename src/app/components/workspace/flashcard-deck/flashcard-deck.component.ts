import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionStoreService } from '../../../services/session-store.service';
import { Flashcard } from '../../../models/study-session.model';
import { SpacedRepetitionService } from '../../../services/spaced-repetition.service';
import { 
  LucideAngularModule, 
  Layers, 
  RotateCcw, 
  Shuffle, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Filter,
  Flame,
  Award
} from 'lucide-angular';

@Component({
  selector: 'app-flashcard-deck',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      
      <!-- Deck Top Controls & Stats -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <!-- Stats Badges -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span class="text-slate-400">Total Cards:</span>
            <span class="font-bold text-white">{{ store.flashcardStats().total }}</span>
          </div>

          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300">
            <lucide-icon [img]="AwardIcon" class="w-3.5 h-3.5 text-emerald-400"></lucide-icon>
            <span>Mastered: <strong>{{ store.flashcardStats().mastered }}</strong></span>
          </div>

          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-300">
            <lucide-icon [img]="ClockIcon" class="w-3.5 h-3.5 text-amber-400"></lucide-icon>
            <span>Due for Review: <strong>{{ store.flashcardStats().due }}</strong></span>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button 
              type="button"
              (click)="filterDifficulty.set('all')"
              [class]="filterDifficulty() === 'all' ? 'px-2.5 py-1 rounded-lg bg-teal-500 text-slate-950 font-bold' : 'px-2.5 py-1 text-slate-400 hover:text-white'">
              All
            </button>
            <button 
              type="button"
              (click)="filterDifficulty.set('due')"
              [class]="filterDifficulty() === 'due' ? 'px-2.5 py-1 rounded-lg bg-teal-500 text-slate-950 font-bold' : 'px-2.5 py-1 text-slate-400 hover:text-white'">
              Due Today
            </button>
            <button 
              type="button"
              (click)="filterDifficulty.set('hard')"
              [class]="filterDifficulty() === 'hard' ? 'px-2.5 py-1 rounded-lg bg-rose-500 text-white font-bold' : 'px-2.5 py-1 text-slate-400 hover:text-white'">
              Hard
            </button>
            <button 
              type="button"
              (click)="filterDifficulty.set('good')"
              [class]="filterDifficulty() === 'good' ? 'px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold' : 'px-2.5 py-1 text-slate-400 hover:text-white'">
              Good
            </button>
            <button 
              type="button"
              (click)="filterDifficulty.set('easy')"
              [class]="filterDifficulty() === 'easy' ? 'px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold' : 'px-2.5 py-1 text-slate-400 hover:text-white'">
              Easy
            </button>
          </div>

          <button 
            type="button"
            (click)="shuffleDeck()"
            title="Shuffle Cards"
            class="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors">
            <lucide-icon [img]="ShuffleIcon" class="w-4 h-4"></lucide-icon>
          </button>

          <button 
            type="button"
            (click)="resetDeck()"
            title="Reset All Card Ratings"
            class="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors">
            <lucide-icon [img]="RotateCcwIcon" class="w-4 h-4"></lucide-icon>
          </button>
        </div>

      </div>

      <!-- Active Flashcard 3D Stage -->
      @if (currentCard(); as card) {
        <div class="max-w-2xl mx-auto space-y-6">
          
          <!-- Card Progress & Category -->
          <div class="flex items-center justify-between text-xs text-slate-400 px-2">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-teal-400">Card {{ currentIndex() + 1 }}</span>
              <span>of</span>
              <span class="font-semibold text-slate-200">{{ filteredCards().length }}</span>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                {{ card.category }}
              </span>
              @if (card.difficulty) {
                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  [ngClass]="{
                    'bg-rose-500/20 text-rose-300 border border-rose-500/40': card.difficulty === 'hard',
                    'bg-amber-500/20 text-amber-300 border border-amber-500/40': card.difficulty === 'good',
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40': card.difficulty === 'easy'
                  }">
                  {{ card.difficulty }}
                </span>
              }
            </div>
          </div>

          <!-- 3D Perspective Card Container -->
          <div 
            class="perspective-1000 w-full h-[320px] sm:h-[360px] cursor-pointer select-none"
            (click)="toggleFlip()">
            
            <div 
              class="relative w-full h-full transform-style-3d transition-transform duration-500 rounded-3xl"
              [class.rotate-y-180]="isFlipped()">
              
              <!-- FRONT FACE -->
              <div class="absolute inset-0 backface-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-8 flex flex-col justify-between shadow-2xl hover:border-teal-500/50 transition-colors">
                <div class="flex items-center justify-between">
                  <span class="text-xs uppercase tracking-wider font-bold text-teal-400/90 flex items-center gap-1.5">
                    <lucide-icon [img]="SparklesIcon" class="w-3.5 h-3.5"></lucide-icon>
                    Inquiry / Concept
                  </span>
                  <span class="text-xs text-slate-400">Click or press Space to flip</span>
                </div>

                <div class="my-auto text-center px-4">
                  <h3 class="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                    {{ card.front }}
                  </h3>
                </div>

                <div class="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                  <span>SM-2 Interval: {{ card.interval || 1 }}d</span>
                  <span class="text-teal-400 font-medium">Flip for Explanation &rarr;</span>
                </div>
              </div>

              <!-- BACK FACE -->
              <div class="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 border border-teal-500/40 rounded-3xl p-8 flex flex-col justify-between shadow-2xl">
                <div class="flex items-center justify-between">
                  <span class="text-xs uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
                    <lucide-icon [img]="CheckCircle2Icon" class="w-3.5 h-3.5"></lucide-icon>
                    Key Takeaway & Explanation
                  </span>
                  <span class="text-xs text-slate-400">Rate your recall below</span>
                </div>

                <div class="my-auto text-center px-4 overflow-y-auto max-h-[190px]">
                  <p class="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
                    {{ card.back }}
                  </p>
                </div>

                <div class="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                  <span>Repetitions: {{ card.repetitions || 0 }}</span>
                  <span>Ease Factor: {{ card.easeFactor || 2.5 }}</span>
                </div>
              </div>

            </div>
          </div>

          <!-- SM-2 Spaced Repetition Rating Buttons -->
          <div class="space-y-3">
            <div class="text-center text-xs text-slate-400 font-medium">
              Rate your recall quality (Shortcuts: 1, 2, 3):
            </div>

            <div class="grid grid-cols-3 gap-3">
              <!-- Hard -->
              <button 
                type="button"
                (click)="rateCard('hard', $event)"
                class="group p-3.5 rounded-2xl bg-slate-900/90 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 transition-all text-left">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-bold text-rose-400 group-hover:text-rose-300">Hard</span>
                  <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">1</kbd>
                </div>
                <div class="text-[11px] text-slate-400">Reset to 1 day interval</div>
              </button>

              <!-- Good -->
              <button 
                type="button"
                (click)="rateCard('good', $event)"
                class="group p-3.5 rounded-2xl bg-slate-900/90 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/50 transition-all text-left">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-bold text-amber-400 group-hover:text-amber-300">Good</span>
                  <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">2</kbd>
                </div>
                <div class="text-[11px] text-slate-400">Advance standard SM-2</div>
              </button>

              <!-- Easy -->
              <button 
                type="button"
                (click)="rateCard('easy', $event)"
                class="group p-3.5 rounded-2xl bg-slate-900/90 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 transition-all text-left">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">Easy</span>
                  <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">3</kbd>
                </div>
                <div class="text-[11px] text-slate-400">Bonus interval + ease</div>
              </button>
            </div>
          </div>

          <!-- Bottom Navigation Arrows -->
          <div class="flex items-center justify-between pt-2">
            <button 
              type="button"
              (click)="prevCard()"
              [disabled]="currentIndex() === 0"
              class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-300 hover:text-white border border-slate-800 flex items-center gap-2 text-xs font-semibold transition-all">
              <lucide-icon [img]="ChevronLeftIcon" class="w-4 h-4"></lucide-icon>
              <span>Previous</span>
            </button>

            <!-- Card Progress Dots -->
            <div class="hidden sm:flex items-center gap-1.5 max-w-xs overflow-x-auto py-1">
              @for (c of filteredCards(); track c.id; let i = $index) {
                <button 
                  (click)="jumpTo(i)"
                  [title]="'Jump to card ' + (i + 1)"
                  class="w-2.5 h-2.5 rounded-full transition-all"
                  [ngClass]="{
                    'w-6 bg-teal-400': i === currentIndex(),
                    'bg-emerald-500/60': i !== currentIndex() && c.difficulty === 'easy',
                    'bg-amber-500/60': i !== currentIndex() && c.difficulty === 'good',
                    'bg-rose-500/60': i !== currentIndex() && c.difficulty === 'hard',
                    'bg-slate-700': i !== currentIndex() && !c.difficulty
                  }">
                </button>
              }
            </div>

            <button 
              type="button"
              (click)="nextCard()"
              [disabled]="currentIndex() === filteredCards().length - 1"
              class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-300 hover:text-white border border-slate-800 flex items-center gap-2 text-xs font-semibold transition-all">
              <span>Next</span>
              <lucide-icon [img]="ChevronRightIcon" class="w-4 h-4"></lucide-icon>
            </button>
          </div>

        </div>
      } @else {
        <!-- Empty filter state -->
        <div class="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl max-w-xl mx-auto space-y-4">
          <div class="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
            <lucide-icon [img]="LayersIcon" class="w-6 h-6"></lucide-icon>
          </div>
          <h3 class="text-base font-bold text-white">No flashcards match this filter</h3>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">
            Try switching filter to "All Cards" or rating more cards to populate this view.
          </p>
          <button 
            (click)="filterDifficulty.set('all')"
            class="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold shadow-md">
            View All Cards
          </button>
        </div>
      }

    </div>
  `
})
export class FlashcardDeckComponent {
  store = inject(SessionStoreService);
  srs = inject(SpacedRepetitionService);

  LayersIcon = Layers;
  RotateCcwIcon = RotateCcw;
  ShuffleIcon = Shuffle;
  ChevronLeftIcon = ChevronLeft;
  ChevronRightIcon = ChevronRight;
  SparklesIcon = Sparkles;
  CheckCircle2Icon = CheckCircle2;
  ClockIcon = Clock;
  FilterIcon = Filter;
  FlameIcon = Flame;
  AwardIcon = Award;

  currentIndex = signal<number>(0);
  isFlipped = signal<boolean>(false);
  filterDifficulty = signal<'all' | 'due' | 'hard' | 'good' | 'easy'>('all');

  filteredCards = computed<Flashcard[]>(() => {
    const session = this.store.activeSession();
    if (!session) return [];

    const filter = this.filterDifficulty();
    let cards = session.flashcards;

    if (filter === 'due') {
      cards = cards.filter(c => this.srs.isCardDue(c));
    } else if (filter !== 'all') {
      cards = cards.filter(c => c.difficulty === filter);
    }

    return cards;
  });

  currentCard = computed<Flashcard | null>(() => {
    const list = this.filteredCards();
    const idx = this.currentIndex();
    if (idx >= 0 && idx < list.length) {
      return list[idx];
    }
    return list.length > 0 ? list[0] : null;
  });

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    // Avoid interfering when typing in an input or textarea
    if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) {
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault();
      this.toggleFlip();
    } else if (event.key === '1') {
      this.rateCard('hard');
    } else if (event.key === '2') {
      this.rateCard('good');
    } else if (event.key === '3') {
      this.rateCard('easy');
    } else if (event.key === 'ArrowLeft') {
      this.prevCard();
    } else if (event.key === 'ArrowRight') {
      this.nextCard();
    }
  }

  toggleFlip() {
    this.isFlipped.set(!this.isFlipped());
  }

  rateCard(rating: 'easy' | 'good' | 'hard', event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const card = this.currentCard();
    if (!card) return;

    this.store.rateFlashcard(card.id, rating);
    
    // Automatically transition to next card after a rating
    this.isFlipped.set(false);
    setTimeout(() => {
      this.nextCard();
    }, 150);
  }

  nextCard() {
    const total = this.filteredCards().length;
    if (this.currentIndex() < total - 1) {
      this.isFlipped.set(false);
      this.currentIndex.update(i => i + 1);
    }
  }

  prevCard() {
    if (this.currentIndex() > 0) {
      this.isFlipped.set(false);
      this.currentIndex.update(i => i - 1);
    }
  }

  jumpTo(index: number) {
    this.isFlipped.set(false);
    this.currentIndex.set(index);
  }

  shuffleDeck() {
    const session = this.store.activeSession();
    if (!session) return;

    const shuffled = [...session.flashcards].sort(() => Math.random() - 0.5);
    this.currentIndex.set(0);
    this.isFlipped.set(false);
    // Replace active session's cards
    (this.store as any).updateActiveSession?.({ ...session, flashcards: shuffled });
    this.store.showToast('Flashcards shuffled', 'info');
  }

  resetDeck() {
    const session = this.store.activeSession();
    if (!session) return;
    if (confirm('Reset spaced-repetition progress for all cards in this deck?')) {
      this.store.resetFlashcards(session.id);
      this.currentIndex.set(0);
      this.isFlipped.set(false);
    }
  }
}
