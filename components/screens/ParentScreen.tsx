'use client';
import { useState } from 'react';
import { useProgress }          from '@/hooks/useProgress';
import { useAuthStore }         from '@/lib/auth-store';
import { useAppStore }          from '@/lib/store';
import {
  computeSkillScores, computeStrengths,
  computeCuriosityScore, computeProblemSolvingScore,
  computeLearningVelocity, computeRecommendations,
  computeMonthSummary,
} from '@/lib/report-engine';
import SkillBar              from '@/components/parent/SkillBar';
import InsightCard           from '@/components/parent/InsightCard';
import MonthlySummaryCard    from '@/components/parent/MonthlySummaryCard';
import RecommendationsPanel  from '@/components/parent/RecommendationsPanel';
import { RadialScore, SegmentedBar } from '@/components/parent/MiniChart';

type TabId = 'overview' | 'skills' | 'monthly' | 'recommendations';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id:'overview',        label:'Overview',        icon:'📊' },
  { id:'skills',          label:'Skills Report',   icon:'🎯' },
  { id:'monthly',         label:'Monthly Report',  icon:'📋' },
  { id:'recommendations', label:'Next Steps',      icon:'🚀' },
];

export default function ParentScreen() {
  const [tab, setTab]       = useState<TabId>('overview');
  const { stats, isLoaded } = useProgress();
  const { activeChild }     = useAuthStore();
  const { currentUser }     = useAppStore();

  const childName   = activeChild?.displayName ?? 'Your child';
  const childAvatar = activeChild?.avatar      ?? '🦊';

  const scores    = computeSkillScores(stats);
  const strengths = computeStrengths(scores);
  const curiosity = computeCuriosityScore(stats);
  const probSolve = computeProblemSolvingScore(stats);
  const velocity  = computeLearningVelocity(stats);
  const recs      = computeRecommendations(stats);
  const monthly   = computeMonthSummary(stats, childName);

  const totalActivities =
    stats.lessons + stats.experiments + stats.diy +
    stats.engineering + stats.discovery + stats.space +
    stats.stories + stats.careers;

  return (
    <div className="pd-wrap">
      {/* ── Hero ───────────────────────────────────────────── */}
      <div className="pd-hero">
        <div className="pd-hero-left">
          <div className="pd-hero-avatar">{childAvatar}</div>
          <div>
            <div className="pd-hero-eyebrow">Parent Dashboard</div>
            <div className="pd-hero-name">{childName}&apos;s Learning Report</div>
            <div className="pd-hero-sub">
              {isLoaded
                ? `${totalActivities} activities completed · ${stats.xp} XP earned · ${stats.streakDays}-day streak`
                : 'Loading progress data...'}
            </div>
          </div>
        </div>
        <div className="pd-hero-scores">
          <RadialScore score={curiosity}  color="#4F8EF7" label="Curiosity"  size={72} />
          <RadialScore score={probSolve}  color="#22D3A6" label="Problem-Solving" size={72} />
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="pd-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`pd-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Overview tab ───────────────────────────────────── */}
      {tab === 'overview' && (
        <div>
          {/* KPI cards */}
          <div className="pd-insight-grid">
            <InsightCard icon="⭐" title="Total XP"           value={stats.xp}            sub="Experience points earned"          color="var(--sky)"    badge={stats.xp>=1000?'1K+ Club':''}/>
            <InsightCard icon="🔥" title="Day Streak"         value={`${stats.streakDays} days`} sub={stats.streakDays>=7?'Amazing consistency!':'Keep going!'} color="var(--coral)" badge={stats.streakDays>=7?'🔥 Hot':''}/>
            <InsightCard icon="📚" title="Activities Done"    value={totalActivities}     sub="Across all modules"               color="var(--violet)" />
            <InsightCard icon="💰" title="Savings"            value={`$${stats.savedAmount.toFixed(0)}`} sub="Financial literacy in action" color="var(--mint)" badge={stats.savedAmount>=50?'$50+':''}/>
            <InsightCard icon="🧪" title="Science Experiments" value={`${stats.experiments}/8`} sub="Lab experiments completed"     color="var(--mint)"  />
            <InsightCard icon="⚙️" title="Engineering"        value={`${stats.engineering}/8`} sub="STEM challenges completed"     color="var(--sun)"   />
            <InsightCard icon="🧠" title="AI Lessons"         value={`${stats.lessons}/12`}   sub="AI literacy progress"           color="var(--sky)"   />
            <InsightCard icon="📖" title="Stories Created"    value={stats.stories}       sub="Creative writing & storytelling"  color="var(--violet)"  />
          </div>

          {/* Activity breakdown */}
          <div className="pd-card" style={{ marginBottom: 18 }}>
            <div className="pd-card-title">📊 Activity Breakdown</div>
            <div style={{ marginBottom: 4, fontSize: 12, color: 'var(--text2)' }}>{totalActivities} total activities across all modules</div>
            <SegmentedBar segments={[
              { label:'AI Lessons',  value:stats.lessons,     color:'#4F8EF7', icon:'🧠' },
              { label:'Science',     value:stats.experiments,  color:'#22D3A6', icon:'🧪' },
              { label:'Engineering', value:stats.engineering,  color:'#FFB800', icon:'⚙️' },
              { label:'DIY',         value:stats.diy,          color:'#FF6B6B', icon:'🔨' },
              { label:'Discovery',   value:stats.discovery,    color:'#8B5CF6', icon:'🌎' },
              { label:'Space',       value:stats.space,        color:'#1A1D3A', icon:'🚀' },
              { label:'Stories',     value:stats.stories,      color:'#FF6B6B', icon:'📚' },
              { label:'Careers',     value:stats.careers,      color:'#22D3A6', icon:'🌟' },
            ]}/>
          </div>

          {/* Top 3 strengths */}
          <div className="pd-card" style={{ marginBottom: 18 }}>
            <div className="pd-card-title">🌟 Top Strengths</div>
            <div className="pd-strength-grid">
              {strengths.slice(0, 3).map((s, i) => (
                <div key={s.label} className="pd-strength-card">
                  <div className="pd-strength-rank">#{i + 1}</div>
                  <div className="pd-strength-icon">{s.icon}</div>
                  <div className="pd-strength-label">{s.label}</div>
                  <div className="pd-strength-score" style={{ color: i===0?'var(--sun)':i===1?'var(--sky)':'var(--mint)' }}>{s.score}%</div>
                  <div className="pd-strength-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning velocity */}
          <div className="pd-card pd-velocity-row">
            <div>
              <div className="pd-card-title" style={{ marginBottom: 4 }}>⚡ Learning Pace</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>How efficiently {childName.split(' ')[0]} earns XP per activity</div>
            </div>
            <div className="pd-velocity-badge">{velocity}</div>
          </div>

          {/* Educational value note */}
          <div className="pd-edu-note">
            <div className="pd-edu-icon">💡</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4 }}>Why this matters</div>
              <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text2)' }}>
                Research shows children who engage with STEM activities at home are <strong>2.4× more likely</strong> to pursue STEM careers.
                Consistency (streaks) predicts academic success more reliably than raw ability.
                Every completed activity builds neural pathways for the skills they will use for life.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Skills tab ─────────────────────────────────────── */}
      {tab === 'skills' && (
        <div>
          <div className="pd-card" style={{ marginBottom: 18 }}>
            <div className="pd-card-title">🎯 Skill Development Report</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
              Tap any skill to see why it matters for {childName.split(' ')[0]}&apos;s future.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <SkillBar label="STEM & Science"      icon="🔬" score={scores.stemScience}       color="var(--mint)"   />
              <SkillBar label="Engineering"          icon="⚙️" score={scores.engineering}        color="var(--sun)"    />
              <SkillBar label="Creativity"           icon="🎨" score={scores.creativity}         color="var(--violet)" />
              <SkillBar label="AI Literacy"          icon="🤖" score={scores.aiLiteracy}         color="var(--sky)"    />
              <SkillBar label="Critical Thinking"    icon="🧠" score={scores.criticalThinking}   color="var(--sky)"    />
              <SkillBar label="Financial Literacy"   icon="💰" score={scores.financialLiteracy}  color="var(--mint)"   />
              <SkillBar label="Responsibility"       icon="💪" score={scores.responsibility}     color="var(--coral)"  />
              <SkillBar label="Exploration"          icon="🌍" score={scores.exploration}        color="var(--violet)" />
            </div>
          </div>

          {/* Score explanation */}
          <div className="pd-card pd-score-guide">
            <div className="pd-card-title">How scores are calculated</div>
            <div className="pd-score-row"><div className="pd-score-dot" style={{background:'var(--mint)'}}/><span><strong>Excellent (80-100%):</strong> Consistent, deep engagement in this area</span></div>
            <div className="pd-score-row"><div className="pd-score-dot" style={{background:'var(--sky)'}}/><span><strong>Good (55-79%):</strong> Regular activity with growing confidence</span></div>
            <div className="pd-score-row"><div className="pd-score-dot" style={{background:'var(--sun)'}}/><span><strong>Developing (30-54%):</strong> Beginning to explore — great potential</span></div>
            <div className="pd-score-row"><div className="pd-score-dot" style={{background:'var(--coral)'}}/><span><strong>Just starting (0-29%):</strong> This area hasn&apos;t been explored yet</span></div>
          </div>

          {/* Improvement opportunities */}
          {strengths.filter(s => s.score < 30).length > 0 && (
            <div className="pd-card" style={{ marginTop: 18 }}>
              <div className="pd-card-title">📈 Growth Opportunities</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
                These areas have the most room to grow — a few activities here will show rapid improvement:
              </div>
              {strengths.filter(s => s.score < 30).slice(0, 3).map(s => (
                <div key={s.label} className="pd-opportunity-row">
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{s.desc}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--coral)', marginLeft: 'auto', flexShrink: 0 }}>{s.score}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Monthly tab ────────────────────────────────────── */}
      {tab === 'monthly' && (
        <MonthlySummaryCard
          summary={monthly}
          stats={stats}
          childName={childName}
          childAvatar={childAvatar}
        />
      )}

      {/* ── Recommendations tab ────────────────────────────── */}
      {tab === 'recommendations' && (
        <div>
          <div className="pd-card" style={{ marginBottom: 18 }}>
            <div className="pd-card-title">🚀 Recommended Next Activities</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>
              Personalised suggestions based on {childName.split(' ')[0]}&apos;s activity history and skill gaps:
            </div>
            <RecommendationsPanel recs={recs} />
          </div>

          {/* Family involvement */}
          <div className="pd-family-tip">
            <div style={{ fontSize: 28, flexShrink: 0 }}>👨‍👩‍👧</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Boost results with family involvement</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
                Studies show children whose parents engage with their learning show <strong>40% better retention</strong>.
                Try the Family Missions together this weekend — even 20 minutes makes a measurable difference!
              </div>
              <button
                className="pd-family-btn"
                onClick={() => useAppStore.getState().navigate('family')}
              >
                View Family Missions →
              </button>
            </div>
          </div>

          {/* Upgrade CTA for free plan */}
          {(currentUser?.plan ?? 'free') === 'free' && (
            <div className="pd-upgrade-card">
              <div style={{ fontSize: 32, marginBottom: 10 }}>⭐</div>
              <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>Unlock Full Reports with Premium</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.6 }}>
                Premium parents get weekly email reports, detailed learning time tracking,
                and full skill breakdowns they can share with teachers.
              </div>
              <button
                className="pd-upgrade-btn"
                onClick={() => useAppStore.getState().navigate('upgrade')}
              >
                Upgrade to Premium →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
