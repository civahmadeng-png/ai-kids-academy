'use client';
import { useAppStore } from '@/lib/store';
import type { ScreenId } from '@/lib/store';

const PATHS = [
  {id:'scientist',  icon:'🔬', name:'Young Scientist',        color:'#22D3A6',
   levels:[
     {name:'Science Starter',    unlockXP:0,   modules:['science','discovery'] as ScreenId[], desc:'Complete your first experiments'},
     {name:'Lab Explorer',       unlockXP:200, modules:['space'] as ScreenId[],               desc:'Explore beyond Earth'},
     {name:'Field Researcher',   unlockXP:500, modules:['discovery'] as ScreenId[],            desc:'Real-world discovery missions'},
     {name:'Master Scientist',   unlockXP:900, modules:['engineering'] as ScreenId[],           desc:'Apply science to engineering'},
   ]},
  {id:'engineer',   icon:'⚙️', name:'Future Engineer',        color:'#FFB800',
   levels:[
     {name:'Tinkerer',           unlockXP:0,   modules:['engineering'] as ScreenId[], desc:'First engineering challenges'},
     {name:'Builder',            unlockXP:300, modules:['diy'] as ScreenId[],         desc:'DIY projects and builds'},
     {name:'Designer',           unlockXP:600, modules:['city'] as ScreenId[],        desc:'Build your STEM city'},
     {name:'Master Engineer',    unlockXP:1000,modules:['explorer'] as ScreenId[],    desc:'Understand the AI tools of tomorrow'},
   ]},
  {id:'ai_creator', icon:'🤖', name:'AI Creator',             color:'#4F8EF7',
   levels:[
     {name:'AI Curious',         unlockXP:0,   modules:['explorer'] as ScreenId[], desc:'Learn how AI works'},
     {name:'Prompt Master',      unlockXP:150, modules:['prompt'] as ScreenId[],   desc:'Master the art of prompting'},
     {name:'AI Artist',          unlockXP:400, modules:['art'] as ScreenId[],      desc:'Create AI images'},
     {name:'AI Legend',          unlockXP:800, modules:['mentor'] as ScreenId[],   desc:'Build with the AI Mentor'},
   ]},
  {id:'money',      icon:'💰', name:'Money Smart Kid',        color:'#FF6B6B',
   levels:[
     {name:'Money Aware',        unlockXP:0,   modules:['savings'] as ScreenId[],  desc:'Learn money basics'},
     {name:'Saver',              unlockXP:100, modules:['habits'] as ScreenId[],   desc:'Build savings habits'},
     {name:'Goal Getter',        unlockXP:300, modules:['career'] as ScreenId[],   desc:'Explore earning potential'},
     {name:'Finance Wizard',     unlockXP:600, modules:['parent'] as ScreenId[],   desc:'Review your financial progress'},
   ]},
  {id:'storyteller',icon:'📚', name:'Creative Storyteller',  color:'#8B5CF6',
   levels:[
     {name:'Story Beginner',     unlockXP:0,   modules:['story'] as ScreenId[],    desc:'Write your first story'},
     {name:'World Builder',      unlockXP:200, modules:['story'] as ScreenId[],    desc:'Explore all 5 story worlds'},
     {name:'AI Author',          unlockXP:500, modules:['mentor'] as ScreenId[],   desc:'Use AI to enhance stories'},
     {name:'Master Author',      unlockXP:900, modules:['camera'] as ScreenId[],   desc:'Publish to My Creations'},
   ]},
];

export default function JourneysScreen() {
  const { currentUser, navigate } = useAppStore();
  const xp = currentUser?.xp ?? 0;

  return (
    <div style={{ maxWidth:720 }}>
      <div style={{ background:'linear-gradient(135deg,#8B5CF6,#4F8EF7)', borderRadius:20, padding:22, color:'#fff', marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>🗺️</div>
        <div style={{ fontWeight:900, fontSize:22 }}>Learning Journeys</div>
        <div style={{ fontSize:13, opacity:.85 }}>Follow structured paths to mastery in subjects you love!</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {PATHS.map(path => {
          const currentLevel = path.levels.reduce((acc, l, i) => xp >= l.unlockXP ? i : acc, 0);
          const nextLevel    = path.levels[currentLevel + 1];
          return (
            <div key={path.id} style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:18, overflow:'hidden' }}>
              <div style={{ background:`linear-gradient(135deg,${path.color}22,#fff)`, padding:18, borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ fontSize:36 }}>{path.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:900, fontSize:16 }}>{path.name}</div>
                  <div style={{ fontSize:12, color:'#6B7280' }}>Level {currentLevel+1}/4 · {nextLevel ? `${nextLevel.unlockXP - xp} XP to next level` : '🏆 Mastered!'}</div>
                </div>
              </div>
              <div style={{ padding:16 }}>
                <div style={{ display:'flex', gap:8 }}>
                  {path.levels.map((level, i) => {
                    const unlocked = xp >= level.unlockXP;
                    const current  = i === currentLevel;
                    return (
                      <div key={i} style={{
                        flex:1, background:unlocked?`${path.color}18`:'#F9FAFB',
                        border:`2px solid ${current?path.color:unlocked?path.color+'66':'#E5E7EB'}`,
                        borderRadius:12, padding:'10px 8px', textAlign:'center', opacity:unlocked?1:.4,
                      }}>
                        <div style={{ fontSize:11, fontWeight:800, color:unlocked?path.color:'#9CA3AF', marginBottom:4 }}>{level.name}</div>
                        <div style={{ fontSize:10, color:'#6B7280', lineHeight:1.3, marginBottom:6 }}>{level.desc}</div>
                        {unlocked ? (
                          <div style={{ display:'flex', gap:4, justifyContent:'center', flexWrap:'wrap' }}>
                            {level.modules.map(m => (
                              <button key={m} onClick={() => navigate(m)} style={{ background:path.color, color:'#fff', border:'none', borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:700, cursor:'pointer' }}>Go</button>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize:10, color:'#9CA3AF' }}>🔒 {level.unlockXP} XP</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
