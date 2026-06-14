'use client';
// Badge toast — slides in from the right when a new badge is earned
import { useEffect, useState } from 'react';
import type { NewBadge } from '@/lib/achievement-service';

interface Props {
  badges: NewBadge[];
  onDone: () => void;
}

const TIER_COLORS: Record<string, string> = {
  bronze:    'linear-gradient(135deg,#CD7F32,#A0522D)',
  silver:    'linear-gradient(135deg,#C0C0C0,#808080)',
  gold:      'linear-gradient(135deg,#FFB800,#FF8C00)',
  diamond:   'linear-gradient(135deg,#4F8EF7,#8B5CF6)',
  legendary: 'linear-gradient(135deg,#FF6B6B,#FFB800,#8B5CF6)',
};

export default function BadgeToast({ badges, onDone }: Props) {
  const [index, setIndex]     = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (badges.length === 0) return;
    setIndex(0);
    setVisible(true);
  }, [badges]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      if (index < badges.length - 1) {
        setIndex(i => i + 1);
      } else {
        setVisible(false);
        onDone();
      }
    }, 3200);
    return () => clearTimeout(timer);
  }, [visible, index, badges.length, onDone]);

  if (!visible || badges.length === 0) return null;

  const badge = badges[index];
  const bg    = TIER_COLORS[badge.tier] ?? TIER_COLORS.bronze;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
      background: bg,
      borderRadius: 18, padding: '16px 20px',
      boxShadow: '0 8px 40px rgba(0,0,0,.25)',
      color: '#fff', minWidth: 260, maxWidth: 320,
      animation: 'slideInUp .4s ease',
      display: 'flex', gap: 14, alignItems: 'center',
    }}>
      <div style={{ fontSize: 44, lineHeight: 1, flexShrink: 0 }}>{badge.icon}</div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 800, opacity: .8, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>
          🏅 {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)} Badge Unlocked!
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 3 }}>{badge.name}</div>
        <div style={{ fontSize: 12, opacity: .9 }}>+{badge.xp} bonus XP earned! 🌟</div>
      </div>
    </div>
  );
}
