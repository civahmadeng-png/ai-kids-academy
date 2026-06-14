'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import type { ScreenId } from '@/lib/store';

const QUESTIONS = [
  {id:1, text:'What do you most enjoy doing in your free time?', emoji:'🎯',
   options:[
     {text:'Doing experiments or building things',  tags:['scientist','engineer']},
     {text:'Drawing, writing stories or making art', tags:['artist','story']},
     {text:'Helping friends and solving problems',  tags:['leader','helper']},
     {text:'Learning new facts and reading',        tags:['scientist','explorer']},
   ]},
  {id:2, text:'Which superpower would you choose?', emoji:'🦸',
   options:[
     {text:'Time travel to explore history',        tags:['explorer','scientist']},
     {text:'Create anything you imagine',           tags:['artist','ai_creator']},
     {text:'Understand any animal or language',     tags:['explorer','helper']},
     {text:'Invent machines that help people',      tags:['engineer','scientist']},
   ]},
  {id:3, text:'At school, your favourite subject is...', emoji:'📚',
   options:[
     {text:'Science or Maths',                       tags:['scientist','engineer']},
     {text:'Art, English or Drama',                  tags:['artist','story']},
     {text:'Computing or Technology',                tags:['ai_creator','engineer']},
     {text:'Geography, History or R.E.',             tags:['explorer','leader']},
   ]},
  {id:4, text:'Your ideal after-school club would be...', emoji:'🏫',
   options:[
     {text:'Robotics or coding club',               tags:['engineer','ai_creator']},
     {text:'Writing or drama club',                 tags:['story','artist']},
     {text:'Eco or nature club',                    tags:['explorer','scientist']},
     {text:'Student council or debate club',        tags:['leader','helper']},
   ]},
  {id:5, text:'When you encounter a problem, you usually...', emoji:'🧩',
   options:[
     {text:'Research and gather lots of information', tags:['scientist','explorer']},
     {text:'Think of creative unusual solutions',    tags:['artist','ai_creator']},
     {text:'Build or prototype something practical', tags:['engineer','ai_creator']},
     {text:'Talk to people and ask for opinions',   tags:['leader','helper']},
   ]},
  {id:6, text:'What would you most like to create?', emoji:'✨',
   options:[
     {text:'A device that makes life easier',       tags:['engineer','ai_creator']},
     {text:'A book, film or work of art',           tags:['story','artist']},
     {text:'A map or discovery of something new',  tags:['explorer','scientist']},
     {text:'A charity or organisation to help others', tags:['helper','leader']},
   ]},
  {id:7, text:'Your dream career is probably something like...', emoji:'💼',
   options:[
     {text:'Scientist, doctor or researcher',       tags:['scientist','explorer']},
     {text:'Engineer, architect or game designer',  tags:['engineer','ai_creator']},
     {text:'Author, artist or film director',       tags:['story','artist']},
     {text:'Business owner, teacher or charity worker', tags:['leader','helper']},
   ]},
  {id:8, text:'When you have pocket money, you...', emoji:'🐷',
   options:[
     {text:'Save it carefully for something big',   tags:['helper','money']},
     {text:'Invest in materials to build projects', tags:['engineer','artist']},
     {text:'Buy books, science kits or art supplies', tags:['scientist','artist']},
     {text:'Share it or donate some to good causes', tags:['helper','leader']},
   ]},
];

const PROFILES: Record<string, {name:string;emoji:string;color:string;desc:string;modules:ScreenId[]}> = {
  scientist: {name:'Young Scientist',     emoji:'🔬', color:'#22D3A6', desc:'You love discovering how things work and asking "why?" Your curiosity drives you to experiment and explore the natural world.',   modules:['science','explorer','discovery']},
  engineer:  {name:'Future Engineer',     emoji:'⚙️', color:'#FFB800', desc:'You love building, designing and solving practical problems. You see challenges as puzzles waiting to be solved!',             modules:['engineering','science','mentor']},
  artist:    {name:'Creative Artist',     emoji:'🎨', color:'#8B5CF6', desc:'You see the world through creative eyes. Art, beauty and self-expression come naturally to you. The world needs your vision!', modules:['story','mentor','achievements']},
  story:     {name:'Story Maker',         emoji:'📚', color:'#4F8EF7', desc:'You have a gift for words and imagination. You can create whole worlds in your mind and bring them to life on the page!',      modules:['story','explorer','mentor']},
  ai_creator:{name:'AI Creator',          emoji:'🤖', color:'#FF6B6B', desc:'You\'re fascinated by technology and love using tools to create amazing things. The AI revolution needs creators like you!',   modules:['explorer','mentor','engineering']},
  explorer:  {name:'Nature Explorer',     emoji:'🌍', color:'#22D3A6', desc:'You love adventures, discovery and learning about the natural world. Every day is a chance to explore something new!',          modules:['discovery','science','achievements']},
  money:     {name:'Money Smart Kid',     emoji:'💰', color:'#FFB800', desc:'You think carefully about resources, planning and the future. Financial intelligence is one of the rarest and most valuable skills!', modules:['achievements','mentor','explorer']},
  leader:    {name:'Helper Leader',       emoji:'💪', color:'#FF6B6B', desc:'You care deeply about others and want to make a difference. You have the empathy and communication skills to lead teams!',      modules:['mentor','achievements','explorer']},
};

export default function TalentScreen() {
  const { navigate, addXP, addCoins, updateUser, currentUser } = useAppStore();
  const [step, setStep]         = useState<'quiz'|'result'>('quiz');
  const [current, setCurrent]   = useState(0);
  const [scores, setScores]     = useState<Record<string, number>>({});
  const [result, setResult]     = useState<typeof PROFILES[string] | null>(null);
  const [secondary, setSecondary] = useState<typeof PROFILES[string][]>([]);
  const [xpGiven, setXpGiven]   = useState(false);
  const [confirmRetake, setConfirmRetake] = useState(false);

  // Restore saved talent result on mount
  useEffect(() => {
    if (currentUser?.talentResult) {
      const saved = currentUser.talentResult;
      const primary = PROFILES[saved.primary];
      const sec     = (saved.secondaries ?? []).map((k: string) => PROFILES[k]).filter(Boolean);
      if (primary) { setResult(primary); setSecondary(sec); setStep('result'); setXpGiven(true); }
    }
  }, [currentUser?.talentResult]);

  function answer(tags: string[]) {
    const next = { ...scores };
    tags.forEach(t => { next[t] = (next[t] ?? 0) + 1; });
    setScores(next);

    if (current < QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
    } else {
      // Calculate result
      const sorted = Object.entries(next).sort(([,a],[,b]) => b - a);
      const primary = PROFILES[sorted[0]?.[0]] ?? PROFILES.explorer;
      const sec = sorted.slice(1, 3).map(([k]) => PROFILES[k]).filter(Boolean) as typeof secondary;
      setResult(primary);
      setSecondary(sec);
      setStep('result');
      if (!xpGiven) {
        addXP(60); addCoins(15);
        setXpGiven(true);
        updateUser({ talentResult: { primary: sorted[0]?.[0] ?? 'explorer', secondaries: sorted.slice(1,3).map(([k])=>k) } });
      }
    }
  }

  if (step === 'result' && result) {
    return (
      <div style={{ maxWidth:640 }}>
        <div style={{ background:`linear-gradient(135deg,${result.color},#1A1D3A)`, borderRadius:20, padding:28, color:'#fff', textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:64, marginBottom:10 }}>{result.emoji}</div>
          <div style={{ fontWeight:900, fontSize:24, marginBottom:8 }}>You are a {result.name}!</div>
          <p style={{ fontSize:14, opacity:.9, lineHeight:1.7, maxWidth:420, margin:'0 auto' }}>{result.desc}</p>
        </div>
        {secondary.length > 0 && (
          <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:18, marginBottom:16 }}>
            <div style={{ fontWeight:800, fontSize:14, marginBottom:12 }}>Also strong in:</div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {secondary.map(p => (
                <div key={p.name} style={{ background:'#F5F7FF', borderRadius:12, padding:'10px 16px', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:20 }}>{p.emoji}</span>
                  <span style={{ fontWeight:700, fontSize:13 }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:18, marginBottom:16 }}>
          <div style={{ fontWeight:800, fontSize:14, marginBottom:12 }}>🚀 Recommended modules for you:</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {result.modules.map(m => {
              const labels: Record<string,{emoji:string;label:string}> = {
                science:{emoji:'🧪',label:'Science Lab'}, explorer:{emoji:'🧠',label:'AI Explorer'},
                engineering:{emoji:'⚙️',label:'Engineering Lab'}, story:{emoji:'📚',label:'Story World'},
                mentor:{emoji:'🤖',label:'AI Mentor'}, discovery:{emoji:'🌎',label:'Discovery Missions'},
                achievements:{emoji:'🏆',label:'Achievements'},
              };
              const info = labels[m] ?? {emoji:'⭐',label:m};
              return (
                <button key={m} onClick={() => navigate(m)}
                  style={{ display:'flex', alignItems:'center', gap:10, background:'var(--sky-light)', border:'none', borderRadius:12, padding:'12px 16px', cursor:'pointer', textAlign:'left' }}>
                  <span style={{ fontSize:22 }}>{info.emoji}</span>
                  <span style={{ fontWeight:700, fontSize:13, color:'#1A1D3A' }}>{info.label}</span>
                  <span style={{ marginLeft:'auto', color:'#4F8EF7', fontSize:12, fontWeight:700 }}>Go →</span>
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={() => setConfirmRetake(true)}
          style={{ width:'100%', background:'#F5F7FF', border:'1.5px solid #E5E7EB', borderRadius:14, padding:13, fontWeight:700, fontSize:14, cursor:'pointer' }}>
          🔄 Retake Quiz
        </button>
        {confirmRetake && (
          <div style={{ marginTop:12, background:'#FFF5F3', border:'1.5px solid #FF6B6B', borderRadius:14, padding:16, textAlign:'center' }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>Retake the quiz? Your current result will be cleared.</div>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button onClick={() => { setStep('quiz'); setCurrent(0); setScores({}); setResult(null); setXpGiven(true); setConfirmRetake(false); updateUser({ talentResult: null as any }); }}
                style={{ background:'#FF6B6B', color:'#fff', border:'none', borderRadius:10, padding:'9px 20px', fontWeight:800, cursor:'pointer' }}>Yes, retake</button>
              <button onClick={() => setConfirmRetake(false)}
                style={{ background:'#F5F7FF', border:'1.5px solid #E5E7EB', borderRadius:10, padding:'9px 20px', fontWeight:700, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const q = QUESTIONS[current];
  const progressPct = Math.round(((current) / QUESTIONS.length) * 100);

  return (
    <div style={{ maxWidth:580 }}>
      <div style={{ background:'linear-gradient(135deg,#8B5CF6,#4F8EF7)', borderRadius:20, padding:'18px 20px', color:'#fff', marginBottom:20 }}>
        <div style={{ fontWeight:900, fontSize:18 }}>🎭 Talent Discovery</div>
        <div style={{ fontSize:12, opacity:.85, marginBottom:10 }}>Discover your unique strengths and learning style</div>
        <div style={{ background:'rgba(255,255,255,.15)', borderRadius:99, height:6, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progressPct}%`, background:'#fff', borderRadius:99, transition:'width .4s' }}/>
        </div>
        <div style={{ fontSize:11, opacity:.7, marginTop:4 }}>Question {current+1} of {QUESTIONS.length}</div>
      </div>
      <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:20, padding:24, marginBottom:14 }}>
        <div style={{ fontSize:36, marginBottom:12, textAlign:'center' }}>{q.emoji}</div>
        <div style={{ fontWeight:800, fontSize:17, color:'#1A1D3A', textAlign:'center', marginBottom:20, lineHeight:1.4 }}>{q.text}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => answer(opt.tags)}
              style={{ background:'#F5F7FF', border:'1.5px solid #E5E7EB', borderRadius:14, padding:'14px 18px', cursor:'pointer', fontWeight:600, fontSize:14, color:'#1A1D3A', textAlign:'left', transition:'all .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='#8B5CF6'; (e.currentTarget as HTMLButtonElement).style.background='#EDE9FE'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='#E5E7EB'; (e.currentTarget as HTMLButtonElement).style.background='#F5F7FF'; }}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
