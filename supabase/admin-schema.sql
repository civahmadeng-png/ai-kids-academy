-- ============================================================
-- AI Kids Academy — Admin Schema Addition
-- Run this AFTER schema.sql in Supabase SQL Editor
-- Adds: is_admin column, admin RLS, metrics views
-- ============================================================

-- ── 1. Add is_admin column to parents ────────────────────────
ALTER TABLE parents
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN parents.is_admin IS
  'TRUE for SaaS owner/admin accounts. Set manually via Supabase dashboard. Never auto-granted.';

-- ── 2. Helper function: is current user an admin? ─────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM parents
    WHERE id = auth.uid()
      AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_admin() IS
  'Returns TRUE if the currently authenticated user is a platform admin.';

-- ── 3. RLS policies for admin read access ────────────────────
-- Admins can read ALL parents (for the dashboard)
CREATE POLICY "admin: read all parents"
  ON parents FOR SELECT
  USING (is_admin());

-- Admins can read ALL children
CREATE POLICY "admin: read all children"
  ON children FOR SELECT
  USING (is_admin());

-- Admins can read ALL subscriptions
CREATE POLICY "admin: read all subscriptions"
  ON subscriptions FOR SELECT
  USING (is_admin());

-- Admins can read ALL progress
CREATE POLICY "admin: read all progress"
  ON progress FOR SELECT
  USING (is_admin());

-- Admins can read ALL AI usage
CREATE POLICY "admin: read all ai_usage"
  ON ai_usage FOR SELECT
  USING (is_admin());

-- Admins can read ALL achievements
CREATE POLICY "admin: read all achievements"
  ON achievements FOR SELECT
  USING (is_admin());

-- Admins can update is_admin flag (bootstrap: do first grant via SQL editor)
CREATE POLICY "admin: update parents"
  ON parents FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── 4. Aggregate metrics VIEW (admin only) ───────────────────
CREATE OR REPLACE VIEW admin_metrics AS
SELECT
  -- User counts
  (SELECT COUNT(*) FROM parents)                              AS total_parents,
  (SELECT COUNT(*) FROM children WHERE is_active = TRUE)     AS total_children,
  (SELECT COUNT(*) FROM parents WHERE is_admin = FALSE)      AS total_non_admin_parents,

  -- Subscription breakdown
  (SELECT COUNT(*) FROM subscriptions WHERE plan = 'free'    AND status = 'active') AS free_count,
  (SELECT COUNT(*) FROM subscriptions WHERE plan = 'premium' AND status = 'active') AS premium_count,
  (SELECT COUNT(*) FROM subscriptions WHERE plan = 'family'  AND status = 'active') AS family_count,
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'trial')                        AS trial_count,
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'cancelled')                    AS cancelled_count,

  -- Revenue estimate (monthly, from active paid subs)
  (SELECT
    COALESCE(SUM(monthly_price_usd), 0)
    FROM subscriptions
    WHERE status IN ('active','trial')
      AND plan != 'free'
  ) AS estimated_mrr_usd,

  -- Activity totals
  (SELECT COUNT(*) FROM progress)                             AS total_completions,
  (SELECT COUNT(*) FROM stories)                             AS total_stories,
  (SELECT COUNT(*) FROM ai_usage)                            AS total_ai_calls,
  (SELECT COUNT(*) FROM achievements)                         AS total_badges_earned,

  -- AI usage by feature (last 7 days)
  (SELECT COUNT(*) FROM ai_usage WHERE feature = 'mentor'        AND used_at >= NOW() - INTERVAL '7 days') AS ai_mentor_7d,
  (SELECT COUNT(*) FROM ai_usage WHERE feature = 'story_generation' AND used_at >= NOW() - INTERVAL '7 days') AS ai_story_7d,
  (SELECT COUNT(*) FROM ai_usage WHERE feature = 'art_generation' AND used_at >= NOW() - INTERVAL '7 days') AS ai_art_7d,
  (SELECT COUNT(*) FROM ai_usage WHERE feature = 'diy_builder'   AND used_at >= NOW() - INTERVAL '7 days') AS ai_diy_7d,

  -- Signups
  (SELECT COUNT(*) FROM parents WHERE created_at >= NOW() - INTERVAL '24 hours') AS signups_24h,
  (SELECT COUNT(*) FROM parents WHERE created_at >= NOW() - INTERVAL '7 days')   AS signups_7d,
  (SELECT COUNT(*) FROM parents WHERE created_at >= NOW() - INTERVAL '30 days')  AS signups_30d,

  -- Activity counts by content type (all time)
  (SELECT COUNT(*) FROM progress WHERE content_type = 'science_experiment')    AS completions_science,
  (SELECT COUNT(*) FROM progress WHERE content_type = 'ai_lesson')             AS completions_ai_lessons,
  (SELECT COUNT(*) FROM progress WHERE content_type = 'engineering_challenge') AS completions_engineering,
  (SELECT COUNT(*) FROM progress WHERE content_type = 'diy_project')          AS completions_diy,
  (SELECT COUNT(*) FROM progress WHERE content_type = 'discovery_mission')     AS completions_discovery,
  (SELECT COUNT(*) FROM progress WHERE content_type = 'story')                AS completions_stories,
  (SELECT COUNT(*) FROM progress WHERE content_type = 'career_exploration')    AS completions_careers,

  NOW() AS generated_at;

-- Only admins can read this view
ALTER VIEW admin_metrics OWNER TO postgres;

COMMENT ON VIEW admin_metrics IS
  'Pre-aggregated platform metrics for admin dashboard. Accessible only to is_admin() users.';

-- ── 5. Recent signups VIEW (admin only, no PII beyond email) ──
CREATE OR REPLACE VIEW admin_recent_signups AS
SELECT
  p.id,
  p.email,
  p.full_name,
  p.plan,
  p.created_at,
  p.last_login,
  s.status        AS sub_status,
  s.trial_ends_at,
  COUNT(c.id)     AS child_count
FROM parents p
LEFT JOIN subscriptions s ON s.parent_id = p.id
LEFT JOIN children      c ON c.parent_id = p.id AND c.is_active = TRUE
WHERE p.is_admin = FALSE
GROUP BY p.id, p.email, p.full_name, p.plan, p.created_at, p.last_login, s.status, s.trial_ends_at
ORDER BY p.created_at DESC
LIMIT 50;

COMMENT ON VIEW admin_recent_signups IS
  'Last 50 parent signups with plan and child count. Admin only.';

-- ── 6. Grant admin — run this to make yourself admin ─────────
-- UPDATE parents SET is_admin = TRUE WHERE email = 'your@email.com';
-- (Run this manually in the Supabase SQL editor after signing up)

-- ── 7. Daily signups series (last 30 days) ───────────────────
CREATE OR REPLACE VIEW admin_daily_signups AS
SELECT
  DATE(created_at) AS day,
  COUNT(*)         AS signups
FROM parents
WHERE is_admin = FALSE
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY day DESC;

COMMENT ON VIEW admin_daily_signups IS
  'Daily signup counts for the last 30 days. Used for growth charts.';
