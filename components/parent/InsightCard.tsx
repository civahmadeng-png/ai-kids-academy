'use client';

interface Props {
  icon:      string;
  title:     string;
  value:     string | number;
  sub?:      string;
  color?:    string;
  bg?:       string;
  tooltip?:  string;
  badge?:    string;
}

export default function InsightCard({ icon, title, value, sub, color = 'var(--sky)', bg, tooltip, badge }: Props) {
  return (
    <div
      className="pd-insight-card"
      style={{ background: bg ?? 'var(--card)', borderColor: color + '33' }}
      title={tooltip}
    >
      <div className="pd-ic-icon" style={{ background: color + '18', color }}>
        {icon}
      </div>
      <div className="pd-ic-body">
        <div className="pd-ic-title">{title}</div>
        <div className="pd-ic-value" style={{ color }}>{value}</div>
        {sub && <div className="pd-ic-sub">{sub}</div>}
      </div>
      {badge && (
        <div className="pd-ic-badge" style={{ background: color + '18', color }}>{badge}</div>
      )}
    </div>
  );
}
