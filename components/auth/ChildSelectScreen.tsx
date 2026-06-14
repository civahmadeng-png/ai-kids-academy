'use client';
import { useAuthStore } from '@/lib/auth-store';
import type { ChildRow } from '@/types/database';

export default function ChildSelectScreen() {
  const { children, selectChild, setAuthScreen, signOut, supabaseUser } = useAuthStore();

  // Get first name from metadata or email
  const parentName = supabaseUser?.user_metadata?.full_name?.split(' ')[0]
    ?? supabaseUser?.email?.split('@')[0]
    ?? 'Parent';

  return (
    <div className="auth-page">
      <div className="auth-card child-select-card">
        <div className="child-select-header">
          <div className="auth-logo-icon sm" style={{ margin: '0 auto 12px' }}>🚀</div>
          <h2 className="auth-heading">Who&apos;s learning today?</h2>
          <p className="auth-subheading">Hi {parentName}! Choose a child profile to start.</p>
        </div>

        {/* Child grid */}
        <div className="child-grid">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} onSelect={() => selectChild(child.id)} />
          ))}

          {/* Add new child button */}
          <button
            className="child-card add-child"
            onClick={() => setAuthScreen('child-create')}
          >
            <div className="child-avatar add">+</div>
            <div className="child-name">Add Child</div>
            <div className="child-meta">Create new profile</div>
          </button>
        </div>

        {/* Parent options */}
        <div className="child-select-footer">
          <button
            className="auth-btn ghost small"
            onClick={signOut}
          >
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function ChildCard({ child, onSelect }: { child: ChildRow; onSelect: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = (child as any).child_profiles?.[0];
  const level   = profile ? Math.floor((profile.xp ?? 0) / 500) + 1 : 1;
  const xp      = profile?.xp ?? 0;
  const streak  = profile?.streak_days ?? 0;

  return (
    <button className="child-card" onClick={onSelect}>
      <div className="child-avatar">{child.avatar ?? '🦊'}</div>
      <div className="child-name">{child.display_name}</div>
      <div className="child-meta">
        {child.age ? `Age ${child.age}` : 'Child'}
        {' · '}Level {level}
      </div>
      <div className="child-stats">
        <span>⭐ {xp} XP</span>
        <span>🔥 {streak}d</span>
      </div>
      <div className="child-enter-hint">Tap to enter →</div>
    </button>
  );
}
