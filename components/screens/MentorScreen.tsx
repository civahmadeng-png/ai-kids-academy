'use client';
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { callMentor, AILimitError, AISafetyError, formatUsageLabel } from '@/lib/ai-client';
import { trackEvent } from '@/lib/analytics';

const MENTOR_FIRST_XP_KEY = 'mentor_first_xp_awarded';

interface Message { role: 'user' | 'ai'; text: string; }

const STARTERS = [
  "What is artificial intelligence?",
  "How does the internet work?",
  "Why is the sky blue?",
  "What are black holes?",
  "How do plants make food?",
];

export default function MentorScreen() {
  const { currentUser, addXP, addCoins, navigate } = useAppStore();
  const { activeChild } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [usage, setUsage]       = useState<{used:number;limit:number}|null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const childName = activeChild?.displayName ?? currentUser?.name ?? 'Explorer';
  const childId   = activeChild?.id ?? 'demo';
  const plan      = (currentUser?.plan ?? 'free') as 'free'|'premium'|'family';

  useEffect(() => {
    setMessages([{ role:'ai', text:`Hi ${childName}! 👋 I'm Sparky, your AI mentor! 🤖✨\n\nI'm here to help you learn about AI, science, technology, math — anything you're curious about!\n\nWhat would you like to explore today? 🚀` }]);
  }, [childName]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role:'user', text:msg }]);
    setLoading(true);
    const history = messages.slice(-6).map(m => ({ role:(m.role==='ai'?'assistant':'user') as 'user'|'assistant', content:m.text }));
    try {
      const res = await callMentor(childName, msg, childId, plan, history);
      setMessages(prev => [...prev, { role:'ai', text:res.text }]);
      setUsage({ used:res.used??0, limit:res.limit??5 });
      void trackEvent('ai_mentor_used', { feature:'mentor' }, { childId: childId !== 'demo' ? childId : undefined });
      // Award XP only on very first mentor chat (persisted to localStorage)
      if (!localStorage.getItem(MENTOR_FIRST_XP_KEY)) {
        addXP(10); addCoins(3);
        try { localStorage.setItem(MENTOR_FIRST_XP_KEY, '1'); } catch { /* */ }
      }
    } catch (err) {
      let t = '⚠️ Something went wrong. Please try again!';
      if (err instanceof AILimitError) {
        t=`⏰ ${err.message}`; setUsage({used:err.used,limit:err.limit});
        void trackEvent('ai_limit_reached', { feature:'mentor', plan }, { childId: childId !== 'demo' ? childId : undefined });
      }
      else if (err instanceof AISafetyError) t=`🛡️ ${err.message}`;
      else if (err instanceof Error) t=`⚠️ ${err.message}`;
      setMessages(prev => [...prev, { role:'ai', text:t }]);
    } finally { setLoading(false); }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 110px)',maxWidth:720}}>
      <div style={{background:'linear-gradient(135deg,#1A1D3A,#4F8EF7)',borderRadius:18,padding:'18px 22px',marginBottom:14,color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{fontSize:42}}>🤖</div>
          <div>
            <div style={{fontWeight:900,fontSize:18,marginBottom:2}}>Sparky — Your AI Mentor</div>
            <div style={{fontSize:12,opacity:.85}}>Ask me anything! Science, AI, math, nature...</div>
          </div>
        </div>
        {usage && <div style={{background:'rgba(255,255,255,.15)',borderRadius:10,padding:'6px 12px',fontSize:11,fontWeight:700,textAlign:'center',flexShrink:0}}><div>{usage.used}/{usage.limit}</div><div style={{opacity:.8}}>today</div></div>}
      </div>

      {usage && usage.limit < 999 && (
        <div style={{marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--text2)',marginBottom:4}}>
            <span>Daily usage</span><span>{formatUsageLabel(usage.used,usage.limit)}</span>
          </div>
          <div style={{height:4,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${Math.min(100,Math.round(usage.used/usage.limit*100))}%`,background:usage.used>=usage.limit?'var(--coral)':'var(--sky)',borderRadius:99,transition:'width .5s'}}/>
          </div>
          {usage.used>=usage.limit && <div style={{fontSize:11,color:'var(--coral)',fontWeight:700,marginTop:4}}>Daily limit reached · <button className="auth-link-btn" style={{fontSize:11}} onClick={()=>navigate('upgrade')}>Upgrade →</button></div>}
        </div>
      )}

      <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:12,paddingRight:4}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',flexDirection:m.role==='user'?'row-reverse':'row'}}>
            <div style={{width:34,height:34,borderRadius:'50%',background:m.role==='ai'?'linear-gradient(135deg,#1A1D3A,#4F8EF7)':'linear-gradient(135deg,var(--sun),var(--coral))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0}}>{m.role==='ai'?'🤖':'🧒'}</div>
            <div style={{maxWidth:'78%',background:m.role==='ai'?'var(--card)':'linear-gradient(135deg,var(--sky),var(--violet))',color:m.role==='user'?'#fff':'var(--text)',borderRadius:m.role==='ai'?'4px 16px 16px 16px':'16px 4px 16px 16px',padding:'12px 15px',fontSize:14,lineHeight:1.7,border:m.role==='ai'?'1.5px solid var(--border)':'none',whiteSpace:'pre-wrap'}}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#1A1D3A,#4F8EF7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>🤖</div>
            <div style={{background:'var(--card)',border:'1.5px solid var(--border)',borderRadius:'4px 16px 16px 16px',padding:'12px 18px',display:'flex',gap:5}}>
              {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:'50%',background:'var(--sky)',animation:'bounce 1.4s ease-in-out infinite',animationDelay:`${i*.2}s`}}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {messages.length<=1 && (
        <div style={{marginTop:12,marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text2)',marginBottom:7,textTransform:'uppercase',letterSpacing:'.05em'}}>Try asking:</div>
          <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
            {STARTERS.map(q=><button key={q} onClick={()=>send(q)} style={{background:'var(--sky-light)',color:'var(--sky-dark)',border:'none',borderRadius:99,padding:'6px 13px',fontSize:12,fontWeight:600,cursor:'pointer'}}>{q}</button>)}
          </div>
        </div>
      )}

      <div style={{display:'flex',gap:10,marginTop:12,paddingTop:12,borderTop:'1px solid var(--border)'}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()} placeholder="Ask Sparky anything..." disabled={loading} style={{flex:1,padding:'12px 16px',border:'1.5px solid var(--border)',borderRadius:14,fontSize:14,background:'var(--bg)',color:'var(--text)'}}/>
        <button onClick={()=>send()} disabled={loading||!input.trim()} style={{width:46,height:46,borderRadius:13,background:'linear-gradient(135deg,var(--sky),var(--violet))',color:'#fff',border:'none',fontSize:20,cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',opacity:(!input.trim()||loading)?.5:1}}>
          {loading?<span className="aka-spinner" style={{borderTopColor:'#fff',borderColor:'rgba(255,255,255,.3)',width:18,height:18}}/>:'→'}
        </button>
      </div>
    </div>
  );
}
