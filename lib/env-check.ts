// ============================================================
// AI Kids Academy — Environment Variable Validation (Step 12)
// Called at server startup. Logs warnings for missing vars.
// Hard-fails only for variables that break core features.
// ============================================================

interface EnvVar {
  key:      string;
  required: boolean;   // if true and missing, logs ERROR (not throw — allows demo mode)
  description: string;
}

const ENV_VARS: EnvVar[] = [
  // AI
  { key:'OPENROUTER_API_KEY',            required:false, description:'AI Mentor, Story, DIY, Science features (fallback responses used if absent)' },
  // Supabase
  { key:'NEXT_PUBLIC_SUPABASE_URL',      required:false, description:'Supabase database URL (demo mode used if absent)' },
  { key:'NEXT_PUBLIC_SUPABASE_ANON_KEY', required:false, description:'Supabase anon key (demo mode used if absent)' },
  { key:'SUPABASE_SERVICE_ROLE_KEY',     required:false, description:'Supabase service role — required for webhooks and admin dashboard' },
  // Stripe
  { key:'STRIPE_SECRET_KEY',             required:false, description:'Stripe payments — upgrade buttons disabled if absent' },
  { key:'STRIPE_WEBHOOK_SECRET',         required:false, description:'Stripe webhook signature verification' },
  { key:'STRIPE_PRICE_PREMIUM_MONTHLY',  required:false, description:'Stripe price ID for Premium Monthly plan' },
  { key:'STRIPE_PRICE_PREMIUM_YEARLY',   required:false, description:'Stripe price ID for Premium Yearly plan' },
  { key:'STRIPE_PRICE_FAMILY_MONTHLY',   required:false, description:'Stripe price ID for Family Monthly plan' },
  { key:'STRIPE_PRICE_FAMILY_YEARLY',    required:false, description:'Stripe price ID for Family Yearly plan' },
  // App
  { key:'NEXT_PUBLIC_APP_URL',           required:false, description:'Public URL — defaults to http://localhost:3000' },
];

export function validateEnv(): { ok: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors:   string[] = [];

  for (const v of ENV_VARS) {
    const val = process.env[v.key];
    if (!val) {
      const msg = `${v.key} is not set — ${v.description}`;
      if (v.required) errors.push(msg);
      else            warnings.push(msg);
    }
  }

  // Log in development only to avoid leaking config to production logs
  if (process.env.NODE_ENV === 'development') {
    if (warnings.length > 0) {
      console.warn('\n⚠️  AI Kids Academy — missing optional env vars:');
      warnings.forEach(w => console.warn(`   • ${w}`));
    }
    if (errors.length > 0) {
      console.error('\n❌  AI Kids Academy — missing required env vars:');
      errors.forEach(e => console.error(`   • ${e}`));
    }
    if (warnings.length === 0 && errors.length === 0) {
      console.log('✅  AI Kids Academy — all environment variables configured');
    }
  }

  return { ok: errors.length === 0, warnings, errors };
}

// Feature-flag helpers (read once at startup)
export const FEATURES = {
  supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  stripe:   Boolean(process.env.STRIPE_SECRET_KEY),
  ai:       Boolean(process.env.OPENROUTER_API_KEY),
} as const;
