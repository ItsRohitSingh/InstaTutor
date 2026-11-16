import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionStoreService } from '../../services/session-store.service';
import { AppSettings } from '../../models/study-session.model';
import { 
  LucideAngularModule, 
  Settings, 
  X, 
  Key, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  Trash2,
  ExternalLink,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-angular';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div class="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <lucide-icon [img]="SettingsIcon" class="w-5 h-5"></lucide-icon>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-white">AI Engine & API Setup</h2>
              <p class="text-xs text-slate-400">Client-Side Zero-Backend Configuration</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
            <lucide-icon [img]="XIcon" class="w-5 h-5"></lucide-icon>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          <!-- Mode Status Badge Banner -->
          @if (currentSettings.apiKey && !currentSettings.offlineDemoMode) {
            <div class="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3">
              <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
              <div>
                <strong class="font-bold text-emerald-300">Live AI Mode Active:</strong>
                Calling {{ currentSettings.provider === 'gemini' ? 'Google Gemini' : 'OpenAI' }} directly from your browser.
              </div>
            </div>
          } @else {
            <div class="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-3">
              <div class="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></div>
              <div>
                <strong class="font-bold text-amber-300">Offline Simulation Mode Active:</strong>
                Paste your API key below and test connection to call actual AI models!
              </div>
            </div>
          }

          <!-- Zero Backend Security Notice -->
          <div class="p-3.5 rounded-xl bg-teal-950/30 border border-teal-800/40 text-teal-200 text-xs flex items-start gap-3">
            <lucide-icon [img]="ShieldCheckIcon" class="w-5 h-5 text-teal-400 shrink-0 mt-0.5"></lucide-icon>
            <div class="space-y-0.5">
              <span class="font-semibold text-teal-300">100% Client-Side Privacy Guarantee</span>
              <p class="text-teal-200/80 leading-relaxed text-[11px]">
                Your API key is stored exclusively in your browser's <code class="bg-teal-900/60 px-1 py-0.5 rounded text-teal-300">localStorage</code>. 
                API requests travel directly to Google Gemini or OpenAI with zero proxy or intermediate servers.
              </p>
            </div>
          </div>

          <!-- Provider Selection -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              1. Choose LLM Provider
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                type="button"
                (click)="setProvider('gemini')"
                [class]="currentSettings.provider === 'gemini' 
                  ? 'p-3 rounded-xl border-2 border-teal-500 bg-teal-500/10 text-white font-medium flex items-center justify-between text-left' 
                  : 'p-3 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-200 flex items-center justify-between text-left'">
                <div>
                  <div class="text-sm font-semibold flex items-center gap-1.5 text-white">
                    <lucide-icon [img]="SparklesIcon" class="w-4 h-4 text-teal-400"></lucide-icon>
                    Google Gemini
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5">Free API key with high limits</div>
                </div>
                @if (currentSettings.provider === 'gemini') {
                  <lucide-icon [img]="CheckIcon" class="w-4 h-4 text-teal-400"></lucide-icon>
                }
              </button>

              <button 
                type="button"
                (click)="setProvider('openai')"
                [class]="currentSettings.provider === 'openai' 
                  ? 'p-3 rounded-xl border-2 border-teal-500 bg-teal-500/10 text-white font-medium flex items-center justify-between text-left' 
                  : 'p-3 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-200 flex items-center justify-between text-left'">
                <div>
                  <div class="text-sm font-semibold flex items-center gap-1.5 text-white">
                    OpenAI
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5">GPT-4o Mini & GPT-4o</div>
                </div>
                @if (currentSettings.provider === 'openai') {
                  <lucide-icon [img]="CheckIcon" class="w-4 h-4 text-teal-400"></lucide-icon>
                }
              </button>
            </div>
          </div>

          <!-- API Key Input & Test Connection -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                2. Enter {{ currentSettings.provider === 'gemini' ? 'Gemini' : 'OpenAI' }} API Key
              </label>
              <a 
                [href]="currentSettings.provider === 'gemini' ? 'https://aistudio.google.com/app/apikey' : 'https://platform.openai.com/api-keys'" 
                target="_blank" 
                rel="noreferrer"
                class="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 underline underline-offset-2">
                <span>{{ currentSettings.provider === 'gemini' ? 'Get free Gemini API Key ↗' : 'Get OpenAI Key ↗' }}</span>
                <lucide-icon [img]="ExternalLinkIcon" class="w-3 h-3"></lucide-icon>
              </a>
            </div>

            <div class="flex items-center gap-2">
              <div class="relative flex-1">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <lucide-icon [img]="KeyIcon" class="w-4 h-4"></lucide-icon>
                </div>
                <input 
                  [type]="showApiKey() ? 'text' : 'password'"
                  [(ngModel)]="currentSettings.apiKey"
                  (input)="testResult.set(null)"
                  [placeholder]="currentSettings.provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'"
                  class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                />
                <button 
                  type="button"
                  (click)="showApiKey.set(!showApiKey())" 
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200">
                  @if (showApiKey()) {
                    <lucide-icon [img]="EyeOffIcon" class="w-4 h-4"></lucide-icon>
                  } @else {
                    <lucide-icon [img]="EyeIcon" class="w-4 h-4"></lucide-icon>
                  }
                </button>
              </div>

              <!-- Test Button -->
              <button 
                type="button"
                [disabled]="!currentSettings.apiKey.trim() || isTesting()"
                (click)="runTestConnection()"
                class="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-teal-300 border border-slate-700 hover:border-teal-500/50 flex items-center gap-1.5 transition-all shrink-0">
                @if (isTesting()) {
                  <div class="w-3.5 h-3.5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Testing...</span>
                } @else {
                  <lucide-icon [img]="ZapIcon" class="w-3.5 h-3.5 text-teal-400"></lucide-icon>
                  <span>Test Key</span>
                }
              </button>
            </div>

            <!-- Test Connection Result Feedback -->
            @if (testResult(); as res) {
              <div class="p-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in"
                [ngClass]="res.success ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-200' : 'bg-rose-950/60 border border-rose-500/50 text-rose-200'">
                @if (res.success) {
                  <lucide-icon [img]="CheckCircle2Icon" class="w-4 h-4 text-emerald-400 shrink-0"></lucide-icon>
                } @else {
                  <lucide-icon [img]="AlertCircleIcon" class="w-4 h-4 text-rose-400 shrink-0"></lucide-icon>
                }
                <span class="font-medium">{{ res.message }}</span>
              </div>
            }
          </div>

          <!-- Model Selector -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              3. AI Model Selection
            </label>
            <select 
              [(ngModel)]="currentSettings.model"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm text-white outline-none cursor-pointer">
              @if (currentSettings.provider === 'gemini') {
                <option value="gemini-4-hydrogen">Gemini 4 Hydrogen (Latest - Recommended)</option>
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (Latest - Recommended)</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast Reasoning)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy fallback)</option>
              } @else {
                <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cost Effective)</option>
                <option value="gpt-4o">GPT-4o (High Intelligence Flagship)</option>
              }
            </select>
          </div>

          <!-- Offline / Demo Fallback Switch -->
          <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <div class="text-sm font-medium text-slate-200">Force Offline Simulation Mode</div>
              <div class="text-xs text-slate-400">Ignore API key and use local offline mock generation</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                [(ngModel)]="currentSettings.offlineDemoMode" 
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>

          <!-- Reset / Purge Storage -->
          <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-slate-500">Need to start completely fresh?</span>
            <button 
              type="button"
              (click)="resetAllData()" 
              class="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-900/60 hover:bg-rose-950/40 transition-colors">
              <lucide-icon [img]="Trash2Icon" class="w-3.5 h-3.5"></lucide-icon>
              <span>Reset All Saved Data</span>
            </button>
          </div>

        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <button 
            type="button"
            (click)="close.emit()" 
            class="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button 
            type="button"
            (click)="saveAndClose()" 
            class="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-teal-500/20 transition-all">
            Save & Activate
          </button>
        </div>

      </div>
    </div>
  `
})
export class SettingsModalComponent {
  store = inject(SessionStoreService);
  close = output<void>();

  SettingsIcon = Settings;
  XIcon = X;
  KeyIcon = Key;
  ShieldCheckIcon = ShieldCheck;
  EyeIcon = Eye;
  EyeOffIcon = EyeOff;
  CheckIcon = Check;
  AlertCircleIcon = AlertCircle;
  Trash2Icon = Trash2;
  ExternalLinkIcon = ExternalLink;
  SparklesIcon = Sparkles;
  ZapIcon = Zap;
  CheckCircle2Icon = CheckCircle2;

  showApiKey = signal(false);
  isTesting = signal(false);
  testResult = signal<{ success: boolean; message: string } | null>(null);

  currentSettings: AppSettings = { ...this.store.settings() };

  setProvider(provider: 'gemini' | 'openai') {
    this.currentSettings.provider = provider;
    if (provider === 'gemini') {
      this.currentSettings.model = 'gemini-3.8-flash';
    } else {
      this.currentSettings.model = 'gpt-4o-mini';
    }
    this.testResult.set(null);
  }

  async runTestConnection() {
    this.isTesting.set(true);
    this.testResult.set(null);
    try {
      const res = await this.store.testConnection(this.currentSettings);
      this.testResult.set(res);
    } catch (err: any) {
      this.testResult.set({ success: false, message: err.message || 'Connection test failed' });
    } finally {
      this.isTesting.set(false);
    }
  }

  saveAndClose() {
    this.store.updateSettings(this.currentSettings);
    this.close.emit();
  }

  resetAllData() {
    if (confirm('Are you sure you want to clear all sessions and reset to default demo data?')) {
      localStorage.clear();
      window.location.reload();
    }
  }
}
