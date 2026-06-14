'use client';
import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { isDemoMode } from '@/lib/supabaseClient';
import AuthMessage from './AuthMessage';

export default function SignUpScreen() {
  const { signUp, signInWithGoogle, setAuthScreen, isLoading, error, message, clearError } = useAuthStore();
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [agreed, setAgreed]       = useState(false);
  const demo = isDemoMode();

  const passwordStrength = getPasswordStrength(password);
  const passwordMatch    = confirm === '' || confirm === password;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !email || !password || password !== confirm || !agreed) return;
    if (password.length < 8) return;
    await signUp(email, password, fullName);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="auth-back-btn" onClick={() => { clearError(); setAuthScreen('landing'); }}>
          ← Back
        </button>

        <div className="auth-logo-sm">
          <div className="auth-logo-icon sm">🚀</div>
          <span className="auth-app-name sm">AI Kids Academy</span>
        </div>

        <h2 className="auth-heading">Create your account</h2>
        <p className="auth-subheading">Parent account · Free to start</p>

        <AuthMessage error={error} message={message} />

        {/* Google */}
        {!demo && (
          <button
            className="auth-btn google"
            onClick={signInWithGoogle}
            disabled={isLoading}
          >
            {isLoading ? (
              <><span className="aka-spinner" style={{ width:16, height:16, borderWidth:2, marginRight:8 }}/>Redirecting to Google...</>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </>
            )}
          </button>
        )}

        {!demo && <div className="auth-divider"><span>or sign up with email</span></div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="fullname">Your Full Name</label>
            <input
              id="fullname"
              type="text"
              className="auth-input"
              placeholder="e.g. Sarah Johnson"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="su-email">Email Address</label>
            <input
              id="su-email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="su-password">Password</label>
            <div className="auth-input-wrap">
              <input
                id="su-password"
                type={showPass ? 'text' : 'password'}
                className="auth-input"
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {password && (
              <div className="password-strength">
                <div className={`ps-bar ${passwordStrength.level}`} style={{ width: `${passwordStrength.pct}%` }} />
                <span className={`ps-label ${passwordStrength.level}`}>{passwordStrength.label}</span>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              type={showPass ? 'text' : 'password'}
              className={`auth-input ${!passwordMatch ? 'error' : ''}`}
              placeholder="Repeat your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            {!passwordMatch && <p className="auth-field-error">Passwords don&apos;t match</p>}
          </div>

          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
            <span>
              I agree to the{' '}
              <a href="/terms" target="_blank" className="auth-link">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" className="auth-link">Privacy Policy</a>.
              I confirm I am an adult creating this account for my child.
            </span>
          </label>

          <button
            type="submit"
            className="auth-btn primary"
            disabled={
              isLoading || !fullName || !email ||
              password.length < 8 || password !== confirm || !agreed
            }
          >
            {isLoading ? <span className="aka-spinner" /> : '🌟 Create Account'}
          </button>
        </form>

        <p className="auth-switch-text">
          Already have an account?{' '}
          <button className="auth-link-btn" onClick={() => { clearError(); setAuthScreen('signin'); }}>
            Sign in!
          </button>
        </p>
      </div>
    </div>
  );
}

function getPasswordStrength(p: string) {
  if (!p) return { level: '', label: '', pct: 0 };
  let score = 0;
  if (p.length >= 8)  score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score <= 1) return { level: 'weak',   label: 'Weak',   pct: 25 };
  if (score <= 2) return { level: 'fair',   label: 'Fair',   pct: 50 };
  if (score <= 3) return { level: 'good',   label: 'Good',   pct: 75 };
  return              { level: 'strong', label: 'Strong', pct: 100 };
}
