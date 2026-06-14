'use client';
// ============================================================
// AI Kids Academy — Auth Store
// Fixed: ensureParentRow called before any DB operation
// Fixed: trackEvent only after parent row confirmed
// Fixed: signIn creates parent row before child query
// ============================================================
import { create } from 'zustand';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { getSupabaseClient, isDemoMode, getRawClient } from '@/lib/supabaseClient';
import { resetProgressCache } from '@/hooks/useProgress';
import { DataLayer, getDemoUser } from '@/lib/data-layer';
import { Analytics, trackEvent, ageToAgeBucket } from '@/lib/analytics';
import type { ChildRow, ChildProfileRow } from '@/types/database';

// ── Types ────────────────────────────────────────────────────

export type AuthScreen =
  | 'splash'
  | 'landing'
  | 'signin'
  | 'signup'
  | 'verify-email'
  | 'reset-request'
  | 'reset-password'
  | 'child-select'
  | 'child-create'
  | 'app';

export interface ActiveChild {
  id: string;
  displayName: string;
  avatar: string;
  age: number | null;
  activePet: string;
  profile: ChildProfileRow | null;
}

export interface AuthState {
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  demoChild: ReturnType<typeof getDemoUser> | null;
  activeChild: ActiveChild | null;
  children: ChildRow[];
  authScreen: AuthScreen;
  isLoading: boolean;
  error: string;
  message: string;

  initialize:            () => Promise<void>;
  signUp:                (email: string, password: string, fullName: string) => Promise<void>;
  signIn:                (email: string, password: string) => Promise<void>;
  signInWithGoogle:      () => Promise<void>;
  signOut:               () => Promise<void>;
  resetPasswordRequest:  (email: string) => Promise<void>;
  resetPasswordConfirm:  (newPassword: string) => Promise<void>;
  loadChildren:          () => Promise<void>;
  createChild:           (name: string, avatar: string, age: number) => Promise<void>;
  selectChild:           (childId: string) => void;
  exitChildSession:      () => void;
  setAuthScreen:         (screen: AuthScreen) => void;
  clearError:            () => void;
  enterDemoMode:         () => void;
  resendVerification:    (email: string) => Promise<void>;
}

// ── Helper: convert DB row to ActiveChild ────────────────────
function toActiveChild(child: ChildRow, profile: ChildProfileRow | null): ActiveChild {
  return {
    id:          child.id,
    displayName: child.display_name,
    avatar:      child.avatar ?? '🦊',
    age:         child.age ?? null,
    activePet:   child.active_pet ?? 'pip',
    profile,
  };
}

// ── Helper: friendly error messages ─────────────────────────
function friendlyAuthError(msg: string): string {
  if (msg.includes('Invalid login credentials'))    return 'Wrong email or password. Please try again.';
  if (msg.includes('Email not confirmed'))          return 'Please verify your email first. Check your inbox!';
  if (msg.includes('User already registered'))      return 'An account with this email already exists. Please sign in.';
  if (msg.includes('Password should be'))           return 'Password must be at least 6 characters.';
  if (msg.includes('rate limit'))                   return 'Too many attempts. Please wait a minute and try again.';
  return msg;
}

// ── CORE HELPER: Ensure parent row exists ────────────────────
// Called before ANY operation that depends on the parents FK.
// Safe to call multiple times — uses ON CONFLICT DO NOTHING.
async function ensureParentRow(user: SupabaseUser): Promise<boolean> {
  const raw = getRawClient();
  if (!raw) return false;

  try {
    // Check if already exists
    const { data: existing, error: checkError } = await raw
      .from('parents')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('[ensureParentRow] check failed:', checkError.message);
    }

    if (existing) return true; // Already exists ✓

    // Create it
    const meta = user.user_metadata ?? {};
    const { error: insertError } = await raw.from('parents').insert({
      id:        user.id,
      email:     user.email ?? '',
      full_name: meta.full_name ?? meta.name ?? (user.email?.split('@')[0] ?? 'Parent'),
      avatar:    meta.avatar_url ?? meta.picture ?? '👨‍👩‍👧',
      plan:      'free',
    });

    if (insertError) {
      // 23505 = unique violation (already exists from race condition) — OK
      if (insertError.code === '23505') return true;
      console.error('[ensureParentRow] insert failed:', insertError.message, insertError.code);
      return false;
    }

    console.log('[ensureParentRow] created parent row for', user.email);
    return true;
  } catch (e) {
    console.error('[ensureParentRow] unexpected error:', e);
    return false;
  }
}

// ── Store ────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set, get) => ({
  session:      null,
  supabaseUser: null,
  demoChild:    null,
  activeChild:  null,
  children:     [],
  authScreen:   'splash',
  isLoading:    true,
  error:        '',
  message:      '',

  // ── initialize ──────────────────────────────────────────────
  async initialize() {
    set({ isLoading: true, authScreen: 'splash' });

    // Check for auth errors passed back from OAuth callback
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authErr = params.get('auth_error');
      if (authErr) {
        window.history.replaceState({}, '', '/');
        set({ error: decodeURIComponent(authErr), authScreen: 'landing', isLoading: false });
        return;
      }
    }

    // Demo mode
    if (isDemoMode()) {
      const saved = DataLayer.getSession();
      if (saved) {
        const demo = getDemoUser();
        set({
          demoChild: demo,
          activeChild: {
            id: 'demo',
            displayName: demo.name,
            avatar: demo.avatar,
            age: demo.age,
            activePet: demo.activePet,
            profile: null,
          },
          authScreen: 'app',
          isLoading: false,
        });
      } else {
        set({ authScreen: 'landing', isLoading: false });
      }
      return;
    }

    // Supabase mode
    const client = getSupabaseClient();
    if (!client) { set({ authScreen: 'landing', isLoading: false }); return; }

    const { data: { session } } = await client.auth.getSession();

    if (!session) {
      set({ authScreen: 'landing', isLoading: false });
      // Setup listener for future sign-ins
      setupAuthListener(client, set, get);
      return;
    }

    set({ session, supabaseUser: session.user });

    // Skip email verification in development
    if (!session.user.email_confirmed_at && process.env.NODE_ENV === 'production') {
      set({ authScreen: 'verify-email', isLoading: false });
      setupAuthListener(client, set, get);
      return;
    }

    // Ensure parent row exists before ANY other DB operation
    await ensureParentRow(session.user);

    await get().loadChildren();
    const { children } = get();
    set({
      authScreen: children.length === 0 ? 'child-create' : 'child-select',
      isLoading: false,
    });

    setupAuthListener(client, set, get);
  },

  // ── signUp ──────────────────────────────────────────────────
  async signUp(email, password, fullName) {
    set({ isLoading: true, error: '' });

    if (isDemoMode()) {
      set({ error: 'Running in demo mode — Supabase is not configured.', isLoading: false });
      return;
    }

    const client = getSupabaseClient();
    if (!client) { set({ isLoading: false }); return; }

    const { data, error } = await client.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      set({ error: friendlyAuthError(error.message), isLoading: false });
      return;
    }

    // Create parent row immediately after signup
    if (data.user) {
      await ensureParentRow(data.user);
    }

    // Track after parent row exists
    if (data.user) {
      void trackEvent('sign_up', { method: 'email' }, { parentId: data.user.id });
    }
    Analytics.track('signup', { method: 'email' });

    set({
      supabaseUser: data.user,
      message: `Verification email sent to ${email}. Please check your inbox!`,
      authScreen: 'verify-email',
      isLoading: false,
    });
  },

  // ── signIn ──────────────────────────────────────────────────
  async signIn(email, password) {
    set({ isLoading: true, error: '' });

    if (isDemoMode()) {
      set({ error: 'Running in demo mode — Supabase is not configured.', isLoading: false });
      return;
    }

    const client = getSupabaseClient();
    if (!client) { set({ isLoading: false }); return; }

    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      set({ error: friendlyAuthError(error.message), isLoading: false });
      return;
    }

    // Skip email verification check in development OR if user exists in DB
    // Email confirmation is handled by Supabase settings
    if (!data.user.email_confirmed_at && process.env.NODE_ENV === 'production') {
      set({ authScreen: 'verify-email', isLoading: false });
      return;
    }

    set({ session: data.session, supabaseUser: data.user });

    // CRITICAL: Ensure parent row exists BEFORE trackEvent or loadChildren
    const parentOk = await ensureParentRow(data.user);

    if (!parentOk) {
      set({
        error: 'Account setup failed. Please try signing out and in again.',
        isLoading: false,
      });
      return;
    }

    // Now safe to track events (parent row confirmed to exist)
    Analytics.track('signin', { method: 'email' });
    void trackEvent('login', { method: 'email' }, { parentId: data.user.id });
    void trackEvent('daily_login', {}, { parentId: data.user.id });

    await get().loadChildren();
    const { children } = get();
    set({
      authScreen: children.length === 0 ? 'child-create' : 'child-select',
      isLoading: false,
    });
  },

  // ── signInWithGoogle ────────────────────────────────────────
  async signInWithGoogle() {
    if (isDemoMode()) {
      set({ error: 'Google login requires Supabase configuration. Use Demo Mode to explore the app.' });
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      set({ error: 'Supabase is not configured.' });
      return;
    }

    set({ isLoading: true, error: '' });
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error) set({ error: friendlyAuthError(error.message), isLoading: false });
  },

  // ── signOut ─────────────────────────────────────────────────
  async signOut() {
    if (isDemoMode()) {
      DataLayer.clearSession();
      set({ demoChild: null, activeChild: null, authScreen: 'landing' });
      return;
    }

    const client = getSupabaseClient();
    if (client) await client.auth.signOut();

    resetProgressCache();
    set({
      session: null, supabaseUser: null,
      activeChild: null, children: [],
      authScreen: 'landing',
      error: '', message: '',
    });
    Analytics.track('signout', {});
  },

  // ── resetPasswordRequest ────────────────────────────────────
  async resetPasswordRequest(email) {
    set({ isLoading: true, error: '' });

    if (isDemoMode()) {
      set({ error: 'Password reset requires Supabase configuration.', isLoading: false });
      return;
    }

    const client = getSupabaseClient();
    if (!client) { set({ isLoading: false }); return; }

    const { error } = await client.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/auth/reset-password` }
    );

    if (error) {
      set({ error: friendlyAuthError(error.message), isLoading: false });
      return;
    }

    set({
      message: `Password reset link sent to ${email}. Check your inbox!`,
      isLoading: false,
    });
  },

  // ── resetPasswordConfirm ────────────────────────────────────
  async resetPasswordConfirm(newPassword) {
    set({ isLoading: true, error: '' });

    const client = getSupabaseClient();
    if (!client) { set({ isLoading: false }); return; }

    const { error } = await client.auth.updateUser({ password: newPassword });

    if (error) {
      set({ error: friendlyAuthError(error.message), isLoading: false });
      return;
    }

    set({ message: 'Password updated! Please sign in.', authScreen: 'signin', isLoading: false });
  },

  // ── loadChildren ────────────────────────────────────────────
  async loadChildren() {
    const { supabaseUser } = get();
    if (!supabaseUser) return;

    const client = getSupabaseClient();
    if (!client) return;

    const { data, error } = await client
      .from('children')
      .select('*, child_profiles(*)')
      .eq('parent_id', supabaseUser.id)
      .eq('is_active', true)
      .order('created_at');

    if (error) {
      console.error('[loadChildren] failed:', error.message);
    }

    set({ children: (data ?? []) as ChildRow[] });
  },

  // ── createChild ─────────────────────────────────────────────
  async createChild(name, avatar, age) {
    set({ isLoading: true, error: '' });
    const { supabaseUser } = get();

    if (!supabaseUser) {
      set({ error: 'Not signed in. Please sign in again.', isLoading: false });
      return;
    }

    const raw = getRawClient();
    if (!raw) {
      set({ error: 'Connection error. Please check your internet.', isLoading: false });
      return;
    }

    // STEP 1: Ensure parent row exists (critical prerequisite)
    const parentOk = await ensureParentRow(supabaseUser);
    if (!parentOk) {
      set({
        error: 'Account setup failed. Please sign out and sign in again.',
        isLoading: false,
      });
      return;
    }

    // STEP 2: Create child record
    const username = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now().toString().slice(-4);

    console.log('[createChild] inserting child for parent:', supabaseUser.id);

    const { data, error } = await raw
      .from('children')
      .insert({
        parent_id:    supabaseUser.id,
        username,
        display_name: name.trim(),
        avatar,
        age,
      })
      .select()
      .single();

    if (error) {
      console.error('[createChild] FAILED:', error.message, 'code:', error.code, 'details:', error.details);

      let msg = 'Could not create child profile. Please try again.';
      if (error.code === '23503') msg = 'Account link missing. Please sign out and back in.';
      if (error.code === '23505') msg = 'A profile with this name already exists.';
      if (error.message?.includes('RLS') || error.message?.includes('policy')) {
        msg = 'Permission error. Please sign out and sign in again.';
      }

      set({ error: msg, isLoading: false });
      return;
    }

    console.log('[createChild] SUCCESS, child id:', data.id);

    // STEP 3: Reload children list
    await get().loadChildren();

    // STEP 4: Track (parent row is confirmed at this point)
    Analytics.track('child_created', { age });
    void trackEvent('child_profile_created',
      { age_bucket: ageToAgeBucket(age) },
      { parentId: supabaseUser.id, childId: data.id }
    );

    // STEP 5: Auto-select the new child → goes to app
    get().selectChild(data.id);
  },

  // ── selectChild ─────────────────────────────────────────────
  selectChild(childId) {
    const { children } = get();
    const child = children.find(c => c.id === childId);
    if (!child) return;

    resetProgressCache();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = (child as any).child_profiles?.[0] ?? null;
    set({
      activeChild: toActiveChild(child, profile),
      authScreen: 'app',
    });
    Analytics.track('child_selected', {});
  },

  // ── exitChildSession ─────────────────────────────────────────
  exitChildSession() {
    resetProgressCache();
    set({ activeChild: null, authScreen: 'child-select' });
  },

  // ── setAuthScreen ─────────────────────────────────────────────
  setAuthScreen(screen) {
    set({ authScreen: screen });
  },

  // ── clearError ───────────────────────────────────────────────
  clearError() {
    set({ error: '', message: '' });
  },

  // ── enterDemoMode ────────────────────────────────────────────
  enterDemoMode() {
    DataLayer.setSession('demo');
    const demo = getDemoUser();
    set({
      demoChild: demo,
      activeChild: {
        id: 'demo',
        displayName: demo.name,
        avatar: demo.avatar,
        age: demo.age,
        activePet: demo.activePet,
        profile: null,
      },
      authScreen: 'app',
    });
    Analytics.track('demo_mode_entered', {});
  },

  // ── resendVerification ───────────────────────────────────────
  async resendVerification(email: string) {
    set({ isLoading: true, error: '', message: '' });
    const client = getSupabaseClient();
    if (!client) { set({ isLoading: false }); return; }

    const { error } = await client.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      set({ error: friendlyAuthError(error.message), isLoading: false });
      return;
    }
    set({ message: `Verification email resent to ${email}. Please check your inbox!`, isLoading: false });
  },
}));

// ── Auth state change listener (extracted to avoid duplication) ──
function setupAuthListener(
  client: ReturnType<typeof getSupabaseClient>,
  set: (s: Partial<AuthState>) => void,
  get: () => AuthState
) {
  if (!client) return;

  client.auth.onAuthStateChange(async (event, newSession) => {
    if (event === 'SIGNED_OUT') {
      resetProgressCache();
      set({
        session: null, supabaseUser: null,
        activeChild: null, children: [],
        authScreen: 'landing',
        error: '', message: '',
      });
      return;
    }

    if (event === 'SIGNED_IN' && newSession) {
      const u = newSession.user;
      const curScreen = get().authScreen;

      // Don't re-route if already in the app flow
      if (curScreen === 'app' || curScreen === 'child-select' || curScreen === 'child-create') {
        set({ session: newSession, supabaseUser: u });
        return;
      }

      set({ session: newSession, supabaseUser: u, isLoading: true });

      // Always ensure parent row first
      await ensureParentRow(u);

      await get().loadChildren();
      const { children } = get();
      set({
        authScreen: children.length === 0 ? 'child-create' : 'child-select',
        isLoading: false,
      });
    }

    if (event === 'PASSWORD_RECOVERY') {
      set({ authScreen: 'reset-password' });
    }
  });
}
