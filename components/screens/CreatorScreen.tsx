'use client';
import { useAppStore } from '@/lib/store';
import type { ScreenId } from '@/lib/store';

// Creator Studio — directs users to the active creation tools
const TOOLS = [
  {icon:'📚', name:'Story World',  screen:'story' as ScreenId, desc:'Create your own AI-powered adventure story', color:'#4F8EF7'},
  {icon:'🎨', name:'Art Studio',   screen:'art'   as ScreenId, desc:'Generate AI artwork in 6 styles',           color:'#8B5CF6'},
  {icon:'✨', name:'Prompt Master',screen:'prompt' as ScreenId,desc:'Master the art of writing AI prompts',      color:'#FF6B6B'},
  {icon:'📝', name:'My Creations', screen:'camera' as ScreenId,desc:'View your gallery of stories and art',      color:'#22D3A6'},
];

export default function CreatorScreen() {
  const { navigate } = useAppStore();
  return (
    <div style={{ maxWidth:680 }}>
      <div style={{ background:'linear-gradient(135deg,#FF6B6B,#8B5CF6)', borderRadius:20, padding:22, color:'#fff', marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>🎬</div>
        <div style={{ fontWeight:900, fontSize:22 }}>Creator Studio</div>
        <div style={{ fontSize:13, opacity:.85 }}>All your creative tools in one place!</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {TOOLS.map(t => (
          <div key={t.screen} onClick={() => navigate(t.screen)}
            style={{ background:`linear-gradient(135deg,${t.color}22,#fff)`, border:`2px solid ${t.color}44`, borderRadius:18, padding:22, cursor:'pointer', transition:'all .2s' }}
            onMouseEnter={e=>(e.currentTarget.style.borderColor=t.color)}
            onMouseLeave={e=>(e.currentTarget.style.borderColor=t.color+'44')}>
            <div style={{ fontSize:40, marginBottom:10 }}>{t.icon}</div>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:6 }}>{t.name}</div>
            <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.5 }}>{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
