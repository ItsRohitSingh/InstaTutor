import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionStoreService } from '../../services/session-store.service';
import { 
  LucideAngularModule, 
  Sparkles, 
  Plus, 
  Settings, 
  Download, 
  Key, 
  Check, 
  ChevronDown,
  Layers,
  Brain,
  ShieldCheck
} from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <header class="app-navbar sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        <!-- Left: Logo & Active Session -->
        <div class="flex items-center gap-6 min-w-0">
          <button 
            type="button"
            (click)="store.createNewSessionView()" 
            class="flex items-center gap-2.5 group text-left focus:outline-none">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <lucide-icon [img]="SparklesIcon" class="w-5 h-5 text-teal-400"></lucide-icon>
              </div>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-base font-bold tracking-tight bg-gradient-to-r from-teal-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                  InstaTutor
                </span>
                <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400">
                  AI
                </span>
              </div>
              <div class="text-[11px] text-slate-400 -mt-0.5 flex items-center gap-1">
                <span>Micro-Learning Engine</span>
              </div>
            </div>
          </button>

          <!-- Divider -->
          <div class="hidden md:block h-6 w-px bg-slate-800"></div>

          <!-- Sessions Quick Dropdown / Switcher -->
          @if (store.sessions().length > 0) {
            <div class="hidden sm:flex items-center gap-2 max-w-xs truncate">
              <span class="text-xs text-slate-400 shrink-0">Session:</span>
              <div class="relative inline-block text-left group">
                <select 
                  [value]="store.activeSessionId() || ''"
                  (change)="onSessionChange($event)"
                  class="bg-slate-900/80 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 border border-slate-700/80 hover:border-slate-600 focus:border-teal-500 outline-none max-w-[200px] truncate cursor-pointer">
                  <option value="" disabled [selected]="!store.activeSessionId()">Select a session...</option>
                  @for (s of store.sessions(); track s.id) {
                    <option [value]="s.id">{{ s.title }}</option>
                  }
                </select>
              </div>
            </div>
          }
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2.5">
          
          <!-- Zero-Backend Badge -->
          <div class="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Zero-Backend</span>
          </div>

          <!-- New Session Button -->
          <button 
            type="button"
            (click)="store.createNewSessionView()"
            aria-label="New session"
            title="New session"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-teal-500/15 transition-all">
            <lucide-icon [img]="PlusIcon" class="w-4 h-4"></lucide-icon>
            <span class="hidden sm:inline">New Session</span>
          </button>

          <!-- Portability / Import-Export Trigger -->
          <button 
            type="button"
            (click)="openImportExport.emit()"
            title="Import/Export JSON"
            class="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-medium">
            <lucide-icon [img]="DownloadIcon" class="w-4 h-4 text-teal-400"></lucide-icon>
            <span class="hidden md:inline">Transfer</span>
          </button>

          <!-- Settings Trigger -->
          <button 
            type="button"
            (click)="openSettings.emit()"
            aria-label="Settings"
            title="Settings"
            class="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-medium">
            <lucide-icon [img]="SettingsIcon" class="w-4 h-4"></lucide-icon>
            @if (store.settings().apiKey && !store.settings().offlineDemoMode) {
              <span class="w-2 h-2 rounded-full bg-teal-400"></span>
            } @else {
              <span class="w-2 h-2 rounded-full bg-amber-400" title="Offline Demo Mode"></span>
            }
          </button>

        </div>

      </div>
    </header>
  `
})
export class NavbarComponent {
  store = inject(SessionStoreService);
  openSettings = output<void>();
  openImportExport = output<void>();

  SparklesIcon = Sparkles;
  PlusIcon = Plus;
  SettingsIcon = Settings;
  DownloadIcon = Download;
  KeyIcon = Key;
  CheckIcon = Check;
  ChevronDownIcon = ChevronDown;
  LayersIcon = Layers;
  BrainIcon = Brain;
  ShieldCheckIcon = ShieldCheck;

  onSessionChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    if (select.value) {
      this.store.selectSession(select.value);
    }
  }
}
