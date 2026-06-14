// ============================================================
// GET /api/stripe/status
// Returns the current subscription status for the
// authenticated parent. Used to sync plan state after
// returning from Stripe checkout or portal.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient }        from '@supabase/ssr';
import { cookies }                   from 'next/headers';
import { createClient }              from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  // ── Read from Supabase ────────────────────────────────────
  // Use anon key (RLS allows parent to read own subscription)
  const { data: sub, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('parent_id', user.id)
    .single();

  if (error || !sub) {
    // No subscription row = free plan
    return NextResponse.json({
      plan: 'free',
      status: 'active',
      stripeSubscriptionId: null,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
      trialEndsAt: null,
    });
  }

  return NextResponse.json({
    plan:                 sub.plan,
    status:               sub.status,
    stripeSubscriptionId: sub.stripe_subscription_id,
    cancelAtPeriodEnd:    false, // Fetched from Stripe if needed
    currentPeriodEnd:     sub.current_period_end,
    trialEndsAt:          sub.trial_ends_at,
    maxChildren:          sub.max_children,
    aiCallsPerDay:        sub.ai_calls_per_day,
  });
}
