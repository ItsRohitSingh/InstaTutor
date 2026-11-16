import { Component, input, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConceptNode } from '../../../../models/study-session.model';
import { SessionStoreService } from '../../../../services/session-store.service';
import { 
  LucideAngularModule, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Circle, 
  MessageSquare, 
  Sparkles,
  Layers
} from 'lucide-angular';

@Component({
  selector: 'app-concept-node-item',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-1.5 select-none">
      
      <!-- Node Row -->
      <div 
        class="group flex items-start gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer"
        [ngClass]="{
          'bg-teal-500/15 border-teal-500 shadow-md shadow-teal-500/10': isActive(),
          'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900': !isActive()
        }"
        (click)="selectNode($event)">
        
        <!-- Expand/Collapse Chevron (if has children) -->
        @if (node().children && node().children!.length > 0) {
          <button 
            type="button"
            (click)="toggleExpand($event)"
            class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 mt-0.5">
            @if (isExpanded()) {
              <lucide-icon [img]="ChevronDownIcon" class="w-4 h-4 text-teal-400"></lucide-icon>
            } @else {
              <lucide-icon [img]="ChevronRightIcon" class="w-4 h-4"></lucide-icon>
            }
          </button>
        } @else {
          <div class="w-6 shrink-0 flex items-center justify-center mt-1">
            <span class="w-1.5 h-1.5 rounded-full" [ngClass]="isActive() ? 'bg-teal-400' : 'bg-slate-600'"></span>
          </div>
        }

        <!-- Node Content -->
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span 
              class="text-sm font-bold tracking-tight"
              [ngClass]="isActive() ? 'text-teal-300' : 'text-white group-hover:text-teal-200'">
              {{ node().label }}
            </span>

            <!-- Status Pill -->
            <button 
              type="button"
              (click)="cycleStatus($event)"
              title="Click to cycle status: Not Started -> Exploring -> Mastered"
              class="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 border transition-all"
              [ngClass]="{
                'bg-emerald-500/10 border-emerald-500/30 text-emerald-300': node().status === 'mastered',
                'bg-amber-500/10 border-amber-500/30 text-amber-300': node().status === 'exploring',
                'bg-slate-800 border-slate-700 text-slate-400': !node().status || node().status === 'not_started'
              }">
              @if (node().status === 'mastered') {
                <lucide-icon [img]="CheckCircle2Icon" class="w-3 h-3 text-emerald-400"></lucide-icon>
                <span>Mastered</span>
              } @else if (node().status === 'exploring') {
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Exploring</span>
              } @else {
                <span>New</span>
              }
            </button>

            @if (isActive()) {
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-500 text-slate-950">
                Active Context
              </span>
            }
          </div>

          @if (node().description) {
            <p class="text-xs text-slate-400 mt-1 leading-relaxed">
              {{ node().description }}
            </p>
          }
        </div>

        <!-- Node Quick Action Buttons -->
        <div class="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <button 
            type="button"
            (click)="discussInChat($event)"
            title="Discuss this concept with Socratic Tutor"
            class="p-1.5 rounded-xl text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition-colors">
            <lucide-icon [img]="MessageSquareIcon" class="w-4 h-4"></lucide-icon>
          </button>
        </div>

      </div>

      <!-- Recursive Children Nodes -->
      @if (node().children && node().children!.length > 0 && isExpanded()) {
        <div class="pl-6 border-l-2 border-slate-800/80 ml-4 space-y-2 mt-1 animate-fade-in">
          @for (child of node().children; track child.id) {
            <app-concept-node-item 
              [node]="child" 
              [searchQuery]="searchQuery()" 
              (discussConcept)="discussConcept.emit($event)">
            </app-concept-node-item>
          }
        </div>
      }

    </div>
  `
})
export class ConceptNodeItemComponent {
  store = inject(SessionStoreService);

  node = input.required<ConceptNode>();
  searchQuery = input<string>('');
  discussConcept = output<ConceptNode>();

  ChevronRightIcon = ChevronRight;
  ChevronDownIcon = ChevronDown;
  CheckCircle2Icon = CheckCircle2;
  CircleIcon = Circle;
  MessageSquareIcon = MessageSquare;
  SparklesIcon = Sparkles;
  LayersIcon = Layers;

  isExpanded = signal<boolean>(true);

  isActive(): boolean {
    return this.store.activeConceptId() === this.node().id;
  }

  toggleExpand(event: Event) {
    event.stopPropagation();
    this.isExpanded.set(!this.isExpanded());
  }

  selectNode(event: Event) {
    event.stopPropagation();
    if (this.isActive()) {
      this.store.setActiveConcept(null);
    } else {
      this.store.setActiveConcept(this.node().id);
    }
  }

  cycleStatus(event: Event) {
    event.stopPropagation();
    const current = this.node().status || 'not_started';
    let next: 'not_started' | 'exploring' | 'mastered';
    if (current === 'not_started') next = 'exploring';
    else if (current === 'exploring') next = 'mastered';
    else next = 'not_started';

    this.store.updateConceptStatus(this.node().id, next);
  }

  discussInChat(event: Event) {
    event.stopPropagation();
    this.store.setActiveConcept(this.node().id);
    this.discussConcept.emit(this.node());
  }
}
