'use client';
// ============================================================
// AI Kids Academy — claude.ts (Step 4: Proxy Redirect)
// All AI calls now go through /api/ai/* backend routes.
// This file re-exports from ai-client.ts for backward compat.
// The API key is ONLY in OPENROUTER_API_KEY (no NEXT_PUBLIC_).
// ============================================================

export {
  callMentor,
  callStory,
  callCreator,
  callDIY,
  callScienceHelper,
  formatUsageLabel,
  AILimitError,
  AISafetyError,
} from './ai-client';

// Legacy system prompts kept for reference only
// These are now defined server-side in lib/server/ai-config.ts
export const SYSTEM_PROMPTS = {
  _note: 'System prompts moved to lib/server/ai-config.ts (server-only)',
} as const;
