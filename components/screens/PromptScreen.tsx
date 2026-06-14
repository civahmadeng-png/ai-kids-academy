'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';

const CHALLENGES = [
  {id:'better_q',    title:'Make a Better Question',    icon:'❓', xp:40,
   task:'Rewrite this bad question into a great one for an AI:\n\n"Tell me about dogs"',
   hint:'Add specifics: what kind, for whom, how long, what purpose?',
   ideal:'You are a friendly vet. Explain 5 amazing facts about Border Collies for a 12-year-old who just got one. Use simple language and emojis.',
   keyElements:['Role (you are a...)','Specifics (Border Collie not just dogs)','Audience (12-year-old)','Format (5 facts)']},
  {id:'explain_simple',title:'Explain Simply',         icon:'🧒', xp:45,
   task:'Write a prompt to get AI to explain "black holes" to a 7-year-old who loves dinosaurs.',
   hint:'Use the audience\'s interests as an analogy!',
   ideal:'You are a fun science teacher. Explain what a black hole is to a 7-year-old who loves dinosaurs. Use dinosaurs as an analogy and keep it under 50 words.',
   keyElements:['Age-appropriate audience','Interest-based analogy','Length constraint','Simple language request']},
  {id:'story_idea',  title:'Generate a Story Idea',    icon:'📚', xp:40,
   task:'Write a prompt that makes an AI generate 3 original story ideas for kids aged 10-12.',
   hint:'Tell it the genre, length, and how many ideas.',
   ideal:'Generate 3 original adventure story ideas for children aged 10-12. Each idea should have: a unique setting, a brave child hero, an unexpected problem, and a surprising twist. Present each idea in 3 sentences.',
   keyElements:['Target age','Number of ideas','Story components required','Presentation format']},
  {id:'study_plan',  title:'Create a Study Plan',      icon:'📝', xp:50,
   task:'Write a prompt to get AI to create a 1-week study plan for a school science test on photosynthesis.',
   hint:'Include time available, topics to cover, and learning style.',
   ideal:'You are an educational coach. Create a 7-day study plan for a Year 8 student preparing for a photosynthesis test. They have 20 minutes per day. Include: a daily topic, one activity, and a quick quiz question for each day.',
   keyElements:['Role','Timeline','Time constraint per day','Structure per session']},
  {id:'image_prompt',title:'Improve an Image Prompt',  icon:'🎨', xp:45,
   task:'Improve this image generation prompt:\n\n"cat in space"',
   hint:'Add style, detail, mood, lighting, and composition.',
   ideal:'A fluffy orange tabby cat wearing a silver astronaut helmet, floating in space surrounded by colorful nebulae, cartoon style, golden lighting, detailed, cute, space adventure illustration.',
   keyElements:['Physical description (colour, breed)','Setting details','Art style','Mood/lighting','Additional details']},
  {id:'fact_check',  title:'Fact-Check a Claim',       icon:'🔍', xp:55,
   task:'Write a prompt asking AI to help you fact-check:\n\n"Napoleon Bonaparte was very short"',
   hint:'Ask AI to give evidence, counter-evidence, and a verdict.',
   ideal:'Act as a fact-checker. Investigate whether "Napoleon Bonaparte was very short" is true. Provide: (1) the actual historical height, (2) why this myth exists, (3) comparison to average height of that era, (4) your verdict with confidence level.',
   keyElements:['Fact-checker role','Specific claim','Evidence structure requested','Verdict format']},
];

export default function PromptScreen() {
  const { addXP, addCoins } = useAppStore();
  const [current, setCurrent] = useState(0);
  const [input, setInput]     = useState('');
  const [shown, setShown]     = useState(false);
  const PROMPT_KEY = 'prompt_master_rewarded';
  const [rewarded, setRewarded] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PROMPT_KEY) ?? '[]');
      setRewarded(new Set(saved));
    } catch { /* */ }
  }, []);

  const challenge = CHALLENGES[current];

  function reveal() {
    setShown(true);
    if (!rewarded.has(current)) {
      addXP(challenge.xp); addCoins(10);
      const next = new Set([...rewarded, current]);
      setRewarded(next);
      try { localStorage.setItem(PROMPT_KEY, JSON.stringify([...next])); } catch { /* */ }
    }
  }

  return (
    <div style={{ maxWidth:680 }}>
      <div style={{ background:'linear-gradient(135deg,#8B5CF6,#FF6B6B)', borderRadius:20, padding:22, color:'#fff', marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>✨</div>
        <div style={{ fontWeight:900, fontSize:22 }}>Prompt Master</div>
        <div style={{ fontSize:13, opacity:.85 }}>Learn the art of writing great AI prompts!</div>
        <div style={{ marginTop:10, fontSize:12, opacity:.7 }}>Challenge {current+1} of {CHALLENGES.length}</div>
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {CHALLENGES.map((_,i) => (
          <button key={i} onClick={() => { setCurrent(i); setInput(''); setShown(false); }}
            style={{ width:32, height:32, borderRadius:'50%', border:'2px solid', borderColor: rewarded.has(i)?'#22D3A6':i===current?'#8B5CF6':'#E5E7EB', background:rewarded.has(i)?'#DCFDF2':i===current?'#EDE9FE':'#fff', fontWeight:800, fontSize:12, cursor:'pointer', color:rewarded.has(i)?'#065F46':i===current?'#8B5CF6':'#6B7280' }}>
            {rewarded.has(i)?'✓':i+1}
          </button>
        ))}
      </div>

      <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:20, marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <span style={{ fontSize:28 }}>{challenge.icon}</span>
          <div style={{ fontWeight:900, fontSize:16 }}>{challenge.title}</div>
          <span style={{ marginLeft:'auto', background:'var(--sky-light)', color:'var(--sky)', padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>+{challenge.xp} XP</span>
        </div>
        <div style={{ background:'#F5F7FF', borderRadius:12, padding:14, marginBottom:14, whiteSpace:'pre-wrap', fontSize:14, lineHeight:1.6, color:'#374151' }}>{challenge.task}</div>
        <div style={{ background:'var(--sun-light)', borderRadius:10, padding:12, marginBottom:14, fontSize:13, color:'#92400E' }}>
          💡 Hint: {challenge.hint}
        </div>
        <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Write your improved prompt here..."
          rows={4} style={{ width:'100%', padding:'12px 14px', border:'1.5px solid #E5E7EB', borderRadius:12, fontSize:14, resize:'vertical', boxSizing:'border-box', fontFamily:'inherit', marginBottom:12 }}/>
        <button onClick={reveal} disabled={input.trim().length < 20}
          style={{ width:'100%', background:input.trim().length<20?'#E5E7EB':'linear-gradient(135deg,#8B5CF6,#4F8EF7)', color:input.trim().length<20?'#9CA3AF':'#fff', border:'none', borderRadius:12, padding:13, fontWeight:800, fontSize:14, cursor:input.trim().length<20?'default':'pointer' }}>
          {shown ? '✅ Revealed!' : '🔍 Reveal Ideal Prompt'}
        </button>
      </div>

      {shown && (
        <div style={{ background:'#DCFDF2', border:'1.5px solid #22D3A6', borderRadius:16, padding:20 }}>
          <div style={{ fontWeight:800, fontSize:14, marginBottom:10 }}>✅ Ideal Prompt:</div>
          <div style={{ background:'#fff', borderRadius:12, padding:14, fontSize:14, lineHeight:1.7, color:'#1A1D3A', marginBottom:12, fontStyle:'italic' }}>"{challenge.ideal}"</div>
          <div style={{ fontWeight:800, fontSize:13, marginBottom:8 }}>Key ingredients:</div>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
            {challenge.keyElements.map(el => <span key={el} style={{ background:'#22D3A6', color:'#fff', padding:'4px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>{el}</span>)}
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:10, marginTop:16 }}>
        <button onClick={()=>{ setCurrent(c=>(c-1+CHALLENGES.length)%CHALLENGES.length); setInput(''); setShown(false); }} style={{ flex:1, background:'#F5F7FF', border:'1.5px solid #E5E7EB', borderRadius:12, padding:11, fontWeight:700, cursor:'pointer' }}>← Prev</button>
        <button onClick={()=>{ setCurrent(c=>(c+1)%CHALLENGES.length); setInput(''); setShown(false); }} style={{ flex:1, background:'linear-gradient(135deg,#8B5CF6,#4F8EF7)', color:'#fff', border:'none', borderRadius:12, padding:11, fontWeight:800, cursor:'pointer' }}>Next →</button>
      </div>
    </div>
  );
}
