// ============================================================
// AI Kids Academy — Stripe Server Configuration
// SERVER-SIDE ONLY — never imported by client components
// All secrets read from environment variables only
// ============================================================

import Stripe from 'stripe';

// ── Singleton Stripe client ───────────────────────────────────
// Lazily created so missing key doesn't crash the server at startup
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  _stripe = new Stripe(key, {
    apiVersion: '2026-05-27.dahlia' as any,
    appInfo: { name: 'AI Kids Academy', version: '1.0.0' },
  });
  return _stripe;
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';

// ── Price IDs (set in Stripe dashboard, stored as env vars) ──
// Monthly prices
export const PRICE_IDS = {
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? '',
  premium_yearly:  process.env.STRIPE_PRICE_PREMIUM_YEARLY  ?? '',
  family_monthly:  process.env.STRIPE_PRICE_FAMILY_MONTHLY  ?? '',
  family_yearly:   process.env.STRIPE_PRICE_FAMILY_YEARLY   ?? '',
} as const;

export type StripePriceKey = keyof typeof PRICE_IDS;

// ── Plan → Price ID mapper ────────────────────────────────────
export function getPriceId(plan: 'premium' | 'family', billing: 'monthly' | 'yearly'): string {
  const key: StripePriceKey = `${plan}_${billing}`;
  const id = PRICE_IDS[key];
  if (!id) throw new Error(`Stripe price ID not configured for: ${key}. Set ${`STRIPE_PRICE_${plan.toUpperCase()}_${billing.toUpperCase()}`} in .env.local`);
  return id;
}

// ── Price ID → Plan mapper (used by webhook) ─────────────────
export function planFromPriceId(priceId: string): 'premium' | 'family' | null {
  if ([PRICE_IDS.premium_monthly, PRICE_IDS.premium_yearly].includes(priceId)) return 'premium';
  if ([PRICE_IDS.family_monthly,  PRICE_IDS.family_yearly].includes(priceId))  return 'family';
  return null;
}

// ── Stripe is configured check ────────────────────────────────
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

// ── App URL helper ────────────────────────────────────────────
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}
