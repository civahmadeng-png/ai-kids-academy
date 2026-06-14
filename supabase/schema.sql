-- ============================================================
-- AI Kids Academy — Supabase Database Schema
-- Version: 1.0
-- Run this in your Supabase SQL Editor (Database > SQL Editor)
-- ============================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE subscription_plan AS ENUM ('free', 'premium', 'family');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE content_type AS ENUM (
  'science_experiment', 'diy_project', 'engineering_challenge',
  'discovery_mission', 'ai_lesson', 'story', 'career_exploration'
);
CREATE TYPE ai_feature AS ENUM (
  'mentor', 'prompt_challenge', 'art_generation',
  'story_generation', 'diy_builder', 'savings_tip'
);

-- ============================================================
-- TABLE 1: parents
-- Stores parent/guardian accounts.
-- Auth is handled by Supabase Auth (auth.users).
-- This table extends the auth user with app-specific data.
-- ============================================================

CREATE TABLE parents (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT UNIQUE NOT NULL,
  full_name    TEXT NOT NULL,
  avatar       TEXT DEFAULT '👨‍👩‍👧',
  plan         subscription_plan DEFAULT 'free',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  last_login   TIMESTAMPTZ,
  -- Preferences
  email_reports_enabled BOOLEAN DEFAULT TRUE,
  weekly_summary_day    INTEGER DEFAULT 0, -- 0=Sunday
  timezone     TEXT DEFAULT 'UTC',
  -- Metadata
  stripe_customer_id    TEXT,               -- for future Stripe integration
  referral_code         TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8)
);

COMMENT ON TABLE parents IS 'Parent/guardian accounts. One parent can have multiple child profiles.';

-- ============================================================
-- TABLE 2: children
-- Child accounts linked to a parent.
-- Children login using a simple PIN or parent-delegated session.
-- ============================================================

CREATE TABLE children (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id    UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  username     TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar       TEXT DEFAULT '🦊',
  age          INTEGER CHECK (age BETWEEN 5 AND 18),
  pin_hash     TEXT,                         -- simple 4-digit PIN for kids
  active_pet   TEXT DEFAULT 'pip',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  last_active  TIMESTAMPTZ,
  is_active    BOOLEAN DEFAULT TRUE,
  -- Uniqueness: username must be unique per parent
  UNIQUE (parent_id, username)
);

COMMENT ON TABLE children IS 'Child profiles. Each child belongs to exactly one parent account.';

-- Index for fast lookups by parent
CREATE INDEX idx_children_parent_id ON children(parent_id);

-- ============================================================
-- TABLE 3: child_profiles
-- Gamification and progress summary for each child.
-- One row per child — updated frequently.
-- ============================================================

CREATE TABLE child_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id        UUID UNIQUE NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  -- Gamification
  xp              INTEGER DEFAULT 0 CHECK (xp >= 0),
  coins           INTEGER DEFAULT 50 CHECK (coins >= 0),
  gems            INTEGER DEFAULT 5 CHECK (gems >= 0),
  level           INTEGER DEFAULT 1 CHECK (level >= 1),
  streak_days     INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  longest_streak  INTEGER DEFAULT 0,
  last_streak_date DATE,
  -- Totals
  total_habits_completed  INTEGER DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  total_stories_created   INTEGER DEFAULT 0,
  total_experiments_done  INTEGER DEFAULT 0,
  total_saved_amount      NUMERIC(10,2) DEFAULT 0.00,
  -- Talent profile
  talent_primary    TEXT,
  talent_secondary  TEXT[],
  talent_updated_at TIMESTAMPTZ,
  -- Daily reward
  last_daily_reward DATE,
  -- Family XP
  family_xp         INTEGER DEFAULT 0,
  -- Timestamps
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE child_profiles IS 'Gamification stats and summary metrics for each child. Updated on every XP/coin/streak change.';

CREATE INDEX idx_child_profiles_child_id ON child_profiles(child_id);

-- ============================================================
-- TABLE 4: progress
-- Tracks every completed activity for every child.
-- Core progress tracking table — append-only log.
-- ============================================================

CREATE TABLE progress (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id     UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  content_type content_type NOT NULL,
  content_id   TEXT NOT NULL,      -- e.g. lesson id, experiment id, etc.
  content_name TEXT,               -- human-readable name for reports
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  score        INTEGER,            -- quiz score 0-100 if applicable
  xp_earned    INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  time_spent_seconds INTEGER,      -- optional: time tracking
  metadata     JSONB DEFAULT '{}'  -- flexible extra data per content type
);

COMMENT ON TABLE progress IS 'Append-only log of every completed activity. Used for parent reports and analytics.';

CREATE INDEX idx_progress_child_id      ON progress(child_id);
CREATE INDEX idx_progress_content_type  ON progress(content_type);
CREATE INDEX idx_progress_completed_at  ON progress(completed_at DESC);
-- Prevent duplicate completions for non-repeatable content
CREATE UNIQUE INDEX idx_progress_unique_completion
  ON progress(child_id, content_type, content_id)
  WHERE content_type != 'story';  -- stories can be repeated

-- ============================================================
-- TABLE 5: achievements
-- Tracks earned badges and achievements per child.
-- ============================================================

CREATE TABLE achievements (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id     UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  badge_id     TEXT NOT NULL,      -- matches ACHIEVEMENTS data array keys
  badge_name   TEXT NOT NULL,
  badge_icon   TEXT NOT NULL,
  tier         TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze','silver','gold','diamond','legendary')),
  category     TEXT NOT NULL,      -- 'learning', 'science', 'engineering', etc.
  earned_at    TIMESTAMPTZ DEFAULT NOW(),
  xp_awarded   INTEGER DEFAULT 0,
  -- Prevent duplicate badges
  UNIQUE (child_id, badge_id)
);

COMMENT ON TABLE achievements IS 'Badges earned by each child. One row per badge per child — no duplicates.';

CREATE INDEX idx_achievements_child_id ON achievements(child_id);
CREATE INDEX idx_achievements_earned_at ON achievements(earned_at DESC);

-- ============================================================
-- TABLE 6: science_experiments
-- Master list of all science experiments in the app.
-- Seeded once — children reference these by id.
-- ============================================================

CREATE TABLE science_experiments (
  id            TEXT PRIMARY KEY,           -- e.g. 'volcano', 'rainbow'
  name          TEXT NOT NULL,
  description   TEXT,
  difficulty    difficulty_level DEFAULT 'easy',
  age_minimum   INTEGER DEFAULT 9,
  time_minutes  INTEGER,
  xp_reward     INTEGER DEFAULT 60,
  materials     TEXT[],
  steps         TEXT[],
  safety_note   TEXT,
  parent_supervision TEXT,
  science_concept TEXT,                     -- the main concept being taught
  quiz_question TEXT,
  quiz_options  TEXT[],
  quiz_answer   INTEGER,                    -- index of correct answer
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE science_experiments IS 'Master catalog of all science experiments. Referenced by child progress records.';

-- ============================================================
-- TABLE 7: diy_projects
-- Master list of all DIY projects.
-- ============================================================

CREATE TABLE diy_projects (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  difficulty    difficulty_level DEFAULT 'easy',
  time_minutes  INTEGER,
  skill_focus   TEXT,                       -- e.g. 'Engineering', 'Creativity'
  skill_description TEXT,
  xp_reward     INTEGER DEFAULT 50,
  materials     TEXT[],
  steps         TEXT[],
  challenge     TEXT,                       -- the bonus challenge
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE diy_projects IS 'Master catalog of all DIY projects with materials, steps, and skills developed.';

-- ============================================================
-- TABLE 8: engineering_challenges
-- STEM engineering challenges catalog.
-- ============================================================

CREATE TABLE engineering_challenges (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  goal            TEXT NOT NULL,
  materials       TEXT[],
  rules           TEXT[],
  engineering_principle TEXT,
  design_thinking TEXT,
  testing_method  TEXT,
  improvement_tips TEXT,
  skills          TEXT[],
  xp_reward       INTEGER DEFAULT 80,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE engineering_challenges IS 'STEM engineering challenges. Each has a design brief, materials, and engineering principle.';

-- ============================================================
-- TABLE 9: discovery_missions
-- Real-world exploration missions children do outside.
-- ============================================================

CREATE TABLE discovery_missions (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  objective     TEXT NOT NULL,
  instructions  TEXT[],
  difficulty    difficulty_level DEFAULT 'easy',
  time_estimate TEXT,                       -- e.g. '30 min', '5 days'
  reflection_question TEXT,
  skills        TEXT[],
  xp_reward     INTEGER DEFAULT 55,
  requires_outdoors BOOLEAN DEFAULT TRUE,
  age_minimum   INTEGER DEFAULT 9,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE discovery_missions IS 'Real-world exploration missions. Children go outside, observe, and reflect.';

-- ============================================================
-- TABLE 10: stories
-- AI-generated stories created by children.
-- Each story is unique and belongs to one child.
-- ============================================================

CREATE TABLE stories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id     UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  world_id     TEXT NOT NULL,               -- 'fantasy', 'space', 'dino', etc.
  hero_id      TEXT NOT NULL,               -- 'brave', 'smart', 'kind', etc.
  difficulty   TEXT DEFAULT 'medium',
  full_content TEXT NOT NULL,               -- full AI-generated story text
  word_count   INTEGER,
  xp_earned    INTEGER DEFAULT 60,
  is_favourite BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE stories IS 'AI-generated stories created by children. Each is unique — full text stored for parent review.';

CREATE INDEX idx_stories_child_id   ON stories(child_id);
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);

-- ============================================================
-- TABLE 11: story_choices
-- Tracks decisions children make in branching stories.
-- Used for personality/talent analytics.
-- ============================================================

CREATE TABLE story_choices (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id   UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  child_id   UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  chapter    INTEGER NOT NULL,
  choice_text TEXT NOT NULL,               -- which option the child picked
  choice_index INTEGER NOT NULL,           -- A=0, B=1, C=2
  chosen_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE story_choices IS 'Records every branching choice a child makes. Used for personality insights and engagement analytics.';

CREATE INDEX idx_story_choices_child_id ON story_choices(child_id);
CREATE INDEX idx_story_choices_story_id ON story_choices(story_id);

-- ============================================================
-- TABLE 12: ai_usage
-- Tracks every AI API call per child.
-- Used for rate limiting (free plan = 3/day) and billing.
-- ============================================================

CREATE TABLE ai_usage (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id     UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  parent_id    UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  feature      ai_feature NOT NULL,
  prompt_length INTEGER,                   -- chars in the prompt
  response_length INTEGER,                 -- chars in the response
  tokens_used  INTEGER,                    -- for cost tracking
  model_used   TEXT DEFAULT 'claude-3.5-haiku',
  cost_usd     NUMERIC(8,6) DEFAULT 0,     -- estimated cost
  used_at      TIMESTAMPTZ DEFAULT NOW(),
  -- Was this within the free plan limit?
  within_free_limit BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE ai_usage IS 'Every AI API call logged here. Used for rate limiting (free=3/day), cost tracking, and billing.';

CREATE INDEX idx_ai_usage_child_id  ON ai_usage(child_id);
CREATE INDEX idx_ai_usage_parent_id ON ai_usage(parent_id);
CREATE INDEX idx_ai_usage_used_at   ON ai_usage(used_at DESC);
-- For rate-limiting queries: count usage per child per day
CREATE INDEX idx_ai_usage_daily
  ON ai_usage(child_id, feature, (used_at::DATE));

-- ============================================================
-- TABLE 13: subscriptions
-- Subscription records per parent.
-- Linked to Stripe for payment processing.
-- ============================================================

CREATE TABLE subscriptions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id            UUID UNIQUE NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  plan                 subscription_plan DEFAULT 'free',
  status               subscription_status DEFAULT 'active',
  -- Stripe fields (populated when payment is added)
  stripe_subscription_id  TEXT UNIQUE,
  stripe_price_id         TEXT,
  stripe_product_id       TEXT,
  -- Dates
  trial_ends_at        TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancelled_at         TIMESTAMPTZ,
  -- Plan limits (denormalised for fast reads)
  max_children         INTEGER DEFAULT 1,
  ai_calls_per_day     INTEGER DEFAULT 3,   -- free=3, premium=999, family=999
  -- Billing
  monthly_price_usd    NUMERIC(8,2) DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE subscriptions IS 'One subscription record per parent. Stripe webhook updates this. Free plan is auto-created on registration.';

CREATE INDEX idx_subscriptions_parent_id ON subscriptions(parent_id);
CREATE INDEX idx_subscriptions_status    ON subscriptions(status);

-- ============================================================
-- TABLE 14: parent_reports
-- Weekly/monthly snapshot reports generated for parents.
-- Cached so they load instantly in the dashboard.
-- ============================================================

CREATE TABLE parent_reports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id    UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  child_id     UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  report_type  TEXT DEFAULT 'weekly' CHECK (report_type IN ('weekly','monthly','milestone')),
  period_start DATE NOT NULL,
  period_end   DATE NOT NULL,
  -- Metrics snapshot (JSON for flexibility)
  metrics      JSONB NOT NULL DEFAULT '{}',
  -- Example metrics structure:
  -- {
  --   "xp_earned": 340, "lessons": 3, "experiments": 2,
  --   "streak_days": 5, "stories_created": 1, "savings_added": 5.00,
  --   "skills": {"stem": 65, "creativity": 40, "ai_literacy": 72},
  --   "top_activity": "Science Lab", "improvement_areas": ["Engineering"],
  --   "parent_tips": ["Ask about the volcano experiment!"]
  -- }
  highlights   TEXT[],                     -- 3 bullet points for quick read
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  emailed_at   TIMESTAMPTZ,                -- null = not yet emailed
  UNIQUE (child_id, report_type, period_start)
);

COMMENT ON TABLE parent_reports IS 'Pre-computed weekly/monthly reports. Generated by a cron job. Emailed to parents automatically.';

CREATE INDEX idx_parent_reports_parent_id ON parent_reports(parent_id);
CREATE INDEX idx_parent_reports_child_id  ON parent_reports(child_id);
CREATE INDEX idx_parent_reports_period    ON parent_reports(period_start DESC);

-- ============================================================
-- TABLE 15: family_missions
-- Missions that parents and children complete together.
-- Tracks completion and family XP.
-- ============================================================

CREATE TABLE family_missions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id    UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  child_id     UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  mission_id   TEXT NOT NULL,              -- references FAMILY_MISSIONS data
  mission_name TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  xp_awarded   INTEGER DEFAULT 80,
  parent_confirmed BOOLEAN DEFAULT FALSE,  -- parent must confirm completion
  notes        TEXT,                       -- optional family note
  -- Prevent duplicate completions of same mission in same week
  UNIQUE (child_id, mission_id, date_trunc('week', completed_at))
);

COMMENT ON TABLE family_missions IS 'Records family missions completed together. Parent must confirm for XP to be awarded.';

CREATE INDEX idx_family_missions_parent_id ON family_missions(parent_id);
CREATE INDEX idx_family_missions_child_id  ON family_missions(child_id);

-- ============================================================
-- TABLE 16: uploaded_creations
-- Photos and reflections children submit from My Creations.
-- Files stored in Supabase Storage bucket 'creations'.
-- ============================================================

CREATE TABLE uploaded_creations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id      UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  parent_id     UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  creation_type TEXT NOT NULL CHECK (creation_type IN (
    'Science Experiment', 'DIY Project', 'AI Artwork', 'Engineering Challenge', 'Other Creation'
  )),
  title         TEXT,
  reflection    TEXT NOT NULL,             -- child's written reflection
  -- File reference (stored in Supabase Storage)
  storage_path  TEXT,                      -- path in 'creations' bucket
  storage_url   TEXT,                      -- public URL (if bucket is public)
  file_size_kb  INTEGER,
  -- Moderation
  parent_approved   BOOLEAN DEFAULT FALSE,
  parent_approved_at TIMESTAMPTZ,
  is_flagged        BOOLEAN DEFAULT FALSE,  -- for content moderation
  -- Rewards
  xp_awarded    INTEGER DEFAULT 40,
  uploaded_at   TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE uploaded_creations IS 'Photos/reflections from My Creations. Files in Supabase Storage. Parent must approve before child sees it shared.';

CREATE INDEX idx_uploaded_creations_child_id  ON uploaded_creations(child_id);
CREATE INDEX idx_uploaded_creations_parent_id ON uploaded_creations(parent_id);
CREATE INDEX idx_uploaded_creations_approved  ON uploaded_creations(parent_approved);

-- ============================================================
-- HELPER: updated_at trigger function
-- Automatically updates the updated_at column on any UPDATE
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables that have updated_at
CREATE TRIGGER trg_parents_updated_at
  BEFORE UPDATE ON parents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_child_profiles_updated_at
  BEFORE UPDATE ON child_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED: Auto-create child_profile on new child
-- ============================================================

CREATE OR REPLACE FUNCTION create_child_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO child_profiles (child_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_create_child_profile
  AFTER INSERT ON children
  FOR EACH ROW EXECUTE FUNCTION create_child_profile();

-- ============================================================
-- SEED: Auto-create free subscription on new parent
-- ============================================================

CREATE OR REPLACE FUNCTION create_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (
    parent_id, plan, status, ai_calls_per_day, max_children
  ) VALUES (
    NEW.id, 'free', 'active', 3, 1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_create_subscription
  AFTER INSERT ON parents
  FOR EACH ROW EXECUTE FUNCTION create_free_subscription();

-- ============================================================
-- SEED: Science experiments master data
-- ============================================================

INSERT INTO science_experiments (id, name, difficulty, age_minimum, time_minutes, xp_reward, materials, steps, safety_note, parent_supervision, science_concept, quiz_question, quiz_options, quiz_answer) VALUES
('volcano','Baking Soda Volcano','easy',9,15,60,
  ARRAY['Baking soda (2 tbsp)','White vinegar (half cup)','Small bottle','Dish soap','Food coloring','Tray'],
  ARRAY['Place bottle on tray','Add 2 tbsp baking soda','Add dish soap and food coloring','Pour vinegar in slowly','Watch the eruption!'],
  'Use a tray to catch spills. Vinegar can sting eyes.',
  'Minimal supervision',
  'Acid-base reactions producing CO₂ gas',
  'What gas is created when baking soda and vinegar mix?',
  ARRAY['Oxygen','Carbon Dioxide','Hydrogen','Nitrogen'],
  1),
('rainbow','Rainbow Density Cup','medium',10,20,70,
  ARRAY['Honey','Dish soap','Blue-colored water','Vegetable oil','Red alcohol','Tall clear glass'],
  ARRAY['Pour honey at bottom','Add dish soap slowly','Add blue water','Add oil on top','Add red alcohol last — do NOT stir'],
  'Ask parent to help with rubbing alcohol. Do not drink any liquids.',
  'Parent should help with alcohol',
  'Liquid density and buoyancy',
  'Why do the liquids form separate layers?',
  ARRAY['Different colors','Different densities','Different temperatures','Different volumes'],
  1),
('battery','Lemon Battery','medium',10,25,80,
  ARRAY['2-3 fresh lemons','Copper coins','Galvanized nails','Small LED light','Connecting wires'],
  ARRAY['Roll lemons to release juice','Insert copper coin halfway','Insert zinc nail (not touching copper)','Connect lemons in series','Connect ends to LED'],
  'Only use low-voltage LEDs. Never connect to wall outlets.',
  'Parent supervision recommended',
  'Electrochemical reactions and circuits',
  'What makes the lemon battery work?',
  ARRAY['Yellow color','Lemon juice acts as electrolyte between two metals','Lemons store electricity','Weight of metals'],
  1);

-- (Add remaining 5 experiments similarly in production seed)
