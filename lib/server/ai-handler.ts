// ============================================================
// AI Kids Academy — Shared API Route Handler
// Server-side only — never imported by frontend components
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  AI_API_KEY, AI_API_URL, AI_MODEL, AI_APP_URL,
  DAILY_LIMITS, MAX_TOKENS, SYSTEM_PROMPTS, FALLBACK_RESPONSES,
  type AIRoute, type UserPlan,
} from './ai-config';
import { createClient } from '@supabase/supabase-js';

// Server-side fire-and-forget event log (no PII)
function logStoryCreated(childId: string, plan: UserPlan) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || childId === 'demo') return;
  const db = createClient(url, key, { auth: { persistSession: false } });
  db.from('app_events').insert({
    child_id: childId,
    event: 'story_created',
    properties: { feature: 'story', plan },
    plan,
    occurred_at: new Date().toISOString(),
  }).then(() => {/* fire and forget */});
}

// ── In-memory rate limiting (replace with Redis/Supabase in production) ──
const usageCache = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(childId: string, route: AIRoute, plan: UserPlan): {
  allowed: boolean;
  used: number;
  limit: number;
  resetAt: number;
} {
  const limit   = DAILY_LIMITS[plan][route];
  const key     = `${childId}:${route}`;
  const now     = Date.now();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const resetAt = midnight.getTime();

  const current = usageCache.get(key);

  // Reset if past midnight
  if (!current || current.resetAt < now) {
    usageCache.set(key, { count: 0, resetAt });
    return { allowed: true, used: 0, limit, resetAt };
  }

  const used = current.count;
  return {
    allowed: used < limit,
    used,
    limit,
    resetAt: current.resetAt,
  };
}

function incrementUsage(childId: string, route: AIRoute) {
  const key = `${childId}:${route}`;
  const now = Date.now();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const current = usageCache.get(key);
  if (!current || current.resetAt < now) {
    usageCache.set(key, { count: 1, resetAt: midnight.getTime() });
  } else {
    usageCache.set(key, { count: current.count + 1, resetAt: current.resetAt });
  }
}

// ── Input sanitiser ───────────────────────────────────────────
function sanitise(input: string, maxLen = 500): string {
  return String(input ?? '')
    .trim()
    .slice(0, maxLen)
    // Remove any attempt to inject system instructions
    .replace(/\[SYSTEM\]|\[INST\]|<\|system\|>|<\|user\|>/gi, '')
    // Strip angle-bracket HTML tags
    .replace(/<[^>]{0,100}>/g, '');
}

// ── Content safety check ──────────────────────────────────────
const BLOCKED_PATTERNS = [
  /\b(kill|murder|suicide|self.harm|harm yourself|hurt yourself)\b/i,
  /\b(sex|porn|naked|nude|explicit)\b/i,
  /\b(bomb|explosive|weapon|gun|knife|stab)\b/i,
  /\b(drug|cocaine|heroin|meth|weed|cannabis)\b/i,
  /ignore (previous|all|your) (instructions|rules|prompt)/i,
  /jailbreak|bypass|override|forget you are/i,
];

function isSafeInput(text: string): boolean {
  return !BLOCKED_PATTERNS.some(p => p.test(text));
}

// ── Call the AI API ───────────────────────────────────────────
async function callAI(
  systemPrompt: string,
  userMessage: string,
  route: AIRoute,
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...(history ?? []),
    { role: 'user', content: userMessage },
  ];

  const res = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`,
      'HTTP-Referer': AI_APP_URL,
      'X-Title': 'AI Kids Academy',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: MAX_TOKENS[route],
      messages,
      temperature: 0.75,
    }),
    // 30-second timeout
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`AI API error ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error.message ?? 'AI API error');
  const content = data.choices?.[0]?.message?.content ?? '';
  if (!content) throw new Error('Empty AI response');
  return content;
}

// ── Main handler factory ──────────────────────────────────────
export interface AIRequestBody {
  route:    AIRoute;
  childId:  string;           // 'demo' for demo mode
  plan:     UserPlan;         // 'free' | 'premium' | 'family'
  context:  Record<string, string>;
  userMessage: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function handleAIRequest(req: NextRequest): Promise<NextResponse> {
  // ── Parse body ──────────────────────────────────────────────
  let body: AIRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { route, childId, plan = 'free', context = {}, userMessage, history } = body;

  // ── Validate route ──────────────────────────────────────────
  if (!route || !(route in DAILY_LIMITS.free)) {
    return NextResponse.json({ error: 'Invalid AI route' }, { status: 400 });
  }

  // ── Validate inputs ─────────────────────────────────────────
  const cleanMessage = sanitise(userMessage ?? '', 800);
  const cleanContext = Object.fromEntries(
    Object.entries(context).map(([k, v]) => [k, sanitise(String(v), 200)])
  );

  // ── Content safety check ────────────────────────────────────
  if (!isSafeInput(cleanMessage) || Object.values(cleanContext).some(v => !isSafeInput(v))) {
    return NextResponse.json(
      { error: 'That message contains content that\'s not allowed. Please try a different question! 🌟' },
      { status: 422 }
    );
  }

  // ── Rate limiting ───────────────────────────────────────────
  const safePlan: UserPlan = ['free', 'premium', 'family'].includes(plan) ? plan : 'free';
  const safeChildId = childId === 'demo' ? 'demo' : sanitise(childId, 100);

  // Demo users get free-tier limits
  const effectivePlan: UserPlan = safeChildId === 'demo' ? 'free' : safePlan;
  const rateCheck = checkRateLimit(safeChildId, route, effectivePlan);

  if (!rateCheck.allowed) {
    const resetTime = new Date(rateCheck.resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return NextResponse.json(
      {
        error: `Daily limit reached for ${route}! You've used ${rateCheck.used}/${rateCheck.limit} today. Resets at ${resetTime}. 🌟 Upgrade to Premium for more!`,
        limitReached: true,
        used: rateCheck.used,
        limit: rateCheck.limit,
        resetAt: rateCheck.resetAt,
      },
      { status: 429 }
    );
  }

  // ── No API key — use fallback ───────────────────────────────
  if (!AI_API_KEY) {
    const fallback = FALLBACK_RESPONSES[route](cleanContext);
    return NextResponse.json({
      text: fallback,
      fallback: true,
      used: rateCheck.used + 1,
      limit: rateCheck.limit,
    });
  }

  // ── Call AI ─────────────────────────────────────────────────
  try {
    const systemPrompt = SYSTEM_PROMPTS[route](cleanContext);
    const text = await callAI(systemPrompt, cleanMessage, route, history);

    // Increment usage after successful call
    incrementUsage(safeChildId, route);
    // Log story_created event server-side
    if (route === 'story') logStoryCreated(safeChildId, effectivePlan);

    return NextResponse.json({
      text,
      used: rateCheck.used + 1,
      limit: rateCheck.limit,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    // Rate limited by AI provider
    if (message.includes('429') || message.toLowerCase().includes('rate limit')) {
      return NextResponse.json(
        { error: 'The AI is very busy right now. Please wait a moment and try again! ⏳' },
        { status: 503 }
      );
    }

    // Timeout
    if (message.includes('AbortError') || message.includes('timeout')) {
      return NextResponse.json(
        { error: 'The AI took too long to respond. Please try again! ⏳' },
        { status: 504 }
      );
    }

    // Fallback on any other error
    console.error(`[AI Route ${route}] Error:`, message);
    const fallback = FALLBACK_RESPONSES[route](cleanContext);
    return NextResponse.json({
      text: fallback,
      fallback: true,
      used: rateCheck.used,
      limit: rateCheck.limit,
    });
  }
}
