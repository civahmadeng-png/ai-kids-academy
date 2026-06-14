'use client';
// ============================================================
// AI Kids Academy — Progress Service (Step 5)
//
// Single source of truth for all child progress.
// Strategy: optimistic local update → async cloud sync.
// Demo/offline: localStorage only, identical UX.
//
// Duplicate-reward protection:
//   Every completion is keyed by (childId, contentType, contentId).
//   Before awarding XP, check completedIds set in memory.
//   Supabase schema has a UNIQUE constraint as the backend guard.
// ============================================================

import { getRawClient, getSupabaseClient, isDemoMode } from '@/lib/supabaseClient';
import { DataLayer }   from '@/lib/data-layer';
import { Analytics }   from '@/lib/analytics';
import type { ContentType, ChildProfileRow, ProgressRow } from '@/types/database';

// ── In-memory completed-ids cache ────────────────────────────
// childId → Set<"contentType:contentId">
const completedCache = new Map<string, Set<string>>();

function cacheKey(contentType: ContentType, contentId: string) {
  return `${contentType}:${contentId}`;
}

export function isAlreadyCompleted(
  childId: string,
  contentType: ContentType,
  contentId: string
): boolean {
  return completedCache.get(childId)?.has(cacheKey(contentType, contentId)) ?? false;
}

function markCompleted(childId: string, contentType: ContentType, contentId: string) {
  if (!completedCache.has(childId)) completedCache.set(childId, new Set());
  completedCache.get(childId)!.add(cacheKey(contentType, contentId));
}

// ── Load child's full progress from Supabase ─────────────────
export async function loadChildProgress(childId: string): Promise<{
  profile:      ChildProfileRow | null;
  completedIds: Record<ContentType, string[]>;
}> {
  // Demo mode — return empty (localStorage handles its own state)
  if (isDemoMode() || childId === 'demo') {
    return { profile: null, completedIds: getEmptyCompletedIds() };
  }

  const client = getSupabaseClient();
  if (!client) return { profile: null, completedIds: getEmptyCompletedIds() };

  try {
    // Load profile and all progress rows in parallel
    const [profileRes, progressRes] = await Promise.all([
      client.from('child_profiles').select('*').eq('child_id', childId).single(),
      client.from('progress').select('content_type,content_id').eq('child_id', childId),
    ]);

    const profile = profileRes.data as ChildProfileRow | null;
    const rows    = (progressRes.data ?? []) as Pick<ProgressRow, 'content_type' | 'content_id'>[];

    // Build completed-id map + populate memory cache
    const completedIds = getEmptyCompletedIds();
    for (const row of rows) {
      const ct = row.content_type as ContentType;
      if (ct in completedIds) {
        (completedIds[ct] as string[]).push(row.content_id);
        markCompleted(childId, ct, row.content_id);
      }
    }

    Analytics.track('progress_loaded', { childId, rowCount: rows.length });
    return { profile, completedIds };

  } catch (err) {
    console.error('[ProgressService] loadChildProgress failed:', err);
    return { profile: null, completedIds: getEmptyCompletedIds() };
  }
}

function getEmptyCompletedIds(): Record<ContentType, string[]> {
  return {
    science_experiment:    [],
    diy_project:           [],
    engineering_challenge: [],
    discovery_mission:     [],
    ai_lesson:             [],
    story:                 [],
    career_exploration:    [],
  };
}

// ── Log a single completion ───────────────────────────────────
export interface CompleteActivityOptions {
  childId:     string;
  contentType: ContentType;
  contentId:   string;
  contentName?: string;
  xpEarned:    number;
  coinsEarned: number;
  score?:      number;
  timeSeconds?: number;
  metadata?:   Record<string, unknown>;
}

export async function completeActivity(opts: CompleteActivityOptions): Promise<boolean> {
  const { childId, contentType, contentId } = opts;

  // ── Duplicate guard (memory check first, fast path) ─────────
  if (isAlreadyCompleted(childId, contentType, contentId)) {
    return false; // already done — no XP awarded
  }

  // Mark locally immediately (optimistic)
  markCompleted(childId, contentType, contentId);

  // ── Demo mode — no cloud sync needed ────────────────────────
  if (isDemoMode() || childId === 'demo') {
    Analytics.track('activity_complete_demo', { contentType, contentId });
    return true;
  }

  // ── Supabase sync ────────────────────────────────────────────
  const raw = getRawClient();
  if (!raw) return true; // optimistic success even if client unavailable

  try {
    // Insert progress row (UNIQUE constraint is the server-side guard)
    const { error: progressError } = await raw.from('progress').insert({
      child_id:     childId,
      content_type: contentType,
      content_id:   contentId,
      content_name: opts.contentName ?? null,
      xp_earned:    opts.xpEarned,
      coins_earned: opts.coinsEarned,
      metadata:     opts.metadata ?? {},
    });

    // 23505 = unique_violation — already completed in DB
    if (progressError && progressError.code !== '23505') {
      console.error('[ProgressService] progress insert:', progressError.message);
    }

    Analytics.track('activity_complete', { contentType, contentId, xpEarned: opts.xpEarned });
    return true;

  } catch (err) {
    console.error('[ProgressService] completeActivity error:', err);
    return true; // optimistic — don't punish the child for network issues
  }
}

// ── Sync profile stats (XP, coins, gems, streak) to Supabase ─
// Debounced — call this after every meaningful change
let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleSyncProfile(childId: string, profile: Partial<ChildProfileRow>) {
  if (isDemoMode() || childId === 'demo') return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => syncProfile(childId, profile), 1500);
}

async function syncProfile(childId: string, profile: Partial<ChildProfileRow>) {
  const raw = getRawClient();
  if (!raw) return;

  try {
    const { error } = await raw
      .from('child_profiles')
      .update(profile)
      .eq('child_id', childId);

    if (error) console.error('[ProgressService] syncProfile error:', error.message);
  } catch (err) {
    console.error('[ProgressService] syncProfile threw:', err);
  }
}

// ── Sync to localStorage for demo / offline ──────────────────
export function syncToLocalStorage(childId: string, updates: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try {
    const key  = `aka_progress_${childId}`;
    const prev = JSON.parse(localStorage.getItem(key) ?? '{}');
    localStorage.setItem(key, JSON.stringify({ ...prev, ...updates }));
  } catch { /* ignore */ }
}

export function loadFromLocalStorage(childId: string): Record<string, unknown> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(`aka_progress_${childId}`) ?? '{}');
  } catch {
    return {};
  }
}
