'use client';
import { useState } from 'react';
import { useProgress } from '@/hooks/useProgress';

const MISSIONS = [
  {id:'leaves',      icon:'🍃', name:'Leaf Hunt',           xp:50, obj:'Find and collect 3 different leaves.',     task:'Find 3 different shaped leaves outside. Compare their edges, size, and colour.',    q:'What differences did you notice between the leaves?'},
  {id:'moon',        icon:'🌙', name:'Moon Observation',    xp:60, obj:'Observe the moon for 3 nights.',           task:'Each night for 3 nights, draw the shape of the moon and note the time.',             q:'How did the moon\'s shape change? Can you explain why?'},
  {id:'engineering', icon:'⚙️', name:'Engineering Spotting', xp:55, obj:'Find 3 engineering examples near you.',   task:'Look for bridges, ramps, levers, wheels, or gears in your neighbourhood.',          q:'Which example surprised you most? How does it work?'},
  {id:'clouds',      icon:'☁️', name:'Cloud Watching',      xp:45, obj:'Identify 3 types of clouds.',              task:'Lie on your back and watch clouds for 10 minutes. Draw what you see.',               q:'Did any clouds look like objects or animals? What type were they?'},
  {id:'recycling',   icon:'♻️', name:'Recycling Hunt',      xp:50, obj:'Audit your home\'s recycling.',           task:'Check 10 items in your home. Which can be recycled? Are they sorted correctly?',   q:'What was most surprising about what can/can\'t be recycled?'},
  {id:'shadows',     icon:'🌤️', name:'Shadow Science',      xp:55, obj:'Observe how shadows change.',             task:'Mark your shadow\'s outline at 9am, 12pm, and 3pm using chalk outside.',             q:'Why do shadows change length and direction throughout the day?'},
  {id:'birds',       icon:'🐦', name:'Bird Spotting',       xp:60, obj:'Spot and identify 3 different birds.',    task:'Find a quiet spot outdoors. Note colours, size, and sounds of birds you see.',       q:'How do different birds move and behave differently?'},
  {id:'weather',     icon:'🌦️', name:'Weather Journal',    xp:65, obj:'Record weather for 5 days.',              task:'Each day for 5 days: temperature, cloud cover, wind, precipitation. Notice patterns!',q:'What patterns did you find? Can you predict tomorrow\'s weather?'},
];

export default function DiscoveryScreen() {
  const { isCompleted, completeItem } = useProgress();
  const [selected, setSelected] = useState<typeof MISSIONS[0] | null>(null);
  const [reflection, setReflection] = useState('');
  const [completing, setCompleting] = useState(false);

  const completedCount = MISSIONS.filter(m => isCompleted('discovery_mission', m.id)).length;

  async function handleComplete(mission: typeof MISSIONS[0]) {
    if (completing || !reflection.trim()) return;
    setCompleting(true);
    await completeItem('discovery_mission', mission.id, mission.name, mission.xp, 15);
    setCompleting(false);
    setSelected(null); setReflection('');
  }

  if (selected) {
    const done = isCompleted('discovery_mission', selected.id);
    return (
      <div style={{ maxWidth:640 }}>
        <button onClick={() => { setSelected(null); setReflection(''); }} style={{ background:'none', border:'none', color:'var(--sky)', fontWeight:700, cursor:'pointer', marginBottom:14 }}>← Back</button>
        <div style={{ background:'linear-gradient(135deg,#22D3A6,#4F8EF7)', borderRadius:20, padding:24, color:'#fff', marginBottom:16 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>{selected.icon}</div>
          <div style={{ fontWeight:900, fontSize:20 }}>{selected.name}</div>
          <div style={{ fontSize:13, opacity:.85 }}>🎯 {selected.obj}</div>
        </div>
        <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:20, marginBottom:12 }}>
          <div style={{ fontWeight:800, fontSize:13, color:'var(--text2)', marginBottom:10, textTransform:'uppercase' }}>📋 Your Mission</div>
          <p style={{ fontSize:14, lineHeight:1.7 }}>{selected.task}</p>
        </div>
        {!done && (
          <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:20, marginBottom:12 }}>
            <div style={{ fontWeight:800, fontSize:13, marginBottom:8 }}>💭 Reflection: {selected.q}</div>
            <textarea value={reflection} onChange={e=>setReflection(e.target.value)} placeholder="Write your thoughts here... (minimum 10 characters)"
              rows={4} style={{ width:'100%', padding:'12px 14px', border:'1.5px solid #E5E7EB', borderRadius:12, fontSize:14, resize:'vertical', boxSizing:'border-box', fontFamily:'inherit' }}/>
          </div>
        )}
        <button onClick={() => handleComplete(selected)} disabled={done || completing || reflection.trim().length < 10}
          style={{ width:'100%', background:done?'#E5E7EB':'linear-gradient(135deg,#22D3A6,#4F8EF7)', color:done?'#6B7280':'#fff', border:'none', borderRadius:14, padding:14, fontWeight:800, fontSize:14, cursor:(done||reflection.trim().length<10)?'default':'pointer' }}>
          {completing ? '...' : done ? '✅ Mission Complete!' : `✅ Complete & Earn ${selected.xp} XP`}
        </button>
        {!done && reflection.trim().length < 10 && <div style={{ fontSize:11, color:'var(--text2)', textAlign:'center', marginTop:6 }}>Write your reflection first (min 10 chars)</div>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth:720 }}>
      <div style={{ background:'linear-gradient(135deg,#22D3A6,#4F8EF7)', borderRadius:20, padding:22, color:'#fff', marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>🌍</div>
        <div style={{ fontWeight:900, fontSize:22 }}>Discovery Missions</div>
        <div style={{ fontSize:13, opacity:.85 }}>Real-world missions to explore your environment! · {completedCount}/8 done</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(165px,1fr))', gap:12 }}>
        {MISSIONS.map(m => {
          const done = isCompleted('discovery_mission', m.id);
          return (
            <div key={m.id} onClick={() => setSelected(m)}
              style={{ background:done?'#DCFDF2':'#fff', border:`2px solid ${done?'#22D3A6':'#E5E7EB'}`, borderRadius:16, padding:16, cursor:'pointer', transition:'all .2s' }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor='#22D3A6')}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=done?'#22D3A6':'#E5E7EB')}>
              <div style={{ fontSize:32, marginBottom:6 }}>{m.icon}</div>
              <div style={{ fontWeight:800, fontSize:12, marginBottom:4 }}>{m.name}</div>
              <div style={{ fontSize:11, color:'#6B7280', marginBottom:4, lineHeight:1.4 }}>{m.obj}</div>
              <div style={{ fontSize:11, color:done?'#065F46':'var(--sky)', fontWeight:700 }}>{done?'✅ Done':'+'+m.xp+' XP'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
