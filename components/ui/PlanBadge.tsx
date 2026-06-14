'use client';
import { useSubscription } from '@/hooks/useSubscription';
import { useAppStore }     from '@/lib/store';

interface PlanBadgeProps {
  size?: 'sm' | 'md';
  showName?: boolean;
}

export default function PlanBadge({ size = 'sm', showName = false }: PlanBadgeProps) {
  const { plan, planDef } = useSubscription();
  const { navigate }      = useAppStore();

  if (plan === 'free') {
    return (
      <div
        className={`plan-badge free size-${size}`}
        onClick={() => navigate('upgrade')}
        title="Upgrade to Premium"
        style={{ cursor: 'pointer' }}
      >
        🆓 {showName ? 'Free' : ''}
        <span className="plan-badge-upgrade">↑ Upgrade</span>
      </div>
    );
  }

  return (
    <div
      className={`plan-badge paid size-${size}`}
      style={{ background: planDef.gradient }}
      title={planDef.name}
    >
      {planDef.badge} {showName ? planDef.name : ''}
    </div>
  );
}
