import { Injectable } from '@angular/core';
import { StudySession, AppSettings } from '../models/study-session.model';

const STORAGE_KEYS = {
  SESSIONS: 'instatutor_sessions_v1',
  ACTIVE_SESSION_ID: 'instatutor_active_id_v1',
  SETTINGS: 'instatutor_settings_v1'
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  provider: 'gemini',
  model: 'gemini-3.8-flash',
  temperature: 0.4,
  offlineDemoMode: false
};

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  loadSessions(): StudySession[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error loading sessions from localStorage', e);
      return [];
    }
  }

  saveSessions(sessions: StudySession[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Error saving sessions to localStorage', e);
    }
  }

  loadActiveSessionId(): string | null {
    if (!this.isBrowser()) return null;
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
    } catch {
      return null;
    }
  }

  saveActiveSessionId(id: string | null): void {
    if (!this.isBrowser()) return;
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
      }
    } catch (e) {
      console.error('Error saving active session ID', e);
    }
  }

  loadSettings(): AppSettings {
    if (!this.isBrowser()) return DEFAULT_SETTINGS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      console.error('Error loading settings', e);
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings: AppSettings): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  }

  clearAll(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
    } catch (e) {
      console.error('Error clearing storage', e);
    }
  }
}
