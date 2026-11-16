# InstaTutor — Interactive Micro-Learning Single-Page Application

InstaTutor is a 100% client-side, zero-backend, interactive micro-learning application built with modern **Angular 18+**, **Tailwind CSS**, and **Angular Signals**. It transforms raw text, research papers, or subject topics into structured, pedagogical micro-learning workspaces powered by direct client-side LLM calls (Google Gemini or OpenAI) with browser `localStorage` persistence and JSON portability.

---

## ⚡ Core Features

### 1. Dual-Mode Input & Session Setup (Landing View)
- **Topic Mode**: Single-line input for broad subjects (e.g., *"Quantum Computing"*, *"Macroeconomics"*, *"CRISPR Gene Editing"*).
- **Text Input Mode**: Textarea for pasting raw text (research papers, documentation, meeting notes, study guides) with character counts and sample loaders.
- **Pedagogy Modes**: Standard Tutor Mode, Fast Quiz Mode, or Deep Socratic Mode.
- **Previous Sessions Gallery**: Access, review, or delete stored sessions saved in `localStorage`.

### 2. Socratic Tutor (Chat Component)
- Conversational AI tutor built on Socratic inquiry principles: **never reveals answers outright**; instead provides scaffolded hints, analogies, and guiding questions.
- Visual hint indicators (`💡 Scaffolded Hint`) distinguishing hints from questions.
- Direct **"Show Me Answer"** override button to unlock the direct answer explanation when stuck.
- Active concept context integration: selecting any concept in the Concept Map automatically focuses the tutor on that specific concept.

### 3. Dynamic Flashcard Deck (3D CSS Flip & SM-2)
- Interactive 3D flip-cards (`transform-style: preserve-3d`) featuring Front (Inquiry/Concept) and Back (Explanation/Key Takeaways).
- **Spaced Repetition Algorithm (SM-2)**: Real client-side implementation tracking `interval`, `repetitions`, `easeFactor`, and `nextReviewDate`.
- Card recall ratings:
  - **Hard (1)**: Resets review interval to 1 day and decreases ease factor.
  - **Good (2)**: Advances standard SM-2 interval based on ease factor.
  - **Easy (3)**: Grants bonus interval and increases ease factor.
- Keyboard shortcuts: `Space` to flip, `1` for Hard, `2` for Good, `3` for Easy, `←`/`→` to navigate.
- Filters: All Cards, Due for Review Today, Hard, Good, Easy.

### 4. Interactive Concept Mapper
- Collapsible hierarchical tree view (Main Topics → Sub-concepts → Key Definitions).
- Status cycle badges: **New**, **Exploring**, **Mastered**.
- Real-time search filter to locate specific topics.
- **Cross-module activation**: Clicking a node highlights it with an emerald glow and sets it as the active context across Socratic Chat and Flashcards.

### 5. Micro-Quiz Engine
- Dynamic multiple-choice questions auto-generated from source content.
- Instant response validation (emerald for correct, rose for incorrect).
- Full pedagogical explanations for every option.
- End-of-session score analytics:
  - Final score percentage & performance tier badge.
  - Confetti celebration blast on high scores (≥ 80%).
  - Detailed answer breakdown table.
  - **"Retry Missed Questions"** button.
  - **"Retake Full Quiz"** button.
  - **"Review Missed Concepts with Socratic Tutor"** shortcut.

### 6. Zero-Backend Guarantee & Session Portability
- **Zero backend servers**: No Node/Python/Go API proxy required.
- **Zero database dependencies**: Sessions and settings are saved exclusively in browser `localStorage`.
- **JSON Export / Import**:
  - Export active session or entire session library to downloadable `.json` file.
  - Copy JSON to clipboard.
  - Import session from `.json` file (via drag-and-drop or file picker) with schema validation.
- **Offline Simulation Mode**: Includes 3 rich pre-built sessions (Quantum Computing, Transformer Attention, Macroeconomics) and a procedural generator that works offline without an API key.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Angular 18 (Standalone Components, Control Flow `@if`, `@for`, `@switch`)
- **State Management**: Angular Signals (`signal`, `computed`, `effect`) in `SessionStoreService`
- **Styling**: Tailwind CSS + Custom 3D CSS Flip Utilities
- **Icons**: Lucide Angular (`lucide-angular`)
- **Celebration**: `canvas-confetti`
- **AI Integrations**: Direct client-side `fetch` / `HttpClient` requesting structured JSON schema:
  - **Google Gemini**: `gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`
  - **OpenAI**: `gpt-4o-mini`, `gpt-4o`

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```
Navigate to `http://localhost:4200/`.

### 3. Build for Production
```bash
npm run build
```
Production artifacts will be located in `dist/instatutor/browser/`.

---

## 🔒 Privacy & API Key Setup

1. Click the **Settings** gear icon in the top navigation bar.
2. Choose your preferred LLM provider (**Google Gemini** or **OpenAI**).
3. Enter your personal API key (e.g. from [Google AI Studio](https://aistudio.google.com/app/apikey) or [OpenAI Platform](https://platform.openai.com/api-keys)).
4. Keys are stored exclusively in your browser's `localStorage` and never leave your machine except when calling the AI provider's API directly.
5. If no key is entered, InstaTutor automatically activates **Offline Simulation Mode** with rich procedural content generation.
