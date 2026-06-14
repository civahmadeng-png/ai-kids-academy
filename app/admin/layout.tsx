import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: '🛡️ Admin · AI Kids Academy',
  description: 'Platform admin dashboard — restricted access',
  robots: 'noindex, nofollow',   // never index admin pages
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#F5F7FF' }}>
        <div style={{
          background: 'linear-gradient(135deg,#1A1D3A,#2D3367)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, color:'#fff' }}>
            <div style={{
              width:32, height:32, background:'linear-gradient(135deg,#4F8EF7,#8B5CF6)',
              borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
            }}>🛡️</div>
            <div>
              <div style={{ fontWeight:900, fontSize:14 }}>AI Kids Academy</div>
              <div style={{ fontSize:10, opacity:.7 }}>Admin Dashboard</div>
            </div>
          </div>
          <a href="/" style={{ color:'rgba(255,255,255,.7)', fontSize:12, fontWeight:600, textDecoration:'none' }}>
            ← Back to App
          </a>
        </div>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 20px' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
