'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';

const AVATARS = ['🦊','🐯','🦁','🐺','🐸','🐧','🦋','🐉','🦄','🐼'];

export default function AuthScreen() {
  const { login, register, authError } = useAppStore();
  const [role, setRole] = useState<'kid'|'parent'>('kid');
  const [tab, setTab] = useState<'login'|'register'>('login');
  const [avatar, setAvatar] = useState('🦊');
  const [form, setForm] = useState({
    loginUser:'', loginPass:'',
    regName:'', regUser:'', regPass:'', regAge:'', regEmail:'',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
    setForm(f => ({...f, [k]: e.target.value}));

  function doLogin() {
    login(form.loginUser, form.loginPass);
  }

  function doRegister() {
    if (!form.regName || !form.regUser || !form.regPass) return;
    if (form.regPass.length < 6) return;
    register(form.regName, form.regUser, form.regPass, role, avatar, role==='kid' ? parseInt(form.regAge)||12 : null);
  }

  return (
    <div className="aka-auth-screen">
      <div className="aka-auth-box">
        {/* Logo */}
        <div className="aka-auth-logo">
          <div className="aka-auth-logo-icon">🚀</div>
          <h1>AI Kids Academy</h1>
          <p>Your AI Learning World — Safe &amp; Fun!</p>
        </div>

        {/* Role toggle */}
        <div className="aka-role-toggle">
          {(['kid','parent'] as const).map(r => (
            <div key={r} className={`aka-role-btn${role===r?' active':''}`} onClick={() => setRole(r)}>
              <span className="aka-rb-icon">{r==='kid'?'🧒':'👨‍👩‍👧'}</span>
              {r==='kid' ? "I'm a Kid" : "I'm a Parent"}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="aka-auth-tabs">
          <button className={`aka-auth-tab${tab==='login'?' active':''}`} onClick={() => setTab('login')}>Sign In</button>
          <button className={`aka-auth-tab${tab==='register'?' active':''}`} onClick={() => setTab('register')}>Create Account</button>
        </div>

        {authError && <div className="aka-auth-error">{authError}</div>}

        {tab === 'login' ? (
          <div>
            <div className="aka-form-group">
              <label>Username</label>
              <input className="aka-form-input" placeholder="Enter your username" value={form.loginUser} onChange={set('loginUser')} onKeyDown={e => e.key==='Enter'&&doLogin()}/>
            </div>
            <div className="aka-form-group">
              <label>Password</label>
              <input className="aka-form-input" type="password" placeholder="Enter your password" value={form.loginPass} onChange={set('loginPass')} onKeyDown={e => e.key==='Enter'&&doLogin()}/>
            </div>
            <button className="aka-auth-btn" onClick={doLogin}>🚀 Sign In &amp; Start Learning!</button>
            <div className="aka-auth-switch">
              No account? <span onClick={() => setTab('register')}>Create one free!</span>
            </div>
            <div style={{marginTop:12,fontSize:12,color:'#6B7280',textAlign:'center'}}>
              Demo: username <strong>alex</strong> · password <strong>1234</strong>
            </div>
          </div>
        ) : (
          <div>
            <div className="aka-form-group"><label>Your Name</label>
              <input className="aka-form-input" placeholder="e.g. Alex" value={form.regName} onChange={set('regName')}/>
            </div>
            <div className="aka-form-group"><label>Username</label>
              <input className="aka-form-input" placeholder="Choose a cool username" value={form.regUser} onChange={set('regUser')}/>
            </div>
            {role==='kid' && (
              <div className="aka-form-group"><label>Your Age</label>
                <select className="aka-form-select" value={form.regAge} onChange={set('regAge')}>
                  <option value="">Select age</option>
                  {[9,10,11,12,13,14,15].map(a=><option key={a}>{a}</option>)}
                </select>
              </div>
            )}
            {role==='parent' && (
              <div className="aka-form-group"><label>Email</label>
                <input className="aka-form-input" type="email" placeholder="your@email.com" value={form.regEmail} onChange={set('regEmail')}/>
              </div>
            )}
            <div className="aka-form-group"><label>Password (min 6 chars)</label>
              <input className="aka-form-input" type="password" placeholder="Choose a password" value={form.regPass} onChange={set('regPass')}/>
            </div>
            {role==='kid' && (
              <div className="aka-form-group">
                <label>Choose Your Avatar</label>
                <div className="aka-avatar-picker">
                  {AVATARS.map(a => (
                    <div key={a} className={`aka-avatar-opt${avatar===a?' selected':''}`} onClick={() => setAvatar(a)}>{a}</div>
                  ))}
                </div>
              </div>
            )}
            <button className="aka-auth-btn" onClick={doRegister}>🌟 Create My Account!</button>
            <div className="aka-auth-switch">
              Have an account? <span onClick={() => setTab('login')}>Sign in!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
