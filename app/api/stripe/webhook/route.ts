// ============================================================
// POST /api/stripe/webhook
// Receives and processes all Stripe webhook events.
// Verifies signature using STRIPE_WEBHOOK_SECRET.
// Updates Supabase subscription table on every event.
//
// Stripe events handled:
//   checkout.session.completed
//   customer.subscription.created
//   customer.subscription.updated
//   customer.subscription.deleted
//   invoice.payment_succeeded
//   invoice.payment_failed
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, STRIPE_WEBHOOK_SECRET } from '@/lib/server/stripe-config';
import { syncSubscriptionFromStripe, syncCustomerId } from '@/lib/server/stripe-sync';

export const runtime = 'nodejs';

// Raw body required for Stripe signature verification
export async function POST(req: NextRequest) {
  // ── Read raw body ─────────────────────────────────────────
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  // ── Validate webhook secret configured ───────────────────
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // ── Verify Stripe signature ───────────────────────────────
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Webhook] Signature verification failed:', message);
    return NextResponse.json({ error: `Webhook signature invalid: ${message}` }, { status: 400 });
  }

  console.log(`[Webhook] Processing event: ${event.type} (${event.id})`);

  // ── Handle events ─────────────────────────────────────────
  try {
    switch (event.type) {

      // ── Checkout completed ──────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Subscription is created by Stripe — the subscription.created event
        // will handle the actual sync. Just log here.
        const parentId = session.metadata?.parent_id;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        if (parentId && customerId) {
          await syncCustomerId(parentId, customerId);
        }
        console.log(`[Webhook] Checkout completed: parent=${parentId}`);
        break;
      }

      // ── Subscription created or updated ────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        // Ensure parent_id is in metadata (set during checkout)
        if (!subscription.metadata?.parent_id) {
          // Try to get it from customer metadata
          const stripe = getStripe();
          const customer = await stripe.customers.retrieve(
            typeof subscription.customer === 'string'
              ? subscription.customer
              : subscription.customer.id
          ) as Stripe.Customer;
          if (customer.metadata?.parent_id) {
            subscription.metadata = {
              ...subscription.metadata,
              parent_id: customer.metadata.parent_id,
            };
          }
        }
        await syncSubscriptionFromStripe(subscription);
        break;
      }

      // ── Subscription deleted / cancelled ───────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionFromStripe(subscription);
        console.log(`[Webhook] Subscription deleted: ${subscription.id}`);
        break;
      }

      // ── Invoice payment succeeded ───────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Subscription status already handled by subscription.updated
        // Just log for billing records
        const amount   = (invoice.amount_paid / 100).toFixed(2);
        const parentId = (invoice as any).subscription_details?.metadata?.parent_id ?? (invoice as any).metadata?.parent_id ?? 'unknown';
        console.log(`[Webhook] Payment succeeded: $${amount} for parent=${parentId}`);
        break;
      }

      // ── Invoice payment failed ──────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // Subscription will be updated to past_due/unpaid by Stripe
        // which triggers subscription.updated above
        const parentId = (invoice as any).subscription_details?.metadata?.parent_id ?? (invoice as any).metadata?.parent_id ?? 'unknown';
        console.warn(`[Webhook] Payment FAILED for parent=${parentId}`);
        // Future: send email notification to parent
        break;
      }

      // ── Ignore all other events ────────────────────────
      default:
        // Return 200 to acknowledge receipt (Stripe will retry if not 2xx)
        break;
    }

    return NextResponse.json({ received: true, type: event.type });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Handler error';
    console.error(`[Webhook] Handler error for ${event.type}:`, message);
    // Return 500 so Stripe retries the event
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
