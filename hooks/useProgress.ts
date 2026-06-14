'use client';
// ============================================================
// AI Kids Academy — useProgress hook (Step 5)
//
// Central hook used by all activity screens.
// Provides:
//   - completedIds  (what the child has already done)
//   - completeItem  (complete an activity, sync, check badges)
//   - isCompleted   (fast lookup)
//   - stats         (live counts for badge checks)
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore }       from '@/lib/store';
import { useAuthStore }      from '@/lib/auth-store';
import {
  loadChildProgress,
  completeActivity,
  scheduleSyncProfile,
  isAlreadyCompleted,
  loadFromLocalStorage,
  syncToLocalStorage,
} from '@/lib/progress-service';
import { trackEvent, ageToAgeBucket } from '@/lib/analytics';
import {
  loadEarnedBadges,
  checkAndAwardBadges,
  type ProgressStats,
  type NewBadge,
} from '@/lib/achievement-service';
import type { ContentType } from '@/types/database';

// ── Completed IDs in memory ───────────────────────────────────
// Keyed by contentType → Set<contentId>
type CompletedMap = Record<ContentType, Set<string>>;

const EMPTY_COMPLETED: CompletedMap = {
  science_experiment:    new Set(),
  diy_project:           new Set(),
  engineering_challenge: new Set(),
  discovery_mission:     new Set(),
  ai_lesson:             new Set(),
  story:                 new Set(),
  career_exploration:    new Set(),
};

// Module-level cache so multiple hooks share the same data
let sharedCompleted: CompletedMap = structuredClone(EMPTY_COMPLETED);
let isLoaded = false;

export interface UseProgressReturn {
  isLoaded:    boolean;
  isCompleted: (type: ContentType, id: string) => boolean;
  completeItem: (
    type:       ContentType,
    id:         string,
    name:       string,
    xp:         number,
    coins:      number,
    metadata?:  Record<string, unknown>
  ) => Promise<{ isNew: boolean; newBadges: NewBadge[] }>;
  newBadgesQueue: NewBadge[];
  clearBadgesQueue: () => void;
  stats: ProgressStats;
}

export function useProgress(): UseProgressReturn {
  const { currentUser, addXP, addCoins } = useAppStore();
  const { activeChild }                  = useAuthStore();

  const [loaded, setLoaded]         = useState(isLoaded);
  const [, forceRender]             = useState(0);
  const [badgesQueue, setBadgesQueue] = useState<NewBadge[]>([]);

  const childId = activeChild?.id ?? 'demo';
  const plan    = (currentUser?.plan ?? 'free') as 'free' | 'premium' | 'family';
  const initRef = useRef(false);

  // ── Load on mount ───────────────────────────────────────────
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function init() {
      // Supabase load
      const [{ completedIds }, earnedBadgeIds] = await Promise.all([
        loadChildProgress(childId),
        loadEarnedBadges(childId),
      ]);

      // Merge Supabase completions into shared map
      for (const [type, ids] of Object.entries(completedIds)) {
        const ct = type as ContentType;
        for (const id of ids as string[]) {
          sharedCompleted[ct].add(id);
        }
      }

      // Merge localStorage completions for demo / offline fallback
      const local = loadFromLocalStorage(childId);
      for (const type of Object.keys(EMPTY_COMPLETED) as ContentType[]) {
        const localIds = (local[type] as string[] | undefined) ?? [];
        for (const id of localIds) {
          sharedCompleted[type].add(id);
        }
      }

      void earnedBadgeIds; // already loaded into badge cache by loadEarnedBadges
      isLoaded = true;
      setLoaded(true);
    }

    init();
  }, [childId]);

  // ── isCompleted ─────────────────────────────────────────────
  const isCompleted = useCallback(
    (type: ContentType, id: string) =>
      sharedCompleted[type]?.has(id) ?? false,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loaded]
  );

  // ── completeItem ─────────────────────────────────────────────
  const completeItem = useCallback(
    async (
      type:      ContentType,
      id:        string,
      name:      string,
      xp:        number,
      coins:     number,
      metadata?: Record<string, unknown>
    ): Promise<{ isNew: boolean; newBadges: NewBadge[] }> => {
      // Fast duplicate check
      if (sharedCompleted[type]?.has(id) || isAlreadyCompleted(childId, type, id)) {
        return { isNew: false, newBadges: [] };
      }

      // ── Optimistic local update ───────────────────────────
      sharedCompleted[type].add(id);
      addXP(xp);
      addCoins(coins);
      forceRender(n => n + 1);

      // Persist to localStorage for demo/offline
      const localIds = Array.from(sharedCompleted[type]);
      syncToLocalStorage(childId, { [type]: localIds });

      // ── Cloud sync ────────────────────────────────────────
      const safeChildId = childId;
      await completeActivity({
        childId,
        contentType:  type,
        contentId:    id,
        contentName:  name,
        xpEarned:     xp,
        coinsEarned:  coins,
        metadata,
      });

  // ── Map content type to analytics event ────────────────────
  const eventNameMap: Partial<Record<ContentType, import('@/lib/analytics').AppEventName>> = {
    science_experiment:    'science_completed',
    diy_project:           'diy_completed',
    engineering_challenge: 'engineering_completed',
    discovery_mission:     'discovery_completed',
    ai_lesson:             'lesson_completed',
    story:                 'story_completed',
    career_exploration:    'career_explored',
  };
  const analyticsEvent = eventNameMap[type];
  if (analyticsEvent) {
    void trackEvent(analyticsEvent, {
      module:     type,
      content_id: id,
      xp,
      age_bucket: ageToAgeBucket(activeChild?.age ?? null),
    }, { childId: safeChildId !== 'demo' ? safeChildId : undefined });
  }


      // ── Sync profile stats & update User store arrays ─────────
      const updatedXP = (currentUser?.xp ?? 0) + xp;
      scheduleSyncProfile(childId, {
        xp:     updatedXP,
        coins:  (currentUser?.coins ?? 0) + coins,
        level:  Math.floor(updatedXP / 500) + 1,
      });

      // Update the User store arrays so Home/Parent dashboards reflect new completions
      const { updateUser } = useAppStore.getState();
      const u = currentUser;
      if (u) {
        if (type === 'science_experiment'    && !u.completedExperiments.includes(id))  updateUser({ completedExperiments: [...u.completedExperiments, id] });
        if (type === 'ai_lesson'             && !u.lessonsCompleted.map(String).includes(id)) updateUser({ lessonsCompleted: [...u.lessonsCompleted, Number(id)] });
        if (type === 'story'                 && !u.completedStories.find(s => s.title === name)) { /* StoryScreen handles this */ }
        if (type === 'diy_project'           && !(u.completedDIY ?? []).includes(id))   updateUser({ completedDIY: [...(u.completedDIY ?? []), id] });
        if (type === 'engineering_challenge' && !(u.completedEng ?? []).includes(id))   updateUser({ completedEng: [...(u.completedEng ?? []), id] });
        if (type === 'discovery_mission'     && !(u.completedDiscovery ?? []).includes(id)) updateUser({ completedDiscovery: [...(u.completedDiscovery ?? []), id] });
        if (type === 'career_exploration'    && !(u.exploredCareers ?? []).includes(id))   updateUser({ exploredCareers: [...(u.exploredCareers ?? []), id] });
      }

      // ── Check badges ──────────────────────────────────────
      const stats = buildStats(currentUser, sharedCompleted);
      const newBadges = await checkAndAwardBadges(childId, stats);

      if (newBadges.length > 0) {
        // Award bonus XP for each badge
        const bonusXP = newBadges.reduce((sum, b) => sum + b.xp, 0);
        if (bonusXP > 0) addXP(bonusXP);
        setBadgesQueue(prev => [...prev, ...newBadges]);
      }

      return { isNew: true, newBadges };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childId, currentUser, plan]
  );

  const clearBadgesQueue = useCallback(() => setBadgesQueue([]), []);

  const stats = buildStats(currentUser, sharedCompleted);

  return { isLoaded: loaded, isCompleted, completeItem, newBadgesQueue: badgesQueue, clearBadgesQueue, stats };
}

// ── Build live stats from current user + completed map ────────
function buildStats(
  user: ReturnType<typeof useAppStore.getState>['currentUser'],
  completed: CompletedMap
): ProgressStats {
  return {
    xp:             user?.xp             ?? 0,
    lessons:        Math.max(user?.lessonsCompleted?.length      ?? 0, completed.ai_lesson.size),
    experiments:    Math.max(user?.completedExperiments?.length  ?? 0, completed.science_experiment.size),
    diy:            Math.max(user?.completedDIY?.length          ?? 0, completed.diy_project.size),
    engineering:    Math.max(user?.completedEng?.length          ?? 0, completed.engineering_challenge.size),
    discovery:      Math.max(user?.completedDiscovery?.length ?? 0, Array.from(completed.discovery_mission ?? []).filter(id => !id.startsWith('space_')).length),
    space:          Math.max(user?.completedSpace?.length ?? 0, Array.from(completed.discovery_mission ?? []).filter(id => id.startsWith('space_')).length),
    stories:        Math.max(user?.completedStories?.length      ?? 0, completed.story.size),
    careers:        Math.max(user?.exploredCareers?.length       ?? 0, completed.career_exploration.size),
    habitsTotal:    user?.habitsCompleted               ?? 0,
    habitStreak:    user?.habitStreak                   ?? 0,
    savedAmount:    user?.totalSaved                    ?? 0,
    streakDays:     user?.streak                        ?? 0,
    familyMissions: user?.completedFamilyMissions?.length ?? 0,
    creations:      user?.creations?.length             ?? 0,
  };
}

// ── Reset cache on child switch ───────────────────────────────
export function resetProgressCache() {
  sharedCompleted = {
    science_experiment:    new Set(),
    diy_project:           new Set(),
    engineering_challenge: new Set(),
    discovery_mission:     new Set(),
    ai_lesson:             new Set(),
    story:                 new Set(),
    career_exploration:    new Set(),
  };
  isLoaded = false;
}
