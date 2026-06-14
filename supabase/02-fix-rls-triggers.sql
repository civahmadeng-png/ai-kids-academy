-- ============================================================
-- AI Kids Academy — Fix RLS on triggers and auto-created rows
-- Run this in Supabase SQL Editor
-- 
-- Problems:
-- 1. child_profiles trigger violates RLS when auto-creating rows
-- 2. subscriptions trigger violates RLS when auto-creating rows
-- 3. These triggers run as the user, not as superuser
--
-- Fix: Make triggers use SECURITY DEFINER (run as postgres)
-- ============================================================

-- ── Fix 1: child_profiles trigger ─────────────────────────
-- Drop and recreate with SECURITY DEFINER so it bypasses RLS
CREATE OR REPLACE FUNCTION create_child_profile()
RETURNS TRIGGER 
SECURITY DEFINER  -- runs as postgres, bypasses RLS
SET search_path = public
AS $$
BEGIN
  INSERT INTO child_profiles (child_id)
  VALUES (NEW.id)
  ON CONFLICT (child_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Fix 2: subscriptions trigger ──────────────────────────
CREATE OR REPLACE FUNCTION create_free_subscription()
RETURNS TRIGGER
SECURITY DEFINER  -- runs as postgres, bypasses RLS
SET search_path = public
AS $$
BEGIN
  INSERT INTO subscriptions (parent_id, plan, status, ai_calls_per_day, max_children)
  VALUES (NEW.id, 'free', 'active', 5, 1)
  ON CONFLICT (parent_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Fix 3: updated_at trigger ─────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN 
  NEW.updated_at = NOW(); 
  RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

-- ── Fix 4: Add RLS policies for child_profiles ────────────
-- Allow insert via trigger (SECURITY DEFINER handles it)
-- But also need select/update for the parent
DROP POLICY IF EXISTS "child_profiles: parent reads"   ON child_profiles;
DROP POLICY IF EXISTS "child_profiles: parent updates" ON child_profiles;
DROP POLICY IF EXISTS "child_profiles: insert"         ON child_profiles;

CREATE POLICY "child_profiles: parent reads"
  ON child_profiles FOR SELECT
  USING (is_my_child(child_id));

CREATE POLICY "child_profiles: parent updates"
  ON child_profiles FOR UPDATE
  USING (is_my_child(child_id))
  WITH CHECK (is_my_child(child_id));

-- Allow insert from trigger (SECURITY DEFINER bypasses RLS, but add policy as backup)
CREATE POLICY "child_profiles: insert"
  ON child_profiles FOR INSERT
  WITH CHECK (is_my_child(child_id));

-- ── Fix 5: Add RLS policies for subscriptions ─────────────
DROP POLICY IF EXISTS "subscriptions: parent reads"  ON subscriptions;
DROP POLICY IF EXISTS "subscriptions: insert"        ON subscriptions;

CREATE POLICY "subscriptions: parent reads"
  ON subscriptions FOR SELECT
  USING (parent_id = auth.uid());

-- Allow insert from trigger
CREATE POLICY "subscriptions: insert"
  ON subscriptions FOR INSERT
  WITH CHECK (parent_id = auth.uid());

-- ── Fix 6: Ensure is_my_child function exists ─────────────
CREATE OR REPLACE FUNCTION is_my_child(p_child_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM children
    WHERE id = p_child_id 
    AND parent_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ── Fix 7: Backfill missing child_profiles ─────────────────
-- For children that exist but don't have a child_profile yet
INSERT INTO child_profiles (child_id)
SELECT id FROM children
WHERE id NOT IN (SELECT child_id FROM child_profiles)
ON CONFLICT (child_id) DO NOTHING;

-- ── Fix 8: Backfill missing subscriptions ─────────────────
INSERT INTO subscriptions (parent_id, plan, status, ai_calls_per_day, max_children)
SELECT id, 'free', 'active', 5, 1
FROM parents
WHERE id NOT IN (SELECT parent_id FROM subscriptions)
ON CONFLICT (parent_id) DO NOTHING;

-- ── Fix 9: Backfill missing parents ───────────────────────
INSERT INTO parents (id, email, full_name, plan)
SELECT 
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(email, '@', 1)
  ) AS full_name,
  'free'
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  RAISE NOTICE '✅ All RLS and trigger fixes applied!';
  RAISE NOTICE '   - child_profiles trigger: SECURITY DEFINER ✓';
  RAISE NOTICE '   - subscriptions trigger: SECURITY DEFINER ✓';
  RAISE NOTICE '   - child_profiles RLS policies updated ✓';
  RAISE NOTICE '   - subscriptions RLS policies updated ✓';
  RAISE NOTICE '   - Missing rows backfilled ✓';
END $$;
