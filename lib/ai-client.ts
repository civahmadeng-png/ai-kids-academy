'use client';
// ============================================================
// AI Kids Academy — Frontend AI Client (Step 4)
// ALL AI calls go through /api/ai/* routes.
// Zero API keys in this file or anywhere in frontend code.
// ============================================================

import type { AIRoute, UserPlan } from '@/lib/server/ai-config';
import type { AIRequestBody } from '@/lib/server/ai-handler';

// Re-export types for use in components
export type { AIRoute, UserPlan };

// ── Chat message type (for mentor history) ────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ── Response shape from all API routes ───────────────────────
export interface AIResponse {
  text: string;
  fallback?: boolean;      // true when AI key missing or API failed
  used?: number;           // calls used today
  limit?: number;          // daily limit for this plan
  limitReached?: boolean;  // true when 429 returned
}

// ── Base caller ───────────────────────────────────────────────
async function callRoute(
  route: AIRoute,
  childId: string,
  plan: UserPlan,
  context: Record<string, string>,
  userMessage: string,
  history?: ChatMessage[]
): Promise<AIResponse> {
  const body: AIRequestBody = {
    route,
    childId,
    plan,
    context,
    userMessage,
    history,
  };

  const res = await fetch(`/api/ai/${route === 'scienceHelper' ? 'science-helper' : route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  // Rate limit hit
  if (res.status === 429) {
    throw new AILimitError(data.error ?? 'Daily limit reached', data.limit, data.used, data.resetAt);
  }

  // Safety rejection
  if (res.status === 422) {
    throw new AISafetyError(data.error ?? 'Message not allowed');
  }

  // Other errors — try to return fallback gracefully
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }

  return data as AIResponse;
}

// ── Custom error types ────────────────────────────────────────
export class AILimitError extends Error {
  constructor(
    message: string,
    public readonly limit: number,
    public readonly used: number,
    public readonly resetAt: number
  ) {
    super(message);
    this.name = 'AILimitError';
  }
}

export class AISafetyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AISafetyError';
  }
}

// ── Per-feature call functions ────────────────────────────────

export async function callMentor(
  childName: string,
  message: string,
  childId: string,
  plan: UserPlan,
  history: ChatMessage[] = []
): Promise<AIResponse> {
  return callRoute('mentor', childId, plan, { childName }, message, history);
}

export async function callStory(
  hero: string,
  world: string,
  difficulty: string,
  childId: string,
  plan: UserPlan
): Promise<AIResponse> {
  const prompt = `Create an adventure story with my hero: ${hero} in the world of: ${world}`;
  return callRoute('story', childId, plan, { hero, world, difficulty }, prompt);
}

export async function callCreator(
  creationType: string,
  idea: string,
  childId: string,
  plan: UserPlan
): Promise<AIResponse> {
  const prompt = `Create ${creationType} content for this idea: ${idea}`;
  return callRoute('creator', childId, plan, { creationType, idea }, prompt);
}

export async function callDIY(
  idea: string,
  childId: string,
  plan: UserPlan
): Promise<AIResponse> {
  const prompt = `Create a DIY project guide for: ${idea}`;
  return callRoute('diy', childId, plan, { idea }, prompt);
}

export async function callScienceHelper(
  topic: string,
  question: string,
  childId: string,
  plan: UserPlan
): Promise<AIResponse> {
  return callRoute('scienceHelper', childId, plan, { topic }, question);
}

// ── Usage display helper ──────────────────────────────────────
export function formatUsageLabel(used: number, limit: number): string {
  if (limit >= 999) return 'Unlimited ✨';
  const remaining = limit - used;
  if (remaining <= 0) return '0 remaining today';
  if (remaining === 1) return '1 use remaining today';
  return `${remaining} uses remaining today`;
}
