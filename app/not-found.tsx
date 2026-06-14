import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '404 — Page Not Found · AI Kids Academy' };

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#1A1D3A,#2D3367,#4F8EF7)',
      fontFamily:'Nunito,sans-serif', padding:24,
    }}>
      <div style={{ textAlign:'center', color:'#fff', maxWidth:480 }}>
        <div style={{ fontSize:80, marginBottom:16 }}>🚀</div>
        <div style={{ fontSize:72, fontWeight:900, lineHeight:1, marginBottom:8, opacity:.3 }}>404</div>
        <h1 style={{ fontSize:26, fontWeight:900, marginBottom:10 }}>
          This page drifted into deep space!
        </h1>
        <p style={{ fontSize:15, opacity:.8, lineHeight:1.6, marginBottom:28 }}>
          Even the best explorers get lost sometimes. Let&apos;s get you back to your learning world.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/" style={{
            background:'#fff', color:'#1A1D3A',
            padding:'12px 26px', borderRadius:14, fontWeight:800,
            fontSize:14, textDecoration:'none', display:'inline-block',
          }}>
            🏠 Back to Home
          </Link>
          <Link href="/contact" style={{
            background:'rgba(255,255,255,.15)', color:'#fff',
            padding:'12px 26px', borderRadius:14, fontWeight:700,
            fontSize:14, textDecoration:'none', border:'1.5px solid rgba(255,255,255,.3)',
            display:'inline-block',
          }}>
            Get Help
          </Link>
        </div>
        <div style={{ marginTop:24, fontSize:12, opacity:.5 }}>
          AI Kids Academy · Safe learning for ages 9–15
        </div>
      </div>
    </div>
  );
}
