'use client';
// ============================================================
// AI Kids Academy — Subscription Service (Step 7)
// Plan logic, feature gates, Supabase sync, dev switcher.
// No real payments yet — Stripe wired in Step 8.
// ============================================================

import { getRawClient, isDemoMode } from '@/lib/supabaseClient';
import { Analytics } from '@/lib/analytics';

export type Plan = 'free' | 'premium' | 'family';

// ── Plan definitions (single source of truth) ─────────────────
export interface PlanDef {
  id:          Plan;
  name:        string;
  badge:       string;
  emoji:       string;
  price:       number;       // USD/month
  yearlyPrice: number;       // USD/month when billed annually
  color:       string;
  gradient:    string;
  tagline:     string;
  cta:         string;
  features:    PlanFeature[];
  limits:      PlanLimitsDetail;
}

export interface PlanFeature {
  text:      string;
  included:  boolean;
  highlight?: boolean;       // bold this feature in the UI
}

export interface PlanLimitsDetail {
  childProfiles:    number | 'unlimited';
  aiMentorPerDay:   number | 'unlimited';
  storiesPerMonth:  number | 'unlimited';
  artPerDay:        number | 'unlimited';
  weeklyReports:    boolean;
  monthlyReports:   boolean;
  familyMissions:   boolean;
  premiumBadges:    boolean;
  advancedAnalytics:boolean;
  exportReports:    boolean;
}

export const PLANS: Record<Plan, PlanDef> = {
  free: {
    id: 'free', name: 'Free Explorer', badge: '🆓', emoji: '🌱',
    price: 0, yearlyPrice: 0,
    color: '#6B7280', gradient: 'linear-gradient(135deg,#6B7280,#9CA3AF)',
    tagline: 'Perfect for getting started',
    cta: 'Current Plan',
    features: [
      { text: '1 child profile',                  included: true  },
      { text: 'AI Explorer (12 lessons)',          included: true  },
      { text: 'Science Lab (all 8 experiments)',   included: true  },
      { text: 'Habit & Savings tracker',           included: true  },
      { text: '5 AI Mentor chats per day',         included: true  },
      { text: '5 stories per month',               included: true  },
      { text: '3 AI artworks per day',             included: true  },
      { text: 'Basic achievements (20 badges)',    included: true  },
      { text: 'Basic progress tracking',           included: true  },
      { text: 'Weekly reports',                    included: false },
      { text: 'Engineering Lab (full access)',      included: false },
      { text: 'Space Explorer (full access)',       included: false },
      { text: 'Family Missions',                   included: false },
      { text: 'Premium badges (28 extra badges)',  included: false },
      { text: 'Advanced parent dashboard',         included: false },
      { text: 'Export / print reports',            included: false },
    ],
    limits: {
      childProfiles: 1, aiMentorPerDay: 5, storiesPerMonth: 5, artPerDay: 3,
      weeklyReports: false, monthlyReports: false, familyMissions: false,
      premiumBadges: false, advancedAnalytics: false, exportReports: false,
    },
  },

  premium: {
    id: 'premium', name: 'Premium Creator', badge: '⭐', emoji: '🚀',
    price: 9.99, yearlyPrice: 7.99,
    color: '#4F8EF7', gradient: 'linear-gradient(135deg,#4F8EF7,#8B5CF6)',
    tagline: 'Unlock everything for one child',
    cta: 'Start 7-Day Free Trial',
    features: [
      { text: '1 child profile',                  included: true  },
      { text: 'Everything in Free',               included: true  },
      { text: 'Unlimited AI Mentor',              included: true, highlight: true },
      { text: 'Unlimited Story World',            included: true, highlight: true },
      { text: 'Unlimited AI artworks',            included: true  },
      { text: 'Full Engineering Lab',             included: true, highlight: true },
      { text: 'Full Space Explorer',              included: true  },
      { text: 'Learning Journeys (all paths)',    included: true  },
      { text: 'Career Discovery Center',         included: true  },
      { text: 'STEM City Builder',                included: true  },
      { text: '48 achievement badges',            included: true, highlight: true },
      { text: 'Weekly progress reports',          included: true  },
      { text: 'Monthly report (printable)',       included: true  },
      { text: 'Advanced parent dashboard',        included: true  },
      { text: 'Family Missions',                  included: false },
      { text: 'Multiple child profiles',          included: false },
    ],
    limits: {
      childProfiles: 1, aiMentorPerDay: 999, storiesPerMonth: 999, artPerDay: 999,
      weeklyReports: true, monthlyReports: true, familyMissions: false,
      premiumBadges: true, advancedAnalytics: true, exportReports: true,
    },
  },

  family: {
    id: 'family', name: 'Family Champion', badge: '👨‍👩‍👧', emoji: '🏡',
    price: 14.99, yearlyPrice: 11.99,
    color: '#22D3A6', gradient: 'linear-gradient(135deg,#22D3A6,#4F8EF7)',
    tagline: 'Everything for the whole family',
    cta: 'Start 7-Day Free Trial',
    features: [
      { text: 'Up to 5 child profiles',           included: true, highlight: true },
      { text: 'Everything in Premium',            included: true  },
      { text: 'Family Missions system',           included: true, highlight: true },
      { text: 'Shared family dashboard',          included: true  },
      { text: 'Family XP & family badges',        included: true  },
      { text: 'Weekend family challenges',        included: true  },
      { text: 'Per-child progress reports',       included: true  },
      { text: 'Email progress digests',           included: true, highlight: true },
      { text: 'Advanced analytics per child',     included: true  },
      { text: 'Priority support',                 included: true  },
      { text: 'Early access to new features',     included: true  },
      { text: 'Cancel anytime',                   included: true  },
    ],
    limits: {
      childProfiles: 5, aiMentorPerDay: 999, storiesPerMonth: 999, artPerDay: 999,
      weeklyReports: true, monthlyReports: true, familyMissions: true,
      premiumBadges: true, advancedAnalytics: true, exportReports: true,
    },
  },
};

// ── Feature gate keys ────────────────────────────────────────
export type FeatureKey =
  | 'unlimited_ai'         // AI mentor without daily cap
  | 'unlimited_stories'    // Story World without monthly cap
  | 'unlimited_art'        // Art Studio without daily cap
  | 'engineering_lab'      // Full Engineering Lab
  | 'space_explorer'       // Full Space Explorer (>2 topics)
  | 'learning_journeys'    // All 4 learning paths
  | 'career_center'        // Career Discovery Center
  | 'city_builder'         // STEM City Builder
  | 'premium_badges'       // Diamond + Legendary tier badges
  | 'family_missions'      // Family Missions module
  | 'multiple_children'    // More than 1 child profile
  | 'weekly_reports'       // Weekly progress reports
  | 'monthly_reports'      // Monthly summary report
  | 'advanced_analytics'   // Full skill breakdown + recommendations
  | 'export_reports';      // Print/export reports

const FEATURE_GATES: Record<FeatureKey, Plan[]> = {
  unlimited_ai:         ['premium', 'family'],
  unlimited_stories:    ['premium', 'family'],
  unlimited_art:        ['premium', 'family'],
  engineering_lab:      ['premium', 'family'],
  space_explorer:       ['premium', 'family'],
  learning_journeys:    ['premium', 'family'],
  career_center:        ['premium', 'family'],
  city_builder:         ['premium', 'family'],
  premium_badges:       ['premium', 'family'],
  family_missions:      ['family'],
  multiple_children:    ['family'],
  weekly_reports:       ['premium', 'family'],
  monthly_reports:      ['premium', 'family'],
  advanced_analytics:   ['premium', 'family'],
  export_reports:       ['premium', 'family'],
};

export function hasFeature(plan: Plan, feature: FeatureKey): boolean {
  return FEATURE_GATES[feature].includes(plan);
}

export function getPlan(plan?: string): Plan {
  if (plan === 'premium' || plan === 'family') return plan;
  return 'free';
}

export function isPremiumOrFamily(plan: Plan): boolean {
  return plan === 'premium' || plan === 'family';
}

// ── Human-readable limit display ─────────────────────────────
export function limitLabel(value: number | 'unlimited'): string {
  if (value === 'unlimited' || value >= 999) return 'Unlimited';
  return String(value);
}

// ── Upgrade reason messages (shown in gate prompts) ──────────
export const GATE_MESSAGES: Record<FeatureKey, { title: string; desc: string; plan: Plan }> = {
  unlimited_ai:        { title:'Unlimited AI Mentor',    desc:'Chat with Sparky as much as you want!',            plan:'premium' },
  unlimited_stories:   { title:'Unlimited Stories',      desc:'Create as many AI adventures as you like!',        plan:'premium' },
  unlimited_art:       { title:'Unlimited AI Art',       desc:'Generate unlimited artworks every day!',           plan:'premium' },
  engineering_lab:     { title:'Engineering Lab',        desc:'Unlock all 8 STEM engineering challenges!',        plan:'premium' },
  space_explorer:      { title:'Full Space Explorer',    desc:'Explore all 8 space topics in depth!',             plan:'premium' },
  learning_journeys:   { title:'Learning Journeys',      desc:'Follow all 4 learning paths to mastery!',          plan:'premium' },
  career_center:       { title:'Career Discovery',       desc:'Explore all 8 amazing career paths!',              plan:'premium' },
  city_builder:        { title:'STEM City Builder',      desc:'Build and grow your entire STEM city!',            plan:'premium' },
  premium_badges:      { title:'Premium Badges',         desc:'Unlock Diamond and Legendary tier achievements!',  plan:'premium' },
  family_missions:     { title:'Family Missions',        desc:'Complete missions together as a family!',          plan:'family'  },
  multiple_children:   { title:'Multiple Children',      desc:'Add up to 5 child profiles for the whole family!', plan:'family'  },
  weekly_reports:      { title:'Weekly Reports',         desc:'Get weekly progress emails about your child!',     plan:'premium' },
  monthly_reports:     { title:'Monthly Reports',        desc:'Print professional monthly learning reports!',     plan:'premium' },
  advanced_analytics:  { title:'Advanced Analytics',     desc:'Full skill breakdown and personalised tips!',      plan:'premium' },
  export_reports:      { title:'Export Reports',         desc:'Print or save PDF reports for teachers!',          plan:'premium' },
};

// ── Subscription Supabase service ────────────────────────────
export const SubscriptionService = {

  async getForParent(parentId: string): Promise<{ plan: Plan; status: string } | null> {
    if (isDemoMode()) return null;
    const raw = getRawClient();
    if (!raw) return null;
    try {
      const { data } = await raw
        .from('subscriptions')
        .select('plan, status')
        .eq('parent_id', parentId)
        .single();
      if (!data) return null;
      return { plan: getPlan(data.plan), status: data.status };
    } catch { return null; }
  },

  // Dev-only: manually switch plans for testing
  async devSwitchPlan(parentId: string, newPlan: Plan): Promise<boolean> {
    if (process.env.NODE_ENV !== 'development') return false;
    const raw = getRawClient();
    if (!raw) return false;
    try {
      await raw
        .from('subscriptions')
        .upsert({ parent_id: parentId, plan: newPlan, status: 'active' })
        .eq('parent_id', parentId);
      Analytics.track('dev_plan_switch', { parentId, newPlan });
      return true;
    } catch { return false; }
  },

  // Called when user clicks "Upgrade" — records intent, Stripe handles real payment
  async recordUpgradeIntent(parentId: string, targetPlan: Plan, billing: 'monthly' | 'yearly'): Promise<void> {
    Analytics.track('upgrade_intent', { parentId, targetPlan, billing });
    // Future: await fetch('/api/stripe/create-checkout', { method:'POST', body: JSON.stringify({...}) })
  },
};
