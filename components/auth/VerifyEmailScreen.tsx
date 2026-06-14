'use client';
import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import AuthMessage from './AuthMessage';

export default function VerifyEmailScreen() {
  const { supabaseUser, resendVerification, signOut, setAuthScreen, isLoading, error, message } = useAuthStore();
  const [sent, setSent] = useState(false);

  async function handleResend() {
    if (!supabaseUser?.email) return;
    await resendVerification(supabaseUser.email);
    setSent(true);
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>📧</div>
        <h2 className="auth-heading">Check your email!</h2>
        <p className="auth-subheading" style={{ marginBottom: 8 }}>
          We sent a verification link to:
        </p>
        <div className="auth-email-badge">{supabaseUser?.email ?? 'your email'}</div>
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: '16px 0' }}>
          Click the link in the email to verify your account.
          After verifying, come back here and sign in!
        </p>

        <AuthMessage error={error} message={message} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="auth-btn primary"
            onClick={() => setAuthScreen('signin')}
          >
            I verified — Sign In
          </button>

          <button
            className="auth-btn secondary"
            onClick={handleResend}
            disabled={isLoading || sent}
          >
            {isLoading ? <span className="aka-spinner" /> : sent ? '✅ Email resent!' : '📨 Resend verification email'}
          </button>

          <button
            className="auth-btn ghost"
            onClick={signOut}
          >
            ← Back to sign in
          </button>
        </div>

        <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 16 }}>
          Check your spam folder if you don&apos;t see the email within 2 minutes.
        </p>
      </div>
    </div>
  );
}
