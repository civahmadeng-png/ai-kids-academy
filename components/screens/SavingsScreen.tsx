'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { SupabaseSavings } from '@/lib/supabaseClient';
import { isDemoMode } from '@/lib/supabaseClient';

interface Goal {
  id:      string;
  name:    string;
  emoji:   string;
  target:  number;
  saved:   number;
  createdAt: string;
}

const DEFAULT_GOALS: Goal[] = [
  {id:'book',    name:'New Book',      emoji:'📚', target:12,  saved:0, createdAt:''},
  {id:'bike',    name:'Bicycle',       emoji:'🚲', target:120, saved:0, createdAt:''},
  {id:'art',     name:'Art Supplies',  emoji:'🎨', target:25,  saved:0, createdAt:''},
  {id:'science', name:'Science Kit',   emoji:'🔬', target:35,  saved:0, createdAt:''},
  {id:'robot',   name:'Toy Robot',     emoji:'🤖', target:45,  saved:0, createdAt:''},
];

const MINI_LESSONS = [
  {title:'Need vs. Want 🤔', body:'A NEED is something essential: food, shelter, medicine. A WANT is something nice to have: video games, sweets, new clothes. Which category does your savings goal fall in? Saving for wants helps you appreciate them more!'},
  {title:'The 50-30-20 Rule 💰', body:'Many adults split their money: 50% on needs (food, bills), 30% on wants (fun, treats), 20% on savings. Try this with your pocket money! Even saving 20p from every £1 adds up fast.'},
  {title:'Compound Growth 📈', body:'If you save £10 and it earns 5% interest, next year you have £10.50. Then £11.03. Then £11.58... The money earns money! This is compound growth — Einstein called it the "eighth wonder of the world"! 🌟'},
  {title:'Delayed Gratification 🏆', body:'Research shows kids who can wait for rewards (like the famous marshmallow test) tend to be more successful later in life. Every time you save instead of spend, you\'re training this skill! 💪'},
];

export default function SavingsScreen() {
  const { addXP, addCoins, currentUser, updateUser } = useAppStore();
  const { activeChild } = useAuthStore();
  const childId = activeChild?.id ?? 'demo';
  const [goals, setGoals]       = useState<Goal[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [addAmount, setAdd]     = useState('');
  const [creating, setCreating] = useState(false);
  const [newGoal, setNew]       = useState({ name:'', emoji:'🎯', target:'', saved:'' });
  const [lessonIdx, setLesson]  = useState(0);
  const [xpAwarded, setXPAwarded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    // Try Supabase first, then localStorage fallback
    async function loadGoals() {
      if (!isDemoMode() && childId !== 'demo') {
        try {
          const dbGoals = await SupabaseSavings.getByChild(childId);
          if (dbGoals.length > 0) {
            const mapped: Goal[] = dbGoals.map(g => ({
              id: g.id as string,
              name: g.name as string,
              emoji: (g.emoji as string) ?? '🎯',
              target: Number(g.target),
              saved: Number(g.saved),
              createdAt: (g.created_at as string) ?? new Date().toISOString(),
            }));
            setGoals(mapped);
            try { localStorage.setItem('savings_goals', JSON.stringify(mapped)); } catch { /**/ }
            const xp = localStorage.getItem('savings_xp_awarded');
            setXPAwarded(!!xp);
            return;
          }
        } catch { /* fall through to localStorage */ }
      }
      // localStorage fallback
      try {
        const saved = JSON.parse(localStorage.getItem('savings_goals') ?? 'null');
        setGoals(saved ?? DEFAULT_GOALS.map(g => ({ ...g, createdAt: new Date().toISOString() })));
      } catch {
        setGoals(DEFAULT_GOALS.map(g => ({ ...g, createdAt: new Date().toISOString() })));
      }
      const xp = localStorage.getItem('savings_xp_awarded');
      setXPAwarded(!!xp);
    }
    loadGoals();
  }, [childId]);

  function save(gs: Goal[]) {
    setGoals(gs);
    try { localStorage.setItem('savings_goals', JSON.stringify(gs)); } catch { /* ignore */ }
    // Sync to Supabase (fire-and-forget)
    if (!isDemoMode() && childId !== 'demo') {
      SupabaseSavings.upsertGoals(childId, gs).catch(() => { /* offline — OK */ });
    }
  }

  function addSaving() {
    const amt = parseFloat(addAmount);
    if (!selected || isNaN(amt) || amt <= 0) return;
    const updated = goals.map(g =>
      g.id === selected ? { ...g, saved: Math.min(g.saved + amt, g.target) } : g
    );
    save(updated);
    setAdd('');

    // Sync totalSaved to global user state
    const newTotal = updated.reduce((s,g) => s + g.saved, 0);
    updateUser({ totalSaved: newTotal, savingsGoals: updated.map(g => ({ name:g.name, emoji:g.emoji, target:g.target, current:g.saved })) });

    // Award XP on first save
    if (!xpAwarded) {
      addXP(30);
      addCoins(10);
      setXPAwarded(true);
      try { localStorage.setItem('savings_xp_awarded', '1'); } catch { /* ignore */ }
    }

    // Check if goal reached - only award completion XP once per goal
    const goal = updated.find(g => g.id === selected);
    if (goal && goal.saved >= goal.target) {
      const completedGoalsKey = 'savings_completed_goals';
      try {
        const completedGoals: string[] = JSON.parse(localStorage.getItem(completedGoalsKey) ?? '[]');
        if (!completedGoals.includes(goal.id)) {
          addXP(50); addCoins(20);
          localStorage.setItem(completedGoalsKey, JSON.stringify([...completedGoals, goal.id]));
        }
      } catch { /* localStorage unavailable — skip XP to prevent re-award */ }
    }
  }

  function createGoal() {
    const amt = parseFloat(newGoal.target);
    if (!newGoal.name || isNaN(amt) || amt <= 0) return;
    const g: Goal = {
      id:        Date.now().toString(),
      name:      newGoal.name,
      emoji:     newGoal.emoji,
      target:    amt,
      saved:     parseFloat(newGoal.saved) || 0,
      createdAt: new Date().toISOString(),
    };
    save([...goals, g]);
    setNew({ name:'', emoji:'🎯', target:'', saved:'' });
    setCreating(false);
    setSelected(g.id);
  }

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const lesson     = MINI_LESSONS[lessonIdx];

  return (
    <div style={{ maxWidth:680 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#22D3A6,#4F8EF7)', borderRadius:20, padding:24, color:'#fff', marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>🐷</div>
        <div style={{ fontWeight:900, fontSize:22, marginBottom:4 }}>Smart Savings</div>
        <div style={{ fontSize:13, opacity:.85 }}>Total saved: <strong>£{totalSaved.toFixed(2)}</strong> across {goals.length} goals</div>
        <div style={{ fontSize:11, opacity:.7, marginTop:4 }}>📚 Educational only — not real banking</div>
      </div>

      {/* Goals */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12, marginBottom:18 }}>
        {goals.map(g => {
          const pct  = Math.min(100, Math.round((g.saved / g.target) * 100));
          const done = g.saved >= g.target;
          return (
            <div key={g.id}
              onClick={() => setSelected(s => s === g.id ? null : g.id)}
              style={{
                background:done?'#DCFDF2':'#fff', borderRadius:16,
                border:`2px solid ${selected===g.id?'#4F8EF7':done?'#22D3A6':'#E5E7EB'}`,
                padding:16, cursor:'pointer', transition:'all .2s',
              }}>
              <div style={{ fontSize:32, marginBottom:6 }}>{g.emoji}</div>
              <div style={{ fontWeight:800, fontSize:13, marginBottom:2 }}>{g.name}</div>
              <div style={{ fontSize:12, color:'#6B7280', marginBottom:8 }}>
                £{g.saved.toFixed(2)} / £{g.target.toFixed(2)}
              </div>
              <div style={{ height:6, background:'#E5E7EB', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct}%`, background:done?'#22D3A6':'#4F8EF7', borderRadius:99, transition:'width .6s' }}/>
              </div>
              <div style={{ fontSize:11, color:'#6B7280', marginTop:4, display:'flex', justifyContent:'space-between' }}>
                <span>{pct}%</span>
                {done && <span style={{ color:'#22D3A6', fontWeight:700 }}>✅ Goal reached!</span>}
              </div>
            </div>
          );
        })}

        {/* Add goal card */}
        <div onClick={() => setCreating(true)}
          style={{ background:'#F5F7FF', borderRadius:16, border:'2px dashed #E5E7EB', padding:16, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, minHeight:140, transition:'border-color .2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor='#4F8EF7')}
          onMouseLeave={e => (e.currentTarget.style.borderColor='#E5E7EB')}
        >
          <div style={{ fontSize:28 }}>+</div>
          <div style={{ fontWeight:700, fontSize:13, color:'#6B7280' }}>New Goal</div>
        </div>
      </div>

      {/* Add saving */}
      {selected && (
        <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:18, marginBottom:18 }}>
          <div style={{ fontWeight:800, fontSize:14, marginBottom:12 }}>
            💰 Add a saving to: {goals.find(g=>g.id===selected)?.name}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ position:'relative', flex:1 }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#6B7280', fontWeight:700 }}>£</span>
              <input
                type="number" min="0.01" step="0.01" placeholder="0.00"
                value={addAmount} onChange={e => setAdd(e.target.value)}
                style={{ width:'100%', paddingLeft:28, padding:'11px 14px 11px 28px', border:'1.5px solid #E5E7EB', borderRadius:11, fontSize:16, boxSizing:'border-box' }}
              />
            </div>
            <button onClick={addSaving} disabled={!addAmount}
              style={{ background:'linear-gradient(135deg,#22D3A6,#4F8EF7)', color:'#fff', border:'none', borderRadius:11, padding:'11px 20px', fontWeight:800, fontSize:14, cursor:'pointer' }}>
              Add Saving
            </button>
          </div>
        </div>
      )}

      {/* Create goal form */}
      {creating && (
        <div style={{ background:'#fff', border:'1.5px solid #4F8EF7', borderRadius:16, padding:18, marginBottom:18 }}>
          <div style={{ fontWeight:800, fontSize:14, marginBottom:12 }}>🎯 Create New Goal</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <input placeholder="Goal name (e.g. New Trainers)" value={newGoal.name} onChange={e => setNew(n=>({...n,name:e.target.value}))}
              style={{ padding:'11px 14px', border:'1.5px solid #E5E7EB', borderRadius:11, fontSize:14 }}/>
            <input placeholder="Emoji 🎯" value={newGoal.emoji} onChange={e => setNew(n=>({...n,emoji:e.target.value}))}
              style={{ padding:'11px 14px', border:'1.5px solid #E5E7EB', borderRadius:11, fontSize:14, width:80 }}/>
            <input type="number" placeholder="Target amount £" value={newGoal.target} onChange={e => setNew(n=>({...n,target:e.target.value}))}
              style={{ padding:'11px 14px', border:'1.5px solid #E5E7EB', borderRadius:11, fontSize:14 }}/>
            <input type="number" placeholder="Already saved £ (optional)" value={newGoal.saved} onChange={e => setNew(n=>({...n,saved:e.target.value}))}
              style={{ padding:'11px 14px', border:'1.5px solid #E5E7EB', borderRadius:11, fontSize:14 }}/>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={createGoal} style={{ flex:1, background:'linear-gradient(135deg,#22D3A6,#4F8EF7)', color:'#fff', border:'none', borderRadius:11, padding:'11px', fontWeight:800, fontSize:14, cursor:'pointer' }}>
                ✅ Create Goal
              </button>
              <button onClick={() => setCreating(false)} style={{ background:'#F5F7FF', border:'1.5px solid #E5E7EB', borderRadius:11, padding:'11px 16px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini lesson */}
      <div style={{ background:'linear-gradient(135deg,rgba(255,184,0,.08),rgba(79,142,247,.08))', border:'1.5px solid rgba(255,184,0,.3)', borderRadius:16, padding:20 }}>
        <div style={{ fontWeight:800, fontSize:14, marginBottom:8 }}>💡 {lesson.title}</div>
        <div style={{ fontSize:13, color:'#374151', lineHeight:1.7, marginBottom:14 }}>{lesson.body}</div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setLesson(i => (i-1+MINI_LESSONS.length) % MINI_LESSONS.length)}
            style={{ background:'rgba(255,255,255,.8)', border:'1.5px solid #E5E7EB', borderRadius:99, padding:'6px 14px', fontWeight:700, fontSize:12, cursor:'pointer' }}>← Prev</button>
          <button onClick={() => setLesson(i => (i+1) % MINI_LESSONS.length)}
            style={{ background:'rgba(255,255,255,.8)', border:'1.5px solid #E5E7EB', borderRadius:99, padding:'6px 14px', fontWeight:700, fontSize:12, cursor:'pointer' }}>Next →</button>
          <span style={{ fontSize:11, color:'#6B7280', alignSelf:'center', marginLeft:'auto' }}>{lessonIdx+1}/{MINI_LESSONS.length}</span>
        </div>
      </div>
    </div>
  );
}
