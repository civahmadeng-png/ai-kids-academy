'use client';
import type { Metadata } from 'next';

export default function OfflinePage() {
  return (
    <div style={{ margin:0, background:'linear-gradient(135deg,#1A1D3A,#2D3367)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Nunito,sans-serif' }}>
      <div style={{ textAlign:'center', color:'#fff', padding:32, maxWidth:440 }}>
        <div style={{ fontSize:80, marginBottom:16 }}>📡</div>
        <h1 style={{ fontSize:28, fontWeight:900, marginBottom:10 }}>You&apos;re offline</h1>
        <p style={{ fontSize:15, opacity:.85, lineHeight:1.7, marginBottom:28 }}>
          No internet connection right now. Demo mode and already-loaded lessons still work!
          Connect to Wi-Fi to sync your progress.
        </p>
        <div style={{ background:'rgba(255,255,255,.1)', borderRadius:16, padding:20, marginBottom:24, textAlign:'left' }}>
          <div style={{ fontWeight:800, marginBottom:10 }}>What works offline:</div>
          <div style={{ fontSize:13, opacity:.85, lineHeight:1.8 }}>
            ✅ Demo mode learning<br/>
            ✅ Cached lesson content<br/>
            ✅ Science Lab guides<br/>
            ❌ AI Mentor (needs internet)<br/>
            ❌ Progress sync
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{ background:'linear-gradient(135deg,#4F8EF7,#8B5CF6)', color:'#fff', border:'none', padding:'13px 28px', borderRadius:14, fontWeight:800, fontSize:15, cursor:'pointer' }}
        >
          🔄 Try again
        </button>
      </div>
    </div>
  );
}
