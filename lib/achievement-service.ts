'use client';
// ============================================================
// AI Kids Academy — Achievement Service (Step 5)
// Awards badges, checks thresholds, prevents duplicates.
// ============================================================

import { getRawClient, isDemoMode } from '@/lib/supabaseClient';
import { Analytics } from '@/lib/analytics';

// ── In-memory earned-badge cache ─────────────────────────────
// childId → Set<badgeId>
const badgeCache = new Map<string, Set<string>>();

export function hasEarnedBadge(childId: string, badgeId: string): boolean {
  return badgeCache.get(childId)?.has(badgeId) ?? false;
}

function markBadgeEarned(childId: string, badgeId: string) {
  if (!badgeCache.has(childId)) badgeCache.set(childId, new Set());
  badgeCache.get(childId)!.add(badgeId);
}

export function initBadgeCache(childId: string, badgeIds: string[]) {
  badgeCache.set(childId, new Set(badgeIds));
}

// ── Badge definitions ─────────────────────────────────────────
export interface BadgeDef {
  id:       string;
  name:     string;
  icon:     string;
  tier:     'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
  category: string;
  xp:       number;
  check:    (stats: ProgressStats) => boolean;
}

export interface ProgressStats {
  xp:            number;
  lessons:       number;
  experiments:   number;
  diy:           number;
  engineering:   number;
  discovery:     number;
  space:         number;
  stories:       number;
  careers:       number;
  habitStreak:   number;
  habitsTotal:   number;
  savedAmount:   number;
  streakDays:    number;
  familyMissions: number;
  creations:     number;
}

export const BADGE_DEFINITIONS: BadgeDef[] = [
  // ── Learning ──────────────────────────────────────────────
  { id:'first_lesson',      name:'First Step',        icon:'🌟', tier:'bronze',    category:'learning',    xp:25,  check: s => s.lessons >= 1 },
  { id:'lessons_3',         name:'AI Curious',        icon:'🧠', tier:'silver',    category:'learning',    xp:50,  check: s => s.lessons >= 3 },
  { id:'lessons_6',         name:'AI Explorer',       icon:'🔭', tier:'gold',      category:'learning',    xp:80,  check: s => s.lessons >= 6 },
  { id:'lessons_12',        name:'AI Master',         icon:'🤖', tier:'diamond',   category:'learning',    xp:150, check: s => s.lessons >= 12 },
  { id:'streak_3',          name:'3-Day Streak',      icon:'🔥', tier:'bronze',    category:'learning',    xp:30,  check: s => s.streakDays >= 3 },
  { id:'streak_7',          name:'Week Warrior',      icon:'⚡', tier:'silver',    category:'learning',    xp:75,  check: s => s.streakDays >= 7 },
  { id:'streak_30',         name:'Month Champion',    icon:'🏅', tier:'gold',      category:'learning',    xp:200, check: s => s.streakDays >= 30 },
  { id:'xp_100',            name:'XP Collector',      icon:'💫', tier:'bronze',    category:'learning',    xp:20,  check: s => s.xp >= 100 },
  { id:'xp_500',            name:'XP Chaser',         icon:'🌠', tier:'silver',    category:'learning',    xp:50,  check: s => s.xp >= 500 },
  { id:'xp_2000',           name:'XP Legend',         icon:'👑', tier:'gold',      category:'learning',    xp:100, check: s => s.xp >= 2000 },
  // ── Science ───────────────────────────────────────────────
  { id:'first_experiment',  name:'Lab Recruit',       icon:'🧪', tier:'bronze',    category:'science',     xp:25,  check: s => s.experiments >= 1 },
  { id:'experiments_3',     name:'Mini Scientist',    icon:'🔬', tier:'silver',    category:'science',     xp:50,  check: s => s.experiments >= 3 },
  { id:'experiments_6',     name:'Lab Master',        icon:'⚗️', tier:'gold',      category:'science',     xp:100, check: s => s.experiments >= 6 },
  { id:'experiments_8',     name:'Science Champion',  icon:'🏆', tier:'diamond',   category:'science',     xp:175, check: s => s.experiments >= 8 },
  // ── Engineering & DIY ─────────────────────────────────────
  { id:'first_diy',         name:'First Build',       icon:'🔨', tier:'bronze',    category:'engineering', xp:25,  check: s => s.diy >= 1 },
  { id:'diy_4',             name:'Creative Builder',  icon:'🏗️', tier:'silver',    category:'engineering', xp:60,  check: s => s.diy >= 4 },
  { id:'diy_8',             name:'Maker Master',      icon:'🛠️', tier:'gold',      category:'engineering', xp:120, check: s => s.diy >= 8 },
  { id:'first_eng',         name:'Engineer Trainee',  icon:'⚙️', tier:'bronze',    category:'engineering', xp:30,  check: s => s.engineering >= 1 },
  { id:'eng_4',             name:'STEM Builder',      icon:'🌉', tier:'silver',    category:'engineering', xp:70,  check: s => s.engineering >= 4 },
  { id:'eng_8',             name:'Engineering Master',icon:'🏅', tier:'gold',      category:'engineering', xp:150, check: s => s.engineering >= 8 },
  // ── Exploration ───────────────────────────────────────────
  { id:'first_discovery',   name:'First Explorer',    icon:'🌎', tier:'bronze',    category:'exploration', xp:25,  check: s => s.discovery >= 1 },
  { id:'discovery_4',       name:'Nature Scout',      icon:'🔭', tier:'silver',    category:'exploration', xp:60,  check: s => s.discovery >= 4 },
  { id:'discovery_8',       name:'World Explorer',    icon:'🗺️', tier:'gold',      category:'exploration', xp:120, check: s => s.discovery >= 8 },
  { id:'first_space',       name:'Space Cadet',       icon:'🚀', tier:'bronze',    category:'exploration', xp:30,  check: s => s.space >= 1 },
  { id:'space_4',           name:'Astronomer',        icon:'🌌', tier:'silver',    category:'exploration', xp:70,  check: s => s.space >= 4 },
  { id:'space_8',           name:'Space Champion',    icon:'⭐', tier:'gold',      category:'exploration', xp:150, check: s => s.space >= 8 },
  // ── Stories & Creativity ──────────────────────────────────
  { id:'first_story',       name:'Storyteller',       icon:'📖', tier:'bronze',    category:'creativity',  xp:25,  check: s => s.stories >= 1 },
  { id:'stories_5',         name:'Story Master',      icon:'📚', tier:'silver',    category:'creativity',  xp:75,  check: s => s.stories >= 5 },
  { id:'stories_10',        name:'Author',            icon:'✍️', tier:'gold',      category:'creativity',  xp:150, check: s => s.stories >= 10 },
  { id:'first_creation',    name:'Creator',           icon:'🎨', tier:'bronze',    category:'creativity',  xp:20,  check: s => s.creations >= 1 },
  { id:'creations_5',       name:'Creative Star',     icon:'🌟', tier:'silver',    category:'creativity',  xp:60,  check: s => s.creations >= 5 },
  // ── Habits & Savings ─────────────────────────────────────
  { id:'habits_10',         name:'Habit Starter',     icon:'💪', tier:'bronze',    category:'habits',      xp:30,  check: s => s.habitsTotal >= 10 },
  { id:'habits_50',         name:'Habit Hero',        icon:'🦁', tier:'silver',    category:'habits',      xp:80,  check: s => s.habitsTotal >= 50 },
  { id:'habits_200',        name:'Habit Legend',      icon:'🧙', tier:'gold',      category:'habits',      xp:200, check: s => s.habitsTotal >= 200 },
  { id:'saved_10',          name:'Saver Starter',     icon:'🐷', tier:'bronze',    category:'savings',     xp:30,  check: s => s.savedAmount >= 10 },
  { id:'saved_50',          name:'Smart Saver',       icon:'💰', tier:'silver',    category:'savings',     xp:80,  check: s => s.savedAmount >= 50 },
  { id:'saved_100',         name:'Money Master',      icon:'🏦', tier:'gold',      category:'savings',     xp:150, check: s => s.savedAmount >= 100 },
  // ── Career ────────────────────────────────────────────────
  { id:'first_career',      name:'Career Curious',    icon:'🌟', tier:'bronze',    category:'career',      xp:20,  check: s => s.careers >= 1 },
  { id:'careers_4',         name:'Career Explorer',   icon:'🎭', tier:'silver',    category:'career',      xp:60,  check: s => s.careers >= 4 },
  { id:'careers_8',         name:'Career Master',     icon:'🏅', tier:'gold',      category:'career',      xp:120, check: s => s.careers >= 8 },
  // ── Family ────────────────────────────────────────────────
  { id:'first_family',      name:'Family Mission',    icon:'👨‍👩‍👧', tier:'bronze',   category:'family',      xp:30,  check: s => s.familyMissions >= 1 },
  { id:'family_5',          name:'Family Champion',   icon:'🏡', tier:'gold',      category:'family',      xp:100, check: s => s.familyMissions >= 5 },
  // ── City Builder ─────────────────────────────────────────
  { id:'city_3',            name:'Town Builder',      icon:'🏠', tier:'bronze',    category:'city',        xp:40,  check: s => s.xp >= 300 },
  { id:'city_6',            name:'City Builder',      icon:'🏙️', tier:'silver',    category:'city',        xp:80,  check: s => s.xp >= 1000 },
  { id:'city_all',          name:'City Master',       icon:'🌆', tier:'diamond',   category:'city',        xp:200, check: s => s.xp >= 2000 },
  // ── Legendary ────────────────────────────────────────────
  { id:'all_science',       name:'Full Scientist',    icon:'🔬', tier:'legendary', category:'science',     xp:300, check: s => s.experiments >= 8 && s.discovery >= 8 && s.space >= 8 },
  { id:'all_builder',       name:'Master Maker',      icon:'🛠️', tier:'legendary', category:'engineering', xp:300, check: s => s.diy >= 8 && s.engineering >= 8 },
  { id:'academy_legend',    name:'Academy Legend',    icon:'👑', tier:'legendary', category:'overall',     xp:500, check: s => s.lessons >= 12 && s.experiments >= 8 && s.stories >= 5 },
];

// ── Check and award badges based on current stats ────────────
export interface NewBadge {
  id:    string;
  name:  string;
  icon:  string;
  tier:  string;
  xp:    number;
}

export async function checkAndAwardBadges(
  childId: string,
  stats: ProgressStats
): Promise<NewBadge[]> {
  const newBadges: NewBadge[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    // Skip already earned (memory check)
    if (hasEarnedBadge(childId, badge.id)) continue;
    // Check threshold
    if (!badge.check(stats)) continue;

    // Award it
    markBadgeEarned(childId, badge.id);
    newBadges.push({ id: badge.id, name: badge.name, icon: badge.icon, tier: badge.tier, xp: badge.xp });

    // Cloud sync (fire-and-forget)
    if (!isDemoMode() && childId !== 'demo') {
      awardBadgeToCloud(childId, badge).catch(e => console.error('[AchievementService]', e));
    }

    Analytics.track('badge_earned', { childId, badgeId: badge.id, tier: badge.tier });
  }

  return newBadges;
}

async function awardBadgeToCloud(childId: string, badge: BadgeDef) {
  const raw = getRawClient();
  if (!raw) return;

  await raw.from('achievements').insert({
    child_id:   childId,
    badge_id:   badge.id,
    badge_name: badge.name,
    badge_icon: badge.icon,
    tier:       badge.tier,
    category:   badge.category,
    xp_awarded: badge.xp,
  });
  // 23505 unique violation = already earned, safe to ignore
}

// ── Load earned badges from Supabase into cache ───────────────
export async function loadEarnedBadges(childId: string): Promise<string[]> {
  if (isDemoMode() || childId === 'demo') return [];
  const client = getRawClient();
  if (!client) return [];

  try {
    const { data } = await client
      .from('achievements')
      .select('badge_id')
      .eq('child_id', childId);

    const ids = (data ?? []).map((r: { badge_id: string }) => r.badge_id);
    initBadgeCache(childId, ids);
    return ids;
  } catch {
    return [];
  }
}
