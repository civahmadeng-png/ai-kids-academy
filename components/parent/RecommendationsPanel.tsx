'use client';
import type { Recommendation } from '@/lib/report-engine';
import type { ScreenId } from '@/lib/store';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';

interface Props { recs: Recommendation[] }

const URGENCY_STYLE: Record<Recommendation['urgency'], { dot: string; label: string }> = {
  high:   { dot: 'var(--coral)',  label: 'Priority' },
  medium: { dot: 'var(--sun)',    label: 'Suggested' },
  low:    { dot: 'var(--mint)',   label: 'Explore' },
};

export default function RecommendationsPanel({ recs }: Props) {
  const { navigate }      = useAppStore();
  const { exitChildSession, authScreen } = useAuthStore();

  function goToScreen(screen: string) {
    // If we are in parent view (no active child session with app screen), switch child first
    if (authScreen !== 'app') {
      // Just provide the navigation target — parent can share with child
      return;
    }
    navigate(screen as ScreenId);
  }

  if (recs.length === 0) {
    return (
      <div className="pd-card" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🏆</div>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Incredible Progress!</div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>Your child has explored everything — encourage them to keep reviewing!</div>
      </div>
    );
  }

  return (
    <div className="pd-recs-list">
      {recs.map((r, i) => {
        const style = URGENCY_STYLE[r.urgency];
        return (
          <div key={i} className="pd-rec-row">
            <div className="pd-rec-left">
              <div className="pd-rec-icon">{r.icon}</div>
              <div>
                <div className="pd-rec-title">{r.title}</div>
                <div className="pd-rec-reason">{r.reason}</div>
              </div>
            </div>
            <div className="pd-rec-right">
              <div className="pd-urgency-dot" style={{ background: style.dot }} title={style.label} />
              {authScreen === 'app' && (
                <button
                  className="pd-rec-btn"
                  onClick={() => goToScreen(r.screen)}
                >
                  Go →
                </button>
              )}
            </div>
          </div>
        );
      })}
      <div className="pd-rec-legend">
        <div className="pd-leg-item"><div className="pd-urgency-dot" style={{ background: 'var(--coral)' }}/> Priority</div>
        <div className="pd-leg-item"><div className="pd-urgency-dot" style={{ background: 'var(--sun)' }}/> Suggested</div>
        <div className="pd-leg-item"><div className="pd-urgency-dot" style={{ background: 'var(--mint)' }}/> Explore next</div>
      </div>
    </div>
  );
}
