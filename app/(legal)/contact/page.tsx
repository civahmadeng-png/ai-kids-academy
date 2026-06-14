import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the AI Kids Academy team.',
};

const CONTACTS = [
  {
    icon: '💬',
    title: 'General Support',
    desc: 'Questions about your account, billing, or how to use the platform.',
    email: 'support@aikidsacademy.app',
    response: 'Within 1 business day',
    color: '#4F8EF7',
  },
  {
    icon: '🛡️',
    title: 'Child Safety Concerns',
    desc: 'Report any content or behaviour that concerns you about your child\'s safety.',
    email: 'safety@aikidsacademy.app',
    response: 'Within 24 hours',
    color: '#FF6B6B',
  },
  {
    icon: '🔒',
    title: 'Privacy & Data Requests',
    desc: 'Questions about your data, GDPR requests, or data deletion.',
    email: 'privacy@aikidsacademy.app',
    response: 'Within 30 days (as required by law)',
    color: '#22D3A6',
  },
  {
    icon: '💳',
    title: 'Billing & Payments',
    desc: 'Subscription questions, refund requests, or payment issues.',
    email: 'billing@aikidsacademy.app',
    response: 'Within 1 business day',
    color: '#FFB800',
  },
  {
    icon: '⚖️',
    title: 'Legal Enquiries',
    desc: 'Legal notices, law enforcement requests, or compliance questions.',
    email: 'legal@aikidsacademy.app',
    response: 'Within 5 business days',
    color: '#8B5CF6',
  },
];

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#1A1D3A,#22D3A6)',
        borderRadius: 20, padding: '32px 28px', marginBottom: 32,
        color: '#fff', textAlign: 'center',
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>📬</div>
        <h1 style={{ fontFamily:'Nunito,sans-serif', fontSize:28, fontWeight:900, marginBottom:8 }}>Contact Us</h1>
        <p style={{ fontSize:14, opacity:.85, maxWidth:480, margin:'0 auto' }}>
          We&apos;re a small, dedicated team. We read every email and respond as quickly as we can.
        </p>
      </div>

      {/* Contact cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:36 }}>
        {CONTACTS.map(c => (
          <div key={c.email} style={{
            background:'#fff', borderRadius:16, padding:20,
            border:`1.5px solid ${c.color}33`,
            display:'flex', gap:16, alignItems:'flex-start',
          }}>
            <div style={{
              width:48, height:48, borderRadius:14,
              background:c.color+'18', display:'flex',
              alignItems:'center', justifyContent:'center',
              fontSize:22, flexShrink:0,
            }}>
              {c.icon}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:16, marginBottom:4 }}>{c.title}</div>
              <div style={{ fontSize:13, color:'#6B7280', marginBottom:10, lineHeight:1.5 }}>{c.desc}</div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
                <a
                  href={`mailto:${c.email}`}
                  style={{
                    color:'#fff', background:c.color,
                    padding:'7px 16px', borderRadius:99,
                    fontWeight:700, fontSize:13, textDecoration:'none',
                  }}
                >
                  {c.email}
                </a>
                <span style={{ fontSize:11, color:'#9CA3AF' }}>Response: {c.response}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data deletion shortcut */}
      <div style={{
        background:'linear-gradient(135deg,rgba(255,107,107,.06),rgba(139,92,246,.06))',
        border:'1.5px solid rgba(139,92,246,.2)',
        borderRadius:16, padding:22, marginBottom:24, textAlign:'center',
      }}>
        <div style={{ fontSize:32, marginBottom:8 }}>🗑️</div>
        <div style={{ fontWeight:800, fontSize:16, marginBottom:6 }}>Want to delete your data?</div>
        <div style={{ fontSize:13, color:'#6B7280', marginBottom:14 }}>
          You can submit a data deletion request directly through our secure form.
        </div>
        <a
          href="/delete-data"
          style={{
            background:'linear-gradient(135deg,#FF6B6B,#8B5CF6)',
            color:'#fff', padding:'10px 24px', borderRadius:12,
            fontWeight:800, fontSize:13, textDecoration:'none',
            display:'inline-block',
          }}
        >
          Request Data Deletion →
        </a>
      </div>

      {/* Response time note */}
      <div style={{
        background:'#fff', borderRadius:14, padding:18,
        border:'1.5px solid #E5E7EB', fontSize:13, color:'#6B7280',
        textAlign:'center', lineHeight:1.7,
      }}>
        <strong style={{color:'#1A1D3A'}}>Office hours:</strong> Monday–Friday, 9am–5pm GMT.<br/>
        We aim to respond to all safety emails within 24 hours, even on weekends.
      </div>
    </div>
  );
}
