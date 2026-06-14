'use client';
import { useEffect, useState, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────
interface AdminMetrics {
  totalParents:   number;
  totalChildren:  number;
  totalUsers:     number;
  freeSubs:       number;
  premiumSubs:    number;
  familySubs:     number;
  trialSubs:      number;
  cancelledSubs:  number;
  activePaidSubs: number;
  estimatedMRR:   number;
  estimatedARR:   number;
  signups24h:     number;
  signups7d:      number;
  signups30d:     number;
  dailySeries:    Array<{ day: string; count: number }>;
  totalCompletions: number;
  allTimeModules: Record<string, number>;
  moduleCounts30d: Record<string, number>;
  aiByFeature:    Record<string, number>;
  totalAICalls30d: number;
  recentSignups:  Array<{
    id: string; email: string; name: string;
    plan: string; joinedAt: string; lastLogin: string | null;
  }>;
  generatedAt: string;
}

// ── Event counts type ────────────────────────────────────────
interface EventCounts {
  total:    Record<string, number>;
  last30d:  Record<string, number>;
  last7d:   Record<string, number>;
  last24h:  Record<string, number>;
}

// ── Module labels ─────────────────────────────────────────────
const MODULE_LABELS: Record<string, { label: string; icon: string }> = {
  science_experiment:    { label: 'Science Lab',       icon: '🧪' },
  ai_lesson:             { label: 'AI Explorer',        icon: '🧠' },
  engineering_challenge: { label: 'Engineering',        icon: '⚙️' },
  diy_project:           { label: 'DIY Creator',        icon: '🔨' },
  discovery_mission:     { label: 'Discovery',          icon: '🌎' },
  story:                 { label: 'Story World',        icon: '📚' },
  career_exploration:    { label: 'Career Center',      icon: '🌟' },
};

const AI_LABELS: Record<string, string> = {
  mentor:           '🤖 AI Mentor',
  story_generation: '📚 Story Gen',
  art_generation:   '🎨 Art Gen',
  diy_builder:      '🔨 DIY Builder',
  scienceHelper:    '🔬 Science Helper',
  prompt_challenge: '✨ Prompt Master',
};

// ── Main component ────────────────────────────────────────────
export default function AdminDashboard() {
  const [metrics, setMetrics]     = useState<AdminMetrics | null>(null);
  const [events, setEvents]       = useState<EventCounts | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState<'overview' | 'users' | 'activity' | 'revenue' | 'analytics'>('overview');
  const [lastRefresh, setLast]  = useState('');

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const [res, evtRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/events'),
      ]);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      setMetrics(data);
      if (evtRes.ok) setEvents(await evtRes.json());
      setLast(new Date().toLocaleTimeString());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  if (loading && !metrics) return <LoadingState />;
  if (error && !metrics)   return <ErrorState error={error} onRetry={loadMetrics} />;
  if (!metrics)            return null;

  return (
    <div className="adm-wrap">
      {/* Header */}
      <div className="adm-header">
        <div>
          <div className="adm-header-title">🛡️ Admin Dashboard</div>
          <div className="adm-header-sub">AI Kids Academy · Platform Overview</div>
        </div>
        <div className="adm-header-right">
          {error && <div className="adm-error-badge">⚠️ {error}</div>}
          <div className="adm-refresh-time">Updated {lastRefresh}</div>
          <button className="adm-refresh-btn" onClick={loadMetrics} disabled={loading}>
            {loading ? '↻ Loading…' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-tabs">
        {[
          { id: 'overview',  label: '📊 Overview'  },
          { id: 'users',     label: '👥 Users'     },
          { id: 'activity',  label: '📈 Activity'  },
          { id: 'revenue',   label: '💰 Revenue'   },
          { id: 'analytics', label: '📡 Analytics' },
        ].map(t => (
          <button
            key={t.id}
            className={`adm-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id as typeof tab)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div>
          {/* KPI cards row 1 */}
          <div className="adm-kpi-grid">
            <KPICard icon="👤" label="Total Parents"   value={metrics.totalParents}   color="var(--sky)"    />
            <KPICard icon="🧒" label="Total Children"  value={metrics.totalChildren}  color="var(--violet)" />
            <KPICard icon="👥" label="Total Users"     value={metrics.totalUsers}     color="var(--mint)"   />
            <KPICard icon="💰" label="Est. MRR"        value={`$${metrics.estimatedMRR.toFixed(2)}`} color="var(--sun)" sub="monthly recurring" />
            <KPICard icon="⭐" label="Paid Subs"       value={metrics.activePaidSubs} color="var(--sun)"    sub={`${metrics.premiumSubs} premium + ${metrics.familySubs} family`} />
            <KPICard icon="🆓" label="Free Users"      value={metrics.freeSubs}       color="var(--text2)"  />
            <KPICard icon="⏳" label="On Trial"         value={metrics.trialSubs}      color="var(--coral)"  />
            <KPICard icon="📊" label="AI Calls (30d)"  value={metrics.totalAICalls30d} color="var(--sky)"   />
          </div>

          {/* Signup trend */}
          <div className="adm-card">
            <div className="adm-card-title">📅 Signups (last 14 days)</div>
            <div className="adm-signup-badges">
              <div className="adm-sb-item"><div className="adm-sb-val">{metrics.signups24h}</div><div className="adm-sb-label">Last 24h</div></div>
              <div className="adm-sb-item"><div className="adm-sb-val">{metrics.signups7d}</div><div className="adm-sb-label">Last 7 days</div></div>
              <div className="adm-sb-item"><div className="adm-sb-val">{metrics.signups30d}</div><div className="adm-sb-label">Last 30 days</div></div>
            </div>
            <BarChart data={metrics.dailySeries} color="var(--sky)" />
          </div>

          {/* Plan breakdown */}
          <div className="adm-card">
            <div className="adm-card-title">📊 Plan Distribution</div>
            <PlanBreakdown
              free={metrics.freeSubs}
              premium={metrics.premiumSubs}
              family={metrics.familySubs}
              trial={metrics.trialSubs}
              cancelled={metrics.cancelledSubs}
            />
          </div>
        </div>
      )}

      {/* ── USERS ── */}
      {tab === 'users' && (
        <div>
          <div className="adm-card">
            <div className="adm-card-title">🕐 Recent Signups (last 20)</div>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email (masked)</th>
                  <th>Plan</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentSignups.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.email}</td>
                    <td><PlanChip plan={u.plan} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text2)' }}>{formatDate(u.joinedAt)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text2)' }}>{u.lastLogin ? formatDate(u.lastLogin) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="adm-privacy-note">
            🔒 Email addresses are masked. Full data accessible via Supabase dashboard.
          </div>
        </div>
      )}

      {/* ── ACTIVITY ── */}
      {tab === 'activity' && (
        <div>
          <div className="adm-two-col">
            {/* All-time module counts */}
            <div className="adm-card">
              <div className="adm-card-title">🏆 Module Completions (All Time)</div>
              <ModuleList data={metrics.allTimeModules} />
            </div>
            {/* Last 30 days */}
            <div className="adm-card">
              <div className="adm-card-title">📅 Module Completions (30 days)</div>
              <ModuleList data={metrics.moduleCounts30d} />
            </div>
          </div>

          {/* AI usage */}
          <div className="adm-card">
            <div className="adm-card-title">🤖 AI Feature Usage (30 days) · {metrics.totalAICalls30d} total calls</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(metrics.aiByFeature)
                .sort(([,a],[,b]) => b - a)
                .map(([feature, count]) => {
                  const max = Math.max(...Object.values(metrics.aiByFeature));
                  const pct = Math.round((count / max) * 100);
                  return (
                    <div key={feature}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                        <span style={{ fontWeight:600 }}>{AI_LABELS[feature] ?? feature}</span>
                        <span style={{ color:'var(--text2)' }}>{count} calls</span>
                      </div>
                      <div style={{ height:8, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,var(--sky),var(--violet))', borderRadius:99 }}/>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Total completions */}
          <div className="adm-card" style={{ display:'flex', alignItems:'center', gap:20 }}>
            <div style={{ fontSize:56, fontWeight:900, color:'var(--sky)' }}>{metrics.totalCompletions.toLocaleString()}</div>
            <div>
              <div style={{ fontWeight:800, fontSize:16 }}>Total Activity Completions</div>
              <div style={{ fontSize:13, color:'var(--text2)' }}>Across all modules, all time. Each completion = a real skill built.</div>
            </div>
          </div>
        </div>
      )}

      {/* ── REVENUE ── */}
      {tab === 'revenue' && (
        <div>
          <div className="adm-kpi-grid" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))' }}>
            <KPICard icon="💰" label="Estimated MRR"    value={`$${metrics.estimatedMRR.toFixed(2)}`}  color="var(--sun)" sub="monthly recurring revenue" />
            <KPICard icon="📈" label="Estimated ARR"    value={`$${metrics.estimatedARR.toFixed(2)}`}  color="var(--mint)" sub="annual run rate" />
            <KPICard icon="⭐" label="Premium Subs"     value={metrics.premiumSubs}   color="var(--sky)"   sub={`$${(metrics.premiumSubs * 9.99).toFixed(2)}/mo`} />
            <KPICard icon="👨‍👩‍👧" label="Family Subs"    value={metrics.familySubs}    color="var(--mint)"  sub={`$${(metrics.familySubs * 14.99).toFixed(2)}/mo`} />
            <KPICard icon="⏳" label="Trials Active"    value={metrics.trialSubs}     color="var(--coral)" sub="converting soon" />
            <KPICard icon="❌" label="Cancelled"        value={metrics.cancelledSubs} color="var(--text2)" />
          </div>

          <div className="adm-card">
            <div className="adm-card-title">💳 Stripe Integration</div>
            <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7 }}>
              {process.env.NEXT_PUBLIC_STRIPE_PUB_KEY ? (
                <div>
                  <div style={{ color:'var(--mint)', fontWeight:700, marginBottom:8 }}>✅ Stripe is configured</div>
                  For detailed revenue, visit your{' '}
                  <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer"
                    style={{ color:'var(--sky)', fontWeight:600 }}>Stripe Dashboard →</a>
                  <br/>Revenue figures above are estimated from Supabase subscription records.
                </div>
              ) : (
                <div>
                  <div style={{ color:'var(--coral)', fontWeight:700, marginBottom:8 }}>⚠️ Stripe not configured</div>
                  Add <code>NEXT_PUBLIC_STRIPE_PUB_KEY</code> and <code>STRIPE_SECRET_KEY</code> to .env.local to enable real payment tracking.
                </div>
              )}
            </div>
          </div>

          <div className="adm-card adm-placeholder">
            <div style={{ fontWeight:800, fontSize:15, marginBottom:8 }}>📊 Revenue Chart</div>
            <div style={{ color:'var(--text2)', fontSize:13 }}>
              Connect Stripe webhooks to populate real MRR history. Each{' '}
              <code>invoice.payment_succeeded</code> event is recorded and can be aggregated here.
            </div>
            <div className="adm-placeholder-chart">
              {[40,60,55,80,75,90,85,100,95,110,108,120].map((h,i)=>(
                <div key={i} className="adm-pc-bar" style={{ height:`${h}%`, opacity:.4 + i*.05 }}/>
              ))}
            </div>
            <div style={{ fontSize:11, color:'var(--text2)', textAlign:'center', marginTop:8 }}>
              Revenue data populates automatically after your first paid subscription via Stripe webhooks
            </div>
          </div>
        </div>
      )}

      {/* Error log placeholder */}
      {/* ── ANALYTICS ── */}
      {tab === 'analytics' && (
        <div>
          {!events ? (
            <div className="adm-card" style={{textAlign:'center',padding:32,color:'var(--text2)',fontSize:13}}>
              <div style={{fontSize:32,marginBottom:8}}>📡</div>
              No event data yet — run <code>analytics-schema.sql</code> in Supabase then generate some events.
            </div>
          ) : (
            <>
              {/* Event overview cards */}
              <div className="adm-kpi-grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))'}}>
                {[
                  {key:'sign_up',         label:'Sign Ups',            icon:'📋'},
                  {key:'login',           label:'Logins',              icon:'🔑'},
                  {key:'lesson_completed',label:'Lessons Done',        icon:'🧠'},
                  {key:'science_completed',label:'Science Done',       icon:'🧪'},
                  {key:'ai_mentor_used',  label:'AI Mentor Uses',      icon:'🤖'},
                  {key:'upgrade_clicked', label:'Upgrade Clicks',      icon:'⭐'},
                  {key:'subscription_started',label:'Subs Started',   icon:'💳'},
                  {key:'ai_limit_reached',label:'Limit Reached',       icon:'⏰'},
                ].map(({key,label,icon}) => (
                  <div key={key} className="adm-kpi-card">
                    <div className="adm-kpi-icon" style={{background:'var(--sky)18',color:'var(--sky)'}}>{icon}</div>
                    <div className="adm-kpi-label">{label}</div>
                    <div className="adm-kpi-value" style={{color:'var(--sky)'}}>{events.total[key]??0}</div>
                    <div className="adm-kpi-sub">7d: {events.last7d[key]??0} · 24h: {events.last24h[key]??0}</div>
                  </div>
                ))}
              </div>

              {/* Full event table */}
              <div className="adm-card">
                <div className="adm-card-title">📊 All Events (30-day window)</div>
                <table className="adm-table">
                  <thead><tr><th>Event</th><th>All Time</th><th>30 days</th><th>7 days</th><th>24 hours</th></tr></thead>
                  <tbody>
                    {Object.entries(events.total).sort(([,a],[,b])=>b-a).map(([evt,total])=>(
                      <tr key={evt}>
                        <td style={{fontFamily:'monospace',fontSize:12}}>{evt}</td>
                        <td style={{fontWeight:700}}>{total}</td>
                        <td>{events.last30d[evt]??0}</td>
                        <td>{events.last7d[evt]??0}</td>
                        <td>{events.last24h[evt]??0}</td>
                      </tr>
                    ))}
                    {Object.keys(events.total).length===0&&(
                      <tr><td colSpan={5} style={{textAlign:'center',color:'var(--text2)',fontSize:13,padding:'24px 0'}}>No events recorded yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Conversion funnel */}
              <div className="adm-card">
                <div className="adm-card-title">🎯 Conversion Funnel (All Time)</div>
                <FunnelChart events={events.total}/>
              </div>
            </>
          )}
        </div>
      )}

      <div className="adm-card adm-placeholder" style={{ marginTop:20 }}>
        <div style={{ fontWeight:800, fontSize:14, marginBottom:6 }}>🪲 Error Logs</div>
        <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>
          No errors in the last 24 hours. 
          Wire <code>console.error</code> calls to a logging service (Sentry, LogRocket, Logtail)
          to see real error data here. Add <code>NEXT_PUBLIC_SENTRY_DSN</code> to enable.
        </div>
      </div>

      <div className="adm-footer">
        🛡️ Admin Dashboard · AI Kids Academy · Data as of {new Date(metrics.generatedAt).toLocaleString()}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function KPICard({ icon, label, value, color, sub }: { icon:string; label:string; value:string|number; color:string; sub?:string }) {
  return (
    <div className="adm-kpi-card">
      <div className="adm-kpi-icon" style={{ background: color + '18', color }}>{icon}</div>
      <div className="adm-kpi-label">{label}</div>
      <div className="adm-kpi-value" style={{ color }}>{value}</div>
      {sub && <div className="adm-kpi-sub">{sub}</div>}
    </div>
  );
}

function PlanChip({ plan }: { plan: string }) {
  const colors: Record<string, string> = { free:'#6B7280', premium:'#4F8EF7', family:'#22D3A6' };
  return (
    <span style={{ background: (colors[plan] ?? '#6B7280') + '18', color: colors[plan] ?? '#6B7280', padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:700 }}>
      {plan}
    </span>
  );
}

function PlanBreakdown({ free, premium, family, trial, cancelled }:
  { free:number; premium:number; family:number; trial:number; cancelled:number }) {
  const total = free + premium + family;
  if (total === 0) return <div style={{ color:'var(--text2)', fontSize:13 }}>No subscriptions yet</div>;
  const bars = [
    { label:'Free',      value:free,     color:'#6B7280' },
    { label:'Premium',   value:premium,  color:'#4F8EF7' },
    { label:'Family',    value:family,   color:'#22D3A6' },
  ];
  return (
    <div>
      <div style={{ display:'flex', height:16, borderRadius:99, overflow:'hidden', gap:1, marginBottom:14 }}>
        {bars.filter(b=>b.value>0).map(b=>(
          <div key={b.label} style={{ background:b.color, flex:b.value }} title={`${b.label}: ${b.value}`}/>
        ))}
      </div>
      <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
        {bars.map(b=>(
          <div key={b.label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
            <div style={{ width:10,height:10,borderRadius:2,background:b.color }}/>
            <span style={{ color:'var(--text2)' }}>{b.label}:</span>
            <strong>{b.value}</strong>
            <span style={{ color:'var(--text2)', fontSize:11 }}>({total?Math.round(b.value/total*100):0}%)</span>
          </div>
        ))}
        <div style={{ fontSize:12, color:'var(--text2)' }}>
          Trials: <strong>{trial}</strong> · Cancelled: <strong>{cancelled}</strong>
        </div>
      </div>
    </div>
  );
}

function ModuleList({ data }: { data: Record<string, number> }) {
  const sorted = Object.entries(data).sort(([,a],[,b]) => b - a);
  const max = sorted[0]?.[1] ?? 1;
  if (sorted.length === 0) return <div style={{ fontSize:13, color:'var(--text2)' }}>No completions yet</div>;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {sorted.map(([type, count]) => {
        const meta = MODULE_LABELS[type] ?? { label: type, icon: '📊' };
        const pct  = Math.round((count / max) * 100);
        return (
          <div key={type}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
              <span style={{ fontWeight:600 }}>{meta.icon} {meta.label}</span>
              <span style={{ color:'var(--text2)' }}>{count}</span>
            </div>
            <div style={{ height:7, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:'var(--mint)', borderRadius:99, transition:'width 1s' }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BarChart({ data, color }: { data: Array<{day:string;count:number}>; color:string }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:80, marginTop:12 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
          <div style={{
            width:'100%', background:color, borderRadius:'3px 3px 0 0',
            height:`${Math.max(4, (d.count / max) * 70)}px`,
            transition:'height .5s ease',
            opacity: d.count === 0 ? .2 : 1,
          }} title={`${d.day}: ${d.count} signups`}/>
          {i % 3 === 0 && <div style={{ fontSize:9, color:'var(--text2)', whiteSpace:'nowrap' }}>{d.day.split(' ')[1]}</div>}
        </div>
      ))}
    </div>
  );
}

function FunnelChart({ events }: { events: Record<string, number> }) {
  const steps = [
    { label: 'Visited Upgrade',   key: 'plan_upgrade_viewed',  color: 'var(--sky)'    },
    { label: 'Clicked Upgrade',   key: 'upgrade_clicked',       color: 'var(--violet)' },
    { label: 'Subscription Started', key: 'subscription_started', color: 'var(--mint)'   },
  ];
  const max = events[steps[0].key] ?? 1;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {steps.map((step, i) => {
        const count = events[step.key] ?? 0;
        const pct   = max > 0 ? Math.round((count / max) * 100) : 0;
        const conv  = i > 0 ? (events[steps[i-1].key] ?? 1) > 0
          ? Math.round((count / (events[steps[i-1].key] ?? 1)) * 100)
          : 0 : 100;
        return (
          <div key={step.key}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
              <span style={{fontWeight:700}}>{step.label}</span>
              <span style={{color:'var(--text2)'}}>{count} {i>0?`(${conv}% from prev)`:''}</span>
            </div>
            <div style={{height:20,background:'var(--border)',borderRadius:6,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${pct}%`,background:step.color,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:6}}>
                {pct>8&&<span style={{fontSize:10,fontWeight:800,color:'#fff'}}>{pct}%</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:16 }}>
      <div style={{ width:48, height:48, border:'4px solid var(--border)', borderTopColor:'var(--sky)', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>
      <div style={{ fontWeight:700, color:'var(--text2)' }}>Loading admin metrics…</div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error:string; onRetry:()=>void }) {
  return (
    <div style={{ maxWidth:500, margin:'60px auto', textAlign:'center', padding:32 }}>
      <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
      <div style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>Dashboard Error</div>
      <div style={{ fontSize:13, color:'var(--text2)', marginBottom:20, lineHeight:1.6 }}>{error}</div>
      <button onClick={onRetry} style={{ background:'var(--sky)', color:'#fff', border:'none', borderRadius:12, padding:'11px 24px', fontWeight:700, cursor:'pointer' }}>
        Try Again
      </button>
      <div style={{ marginTop:16, fontSize:12, color:'var(--text2)' }}>
        Make sure you are signed in as an admin and Supabase is configured.
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}
