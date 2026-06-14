'use client';
import { useState } from 'react';
import { useAppStore }       from '@/lib/store';
import { useProgress }       from '@/hooks/useProgress';
import { useSubscription }   from '@/hooks/useSubscription';
import { GateBanner }        from '@/components/ui/FeatureGate';
import BadgeToast            from '@/components/ui/BadgeToast';

const ENG_CHALLENGES = [
  {id:'tower',    icon:'🏗️', name:'Tallest Paper Tower',   goal:'Build tallest freestanding tower using 10 sheets of paper.',principle:'Structural Engineering — triangles and cylinders are strongest.',skills:['Engineering','Problem Solving','Iteration'],xp:80},
  {id:'bridge',   icon:'🌉', name:'Strongest Paper Bridge',goal:'Build a bridge spanning 30cm holding the most weight.',principle:'Structural Engineering — compression and arch design.',skills:['Engineering','Physics','Testing'],xp:90},
  {id:'eggdrop',  icon:'🥚', name:'Egg Drop Design',       goal:'Design a container protecting an egg from a 1-meter drop.',principle:'Impact Engineering — energy absorption and distribution.',skills:['Engineering','Physics','Design'],xp:75},
  {id:'carwind',  icon:'🚀', name:'Balloon-Powered Car',   goal:"Build a car powered only by balloon air (50cm min).",principle:"Newton's Third Law — action/reaction.",skills:['Mechanics','Physics',"Newton's Laws"],xp:80},
  {id:'marshmallow',icon:'🍡',name:'Marshmallow Tower',    goal:'Build tallest freestanding structure with 20 spaghetti and 1 marshmallow.',principle:'Design Thinking — the world-famous Marshmallow Challenge!',skills:['Design Thinking','Teamwork','Iteration'],xp:85},
  {id:'catapult', icon:'🎯', name:'Catapult Builder',      goal:'Build catapult launching a paper ball at least 1 meter.',principle:'Potential → Kinetic energy conversion via a lever.',skills:['Mechanics','Physics','Measurement'],xp:80},
  {id:'waterchall',icon:'💧',name:'Water Transport',       goal:'Move water 1 meter without touching the cups.',principle:'Capillary action — water molecules cling to surfaces.',skills:['Science','Critical Thinking'],xp:75},
  {id:'turbine',  icon:'💨', name:'Wind Turbine Concept',  goal:'Design a wind turbine on paper and test blade angles.',principle:'Wind energy → rotational energy → electricity.',skills:['Renewable Energy','Design'],xp:70},
];

export default function EngineeringScreen() {
  const { showModal }   = useAppStore();
  const { isCompleted, completeItem, newBadgesQueue, clearBadgesQueue } = useProgress();
  const { canAccess, requirePlan } = useSubscription();
  const [selected, setSelected] = useState<string|null>(null);
  const [completing, setCompleting] = useState(false);

  const completedCount = ENG_CHALLENGES.filter(e => isCompleted('engineering_challenge', e.id)).length;
  const eng = ENG_CHALLENGES.find(e => e.id === selected);

  async function handleComplete(id: string, name: string, xp: number) {
    if (completing) return;
    setCompleting(true);
    const { isNew } = await completeItem('engineering_challenge', id, name, xp, 20);
    setCompleting(false);
    if (!isNew) showModal('✅','Already Done!','Already completed! Try the next challenge!');
    else { showModal('⚙️','Engineering Complete!',`+${xp} XP! You think like a real engineer! 🏗️`); setSelected(null); }
  }

  if (selected && eng) {
    return (
      <>
        <BadgeToast badges={newBadgesQueue} onDone={clearBadgesQueue}/>
        <div style={{maxWidth:700}}>
          <button className="aka-back-btn" onClick={() => setSelected(null)}>← Back</button>
          <div style={{background:'linear-gradient(135deg,#FFB800,#FF6B6B)',borderRadius:20,padding:24,color:'#fff',marginBottom:16}}>
            <div style={{fontSize:48,marginBottom:8}}>{eng.icon}</div>
            <div style={{fontSize:22,fontWeight:900,marginBottom:5}}>{eng.name}</div>
            <div style={{fontSize:13,opacity:.9}}>{eng.goal}</div>
          </div>
          <div className="aka-card"><div className="aka-card-type">⚙️ Engineering Principle</div>
            <div style={{background:'var(--violet-light)',borderRadius:10,padding:'10px 14px',fontSize:13,color:'var(--violet)',fontWeight:600,marginTop:8}}>{eng.principle}</div>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
            {eng.skills.map(s=><span key={s} className="aka-tag">{s}</span>)}
          </div>
          <button className="aka-primary-btn" onClick={() => handleComplete(eng.id, eng.name, eng.xp)}
            disabled={isCompleted('engineering_challenge', eng.id) || completing}>
            {completing ? <span className="aka-spinner"/> : isCompleted('engineering_challenge', eng.id) ? '✅ Completed!' : `🏗️ Mark Complete & Earn ${eng.xp} XP!`}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <BadgeToast badges={newBadgesQueue} onDone={clearBadgesQueue}/>
      <div className="aka-module-hero" style={{background:'linear-gradient(135deg,#FFB800,#FF6B6B)'}}>
        <div className="aka-hero-eyebrow">Engineering Lab</div>
        <div className="aka-hero-heading">⚙️ STEM Challenges!</div>
        <div style={{fontSize:13,opacity:.9}}>Think like an engineer and build amazing things!</div>
      </div>

      {/* Gate banner for free users */}
      {!canAccess('engineering_lab') && (
        <GateBanner feature="engineering_lab"/>
      )}

      <div className="aka-section-header">
        <h2>Engineering Challenges</h2>
        <span style={{fontSize:12,color:'var(--text2)'}}>{completedCount}/8 done</span>
      </div>
      <div className="aka-grid-4">
        {ENG_CHALLENGES.map(e => {
          const done = isCompleted('engineering_challenge', e.id);
          const locked = !canAccess('engineering_lab');
          return (
            <div key={e.id}
              className={`aka-exp-card${done?' completed':''}`}
              onClick={() => locked ? requirePlan('engineering_lab', () => setSelected(e.id)) : setSelected(e.id)}
              style={{opacity: locked ? .7 : 1}}
            >
              {done && <span className="aka-done-badge">✓ Done</span>}
              {locked && !done && <span className="aka-xp-badge" style={{background:'var(--violet-light)',color:'var(--violet)'}}>🔒 Premium</span>}
              {!locked && <span className="aka-xp-badge">+{e.xp} XP</span>}
              <div style={{fontSize:36,marginBottom:8}}>{e.icon}</div>
              <div style={{fontWeight:800,fontSize:14,marginBottom:4}}>{e.name}</div>
              <div style={{background:'var(--violet-light)',borderRadius:8,padding:'4px 8px',fontSize:11,color:'var(--violet)',fontWeight:600,marginBottom:6}}>{e.principle.split('—')[0].trim()}</div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {e.skills.map(s=><span key={s} className="aka-tag">{s}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
