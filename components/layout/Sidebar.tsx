'use client';
import { useAppStore, type ScreenId } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { NAV_ITEMS } from '@/data/navigation';

export default function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const { currentScreen, navigate, currentUser } = useAppStore();
  const { activeChild, exitChildSession, signOut } = useAuthStore();

  if (!activeChild) return null;

  // Use currentUser.xp (updates live via addXP) with fallback to stored profile
  const xp      = currentUser?.xp ?? activeChild.profile?.xp ?? 0;
  const coins   = activeChild.profile?.coins ?? 50;
  const gems    = activeChild.profile?.gems ?? 5;
  const streak  = activeChild.profile?.streak_days ?? 0;
  const xpInLvl = xp % 500;
  const pct     = Math.round((xpInLvl / 500) * 100);
  const level   = Math.floor(xp / 500) + 1;

  // Group nav items by section
  const sections = NAV_ITEMS.reduce<Record<string, typeof NAV_ITEMS>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <aside className="aka-sidebar">
      {/* Logo */}
      <div className="aka-logo">
        <div className="aka-logo-icon">🚀</div>
        <div>
          <div className="aka-logo-text">AI Kids Academy</div>
          <div className="aka-logo-sub">Your AI Learning World</div>
        </div>
      </div>

      {/* Active child */}
      <div
        className="aka-user"
        onClick={() => navigate('achievements')}
        style={{ cursor: 'pointer' }}
        title="View achievements"
      >
        <div className="aka-avatar">{activeChild.avatar}</div>
        <div>
          <div className="aka-username">{activeChild.displayName}</div>
          <div className="aka-level">⭐ Level {level} · AI Explorer</div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="aka-xp-wrap">
        <div className="aka-xp-label">
          <span>XP Progress</span>
          <span>{xpInLvl} / 500</span>
        </div>
        <div className="aka-xp-bar">
          <div className="aka-xp-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Nav */}
      <nav className="aka-nav">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section}>
            <div className="aka-nav-section">{section}</div>
            {items.map((item) => {
              const isActive  = currentScreen === item.id;
              const isUpgrade = item.id === 'upgrade';
              return (
                <div
                  key={item.id}
                  className={`aka-nav-item${isActive ? ' active' : ''}${isUpgrade ? ' upgrade' : ''}`}
                  onClick={() => { navigate(item.id as ScreenId); onNavigate?.(); }}
                >
                  <span className="aka-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className="aka-nav-badge"
                      style={item.badgeColor ? { background: item.badgeColor } : undefined}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Stats */}
      <div className="aka-stats">
        <div className="aka-stat">
          <div className="aka-stat-val">🔥{streak}</div>
          <div className="aka-stat-lbl">Streak</div>
        </div>
        <div className="aka-stat">
          <div className="aka-stat-val">💰{coins}</div>
          <div className="aka-stat-lbl">Coins</div>
        </div>
        <div className="aka-stat">
          <div className="aka-stat-val">💎{gems}</div>
          <div className="aka-stat-lbl">Gems</div>
        </div>
      </div>

      {/* Switch child / sign out */}
      <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {activeChild.id !== 'demo' && (
          <button className="aka-signout" onClick={exitChildSession} style={{ color: 'var(--sky)', borderColor: 'var(--sky-light)' }}>
            👤 Switch Child
          </button>
        )}
        <button className="aka-signout" onClick={signOut}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
