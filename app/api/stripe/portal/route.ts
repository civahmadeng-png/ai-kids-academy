// ============================================================
// POST /api/stripe/portal
// Creates a Stripe Customer Portal session.
// Redirects the parent to Stripe's hosted self-service page
// where they can: update payment, change plan, cancel, etc.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient }        from '@supabase/ssr';
import { cookies }                   from 'next/headers';
import { getStripe, getAppUrl, isStripeConfigured } from '@/lib/server/stripe-config';
import { createClient }              from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Stripe is not configured.' },
      { status: 503 }
    );
  }

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
          catch { /* server component */ }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  // ── Get Stripe customer ID from parent row ────────────────
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: parent } = await serviceClient
    .from('parents')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!parent?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No Stripe customer found. Please subscribe first.' },
      { status: 404 }
    );
  }

  try {
    const stripe  = getStripe();
    const appUrl  = getAppUrl();
    const session = await stripe.billingPortal.sessions.create({
      customer:   parent.stripe_customer_id,
      return_url: `${appUrl}/upgrade?from=portal`,
    });

    return NextResponse.json({ url: session.url });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Portal creation failed';
    console.error('[/api/stripe/portal]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
