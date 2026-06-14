'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { trackEvent }  from '@/lib/analytics';

const WEEKS = [
  {id:'ai_week',      theme:'🤖 AI Week',         color:'#4F8EF7',
   missions:[
     {id:'w1_1',task:'Ask Sparky 3 different questions',                 xp:20},
     {id:'w1_2',task:'Complete 2 AI Explorer lessons',                   xp:30},
     {id:'w1_3',task:'Create an image using Art Studio',                 xp:25},
     {id:'w1_4',task:'Write a prompt using all 4 ingredients',           xp:35},
     {id:'w1_5',task:'Teach someone else one AI fact you learned',       xp:40},
   ]},
  {id:'science_week', theme:'🧪 Science Week',    color:'#22D3A6',
   missions:[
     {id:'w2_1',task:'Complete a Science Lab experiment',                xp:30},
     {id:'w2_2',task:'Do a Discovery Mission outside',                   xp:25},
     {id:'w2_3',task:'Explore 2 Space Explorer topics',                  xp:30},
     {id:'w2_4',task:'Find 5 examples of science in your home',          xp:20},
     {id:'w2_5',task:'Ask a science question and research the answer',   xp:35},
   ]},
  {id:'builder_week', theme:'⚙️ Builder Week',    color:'#FFB800',
   missions:[
     {id:'w3_1',task:'Complete an Engineering Lab challenge',             xp:35},
     {id:'w3_2',task:'Build a DIY project',                              xp:40},
     {id:'w3_3',task:'Add a building to your STEM City',                 xp:20},
     {id:'w3_4',task:'Design something on paper (anything!)',             xp:25},
     {id:'w3_5',task:'Improve an existing build or fix something broken', xp:30},
   ]},
  {id:'creative_week',theme:'🎨 Creativity Week', color:'#8B5CF6',
   missions:[
     {id:'w4_1',task:'Create an AI story',                               xp:30},
     {id:'w4_2',task:'Make an AI artwork',                               xp:25},
     {id:'w4_3',task:'Write a short story (100+ words) by hand',         xp:35},
     {id:'w4_4',task:'Draw or paint something from imagination',          xp:25},
     {id:'w4_5',task:'Invent a new game with rules and test it',          xp:40},
   ]},
  {id:'savings_week', theme:'💰 Savings Week',    color:'#FF6B6B',
   missions:[
     {id:'w5_1',task:'Read all 4 Smart Savings mini-lessons',             xp:20},
     {id:'w5_2',task:'Create a savings goal',                             xp:25},
     {id:'w5_3',task:'Find 5 "wants" vs "needs" in your home',            xp:25},
     {id:'w5_4',task:'Explore 3 Career paths',                            xp:30},
     {id:'w5_5',task:'Talk to a family member about money',               xp:35},
   ]},
  {id:'habit_week',   theme:'💪 Habit Week',      color:'#22D3A6',
   missions:[
     {id:'w6_1',task:'Complete all 8 daily habits for 3 days in a row',  xp:50},
     {id:'w6_2',task:'Complete Habit Hero for 5 days this week',         xp:40},
     {id:'w6_3',task:'Go to sleep on time 4 nights in a row',            xp:35},
     {id:'w6_4',task:'Exercise for 20 minutes',                          xp:25},
     {id:'w6_5',task:'Do a Family Mission together',                      xp:40},
   ]},
];

export default function WeeklyScreen() {
  const { addXP, addCoins } = useAppStore();
  const weekIdx = Math.floor(Date.now() / (7 * 24 * 3600 * 1000)) % WEEKS.length;
  const week    = WEEKS[weekIdx];
  const storeKey = `weekly_${week.id}`;

  const [done, setDone] = useState<Set<string>>(new Set());
  useEffect(() => {
    try { setDone(new Set(JSON.parse(localStorage.getItem(storeKey) ?? '[]'))); } catch { /* */ }
  }, [storeKey]);

  function complete(missionId: string, xp: number) {
    if (done.has(missionId)) return;
    const next = new Set([...done, missionId]);
    setDone(next);
    addXP(xp); addCoins(Math.floor(xp/4));
    try { localStorage.setItem(storeKey, JSON.stringify([...next])); } catch { /* */ }
    // Analytics
    void trackEvent('discovery_completed', { module:'weekly_challenge', content_id: missionId, xp });
    // Week-complete bonus: 50 XP once per week
    if (next.size === week.missions.length) {
      const bonusKey = `${storeKey}_bonus`;
      if (!localStorage.getItem(bonusKey)) {
        addXP(50); addCoins(20);
        try { localStorage.setItem(bonusKey, '1'); } catch { /* */ }
      }
    }
  }

  const totalXP   = week.missions.reduce((s,m) => done.has(m.id)?s+m.xp:s, 0);
  const maxXP     = week.missions.reduce((s,m) => s+m.xp, 0);
  const pct       = Math.round((totalXP/maxXP)*100);
  const allDone   = done.size === week.missions.length;

  return (
    <div style={{ maxWidth:640 }}>
      <div style={{ background:`linear-gradient(135deg,${week.color},#1A1D3A)`, borderRadius:20, padding:24, color:'#fff', marginBottom:20 }}>
        <div style={{ fontWeight:900, fontSize:24, marginBottom:4 }}>{week.theme}</div>
        <div style={{ fontSize:13, opacity:.85, marginBottom:12 }}>This week&apos;s challenge missions · {done.size}/{week.missions.length} complete</div>
        <div style={{ background:'rgba(255,255,255,.15)', borderRadius:99, height:8, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:'#fff', borderRadius:99, transition:'width .6s' }}/>
        </div>
        <div style={{ fontSize:12, opacity:.7, marginTop:5 }}>{totalXP}/{maxXP} XP earned this week</div>
      </div>

      {allDone && (
        <div style={{ background:'linear-gradient(135deg,#FFB800,#FF6B6B)', borderRadius:16, padding:20, marginBottom:16, textAlign:'center', color:'#fff' }}>
          <div style={{ fontSize:40, marginBottom:6 }}>🏆</div>
          <div style={{ fontWeight:900, fontSize:18 }}>WEEK COMPLETE!</div>
          <div style={{ fontSize:13, opacity:.9 }}>Amazing job — you completed every mission this week! 🌟</div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {week.missions.map((m, i) => {
          const isDone = done.has(m.id);
          return (
            <div key={m.id} style={{ background:isDone?'#DCFDF2':'#fff', border:`2px solid ${isDone?'#22D3A6':'#E5E7EB'}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, transition:'all .2s' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:isDone?'#22D3A6':`${week.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:isDone?'#fff':week.color, flexShrink:0 }}>
                {isDone?'✓':i+1}
              </div>
              <div style={{ flex:1, fontSize:14, fontWeight:600, color:isDone?'#065F46':'#1A1D3A' }}>{m.task}</div>
              <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
                <span style={{ fontSize:11, fontWeight:700, color:isDone?'#22D3A6':'var(--sky)' }}>{isDone?'✓ Done':'+'+m.xp+' XP'}</span>
                {!isDone && (
                  <button onClick={() => complete(m.id, m.xp)} style={{ background:`linear-gradient(135deg,${week.color},#8B5CF6)`, color:'#fff', border:'none', borderRadius:8, padding:'6px 12px', fontWeight:700, fontSize:11, cursor:'pointer' }}>Done!</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background:'#F5F7FF', borderRadius:14, padding:14, marginTop:16, fontSize:12, color:'#6B7280' }}>
        🗓️ New weekly theme every Monday. All progress resets at the start of each week!
      </div>
    </div>
  );
}
