import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionStoreService } from './services/session-store.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LandingComponent } from './components/landing/landing.component';
import { WorkspaceComponent } from './components/workspace/workspace.component';
import { SettingsModalComponent } from './components/settings-modal/settings-modal.component';
import { ImportExportModalComponent } from './components/shared/import-export-modal/import-export-modal.component';
import { ToastComponent } from './components/shared/toast/toast.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    NavbarComponent,
    LandingComponent,
    WorkspaceComponent,
    SettingsModalComponent,
    ImportExportModalComponent,
    ToastComponent
  ],
  template: `
    <div class="app-shell min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white">
      
      <!-- Top Navigation -->
      <app-navbar 
        (openSettings)="showSettingsModal.set(true)"
        (openImportExport)="showImportExportModal.set(true)">
      </app-navbar>

      <!-- Main App Body -->
      <main class="flex-1">
        @if (store.activeSession()) {
          <app-workspace 
            (openImportExport)="showImportExportModal.set(true)">
          </app-workspace>
        } @else {
          <app-landing 
            (openSettings)="showSettingsModal.set(true)">
          </app-landing>
        }
      </main>

      <!-- Global Footer -->
      <footer class="app-footer px-4 py-4 text-center text-xs text-slate-500">
        <p>InstaTutor <span aria-hidden="true">·</span> A quieter way to learn</p>
      </footer>

      <!-- Modals & Toasts -->
      @if (showSettingsModal()) {
        <app-settings-modal (close)="showSettingsModal.set(false)"></app-settings-modal>
      }

      @if (showImportExportModal()) {
        <app-import-export-modal (close)="showImportExportModal.set(false)"></app-import-export-modal>
      }

      <app-toast></app-toast>

    </div>
  `
})
export class AppComponent {
  store = inject(SessionStoreService);

  showSettingsModal = signal<boolean>(false);
  showImportExportModal = signal<boolean>(false);

}
