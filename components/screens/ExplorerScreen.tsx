'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useProgress } from '@/hooks/useProgress';
import { LESSONS, LESSON_CONTENT } from '@/data/lessons';
import BadgeToast from '@/components/ui/BadgeToast';

export default function ExplorerScreen() {
  const { showModal } = useAppStore();
  const { isCompleted, completeItem, newBadgesQueue, clearBadgesQueue } = useProgress();
  const [active, setActive]   = useState<number|null>(null);
  const [quizDone, setQuizDone] = useState<boolean|null>(null);

  async function handleComplete(lesson: typeof LESSONS[0]) {
    const { isNew, newBadges } = await completeItem('ai_lesson', String(lesson.id), lesson.title, lesson.xp, 10);
    if (!isNew) {
      showModal('✅','Already Done!','You already completed this lesson! Move to the next one!');
    } else {
      const msg = newBadges.length > 0 ? ` +${newBadges.length} badge${newBadges.length>1?'s':''}!` : '';
      showModal('🧠','Lesson Complete!',`+${lesson.xp} XP! You are becoming an AI expert!${msg} 🤖`);
      setActive(null); setQuizDone(null);
    }
  }

  const completedCount = LESSONS.filter(l => isCompleted('ai_lesson', String(l.id))).length;
  const lesson = LESSONS.find(l => l.id === active);
  const content = active ? LESSON_CONTENT[active] : null;

  if (active && lesson && content) {
    const done = isCompleted('ai_lesson', String(lesson.id));
    return (
      <>
        <BadgeToast badges={newBadgesQueue} onDone={clearBadgesQueue}/>
        <div style={{maxWidth:700}}>
          <button className="aka-back-btn" onClick={() => { setActive(null); setQuizDone(null); }}>← Back to lessons</button>
          <div style={{background:'linear-gradient(135deg,#1A1D3A,#4F8EF7)',borderRadius:20,padding:24,color:'#fff',marginBottom:16}}>
            <div style={{fontSize:48,marginBottom:8}}>{lesson.emoji}</div>
            <div style={{fontSize:11,opacity:.7,fontWeight:600,marginBottom:4}}>{content.type}</div>
            <div style={{fontSize:22,fontWeight:900,marginBottom:6}}>{content.title}</div>
            {done && <span style={{background:'rgba(255,255,255,.2)',padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:700}}>✅ Completed</span>}
          </div>
          <div className="aka-card">
            <div className="aka-card-type">📖 Lesson</div>
            <div style={{fontSize:14,lineHeight:1.8,color:'var(--text)'}} dangerouslySetInnerHTML={{__html: content.body}}/>
          </div>
          {content.visual && (
            <div style={{background:'linear-gradient(135deg,var(--sky-light),var(--violet-light))',borderRadius:14,padding:18,marginBottom:14,textAlign:'center',fontSize:14,fontWeight:600,fontFamily:'monospace',color:'var(--text)'}}>
              {content.visual}
            </div>
          )}
          <div className="aka-card">
            <div className="aka-card-type">🎯 Quick Quiz</div>
            <div style={{fontSize:16,fontWeight:800,marginBottom:14}}>{content.quiz.q}</div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {content.quiz.opts.map((opt,i) => {
                let cls = 'aka-quiz-opt';
                if (quizDone !== null) {
                  if (i === content.quiz.correct) cls += ' correct';
                }
                return <button key={i} className={cls} disabled={quizDone!==null} onClick={() => setQuizDone(i===content.quiz.correct)}>{opt}</button>;
              })}
            </div>
            {quizDone !== null && (
              <>
                <div className={`aka-quiz-feedback ${quizDone?'correct':'wrong'}`}>{quizDone?'✅':'❌'} {content.quiz.exp}</div>
                <button className="aka-primary-btn" onClick={() => handleComplete(lesson)} disabled={done} style={{marginTop:8}}>
                  {done ? '✅ Already completed!' : `🚀 Complete Lesson & Earn ${lesson.xp} XP!`}
                </button>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  // Show basic lesson if no full content available
  if (active && lesson && !content) {
    const done = isCompleted('ai_lesson', String(lesson.id));
    return (
      <>
        <BadgeToast badges={newBadgesQueue} onDone={clearBadgesQueue}/>
        <div style={{maxWidth:700}}>
          <button className="aka-back-btn" onClick={() => setActive(null)}>← Back to lessons</button>
          <div style={{background:'linear-gradient(135deg,#1A1D3A,#4F8EF7)',borderRadius:20,padding:28,color:'#fff',marginBottom:16,textAlign:'center'}}>
            <div style={{fontSize:56,marginBottom:10}}>{lesson.emoji}</div>
            <div style={{fontSize:22,fontWeight:900,marginBottom:6}}>{lesson.title}</div>
            <div style={{fontSize:13,opacity:.85}}>{lesson.desc}</div>
          </div>
          <div className="aka-card" style={{textAlign:'center',padding:32}}>
            <div style={{fontSize:48,marginBottom:12}}>📖</div>
            <div style={{fontWeight:800,fontSize:16,marginBottom:8}}>{lesson.title}</div>
            <div style={{fontSize:13,color:'var(--text2)',marginBottom:10,lineHeight:1.6}}>{lesson.desc}</div>
            <div style={{fontSize:13,color:'var(--text2)',marginBottom:20,lineHeight:1.6,background:'var(--sky-light)',borderRadius:12,padding:14}}>
              This lesson covers essential AI concepts. Complete the lesson to unlock the quiz and earn {lesson.xp} XP!
            </div>
            <button className="aka-primary-btn" onClick={() => { setQuizDone(true); }} style={{maxWidth:280,margin:'0 auto'}}>
              ✅ I&apos;ve read this lesson — take the quiz!
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <BadgeToast badges={newBadgesQueue} onDone={clearBadgesQueue}/>
      <div className="aka-module-hero" style={{background:'linear-gradient(135deg,#1A1D3A,#4F8EF7,#8B5CF6)'}}>
        <div className="aka-hero-eyebrow">AI Explorer</div>
        <div className="aka-hero-heading">🧠 Learn How AI Works!</div>
        <div style={{fontSize:13,opacity:.9}}>Master the technology shaping our future</div>
      </div>
      <div className="aka-section-header">
        <h2>AI Lessons</h2>
        <span style={{fontSize:12,color:'var(--text2)'}}>{completedCount}/12 complete</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:13,marginBottom:22}}>
        {LESSONS.map(l => {
          const done = isCompleted('ai_lesson', String(l.id));
          return (
            <div key={l.id} className={`aka-module-card${done?' completed':''}`} onClick={() => { setActive(l.id); setQuizDone(null); }}
              style={{border:`1.5px solid ${done?'var(--mint)':'var(--border)'}`,background:done?'var(--mint-light)':'var(--card)'}}>
              {done && <div className="aka-done-badge" style={{position:'absolute',top:10,left:10}}>✓</div>}
              <div className="aka-xp-badge">+{l.xp} XP</div>
              <div className="aka-mc-icon">{l.emoji}</div>
              <div className="aka-mc-name">{l.title}</div>
              <div className="aka-mc-desc">{l.desc}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
