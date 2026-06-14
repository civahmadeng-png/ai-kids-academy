'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useProgress } from '@/hooks/useProgress';
import { EXPERIMENTS } from '@/data/experiments';
import BadgeToast from '@/components/ui/BadgeToast';

export default function ScienceScreen() {
  const { showModal } = useAppStore();
  const { isCompleted, completeItem, newBadgesQueue, clearBadgesQueue, isLoaded } = useProgress();
  const [selected, setSelected]     = useState<string|null>(null);
  const [quizState, setQuizState]   = useState<{chosen:number;correct:boolean}|null>(null);
  const [completing, setCompleting] = useState(false);

  const exp = EXPERIMENTS.find(e => e.id === selected);

  async function handleComplete(id: string, name: string, xp: number) {
    if (completing) return;
    setCompleting(true);
    const { isNew, newBadges } = await completeItem('science_experiment', id, name, xp, 20);
    setCompleting(false);
    if (!isNew) {
      showModal('✅','Already Completed!','You already finished this experiment! Try a new one!');
    } else {
      const badgeMsg = newBadges.length > 0 ? ` +${newBadges.length} badge${newBadges.length>1?'s':''}!` : '';
      showModal('🧪','Experiment Complete!',`+${xp} XP earned! You are a real scientist!${badgeMsg} 🔬`);
      setSelected(null);
      setQuizState(null);
    }
  }

  if (selected && exp) {
    const done = isCompleted('science_experiment', exp.id);
    return (
      <>
        <BadgeToast badges={newBadgesQueue} onDone={clearBadgesQueue} />
        <div style={{maxWidth:700}}>
          <button className="aka-back-btn" onClick={() => { setSelected(null); setQuizState(null); }}>← Back to experiments</button>
          <div style={{background:exp.color,borderRadius:20,padding:24,color:'#fff',marginBottom:16}}>
            <div style={{fontSize:48,marginBottom:8}}>{exp.icon}</div>
            <div style={{fontSize:22,fontWeight:900,marginBottom:6}}>{exp.name}</div>
            <div style={{display:'flex',gap:12,fontSize:12,opacity:.9,flexWrap:'wrap'}}>
              <span>{exp.time}</span><span>{exp.diff}</span><span>Age {exp.age}</span>
              <span style={{fontWeight:700}}>+{exp.xp} XP</span>
              {done && <span style={{background:'rgba(255,255,255,.25)',padding:'1px 8px',borderRadius:99}}>✅ Completed</span>}
            </div>
          </div>
          <div className="aka-card">
            <div className="aka-card-type">🧰 Materials</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
              {exp.materials.map((m,i) => <span key={i} className="aka-chip">{m}</span>)}
            </div>
          </div>
          <div className="aka-safety-box">⚠️ {exp.safety} · Supervision: {exp.parent}</div>
          <div className="aka-card">
            <div className="aka-card-type">📋 Steps</div>
            {exp.steps.map((s,i) => (
              <div key={i} className="aka-step">
                <div className="aka-step-num">{i+1}</div><div style={{fontSize:14,lineHeight:1.6}}>{s}</div>
              </div>
            ))}
          </div>
          <div className="aka-card">
            <div className="aka-card-type">👀 What Happens & Why</div>
            <p style={{fontSize:14,lineHeight:1.7,marginBottom:10}}>{exp.what}</p>
            <div className="aka-why-box"><strong>🧠 The Science:</strong> {exp.why}</div>
          </div>
          <div className="aka-card">
            <div className="aka-card-type">🎯 Science Quiz</div>
            <div style={{fontSize:16,fontWeight:800,marginBottom:14}}>{exp.quiz.q}</div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {exp.quiz.opts.map((opt,i) => {
                let cls = 'aka-quiz-opt';
                if (quizState) {
                  if (i === exp.quiz.correct) cls += ' correct';
                  else if (i === quizState.chosen && !quizState.correct) cls += ' wrong';
                }
                return (
                  <button key={i} className={cls} disabled={!!quizState}
                    onClick={() => setQuizState({ chosen:i, correct: i===exp.quiz.correct })}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {quizState && (
              <div>
                <div className={`aka-quiz-feedback ${quizState.correct?'correct':'wrong'}`}>
                  {quizState.correct ? '✅' : '❌'} {exp.quiz.exp}
                </div>
                <button
                  className="aka-primary-btn"
                  onClick={() => handleComplete(exp.id, exp.name, exp.xp)}
                  disabled={done || completing}
                  style={{marginTop:8}}
                >
                  {completing ? <span className="aka-spinner"/> : done ? '✅ Already completed!' : `🎉 Mark Complete & Earn ${exp.xp} XP!`}
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <BadgeToast badges={newBadgesQueue} onDone={clearBadgesQueue} />
      <div className="aka-module-hero" style={{background:'linear-gradient(135deg,#22D3A6,#4F8EF7,#8B5CF6)'}}>
        <div className="aka-hero-eyebrow">Science Lab</div>
        <div className="aka-hero-heading">🧪 Real Home Experiments!</div>
        <div style={{fontSize:13,opacity:.9}}>Safe, fun experiments you can do at home 🏠</div>
      </div>
      <div className="aka-section-header">
        <h2>Choose an Experiment</h2>
        <span style={{fontSize:12,color:'var(--text2)'}}>
          {!isLoaded ? '…loading' : `${EXPERIMENTS.filter(e=>isCompleted('science_experiment',e.id)).length}/8 done`}
        </span>
      </div>
      <div className="aka-grid-4">
        {EXPERIMENTS.map(e => {
          const done = isCompleted('science_experiment', e.id);
          return (
            <div key={e.id} className={`aka-exp-card${done?' completed':''}`} onClick={() => { setSelected(e.id); setQuizState(null); }}>
              {done && <span className="aka-done-badge">✓ Done</span>}
              <span className="aka-xp-badge">+{e.xp} XP</span>
              <div style={{fontSize:36,marginBottom:8}}>{e.icon}</div>
              <div style={{fontWeight:800,fontSize:14,marginBottom:4}}>{e.name}</div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:7}}>
                <span className="aka-tag">{e.diff}</span>
                <span className="aka-tag">{e.time}</span>
                <span className="aka-tag">Age {e.age}</span>
              </div>
              <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.4}}>{e.desc}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
