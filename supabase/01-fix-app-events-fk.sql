-- ============================================================
-- AI Kids Academy — Fix app_events foreign key constraints
-- Run this in Supabase SQL Editor AFTER 00-complete-setup.sql
-- 
-- Problem: app_events had FK constraints on parent_id and child_id
-- that caused violations when events fired before parent row existed.
--
-- Fix: Drop FK constraints on app_events. Analytics events should
-- be "fire and forget" and never block the auth flow.
-- We keep parent_id/child_id columns for filtering, just no FK.
-- ============================================================

-- Drop the FK constraints that cause violations
ALTER TABLE app_events DROP CONSTRAINT IF EXISTS app_events_parent_id_fkey;
ALTER TABLE app_events DROP CONSTRAINT IF EXISTS app_events_child_id_fkey;

-- Also ensure parents table RLS allows insert from authenticated users
-- (needed for the new ensureParentRow flow)
DROP POLICY IF EXISTS "parents: insert own" ON parents;
CREATE POLICY "parents: insert own"
  ON parents FOR INSERT
  WITH CHECK (id = auth.uid());

-- Ensure parents can be read by their owner
DROP POLICY IF EXISTS "parents: read own" ON parents;
CREATE POLICY "parents: read own"
  ON parents FOR SELECT
  USING (id = auth.uid());

-- Ensure parents can update their own row
DROP POLICY IF EXISTS "parents: update own" ON parents;
CREATE POLICY "parents: update own"
  ON parents FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Re-seed any missing parent rows from existing auth.users
-- This fixes existing users who signed up before the schema existed
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
  RAISE NOTICE '✅ Fix applied:';
  RAISE NOTICE '   - app_events FK constraints dropped (no more FK violations)';
  RAISE NOTICE '   - parents RLS policies refreshed';
  RAISE NOTICE '   - Existing auth.users backfilled into parents table';
END $$;
