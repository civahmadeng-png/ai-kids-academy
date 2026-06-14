// ============================================================
// POST /api/stripe/checkout
// Creates a Stripe Checkout Session and returns the URL.
// The client redirects to Stripe's hosted checkout page.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient }        from '@supabase/ssr';
import { cookies }                   from 'next/headers';
import {
  getStripe, getPriceId, getAppUrl, isStripeConfigured,
} from '@/lib/server/stripe-config';
import { getOrCreateCustomer } from '@/lib/server/stripe-sync';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // ── Stripe configured? ────────────────────────────────────
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local.' },
      { status: 503 }
    );
  }

  // ── Parse request ─────────────────────────────────────────
  let body: { plan: string; billing: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { plan, billing } = body;

  if (!['premium', 'family'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan. Must be premium or family.' }, { status: 400 });
  }
  if (!['monthly', 'yearly'].includes(billing)) {
    return NextResponse.json({ error: 'Invalid billing. Must be monthly or yearly.' }, { status: 400 });
  }

  // ── Get authenticated user (server-side) ──────────────────
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

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated. Please sign in first.' }, { status: 401 });
  }

  // ── Get parent email and name ─────────────────────────────
  const email    = user.email ?? '';
  const fullName = user.user_metadata?.full_name ?? email.split('@')[0];

  try {
    const stripe     = getStripe();
    const priceId    = getPriceId(plan as 'premium' | 'family', billing as 'monthly' | 'yearly');
    const appUrl     = getAppUrl();
    const customerId = await getOrCreateCustomer(user.id, email, fullName);

    // ── Create Checkout Session ───────────────────────────
    const session = await stripe.checkout.sessions.create({
      customer:             customerId,
      payment_method_types: ['card'],
      mode:                 'subscription',
      line_items: [{
        price:    priceId,
        quantity: 1,
      }],

      // 7-day free trial
      subscription_data: {
        trial_period_days: 7,
        metadata: { parent_id: user.id },
      },

      // Redirect URLs
      success_url: `${appUrl}/?checkout=success&plan=${plan}`,
      cancel_url:  `${appUrl}/upgrade?checkout=cancelled`,

      // Pre-fill customer details
      customer_email: customerId ? undefined : email,

      // Allow promo codes
      allow_promotion_codes: true,

      // Metadata for webhook
      metadata: {
        parent_id: user.id,
        plan,
        billing,
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout session creation failed';
    console.error('[/api/stripe/checkout]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
