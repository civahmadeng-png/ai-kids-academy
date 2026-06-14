import type { Metadata } from 'next';
import '../globals.css';
import LegalFooter from '@/components/legal/LegalFooter';

export const metadata: Metadata = {
  title: { template: '%s · AI Kids Academy', default: 'Legal · AI Kids Academy' },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#F5F7FF', minHeight: '100vh' }}>

        {/* Top nav */}
        <nav style={{
          background: 'linear-gradient(135deg,#1A1D3A,#2D3367)',
          padding: '12px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <a href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <div style={{
              width:34, height:34, borderRadius:10,
              background:'linear-gradient(135deg,#4F8EF7,#8B5CF6)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
            }}>🚀</div>
            <div style={{ color:'#fff' }}>
              <div style={{ fontWeight:900, fontSize:15, fontFamily:'Nunito,sans-serif' }}>AI Kids Academy</div>
              <div style={{ fontSize:10, opacity:.7 }}>Safe Learning for Ages 9-15</div>
            </div>
          </a>
          <a href="/" style={{
            color:'rgba(255,255,255,.8)', fontSize:12, fontWeight:700,
            textDecoration:'none', background:'rgba(255,255,255,.12)',
            padding:'6px 14px', borderRadius:8,
          }}>
            ← Back to App
          </a>
        </nav>

        {/* Content */}
        <main style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px 60px' }}>
          {children}
        </main>

        <LegalFooter />
      </body>
    </html>
  );
}
