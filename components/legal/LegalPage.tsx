'use client';
import React from 'react';

interface Section { heading: string; body: React.ReactNode }

interface LegalPageProps {
  badge:     string;
  title:     string;
  subtitle:  string;
  updated:   string;
  sections:  Section[];
  /** Accent colour for the badge/hero */
  color?:    string;
}

export default function LegalPage({
  badge, title, subtitle, updated, sections, color = '#4F8EF7',
}: LegalPageProps) {
  return (
    <article>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg,#1A1D3A,${color})`,
        borderRadius: 20, padding: '32px 28px', marginBottom: 32,
        color: '#fff', textAlign: 'center',
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>{badge}</div>
        <h1 style={{ fontFamily:'Nunito,sans-serif', fontSize:28, fontWeight:900, marginBottom:8 }}>{title}</h1>
        <p style={{ fontSize:14, opacity:.85, lineHeight:1.6, maxWidth:520, margin:'0 auto 12px' }}>{subtitle}</p>
        <div style={{
          display:'inline-block', background:'rgba(255,255,255,.15)',
          borderRadius:99, padding:'4px 14px', fontSize:11, fontWeight:700,
        }}>
          Last updated: {updated}
        </div>
      </div>

      {/* Sections */}
      {sections.map((s, i) => (
        <section key={i} style={{ marginBottom: 36 }}>
          <h2 style={{
            fontFamily:'Nunito,sans-serif', fontSize:18, fontWeight:800,
            color:'#1A1D3A', marginBottom:12,
            display:'flex', alignItems:'center', gap:8,
          }}>
            <span style={{
              width:28, height:28, background:color+'1A', color,
              borderRadius:8, display:'inline-flex', alignItems:'center',
              justifyContent:'center', fontSize:13, fontWeight:900, flexShrink:0,
            }}>{i+1}</span>
            {s.heading}
          </h2>
          <div style={{
            fontSize:14, lineHeight:1.85, color:'#374151',
            background:'#fff', borderRadius:14, padding:22,
            border:'1.5px solid #E5E7EB',
          }}>
            {s.body}
          </div>
        </section>
      ))}
    </article>
  );
}

/** Reusable styled list */
export function LegalList({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft:20, marginTop:6 }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom:6 }}>{item}</li>
      ))}
    </ul>
  );
}

/** Highlighted callout box */
export function LegalCallout({ children, color='#4F8EF7' }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      background:color+'0F', border:`1.5px solid ${color}33`,
      borderRadius:12, padding:'14px 18px', margin:'14px 0',
      fontSize:13, lineHeight:1.7,
    }}>
      {children}
    </div>
  );
}

/** Contact mailto link */
export function LegalEmail({ email }: { email: string }) {
  return <a href={`mailto:${email}`} style={{ color:'#4F8EF7', fontWeight:700 }}>{email}</a>;
}
