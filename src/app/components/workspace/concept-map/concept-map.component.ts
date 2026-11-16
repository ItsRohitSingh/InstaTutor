import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionStoreService } from '../../../services/session-store.service';
import { ConceptNodeItemComponent } from './concept-node-item/concept-node-item.component';
import { ConceptNode } from '../../../models/study-session.model';
import { 
  LucideAngularModule, 
  Search, 
  Network, 
  GitFork, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Compass,
  ArrowRight
} from 'lucide-angular';

@Component({
  selector: 'app-concept-map',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ConceptNodeItemComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      
      <!-- Top Control Bar -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base font-bold text-white">Hierarchical Concept Mapper</h2>
            <span class="text-xs text-teal-400 font-semibold">({{ totalNodesCount() }} nodes)</span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Click any concept node to set active context across Socratic Chat and Flashcards.
          </p>
        </div>

        <!-- Search Bar -->
        <div class="flex items-center gap-3">
          <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <lucide-icon [img]="SearchIcon" class="w-4 h-4"></lucide-icon>
            </div>
            <input 
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search concepts..."
              class="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

      </div>

      <!-- Active Concept Context Card -->
      @if (store.activeConcept(); as active) {
        <div class="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500 text-slate-950">
                Active Learning Context
              </span>
              <h3 class="text-sm font-bold text-white">{{ active.label }}</h3>
            </div>
            @if (active.description) {
              <p class="text-xs text-teal-200/80 leading-relaxed">{{ active.description }}</p>
            }
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button 
              type="button"
              (click)="discussWithTutor(active)"
              class="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all">
              <lucide-icon [img]="SparklesIcon" class="w-3.5 h-3.5"></lucide-icon>
              <span>Explore in Socratic Chat</span>
              <lucide-icon [img]="ArrowRightIcon" class="w-3.5 h-3.5"></lucide-icon>
            </button>
            <button 
              type="button"
              (click)="store.setActiveConcept(null)"
              class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors">
              Clear Focus
            </button>
          </div>
        </div>
      }

      <!-- Concept Tree Visualizer -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        @if (filteredRoots().length > 0) {
          <div class="space-y-4">
            @for (root of filteredRoots(); track root.id) {
              <app-concept-node-item 
                [node]="root" 
                [searchQuery]="searchQuery"
                (discussConcept)="discussWithTutor($event)">
              </app-concept-node-item>
            }
          </div>
        } @else {
          <div class="text-center py-12 text-slate-400 text-xs">
            No concepts match "{{ searchQuery }}"
          </div>
        }
      </div>

    </div>
  `
})
export class ConceptMapComponent {
  store = inject(SessionStoreService);

  SearchIcon = Search;
  NetworkIcon = Network;
  GitForkIcon = GitFork;
  SparklesIcon = Sparkles;
  CheckCircle2Icon = CheckCircle2;
  LayersIcon = Layers;
  CompassIcon = Compass;
  ArrowRightIcon = ArrowRight;

  searchQuery = '';

  totalNodesCount = computed(() => {
    const session = this.store.activeSession();
    if (!session) return 0;

    let count = 0;
    const traverse = (nodes: ConceptNode[]) => {
      for (const n of nodes) {
        count++;
        if (n.children) traverse(n.children);
      }
    };
    traverse(session.conceptMap);
    return count;
  });

  filteredRoots = computed<ConceptNode[]>(() => {
    const session = this.store.activeSession();
    if (!session) return [];
    if (!this.searchQuery.trim()) return session.conceptMap;

    const query = this.searchQuery.toLowerCase();

    const matchesRecursive = (node: ConceptNode): boolean => {
      if (node.label.toLowerCase().includes(query) || node.description?.toLowerCase().includes(query)) {
        return true;
      }
      if (node.children) {
        return node.children.some(child => matchesRecursive(child));
      }
      return false;
    };

    return session.conceptMap.filter(root => matchesRecursive(root));
  });

  discussWithTutor(node: ConceptNode) {
    this.store.setActiveConcept(node.id);
    this.store.setActiveTab('chat');
    this.store.sendChatMessage(
      `Can you guide me through the concept of "${node.label}"? What should I focus on first?`,
      false
    );
  }
}
