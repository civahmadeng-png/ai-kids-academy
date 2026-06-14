'use client';
// ============================================================
// AI Kids Academy — Data Layer
// Swap this implementation for Firebase/Supabase without
// changing any component code
// ============================================================

import type { User } from '@/types';

const USERS_KEY = 'aka_users';
const SESSION_KEY = 'aka_session';

function getAll(): Record<string, User> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAll(users: Record<string, User>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    console.error('localStorage write failed');
  }
}

export const DataLayer = {
  getUser(username: string): User | null {
    return getAll()[username] ?? null;
  },

  saveUser(user: User): boolean {
    try {
      const users = getAll();
      users[user.username] = user;
      saveAll(users);
      return true;
    } catch {
      return false;
    }
  },

  getSession(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(SESSION_KEY);
  },

  setSession(username: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_KEY, username);
  },

  clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
  },

  getAllUsers(): Record<string, User> {
    return getAll();
  },
};

// Default savings goals for new users
export function getDefaultSavingsGoals() {
  return [
    { name: 'New Bicycle 🚴', emoji: '🚴', target: 150, current: 0 },
    { name: 'Gaming Console 🎮', emoji: '🎮', target: 300, current: 0 },
    { name: 'Art Supplies 🎨', emoji: '🎨', target: 50, current: 0 },
  ];
}

// Create a fresh user with all defaults
export function createDefaultUser(
  username: string,
  name: string,
  password: string,
  role: 'kid' | 'parent',
  avatar: string,
  age: number | null
): User {
  return {
    username,
    name,
    password: btoa(password),
    role,
    avatar,
    age,
    xp: 0,
    coins: 50,
    gems: 5,
    streak: 0,
    level: 1,
    plan: 'free',
    activePet: 'pip',
    lessonsCompleted: [],
    completedExperiments: [],
    completedDIY: [],
    completedEng: [],
    completedDiscovery: [],
    completedSpace: [],
    completedStories: [],
    exploredCareers: [],
    completedFamilyMissions: [],
    habitsToday: [],
    habitsCompleted: 0,
    habitStreak: 0,
    savingsGoals: getDefaultSavingsGoals(),
    totalSaved: 0,
    creations: [],
    mentorChat: [],
    talentResult: null,
    unlockedHabitChars: ['🐣'],
    unlockedSaverChars: ['🥚'],
    familyXP: 0,
    lastDailyReward: 0,
    joinedAt: Date.now(),
  };
}

export function getDemoUser(): User {
  return {
    username: 'alex',
    name: 'Alex Star',
    password: btoa('1234'),
    role: 'kid',
    avatar: '🦊',
    age: 12,
    xp: 340,
    coins: 480,
    gems: 24,
    streak: 12,
    level: 7,
    plan: 'free',
    activePet: 'nova',
    lessonsCompleted: [1, 2, 3],
    completedExperiments: [],
    completedDIY: [],
    completedEng: [],
    completedDiscovery: [],
    completedSpace: [],
    completedStories: [],
    exploredCareers: [],
    completedFamilyMissions: [],
    habitsToday: ['bed', 'water', 'healthy', 'sleep', 'parents', 'room', 'teeth'],
    habitsCompleted: 63,
    habitStreak: 12,
    savingsGoals: [
      { name: 'New Bicycle 🚴', emoji: '🚴', target: 150, current: 47.5 },
      { name: 'Gaming Console 🎮', emoji: '🎮', target: 300, current: 20 },
      { name: 'Art Supplies 🎨', emoji: '🎨', target: 50, current: 50 },
    ],
    totalSaved: 47.5,
    creations: [],
    mentorChat: [],
    talentResult: null,
    unlockedHabitChars: ['🐣', '🐥', '🦊', '🦸'],
    unlockedSaverChars: ['🥚', '🐣', '🥉'],
    familyXP: 0,
    lastDailyReward: 0,
    joinedAt: Date.now() - 30 * 24 * 3600 * 1000,
  };
}
