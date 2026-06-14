// ============================================================
// AI Kids Academy — Core Types
// ============================================================

export type UserRole = 'kid' | 'parent' | 'admin';
export type SubscriptionPlan = 'free' | 'premium' | 'family';

export interface User {
  username: string;
  name: string;
  password: string; // btoa encoded (replace with proper hash in production)
  role: UserRole;
  avatar: string;
  age: number | null;
  xp: number;
  coins: number;
  gems: number;
  streak: number;
  level: number;
  plan: SubscriptionPlan;
  activePet: string;
  // Progress tracking
  lessonsCompleted: number[];
  completedExperiments: string[];
  completedDIY: string[];
  completedEng: string[];
  completedDiscovery: string[];
  completedSpace: string[];
  completedStories: StoryRecord[];
  exploredCareers: string[];
  completedFamilyMissions: string[];
  habitsToday: string[];
  habitsCompleted: number;
  habitStreak: number;
  savingsGoals: SavingsGoal[];
  totalSaved: number;
  creations: Creation[];
  mentorChat: ChatMessage[];
  talentResult: TalentResult | null;
  unlockedHabitChars: string[];
  unlockedSaverChars: string[];
  familyXP: number;
  lastDailyReward: number;
  joinedAt: number;
}

export interface StoryRecord {
  title: string;
  world: string;
  hero: string;
  date: number;
}

export interface SavingsGoal {
  name: string;
  emoji: string;
  target: number;
  current: number;
}

export interface Creation {
  id: number;
  type: string;
  reflection: string;
  imgFull: string;
  date: string;
  xp: number;
}

export interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
  typing?: boolean;
}

export interface TalentResult {
  primary: string;
  secondaries: string[];
}

export interface Achievement {
  icon: string;
  name: string;
  desc: string;
  earned: boolean;
  tier?: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
}

export interface NavScreen {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  section: string;
}
