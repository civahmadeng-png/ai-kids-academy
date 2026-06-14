'use client';
import { useAppStore, type ScreenId } from '@/lib/store';
import { useAuthStore }               from '@/lib/auth-store';

const QUICK_NAV = [
  {icon:'🤖', label:'Sparky',   screen:'mentor'},
  {icon:'🧠', label:'Learn',    screen:'explorer'},
  {icon:'🧪', label:'Science',  screen:'science'},
  {icon:'🎨', label:'Art',      screen:'art'},
  {icon:'💪', label:'Habits',   screen:'habits'},
  {icon:'🏆', label:'Awards',   screen:'achievements'},
];

const PETS = {pip:'🦊',bolt:'⚡',nova:'🌟',draco:'🐉',sparkle:'✨'} as Record<string,string>;

export default function HomeScreen() {
  const { currentUser, navigate, addXP, addCoins, updateUser, showModal } = useAppStore();
  const { activeChild } = useAuthStore();
  if (!currentUser) return null;

  const name   = (activeChild?.displayName ?? currentUser.name).split(' ')[0];
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const today  = `${days[new Date().getDay()]} · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric'})}`;

  // Daily reward
  const lastDate   = currentUser.lastDailyReward ? new Date(currentUser.lastDailyReward).toDateString() : '';
  const canClaim   = lastDate !== new Date().toDateString();

  function claimDaily() {
    const rewards = [
      {xp:25,coins:10,msg:'25 XP and 10 coins!'},
      {xp:30,coins:15,msg:'30 XP and 15 coins!'},
      {xp:50,coins:20,msg:'Jackpot! 50 XP and 20 coins!'},
      {xp:20,coins:25,msg:'20 XP and 25 coins!'},
    ];
    const r = rewards[Math.floor(Math.random()*rewards.length)];
    addXP(r.xp); addCoins(r.coins);
    updateUser({ lastDailyReward: Date.now() });
    showModal('🎁','Daily Reward!', r.msg + ' See you tomorrow! 🌟');
  }

  // Today missions — merge store + localStorage for accuracy
  const todayKey   = new Date().toISOString().split('T')[0];
  const checkedKey = `habits_checked_${todayKey}`;
  let localHabits: string[] = [];
  try { localHabits = JSON.parse(localStorage.getItem(checkedKey) ?? '[]'); } catch { /**/ }
  const habitsToday = [...new Set([...(currentUser?.habitsToday ?? []), ...localHabits])];

  const MISSIONS = [
    {id:'lesson',   icon:'🧠', name:'Complete 1 AI lesson',      xp:30, screen:'explorer' as ScreenId},
    {id:'science',  icon:'🧪', name:'Try a science experiment',   xp:40, screen:'science'  as ScreenId},
    {id:'habit',    icon:'💪', name:'Check off 4 habits',         xp:25, screen:'habits'   as ScreenId},
    {id:'mentor',   icon:'🤖', name:'Ask Sparky a question',      xp:15, screen:'mentor'   as ScreenId},
  ];

  // Streak info
  const streak   = currentUser.streak ?? 0;
  const xp       = currentUser.xp ?? 0;
  const level    = currentUser.level ?? Math.floor(xp/500)+1;
  const xpInLvl  = xp % 500;
  const lvlPct   = Math.round((xpInLvl/500)*100);

  // Pet
  const petId    = currentUser.activePet ?? 'pip';
  const petEmoji = PETS[petId] ?? '🦊';

  // Learning journey summary (top completion)
  const journeyPcts = [
    {name:'AI Explorer',  pct: Math.round((currentUser.lessonsCompleted.length/12)*100)},
    {name:'Science',      pct: Math.round((currentUser.completedExperiments.length/8)*100)},
    {name:'Engineering',  pct: Math.round((currentUser.completedEng.length/8)*100)},
  ].sort((a,b)=>b.pct-a.pct);

  // Weekly challenge progress
  const WEEKS = ['ai_week','science_week','builder_week','creative_week','savings_week','habit_week'];
  const weekIdx    = Math.floor(Date.now() / (7*24*3600*1000)) % WEEKS.length;
  let weekDone = 0;
  try { weekDone = JSON.parse(localStorage.getItem(`weekly_${WEEKS[weekIdx]}`) ?? '[]').length; } catch { /**/ }

  return (
    <div>
      {/* Hero */}
      <div className="aka-hero-card">
        <div className="aka-hero-greeting">{today}</div>
        <div className="aka-hero-title">Ready to learn, {name}? 🚀</div>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:10, flexWrap:'wrap' }}>
          <div style={{ background:'rgba(255,255,255,.15)', borderRadius:10, padding:'6px 12px', fontSize:13, fontWeight:700 }}>
            🔥 {streak}-day streak
          </div>
          <div style={{ background:'rgba(255,255,255,.15)', borderRadius:10, padding:'6px 12px', fontSize:13, fontWeight:700 }}>
            ⭐ Level {level} · {xp} XP
          </div>
          <div style={{ background:'rgba(255,255,255,.15)', borderRadius:10, padding:'6px 12px', fontSize:13, fontWeight:700 }}>
            {petEmoji} {petId.charAt(0).toUpperCase()+petId.slice(1)}
          </div>
        </div>
        {/* XP bar */}
        <div style={{ marginTop:12, background:'rgba(255,255,255,.15)', borderRadius:99, height:6, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${lvlPct}%`, background:'#fff', borderRadius:99, transition:'width .8s' }}/>
        </div>
        <div style={{ fontSize:11, opacity:.7, marginTop:4 }}>{xpInLvl}/500 XP to Level {level+1}</div>
        <div className="aka-hero-emoji">{petEmoji}</div>
      </div>

      {/* Daily reward */}
      {canClaim && (
        <div className="aka-daily-reward" onClick={claimDaily} style={{ cursor:'pointer' }}>
          <div style={{ fontSize:40, flexShrink:0 }} className="bounce-anim">🎁</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:15, marginBottom:2 }}>Daily Reward Available!</div>
            <div style={{ fontSize:12, opacity:.9 }}>Tap to claim XP, coins, and a surprise!</div>
          </div>
          <button className="aka-dr-btn">Claim!</button>
        </div>
      )}

      {/* Quick navigation */}
      <div className="aka-section-header"><h2>Quick Access</h2></div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8, marginBottom:20 }}>
        {QUICK_NAV.map(n => (
          <button key={n.screen} onClick={() => navigate(n.screen as ScreenId)}
            style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:14, padding:'12px 4px', display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer', transition:'all .15s', fontSize:11, fontWeight:700, color:'#374151' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--sky)';e.currentTarget.style.color='var(--sky)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#E5E7EB';e.currentTarget.style.color='#374151';}}>
            <span style={{ fontSize:22 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      {/* Today's Missions */}
      <div className="aka-section-header"><h2>Today&apos;s Missions</h2></div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
        {MISSIONS.map(m => {
          const done = currentUser.habitsToday.includes(m.id) || habitsToday.includes(m.id);
          return (
            <div key={m.id}
              onClick={() => navigate(m.screen)}
              style={{ background:done?'#DCFDF2':'#fff', border:`2px solid ${done?'#22D3A6':'#E5E7EB'}`, borderRadius:14, padding:14, cursor:'pointer', display:'flex', alignItems:'center', gap:10, transition:'all .2s' }}>
              <div style={{ fontSize:26, flexShrink:0 }}>{m.icon}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:done?'#065F46':'#1A1D3A' }}>{done?'✅ ':''}{m.name}</div>
                <div style={{ fontSize:11, color:done?'#22D3A6':'var(--sky)', fontWeight:700 }}>{done?'Done!':'+'+m.xp+' XP'}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly progress + Learning journey */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
        {/* Weekly challenge */}
        <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:16, cursor:'pointer' }}
          onClick={() => navigate('weekly')}>
          <div style={{ fontWeight:800, fontSize:13, marginBottom:8 }}>🎯 Weekly Challenge</div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#6B7280', marginBottom:6 }}>
            <span>{weekDone}/5 complete</span>
            <span style={{ color:'var(--sky)', fontWeight:700 }}>View →</span>
          </div>
          <div style={{ height:6, background:'#E5E7EB', borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${Math.round(weekDone/5*100)}%`, background:'linear-gradient(90deg,var(--sky),var(--violet))', borderRadius:99 }}/>
          </div>
        </div>

        {/* Top learning journey */}
        <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:16, cursor:'pointer' }}
          onClick={() => navigate('journeys')}>
          <div style={{ fontWeight:800, fontSize:13, marginBottom:8 }}>🗺️ Learning Journey</div>
          {journeyPcts[0] && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#6B7280', marginBottom:6 }}>
                <span>{journeyPcts[0].name}</span>
                <span style={{ color:'var(--sky)', fontWeight:700 }}>{journeyPcts[0].pct}%</span>
              </div>
              <div style={{ height:6, background:'#E5E7EB', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${journeyPcts[0].pct}%`, background:'linear-gradient(90deg,var(--mint),var(--sky))', borderRadius:99 }}/>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recommended activity */}
      {(() => {
        const completedLessons = currentUser.lessonsCompleted.length;
        const completedExp     = currentUser.completedExperiments.length;
        const completedEng     = currentUser.completedEng.length;
        let rec = { icon:'🧠', text:'Continue AI Explorer', screen:'explorer' as ScreenId, reason:'Build your AI knowledge!' };
        if (completedLessons >= 3 && completedExp < 3) rec = { icon:'🧪', text:'Try a Science Experiment', screen:'science', reason:'You\'re ready for the lab!' };
        if (completedExp >= 3 && completedEng < 2)     rec = { icon:'⚙️', text:'Engineering Challenge',   screen:'engineering', reason:'Put your skills to work!' };
        if (streak < 3)                                 rec = { icon:'💪', text:'Check Your Daily Habits', screen:'habits', reason:'Build your streak!' };
        return (
          <div style={{ background:'linear-gradient(135deg,var(--sky-light),var(--violet-light))', border:'1.5px solid rgba(79,142,247,.3)', borderRadius:16, padding:16, marginBottom:20, cursor:'pointer' }}
            onClick={() => navigate(rec.screen)}>
            <div style={{ fontWeight:700, fontSize:11, color:'var(--sky)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>⭐ Recommended for you</div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ fontSize:32 }}>{rec.icon}</div>
              <div>
                <div style={{ fontWeight:800, fontSize:15, marginBottom:2 }}>{rec.text}</div>
                <div style={{ fontSize:12, color:'#6B7280' }}>{rec.reason}</div>
              </div>
              <div style={{ marginLeft:'auto', color:'var(--sky)', fontWeight:700, fontSize:13 }}>Go →</div>
            </div>
          </div>
        );
      })()}

      {/* Modules grid */}
      <div className="aka-section-header"><h2>All Modules</h2></div>
      <div className="aka-modules-grid">
        {[
          {icon:'🧠',name:'AI Explorer',   pct:Math.round((currentUser.lessonsCompleted.length/12)*100), screen:'explorer', color:'#4F8EF7'},
          {icon:'🧪',name:'Science Lab',   pct:Math.round((currentUser.completedExperiments.length/8)*100), screen:'science', color:'#22D3A6'},
          {icon:'⚙️',name:'Engineering',   pct:Math.round((currentUser.completedEng.length/8)*100), screen:'engineering', color:'#FFB800'},
          {icon:'🚀',name:'Space Explorer',pct:Math.round((currentUser.completedSpace.length/8)*100), screen:'space', color:'#8B5CF6'},
          {icon:'🌎',name:'Discovery',      pct:Math.round((currentUser.completedDiscovery?.length??0)/8*100), screen:'discovery', color:'#22D3A6'},
          {icon:'📚',name:'Story World',   pct:Math.min(100,Math.round((currentUser.completedStories.length/5)*100)), screen:'story', color:'#FF6B6B'},
          {icon:'🌟',name:'Careers',        pct:Math.min(100,Math.round((currentUser.exploredCareers.length/8)*100)), screen:'career', color:'#FFB800'},
          {icon:'🎨',name:'Art Studio',    pct:currentUser.creations.length>0?20:0, screen:'art', color:'#8B5CF6'},
          {icon:'🔨',name:'DIY Creator',   pct:Math.round((currentUser.completedDIY?.length??0)/8*100), screen:'diy', color:'#FF6B6B'},
          {icon:'💪',name:'Habit Hero',    pct:Math.round((currentUser.habitsCompleted/200)*100), screen:'habits', color:'#22D3A6'},
          {icon:'🐷',name:'Smart Savings', pct:Math.min(100,Math.round((currentUser.totalSaved/100)*100)), screen:'savings', color:'#22D3A6'},
          {icon:'🤖',name:'AI Mentor',     pct:0, screen:'mentor', color:'#4F8EF7', badge:'AI'},
        ].map(m => (
          <div key={m.screen} className="aka-module-card" onClick={() => navigate(m.screen as ScreenId)}>
            {m.badge ? (
              <div className="aka-mc-badge" style={{ background:'rgba(79,142,247,.15)', color:'#4F8EF7' }}>{m.badge}</div>
            ) : m.pct > 0 ? (
              <div className="aka-mc-badge" style={{ background:m.color+'22', color:m.color }}>{m.pct}%</div>
            ) : null}
            <div className="aka-mc-icon">{m.icon}</div>
            <div className="aka-mc-name">{m.name}</div>
            {m.pct > 0 && <div className="aka-mc-progress"><div className="aka-mc-fill" style={{ width:`${m.pct}%`, background:m.color }}/></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
