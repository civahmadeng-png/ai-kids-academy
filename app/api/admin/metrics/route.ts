// ============================================================
// GET /api/admin/metrics
// Returns aggregated platform metrics for the admin dashboard.
// Protected: only admins (is_admin = TRUE) can call this.
// Uses service role to read across all RLS-protected tables.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient }        from '@supabase/ssr';
import { createClient }              from '@supabase/supabase-js';
import { cookies }                   from 'next/headers';
import { getStripe, isStripeConfigured } from '@/lib/server/stripe-config';

export const runtime = 'nodejs';

// ── Service-role Supabase (bypasses RLS for admin reads) ─────
function getServiceDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── Verify admin role ─────────────────────────────────────────
async function verifyAdmin(req: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch { /* server component */ }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Check is_admin on parent row (uses anon client — RLS allows self-read)
  const { data } = await supabase
    .from('parents')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return data?.is_admin === true ? user.id : null;
}

export async function GET(req: NextRequest) {
  // ── Auth check ────────────────────────────────────────────
  const adminId = await verifyAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 });
  }

  const db = getServiceDb();
  if (!db) {
    return NextResponse.json(
      { error: 'Supabase service role not configured' },
      { status: 503 }
    );
  }

  try {
    // ── Run all queries in parallel ──────────────────────────
    const [
      parentsRes,
      childrenRes,
      subsRes,
      progressRes,
      aiUsageRes,
      recentSignupsRes,
      dailySignupsRes,
      moduleCountsRes,
    ] = await Promise.all([
      // Parent counts by plan
      db.from('parents').select('plan, created_at, is_admin').eq('is_admin', false),

      // Children count
      db.from('children').select('id, created_at').eq('is_active', true),

      // All subscriptions
      db.from('subscriptions').select('plan, status, monthly_price_usd, trial_ends_at, created_at'),

      // Progress by content type
      db.from('progress').select('content_type, completed_at'),

      // AI usage last 30 days by feature
      db.from('ai_usage')
        .select('feature, used_at')
        .gte('used_at', new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()),

      // Recent signups (last 20, no sensitive data)
      db.from('parents')
        .select('id, email, full_name, plan, created_at, last_login')
        .eq('is_admin', false)
        .order('created_at', { ascending: false })
        .limit(20),

      // Daily signups last 30 days
      db.from('parents')
        .select('created_at')
        .eq('is_admin', false)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()),

      // Module completions grouped
      db.from('progress')
        .select('content_type')
        .gte('completed_at', new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()),
    ]);

    const parents       = parentsRes.data ?? [];
    const children      = childrenRes.data ?? [];
    const subs          = subsRes.data ?? [];
    const progress      = progressRes.data ?? [];
    const aiUsage       = aiUsageRes.data ?? [];
    const recentSignups = recentSignupsRes.data ?? [];
    const dailyRaw      = dailySignupsRes.data ?? [];
    const moduleCounts  = moduleCountsRes.data ?? [];

    // ── Subscription breakdown ───────────────────────────────
    const activeSubs  = subs.filter(s => s.status === 'active' || s.status === 'trial');
    const freeSubs    = activeSubs.filter(s => s.plan === 'free').length;
    const premiumSubs = activeSubs.filter(s => s.plan === 'premium').length;
    const familySubs  = activeSubs.filter(s => s.plan === 'family').length;
    const trialSubs   = subs.filter(s => s.status === 'trial').length;
    const cancelledSubs = subs.filter(s => s.status === 'cancelled').length;

    // ── MRR ──────────────────────────────────────────────────
    const mrr = activeSubs
      .filter(s => s.plan !== 'free')
      .reduce((sum, s) => sum + (s.monthly_price_usd ?? 0), 0);

    // ── Daily signups buckets ────────────────────────────────
    const now = Date.now();
    const signups24h = dailyRaw.filter(r =>
      new Date(r.created_at).getTime() > now - 24 * 3600 * 1000).length;
    const signups7d = dailyRaw.filter(r =>
      new Date(r.created_at).getTime() > now - 7 * 24 * 3600 * 1000).length;
    const signups30d = dailyRaw.length;

    // ── Daily signup time series (last 14 days) ──────────────
    const dailySeries = buildDailySeries(dailyRaw.map(r => r.created_at), 14);

    // ── Module popularity ────────────────────────────────────
    const moduleCounts30d = countByKey(moduleCounts.map(r => r.content_type));

    // ── AI feature usage ─────────────────────────────────────
    const aiByFeature = countByKey(aiUsage.map(r => r.feature));

    // ── All-time module counts ────────────────────────────────
    const allTimeModules = countByKey(progress.map(r => r.content_type));

    // ── Stripe revenue (if configured) ───────────────────────
    let stripeRevenue: { monthlyRevenue: number; totalCustomers: number } | null = null;
    if (isStripeConfigured()) {
      try {
        // Confirm Stripe is reachable; detailed revenue lives in the Stripe Dashboard
        await getStripe().balance.retrieve();
        stripeRevenue = { monthlyRevenue: mrr, totalCustomers: premiumSubs + familySubs };
      } catch {
        // Stripe revenue fetch failed — use Supabase estimate
        stripeRevenue = { monthlyRevenue: mrr, totalCustomers: premiumSubs + familySubs };
      }
    }

    return NextResponse.json({
      // Totals
      totalParents:   parents.length,
      totalChildren:  children.length,
      totalUsers:     parents.length + children.length,

      // Subscriptions
      freeSubs, premiumSubs, familySubs, trialSubs, cancelledSubs,
      activePaidSubs: premiumSubs + familySubs,

      // Revenue
      estimatedMRR:    parseFloat(mrr.toFixed(2)),
      estimatedARR:    parseFloat((mrr * 12).toFixed(2)),
      stripeRevenue,

      // Signups
      signups24h, signups7d, signups30d,
      dailySeries,                         // [{ day: 'Jun 1', count: 3 }, ...]

      // Activity
      totalCompletions: progress.length,
      allTimeModules,                      // { science_experiment: 42, ... }
      moduleCounts30d,                     // last 30 days
      aiByFeature,                         // { mentor: 120, story: 45, ... }
      totalAICalls30d: aiUsage.length,

      // Recent signups (no passwords, no sensitive data)
      recentSignups: recentSignups.map(p => ({
        id:        p.id,
        email:     maskEmail(p.email),
        name:      p.full_name,
        plan:      p.plan,
        joinedAt:  p.created_at,
        lastLogin: p.last_login,
      })),

      generatedAt: new Date().toISOString(),
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Metrics query failed';
    console.error('[/api/admin/metrics]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── Helpers ───────────────────────────────────────────────────

function countByKey(arr: string[]): Record<string, number> {
  return arr.reduce<Record<string, number>>((acc, k) => {
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

function buildDailySeries(
  timestamps: string[],
  days: number
): Array<{ day: string; count: number }> {
  const result: Array<{ day: string; count: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dateKey = date.toISOString().split('T')[0];
    const count   = timestamps.filter(ts => ts.startsWith(dateKey)).length;
    result.push({ day: dayStr, count });
  }
  return result;
}

// Email masking: john.doe@example.com → j***@example.com
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${local[0]}***@${domain}`;
}
