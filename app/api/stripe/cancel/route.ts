// ============================================================
// POST /api/stripe/cancel
// Schedules the subscription to cancel at the end of the
// current billing period. Does NOT cancel immediately.
// The child keeps access until the period ends.
// ============================================================

import { NextRequest, NextResponse }  from 'next/server';
import { createServerClient }         from '@supabase/ssr';
import { cookies }                    from 'next/headers';
import { getStripe, isStripeConfigured } from '@/lib/server/stripe-config';
import { createClient }               from '@supabase/supabase-js';
import { cancelSubscriptionAtPeriodEnd, reactivateSubscription } from '@/lib/server/stripe-sync';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured.' }, { status: 503 });
  }

  const { action } = await req.json().catch(() => ({ action: 'cancel' }));

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

  // ── Get subscription ID ───────────────────────────────────
  const svc = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: sub } = await svc
    .from('subscriptions')
    .select('stripe_subscription_id, status')
    .eq('parent_id', user.id)
    .single();

  if (!sub?.stripe_subscription_id) {
    return NextResponse.json({ error: 'No active subscription found.' }, { status: 404 });
  }

  try {
    let result;
    if (action === 'reactivate') {
      result = await reactivateSubscription(sub.stripe_subscription_id);
      return NextResponse.json({
        success: true,
        message: 'Subscription reactivated! You will continue to be billed normally.',
        cancelAtPeriodEnd: false,
      });
    } else {
      result = await cancelSubscriptionAtPeriodEnd(sub.stripe_subscription_id);
      // current_period_end is a Unix timestamp number in the Stripe SDK
      const rawEnd = (result as unknown as { current_period_end?: number }).current_period_end;
      const periodEnd = rawEnd
        ? new Date(rawEnd * 1000).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
          })
        : 'the end of your billing period';

      return NextResponse.json({
        success: true,
        message: `Subscription will cancel on ${periodEnd}. You keep full access until then.`,
        cancelAtPeriodEnd: true,
        periodEnd,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cancellation failed';
    console.error('[/api/stripe/cancel]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
