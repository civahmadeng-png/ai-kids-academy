'use client';
// ============================================================
// AI Kids Academy — Frontend Stripe Client (Step 8)
// All Stripe API calls go through /api/stripe/* routes.
// No Stripe secret keys ever reach the browser.
// Only the public key (NEXT_PUBLIC_STRIPE_PUB_KEY) is safe
// to expose, and we only need it for future Elements integration.
// ============================================================

export type BillingInterval = 'monthly' | 'yearly';

export interface CheckoutResult {
  url?: string;
  error?: string;
}

export interface PortalResult {
  url?: string;
  error?: string;
}

export interface CancelResult {
  success?: boolean;
  message?: string;
  cancelAtPeriodEnd?: boolean;
  periodEnd?: string;
  error?: string;
}

export interface SubscriptionStatus {
  plan:                 'free' | 'premium' | 'family';
  status:               string;
  stripeSubscriptionId: string | null;
  cancelAtPeriodEnd:    boolean;
  currentPeriodEnd:     string | null;
  trialEndsAt:          string | null;
  maxChildren?:         number;
  aiCallsPerDay?:       number;
}

// ── Create checkout session and redirect ─────────────────────
export async function startCheckout(
  plan: 'premium' | 'family',
  billing: BillingInterval
): Promise<CheckoutResult> {
  try {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, billing }),
    });

    const data = await res.json();

    if (!res.ok) return { error: data.error ?? 'Checkout failed. Please try again.' };
    if (!data.url) return { error: 'No checkout URL returned.' };

    // Redirect to Stripe Checkout
    window.location.href = data.url;
    return { url: data.url };

  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Network error. Please check your connection.' };
  }
}

// ── Open Stripe Customer Portal ───────────────────────────────
export async function openCustomerPortal(): Promise<PortalResult> {
  try {
    const res  = await fetch('/api/stripe/portal', { method: 'POST' });
    const data = await res.json();

    if (!res.ok) return { error: data.error ?? 'Could not open billing portal.' };
    if (!data.url) return { error: 'No portal URL returned.' };

    window.location.href = data.url;
    return { url: data.url };

  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Network error.' };
  }
}

// ── Cancel subscription ───────────────────────────────────────
export async function cancelSubscription(): Promise<CancelResult> {
  try {
    const res  = await fetch('/api/stripe/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? 'Cancellation failed.' };
    return data;
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Network error.' };
  }
}

// ── Reactivate subscription ───────────────────────────────────
export async function reactivateSubscription(): Promise<CancelResult> {
  try {
    const res  = await fetch('/api/stripe/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reactivate' }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? 'Reactivation failed.' };
    return data;
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Network error.' };
  }
}

// ── Fetch subscription status (call after checkout redirect) ──
export async function fetchSubscriptionStatus(): Promise<SubscriptionStatus | null> {
  try {
    const res = await fetch('/api/stripe/status');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Format date for display ───────────────────────────────────
export function formatPeriodEnd(isoDate: string | null): string {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

// ── Is Stripe configured? (for UI conditional rendering) ──────
export const STRIPE_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUB_KEY);
