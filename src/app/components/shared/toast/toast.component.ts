import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionStoreService } from '../../../services/session-store.service';
import { LucideAngularModule, CheckCircle2, AlertTriangle, Info, X } from 'lucide-angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (store.toast(); as currentToast) {
      <div class="fixed bottom-6 right-6 z-50 animate-fade-in-up max-w-md">
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-xl"
          [ngClass]="{
            'bg-slate-900/95 border-emerald-500/40 text-emerald-200': currentToast.type === 'success',
            'bg-slate-900/95 border-rose-500/40 text-rose-200': currentToast.type === 'error',
            'bg-slate-900/95 border-teal-500/40 text-teal-200': currentToast.type === 'info'
          }">
          <div class="shrink-0">
            @if (currentToast.type === 'success') {
              <lucide-icon [img]="CheckCircle2Icon" class="w-5 h-5 text-emerald-400"></lucide-icon>
            } @else if (currentToast.type === 'error') {
              <lucide-icon [img]="AlertTriangleIcon" class="w-5 h-5 text-rose-400"></lucide-icon>
            } @else {
              <lucide-icon [img]="InfoIcon" class="w-5 h-5 text-teal-400"></lucide-icon>
            }
          </div>
          <p class="text-sm font-medium leading-snug flex-1">{{ currentToast.message }}</p>
          <button (click)="dismiss()" class="text-slate-400 hover:text-white p-1 rounded-lg transition-colors">
            <lucide-icon [img]="XIcon" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      </div>
    }
  `
})
export class ToastComponent {
  store = inject(SessionStoreService);
  CheckCircle2Icon = CheckCircle2;
  AlertTriangleIcon = AlertTriangle;
  InfoIcon = Info;
  XIcon = X;

  dismiss() {
    this.store.toast.set(null);
  }
}
