# AI Kids Academy — Database Deployment Guide

## Step 1: Apply the Schema (required — do this first)

1. Go to **https://supabase.com/dashboard**
2. Select your project: `zysyjsdeopsocuyzxzem`
3. Navigate to **SQL Editor** (left sidebar, looks like a play button)
4. Click **+ New query**
5. Copy the **entire contents** of `supabase/00-complete-setup.sql`
6. Paste it into the SQL editor
7. Click **Run** (or press F5)
8. You should see: `✅ AI Kids Academy database setup complete!`

This creates:
- `parents` table + RLS
- `children` table + RLS  
- `child_profiles` table + auto-creation trigger
- `progress` table + RLS (with UNIQUE constraint to prevent double XP)
- `achievements` table + RLS
- `stories` table + RLS
- `savings_goals` table + RLS
- `ai_usage` table + RLS
- `subscriptions` table + auto-creation trigger
- `app_events` table (analytics)
- 8 science experiments seeded
- All triggers for `updated_at` auto-updating

## Step 2: Get the Service Role Key (optional but recommended)

For admin dashboard and webhook handling:

1. In Supabase Dashboard → **Project Settings** → **API**
2. Under **Project API keys**, find `service_role` (marked SECRET)
3. Copy the key (starts with `eyJ...`)
4. Add to `.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Without this key, the app still works fully — parent rows are created via the authenticated
client using RLS policies. You only need the service role key for:
- Admin dashboard (`/admin`)
- Stripe webhooks (future)

## Step 3: Verify it works

After running the SQL:

1. Open the app at `http://localhost:3000`
2. Sign up with a new email
3. You should see a verification email
4. After verifying, create a child profile
5. Complete one activity (e.g., an AI Explorer lesson)
6. Check Supabase Table Editor — you should see:
   - `parents` row for your account
   - `children` row for the child
   - `child_profiles` row (auto-created by trigger)
   - `progress` row for the completed activity
   - `subscriptions` row (auto-created by trigger)

## Verification Queries

Run these in Supabase SQL Editor to verify everything is working:

```sql
-- Check table structure
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should return: achievements, ai_usage, app_events, child_profiles, 
-- children, parents, progress, savings_goals, stories, subscriptions

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

## What works without service role key

✅ Email signup and verification
✅ Google OAuth login
✅ Parent row creation (via RLS "parents: insert own" policy)
✅ Child profile creation
✅ XP and progress tracking
✅ Achievement badges
✅ Savings goals persistence
✅ Story saving
✅ AI usage rate limiting
✅ Analytics events

❌ Admin dashboard (needs service role to read all parents)
❌ Stripe webhooks (needs service role to update subscriptions)

## Troubleshooting

**"relation does not exist" error** → Run `00-complete-setup.sql` in SQL Editor

**"Row level security policy" error** → The RLS policies prevent access. Check that
the user is authenticated before making queries.

**"duplicate key value" error** → This is expected! It means the UNIQUE constraint
is correctly preventing double XP awards.

**Parent row not created after Google login** → Wait 2-3 seconds after redirect —
the callback route creates the row. If it still fails, check browser console for errors.
