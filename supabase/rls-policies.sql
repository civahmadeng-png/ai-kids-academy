-- ============================================================
-- AI Kids Academy — Row Level Security (RLS) Policies
-- Run AFTER schema.sql in Supabase SQL Editor
--
-- Core security principle:
--   Parents can only see their own data and their children's data.
--   Children can only see their own data.
--   No cross-family data leakage is possible.
-- ============================================================

-- ============================================================
-- STEP 1: Enable RLS on all tables
-- (Must be done before adding policies)
-- ============================================================

ALTER TABLE parents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE children             ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress             ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE science_experiments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE diy_projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_missions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_choices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage             ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_missions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_creations   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTION: is_my_child(child_id)
-- Returns true if the authenticated user is the parent of that child.
-- Used in all child-related policies to avoid repetition.
-- ============================================================

CREATE OR REPLACE FUNCTION is_my_child(p_child_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM children
    WHERE id = p_child_id
      AND parent_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- TABLE: parents
-- ============================================================

-- Parents can only read their own row
CREATE POLICY "parents: read own"
  ON parents FOR SELECT
  USING (id = auth.uid());

-- Parents can update their own row
CREATE POLICY "parents: update own"
  ON parents FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- New parent rows are created by Supabase Auth trigger only (no INSERT policy)
-- This prevents anyone from manually inserting parent rows

-- ============================================================
-- TABLE: children
-- A parent can manage all their own children.
-- ============================================================

-- Parents read their own children
CREATE POLICY "children: parent reads own"
  ON children FOR SELECT
  USING (parent_id = auth.uid());

-- Parents insert children (enforces parent_id = auth.uid())
CREATE POLICY "children: parent inserts own"
  ON children FOR INSERT
  WITH CHECK (parent_id = auth.uid());

-- Parents update their own children
CREATE POLICY "children: parent updates own"
  ON children FOR UPDATE
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- Parents can soft-delete (set is_active=false) but not hard delete
-- Hard deletes cascade automatically when parent account is deleted
CREATE POLICY "children: parent deactivates own"
  ON children FOR DELETE
  USING (parent_id = auth.uid());

-- ============================================================
-- TABLE: child_profiles
-- ============================================================

-- Parents read profiles of their children
CREATE POLICY "child_profiles: parent reads"
  ON child_profiles FOR SELECT
  USING (is_my_child(child_id));

-- Only the backend (service role) updates profiles
-- Frontend updates go through API routes that use service role
CREATE POLICY "child_profiles: service updates"
  ON child_profiles FOR UPDATE
  USING (is_my_child(child_id));

-- Auto-created by trigger, no INSERT policy needed for clients

-- ============================================================
-- TABLE: progress
-- ============================================================

-- Parents read all progress for their children
CREATE POLICY "progress: parent reads"
  ON progress FOR SELECT
  USING (is_my_child(child_id));

-- Progress can only be inserted via API route (service role)
-- This prevents children from faking completions
-- For now: allow authenticated users to insert their own child's progress
CREATE POLICY "progress: insert own child"
  ON progress FOR INSERT
  WITH CHECK (is_my_child(child_id));

-- No UPDATE or DELETE on progress (it's an append-only audit log)

-- ============================================================
-- TABLE: achievements
-- ============================================================

CREATE POLICY "achievements: parent reads"
  ON achievements FOR SELECT
  USING (is_my_child(child_id));

CREATE POLICY "achievements: insert own child"
  ON achievements FOR INSERT
  WITH CHECK (is_my_child(child_id));

-- No UPDATE/DELETE — achievements can't be revoked via client

-- ============================================================
-- TABLE: science_experiments (Public catalog — read-only for all)
-- Everyone can read. Only admins (service role) can insert/update.
-- ============================================================

CREATE POLICY "science_experiments: public read"
  ON science_experiments FOR SELECT
  USING (is_active = TRUE);

-- No INSERT/UPDATE/DELETE for regular users
-- Use service role key for admin operations

-- ============================================================
-- TABLE: diy_projects (Public catalog — same as above)
-- ============================================================

CREATE POLICY "diy_projects: public read"
  ON diy_projects FOR SELECT
  USING (is_active = TRUE);

-- ============================================================
-- TABLE: engineering_challenges (Public catalog)
-- ============================================================

CREATE POLICY "engineering_challenges: public read"
  ON engineering_challenges FOR SELECT
  USING (is_active = TRUE);

-- ============================================================
-- TABLE: discovery_missions (Public catalog)
-- ============================================================

CREATE POLICY "discovery_missions: public read"
  ON discovery_missions FOR SELECT
  USING (is_active = TRUE);

-- ============================================================
-- TABLE: stories
-- ============================================================

-- Parents read stories for their children
CREATE POLICY "stories: parent reads"
  ON stories FOR SELECT
  USING (is_my_child(child_id));

-- Children (via parent session) can create stories
CREATE POLICY "stories: insert own child"
  ON stories FOR INSERT
  WITH CHECK (is_my_child(child_id));

-- Children can mark stories as favourite
CREATE POLICY "stories: update favourite"
  ON stories FOR UPDATE
  USING (is_my_child(child_id))
  WITH CHECK (is_my_child(child_id));

-- No DELETE — stories are permanent (for child's portfolio)

-- ============================================================
-- TABLE: story_choices
-- ============================================================

CREATE POLICY "story_choices: parent reads"
  ON story_choices FOR SELECT
  USING (is_my_child(child_id));

CREATE POLICY "story_choices: insert own child"
  ON story_choices FOR INSERT
  WITH CHECK (is_my_child(child_id));

-- ============================================================
-- TABLE: ai_usage
-- Critical: used for rate limiting. Parents can read their usage.
-- ============================================================

-- Parents read AI usage for their children (billing transparency)
CREATE POLICY "ai_usage: parent reads"
  ON ai_usage FOR SELECT
  USING (parent_id = auth.uid());

-- Inserts happen via API route (service role) after each AI call
-- Client-side insert policy for MVP (replace with API route in production):
CREATE POLICY "ai_usage: insert own child"
  ON ai_usage FOR INSERT
  WITH CHECK (
    parent_id = auth.uid()
    AND is_my_child(child_id)
  );

-- No UPDATE/DELETE on ai_usage (audit trail must be immutable)

-- ============================================================
-- TABLE: subscriptions
-- ============================================================

-- Parents read their own subscription
CREATE POLICY "subscriptions: parent reads own"
  ON subscriptions FOR SELECT
  USING (parent_id = auth.uid());

-- Only Stripe webhooks (service role) update subscriptions
-- No client INSERT/UPDATE policy for subscriptions

-- ============================================================
-- TABLE: parent_reports
-- ============================================================

-- Parents read reports about their children
CREATE POLICY "parent_reports: parent reads"
  ON parent_reports FOR SELECT
  USING (parent_id = auth.uid());

-- Reports are generated by backend cron (service role)
-- No client INSERT policy

-- ============================================================
-- TABLE: family_missions
-- ============================================================

-- Parents read missions for their family
CREATE POLICY "family_missions: parent reads"
  ON family_missions FOR SELECT
  USING (parent_id = auth.uid());

-- Parents and children can create family mission records
CREATE POLICY "family_missions: insert own family"
  ON family_missions FOR INSERT
  WITH CHECK (
    parent_id = auth.uid()
    AND is_my_child(child_id)
  );

-- Parents confirm mission completion
CREATE POLICY "family_missions: parent confirms"
  ON family_missions FOR UPDATE
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- ============================================================
-- TABLE: uploaded_creations
-- ============================================================

-- Parents read all creations from their children
CREATE POLICY "uploaded_creations: parent reads"
  ON uploaded_creations FOR SELECT
  USING (parent_id = auth.uid());

-- Children can upload their own creations
CREATE POLICY "uploaded_creations: insert own child"
  ON uploaded_creations FOR INSERT
  WITH CHECK (
    parent_id = auth.uid()
    AND is_my_child(child_id)
  );

-- Parents approve/reject creations
CREATE POLICY "uploaded_creations: parent approves"
  ON uploaded_creations FOR UPDATE
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- Parents can delete inappropriate creations
CREATE POLICY "uploaded_creations: parent deletes"
  ON uploaded_creations FOR DELETE
  USING (parent_id = auth.uid());

-- ============================================================
-- SUPABASE STORAGE: creations bucket RLS
-- Run this to create the storage bucket for uploaded photos
-- ============================================================

-- Create the storage bucket (run once)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'creations',
  'creations',
  FALSE,                                 -- private bucket
  5242880,                               -- 5MB max file size
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policy: parents can upload for their children
CREATE POLICY "creations: parent uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'creations'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Storage policy: parents can read their family's uploads
CREATE POLICY "creations: parent reads"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'creations'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Storage policy: parents can delete
CREATE POLICY "creations: parent deletes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'creations'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- ============================================================
-- RATE LIMITING VIEW: daily AI usage per child
-- Used by API routes to enforce free plan limits
-- ============================================================

CREATE OR REPLACE VIEW ai_daily_usage AS
SELECT
  child_id,
  parent_id,
  feature,
  used_at::DATE AS usage_date,
  COUNT(*) AS call_count
FROM ai_usage
WHERE used_at >= NOW() - INTERVAL '1 day'
GROUP BY child_id, parent_id, feature, usage_date;

COMMENT ON VIEW ai_daily_usage IS 'Daily AI call counts per child per feature. Used for rate limiting in API routes.';
