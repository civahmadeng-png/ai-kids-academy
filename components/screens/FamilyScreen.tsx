'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';

const MISSIONS = [
  {id:'build_together',   icon:'🏗️', name:'Build Together',        xp:80, coins:20, desc:'Build the tallest freestanding tower you can using only 20 sheets of paper and tape. Everyone must contribute!',       time:'30 min'},
  {id:'science_together', icon:'🧪', name:'Science Experiment',    xp:90, coins:25, desc:'Do the Baking Soda Volcano experiment from Science Lab as a family. Parent reads steps, child does the experiment!',    time:'20 min'},
  {id:'read_together',    icon:'📚', name:'Read Together',         xp:60, coins:15, desc:'Each family member reads one page of a book out loud. Discuss what happens next before turning the page!',               time:'20 min'},
  {id:'savings_challenge',icon:'🐷', name:'Savings Challenge',     xp:70, coins:20, desc:'As a family, look at one weekly purchase you could reduce. Calculate how much you\'d save in a year if you did.',       time:'20 min'},
  {id:'nature_walk',      icon:'🌿', name:'Nature Walk',           xp:75, coins:20, desc:'Go for a 20-minute walk and spot as many plants, birds, or insects as possible. Who can find the most unusual one?',    time:'30 min'},
  {id:'engineering_challenge',icon:'⚙️', name:'Weekend Engineering',xp:100,coins:30, desc:'Build a Rubber Band Car (DIY Creator module) together. Parent helps with craft knife; child designs and assembles!',   time:'60 min'},
];

export default function FamilyScreen() {
  const { currentUser, addXP, addCoins, updateUser } = useAppStore();
  const [completing, setCompleting] = useState<string|null>(null);
  const [done, setDone] = useState<Set<string>>(new Set(currentUser?.completedFamilyMissions ?? []));

  async function complete(id: string, xp: number, coins: number) {
    if (done.has(id)) return;
    setCompleting(id);
    await new Promise(r => setTimeout(r, 400));
    const newDone = new Set([...done, id]);
    setDone(newDone);
    addXP(xp); addCoins(coins);
    updateUser({
      completedFamilyMissions: [...newDone],
      familyXP: (currentUser?.familyXP ?? 0) + xp,
    });
    setCompleting(null);
  }

  const totalXP = MISSIONS.filter(m => done.has(m.id)).reduce((s,m) => s + m.xp, 0);

  return (
    <div style={{ maxWidth:680 }}>
      <div style={{ background:'linear-gradient(135deg,#22D3A6,#4F8EF7)', borderRadius:20, padding:24, color:'#fff', marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>👨‍👩‍👧</div>
        <div style={{ fontWeight:900, fontSize:22, marginBottom:4 }}>Family Missions</div>
        <div style={{ fontSize:13, opacity:.85 }}>Activities to do together as a family — learning is more fun with two! 💪</div>
        <div style={{ marginTop:12, background:'rgba(255,255,255,.15)', borderRadius:12, padding:'8px 14px', display:'inline-block', fontSize:13, fontWeight:700 }}>
          🏆 Family XP: {totalXP} · {done.size}/{MISSIONS.length} missions done
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {MISSIONS.map(m => {
          const isDone = done.has(m.id);
          const isLoading = completing === m.id;
          return (
            <div key={m.id} style={{ background:isDone?'#DCFDF2':'#fff', border:`2px solid ${isDone?'#22D3A6':'#E5E7EB'}`, borderRadius:16, padding:20, transition:'all .2s' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                <div style={{ fontSize:36, flexShrink:0 }}>{m.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:15, marginBottom:4 }}>{m.name} <span style={{ fontSize:11, color:'#6B7280', fontWeight:400 }}>· {m.time}</span></div>
                  <div style={{ fontSize:13, color:'#374151', lineHeight:1.6, marginBottom:12 }}>{m.desc}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ background:'var(--sky-light)', color:'var(--sky)', padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>+{m.xp} XP</span>
                    <span style={{ background:'var(--sun-light)', color:'#92400E', padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>+{m.coins} 🪙</span>
                    {!isDone && (
                      <button onClick={() => complete(m.id, m.xp, m.coins)} disabled={!!completing}
                        style={{ marginLeft:'auto', background:'linear-gradient(135deg,#22D3A6,#4F8EF7)', color:'#fff', border:'none', borderRadius:10, padding:'8px 16px', fontWeight:800, fontSize:12, cursor:'pointer' }}>
                        {isLoading ? '⏳' : '✅ Mark Complete'}
                      </button>
                    )}
                    {isDone && <span style={{ marginLeft:'auto', color:'#22D3A6', fontWeight:800, fontSize:12 }}>✅ Completed!</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background:'var(--sky-light)', borderRadius:14, padding:16, marginTop:16, fontSize:13, color:'#374151' }}>
        💡 <strong>Research shows:</strong> Children whose parents engage in learning activities with them show 40% better retention. Even 20 minutes together makes a real difference!
      </div>
    </div>
  );
}
