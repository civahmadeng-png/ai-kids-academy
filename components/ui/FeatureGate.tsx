'use client';
import { useSubscription } from '@/hooks/useSubscription';
import { GATE_MESSAGES, PLANS, type FeatureKey } from '@/lib/subscription-service';
import { useAppStore } from '@/lib/store';

interface FeatureGateProps {
  feature:   FeatureKey;
  children:  React.ReactNode;
  fallback?: React.ReactNode;   // custom locked UI; default = lock card
  silent?:   boolean;           // just hide content, no lock card
}

export default function FeatureGate({ feature, children, fallback, silent }: FeatureGateProps) {
  const { canAccess } = useSubscription();
  if (canAccess(feature)) return <>{children}</>;
  if (silent) return null;
  if (fallback) return <>{fallback}</>;
  return <LockCard feature={feature} />;
}

// ── Lock card shown when content is gated ────────────────────
function LockCard({ feature }: { feature: FeatureKey }) {
  const { navigate } = useAppStore();
  const msg          = GATE_MESSAGES[feature];
  const reqPlan      = PLANS[msg.plan];

  return (
    <div className="fg-lock-card">
      <div className="fg-lock-icon">🔒</div>
      <div className="fg-lock-title">{msg.title}</div>
      <div className="fg-lock-desc">{msg.desc}</div>
      <div className="fg-lock-plan">
        {reqPlan.badge} Requires <strong>{reqPlan.name}</strong> — ${reqPlan.price}/month
      </div>
      <button
        className="fg-lock-btn"
        style={{ background: reqPlan.gradient }}
        onClick={() => navigate('upgrade')}
      >
        Upgrade to Unlock →
      </button>
    </div>
  );
}

// ── Inline gate banner (less intrusive) ─────────────────────
interface GateBannerProps {
  feature:  FeatureKey;
  compact?: boolean;
}

export function GateBanner({ feature, compact }: GateBannerProps) {
  const { canAccess } = useSubscription();
  const { navigate }  = useAppStore();
  const msg           = GATE_MESSAGES[feature];
  const reqPlan       = PLANS[msg.plan];

  if (canAccess(feature)) return null;

  if (compact) {
    return (
      <div className="fg-banner-compact" onClick={() => navigate('upgrade')}>
        🔒 {msg.title} · <strong>{reqPlan.name}</strong> · Upgrade →
      </div>
    );
  }

  return (
    <div className="fg-banner">
      <div className="fg-banner-left">
        <span className="fg-banner-icon">🔒</span>
        <div>
          <div className="fg-banner-title">{msg.title}</div>
          <div className="fg-banner-sub">{msg.desc}</div>
        </div>
      </div>
      <button
        className="fg-banner-btn"
        style={{ background: reqPlan.gradient }}
        onClick={() => navigate('upgrade')}
      >
        {reqPlan.badge} Upgrade
      </button>
    </div>
  );
}

// ── Usage limit indicator ─────────────────────────────────────
interface UsageLimitProps {
  used:    number;
  limit:   number;
  label:   string;
  feature: FeatureKey;
}

export function UsageLimitBar({ used, limit, label, feature }: UsageLimitProps) {
  const { canAccess } = useSubscription();
  const { navigate }  = useAppStore();

  // Don't show bar for unlimited plans
  if (canAccess(feature) || limit >= 999) return null;

  const pct       = Math.min(100, Math.round((used / limit) * 100));
  const remaining = Math.max(0, limit - used);
  const isFull    = remaining === 0;

  return (
    <div className="fg-usage-bar">
      <div className="fg-usage-top">
        <span className="fg-usage-label">{label}</span>
        <span className={`fg-usage-count ${isFull ? 'empty' : ''}`}>
          {isFull ? 'Limit reached' : `${remaining} remaining today`}
        </span>
      </div>
      <div className="fg-usage-track">
        <div
          className="fg-usage-fill"
          style={{
            width: `${pct}%`,
            background: isFull ? 'var(--coral)' : pct >= 80 ? 'var(--sun)' : 'var(--sky)',
          }}
        />
      </div>
      {isFull && (
        <button className="fg-usage-upgrade" onClick={() => navigate('upgrade')}>
          ⭐ Upgrade for unlimited →
        </button>
      )}
    </div>
  );
}
