'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';

interface Creation {
  id:          string;
  type:        'ai_image' | 'story' | 'diy' | 'note';
  title:       string;
  content:     string;   // URL for image, text for story/note
  reflection?: string;
  date:        number;
}

export default function CameraScreen() {
  const { currentUser, addXP, addCoins, updateUser } = useAppStore();
  const [creations, setCreations] = useState<Creation[]>([]);
  const [viewing, setViewing]     = useState<Creation | null>(null);
  const [addNote, setAddNote]     = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText]   = useState('');

  useEffect(() => {
    // Load from localStorage (primary) and completedStories (for stories)
    const local: Creation[] = [];
    try {
      const raw = JSON.parse(localStorage.getItem('aka_creations') ?? '[]');
      local.push(...raw);
    } catch { /* */ }

    // Merge stories from completedStories
    const stories: Creation[] = (currentUser?.completedStories ?? []).map(s => ({
      id:      `story_${s.date}`,
      type:    'story' as const,
      title:   s.title,
      content: `A ${s.hero} adventure in ${s.world}`,
      date:    s.date,
    }));

    const all = [...stories, ...local].filter((c,i,a) => a.findIndex(x=>x.id===c.id)===i)
      .sort((a,b) => b.date - a.date);
    setCreations(all);
  }, [currentUser]);

  function saveNote() {
    if (!noteTitle.trim() || !noteText.trim()) return;
    const creation: Creation = {
      id:      `note_${Date.now()}`,
      type:    'note',
      title:   noteTitle.trim(),
      content: noteText.trim(),
      date:    Date.now(),
    };
    const next = [creation, ...creations];
    setCreations(next);
    try {
      const existing: Creation[] = JSON.parse(localStorage.getItem('aka_creations') ?? '[]');
      localStorage.setItem('aka_creations', JSON.stringify([creation, ...existing]));
    } catch { /* */ }
    setNoteTitle(''); setNoteText(''); setAddNote(false);
    // Award XP for adding a creation (max 5 times to prevent farming)
    try {
      const noteCount = parseInt(localStorage.getItem('camera_note_count') ?? '0', 10);
      if (noteCount < 5) {
        addXP(10); addCoins(3);
        localStorage.setItem('camera_note_count', String(noteCount + 1));
      }
    } catch { /* localStorage unavailable — skip XP to prevent farming */ }
  }

  const TYPE_ICONS: Record<string,string> = { ai_image:'🎨', story:'📚', diy:'🔨', note:'📝' };
  const TYPE_COLORS: Record<string,string> = { ai_image:'#8B5CF6', story:'#4F8EF7', diy:'#FFB800', note:'#22D3A6' };

  return (
    <div style={{ maxWidth:720 }}>
      <div style={{ background:'linear-gradient(135deg,#FF6B6B,#8B5CF6)', borderRadius:20, padding:22, color:'#fff', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
        <div>
          <div style={{ fontSize:40, marginBottom:6 }}>📸</div>
          <div style={{ fontWeight:900, fontSize:22 }}>My Creations</div>
          <div style={{ fontSize:13, opacity:.85 }}>Your stories, art, and projects</div>
        </div>
        <button onClick={() => setAddNote(true)}
          style={{ background:'rgba(255,255,255,.2)', color:'#fff', border:'1.5px solid rgba(255,255,255,.4)', borderRadius:12, padding:'10px 16px', fontWeight:700, fontSize:13, cursor:'pointer', flexShrink:0 }}>
          + Add Note
        </button>
      </div>

      {addNote && (
        <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:20, marginBottom:16 }}>
          <div style={{ fontWeight:800, fontSize:14, marginBottom:12 }}>📝 Add a Note or Reflection</div>
          <input value={noteTitle} onChange={e=>setNoteTitle(e.target.value)} placeholder="Title"
            style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #E5E7EB', borderRadius:11, fontSize:14, marginBottom:10, boxSizing:'border-box' }}/>
          <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Write your thought, reflection, or creative idea..." rows={4}
            style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #E5E7EB', borderRadius:11, fontSize:14, resize:'vertical', boxSizing:'border-box', fontFamily:'inherit', marginBottom:10 }}/>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={saveNote} disabled={!noteTitle.trim()||!noteText.trim()}
              style={{ flex:1, background:'linear-gradient(135deg,#FF6B6B,#8B5CF6)', color:'#fff', border:'none', borderRadius:11, padding:11, fontWeight:800, cursor:'pointer' }}>
              💾 Save
            </button>
            <button onClick={() => setAddNote(false)}
              style={{ background:'#F5F7FF', border:'1.5px solid #E5E7EB', borderRadius:11, padding:'11px 16px', fontWeight:700, cursor:'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {creations.length === 0 ? (
        <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:18, padding:40, textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🎨</div>
          <div style={{ fontWeight:800, fontSize:16, marginBottom:8 }}>No creations yet!</div>
          <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.6 }}>
            Complete stories, create AI art, or finish DIY projects to see them here.<br/>You can also add notes and reflections using the button above!
          </div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
          {creations.map(c => (
            <div key={c.id} onClick={() => setViewing(c)}
              style={{ background:'#fff', border:`2px solid ${TYPE_COLORS[c.type]}33`, borderRadius:16, overflow:'hidden', cursor:'pointer', transition:'all .2s' }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor=TYPE_COLORS[c.type])}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=TYPE_COLORS[c.type]+'33')}>
              {c.type === 'ai_image' ? (
                <img src={c.content} alt={c.title} style={{ width:'100%', height:140, objectFit:'cover' }} onError={e=>(e.currentTarget.style.display='none')}/>
              ) : (
                <div style={{ height:100, background:`linear-gradient(135deg,${TYPE_COLORS[c.type]}22,#fff)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:44 }}>
                  {TYPE_ICONS[c.type]}
                </div>
              )}
              <div style={{ padding:12 }}>
                <div style={{ fontWeight:800, fontSize:13, marginBottom:2 }}>{c.title}</div>
                <div style={{ fontSize:11, color:'#6B7280' }}>{new Date(c.date).toLocaleDateString()}</div>
                <div style={{ fontSize:11, color:TYPE_COLORS[c.type], fontWeight:700, marginTop:4, textTransform:'capitalize' }}>{TYPE_ICONS[c.type]} {c.type.replace('_',' ')}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={() => setViewing(null)}>
          <div style={{ background:'#fff', borderRadius:20, padding:24, maxWidth:500, width:'100%', maxHeight:'80vh', overflow:'auto' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontWeight:900, fontSize:18 }}>{viewing.title}</div>
              <button onClick={()=>setViewing(null)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer' }}>✕</button>
            </div>
            {viewing.type === 'ai_image' && <img src={viewing.content} alt={viewing.title} style={{ width:'100%', borderRadius:12, marginBottom:12 }}/>}
            <div style={{ fontSize:14, lineHeight:1.7, color:'#374151', whiteSpace:'pre-wrap' }}>{viewing.type!=='ai_image'?viewing.content:''}</div>
            {viewing.reflection && <div style={{ marginTop:12, background:'#F5F7FF', borderRadius:12, padding:12, fontSize:13, color:'#6B7280' }}>💭 {viewing.reflection}</div>}
            <div style={{ fontSize:11, color:'#9CA3AF', marginTop:12 }}>{new Date(viewing.date).toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
          </div>
        </div>
      )}
    </div>
  );
}
