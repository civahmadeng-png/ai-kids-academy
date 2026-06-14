'use client';
// ============================================================
// AI Kids Academy — Report Engine (Step 6)
// Derives all parent-facing metrics from ProgressStats.
// Works identically with demo data or real Supabase data.
// ============================================================

import type { ProgressStats } from '@/lib/achievement-service';

// ── Skill score (0-100) ───────────────────────────────────────
export interface SkillScores {
  stemScience:       number;
  engineering:       number;
  creativity:        number;
  aiLiteracy:        number;
  criticalThinking:  number;
  financialLiteracy: number;
  responsibility:    number;
  exploration:       number;
}

export function computeSkillScores(s: ProgressStats): SkillScores {
  return {
    stemScience:       cap(s.experiments * 9 + s.space * 7 + s.discovery * 5),
    engineering:       cap(s.engineering * 10 + s.diy * 7),
    creativity:        cap(s.stories * 12 + s.creations * 10 + s.diy * 4),
    aiLiteracy:        cap(s.lessons * 8),
    criticalThinking:  cap(s.engineering * 9 + s.experiments * 7 + s.discovery * 6),
    financialLiteracy: cap(s.savedAmount * 1.5 + s.careers * 4),
    responsibility:    cap(s.habitsTotal * 0.4 + s.streakDays * 2.5),
    exploration:       cap(s.discovery * 8 + s.space * 8 + s.careers * 6),
  };
}

function cap(n: number) { return Math.min(100, Math.round(n)); }

// ── Curiosity score ───────────────────────────────────────────
export function computeCuriosityScore(s: ProgressStats): number {
  const breadth = [
    s.lessons > 0, s.experiments > 0, s.engineering > 0,
    s.diy > 0, s.discovery > 0, s.space > 0,
    s.stories > 0, s.careers > 0,
  ].filter(Boolean).length;                        // how many areas explored
  const depth   = Math.min(s.xp / 20, 50);         // depth of engagement
  return cap(breadth * 8 + depth);
}

// ── Problem-solving score ─────────────────────────────────────
export function computeProblemSolvingScore(s: ProgressStats): number {
  return cap(
    s.engineering * 11 +
    s.experiments * 8  +
    s.diy         * 6  +
    s.discovery   * 5
  );
}

// ── Learning velocity (XP per activity) ─────────────────────
export function computeLearningVelocity(s: ProgressStats): string {
  const activities = s.lessons + s.experiments + s.engineering + s.diy + s.discovery + s.space + s.stories;
  if (activities === 0) return 'Getting started';
  const rate = s.xp / activities;
  if (rate >= 80) return 'Exceptional';
  if (rate >= 55) return 'Above average';
  if (rate >= 35) return 'Steady';
  return 'Building momentum';
}

// ── Top strengths ─────────────────────────────────────────────
export interface Strength {
  label: string;
  icon:  string;
  score: number;
  desc:  string;
}

export function computeStrengths(scores: SkillScores): Strength[] {
  const all: Strength[] = [
    { label:'STEM & Science',     icon:'🔬', score: scores.stemScience,       desc:'Experimenting and exploring scientific concepts' },
    { label:'Engineering',        icon:'⚙️', score: scores.engineering,        desc:'Building, designing, and solving structural problems' },
    { label:'Creativity',         icon:'🎨', score: scores.creativity,         desc:'Storytelling, making, and original creation' },
    { label:'AI Literacy',        icon:'🤖', score: scores.aiLiteracy,         desc:'Understanding how artificial intelligence works' },
    { label:'Critical Thinking',  icon:'🧠', score: scores.criticalThinking,   desc:'Analysing problems and testing solutions' },
    { label:'Financial Literacy', icon:'💰', score: scores.financialLiteracy,  desc:'Understanding money, saving, and planning ahead' },
    { label:'Responsibility',     icon:'💪', score: scores.responsibility,     desc:'Maintaining habits and daily commitments' },
    { label:'Exploration',        icon:'🌍', score: scores.exploration,        desc:'Discovering the world through real-world missions' },
  ];
  return all.sort((a, b) => b.score - a.score);
}

// ── Recommended next activities ───────────────────────────────
export interface Recommendation {
  icon:    string;
  title:   string;
  reason:  string;
  screen:  string;
  urgency: 'high' | 'medium' | 'low';
}

export function computeRecommendations(s: ProgressStats): Recommendation[] {
  const recs: Recommendation[] = [];

  if (s.lessons < 12 && s.lessons < 3) {
    recs.push({ icon:'🧠', title:'Start AI Explorer',          reason:'Only '+s.lessons+' of 12 lessons completed. AI literacy is a key future skill!', screen:'explorer', urgency:'high' });
  }
  if (s.experiments < 4) {
    recs.push({ icon:'🧪', title:'Try the Science Lab',        reason:'Hands-on experiments build critical thinking. Only '+s.experiments+' done!', screen:'science', urgency:'high' });
  }
  if (s.engineering < 2) {
    recs.push({ icon:'⚙️', title:'Engineering Lab Challenge',  reason:'Engineering develops problem-solving. None completed yet!', screen:'engineering', urgency:'high' });
  }
  if (s.stories < 2) {
    recs.push({ icon:'📚', title:'Create an AI Story',         reason:'Storytelling builds creativity and writing skills.', screen:'story', urgency:'medium' });
  }
  if (s.streakDays < 3) {
    recs.push({ icon:'🔥', title:'Build a daily streak',       reason:'Consistency matters more than intensity. Aim for 3 days in a row!', screen:'habits', urgency:'high' });
  }
  if (s.careers < 3) {
    recs.push({ icon:'🌟', title:'Explore Career Paths',       reason:'Only '+s.careers+' of 8 careers explored. Career curiosity starts early!', screen:'career', urgency:'medium' });
  }
  if (s.discovery < 2) {
    recs.push({ icon:'🌎', title:'Go on a Discovery Mission',  reason:'Real-world observation builds scientific curiosity.', screen:'discovery', urgency:'medium' });
  }
  if (s.space < 2) {
    recs.push({ icon:'🚀', title:'Explore Space Topics',       reason:'Space science sparks lasting curiosity about the universe.', screen:'space', urgency:'low' });
  }
  if (s.savedAmount < 10) {
    recs.push({ icon:'🐷', title:'Set a Savings Goal',         reason:'Financial habits formed at age 9-15 last a lifetime.', screen:'savings', urgency:'medium' });
  }
  if (s.familyMissions < 1) {
    recs.push({ icon:'👨‍👩‍👧', title:'Try a Family Mission',       reason:'Parent participation doubles learning retention!', screen:'family', urgency:'high' });
  }

  // Sort by urgency then cap at 5
  const order = { high: 0, medium: 1, low: 2 };
  return recs.sort((a, b) => order[a.urgency] - order[b.urgency]).slice(0, 5);
}

// ── Monthly summary ───────────────────────────────────────────
export interface MonthSummary {
  activitiesCompleted: number;
  xpEarned:           number;
  topSkill:           string;
  streakAchieved:     number;
  milestones:         string[];
  parentMessage:      string;
}

export function computeMonthSummary(s: ProgressStats, childName: string): MonthSummary {
  const total = s.lessons + s.experiments + s.diy + s.engineering + s.discovery + s.space + s.stories + s.careers;
  const scores = computeSkillScores(s);
  const strengths = computeStrengths(scores);
  const topSkill = strengths[0]?.label ?? 'Exploration';

  const milestones: string[] = [];
  if (s.lessons >= 12) milestones.push('🤖 Completed all 12 AI lessons!');
  if (s.experiments >= 8) milestones.push('🧪 Finished every science experiment!');
  if (s.engineering >= 8) milestones.push('⚙️ Mastered all engineering challenges!');
  if (s.streakDays >= 7)  milestones.push('🔥 Achieved a 7-day learning streak!');
  if (s.savedAmount >= 50) milestones.push('💰 Saved $50 — halfway to money-master!');
  if (s.stories >= 5)     milestones.push('📚 Created 5 original AI stories!');
  if (s.space >= 8)       milestones.push('🚀 Explored all 8 space topics!');

  let parentMessage = '';
  if (total === 0) {
    parentMessage = `${childName} is just getting started. Log in together and try one experiment or lesson to kick things off! The first step is the most important.`;
  } else if (s.streakDays >= 7) {
    parentMessage = `Fantastic month! ${childName} built a ${s.streakDays}-day streak and earned ${s.xp} XP. Consistency like this translates directly to academic confidence. Keep celebrating every login!`;
  } else if (total >= 10) {
    parentMessage = `Excellent engagement this month — ${total} activities completed! ${childName} is showing real curiosity across multiple subjects. Their strongest area is ${topSkill}, which suggests a natural affinity there.`;
  } else if (total >= 3) {
    parentMessage = `Good progress from ${childName} this month! They've completed ${total} activities and are building momentum. Try doing one activity together this week — parental co-engagement boosts learning retention by up to 40%.`;
  } else {
    parentMessage = `${childName} has started their journey with ${total} activities. Even small, consistent sessions of 15 minutes per day can lead to remarkable outcomes over a school term.`;
  }

  return {
    activitiesCompleted: total,
    xpEarned:    s.xp,
    topSkill,
    streakAchieved: s.streakDays,
    milestones,
    parentMessage,
  };
}

// ── Educational context (why each skill matters) ─────────────
export const SKILL_CONTEXT: Record<string, string> = {
  'STEM & Science':     'Science skills correlate strongly with academic achievement. Children who experiment at home develop hypothesis-testing mindsets that help across all subjects.',
  'Engineering':        'Engineering thinking — design, build, test, improve — is the most transferable problem-solving framework in the modern workforce.',
  'Creativity':         'Creativity is increasingly valued by employers. Storytelling and making things develop communication skills that no AI can fully replicate.',
  'AI Literacy':        'Understanding AI is as essential as understanding the internet was in the 2000s. Children who learn AI concepts now have a significant head start.',
  'Critical Thinking':  'Critical thinking predicts academic success across all subjects and is the #1 skill requested by universities and employers.',
  'Financial Literacy': 'Children who learn about money before age 12 are more likely to save, less likely to accumulate debt, and more financially secure as adults.',
  'Responsibility':     'Daily habit consistency teaches self-regulation — one of the strongest predictors of long-term life outcomes, stronger even than IQ.',
  'Exploration':        'Curiosity-driven learning produces deeper retention than instruction-led learning. Discovery missions build this habit of active inquiry.',
};
