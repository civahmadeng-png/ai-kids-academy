'use client';
import { useState } from 'react';
import { useAppStore }      from '@/lib/store';
import { useAuthStore }     from '@/lib/auth-store';
import { useSubscription }  from '@/hooks/useSubscription';
import { SCREEN_TITLES }    from '@/data/navigation';
import PlanBadge            from '@/components/ui/PlanBadge';
import Sidebar              from './Sidebar';

export default function Topbar() {
  const { currentUser, currentScreen, navigate } = useAppStore();
  const { activeChild }   = useAuthStore();
  const { plan }          = useSubscription();
  const [sideOpen, setSideOpen] = useState(false);

  if (!activeChild) return null;

  return (
    <>
      <div className="aka-topbar">
        {/* Mobile hamburger */}
        <button
          className="aka-hamburger"
          onClick={() => setSideOpen(o => !o)}
          aria-label="Open navigation"
        >
          ☰
        </button>

        <div className="aka-topbar-title">
          {SCREEN_TITLES[currentScreen] || currentScreen}
        </div>

        <div className="aka-topbar-right">
          <div onClick={() => navigate('upgrade')} style={{ cursor:'pointer' }}>
            <PlanBadge showName={false}/>
          </div>
          <div className="aka-streak-badge">
            🔥 {(activeChild.profile?.streak_days ?? currentUser?.streak ?? 0)}
          </div>
          <div className="aka-coins-badge">
            💰 {activeChild.profile?.coins ?? currentUser?.coins ?? 0}
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sideOpen && (
        <>
          <div
            className="aka-overlay"
            onClick={() => setSideOpen(false)}
            aria-label="Close menu"
          />
          <div className="aka-sidebar-mobile">
            <Sidebar onNavigate={() => setSideOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
