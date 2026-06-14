'use client';
import { useAppStore, type ScreenId } from '@/lib/store';
import { useAuthStore }               from '@/lib/auth-store';

const BOTTOM_NAV = [
  { id:'home',         icon:'🏠', label:'Home'    },
  { id:'explorer',     icon:'🧠', label:'Learn'   },
  { id:'science',      icon:'🧪', label:'Science' },
  { id:'mentor',       icon:'🤖', label:'Sparky'  },
  { id:'achievements', icon:'🏆', label:'Awards'  },
];

export default function BottomNav() {
  const { currentScreen, navigate } = useAppStore();
  const { activeChild }             = useAuthStore();

  if (!activeChild) return null;

  return (
    <nav className="aka-bottom-nav" role="navigation" aria-label="Main navigation">
      {BOTTOM_NAV.map(item => (
        <button
          key={item.id}
          className={`aka-bn-item${currentScreen === item.id ? ' active' : ''}`}
          onClick={() => navigate(item.id as ScreenId)}
          aria-label={item.label}
          aria-current={currentScreen === item.id ? 'page' : undefined}
        >
          <span className="aka-bn-icon">{item.icon}</span>
          <span className="aka-bn-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
