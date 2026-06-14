'use client';
import { useAppStore } from '@/lib/store';

const BUILDINGS = [
  {id:'home',      icon:'🏠', name:'Home Base',       desc:'Your learning HQ! Everyone starts here.',                   xpRequired:0,    reward:'Free'},
  {id:'school',    icon:'🏫', name:'Learning School', desc:'Complete 3 AI Explorer lessons to build.',                  xpRequired:150,  reward:'Explorer Badge'},
  {id:'lab',       icon:'🔬', name:'Science Lab',     desc:'Complete 4 Science experiments to build.',                  xpRequired:300,  reward:'Scientist Badge'},
  {id:'bridge',    icon:'🌉', name:'Eng. Bridge',     desc:'Complete 3 Engineering challenges to build.',               xpRequired:500,  reward:'Builder Badge'},
  {id:'space',     icon:'🚀', name:'Space Center',    desc:'Complete 4 Space Explorer topics to build.',                xpRequired:700,  reward:'Astronaut Badge'},
  {id:'eco',       icon:'🌿', name:'Eco Park',        desc:'Complete 4 Discovery Missions to build.',                   xpRequired:900,  reward:'Explorer Badge'},
  {id:'ai',        icon:'🤖', name:'AI Factory',      desc:'Complete all 12 AI Explorer lessons to build.',             xpRequired:1200, reward:'AI Master Badge'},
  {id:'energy',    icon:'⚡', name:'Energy Station',  desc:'Reach 2000 XP to power the entire city!',                  xpRequired:2000, reward:'City Legend Badge'},
];

export default function CityScreen() {
  const { currentUser } = useAppStore();
  const xp = currentUser?.xp ?? 0;

  const unlockedCount = BUILDINGS.filter(b => xp >= b.xpRequired).length;
  const nextBuilding  = BUILDINGS.find(b => xp < b.xpRequired);
  const cityPct       = Math.round((unlockedCount / BUILDINGS.length) * 100);

  return (
    <div style={{ maxWidth:720 }}>
      <div style={{ background:'linear-gradient(135deg,#1A1D3A,#4F8EF7,#8B5CF6)', borderRadius:20, padding:24, color:'#fff', marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>🏙️</div>
        <div style={{ fontWeight:900, fontSize:22 }}>STEM City Builder</div>
        <div style={{ fontSize:13, opacity:.85 }}>Complete activities to unlock new buildings! · {unlockedCount}/8 unlocked · {xp} XP</div>
        <div style={{ height:8, background:'rgba(255,255,255,.2)', borderRadius:99, marginTop:12, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${cityPct}%`, background:'#fff', borderRadius:99, transition:'width 1s' }}/>
        </div>
        <div style={{ fontSize:11, opacity:.7, marginTop:5 }}>{cityPct}% city built</div>
      </div>

      {nextBuilding && (
        <div style={{ background:'var(--sun-light)', border:'1.5px solid var(--sun)', borderRadius:14, padding:14, marginBottom:16, fontSize:13 }}>
          🎯 <strong>Next unlock:</strong> {nextBuilding.icon} {nextBuilding.name} at {nextBuilding.xpRequired} XP — you need {nextBuilding.xpRequired - xp} more XP!
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
        {BUILDINGS.map(b => {
          const unlocked = xp >= b.xpRequired;
          return (
            <div key={b.id} style={{
              background: unlocked ? 'linear-gradient(135deg,#F5F7FF,#EDE9FE)' : '#F9FAFB',
              border:`2px solid ${unlocked?'#8B5CF6':'#E5E7EB'}`,
              borderRadius:16, padding:18, textAlign:'center',
              opacity: unlocked ? 1 : .5,
              filter: unlocked ? 'none' : 'grayscale(0.6)',
              transition:'all .3s',
            }}>
              <div style={{ fontSize:40, marginBottom:8, filter:unlocked?'none':'grayscale(1)' }}>{b.icon}</div>
              <div style={{ fontWeight:800, fontSize:12, marginBottom:4 }}>{b.name}</div>
              <div style={{ fontSize:11, color:'#6B7280', lineHeight:1.4, marginBottom:8 }}>{b.desc}</div>
              {unlocked ? (
                <div style={{ fontSize:11, color:'#8B5CF6', fontWeight:700 }}>✅ Built! · {b.reward}</div>
              ) : (
                <div style={{ fontSize:11, color:'#9CA3AF', fontWeight:700 }}>🔒 {b.xpRequired} XP needed</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ background:'var(--card)', border:'1.5px solid var(--border)', borderRadius:14, padding:16, marginTop:16, fontSize:13 }}>
        <div style={{ fontWeight:800, marginBottom:6 }}>🏆 Your City Progress</div>
        <div style={{ color:'var(--text2)', lineHeight:1.7 }}>
          {unlockedCount === 8 ? '🎉 City complete! You\'re a STEM City Legend!' :
           unlockedCount >= 5 ? `Great city! ${8 - unlockedCount} more buildings to unlock.` :
           unlockedCount >= 2 ? `Growing city! Keep completing activities to unlock more buildings.` :
           'Just starting out! Complete activities across all modules to grow your city.'}
        </div>
      </div>
    </div>
  );
}
