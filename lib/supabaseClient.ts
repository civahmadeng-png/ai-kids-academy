'use client';
// ============================================================
// AI Kids Academy — Supabase Client
//
// DEMO MODE: If NEXT_PUBLIC_SUPABASE_URL is not set,
// all Supabase calls are silently skipped and the app
// falls back to localStorage (DataLayer in data-layer.ts).
//
// This means the frontend works identically with or without
// Supabase configured — perfect for development and demos.
//
// To activate Supabase:
//   1. Create a project at supabase.com
//   2. Run supabase/schema.sql
//   3. Run supabase/rls-policies.sql
//   4. Run supabase/seed.sql
//   5. Add keys to .env.local (see .env.example)
// ============================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// ── Singleton client ─────────────────────────────────────────
// Typed client for reads, untyped for mutations (avoids complex generic conflicts)
let _client: SupabaseClient<Database> | null = null;

const clientOptions = {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
};

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseAnon) return null;
  if (_client) return _client;
  _client = createClient<Database>(supabaseUrl, supabaseAnon, clientOptions);
  return _client;
}

// Raw (untyped) client — reuses the SAME singleton as getSupabaseClient()
// This prevents the "Multiple GoTrueClient instances" warning.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRawClient(): SupabaseClient<any> | null {
  return getSupabaseClient() as SupabaseClient<any> | null;
}

// Convenience: typed supabase instance or null
export const supabase = getSupabaseClient();

// ── Mode helpers ─────────────────────────────────────────────
export const isSupabaseEnabled = (): boolean =>
  Boolean(supabaseUrl && supabaseAnon);

export const isDemoMode = (): boolean => !isSupabaseEnabled();

// ── Auth helpers ─────────────────────────────────────────────
export const SupabaseAuth = {
  async signUp(email: string, password: string, fullName: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return { user: null, error: new Error('Demo mode — Supabase not configured') };

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { user: data.user, error };
  },

  async signIn(email: string, password: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return { user: null, error: new Error('Demo mode') };

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    return { user: data.user, error };
  },

  async signOut() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return;
    await client.auth.signOut();
  },

  async getSession() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session;
  },

  async getUser() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null;
    const { data } = await client.auth.getUser();
    return data.user;
  },
};

// ── Parent helpers ────────────────────────────────────────────
export const SupabaseParents = {
  async get(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null;
    const { data } = await client.from('parents').select('*').eq('id', id).single();
    return data;
  },

  async upsert(parent: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null;
    const { data, error } = await client.from('parents').upsert(parent).select().single();
    if (error) console.error('[Supabase] upsert parent:', error.message);
    return data;
  },
};

// ── Children helpers ──────────────────────────────────────────
export const SupabaseChildren = {
  async listByParent(parentId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return [];
    const { data } = await client
      .from('children')
      .select('*, child_profiles(*)')
      .eq('parent_id', parentId)
      .eq('is_active', true)
      .order('created_at');
    return data ?? [];
  },

  async create(child: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null;
    const { data, error } = await client.from('children').insert(child).select().single();
    if (error) console.error('[Supabase] create child:', error.message);
    return data;
  },

  async updateProfile(
    childId: string,
    updates: Record<string, unknown>
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null;
    const { data, error } = await client
      .from('child_profiles')
      .update(updates)
      .eq('child_id', childId)
      .select()
      .single();
    if (error) console.error('[Supabase] update profile:', error.message);
    return data;
  },
};

// ── Progress helpers ──────────────────────────────────────────
export const SupabaseProgress = {
  async logCompletion(entry: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null;
    // upsert prevents duplicates for non-repeatable content
    const { data, error } = await client
      .from('progress')
      .upsert(entry, { onConflict: 'child_id,content_type,content_id', ignoreDuplicates: true })
      .select()
      .single();
    if (error) console.error('[Supabase] log progress:', error.message);
    return data;
  },

  async getByChild(childId: string, contentType?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return [];
    let query = client
      .from('progress')
      .select('*')
      .eq('child_id', childId)
      .order('completed_at', { ascending: false });
    if (contentType) query = query.eq('content_type', contentType);
    const { data } = await query;
    return data ?? [];
  },

  async getCompletedIds(childId: string, contentType: string): Promise<string[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return [];
    const { data } = await client
      .from('progress')
      .select('content_id')
      .eq('child_id', childId)
      .eq('content_type', contentType);
    return (data ?? []).map((r: any) => r.content_id);
  },
};

// ── Achievements helpers ──────────────────────────────────────
export const SupabaseAchievements = {
  async awardBadge(badge: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null;
    const { data, error } = await client
      .from('achievements')
      .insert(badge)
      .select()
      .single();
    // Ignore unique constraint violations (badge already earned)
    if (error && error.code !== '23505') {
      console.error('[Supabase] award badge:', error.message);
    }
    return data;
  },

  async getByChild(childId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return [];
    const { data } = await client
      .from('achievements')
      .select('*')
      .eq('child_id', childId)
      .order('earned_at', { ascending: false });
    return data ?? [];
  },
};

// ── Stories helpers ───────────────────────────────────────────
export const SupabaseStories = {
  async save(story: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null;
    const { data, error } = await client.from('stories').insert(story).select().single();
    if (error) console.error('[Supabase] save story:', error.message);
    return data;
  },

  async getByChild(childId: string, limit = 20) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return [];
    const { data } = await client
      .from('stories')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return data ?? [];
  },
};

// ── AI Usage helpers (rate limiting) ─────────────────────────
export const SupabaseAIUsage = {
  async log(entry: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null;
    const { data } = await client.from('ai_usage').insert(entry).select().single();
    return data;
  },

  async getDailyCount(childId: string, feature: string): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return 0; // demo mode: no limits
    const today = new Date().toISOString().split('T')[0];
    const { count } = await client
      .from('ai_usage')
      .select('*', { count: 'exact', head: true })
      .eq('child_id', childId)
      .eq('feature', feature)
      .gte('used_at', `${today}T00:00:00Z`);
    return count ?? 0;
  },

  async isWithinLimit(
    childId: string,
    feature: string,
    dailyLimit: number
  ): Promise<boolean> {
    if (!isSupabaseEnabled()) return true; // demo mode: always allowed
    const count = await SupabaseAIUsage.getDailyCount(childId, feature);
    return count < dailyLimit;
  },
};

// ── Subscriptions helpers ─────────────────────────────────────
export const SupabaseSubscriptions = {
  async getByParent(parentId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null;
    const { data } = await client
      .from('subscriptions')
      .select('*')
      .eq('parent_id', parentId)
      .single();
    return data;
  },
};

// ── Family Missions helpers ───────────────────────────────────
export const SupabaseFamilyMissions = {
  async complete(mission: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null;
    const { data, error } = await client
      .from('family_missions')
      .insert(mission)
      .select()
      .single();
    if (error) console.error('[Supabase] family mission:', error.message);
    return data;
  },

  async getByParent(parentId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return [];
    const { data } = await client
      .from('family_missions')
      .select('*')
      .eq('parent_id', parentId)
      .order('completed_at', { ascending: false });
    return data ?? [];
  },
};


// ── Savings Goals helpers ─────────────────────────────────────
export const SupabaseSavings = {
  async getByChild(childId: string) {
    const client = getRawClient();
    if (!client) return [];
    const { data } = await client
      .from('savings_goals')
      .select('*')
      .eq('child_id', childId)
      .order('created_at');
    return data ?? [];
  },

  async upsertGoals(childId: string, goals: Array<{
    id: string; name: string; emoji: string; target: number; saved: number;
  }>) {
    const client = getRawClient();
    if (!client) return;
    for (const g of goals as Array<{id:string;name:string;emoji:string;target:number;saved:number}>) {
      await client.from('savings_goals').upsert({
        id:       g.id,
        child_id: childId,
        name:     g.name,
        emoji:    g.emoji,
        target:   g.target,
        saved:    g.saved,
        completed_at: g.saved >= g.target ? new Date().toISOString() : null,
      }, { onConflict: 'id' });
    }
  },
};
// ── Catalog helpers (public read-only tables) ─────────────────
export const SupabaseCatalog = {
  async getExperiments() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null; // fallback to local data
    const { data } = await client
      .from('science_experiments')
      .select('*')
      .eq('is_active', true)
      .order('xp_reward');
    return data;
  },

  async getDIYProjects() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null;
    const { data } = await client
      .from('diy_projects')
      .select('*')
      .eq('is_active', true);
    return data;
  },

  async getEngineeringChallenges() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null;
    const { data } = await client
      .from('engineering_challenges')
      .select('*')
      .eq('is_active', true);
    return data;
  },

  async getDiscoveryMissions() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as any;
    if (!client) return null;
    const { data } = await client
      .from('discovery_missions')
      .select('*')
      .eq('is_active', true);
    return data;
  },
};
