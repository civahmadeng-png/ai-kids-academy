'use client';

// ── Sparkline (SVG path) ──────────────────────────────────────
interface SparklineProps {
  values:  number[];
  color?:  string;
  height?: number;
  width?:  number;
}

export function Sparkline({ values, color = 'var(--sky)', height = 40, width = 120 }: SparklineProps) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - (v / max) * height * 0.85 - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const areaBase = height - 1;
  const area = `M${pts[0]} L${pts.join(' L')} L${width},${areaBase} L0,${areaBase} Z`;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace(/[^a-z]/g, '')})`} />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Endpoint dot */}
      {(() => {
        const last = pts[pts.length - 1].split(',');
        return <circle cx={last[0]} cy={last[1]} r="3" fill={color} />;
      })()}
    </svg>
  );
}

// ── Radial progress ring ──────────────────────────────────────
interface RadialProps {
  score:   number;   // 0-100
  size?:   number;
  color?:  string;
  label?:  string;
}

export function RadialScore({ score, size = 80, color = 'var(--sky)', label }: RadialProps) {
  const r    = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
        {/* Progress */}
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        lineHeight: 1,
      }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 900, color: 'var(--text)' }}>{score}</span>
        {label && <span style={{ fontSize: size * 0.12, color: 'var(--text2)', marginTop: 2 }}>{label}</span>}
      </div>
    </div>
  );
}

// ── Segmented bar (activity breakdown) ───────────────────────
interface Segment { label: string; value: number; color: string; icon: string }
interface SegmentedBarProps { segments: Segment[]; total?: number }

export function SegmentedBar({ segments, total }: SegmentedBarProps) {
  const sum = total ?? segments.reduce((s, g) => s + g.value, 0);
  if (sum === 0) return (
    <div style={{ height: 12, background: 'var(--border)', borderRadius: 99, marginBottom: 8 }}>
      <div style={{ fontSize: 12, color: 'var(--text2)', padding: '14px 0 4px', textAlign: 'center' }}>No activities yet</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', height: 12, borderRadius: 99, overflow: 'hidden', marginBottom: 10, gap: 1 }}>
        {segments.filter(s => s.value > 0).map(s => (
          <div
            key={s.label}
            style={{ background: s.color, flex: s.value, transition: 'flex 0.6s ease', minWidth: 4 }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {segments.filter(s => s.value > 0).map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text2)' }}>{s.icon} {s.label}: <strong style={{ color: 'var(--text)' }}>{s.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}
