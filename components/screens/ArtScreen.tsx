'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';

const STYLES = [
  {id:'cartoon',    label:'Cartoon',    emoji:'🎨'},
  {id:'watercolor', label:'Watercolor', emoji:'🖌️'},
  {id:'pixel',      label:'Pixel Art',  emoji:'👾'},
  {id:'fantasy',    label:'Fantasy',    emoji:'🧙'},
  {id:'realistic',  label:'Realistic',  emoji:'📸'},
  {id:'sticker',    label:'Sticker',    emoji:'⭐'},
];

const DEMO_PROMPTS = [
  'A friendly robot exploring a jungle',
  'A magical castle in the clouds',
  'A cute dragon reading a book',
  'An astronaut petting a space dog',
  'An underwater city with fish',
  'A kitten scientist in a lab',
];

interface Creation { id:string; type:'ai_image'; title:string; content:string; date:number }

const XP_KEY = 'art_studio_first_xp';

export default function ArtScreen() {
  const { addXP, addCoins } = useAppStore();
  const { activeChild }                              = useAuthStore();

  const [prompt, setPrompt]     = useState('');
  const [style, setStyle]       = useState('cartoon');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [imgUrl, setImgUrl]     = useState('');
  const [imgError, setImgError] = useState(false);
  const [saved, setSaved]       = useState(false);
  const [xpGiven, setXpGiven]   = useState(false);

  useEffect(() => {
    setXpGiven(!!localStorage.getItem(XP_KEY));
  }, []);

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true); setError(''); setImgUrl(''); setImgError(false); setSaved(false);

    try {
      const res  = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), style }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? 'Something went wrong. Please try again!'); return; }

      setImgUrl(data.url);

      // Award XP only on first-ever creation
      if (!xpGiven) {
        addXP(30); addCoins(10);
        setXpGiven(true);
        try { localStorage.setItem(XP_KEY, '1'); } catch { /* */ }
      }
    } catch {
      setError('Network error — please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function saveToCreations() {
    if (!imgUrl || saved) return;
    const creation: Creation = {
      id:      `art_${Date.now()}`,
      type:    'ai_image',
      title:   prompt.trim(),
      content: imgUrl,
      date:    Date.now(),
    };

    // Save to localStorage
    try {
      const existing: Creation[] = JSON.parse(localStorage.getItem('aka_creations') ?? '[]');
      localStorage.setItem('aka_creations', JSON.stringify([creation, ...existing]));
    } catch { /* */ }

    setSaved(true);
    addXP(10); addCoins(3);
  }

  const selectedStyle = STYLES.find(s => s.id === style)!;

  return (
    <div style={{ maxWidth:680 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#8B5CF6,#FF6B6B)', borderRadius:20, padding:22, color:'#fff', marginBottom:20 }}>
        <div style={{ fontSize:36, marginBottom:6 }}>🎨</div>
        <div style={{ fontWeight:900, fontSize:22, marginBottom:4 }}>AI Art Studio</div>
        <div style={{ fontSize:13, opacity:.85 }}>Create amazing artwork — just describe what you want!</div>
        {xpGiven && <div style={{ fontSize:11, opacity:.7, marginTop:4 }}>💡 XP awarded on first creation · Save creations to My Gallery for +10 XP each</div>}
      </div>

      {/* Style picker */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:11, color:'#6B7280', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:10 }}>Choose Art Style</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {STYLES.map(s => (
            <button key={s.id} onClick={() => setStyle(s.id)}
              style={{ padding:'8px 14px', borderRadius:99, fontWeight:700, fontSize:13, cursor:'pointer',
                background: style===s.id ? 'linear-gradient(135deg,#8B5CF6,#4F8EF7)' : '#fff',
                color: style===s.id ? '#fff' : '#374151',
                border: `2px solid ${style===s.id ? '#8B5CF6' : '#E5E7EB'}`,
                transition:'all .15s', display:'flex', alignItems:'center', gap:5 }}>
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt */}
      <div style={{ marginBottom:14 }}>
        <div style={{ fontWeight:700, fontSize:11, color:'#6B7280', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>Describe Your Art</div>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="e.g. A friendly robot exploring a magical jungle at sunset..."
          rows={3} maxLength={200}
          style={{ width:'100%', padding:'12px 14px', border:'1.5px solid #E5E7EB', borderRadius:14, fontSize:14, resize:'none', boxSizing:'border-box', fontFamily:'inherit' }}/>
        <div style={{ fontSize:11, color:'#9CA3AF', marginTop:3 }}>{prompt.length}/200</div>
      </div>

      {/* Quick prompts */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontWeight:600, fontSize:11, color:'#9CA3AF', marginBottom:7 }}>✨ Try one:</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {DEMO_PROMPTS.map(p => (
            <button key={p} onClick={() => setPrompt(p)}
              style={{ background:'#F5F7FF', border:'1px solid #E5E7EB', borderRadius:99, padding:'5px 11px', fontSize:11, fontWeight:600, cursor:'pointer', color:'#374151' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Generate */}
      <button onClick={generate} disabled={!prompt.trim() || loading}
        style={{ width:'100%', padding:14, borderRadius:14, border:'none',
          background: (!prompt.trim()||loading) ? '#E5E7EB' : 'linear-gradient(135deg,#8B5CF6,#4F8EF7)',
          color: (!prompt.trim()||loading) ? '#9CA3AF' : '#fff',
          fontWeight:900, fontSize:16, cursor:(!prompt.trim()||loading)?'default':'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:14 }}>
        {loading
          ? <><span className="aka-spinner" style={{ borderTopColor:'#fff', borderColor:'rgba(255,255,255,.3)' }}/> Creating your artwork... (10-20 sec)</>
          : `🎨 Create ${selectedStyle.emoji} ${selectedStyle.label} Art`}
      </button>

      {/* Error */}
      {error && (
        <div style={{ background:'#FFE8E8', border:'1.5px solid #FF6B6B', borderRadius:12, padding:14, marginBottom:14, fontSize:13, color:'#991B1B', fontWeight:600 }}>
          {error}
        </div>
      )}

      {/* Result */}
      {imgUrl && (
        <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:20, overflow:'hidden', marginBottom:16 }}>
          {imgError ? (
            <div style={{ height:280, background:'linear-gradient(135deg,#8B5CF6,#4F8EF7)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#fff' }}>
              <div style={{ fontSize:56, marginBottom:10 }}>🎨</div>
              <div style={{ fontWeight:800, fontSize:15 }}>"{prompt}"</div>
              <div style={{ fontSize:12, opacity:.7, marginTop:6 }}>Style: {selectedStyle.label}</div>
              <div style={{ fontSize:11, opacity:.5, marginTop:8 }}>Image still generating — try saving and checking back!</div>
            </div>
          ) : (
            <img src={imgUrl} alt={prompt} onError={() => setImgError(true)}
              style={{ width:'100%', display:'block', maxHeight:500, objectFit:'contain', background:'#F5F7FF' }}/>
          )}
          <div style={{ padding:16 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>"{prompt}"</div>
            <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>Style: {selectedStyle.emoji} {selectedStyle.label}</div>
            <button onClick={saveToCreations} disabled={saved}
              style={{ width:'100%', background:saved?'#DCFDF2':'linear-gradient(135deg,#22D3A6,#4F8EF7)', color:saved?'#065F46':'#fff',
                border:'none', borderRadius:11, padding:'11px', fontWeight:800, fontSize:14, cursor:saved?'default':'pointer' }}>
              {saved ? '✅ Saved to My Creations! (+10 XP)' : '💾 Save to My Creations (+10 XP)'}
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div style={{ background:'linear-gradient(135deg,rgba(139,92,246,.08),rgba(79,142,247,.08))', border:'1.5px solid rgba(139,92,246,.2)', borderRadius:14, padding:16, fontSize:13 }}>
        <div style={{ fontWeight:800, marginBottom:8 }}>💡 Tips for amazing art:</div>
        <ul style={{ paddingLeft:18, color:'#374151', lineHeight:1.8, margin:0 }}>
          <li>Add describing words: &quot;glowing&quot;, &quot;colourful&quot;, &quot;at sunset&quot;</li>
          <li>Include a setting: &quot;in a forest&quot;, &quot;on the moon&quot;, &quot;underwater&quot;</li>
          <li>Mention a mood: &quot;peaceful&quot;, &quot;magical&quot;, &quot;exciting&quot;</li>
          <li>Try different styles with the same prompt!</li>
        </ul>
      </div>
    </div>
  );
}
