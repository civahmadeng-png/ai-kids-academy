'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useProgress } from '@/hooks/useProgress';

const CAREERS = [
  {id:'scientist',    icon:'🔬', name:'Scientist',      color:'#22D3A6', what:'Design experiments to discover new knowledge about the world.',                                    skills:['Critical thinking','Observation','Maths','Patience'],           challenge:'Design an experiment to test whether plants grow faster with music.', project:'Keep a nature journal for one week.',                       xp:60},
  {id:'engineer',     icon:'⚙️', name:'Engineer',       color:'#FFB800', what:'Solve real-world problems by designing and building systems and structures.',                       skills:['Maths','Problem solving','Creativity','Attention to detail'],   challenge:'Design a bridge from 10 sheets of paper that holds the most weight.', project:'Build something useful from recycled materials.',             xp:65},
  {id:'ai_developer', icon:'🤖', name:'AI Developer',   color:'#4F8EF7', what:'Build and train AI systems that can learn, reason, and help people.',                              skills:['Coding','Maths','Logic','Curiosity'],                           challenge:'Write the best prompt to get an AI to explain gravity to a 6-year-old.', project:'Design your own AI app (on paper).',                       xp:70},
  {id:'game_designer',icon:'🎮', name:'Game Designer',  color:'#8B5CF6', what:'Create the rules, worlds, characters, and experiences of video and board games.',                   skills:['Creativity','Storytelling','UX thinking','Testing'],           challenge:'Design a 5-minute card game with exactly 20 cards.',            project:'Make a paper prototype of your dream game.',                      xp:65},
  {id:'digital_artist',icon:'🎨',name:'Digital Artist', color:'#FF6B6B', what:'Create visual art using digital tools — illustration, animation, concept art, and more.',          skills:['Creativity','Observation','Software skills','Communication'],    challenge:'Create a character design with a front and side view.',         project:'Draw 5 different characters with different personalities.',       xp:55},
  {id:'astronaut',    icon:'👨‍🚀', name:'Astronaut',     color:'#1A1D3A', what:'Explore space, conduct experiments in microgravity, and advance human knowledge of the cosmos.',   skills:['Science','Fitness','Languages','Resilience'],                   challenge:'Design a 30-day menu for a Mars mission (no fresh food!).', project:'Research one current astronaut and their career path.',             xp:70},
  {id:'architect',    icon:'🏗️', name:'Architect',      color:'#22D3A6', what:'Design buildings and spaces that are beautiful, functional, and safe for people to use.',           skills:['Maths','Creativity','Technical drawing','History'],              challenge:'Design your ideal school — draw the floor plan.',               project:'Build a model of your dream home from cardboard.',                xp:60},
  {id:'entrepreneur', icon:'💡', name:'Entrepreneur',   color:'#FFB800', what:'Start and run businesses that solve problems and create value for customers and society.',           skills:['Creativity','Communication','Finance','Resilience'],             challenge:'Identify a problem in your home or school and design a business solution.',project:'Write a one-page business plan for a kids\' business.',          xp:65},
];

export default function CareerScreen() {
  const { currentUser, updateUser } = useAppStore();
  const { isCompleted, completeItem } = useProgress();
  const [selected, setSelected] = useState<typeof CAREERS[0] | null>(null);
  const [completing, setCompleting] = useState(false);

  const completedCount = CAREERS.filter(c => isCompleted('career_exploration', c.id)).length;

  async function handleComplete(career: typeof CAREERS[0]) {
    if (completing) return;
    setCompleting(true);
    await completeItem('career_exploration', career.id, career.name, career.xp, 15);
    updateUser({ exploredCareers: [...new Set([...(currentUser?.exploredCareers ?? []), career.id])] });
    setCompleting(false);
    setSelected(null);
  }

  if (selected) {
    const done = isCompleted('career_exploration', selected.id);
    return (
      <div style={{ maxWidth:640 }}>
        <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'var(--sky)', fontWeight:700, cursor:'pointer', marginBottom:14 }}>← Back</button>
        <div style={{ background:`linear-gradient(135deg,${selected.color},#1A1D3A)`, borderRadius:20, padding:24, color:'#fff', marginBottom:16 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>{selected.icon}</div>
          <div style={{ fontWeight:900, fontSize:22 }}>{selected.name}</div>
          <div style={{ fontSize:13, opacity:.85, lineHeight:1.6 }}>{selected.what}</div>
        </div>
        <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:18, marginBottom:12 }}>
          <div style={{ fontWeight:800, fontSize:13, marginBottom:10, textTransform:'uppercase', color:'var(--text2)' }}>🎓 Key Skills</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {selected.skills.map(s => <span key={s} style={{ background:'#F5F7FF', border:'1px solid #E5E7EB', borderRadius:99, padding:'5px 12px', fontSize:12, fontWeight:600 }}>{s}</span>)}
          </div>
        </div>
        <div style={{ background:'var(--sky-light)', borderRadius:14, padding:16, marginBottom:12 }}>
          <div style={{ fontWeight:800, fontSize:13, marginBottom:6 }}>🎯 Mini Challenge</div>
          <p style={{ fontSize:14, lineHeight:1.6, margin:0 }}>{selected.challenge}</p>
        </div>
        <div style={{ background:'var(--mint-light)', borderRadius:14, padding:16, marginBottom:16 }}>
          <div style={{ fontWeight:800, fontSize:13, marginBottom:6 }}>🚀 Beginner Project</div>
          <p style={{ fontSize:14, lineHeight:1.6, margin:0 }}>{selected.project}</p>
        </div>
        <button onClick={() => handleComplete(selected)} disabled={done || completing}
          style={{ width:'100%', background:done?'#E5E7EB':`linear-gradient(135deg,${selected.color},#1A1D3A)`, color:done?'#6B7280':'#fff', border:'none', borderRadius:14, padding:14, fontWeight:800, fontSize:14, cursor:done?'default':'pointer' }}>
          {completing ? '...' : done ? '✅ Explored!' : `🌟 Explore This Career & Earn ${selected.xp} XP`}
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:720 }}>
      <div style={{ background:'linear-gradient(135deg,#FFB800,#FF6B6B)', borderRadius:20, padding:22, color:'#fff', marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>🌟</div>
        <div style={{ fontWeight:900, fontSize:22 }}>Career Discovery Center</div>
        <div style={{ fontSize:13, opacity:.85 }}>Explore amazing careers — your future starts here! · {completedCount}/8 explored</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(165px,1fr))', gap:12 }}>
        {CAREERS.map(c => {
          const done = isCompleted('career_exploration', c.id);
          return (
            <div key={c.id} onClick={() => setSelected(c)}
              style={{ background:`linear-gradient(135deg,${c.color}18,#fff)`, border:`2px solid ${done?c.color:'#E5E7EB'}`, borderRadius:16, padding:16, cursor:'pointer', transition:'all .2s' }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor=c.color)}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=done?c.color:'#E5E7EB')}>
              <div style={{ fontSize:32, marginBottom:6 }}>{c.icon}</div>
              <div style={{ fontWeight:800, fontSize:13, marginBottom:3 }}>{c.name}</div>
              <div style={{ fontSize:11, color:done?'#065F46':'var(--sky)', fontWeight:700 }}>{done?'✅ Explored':'+'+c.xp+' XP'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
