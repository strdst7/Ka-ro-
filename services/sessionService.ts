/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SessionState, Mode, AspectRatio, StoryType, Language } from '../types';

const SESSION_STORAGE_KEY = 'kairo_current_session';

export const DEFAULT_SESSION_PROMPT = 'a cat hosting a party for its bunny friends';
export const DEFAULT_SESSION_MODE: Mode = 'image';
export const DEFAULT_SESSION_LANGUAGE: Language = 'en';

/**
 * Loads the stored session state from LocalStorage.
 * Returns null if no valid state exists or parsing fails.
 */
export function loadSavedSession(): SessionState | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    // Validate core fields
    const prompt = typeof parsed.prompt === 'string' ? parsed.prompt : DEFAULT_SESSION_PROMPT;
    const mode: Mode = parsed.mode === 'story' ? 'story' : 'image';
    const language: Language = parsed.language === 'ms' ? 'ms' : 'en';
    const pendingAttributeUpdates = typeof parsed.pendingAttributeUpdates === 'object' && parsed.pendingAttributeUpdates !== null
      ? parsed.pendingAttributeUpdates
      : {};
    const pendingRelationshipUpdates = typeof parsed.pendingRelationshipUpdates === 'object' && parsed.pendingRelationshipUpdates !== null
      ? parsed.pendingRelationshipUpdates
      : {};
    const pendingClarificationAnswers = typeof parsed.pendingClarificationAnswers === 'object' && parsed.pendingClarificationAnswers !== null
      ? parsed.pendingClarificationAnswers
      : {};

    return {
      prompt,
      mode,
      language,
      pendingAttributeUpdates,
      pendingRelationshipUpdates,
      pendingClarificationAnswers,
      aspectRatio: parsed.aspectRatio as AspectRatio | undefined,
      resolution: typeof parsed.resolution === 'string' ? parsed.resolution : undefined,
      selectedModel: typeof parsed.selectedModel === 'string' ? parsed.selectedModel : undefined,
      selectedClarificationModel: typeof parsed.selectedClarificationModel === 'string' ? parsed.selectedClarificationModel : undefined,
      storyType: parsed.storyType as StoryType | undefined,
      beliefGraph: parsed.beliefGraph || null,
      clarifications: Array.isArray(parsed.clarifications) ? parsed.clarifications : [],
      answeredQuestions: Array.isArray(parsed.answeredQuestions) ? parsed.answeredQuestions : [],
      skippedQuestions: Array.isArray(parsed.skippedQuestions) ? parsed.skippedQuestions : [],
      activeToolTab: parsed.activeToolTab || 'clarify',
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
    };
  } catch (err) {
    console.warn('Failed to load session from localStorage:', err);
    return null;
  }
}

/**
 * Persists the current session state into LocalStorage.
 */
export function saveSessionState(state: Partial<SessionState>): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const existing = loadSavedSession();
    const merged: SessionState = {
      prompt: state.prompt ?? existing?.prompt ?? DEFAULT_SESSION_PROMPT,
      mode: state.mode ?? existing?.mode ?? DEFAULT_SESSION_MODE,
      language: state.language ?? existing?.language ?? DEFAULT_SESSION_LANGUAGE,
      pendingAttributeUpdates: state.pendingAttributeUpdates ?? existing?.pendingAttributeUpdates ?? {},
      pendingRelationshipUpdates: state.pendingRelationshipUpdates ?? existing?.pendingRelationshipUpdates ?? {},
      pendingClarificationAnswers: state.pendingClarificationAnswers ?? existing?.pendingClarificationAnswers ?? {},
      aspectRatio: state.aspectRatio ?? existing?.aspectRatio,
      resolution: state.resolution ?? existing?.resolution,
      selectedModel: state.selectedModel ?? existing?.selectedModel,
      selectedClarificationModel: state.selectedClarificationModel ?? existing?.selectedClarificationModel,
      storyType: state.storyType ?? existing?.storyType,
      beliefGraph: state.beliefGraph !== undefined ? state.beliefGraph : (existing?.beliefGraph ?? null),
      clarifications: state.clarifications ?? existing?.clarifications ?? [],
      answeredQuestions: state.answeredQuestions ?? existing?.answeredQuestions ?? [],
      skippedQuestions: state.skippedQuestions ?? existing?.skippedQuestions ?? [],
      activeToolTab: state.activeToolTab ?? existing?.activeToolTab ?? 'clarify',
      savedAt: Date.now(),
    };

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(merged));
  } catch (err) {
    console.warn('Failed to save session to localStorage:', err);
  }
}

/**
 * Clears saved session state from LocalStorage.
 */
export function clearSavedSession(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear session from localStorage:', err);
  }
}
