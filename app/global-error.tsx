'use client';
import { useEffect } from 'react';

interface ErrorProps {
  error:  Error & { digest?: string };
  reset:  () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // In production, log to error service here (e.g. Sentry)
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin:0, fontFamily:'Nunito,sans-serif', background:'#F5F7FF' }}>
        <div style={{
          minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
          padding:24,
        }}>
          <div style={{ textAlign:'center', maxWidth:480 }}>
            <div style={{ fontSize:64, marginBottom:14 }}>⚠️</div>
            <h1 style={{ fontSize:24, fontWeight:900, color:'#1A1D3A', marginBottom:8 }}>
              Something went wrong
            </h1>
            <p style={{ fontSize:14, color:'#6B7280', lineHeight:1.6, marginBottom:24 }}>
              An unexpected error occurred. Your child&apos;s progress is safe — this is a temporary glitch.
              {error.digest && (
                <><br/><span style={{ fontSize:11, fontFamily:'monospace', opacity:.5 }}>Error: {error.digest}</span></>
              )}
            </p>
            <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
              <button
                onClick={reset}
                style={{
                  background:'linear-gradient(135deg,#4F8EF7,#8B5CF6)',
                  color:'#fff', padding:'11px 24px', borderRadius:12,
                  border:'none', fontWeight:800, fontSize:14, cursor:'pointer',
                }}
              >
                🔄 Try Again
              </button>
              <a href="/" style={{
                background:'#fff', color:'#1A1D3A',
                padding:'11px 24px', borderRadius:12,
                border:'1.5px solid #E5E7EB', fontWeight:700,
                fontSize:14, textDecoration:'none', display:'inline-block',
              }}>
                🏠 Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
