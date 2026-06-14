'use client';
import { useAuthStore } from '@/lib/auth-store';
import AuthRouter   from '@/components/auth/AuthRouter';
import BottomNav    from '@/components/layout/BottomNav';
import { InstallBanner } from '@/components/pwa/ServiceWorkerRegister';
import { InlineFooterLinks } from '@/components/legal/LegalFooter';
import Sidebar      from '@/components/layout/Sidebar';
import Topbar       from '@/components/layout/Topbar';
import Modal        from '@/components/ui/Modal';
import ScreenRouter from '@/components/screens/ScreenRouter';

export default function App() {
  const { authScreen } = useAuthStore();

  // Render auth flow for all non-app screens
  if (authScreen !== 'app') {
    return <AuthRouter />;
  }

  // Main app shell
  return (
    <div className="aka-app">
      <Sidebar />
      <main className="aka-main">
        <Topbar />
        <div className="aka-content">
          <ScreenRouter />
          <div style={{borderTop:'1px solid var(--border)',marginTop:32,paddingTop:8}}>
            <InlineFooterLinks />
          </div>
        </div>
        <BottomNav />
        <InstallBanner />
      </main>
      <Modal />
    </div>
  );
}
