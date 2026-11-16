import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionStoreService } from '../../../services/session-store.service';
import { 
  LucideAngularModule, 
  Download, 
  Upload, 
  X, 
  Copy, 
  Check, 
  FileJson, 
  FileText,
  AlertCircle
} from 'lucide-angular';

@Component({
  selector: 'app-import-export-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div class="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <lucide-icon [img]="FileJsonIcon" class="w-5 h-5"></lucide-icon>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-white">Session Portability</h2>
              <p class="text-xs text-slate-400">Transfer study sessions between devices with zero backend</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
            <lucide-icon [img]="XIcon" class="w-5 h-5"></lucide-icon>
          </button>
        </div>

        <!-- Mode Tabs -->
        <div class="flex border-b border-slate-800 px-6 pt-3 bg-slate-950/40">
          <button 
            type="button"
            (click)="activeTab.set('export')"
            [class]="activeTab() === 'export'
              ? 'pb-3 px-4 text-sm font-semibold text-teal-400 border-b-2 border-teal-400 flex items-center gap-2'
              : 'pb-3 px-4 text-sm font-medium text-slate-400 hover:text-slate-200 flex items-center gap-2'">
            <lucide-icon [img]="DownloadIcon" class="w-4 h-4"></lucide-icon>
            Export JSON
          </button>
          <button 
            type="button"
            (click)="activeTab.set('import')"
            [class]="activeTab() === 'import'
              ? 'pb-3 px-4 text-sm font-semibold text-teal-400 border-b-2 border-teal-400 flex items-center gap-2'
              : 'pb-3 px-4 text-sm font-medium text-slate-400 hover:text-slate-200 flex items-center gap-2'">
            <lucide-icon [img]="UploadIcon" class="w-4 h-4"></lucide-icon>
            Import JSON
          </button>
        </div>

        <!-- Content Area -->
        <div class="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          @if (activeTab() === 'export') {
            <!-- Export Sub-options -->
            <div class="flex items-center gap-3">
              <label class="text-xs font-semibold uppercase tracking-wider text-slate-400">Export Scope:</label>
              <div class="flex gap-2">
                <button 
                  type="button"
                  (click)="exportScope.set('active')"
                  [class]="exportScope() === 'active'
                    ? 'px-3 py-1 rounded-lg text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'px-3 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 border border-slate-700'">
                  Active Session
                </button>
                <button 
                  type="button"
                  (click)="exportScope.set('all')"
                  [class]="exportScope() === 'all'
                    ? 'px-3 py-1 rounded-lg text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'px-3 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 border border-slate-700'">
                  All Sessions Backup ({{ store.sessions().length }})
                </button>
              </div>
            </div>

            <!-- JSON Preview Box -->
            <div class="relative">
              <div class="flex items-center justify-between px-3 py-2 bg-slate-950 border border-b-0 border-slate-700 rounded-t-xl text-xs text-slate-400">
                <span class="font-mono">
                  {{ exportScope() === 'active' ? (store.activeSession()?.title || 'session') + '.json' : 'instatutor-backup.json' }}
                </span>
                <button 
                  (click)="copyToClipboard()" 
                  class="flex items-center gap-1.5 text-teal-400 hover:text-teal-300 transition-colors">
                  @if (copied()) {
                    <lucide-icon [img]="CheckIcon" class="w-3.5 h-3.5"></lucide-icon>
                    <span>Copied!</span>
                  } @else {
                    <lucide-icon [img]="CopyIcon" class="w-3.5 h-3.5"></lucide-icon>
                    <span>Copy JSON</span>
                  }
                </button>
              </div>
              <textarea 
                readonly
                [value]="getExportJson()"
                rows="10"
                class="w-full p-3 font-mono text-xs bg-slate-950/80 border border-slate-700 rounded-b-xl text-slate-300 resize-none outline-none selection:bg-teal-500 selection:text-white">
              </textarea>
            </div>

            <!-- Export Buttons -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <button 
                type="button"
                (click)="downloadJsonFile()"
                class="px-5 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all">
                <lucide-icon [img]="DownloadIcon" class="w-4 h-4"></lucide-icon>
                Download JSON File
              </button>
            </div>
          }

          @if (activeTab() === 'import') {
            <!-- Import Drag & Drop Zone -->
            <div 
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onFileDrop($event)"
              class="border-2 border-dashed border-slate-700 hover:border-teal-500/60 rounded-2xl p-6 text-center bg-slate-950/30 transition-all cursor-pointer"
              (click)="fileInput.click()">
              <input 
                #fileInput 
                type="file" 
                accept=".json,application/json" 
                class="hidden" 
                (change)="onFileSelected($event)"
              />
              <div class="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-teal-400 mb-3">
                <lucide-icon [img]="UploadIcon" class="w-6 h-6"></lucide-icon>
              </div>
              <div class="text-sm font-semibold text-slate-200">
                Click to browse or drop an InstaTutor JSON file
              </div>
              <p class="text-xs text-slate-400 mt-1">Supports both single-session export and all-sessions backups</p>
            </div>

            <!-- Or Paste JSON Directly -->
            <div class="space-y-2">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Or Paste JSON Content Directly
              </label>
              <textarea 
                [(ngModel)]="importText"
                rows="6"
                placeholder='Paste raw JSON here: { "title": "Quantum Computing", ... }'
                class="w-full p-3 font-mono text-xs bg-slate-950/80 border border-slate-700 focus:border-teal-500 rounded-xl text-slate-200 placeholder-slate-500 resize-none outline-none">
              </textarea>
            </div>

            @if (importError()) {
              <div class="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <lucide-icon [img]="AlertCircleIcon" class="w-4 h-4 text-rose-400 shrink-0"></lucide-icon>
                <span>{{ importError() }}</span>
              </div>
            }

            <div class="flex items-center justify-end gap-3 pt-2">
              <button 
                type="button"
                [disabled]="!importText.trim()"
                (click)="performImport()"
                class="px-5 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:pointer-events-none text-slate-950 flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all">
                <lucide-icon [img]="UploadIcon" class="w-4 h-4"></lucide-icon>
                Validate & Import Session
              </button>
            </div>
          }

        </div>

      </div>
    </div>
  `
})
export class ImportExportModalComponent {
  store = inject(SessionStoreService);
  close = output<void>();

  DownloadIcon = Download;
  UploadIcon = Upload;
  XIcon = X;
  CopyIcon = Copy;
  CheckIcon = Check;
  FileJsonIcon = FileJson;
  FileTextIcon = FileText;
  AlertCircleIcon = AlertCircle;

  activeTab = signal<'export' | 'import'>('export');
  exportScope = signal<'active' | 'all'>('active');
  copied = signal<boolean>(false);
  importText = '';
  importError = signal<string | null>(null);

  getExportJson(): string {
    if (this.exportScope() === 'all') {
      return this.store.exportAllSessionsJson();
    }
    return this.store.exportSessionJson();
  }

  copyToClipboard() {
    const json = this.getExportJson();
    navigator.clipboard.writeText(json).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
      this.store.showToast('JSON copied to clipboard', 'success');
    });
  }

  downloadJsonFile() {
    const json = this.getExportJson();
    const isAll = this.exportScope() === 'all';
    const filename = isAll 
      ? `instatutor-all-sessions-${new Date().toISOString().slice(0, 10)}.json`
      : `${(this.store.activeSession()?.title || 'session').toLowerCase().replace(/\W+/g, '-')}.json`;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    this.store.showToast('Downloaded JSON file', 'success');
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  onFileDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      this.readFile(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.readFile(input.files[0]);
    }
  }

  private readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.importText = reader.result as string;
      this.performImport();
    };
    reader.onerror = () => {
      this.importError.set('Failed to read file from disk.');
    };
    reader.readAsText(file);
  }

  performImport() {
    this.importError.set(null);
    if (!this.importText.trim()) return;

    const success = this.store.importSessionJson(this.importText);
    if (success) {
      this.close.emit();
    } else {
      this.importError.set('Invalid JSON format or corrupted session structure.');
    }
  }
}
