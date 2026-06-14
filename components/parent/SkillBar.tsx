'use client';
import { useState } from 'react';
import { SKILL_CONTEXT } from '@/lib/report-engine';

interface Props {
  label:   string;
  icon:    string;
  score:   number;     // 0-100
  color?:  string;
  context?: string;
}

const LEVEL_LABEL = (n: number) =>
  n >= 80 ? 'Excellent' : n >= 55 ? 'Good' : n >= 30 ? 'Developing' : 'Just starting';

const LEVEL_COLOR = (n: number) =>
  n >= 80 ? 'var(--mint)' : n >= 55 ? 'var(--sky)' : n >= 30 ? 'var(--sun)' : 'var(--coral)';

export default function SkillBar({ label, icon, score, color, context }: Props) {
  const [expanded, setExpanded] = useState(false);
  const barColor = color ?? LEVEL_COLOR(score);
  const ctx      = context ?? SKILL_CONTEXT[label] ?? '';

  return (
    <div
      className="pd-skill-row"
      onClick={() => ctx && setExpanded(e => !e)}
      style={{ cursor: ctx ? 'pointer' : 'default' }}
    >
      <div className="pd-skill-header">
        <div className="pd-skill-label">
          <span className="pd-skill-icon">{icon}</span>
          <span>{label}</span>
        </div>
        <div className="pd-skill-right">
          <span className="pd-skill-level" style={{ color: barColor }}>{LEVEL_LABEL(score)}</span>
          <span className="pd-skill-pct">{score}%</span>
          {ctx && <span className="pd-expand-btn">{expanded ? '▲' : '▼'}</span>}
        </div>
      </div>

      <div className="pd-skill-track">
        <div
          className="pd-skill-fill"
          style={{ width: `${score}%`, background: barColor }}
        />
      </div>

      {expanded && ctx && (
        <div className="pd-skill-context">{ctx}</div>
      )}
    </div>
  );
}
