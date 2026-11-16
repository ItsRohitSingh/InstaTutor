import { Component, inject, signal, viewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionStoreService } from '../../../services/session-store.service';
import { 
  LucideAngularModule, 
  MessageSquare, 
  Send, 
  Lightbulb, 
  Eye, 
  Sparkles, 
  RotateCcw, 
  Target, 
  X,
  Compass,
  ArrowRight
} from 'lucide-angular';

@Component({
  selector: 'app-socratic-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="chat-panel flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      
      <!-- Chat Header -->
      <div class="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <lucide-icon [img]="MessageSquareIcon" class="w-5 h-5"></lucide-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold text-white">Socratic tutor</h2>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Direct Show Answer Override Button -->
          <button 
            type="button"
            (click)="requestDirectAnswer()"
            [disabled]="store.isChatLoading()"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 hover:border-indigo-500/60 flex items-center gap-1.5 transition-all">
            <lucide-icon [img]="EyeIcon" class="w-3.5 h-3.5"></lucide-icon>
            <span>Show Me Answer</span>
          </button>

          <!-- Clear Chat -->
          <button 
            type="button"
            (click)="clearChat()"
            title="Restart dialogue"
            class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors">
            <lucide-icon [img]="RotateCcwIcon" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Active Concept Banner (cross-module context) -->
      @if (store.activeConcept(); as concept) {
        <div class="px-6 py-2.5 bg-teal-950/40 border-b border-teal-800/40 flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2 text-teal-200">
            <lucide-icon [img]="TargetIcon" class="w-4 h-4 text-teal-400 shrink-0"></lucide-icon>
            <span>Focused on Concept: <strong class="text-teal-300 font-semibold">{{ concept.label }}</strong></span>
          </div>
          <button 
            (click)="store.setActiveConcept(null)"
            class="text-teal-400 hover:text-teal-200 text-xs flex items-center gap-1 px-2 py-0.5 rounded bg-teal-900/50 hover:bg-teal-900">
            <span>Clear Focus</span>
            <lucide-icon [img]="XIcon" class="w-3 h-3"></lucide-icon>
          </button>
        </div>
      }

      <!-- Messages Scroll Area -->
      <div #messagesContainer class="flex-1 p-6 space-y-4 overflow-y-auto">
        
        @for (msg of (store.activeSession()?.chatMessages || []); track msg.id) {
          <div class="flex flex-col gap-1.5" [ngClass]="msg.role === 'user' ? 'items-end' : 'items-start'">
            
            <!-- Role / Tag Indicator -->
            <div class="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
              @if (msg.role === 'user') {
                <span>You</span>
              } @else {
                <span class="font-semibold text-teal-300 flex items-center gap-1">
                  <lucide-icon [img]="SparklesIcon" class="w-3 h-3 text-teal-400"></lucide-icon>
                  Socratic Tutor
                </span>
                @if (msg.isHint) {
                  <span class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
                    <lucide-icon [img]="LightbulbIcon" class="w-3 h-3 text-amber-400"></lucide-icon>
                    Scaffolded Hint
                  </span>
                }
              }
            </div>

            <!-- Bubble -->
            <div 
              class="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              [ngClass]="msg.role === 'user' 
                ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-br-none shadow-md shadow-teal-500/10' 
                : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-bl-none shadow-md'">
              <div class="whitespace-pre-wrap">{{ msg.content }}</div>
            </div>

            <span class="text-[10px] text-slate-400 px-1">{{ msg.timestamp | date:'shortTime' }}</span>
          </div>
        }

        <!-- Loading Indicator -->
        @if (store.isChatLoading()) {
          <div class="flex flex-col items-start gap-1.5">
            <span class="text-[11px] text-teal-300 font-semibold px-1 flex items-center gap-1">
              <lucide-icon [img]="SparklesIcon" class="w-3 h-3 text-teal-400"></lucide-icon>
              Formulating Socratic response...
            </span>
            <div class="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full bg-teal-400 animate-bounce"></div>
              <div class="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]"></div>
              <div class="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        }

      </div>

      <!-- Quick Prompt Suggestion Chips -->
      <div class="chat-prompts px-4 sm:px-6 py-2.5 bg-slate-950/40 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
        @for (chip of starterPrompts; track chip) {
          <button 
            type="button"
            (click)="sendQuickPrompt(chip)"
            [disabled]="store.isChatLoading()"
            class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 hover:text-teal-300 text-slate-300 border border-slate-700/60 text-left transition-colors disabled:opacity-50">
            {{ chip }}
          </button>
        }
      </div>

      <!-- Input Footer -->
      <div class="p-4 bg-slate-950/90 border-t border-slate-800">
        <div class="flex items-center gap-2">
          <input 
            type="text"
            [(ngModel)]="userInput"
            (keydown.enter)="sendMessage()"
            [disabled]="store.isChatLoading()"
            placeholder="Answer the tutor's question, share your reasoning, or ask for guidance..."
            class="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm text-white placeholder-slate-500 outline-none transition-all disabled:opacity-50"
          />
          <button 
            type="button"
            (click)="sendMessage()"
            [disabled]="!userInput.trim() || store.isChatLoading()"
            class="p-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:pointer-events-none text-slate-950 transition-all font-semibold shadow-md shadow-teal-500/20">
            <lucide-icon [img]="SendIcon" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      </div>

    </div>
  `
})
export class SocraticChatComponent {
  store = inject(SessionStoreService);
  messagesContainer = viewChild<ElementRef>('messagesContainer');

  MessageSquareIcon = MessageSquare;
  SendIcon = Send;
  LightbulbIcon = Lightbulb;
  EyeIcon = Eye;
  SparklesIcon = Sparkles;
  RotateCcwIcon = RotateCcw;
  TargetIcon = Target;
  XIcon = X;
  CompassIcon = Compass;
  ArrowRightIcon = ArrowRight;

  userInput = '';

  starterPrompts = [
    'Quiz me',
    'Give me an analogy',
    'Why does this matter?',
    'Common misconception'
  ];

  constructor() {
    // Auto-scroll when messages update
    effect(() => {
      const msgs = this.store.activeSession()?.chatMessages;
      if (msgs) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  private scrollToBottom() {
    const el = this.messagesContainer()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  async sendMessage() {
    if (!this.userInput.trim() || this.store.isChatLoading()) return;
    const text = this.userInput.trim();
    this.userInput = '';
    await this.store.sendChatMessage(text, false);
  }

  async sendQuickPrompt(promptText: string) {
    if (this.store.isChatLoading()) return;
    await this.store.sendChatMessage(promptText, false);
  }

  async requestDirectAnswer() {
    if (this.store.isChatLoading()) return;
    await this.store.sendChatMessage('I am stuck and would like to see the direct answer explanation.', true);
  }

  clearChat() {
    const session = this.store.activeSession();
    if (session && confirm('Restart this Socratic tutor conversation?')) {
      this.store.clearChat(session.id);
    }
  }
}
