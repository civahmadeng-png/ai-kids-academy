'use client';
import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { isDemoMode } from '@/lib/supabaseClient';
import AuthMessage from './AuthMessage';

export default function SignInScreen() {
  const { signIn, signInWithGoogle, setAuthScreen, isLoading, error, message, clearError } = useAuthStore();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const demo = isDemoMode();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    await signIn(email, password);
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

        <h2 className="auth-heading">Welcome back!</h2>
        <p className="auth-subheading">Sign in to your parent account</p>

        <AuthMessage error={error} message={message} />

        {/* Google sign-in */}
        {!demo && (
          <button
            className="auth-btn google"
            onClick={signInWithGoogle}
            disabled={isLoading}
            style={{ position:'relative', overflow:'hidden' }}
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
                Continue with Google
              </>
            )}
          </button>
        )}

        {!demo && <div className="auth-divider"><span>or sign in with email</span></div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Parent Email</label>
            <input
              id="email"
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
            <div className="auth-field-row">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="auth-forgot-link"
                onClick={() => setAuthScreen('reset-request')}
              >
                Forgot password?
              </button>
            </div>
            <div className="auth-input-wrap">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="auth-input"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPass(s => !s)}
                tabIndex={-1}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn primary"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? <span className="aka-spinner" /> : 'Sign In →'}
          </button>
        </form>

        <p className="auth-switch-text">
          Don&apos;t have an account?{' '}
          <button className="auth-link-btn" onClick={() => { clearError(); setAuthScreen('signup'); }}>
            Create one free!
          </button>
        </p>

        {/* Demo shortcut */}
        <div className="auth-divider"><span>or</span></div>
        <button className="auth-btn demo" onClick={() => useAuthStore.getState().enterDemoMode()}>
          🎮 Try Demo Mode
        </button>

        <p className="auth-demo-hint">Demo: email <strong>demo@test.com</strong> · password <strong>any</strong></p>
      </div>
    </div>
  );
}
