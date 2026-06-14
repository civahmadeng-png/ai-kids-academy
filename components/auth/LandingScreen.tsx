'use client';
import { useAuthStore } from '@/lib/auth-store';
import { isDemoMode } from '@/lib/supabaseClient';
import { InlineFooterLinks } from '@/components/legal/LegalFooter';

export default function LandingScreen() {
  const { setAuthScreen, enterDemoMode } = useAuthStore();
  const demo = isDemoMode();

  return (
    <div className="auth-page">
      <div className="auth-card landing-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🚀</div>
          <h1 className="auth-app-name">AI Kids Academy</h1>
          <p className="auth-app-tag">Your AI Learning World — Safe &amp; Fun!</p>
        </div>

        {/* Hero graphic */}
        <div className="landing-emojis">
          <span className="le-item float-anim" style={{ animationDelay: '0s' }}>🧪</span>
          <span className="le-item float-anim" style={{ animationDelay: '.3s' }}>🤖</span>
          <span className="le-item float-anim" style={{ animationDelay: '.6s' }}>🚀</span>
          <span className="le-item float-anim" style={{ animationDelay: '.9s' }}>🎨</span>
          <span className="le-item float-anim" style={{ animationDelay: '1.2s' }}>📚</span>
        </div>

        {/* Feature pills */}
        <div className="landing-pills">
          {['AI Mentor','Science Lab','Story World','Engineering','Space Explorer'].map(f => (
            <span key={f} className="landing-pill">{f}</span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="landing-actions">
          <button
            className="auth-btn primary"
            onClick={() => setAuthScreen('signup')}
          >
            🌟 Create Free Account
          </button>
          <button
            className="auth-btn secondary"
            onClick={() => setAuthScreen('signin')}
          >
            Sign In
          </button>

          {/* Demo mode */}
          <div className="auth-divider"><span>or</span></div>
          <button
            className="auth-btn demo"
            onClick={enterDemoMode}
          >
            🎮 Try Demo — No Account Needed
          </button>

          {demo && (
            <div className="auth-demo-note">
              ⚠️ Demo mode — data saved locally. Connect Supabase for real accounts.
            </div>
          )}
        </div>

        <p className="auth-footer-note">
          Safe for children · No ads · COPPA compliant
        </p>
        <InlineFooterLinks />
      </div>
    </div>
  );
}
