'use client';
import { useAppStore } from '@/lib/store';
import type { ScreenId } from '@/lib/store';

const WORLDS = [
  {id:'home',     icon:'🏠', name:'Home Base',       screen:'home' as ScreenId,      color:'#4F8EF7', xpRequired:0,   progressKey:'none'},
  {id:'ai',       icon:'🧠', name:'AI Island',       screen:'explorer' as ScreenId,  color:'#8B5CF6', xpRequired:0,   progressKey:'lessonsCompleted'},
  {id:'science',  icon:'🌋', name:'Science Volcano', screen:'science' as ScreenId,   color:'#FF6B6B', xpRequired:50,  progressKey:'completedExperiments'},
  {id:'builder',  icon:'🏰', name:'Builder Kingdom', screen:'engineering' as ScreenId,color:'#FFB800', xpRequired:150, progressKey:'completedEng'},
  {id:'space',    icon:'🚀', name:'Space Station',   screen:'space' as ScreenId,     color:'#1A1D3A', xpRequired:300, progressKey:'completedSpace'},
  {id:'savings',  icon:'💰', name:'Savings Cave',    screen:'savings' as ScreenId,   color:'#22D3A6', xpRequired:100, progressKey:'none'},
  {id:'trophies', icon:'🏆', name:'Trophy Temple',   screen:'achievements' as ScreenId,color:'#8B5CF6',xpRequired:200, progressKey:'none'},
];

const CONNECTION_PATHS = [
  [0,1],[1,2],[2,3],[3,4],[2,5],[4,6],
];

export default function MapScreen() {
  const { currentUser, navigate } = useAppStore();
  const xp = currentUser?.xp ?? 0;

  function getProgress(key: string): number {
    if (key === 'none') return 100;
    const val = (currentUser as any)?.[key];
    if (Array.isArray(val)) return Math.min(100, Math.round(val.length / 8 * 100));
    return 0;
  }

  return (
    <div style={{ maxWidth:680 }}>
      <div style={{ background:'linear-gradient(135deg,#1A1D3A,#4F8EF7)', borderRadius:20, padding:22, color:'#fff', marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>🗺️</div>
        <div style={{ fontWeight:900, fontSize:22 }}>Adventure Map</div>
        <div style={{ fontSize:13, opacity:.85 }}>Explore worlds by earning XP! · {xp} XP total</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {WORLDS.map(world => {
          const unlocked  = xp >= world.xpRequired;
          const progress  = getProgress(world.progressKey);
          return (
            <div key={world.id}
              onClick={() => unlocked && navigate(world.screen)}
              style={{
                background: unlocked ? `linear-gradient(135deg,${world.color}22,#fff)` : '#F9FAFB',
                border:`2px solid ${unlocked?world.color:'#E5E7EB'}`,
                borderRadius:18, padding:18, textAlign:'center',
                cursor:unlocked?'pointer':'default',
                opacity:unlocked?1:.45, filter:unlocked?'none':'grayscale(0.7)',
                transition:'all .2s',
              }}
              onMouseEnter={e=>{ if(unlocked)(e.currentTarget.style.transform='translateY(-3px)'); }}
              onMouseLeave={e=>{ (e.currentTarget.style.transform='translateY(0)'); }}
            >
              <div style={{ fontSize:40, marginBottom:8, filter:unlocked?'none':'grayscale(1)' }}>{world.icon}</div>
              <div style={{ fontWeight:800, fontSize:13, marginBottom:4 }}>{world.name}</div>
              {unlocked ? (
                <>
                  <div style={{ height:4, background:'#E5E7EB', borderRadius:99, overflow:'hidden', marginBottom:4 }}>
                    <div style={{ height:'100%', width:`${progress}%`, background:world.color, borderRadius:99 }}/>
                  </div>
                  <div style={{ fontSize:10, color:world.color, fontWeight:700 }}>{progress}% explored</div>
                </>
              ) : (
                <div style={{ fontSize:11, color:'#9CA3AF', fontWeight:700 }}>🔒 {world.xpRequired} XP</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:14, padding:16, marginTop:16 }}>
        <div style={{ fontWeight:800, fontSize:13, marginBottom:8 }}>🧭 Explorer Stats</div>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:13 }}>
          <div>🌍 Worlds unlocked: <strong>{WORLDS.filter(w => xp >= w.xpRequired).length}/{WORLDS.length}</strong></div>
          <div>⭐ Total XP: <strong>{xp}</strong></div>
          <div>🔥 Streak: <strong>{currentUser?.streak ?? 0} days</strong></div>
        </div>
      </div>
    </div>
  );
}
