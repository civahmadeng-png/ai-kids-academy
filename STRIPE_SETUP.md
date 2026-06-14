# Stripe Test Mode Setup — AI Kids Academy

## Step 1: Create Stripe Account

1. Go to https://stripe.com and create a free account
2. Stay in **Test Mode** (toggle at top of dashboard) — no real charges
3. Get your API keys from **Developers → API Keys**:
   - Copy `Publishable key` → `NEXT_PUBLIC_STRIPE_PUB_KEY`
   - Copy `Secret key` → `STRIPE_SECRET_KEY`

---

## Step 2: Create Products and Prices

In your Stripe Dashboard → **Products → Add Product**

### Premium Plan

**Product name:** AI Kids Academy Premium  
**Description:** Unlimited AI learning for one child  

Add two prices:
- **Monthly:** $9.99/month, recurring  
  → Copy Price ID → `STRIPE_PRICE_PREMIUM_MONTHLY`
- **Yearly:** $95.88/year ($7.99/month), recurring  
  → Copy Price ID → `STRIPE_PRICE_PREMIUM_YEARLY`

### Family Plan

**Product name:** AI Kids Academy Family  
**Description:** Unlimited AI learning for up to 5 children  

Add two prices:
- **Monthly:** $14.99/month, recurring  
  → Copy Price ID → `STRIPE_PRICE_FAMILY_MONTHLY`
- **Yearly:** $143.88/year ($11.99/month), recurring  
  → Copy Price ID → `STRIPE_PRICE_FAMILY_YEARLY`

---

## Step 3: Set Up Webhook (Local Development)

### Option A — Stripe CLI (Recommended)

```bash
# Install Stripe CLI
# Mac: brew install stripe/stripe-cli/stripe
# Windows: https://github.com/stripe/stripe-cli/releases
# Linux: see https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret shown in the terminal
# It looks like: whsec_xxxxx
# Paste it as: STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Option B — Stripe Dashboard (Production)

1. Dashboard → **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## Step 4: Enable Customer Portal

1. Dashboard → **Settings → Billing → Customer Portal**
2. Enable: Allow cancellations, plan upgrades, payment method updates
3. Save settings

---

## Step 5: Configure .env.local

```bash
# Copy the example file
cp .env.example .env.local

# Fill in your real values:
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUB_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_PREMIUM_YEARLY=price_...
STRIPE_PRICE_FAMILY_MONTHLY=price_...
STRIPE_PRICE_FAMILY_YEARLY=price_...
```

---

## Step 6: Test the Flow

Use Stripe's **test card numbers** (no real charges):

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 3220` | 3D Secure required |
| `4000 0000 0000 9995` | Payment fails (insufficient funds) |

Use any future expiry date, any 3-digit CVC, any postal code.

### Full test flow:
1. `npm run dev`
2. In a second terminal: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Open `http://localhost:3000`
4. Sign in → go to Upgrade → click "Start 7-Day Free Trial"
5. Use test card `4242 4242 4242 4242`
6. After checkout, you are redirected back with the new plan active
7. Check Stripe Dashboard → Customers to see the subscription

---

## Step 7: Supabase Service Role Key

The webhook needs a **service role key** to update subscription rows (bypasses RLS):

1. Supabase Dashboard → **Project Settings → API**
2. Copy `service_role` key (secret — never expose publicly)
3. Add to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

---

## Going Live

1. Switch Stripe to **Live Mode**
2. Get live API keys (no `test` prefix)
3. Create real products with same prices
4. Set up a real webhook endpoint
5. Update all env vars with live values
6. Deploy to Vercel: `vercel env pull` handles this automatically

---

## API Routes Summary

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/stripe/checkout` | POST | Create checkout session |
| `/api/stripe/webhook` | POST | Handle all Stripe events |
| `/api/stripe/portal` | POST | Create billing portal session |
| `/api/stripe/cancel` | POST | Cancel / reactivate subscription |
| `/api/stripe/status` | GET | Get current subscription status |
