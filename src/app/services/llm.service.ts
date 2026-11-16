import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings, ConceptNode, Flashcard, QuizQuestion, StudySession, ChatMessage } from '../models/study-session.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class LlmService {
  private http = inject(HttpClient);
  private mockData = inject(MockDataService);

  /**
   * Tests the user's API key and provider connection.
   */
  async testConnection(settings: AppSettings): Promise<{ success: boolean; message: string }> {
    if (!settings.apiKey?.trim()) {
      return { success: false, message: 'Please enter an API key first.' };
    }

    const model = this.resolveGeminiModel(settings);

    try {
      if (settings.provider === 'gemini') {
        await this.callGemini(settings.apiKey, model, [
          { role: 'user', content: 'Respond with exactly this JSON: {"status":"connected"}' }
        ], true);
        return { success: true, message: `Successfully connected to Google Gemini (${model})!` };
      } else {
        const openAiModel = settings.model || 'gpt-4o-mini';
        await this.callOpenAi(settings.apiKey, openAiModel, [
          { role: 'user', content: 'Respond with JSON: {"status":"connected"}' }
        ], true);
        return { success: true, message: `Successfully connected to OpenAI (${openAiModel})!` };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection test failed.' };
    }
  }

  /**
   * Generates a complete StudySession from user content.
   */
  async generateStudySession(
    content: string,
    sourceType: 'text' | 'topic',
    mode: 'standard' | 'quiz' | 'socratic',
    settings: AppSettings
  ): Promise<StudySession> {
    // If no API key is supplied or offline mode is forced, use mock generator
    if (!settings.apiKey?.trim() || settings.offlineDemoMode) {
      // Simulate brief thinking delay for smooth UX transition
      await new Promise(res => setTimeout(res, 600));
      return this.mockData.generateProceduralSession(content, sourceType, mode);
    }

    const systemPrompt = `You are InstaTutor, an elite educational architect specializing in cognitive science, micro-learning, and structured pedagogy.
Analyze the user's provided input (${sourceType === 'topic' ? 'Topic name' : 'Source text'}) and construct an interactive micro-learning study session.

You MUST respond with a single valid JSON object strictly matching this TypeScript interface without any conversational prefix or suffix:

interface StudySessionOutput {
  title: string; // Concise, captivating title
  summary: string; // 2-3 sentence high-impact summary
  conceptMap: Array<{
    id: string; // unique string e.g. "c1", "c1-1"
    label: string; // clear concept name
    description?: string; // 1-2 sentence definition
    children?: Array<{
      id: string;
      label: string;
      description?: string;
      children?: Array<{
        id: string;
        label: string;
        description?: string;
      }>;
    }>;
  }>;
  flashcards: Array<{
    id: string;
    front: string; // Clear question or concept inquiry
    back: string; // Precise explanation and key takeaway
    category: string; // Topic category
  }>;
  quizQuestions: Array<{
    id: string;
    question: string;
    options: string[]; // Exactly 4 distinct options
    correctIndex: number; // 0-indexed integer (0, 1, 2, or 3)
    explanation: string; // Detailed pedagogical explanation of why this option is correct and others are flawed
  }>;
}

Constraints:
- Provide 2 to 4 top-level concept nodes with 1 to 3 sub-children each.
- Generate 5 to 8 high-yield flashcards suitable for spaced repetition.
- Generate 4 to 6 rigorous multiple-choice questions with 4 options each.
- All IDs must be unique strings.
- Output ONLY valid, parseable JSON.`;

    const userPrompt = `Learning Mode: ${mode.toUpperCase()}
Source Input Type: ${sourceType.toUpperCase()}
Input Content:
"""
${content}
"""`;

    try {
      let rawJson: string;
      const geminiModel = this.resolveGeminiModel(settings);

      if (settings.provider === 'gemini') {
        rawJson = await this.callGemini(settings.apiKey, geminiModel, [
          { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
        ], true);
      } else {
        rawJson = await this.callOpenAi(settings.apiKey, settings.model || 'gpt-4o-mini', [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ], true);
      }

      const parsed = this.cleanAndParseJson(rawJson);
      return this.normalizeSession(parsed, content, sourceType, mode);
    } catch (err: any) {
      console.error('Direct LLM call failed:', err);
      throw new Error(`AI Call Failed: ${err.message || 'Check API key or network'}`);
    }
  }

  /**
   * Socratic Chat stream/reply method.
   * Guides the student using Socratic inquiry without giving direct answers,
   * unless explicitly requested by the "Show Me Answer" override.
   */
  async getSocraticReply(
    conversation: ChatMessage[],
    activeSession: StudySession,
    activeConcept: ConceptNode | null,
    settings: AppSettings,
    isShowAnswerRequest: boolean = false
  ): Promise<{ content: string; isHint: boolean }> {
    const conceptContext = activeConcept 
      ? `Active Concept Context: "${activeConcept.label}" (${activeConcept.description || ''})`
      : `General Subject Context: "${activeSession.title}"`;

    const socraticRules = isShowAnswerRequest
      ? `The student clicked "Show Me Answer". Provide a clear, comprehensive, and illuminating explanation of the question/concept, but end with a follow-up reflection question to confirm their understanding.`
      : `CRITICAL SOCRATIC RULES:
1. NEVER reveal the direct final answer or solve the problem outright.
2. Probe understanding through scaffolded hints, analogies, and guiding questions.
3. Keep responses concise, engaging, and friendly (2 to 4 sentences).
4. If the student is close, validate their partial progress and nudge them the remaining distance.
5. If the student is struggling or confused, break down the premise into a simpler sub-question.`;

    const systemPrompt = `You are the InstaTutor Socratic Tutor for "${activeSession.title}".
Session Summary: ${activeSession.summary}
${conceptContext}

${socraticRules}

Tone: Encouraging, intellectually stimulating, rigorous yet accessible.`;

    // Offline / Mock fallback
    if (!settings.apiKey?.trim() || settings.offlineDemoMode) {
      await new Promise(res => setTimeout(res, 500));
      return this.generateMockSocraticReply(conversation, activeConcept, isShowAnswerRequest);
    }

    try {
      const messagesForApi = [
        { role: 'system', content: systemPrompt },
        ...conversation.map(m => ({
          role: m.role,
          content: m.content
        }))
      ];

      let reply: string;
      if (settings.provider === 'gemini') {
        const geminiModel = this.resolveGeminiModel(settings);
        const fullPrompt = `${systemPrompt}\n\n` + conversation.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n') + '\n\nASSISTANT:';
        reply = await this.callGemini(settings.apiKey, geminiModel, [
          { role: 'user', content: fullPrompt }
        ], false);
      } else {
        reply = await this.callOpenAi(settings.apiKey, settings.model || 'gpt-4o-mini', messagesForApi, false);
      }

      return {
        content: reply.trim(),
        isHint: !isShowAnswerRequest
      };
    } catch (e: any) {
      console.error('LLM chat error:', e);
      throw new Error(`Socratic AI Error: ${e.message}`);
    }
  }

  private resolveGeminiModel(settings: AppSettings): string {
    const preferred = (settings.model || 'gemini-3.8-flash').trim();
    const normalized = preferred.toLowerCase();

    if (normalized.startsWith('gemini-1.5')) return 'gemini-3.8-flash';
    if (normalized.startsWith('gemini-2.0')) return 'gemini-3.8-flash';
    if (normalized.startsWith('gemini-2.5')) return 'gemini-3.8-flash';
    if (normalized.startsWith('gemini-3')) return 'gemini-3.8-flash';

    return preferred || 'gemini-3.8-flash';
  }

  private async callGemini(apiKey: string, model: string, messages: { role: string; content: string }[], jsonMode: boolean): Promise<string> {
    const resolvedModel = this.resolveGeminiModel({ apiKey, provider: 'gemini', model, temperature: 0.4, offlineDemoMode: false });
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${resolvedModel}:generateContent?key=${apiKey.trim()}`;
    
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const body: any = {
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 4000
      }
    };

    if (jsonMode) {
      body.generationConfig.responseMimeType = 'application/json';
    }

    let response: Response;
    for (let attempt = 0; ; attempt++) {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const retryableStatuses = [429, 500, 502, 503, 504];
      if (response.ok || !retryableStatuses.includes(response.status) || attempt >= 2) break;

      const retryAfter = Number(response.headers.get('Retry-After'));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 10000)
        : 1000 * (2 ** attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    if (!response.ok) {
      const errorText = await response.text();
      let parsedMessage = errorText;
      try {
        const errObj = JSON.parse(errorText);
        parsedMessage = errObj.error?.message || errorText;
      } catch {}
      throw new Error(`Gemini API Error (${response.status}): ${parsedMessage}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini returned an empty response. Check safety filters or prompt length.');
    }
    return text;
  }

  private async callOpenAi(apiKey: string, model: string, messages: { role: string; content: string }[], jsonMode: boolean): Promise<string> {
    const url = 'https://api.openai.com/v1/chat/completions';
    const body: any = {
      model,
      messages,
      temperature: 0.4
    };

    if (jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedMessage = errorText;
      try {
        const errObj = JSON.parse(errorText);
        parsedMessage = errObj.error?.message || errorText;
      } catch {}
      throw new Error(`OpenAI API Error (${response.status}): ${parsedMessage}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error('OpenAI returned an empty response.');
    }
    return reply;
  }

  private cleanAndParseJson(text: string): any {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    // Extract between outermost braces in case of surrounding text
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleaned);
  }

  private normalizeSession(
    raw: any,
    sourceContent: string,
    sourceType: 'text' | 'topic',
    mode: 'standard' | 'quiz' | 'socratic'
  ): StudySession {
    const id = 'session-' + Date.now();
    const now = Date.now();

    const flashcards: Flashcard[] = (raw.flashcards || []).map((fc: any, i: number) => ({
      id: fc.id || `fc-${id}-${i + 1}`,
      front: fc.front || 'Concept inquiry',
      back: fc.back || 'Concept explanation',
      category: fc.category || 'Core',
      difficulty: undefined,
      nextReviewDate: undefined,
      repetitions: 0,
      interval: 1,
      easeFactor: 2.5
    }));

    const quizQuestions: QuizQuestion[] = (raw.quizQuestions || []).map((q: any, i: number) => ({
      id: q.id || `qq-${id}-${i + 1}`,
      question: q.question || 'Review Question',
      options: Array.isArray(q.options) && q.options.length === 4 
        ? q.options 
        : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
      explanation: q.explanation || 'Detailed concept explanation.',
      userSelectedIndex: undefined
    }));

    const conceptMap: ConceptNode[] = this.normalizeConceptNodes(raw.conceptMap || []);

    const initialChatMessage: ChatMessage = {
      id: `msg-start-${id}`,
      role: 'assistant',
      content: `Welcome to your Socratic study session on "${raw.title || 'this topic'}"! I am your personal tutor. What initial intuition or prior question do you have about this subject?`,
      timestamp: now
    };

    return {
      id,
      createdAt: now,
      title: raw.title || 'Micro-Learning Session',
      summary: raw.summary || 'Interactive study session generated by InstaTutor.',
      conceptMap,
      flashcards,
      quizQuestions,
      chatMessages: [initialChatMessage],
      mode,
      sourceType,
      sourceContent
    };
  }

  private normalizeConceptNodes(nodes: any[]): ConceptNode[] {
    return nodes.map((node, i) => ({
      id: node.id || `node-${i + 1}`,
      label: node.label || 'Concept Node',
      description: node.description || '',
      status: 'exploring',
      children: Array.isArray(node.children) ? this.normalizeConceptNodes(node.children) : undefined
    }));
  }

  private generateMockSocraticReply(
    conversation: ChatMessage[],
    activeConcept: ConceptNode | null,
    isShowAnswer: boolean
  ): { content: string; isHint: boolean } {
    const conceptName = activeConcept?.label || 'this concept';

    if (isShowAnswer) {
      return {
        content: `Here is the direct explanation: ${conceptName} operates on the principle that underlying states interact dynamically to produce the observed phenomena. Notice how altering the initial condition shifts the entire outcome. Now that you see the direct answer, how would you test this in a real-world edge case?`,
        isHint: false
      };
    }

    const replies = [
      `That is an intriguing angle! If we consider ${conceptName}, what would happen if the primary variable were doubled? How would the balance shift?`,
      `You are touching on a key mechanism here. Before we draw a conclusion, what implicit assumption are we making about the baseline condition?`,
      `Think about an intuitive analogy: if this were a physical water pipe or circuit, where would the bottleneck occur in ${conceptName}?`,
      `Notice how your explanation connects to the broader picture. Could there be a hidden constraint we have not yet accounted for?`
    ];

    const pick = replies[Math.floor(Math.random() * replies.length)];
    return {
      content: pick,
      isHint: true
    };
  }
}
