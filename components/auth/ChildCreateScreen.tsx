'use client';
import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import AuthMessage from './AuthMessage';

const AVATARS = ['🦊','🐯','🦁','🐺','🐸','🐧','🦋','🐉','🦄','🐼','🐨','🦝','🐙','🦈','🦖'];
const AGES    = [7, 8, 9, 10, 11, 12, 13, 14, 15];

export default function ChildCreateScreen() {
  const { createChild, setAuthScreen, signOut, children, isLoading, error, message, clearError } = useAuthStore();
  const [name,   setName]   = useState('');
  const [avatar, setAvatar] = useState('🦊');
  const [age,    setAge]    = useState(10);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createChild(name.trim(), avatar, age);
  }

  // Check if error is the "Account setup failed" kind
  const isAccountError = error?.includes('Account setup') || error?.includes('sign out');

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Back button — show if has other children OR if there's an account error */}
        {children.length > 0 && (
          <button className="auth-back-btn" onClick={() => { clearError(); setAuthScreen('child-select'); }}>
            ← Back
          </button>
        )}

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>🧒</div>
          <h2 className="auth-heading">Create child profile</h2>
          <p className="auth-subheading">
            Set up a learning profile for your child
          </p>
        </div>

        <AuthMessage error={error} message={message} />

        {/* Show sign-out option when account setup fails */}
        {isAccountError && (
          <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => signOut()}
              className="auth-btn"
              style={{ background: '#FF6B6B', color: '#fff', border: 'none' }}
            >
              🚪 Sign Out & Try Again
            </button>
            <p style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
              Sign out, then sign in again to fix this automatically.
            </p>
          </div>
        )}

        <form onSubmit={handleCreate} className="auth-form">
          {/* Avatar picker */}
          <div className="auth-field">
            <label>Choose an Avatar</label>
            <div className="child-avatar-picker">
              {AVATARS.map(a => (
                <button
                  key={a}
                  type="button"
                  className={`cav-btn${avatar === a ? ' selected' : ''}`}
                  onClick={() => setAvatar(a)}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="cav-preview">{avatar}</div>
          </div>

          {/* Name */}
          <div className="auth-field">
            <label htmlFor="child-name">Child&apos;s First Name</label>
            <input
              id="child-name"
              type="text"
              className="auth-input"
              placeholder="e.g. Alex"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={30}
              required
            />
          </div>

          {/* Age */}
          <div className="auth-field">
            <label>Age</label>
            <div className="age-picker">
              {AGES.map(a => (
                <button
                  key={a}
                  type="button"
                  className={`age-btn${age === a ? ' selected' : ''}`}
                  onClick={() => setAge(a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="child-preview-card">
            <div className="cp-avatar">{avatar}</div>
            <div>
              <div className="cp-name">{name || 'Your child'}</div>
              <div className="cp-meta">Age {age} · Level 1 · 0 XP</div>
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn primary"
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? <span className="aka-spinner" /> : `🚀 Start ${name || 'Learning'}!`}
          </button>
        </form>

        {/* Always show sign-out link at bottom */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => signOut()}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Sign out
          </button>
        </div>

        <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>
          You can add up to 4 child profiles. Each profile has its own progress, XP, and pets.
        </p>
      </div>
    </div>
  );
}
