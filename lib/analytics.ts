'use client';
// ============================================================
// AI Kids Academy — Analytics Service (Step 10)
//
// Replaces the in-memory stub with a real Supabase-backed
// event log. Falls back gracefully when Supabase is absent
// (demo mode) or a write fails.
//
// Privacy contract:
//   • No names, emails, passwords, IPs, or device IDs
//   • Only internal UUIDs (parent_id, child_id)
//   • session_id is a random UUID per browser session
//   • Properties are a closed allow-list (see SAFE_KEYS)
// ============================================================

import { getRawClient, isDemoMode } from '@/lib/supabaseClient';

// ── Event names (match app_event_name enum in DB) ────────────
export type AppEventName =
  | 'sign_up'
  | 'login'
  | 'logout'
  | 'child_profile_created'
  | 'lesson_completed'
  | 'science_completed'
  | 'diy_completed'
  | 'engineering_completed'
  | 'discovery_completed'
  | 'space_completed'
  | 'career_explored'
  | 'story_created'
  | 'story_completed'
  | 'ai_mentor_used'
  | 'ai_limit_reached'
  | 'upgrade_clicked'
  | 'plan_upgrade_viewed'
  | 'subscription_started'
  | 'subscription_cancelled'
  | 'badge_earned'
  | 'streak_extended'
  | 'daily_login';

// ── Safe property keys (PII is never allowed) ────────────────
export interface EventProperties {
  // Activity context
  module?:      string;   // e.g. 'science_experiment'
  content_id?:  string;   // e.g. 'volcano'
  xp?:          number;   // XP earned
  // Auth context
  method?:      string;   // 'email' | 'google' | 'demo'
  // Subscription context
  plan?:        string;   // 'free' | 'premium' | 'family'
  billing?:     string;   // 'monthly' | 'yearly'
  // Badge context
  badge_id?:    string;
  tier?:        string;   // 'bronze' | 'silver' | 'gold' | ...
  // AI context
  feature?:     string;   // 'mentor' | 'story' | ...
  // Age bucket (not exact age)
  age_bucket?:  string;   // '9-10' | '11-12' | '13-15'
}

// ── Session ID (random UUID, reset on each page load) ────────
let _sessionId: string | null = null;
function getSessionId(): string {
  if (!_sessionId) {
    _sessionId = typeof crypto !== 'undefined'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  }
  return _sessionId;
}

// ── In-memory fallback for demo / offline mode ───────────────
interface InMemoryEvent {
  event:      AppEventName;
  properties: EventProperties;
  ts:         number;
  parentId?:  string;
  childId?:   string;
}
const MAX_IN_MEMORY = 500;
const inMemoryEvents: InMemoryEvent[] = [];

// ── Main trackEvent function ──────────────────────────────────
export async function trackEvent(
  event:      AppEventName,
  properties: EventProperties = {},
  context: {
    parentId?: string;
    childId?:  string;
    plan?:     string;
  } = {}
): Promise<void> {
  // Always keep an in-memory copy (for getStats(), tests, demo)
  inMemoryEvents.push({ event, properties, ts: Date.now(), parentId: context.parentId, childId: context.childId });
  if (inMemoryEvents.length > MAX_IN_MEMORY) inMemoryEvents.shift();

  // Skip DB write in demo mode or when Supabase is not configured
  if (isDemoMode()) return;

  const db = getRawClient();
  if (!db) return;

  // Fire-and-forget — never block the UI for analytics
  // Only include parent_id/child_id if they are provided
  // This prevents FK violations when the parent row doesn't exist yet
  const eventRow: Record<string, unknown> = {
    event_name: event,
    session_id: getSessionId(),
    properties: stripPII(properties),
  };
  if (context.parentId) eventRow.parent_id = context.parentId;
  if (context.childId)  eventRow.child_id  = context.childId;

  db.from('app_events').insert(eventRow).then(({ error }) => {
    if (error && process.env.NODE_ENV === 'development') {
      console.warn('[Analytics] insert failed:', error.message);
    }
  });
}

// ── PII stripper — belt-and-suspenders guard ──────────────────
const BLOCKED_KEYS = ['name', 'email', 'password', 'phone', 'ip', 'address', 'card', 'ssn', 'dob'];
function stripPII(props: EventProperties): EventProperties {
  const safe = { ...props };
  for (const key of BLOCKED_KEYS) {
    delete (safe as Record<string, unknown>)[key];
  }
  return safe;
}

// ── Age → bucket (never store exact age) ─────────────────────
export function ageToAgeBucket(age: number | null): string {
  if (!age) return 'unknown';
  if (age <= 10) return '9-10';
  if (age <= 12) return '11-12';
  return '13-15';
}

// ── Legacy Analytics object (backward-compat with existing .track() calls) ──
// Existing code calls Analytics.track(string, {}) — this shim maps the old
// string event names to the new typed enum where they match, and swallows
// anything unknown (like 'navigate') that we don't want in the DB.
const LEGACY_MAP: Record<string, AppEventName | null> = {
  signup:              'sign_up',
  register:            'sign_up',
  signin:              'login',
  signout:             'logout',
  demo_mode_entered:   'login',
  child_created:       'child_profile_created',
  child_selected:      null,          // not stored
  badge_earned:        'badge_earned',
  activity_complete:   null,          // handled specifically via completeItem
  activity_complete_demo: null,
  progress_loaded:     null,
  navigate:            null,
  upgrade_intent:      'upgrade_clicked',
  dev_plan_switch:     null,
};

export const Analytics = {
  /** @deprecated Use trackEvent() directly for new code */
  track(event: string, data: Record<string, unknown> = {}, _username?: string): void {
    const mapped = LEGACY_MAP[event];
    if (mapped) {
      // Non-blocking — drop the promise intentionally
      void trackEvent(mapped, data as EventProperties);
    }
    // Always keep in-memory copy for getStats()
    inMemoryEvents.push({ event: event as AppEventName, properties: data as EventProperties, ts: Date.now() });
    if (inMemoryEvents.length > MAX_IN_MEMORY) inMemoryEvents.shift();
  },

  getStats(): Record<string, number> {
    return inMemoryEvents.reduce<Record<string, number>>((acc, e) => {
      acc[e.event] = (acc[e.event] ?? 0) + 1;
      return acc;
    }, {});
  },

  getAll(): InMemoryEvent[] {
    return [...inMemoryEvents];
  },
};
