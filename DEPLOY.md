# Deployment Guide — AI Kids Academy

## Prerequisites

- Node.js 18+
- A Vercel account (free tier works)
- Supabase account (free tier works for up to 500 users)
- Stripe account (free to create; test mode requires no KYC)
- OpenRouter account for AI features

---

## 1. Clone and install

```bash
git clone <your-repo> aka-nextjs
cd aka-nextjs
npm install
cp .env.example .env.local
# Edit .env.local with your real values
```

---

## 2. Supabase setup

### 2a. Create project
1. Go to [app.supabase.com](https://app.supabase.com) → New Project
2. Choose a region close to your users
3. Copy **Project URL** and **anon key** into `.env.local`

### 2b. Run migrations (in order)
Open the **SQL Editor** in Supabase Dashboard and run each file:

```
supabase/schema.sql          -- Core tables (run first)
supabase/rls-policies.sql    -- Row Level Security
supabase/seed.sql            -- Initial content data
supabase/admin-schema.sql    -- Admin role + metrics views
supabase/analytics-schema.sql -- Event tracking
```

### 2c. Enable Email Auth
- Dashboard → Authentication → Providers → Email → Enable
- Set **Site URL**: `https://your-domain.vercel.app`
- Set **Redirect URLs**: `https://your-domain.vercel.app/auth/callback`

### 2d. Enable Google Auth (optional)
- Dashboard → Authentication → Providers → Google
- Create OAuth credentials in Google Console
- Paste Client ID and Secret into Supabase

### 2e. Get service role key
- Dashboard → Project Settings → API → `service_role` (secret)
- Add to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

### 2f. Grant yourself admin access
After creating your first account, run in SQL Editor:
```sql
UPDATE parents SET is_admin = TRUE WHERE email = 'your@email.com';
```

---

## 3. Stripe setup

See `STRIPE_SETUP.md` for the full guide. Quick version:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
stripe login

# Create products in Stripe Dashboard → Products:
# - "AI Kids Academy Premium" ($9.99/mo, $95.88/yr)
# - "AI Kids Academy Family" ($14.99/mo, $143.88/yr)

# Copy the 4 price IDs to .env.local

# Start webhook forwarding for local dev:
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the whsec_... secret to STRIPE_WEBHOOK_SECRET
```

---

## 4. OpenRouter API key

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Create an API key
3. Add to `.env.local` as `OPENROUTER_API_KEY`

The app works without this key — fallback responses are used for all AI features.

---

## 5. Local development

```bash
# Terminal 1 — Next.js dev server
npm run dev

# Terminal 2 — Stripe webhook forwarding (if testing payments)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Open http://localhost:3000
```

---

## 6. Deploy to Vercel

### 6a. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit — AI Kids Academy"
git remote add origin https://github.com/your-username/aka-nextjs
git push -u origin main
```

### 6b. Import in Vercel
1. [vercel.com/new](https://vercel.com/new) → Import Git Repository
2. Select your repo
3. Framework: **Next.js** (auto-detected)
4. Root directory: leave blank (project root)

### 6c. Add environment variables
In Vercel → Project → Settings → Environment Variables, add all variables from `.env.example`:

| Variable | Notes |
|----------|-------|
| `OPENROUTER_API_KEY` | Server-only (no NEXT_PUBLIC_ prefix) |
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public, safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only, keep secret |
| `STRIPE_SECRET_KEY` | Server-only |
| `NEXT_PUBLIC_STRIPE_PUB_KEY` | Public, safe to expose |
| `STRIPE_WEBHOOK_SECRET` | Server-only |
| `STRIPE_PRICE_PREMIUM_MONTHLY` | From Stripe dashboard |
| `STRIPE_PRICE_PREMIUM_YEARLY` | From Stripe dashboard |
| `STRIPE_PRICE_FAMILY_MONTHLY` | From Stripe dashboard |
| `STRIPE_PRICE_FAMILY_YEARLY` | From Stripe dashboard |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |

### 6d. Deploy
Click **Deploy**. Vercel will build and deploy automatically.

### 6e. Update Supabase redirect URLs
After deploying, add your Vercel URL to Supabase:
- Dashboard → Authentication → URL Configuration
- Site URL: `https://your-project.vercel.app`
- Redirect URLs: `https://your-project.vercel.app/auth/callback`

### 6f. Set up production Stripe webhook
1. Stripe Dashboard → Developers → Webhooks → Add Endpoint
2. URL: `https://your-project.vercel.app/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
4. Copy Signing Secret → update `STRIPE_WEBHOOK_SECRET` in Vercel

---

## 7. Custom domain (optional)

1. Vercel → Project → Settings → Domains → Add Domain
2. Add your domain and follow the DNS instructions
3. Update `NEXT_PUBLIC_APP_URL` to your custom domain
4. Update Supabase redirect URLs with the custom domain

---

## 8. Post-launch checklist

- [ ] Test complete sign-up → child profile → learning flow
- [ ] Test Stripe checkout with test card `4242 4242 4242 4242`
- [ ] Verify webhook events are received in Stripe Dashboard
- [ ] Test admin dashboard at `/admin`
- [ ] Verify legal pages at `/privacy`, `/terms`, `/child-safety`
- [ ] Test password reset email flow
- [ ] Check mobile layout on a real device
- [ ] Set up error monitoring (Sentry recommended)

---

## 9. Scaling considerations

| Users | Recommended action |
|-------|-------------------|
| 0–500 | Supabase free tier is sufficient |
| 500–5k | Upgrade to Supabase Pro ($25/mo) |
| 5k+ | Add Redis for rate limiting (replace in-memory cache in ai-handler.ts) |
| 10k+ | Add a CDN for static assets, consider edge deployment |

Current in-memory rate limiting (`lib/server/ai-handler.ts`) resets on cold starts. Replace with Redis (Upstash) for production at scale.

