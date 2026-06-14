import React from 'react';

const LINKS = [
  { href: '/privacy',      label: 'Privacy Policy' },
  { href: '/terms',        label: 'Terms of Service' },
  { href: '/parent-guide', label: 'Parent Guide' },
  { href: '/child-safety', label: 'Child Safety' },
  { href: '/ai-safety',    label: 'AI Safety' },
  { href: '/contact',      label: 'Contact Us' },
  { href: '/delete-data',  label: 'Delete My Data' },
];

export default function LegalFooter() {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      background: '#1A1D3A', color: 'rgba(255,255,255,.6)',
      padding: '36px 28px', textAlign: 'center',
    }}>
      <div style={{ marginBottom: 18, display:'flex', justifyContent:'center', gap:6, flexWrap:'wrap' }}>
        {LINKS.map(l => (
          <a key={l.href} href={l.href} style={{
            color: 'rgba(255,255,255,.7)', textDecoration:'none',
            fontSize: 12, fontWeight:600,
            padding: '3px 10px', borderRadius:99,
            border: '1px solid rgba(255,255,255,.15)',
          }}>
            {l.label}
          </a>
        ))}
      </div>
      <div style={{ fontSize:11, lineHeight:1.7 }}>
        <div>🛡️ Designed for children · No ads · No public data sharing · COPPA & UK Children&apos;s Code compliant</div>
        <div style={{ marginTop:6 }}>© {year} AI Kids Academy. All rights reserved.</div>
      </div>
    </footer>
  );
}

/** Inline footer variant for use inside the main app (auth screens, etc.) */
export function InlineFooterLinks() {
  return (
    <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center', padding:'12px 0' }}>
      {LINKS.map(l => (
        <a key={l.href} href={l.href} target="_blank" rel="noreferrer" style={{
          color:'var(--text2)', fontSize:11, fontWeight:600, textDecoration:'none',
        }}>
          {l.label}
        </a>
      ))}
    </div>
  );
}
