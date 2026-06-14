'use client';
import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import AuthMessage from './AuthMessage';

// ── Reset Request Screen ──────────────────────────────────────
export function ResetRequestScreen() {
  const { resetPasswordRequest, setAuthScreen, isLoading, error, message, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    await resetPasswordRequest(email);
    setSubmitted(true);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="auth-back-btn" onClick={() => { clearError(); setAuthScreen('signin'); }}>
          ← Back to sign in
        </button>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>🔑</div>
          <h2 className="auth-heading">Reset your password</h2>
          <p className="auth-subheading">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <AuthMessage error={error} message={message} />

        {!submitted ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="reset-email">Email Address</label>
              <input
                id="reset-email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="auth-btn primary"
              disabled={isLoading || !email}
            >
              {isLoading ? <span className="aka-spinner" /> : '📧 Send Reset Link'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, margin: '16px 0' }}>✅</div>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
              If an account exists for <strong>{email}</strong>, you&apos;ll receive
              a reset link shortly. Check your spam folder too!
            </p>
            <button
              className="auth-btn primary"
              style={{ marginTop: 20 }}
              onClick={() => setAuthScreen('signin')}
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reset Confirm Screen (after clicking email link) ──────────
export function ResetPasswordScreen() {
  const { resetPasswordConfirm, setAuthScreen, isLoading, error, message } = useAuthStore();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const passwordMatch = confirm === '' || confirm === password;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8 || password !== confirm) return;
    await resetPasswordConfirm(password);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>🔐</div>
          <h2 className="auth-heading">Create new password</h2>
          <p className="auth-subheading">Choose a strong password for your account</p>
        </div>

        <AuthMessage error={error} message={message} />

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="new-pass">New Password</label>
            <div className="auth-input-wrap">
              <input
                id="new-pass"
                type={showPass ? 'text' : 'password'}
                className="auth-input"
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={8}
                required
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="confirm-pass">Confirm Password</label>
            <input
              id="confirm-pass"
              type={showPass ? 'text' : 'password'}
              className={`auth-input ${!passwordMatch ? 'error' : ''}`}
              placeholder="Repeat your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            {!passwordMatch && <p className="auth-field-error">Passwords don&apos;t match</p>}
          </div>

          <button
            type="submit"
            className="auth-btn primary"
            disabled={isLoading || password.length < 8 || password !== confirm}
          >
            {isLoading ? <span className="aka-spinner" /> : '🔐 Update Password'}
          </button>
        </form>

        {message && (
          <button
            className="auth-btn secondary"
            style={{ marginTop: 12 }}
            onClick={() => setAuthScreen('signin')}
          >
            Go to Sign In →
          </button>
        )}
      </div>
    </div>
  );
}
