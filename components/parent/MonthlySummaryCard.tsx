'use client';
import type { MonthSummary } from '@/lib/report-engine';
import { RadialScore, SegmentedBar } from './MiniChart';
import type { ProgressStats } from '@/lib/achievement-service';

interface Props {
  summary:    MonthSummary;
  stats:      ProgressStats;
  childName:  string;
  childAvatar: string;
}

export default function MonthlySummaryCard({ summary, stats, childName, childAvatar }: Props) {
  const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const segments = [
    { label:'AI Lessons',   value: stats.lessons,     color:'#4F8EF7', icon:'🧠' },
    { label:'Science',      value: stats.experiments,  color:'#22D3A6', icon:'🧪' },
    { label:'Engineering',  value: stats.engineering,  color:'#FFB800', icon:'⚙️' },
    { label:'DIY',          value: stats.diy,          color:'#FF6B6B', icon:'🔨' },
    { label:'Discovery',    value: stats.discovery,    color:'#8B5CF6', icon:'🌎' },
    { label:'Space',        value: stats.space,        color:'#0f0c29', icon:'🚀' },
    { label:'Stories',      value: stats.stories,      color:'#FF6B6B', icon:'📚' },
    { label:'Careers',      value: stats.careers,      color:'#22D3A6', icon:'🌟' },
  ];

  const curiosity = Math.min(100, Math.round(
    [stats.lessons>0, stats.experiments>0, stats.engineering>0, stats.space>0,
     stats.stories>0, stats.discovery>0, stats.careers>0].filter(Boolean).length * 14
  ));

  return (
    <div className="pd-monthly-card" id="monthly-report">
      {/* Header */}
      <div className="pd-monthly-header">
        <div className="pd-monthly-meta">
          <div className="pd-monthly-avatar">{childAvatar}</div>
          <div>
            <div className="pd-monthly-name">{childName}</div>
            <div className="pd-monthly-period">Learning Report · {month}</div>
          </div>
        </div>
        <button
          className="pd-print-btn"
          onClick={() => window.print()}
          title="Print or save as PDF"
        >
          🖨️ Print Report
        </button>
      </div>

      {/* Top metrics row */}
      <div className="pd-monthly-metrics">
        <div className="pd-mm-cell">
          <RadialScore score={curiosity} color="#4F8EF7" label="Curiosity" size={76} />
          <div className="pd-mm-label">Curiosity<br/>Score</div>
        </div>
        <div className="pd-mm-cell">
          <RadialScore score={Math.min(100, stats.streakDays * 3)} color="#FF6B6B" label="Streak" size={76} />
          <div className="pd-mm-label">Consistency<br/>Score</div>
        </div>
        <div className="pd-mm-cell">
          <div className="pd-mm-big-num" style={{ color:'#FFB800' }}>{summary.activitiesCompleted}</div>
          <div className="pd-mm-label">Activities<br/>Completed</div>
        </div>
        <div className="pd-mm-cell">
          <div className="pd-mm-big-num" style={{ color:'#22D3A6' }}>{stats.xp}</div>
          <div className="pd-mm-label">Total XP<br/>Earned</div>
        </div>
        <div className="pd-mm-cell">
          <div className="pd-mm-big-num" style={{ color:'#8B5CF6' }}>{stats.streakDays}</div>
          <div className="pd-mm-label">Day<br/>Streak</div>
        </div>
      </div>

      {/* Activity breakdown */}
      <div className="pd-monthly-section">
        <div className="pd-ms-title">Activity Breakdown</div>
        <SegmentedBar segments={segments} />
      </div>

      {/* Milestones */}
      {summary.milestones.length > 0 && (
        <div className="pd-monthly-section">
          <div className="pd-ms-title">🏆 Milestones This Month</div>
          <div className="pd-milestones">
            {summary.milestones.map(m => (
              <div key={m} className="pd-milestone-chip">{m}</div>
            ))}
          </div>
        </div>
      )}

      {/* Top skill */}
      <div className="pd-monthly-section">
        <div className="pd-ms-title">⭐ Strongest Subject</div>
        <div className="pd-top-skill">
          <span style={{ fontSize: 32 }}>
            {summary.topSkill === 'STEM & Science' ? '🔬'
              : summary.topSkill === 'Engineering'    ? '⚙️'
              : summary.topSkill === 'Creativity'     ? '🎨'
              : summary.topSkill === 'AI Literacy'    ? '🤖'
              : summary.topSkill === 'Exploration'    ? '🌍'
              : '🌟'}
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{summary.topSkill}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
              This is where {childName.split(' ')[0]} shows the most natural engagement and depth of exploration.
            </div>
          </div>
        </div>
      </div>

      {/* Parent message */}
      <div className="pd-parent-msg">
        <div className="pd-ms-title">📝 Your Monthly Summary</div>
        <p>{summary.parentMessage}</p>
      </div>

      {/* Savings */}
      {stats.savedAmount > 0 && (
        <div className="pd-monthly-section pd-savings-row">
          <span>💰 Savings Progress:</span>
          <strong>${stats.savedAmount.toFixed(2)} saved</strong>
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>Financial literacy starts with small habits!</span>
        </div>
      )}

      {/* Footer */}
      <div className="pd-monthly-footer">
        <div>Generated by AI Kids Academy · {new Date().toLocaleDateString()}</div>
        <div>🔒 Your data is private and secure</div>
      </div>
    </div>
  );
}
