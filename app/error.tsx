'use client';
import { useEffect } from 'react';

interface ErrorProps {
  error:  Error & { digest?: string };
  reset:  () => void;
}

export default function AppError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[AppError]', error);
  }, [error]);

  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'60px 24px', minHeight:'50vh', textAlign:'center',
    }}>
      <div style={{ maxWidth:420 }}>
        <div style={{ fontSize:52, marginBottom:12 }}>💥</div>
        <div style={{ fontWeight:900, fontSize:20, color:'var(--text)', marginBottom:8 }}>
          This screen crashed
        </div>
        <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, marginBottom:20 }}>
          Don&apos;t worry — your progress is saved. Try reloading or go back to the home screen.
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <button
            onClick={reset}
            style={{
              background:'linear-gradient(135deg,var(--sky),var(--violet))',
              color:'#fff', padding:'10px 20px', borderRadius:11,
              border:'none', fontWeight:800, fontSize:13, cursor:'pointer',
            }}
          >
            🔄 Reload Screen
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background:'var(--bg)', color:'var(--text)',
              padding:'10px 20px', borderRadius:11,
              border:'1.5px solid var(--border)',
              fontWeight:700, fontSize:13, cursor:'pointer',
            }}
          >
            🏠 Go Home
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <pre style={{
            marginTop:16, padding:12, background:'#FFF5F5',
            border:'1px solid #FCA5A5', borderRadius:8,
            fontSize:11, textAlign:'left', color:'#991B1B',
            overflow:'auto', maxHeight:160,
          }}>
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}
