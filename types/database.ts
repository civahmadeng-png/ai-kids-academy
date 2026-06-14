// ============================================================
// AI Kids Academy — Supabase Database Types
// Auto-generated structure matching supabase/schema.sql
//
// Usage:
//   import type { Database } from '@/types/database';
//   import type { Tables } from '@/types/database';
//
//   const parent: Tables<'parents'> = { ... }
//   const progress: Tables<'progress'> = { ... }
// ============================================================

// ── Convenience alias ─────────────────────────────────────────
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// ── Enum types ────────────────────────────────────────────────
export type SubscriptionPlan   = 'free' | 'premium' | 'family';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';
export type DifficultyLevel    = 'easy' | 'medium' | 'hard';
export type ContentType =
  | 'science_experiment'
  | 'diy_project'
  | 'engineering_challenge'
  | 'discovery_mission'
  | 'ai_lesson'
  | 'story'
  | 'career_exploration';
export type AIFeature =
  | 'mentor'
  | 'prompt_challenge'
  | 'art_generation'
  | 'story_generation'
  | 'diy_builder'
  | 'savings_tip';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';

// ── Row types (what SELECT returns) ──────────────────────────
export interface ParentRow {
  id: string;
  email: string;
  full_name: string;
  avatar: string;
  plan: SubscriptionPlan;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  email_reports_enabled: boolean;
  timezone: string;
  stripe_customer_id: string | null;
  referral_code: string;
}

export interface ChildRow {
  id: string;
  parent_id: string;
  username: string;
  display_name: string;
  avatar: string;
  age: number | null;
  active_pet: string;
  created_at: string;
  updated_at: string;
  last_active: string | null;
  is_active: boolean;
}

export interface ChildProfileRow {
  id: string;
  child_id: string;
  xp: number;
  coins: number;
  gems: number;
  level: number;
  streak_days: number;
  longest_streak: number;
  last_streak_date: string | null;
  total_habits_completed: number;
  total_lessons_completed: number;
  total_stories_created: number;
  total_experiments_done: number;
  total_saved_amount: number;
  talent_primary: string | null;
  talent_secondary: string[] | null;
  talent_updated_at: string | null;
  last_daily_reward: string | null;
  family_xp: number;
  created_at: string;
  updated_at: string;
}

export interface ProgressRow {
  id: string;
  child_id: string;
  content_type: ContentType;
  content_id: string;
  content_name: string | null;
  completed_at: string;
  xp_earned: number;
  coins_earned: number;
  metadata: Record<string, unknown>;
}

export interface AchievementRow {
  id: string;
  child_id: string;
  badge_id: string;
  badge_name: string;
  badge_icon: string;
  tier: AchievementTier;
  category: string;
  earned_at: string;
  xp_awarded: number;
}

export interface ScienceExperimentRow {
  id: string;
  name: string;
  description: string | null;
  difficulty: DifficultyLevel;
  age_minimum: number;
  time_minutes: number | null;
  xp_reward: number;
  materials: string[];
  steps: string[];
  safety_note: string | null;
  parent_supervision: string | null;
  science_concept: string | null;
  quiz_question: string | null;
  quiz_options: string[] | null;
  quiz_answer: number | null;
  is_active: boolean;
  created_at: string;
}

export interface DIYProjectRow {
  id: string;
  name: string;
  description: string | null;
  difficulty: DifficultyLevel;
  time_minutes: number | null;
  skill_focus: string | null;
  skill_description: string | null;
  xp_reward: number;
  materials: string[];
  steps: string[];
  challenge: string | null;
  is_active: boolean;
  created_at: string;
}

export interface EngineeringChallengeRow {
  id: string;
  name: string;
  goal: string;
  materials: string[];
  rules: string[];
  engineering_principle: string | null;
  design_thinking: string | null;
  testing_method: string | null;
  improvement_tips: string | null;
  skills: string[];
  xp_reward: number;
  is_active: boolean;
  created_at: string;
}

export interface DiscoveryMissionRow {
  id: string;
  name: string;
  objective: string;
  instructions: string[];
  difficulty: DifficultyLevel;
  time_estimate: string | null;
  reflection_question: string | null;
  skills: string[];
  xp_reward: number;
  requires_outdoors: boolean;
  age_minimum: number;
  is_active: boolean;
  created_at: string;
}

export interface StoryRow {
  id: string;
  child_id: string;
  title: string;
  world_id: string;
  hero_id: string;
  difficulty: string;
  full_content: string;
  word_count: number | null;
  xp_earned: number;
  is_favourite: boolean;
  created_at: string;
}

export interface StoryChoiceRow {
  id: string;
  story_id: string;
  child_id: string;
  chapter: number;
  choice_text: string;
  choice_index: number;
  chosen_at: string;
}

export interface AIUsageRow {
  id: string;
  child_id: string;
  parent_id: string;
  feature: AIFeature;
  prompt_length: number | null;
  response_length: number | null;
  tokens_used: number | null;
  model_used: string;
  cost_usd: number;
  used_at: string;
  within_free_limit: boolean;
}

export interface SubscriptionRow {
  id: string;
  parent_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  max_children: number;
  ai_calls_per_day: number;
  monthly_price_usd: number;
  created_at: string;
  updated_at: string;
}

export interface ParentReportRow {
  id: string;
  parent_id: string;
  child_id: string;
  report_type: 'weekly' | 'monthly' | 'milestone';
  period_start: string;
  period_end: string;
  metrics: ReportMetrics;
  highlights: string[];
  generated_at: string;
  emailed_at: string | null;
}

export interface FamilyMissionRow {
  id: string;
  parent_id: string;
  child_id: string;
  mission_id: string;
  mission_name: string;
  completed_at: string;
  xp_awarded: number;
  parent_confirmed: boolean;
  notes: string | null;
}

export interface UploadedCreationRow {
  id: string;
  child_id: string;
  parent_id: string;
  creation_type: string;
  title: string | null;
  reflection: string;
  storage_path: string | null;
  storage_url: string | null;
  file_size_kb: number | null;
  parent_approved: boolean;
  parent_approved_at: string | null;
  is_flagged: boolean;
  xp_awarded: number;
  uploaded_at: string;
}

// ── Report metrics structure ──────────────────────────────────
export interface ReportMetrics {
  xp_earned: number;
  lessons_completed: number;
  experiments_completed: number;
  diy_completed: number;
  engineering_completed: number;
  stories_created: number;
  careers_explored: number;
  streak_days: number;
  habits_completed: number;
  savings_added: number;
  family_missions: number;
  skills: SkillScores;
  top_activity: string;
  improvement_areas: string[];
  parent_tips: string[];
}

export interface SkillScores {
  stem_science: number;        // 0-100
  creativity: number;
  ai_literacy: number;
  critical_thinking: number;
  financial_literacy: number;
  responsibility: number;
  career_exploration: number;
  storytelling: number;
}

// ── Plan limits (derived from subscription) ───────────────────
export interface PlanLimits {
  aiCallsPerDay: number;
  storiesPerMonth: number;
  artGenerationsPerDay: number;
  maxChildren: number;
  hasWeeklyReport: boolean;
  hasFamilyMissions: boolean;
  hasAllModules: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    aiCallsPerDay: 3,
    storiesPerMonth: 5,
    artGenerationsPerDay: 3,
    maxChildren: 1,
    hasWeeklyReport: false,
    hasFamilyMissions: false,
    hasAllModules: false,
  },
  premium: {
    aiCallsPerDay: 999,
    storiesPerMonth: 999,
    artGenerationsPerDay: 999,
    maxChildren: 1,
    hasWeeklyReport: true,
    hasFamilyMissions: false,
    hasAllModules: true,
  },
  family: {
    aiCallsPerDay: 999,
    storiesPerMonth: 999,
    artGenerationsPerDay: 999,
    maxChildren: 4,
    hasWeeklyReport: true,
    hasFamilyMissions: true,
    hasAllModules: true,
  },
};

// ── Full Supabase Database type (used by createClient<Database>) ─
export interface Database {
  public: {
    Tables: {
      parents: {
        Row:    ParentRow;
        Insert: Omit<ParentRow, 'created_at' | 'updated_at' | 'referral_code'> & {
          created_at?: string;
          updated_at?: string;
          referral_code?: string;
        };
        Update: Partial<ParentRow>;
      };
      children: {
        Row:    ChildRow;
        Insert: Omit<ChildRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ChildRow, 'id' | 'parent_id'>>;
      };
      child_profiles: {
        Row:    ChildProfileRow;
        Insert: Omit<ChildProfileRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ChildProfileRow, 'id' | 'child_id'>>;
      };
      progress: {
        Row:    ProgressRow;
        Insert: Omit<ProgressRow, 'id' | 'completed_at'> & {
          id?: string;
          completed_at?: string;
        };
        Update: never; // progress is append-only
      };
      achievements: {
        Row:    AchievementRow;
        Insert: Omit<AchievementRow, 'id' | 'earned_at'> & {
          id?: string;
          earned_at?: string;
        };
        Update: never; // achievements are permanent
      };
      science_experiments: {
        Row:    ScienceExperimentRow;
        Insert: Omit<ScienceExperimentRow, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<ScienceExperimentRow, 'id'>>;
      };
      diy_projects: {
        Row:    DIYProjectRow;
        Insert: Omit<DIYProjectRow, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<DIYProjectRow, 'id'>>;
      };
      engineering_challenges: {
        Row:    EngineeringChallengeRow;
        Insert: Omit<EngineeringChallengeRow, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<EngineeringChallengeRow, 'id'>>;
      };
      discovery_missions: {
        Row:    DiscoveryMissionRow;
        Insert: Omit<DiscoveryMissionRow, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<DiscoveryMissionRow, 'id'>>;
      };
      stories: {
        Row:    StoryRow;
        Insert: Omit<StoryRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Pick<StoryRow, 'is_favourite'>;
      };
      story_choices: {
        Row:    StoryChoiceRow;
        Insert: Omit<StoryChoiceRow, 'id' | 'chosen_at'> & {
          id?: string;
          chosen_at?: string;
        };
        Update: never;
      };
      ai_usage: {
        Row:    AIUsageRow;
        Insert: Omit<AIUsageRow, 'id' | 'used_at'> & {
          id?: string;
          used_at?: string;
        };
        Update: never; // ai_usage is immutable
      };
      subscriptions: {
        Row:    SubscriptionRow;
        Insert: Omit<SubscriptionRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<SubscriptionRow, 'id' | 'parent_id'>>;
      };
      parent_reports: {
        Row:    ParentReportRow;
        Insert: Omit<ParentReportRow, 'id' | 'generated_at'> & {
          id?: string;
          generated_at?: string;
        };
        Update: Pick<ParentReportRow, 'emailed_at'>;
      };
      family_missions: {
        Row:    FamilyMissionRow;
        Insert: Omit<FamilyMissionRow, 'id' | 'completed_at'> & {
          id?: string;
          completed_at?: string;
        };
        Update: Pick<FamilyMissionRow, 'parent_confirmed' | 'notes'>;
      };
      uploaded_creations: {
        Row:    UploadedCreationRow;
        Insert: Omit<UploadedCreationRow, 'id' | 'uploaded_at'> & {
          id?: string;
          uploaded_at?: string;
        };
        Update: Partial<Pick<UploadedCreationRow, 'parent_approved' | 'parent_approved_at' | 'is_flagged' | 'title'>>;
      };
    };
    Views: {
      ai_daily_usage: {
        Row: {
          child_id: string;
          parent_id: string;
          feature: AIFeature;
          usage_date: string;
          call_count: number;
        };
      };
    };
    Functions: {
      is_my_child: {
        Args: { p_child_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      subscription_plan:   SubscriptionPlan;
      subscription_status: SubscriptionStatus;
      difficulty_level:    DifficultyLevel;
      content_type:        ContentType;
      ai_feature:          AIFeature;
    };
  };
}
