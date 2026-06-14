-- ============================================================
-- AI Kids Academy — COMPLETE DATABASE SETUP
-- Single idempotent script: run once in Supabase SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS everywhere.
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enums (idempotent via DO block) ──────────────────────────
DO $$ BEGIN
  CREATE TYPE subscription_plan AS ENUM ('free', 'premium', 'family');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE content_type AS ENUM (
    'science_experiment', 'diy_project', 'engineering_challenge',
    'discovery_mission', 'ai_lesson', 'story', 'career_exploration'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ai_feature AS ENUM (
    'mentor', 'prompt_challenge', 'art_generation',
    'story_generation', 'diy_builder', 'savings_tip'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app_event_name AS ENUM (
    'sign_up', 'login', 'logout',
    'child_profile_created',
    'lesson_completed', 'science_completed', 'diy_completed',
    'engineering_completed', 'discovery_completed', 'space_completed',
    'career_explored', 'story_created', 'story_completed',
    'ai_mentor_used', 'ai_limit_reached',
    'upgrade_clicked', 'plan_upgrade_viewed',
    'subscription_started', 'subscription_cancelled',
    'badge_earned', 'habit_completed', 'daily_login'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- HELPER: updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: parents
-- ============================================================
CREATE TABLE IF NOT EXISTS parents (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT UNIQUE NOT NULL,
  full_name             TEXT NOT NULL DEFAULT '',
  avatar                TEXT DEFAULT '👨‍👩‍👧',
  plan                  subscription_plan DEFAULT 'free',
  is_admin              BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  last_login            TIMESTAMPTZ,
  email_reports_enabled BOOLEAN DEFAULT TRUE,
  timezone              TEXT DEFAULT 'UTC',
  stripe_customer_id    TEXT,
  referral_code         TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8)
);

DROP TRIGGER IF EXISTS trg_parents_updated_at ON parents;
CREATE TRIGGER trg_parents_updated_at
  BEFORE UPDATE ON parents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: children
-- ============================================================
CREATE TABLE IF NOT EXISTS children (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id    UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  username     TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar       TEXT DEFAULT '🦊',
  age          INTEGER DEFAULT 10 CHECK (age BETWEEN 5 AND 18),
  active_pet   TEXT DEFAULT 'pip',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  last_active  TIMESTAMPTZ,
  is_active    BOOLEAN DEFAULT TRUE,
  UNIQUE (parent_id, username)
);

CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);

DROP TRIGGER IF EXISTS trg_children_updated_at ON children;
CREATE TRIGGER trg_children_updated_at
  BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: child_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS child_profiles (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id                UUID UNIQUE NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  xp                      INTEGER DEFAULT 0 CHECK (xp >= 0),
  coins                   INTEGER DEFAULT 50 CHECK (coins >= 0),
  gems                    INTEGER DEFAULT 5 CHECK (gems >= 0),
  level                   INTEGER DEFAULT 1 CHECK (level >= 1),
  streak_days             INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  longest_streak          INTEGER DEFAULT 0,
  last_streak_date        DATE,
  total_habits_completed  INTEGER DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  total_stories_created   INTEGER DEFAULT 0,
  total_experiments_done  INTEGER DEFAULT 0,
  total_diy_done          INTEGER DEFAULT 0,
  total_engineering_done  INTEGER DEFAULT 0,
  total_saved_amount      NUMERIC(10,2) DEFAULT 0.00,
  talent_primary          TEXT,
  talent_secondary        TEXT[],
  talent_updated_at       TIMESTAMPTZ,
  last_daily_reward       DATE,
  family_xp               INTEGER DEFAULT 0,
  completed_space         TEXT[] DEFAULT '{}',
  completed_family        TEXT[] DEFAULT '{}',
  habits_today            TEXT[] DEFAULT '{}',
  habits_today_date       DATE,
  active_pet              TEXT DEFAULT 'pip',
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_child_profiles_child_id ON child_profiles(child_id);

DROP TRIGGER IF EXISTS trg_child_profiles_updated_at ON child_profiles;
CREATE TRIGGER trg_child_profiles_updated_at
  BEFORE UPDATE ON child_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create child_profile when child is created
CREATE OR REPLACE FUNCTION create_child_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO child_profiles (child_id) VALUES (NEW.id)
  ON CONFLICT (child_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_create_child_profile ON children;
CREATE TRIGGER trg_auto_create_child_profile
  AFTER INSERT ON children FOR EACH ROW EXECUTE FUNCTION create_child_profile();

-- ============================================================
-- TABLE: progress (activity completions)
-- ============================================================
CREATE TABLE IF NOT EXISTS progress (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id               UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  content_type           content_type NOT NULL,
  content_id             TEXT NOT NULL,
  content_name           TEXT,
  completed_at           TIMESTAMPTZ DEFAULT NOW(),
  xp_earned              INTEGER DEFAULT 0,
  coins_earned           INTEGER DEFAULT 0,
  metadata               JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_progress_child_id     ON progress(child_id);
CREATE INDEX IF NOT EXISTS idx_progress_content_type ON progress(content_type);
CREATE INDEX IF NOT EXISTS idx_progress_completed_at ON progress(completed_at DESC);

-- Prevent duplicate completions (stories can repeat)
CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_unique_completion
  ON progress(child_id, content_type, content_id)
  WHERE content_type != 'story';

-- ============================================================
-- TABLE: achievements (earned badges)
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  badge_id    TEXT NOT NULL,
  badge_name  TEXT NOT NULL,
  badge_icon  TEXT NOT NULL,
  tier        TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze','silver','gold','diamond','legendary')),
  category    TEXT NOT NULL,
  earned_at   TIMESTAMPTZ DEFAULT NOW(),
  xp_awarded  INTEGER DEFAULT 0,
  UNIQUE (child_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_achievements_child_id  ON achievements(child_id);
CREATE INDEX IF NOT EXISTS idx_achievements_earned_at ON achievements(earned_at DESC);

-- ============================================================
-- TABLE: stories (AI-generated stories)
-- ============================================================
CREATE TABLE IF NOT EXISTS stories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id     UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  world_id     TEXT NOT NULL,
  hero_id      TEXT NOT NULL,
  xp_earned    INTEGER DEFAULT 80,
  is_favourite BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stories_child_id   ON stories(child_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

-- ============================================================
-- TABLE: savings_goals
-- ============================================================
CREATE TABLE IF NOT EXISTS savings_goals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  emoji       TEXT DEFAULT '🎯',
  target      NUMERIC(10,2) NOT NULL CHECK (target > 0),
  saved       NUMERIC(10,2) DEFAULT 0 CHECK (saved >= 0),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_child_id ON savings_goals(child_id);

DROP TRIGGER IF EXISTS trg_savings_goals_updated_at ON savings_goals;
CREATE TRIGGER trg_savings_goals_updated_at
  BEFORE UPDATE ON savings_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: ai_usage (rate limiting + billing)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_usage (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id         UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  parent_id        UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  feature          ai_feature NOT NULL,
  model_used       TEXT DEFAULT 'claude-3.5-haiku',
  used_at          TIMESTAMPTZ DEFAULT NOW(),
  within_free_limit BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_child_id ON ai_usage(child_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_used_at  ON ai_usage(used_at DESC);
-- Note: used_at::DATE cast is not IMMUTABLE, so we index on used_at directly
-- Rate limiting queries filter by date range instead
CREATE INDEX IF NOT EXISTS idx_ai_usage_daily
  ON ai_usage(child_id, feature, used_at);

-- ============================================================
-- TABLE: subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id               UUID UNIQUE NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  plan                    subscription_plan DEFAULT 'free',
  status                  subscription_status DEFAULT 'active',
  stripe_subscription_id  TEXT UNIQUE,
  stripe_price_id         TEXT,
  trial_ends_at           TIMESTAMPTZ,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancelled_at            TIMESTAMPTZ,
  max_children            INTEGER DEFAULT 1,
  ai_calls_per_day        INTEGER DEFAULT 5,
  monthly_price_usd       NUMERIC(8,2) DEFAULT 0,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_parent_id ON subscriptions(parent_id);

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create free subscription on new parent
CREATE OR REPLACE FUNCTION create_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (parent_id, plan, status, ai_calls_per_day, max_children)
  VALUES (NEW.id, 'free', 'active', 5, 1)
  ON CONFLICT (parent_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_create_subscription ON parents;
CREATE TRIGGER trg_auto_create_subscription
  AFTER INSERT ON parents FOR EACH ROW EXECUTE FUNCTION create_free_subscription();

-- ============================================================
-- TABLE: app_events (privacy-safe analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name  TEXT NOT NULL,
  parent_id   UUID REFERENCES parents(id) ON DELETE SET NULL,
  child_id    UUID REFERENCES children(id) ON DELETE SET NULL,
  properties  JSONB DEFAULT '{}',
  session_id  UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_events_created_at ON app_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_parent_id  ON app_events(parent_id);
CREATE INDEX IF NOT EXISTS idx_app_events_event_name ON app_events(event_name);

-- ============================================================
-- HELPER FUNCTION: is_my_child
-- ============================================================
CREATE OR REPLACE FUNCTION is_my_child(p_child_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM children
    WHERE id = p_child_id AND parent_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE parents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE children             ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress             ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage             ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_events           ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES (drop and recreate = idempotent)
-- ============================================================

-- ── parents ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "parents: read own"   ON parents;
DROP POLICY IF EXISTS "parents: update own" ON parents;
DROP POLICY IF EXISTS "parents: insert own" ON parents;

CREATE POLICY "parents: read own"   ON parents FOR SELECT  USING (id = auth.uid());
CREATE POLICY "parents: update own" ON parents FOR UPDATE  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
-- Allow client-side parent row creation (needed for Google OAuth without service role)
CREATE POLICY "parents: insert own" ON parents FOR INSERT  WITH CHECK (id = auth.uid());

-- ── children ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "children: parent reads"      ON children;
DROP POLICY IF EXISTS "children: parent inserts"    ON children;
DROP POLICY IF EXISTS "children: parent updates"    ON children;
DROP POLICY IF EXISTS "children: parent deletes"    ON children;

CREATE POLICY "children: parent reads"   ON children FOR SELECT USING (parent_id = auth.uid());
CREATE POLICY "children: parent inserts" ON children FOR INSERT WITH CHECK (parent_id = auth.uid());
CREATE POLICY "children: parent updates" ON children FOR UPDATE USING (parent_id = auth.uid()) WITH CHECK (parent_id = auth.uid());
CREATE POLICY "children: parent deletes" ON children FOR DELETE USING (parent_id = auth.uid());

-- ── child_profiles ────────────────────────────────────────────
DROP POLICY IF EXISTS "child_profiles: parent reads"   ON child_profiles;
DROP POLICY IF EXISTS "child_profiles: parent updates" ON child_profiles;

CREATE POLICY "child_profiles: parent reads"   ON child_profiles FOR SELECT USING (is_my_child(child_id));
CREATE POLICY "child_profiles: parent updates" ON child_profiles FOR UPDATE USING (is_my_child(child_id)) WITH CHECK (is_my_child(child_id));

-- ── progress ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "progress: parent reads" ON progress;
DROP POLICY IF EXISTS "progress: insert"       ON progress;

CREATE POLICY "progress: parent reads" ON progress FOR SELECT USING (is_my_child(child_id));
CREATE POLICY "progress: insert"       ON progress FOR INSERT WITH CHECK (is_my_child(child_id));

-- ── achievements ─────────────────────────────────────────────
DROP POLICY IF EXISTS "achievements: parent reads" ON achievements;
DROP POLICY IF EXISTS "achievements: insert"       ON achievements;

CREATE POLICY "achievements: parent reads" ON achievements FOR SELECT USING (is_my_child(child_id));
CREATE POLICY "achievements: insert"       ON achievements FOR INSERT WITH CHECK (is_my_child(child_id));

-- ── stories ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "stories: parent reads" ON stories;
DROP POLICY IF EXISTS "stories: insert"       ON stories;
DROP POLICY IF EXISTS "stories: update"       ON stories;

CREATE POLICY "stories: parent reads" ON stories FOR SELECT USING (is_my_child(child_id));
CREATE POLICY "stories: insert"       ON stories FOR INSERT WITH CHECK (is_my_child(child_id));
CREATE POLICY "stories: update"       ON stories FOR UPDATE USING (is_my_child(child_id));

-- ── savings_goals ─────────────────────────────────────────────
DROP POLICY IF EXISTS "savings_goals: parent reads"   ON savings_goals;
DROP POLICY IF EXISTS "savings_goals: insert"         ON savings_goals;
DROP POLICY IF EXISTS "savings_goals: update"         ON savings_goals;
DROP POLICY IF EXISTS "savings_goals: delete"         ON savings_goals;

CREATE POLICY "savings_goals: parent reads"   ON savings_goals FOR SELECT USING (is_my_child(child_id));
CREATE POLICY "savings_goals: insert"         ON savings_goals FOR INSERT WITH CHECK (is_my_child(child_id));
CREATE POLICY "savings_goals: update"         ON savings_goals FOR UPDATE USING (is_my_child(child_id));
CREATE POLICY "savings_goals: delete"         ON savings_goals FOR DELETE USING (is_my_child(child_id));

-- ── ai_usage ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "ai_usage: parent reads" ON ai_usage;
DROP POLICY IF EXISTS "ai_usage: insert"       ON ai_usage;

CREATE POLICY "ai_usage: parent reads" ON ai_usage FOR SELECT USING (parent_id = auth.uid());
CREATE POLICY "ai_usage: insert"       ON ai_usage FOR INSERT WITH CHECK (parent_id = auth.uid() AND is_my_child(child_id));

-- ── subscriptions ─────────────────────────────────────────────
DROP POLICY IF EXISTS "subscriptions: parent reads" ON subscriptions;

CREATE POLICY "subscriptions: parent reads" ON subscriptions FOR SELECT USING (parent_id = auth.uid());

-- ── app_events ────────────────────────────────────────────────
DROP POLICY IF EXISTS "app_events: insert" ON app_events;
DROP POLICY IF EXISTS "app_events: admin reads" ON app_events;

CREATE POLICY "app_events: insert"      ON app_events FOR INSERT WITH CHECK (true);  -- any auth user can log events
CREATE POLICY "app_events: admin reads" ON app_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM parents WHERE id = auth.uid() AND is_admin = TRUE)
);

-- ============================================================
-- VIEWS
-- ============================================================
CREATE OR REPLACE VIEW ai_daily_usage AS
SELECT child_id, parent_id, feature, used_at::DATE AS usage_date, COUNT(*) AS call_count
FROM ai_usage
WHERE used_at >= NOW() - INTERVAL '1 day'
GROUP BY child_id, parent_id, feature, used_at::DATE;

-- ============================================================
-- NOTE: Science experiment content is stored in the app's
-- local data files (data/experiments.ts), not in the database.
-- The database tracks which experiments each child HAS COMPLETED
-- (in the 'progress' table), not the experiment content itself.
-- No seed data needed here.
-- ============================================================

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
DO $$ BEGIN
  RAISE NOTICE '✅ AI Kids Academy database setup complete!';
  RAISE NOTICE 'Tables created: parents, children, child_profiles, progress, achievements, stories, savings_goals, ai_usage, subscriptions, app_events';
  RAISE NOTICE 'RLS enabled and policies applied on all tables';
  RAISE NOTICE 'Triggers created for: updated_at, auto-create child_profile, auto-create subscription';
  RAISE NOTICE 'Science experiments seeded (8 experiments)';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEP: Get your service_role key from Supabase Dashboard';
  RAISE NOTICE 'Dashboard → Project Settings → API → service_role (secret)';
  RAISE NOTICE 'Add to .env.local as: SUPABASE_SERVICE_ROLE_KEY=eyJ...';
END $$;
