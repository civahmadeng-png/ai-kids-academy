'use client';
// ============================================================
// AI Kids Academy — useSubscription hook (Step 7)
// Single hook for all plan/feature access decisions.
// ============================================================

import { useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import {
  getPlan, hasFeature, PLANS, GATE_MESSAGES,
  type Plan, type FeatureKey, type PlanDef,
} from '@/lib/subscription-service';

export interface UseSubscriptionReturn {
  plan:       Plan;
  planDef:    PlanDef;
  isPaid:     boolean;         // premium or family
  isFamily:   boolean;
  canAccess:  (feature: FeatureKey) => boolean;
  requirePlan: (feature: FeatureKey, onAllow: () => void) => void;
  navigateToUpgrade: () => void;
}

export function useSubscription(): UseSubscriptionReturn {
  const { currentUser, showModal, navigate } = useAppStore();
  const { activeChild }                      = useAuthStore();

  // Plan comes from currentUser (synced from Supabase on login)
  const plan    = getPlan(currentUser?.plan);
  const planDef = PLANS[plan];
  const isPaid  = plan === 'premium' || plan === 'family';
  const isFamily= plan === 'family';

  const canAccess = useCallback(
    (feature: FeatureKey) => hasFeature(plan, feature),
    [plan]
  );

  const navigateToUpgrade = useCallback(
    () => navigate('upgrade'),
    [navigate]
  );

  // requirePlan: gate access, show modal if locked
  const requirePlan = useCallback(
    (feature: FeatureKey, onAllow: () => void) => {
      if (hasFeature(plan, feature)) {
        onAllow();
        return;
      }
      const msg = GATE_MESSAGES[feature];
      const reqPlan = PLANS[msg.plan];
      showModal(
        reqPlan.emoji,
        `${reqPlan.badge} ${msg.title} — ${reqPlan.name}`,
        `${msg.desc}\n\nUpgrade to ${reqPlan.name} for $${reqPlan.price}/month to unlock this and much more! 🚀`
      );
      // Navigate to upgrade after modal closes
      setTimeout(() => navigate('upgrade'), 400);
    },
    [plan, showModal, navigate]
  );

  return { plan, planDef, isPaid, isFamily, canAccess, requirePlan, navigateToUpgrade };
}
