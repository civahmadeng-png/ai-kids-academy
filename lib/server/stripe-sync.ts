// ============================================================
// AI Kids Academy — Stripe → Supabase Sync Service
// Called by the webhook handler after every Stripe event.
// Updates the subscriptions table and parent plan field.
// ============================================================

import type Stripe from 'stripe';
import { getStripe, planFromPriceId } from './stripe-config';
import { createClient } from '@supabase/supabase-js';

// ── Service-role Supabase client (bypasses RLS) ───────────────
// Only used server-side for webhook processing
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── Upsert subscription row ───────────────────────────────────
export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription
): Promise<void> {
  const db = getServiceClient();
  if (!db) {
    console.warn('[StripeSync] No Supabase service client — skipping sync');
    return;
  }

  const parentId = subscription.metadata?.parent_id;
  if (!parentId) {
    console.error('[StripeSync] Subscription missing parent_id metadata:', subscription.id);
    return;
  }

  // Get first price item to determine plan
  const priceItem = subscription.items.data[0];
  const priceId   = priceItem?.price?.id ?? '';
  const plan      = planFromPriceId(priceId) ?? 'free';

  // Map Stripe status to our status enum
  const statusMap: Record<string, string> = {
    active:             'active',
    trialing:           'trial',
    canceled:           'cancelled',
    incomplete:         'expired',
    incomplete_expired: 'expired',
    past_due:           'expired',
    unpaid:             'expired',
    paused:             'expired',
  };
  const status = statusMap[subscription.status] ?? 'expired';

  // Use type assertion for cross-version Stripe SDK compatibility
  const s = subscription as any;
  const upsertData = {
    parent_id:             parentId,
    plan:                  status === 'active' || status === 'trial' ? plan : 'free',
    status,
    stripe_subscription_id: subscription.id,
    stripe_price_id:       priceId,
    stripe_product_id:     String(priceItem?.price?.product ?? ''),
    trial_ends_at:         s.trial_end
      ? new Date(s.trial_end * 1000).toISOString()
      : null,
    current_period_start:  s.current_period_start
      ? new Date(s.current_period_start * 1000).toISOString()
      : null,
    current_period_end:    s.current_period_end
      ? new Date(s.current_period_end * 1000).toISOString()
      : null,
    cancelled_at:          s.canceled_at
      ? new Date(s.canceled_at * 1000).toISOString()
      : null,
    max_children:          plan === 'family' ? 5 : 1,
    ai_calls_per_day:      plan === 'free'   ? 5 : 999,
    monthly_price_usd:     (priceItem?.price?.unit_amount ?? 0) / 100,
    updated_at:            new Date().toISOString(),
  };

  // Upsert subscription row
  const { error: subError } = await db
    .from('subscriptions')
    .upsert(upsertData, { onConflict: 'parent_id' });

  if (subError) {
    console.error('[StripeSync] subscriptions upsert error:', subError.message);
    return;
  }

  // Also update the parent row plan field for fast reads
  const { error: parentError } = await db
    .from('parents')
    .update({ plan: upsertData.plan, updated_at: new Date().toISOString() })
    .eq('id', parentId);

  if (parentError) {
    console.error('[StripeSync] parents update error:', parentError.message);
  }

  if (process.env.NODE_ENV === 'development') console.log(`[StripeSync] Synced: parent=${parentId} plan=${upsertData.plan} status=${status}`);
}

// ── Sync customer.id to parent row ───────────────────────────
export async function syncCustomerId(
  parentId: string,
  customerId: string
): Promise<void> {
  const db = getServiceClient();
  if (!db) return;

  const { error } = await db
    .from('parents')
    .update({ stripe_customer_id: customerId })
    .eq('id', parentId);

  if (error) console.error('[StripeSync] syncCustomerId error:', error.message);
}

// ── Get or create Stripe customer for a parent ───────────────
export async function getOrCreateCustomer(
  parentId: string,
  email: string,
  name: string
): Promise<string> {
  const stripe = getStripe();
  const db     = getServiceClient();

  // Check if parent already has a Stripe customer ID
  if (db) {
    const { data } = await db
      .from('parents')
      .select('stripe_customer_id')
      .eq('id', parentId)
      .single();

    if (data?.stripe_customer_id) return data.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { parent_id: parentId },
  });

  // Store customer ID
  await syncCustomerId(parentId, customer.id);
  return customer.id;
}

// ── Cancel subscription at period end ────────────────────────
export async function cancelSubscriptionAtPeriodEnd(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// ── Reactivate cancelled subscription ───────────────────────
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}
