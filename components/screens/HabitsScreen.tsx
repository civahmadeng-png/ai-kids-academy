'use client';
import { useState, useEffect } from 'react';
import { useAppStore }   from '@/lib/store';

const HABITS = [
  {id:'bed',      icon:'🛏️', name:'Make Your Bed',      xp:10, coins:2, desc:'Start the day with a win!'},
  {id:'teeth',    icon:'🦷', name:'Brush Your Teeth',   xp:10, coins:2, desc:'2 minutes, morning and night'},
  {id:'read',     icon:'📚', name:'Read 10 Minutes',    xp:20, coins:5, desc:'Any book, any topic!'},
  {id:'water',    icon:'💧', name:'Drink Water',        xp:10, coins:2, desc:'8 glasses a day keeps you sharp'},
  {id:'family',   icon:'👨‍👩‍👧', name:'Help the Family',  xp:15, coins:3, desc:'A small act of kindness'},
  {id:'homework', icon:'📝', name:'Do Homework',        xp:25, coins:6, desc:'Future you will be grateful!'},
  {id:'exercise', icon:'🏃', name:'Exercise',           xp:20, coins:5, desc:'Run, dance, jump — anything!'},
  {id:'sleep',    icon:'😴', name:'Sleep on Time',      xp:15, coins:3, desc:'8–10 hours for your age'},
];

const HERO_LEVELS = [
  {min:0,  label:'Habit Starter', icon:'🌱', color:'#22D3A6'},
  {min:3,  label:'Habit Builder', icon:'🔥', color:'#FFB800'},
  {min:6,  label:'Habit Hero',    icon:'💪', color:'#4F8EF7'},
  {min:8,  label:'Habit Legend',  icon:'⭐', color:'#8B5CF6'},
];

export default function HabitsScreen() {
  const { currentUser, addXP, addCoins, updateUser } = useAppStore();

  const todayKey  = new Date().toISOString().split('T')[0];
  const checkedKey = `habits_checked_${todayKey}`;     // what's checked today
  const rewardedKey = `habits_rewarded_${todayKey}`;   // which rewards already given today

  // checked = visually checked; rewarded = XP already paid (can't undo)
  const [checked,  setChecked]    = useState<Set<string>>(new Set());
  const [rewarded, setRewarded]   = useState<Set<string>>(new Set());
  const [celebrating, setCelebrate] = useState(false);
  const [bonusGiven, setBonusGiven] = useState(false);

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem(checkedKey)  ?? '[]');
      const r = JSON.parse(localStorage.getItem(rewardedKey) ?? '[]');
      setChecked(new Set(c));
      setRewarded(new Set(r));
      setBonusGiven(r.length === HABITS.length);
    } catch { /* ignore */ }
  }, [checkedKey, rewardedKey]);

  const totalDone = checked.size;
  const heroLevel = HERO_LEVELS.slice().reverse().find(l => totalDone >= l.min) ?? HERO_LEVELS[0];
  const pct       = Math.round((totalDone / HABITS.length) * 100);

  function toggle(habitId: string) {
    const newChecked = new Set(checked);
    if (newChecked.has(habitId)) {
      // Unchecking: allowed visually, but XP already given cannot be taken back
      newChecked.delete(habitId);
    } else {
      newChecked.add(habitId);
      // Only award XP/coins if NOT already rewarded today
      if (!rewarded.has(habitId)) {
        const habit = HABITS.find(h => h.id === habitId)!;
        addXP(habit.xp);
        addCoins(habit.coins);

        const newRewarded = new Set(rewarded);
        newRewarded.add(habitId);
        setRewarded(newRewarded);
        try { localStorage.setItem(rewardedKey, JSON.stringify([...newRewarded])); } catch { /* */ }

        // Update habitsToday in store for home dashboard mission tracking
        updateUser({
          habitsToday: [...(currentUser?.habitsToday ?? []), habitId],
        });

        // Perfect day bonus — only once
        if (newRewarded.size === HABITS.length && !bonusGiven) {
          addXP(50); addCoins(15);
          setBonusGiven(true);
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 3500);
          // Compute streak correctly using yesterday's key
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayKey = `habits_rewarded_${yesterday.toISOString().split('T')[0]}`;
          const hadYesterday = !!localStorage.getItem(yesterdayKey);
          const prevStreak   = currentUser?.habitStreak ?? 0;
          const newStreak    = hadYesterday ? prevStreak + 1 : 1;
          // Single updateUser call: increment habitsCompleted by the number of habits completed today
          // Use the SET size rather than the stale closure value to avoid double-count
          updateUser({
            habitStreak:     newStreak,
            streak:          Math.max(currentUser?.streak ?? 0, newStreak),
            habitsCompleted: (currentUser?.habitsCompleted ?? 0) + HABITS.length,
          });
        }
      }
    }

    setChecked(newChecked);
    try { localStorage.setItem(checkedKey, JSON.stringify([...newChecked])); } catch { /* */ }
  }

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${heroLevel.color},#1A1D3A)`, borderRadius:20, padding:24, color:'#fff', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14 }}>
          <div style={{ fontSize:52 }}>{heroLevel.icon}</div>
          <div>
            <div style={{ fontSize:11, opacity:.7, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>Habit Hero</div>
            <div style={{ fontSize:22, fontWeight:900 }}>{heroLevel.label}</div>
            <div style={{ fontSize:13, opacity:.85 }}>
              🔥 {currentUser?.habitStreak ?? 0}-day streak · {totalDone}/{HABITS.length} done today
            </div>
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,.15)', borderRadius:99, height:10, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:'#fff', borderRadius:99, transition:'width .6s ease' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, opacity:.8, marginTop:5 }}>
          <span>{pct}% complete</span>
          <span>{totalDone}/{HABITS.length} habits</span>
        </div>
      </div>

      {celebrating && (
        <div style={{ background:'linear-gradient(135deg,#FFB800,#FF6B6B)', borderRadius:16, padding:18, marginBottom:16, textAlign:'center', color:'#fff' }}>
          <div style={{ fontSize:40, marginBottom:6 }}>🎉🏆🎉</div>
          <div style={{ fontWeight:900, fontSize:18 }}>ALL HABITS DONE!</div>
          <div style={{ fontSize:13, opacity:.9 }}>+50 bonus XP · +15 coins! Perfect day! ⭐</div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
        {HABITS.map(h => {
          const done = checked.has(h.id);
          const paid = rewarded.has(h.id);
          return (
            <button key={h.id} onClick={() => toggle(h.id)}
              style={{
                display:'flex', alignItems:'center', gap:14,
                background: done ? '#DCFDF2' : '#fff',
                border:`2px solid ${done ? '#22D3A6' : '#E5E7EB'}`,
                borderRadius:14, padding:'14px 16px',
                cursor:'pointer', transition:'all .2s', textAlign:'left', width:'100%',
              }}>
              <div style={{ fontSize:32, flexShrink:0 }}>{h.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:14, color: done ? '#065F46' : '#1A1D3A', marginBottom:2 }}>
                  {done && '✅ '}{h.name}
                </div>
                <div style={{ fontSize:12, color:'#6B7280' }}>{h.desc}</div>
              </div>
              <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                <span style={{ background:paid?'#22D3A620':'var(--sky-light)', color:paid?'#065F46':'var(--sky)', padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:700, textDecoration:paid?'none':'none' }}>
                  {paid ? '✓ XP earned' : `+${h.xp} XP`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:18 }}>
        <div style={{ fontWeight:800, fontSize:14, marginBottom:12 }}>🏆 Hero Levels</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {HERO_LEVELS.map(level => (
            <div key={level.label} style={{ display:'flex', alignItems:'center', gap:10, opacity: totalDone >= level.min ? 1 : .4 }}>
              <div style={{ fontSize:20, width:28 }}>{level.icon}</div>
              <div style={{ flex:1, fontWeight:700, fontSize:13 }}>{level.label}</div>
              <div style={{ fontSize:11, color:'#6B7280' }}>{level.min}+ habits</div>
              {totalDone >= level.min && <span style={{ color:level.color, fontSize:11, fontWeight:700 }}>✓ Unlocked</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
