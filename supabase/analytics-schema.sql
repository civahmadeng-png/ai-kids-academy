-- ============================================================
-- AI Kids Academy — Analytics Schema (Step 10)
-- Run AFTER schema.sql in Supabase SQL Editor.
--
-- Design principles:
--   • No PII stored — parent_id / child_id are internal UUIDs
--   • No names, emails, IP addresses, or device fingerprints
--   • session_id is a random UUID generated client-side per session
--   • Properties stored as jsonb; sensitive keys are never written
-- ============================================================

-- ── Event name enum (closed set — prevents typos) ─────────────
CREATE TYPE app_event_name AS ENUM (
  -- Auth
  'sign_up',
  'login',
  'logout',
  -- Profiles
  'child_profile_created',
  -- Learning activities
  'lesson_completed',
  'science_completed',
  'diy_completed',
  'engineering_completed',
  'discovery_completed',
  'space_completed',
  'career_explored',
  -- Creativity
  'story_created',
  'story_completed',
  -- AI
  'ai_mentor_used',
  'ai_limit_reached',
  -- Monetisation
  'upgrade_clicked',
  'plan_upgrade_viewed',
  'subscription_started',
  'subscription_cancelled',
  -- Engagement
  'badge_earned',
  'streak_extended',
  'daily_login'
);

-- ── Main events table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Who (internal IDs only — no names, emails, or PII)
  parent_id    UUID REFERENCES parents(id) ON DELETE SET NULL,
  child_id     UUID REFERENCES children(id) ON DELETE SET NULL,

  -- What
  event        app_event_name NOT NULL,

  -- Grouping / session
  session_id   UUID,                -- random UUID per browser session

  -- Safe properties (no PII allowed — enforced by convention + backend)
  properties   JSONB DEFAULT '{}',

  -- Plan context at time of event (useful for funnel analysis)
  plan         subscription_plan DEFAULT 'free',

  -- When
  occurred_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE app_events IS
  'Privacy-safe event log. No names, emails, IPs, or device IDs stored. '
  'parent_id and child_id are internal UUIDs only.';

COMMENT ON COLUMN app_events.properties IS
  'Allowed keys: xp, module, plan, method, tier, badge_id, billing. '
  'Never write: name, email, password, card, or any PII.';

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX idx_events_parent_id   ON app_events(parent_id)     WHERE parent_id IS NOT NULL;
CREATE INDEX idx_events_child_id    ON app_events(child_id)      WHERE child_id  IS NOT NULL;
CREATE INDEX idx_events_event       ON app_events(event);
CREATE INDEX idx_events_occurred_at ON app_events(occurred_at DESC);
-- Funnel analysis: events by plan + event name
CREATE INDEX idx_events_plan_event  ON app_events(plan, event);

-- ── Row Level Security ─────────────────────────────────────────
ALTER TABLE app_events ENABLE ROW LEVEL SECURITY;

-- Parents can insert their own events (frontend writes)
CREATE POLICY "parent: insert own events"
  ON app_events FOR INSERT
  WITH CHECK (auth.uid() = parent_id OR parent_id IS NULL);

-- Parents can read their own events only
CREATE POLICY "parent: read own events"
  ON app_events FOR SELECT
  USING (auth.uid() = parent_id);

-- Admins can read all events (for dashboard)
CREATE POLICY "admin: read all events"
  ON app_events FOR SELECT
  USING (is_admin());

-- ── Aggregate view for admin dashboard ───────────────────────
CREATE OR REPLACE VIEW admin_event_counts AS
SELECT
  event,
  COUNT(*)                                                            AS total,
  COUNT(*) FILTER (WHERE occurred_at >= NOW() - INTERVAL '24 hours') AS last_24h,
  COUNT(*) FILTER (WHERE occurred_at >= NOW() - INTERVAL '7 days')   AS last_7d,
  COUNT(*) FILTER (WHERE occurred_at >= NOW() - INTERVAL '30 days')  AS last_30d
FROM app_events
GROUP BY event
ORDER BY total DESC;

COMMENT ON VIEW admin_event_counts IS
  'Event frequency breakdown for admin analytics panel. Admin-only via RLS on base table.';
