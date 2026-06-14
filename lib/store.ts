'use client';
import { create } from 'zustand';
import type { User } from '@/types';
import { DataLayer, getDemoUser, createDefaultUser } from '@/lib/data-layer';
import { scheduleSyncProfile } from '@/lib/progress-service';
import { Analytics } from '@/lib/analytics';

export type ScreenId =
  | 'home' | 'map' | 'mentor' | 'explorer' | 'prompt' | 'art'
  | 'weekly' | 'space' | 'engineering' | 'discovery' | 'creator'
  | 'journeys' | 'pet' | 'science' | 'diy' | 'talent' | 'camera'
  | 'habits' | 'savings' | 'achievements' | 'parent'
  | 'story' | 'career' | 'city' | 'family' | 'upgrade';

interface AppState {
  // Auth
  currentUser: User | null;
  isLoading: boolean;
  authError: string;

  // Navigation
  currentScreen: ScreenId;

  // Modal
  modal: { show: boolean; emoji: string; title: string; body: string } | null;

  // Actions
  login: (username: string, password: string) => boolean;
  register: (
    name: string, username: string, password: string,
    role: 'kid' | 'parent', avatar: string, age: number | null
  ) => boolean;
  logout: () => void;
  tryAutoLogin: () => void;

  navigate: (screen: ScreenId) => void;

  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;

  saveUser: () => void;
  updateUser: (partial: Partial<User>) => void;

  showModal: (emoji: string, title: string, body: string) => void;
  closeModal: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  isLoading: false,
  authError: '',
  currentScreen: 'home',
  modal: null,

  login(username, password) {
    const lower = username.toLowerCase().trim();

    // Demo account
    if ((lower === 'alex' || lower === 'demo') && password === '1234') {
      const demo = getDemoUser();
      DataLayer.setSession(demo.username);
      set({ currentUser: demo, authError: '' });
      Analytics.track('login', { method: 'demo' });
      return true;
    }

    const user = DataLayer.getUser(lower);
    if (!user) { set({ authError: 'Account not found. Please create one!' }); return false; }
    if (user.password !== btoa(password)) { set({ authError: 'Wrong password. Try again!' }); return false; }

    DataLayer.setSession(user.username);
    set({ currentUser: user, authError: '' });
    Analytics.track('login', { method: 'password' });
    return true;
  },

  register(name, username, password, role, avatar, age) {
    const lower = username.toLowerCase().trim();
    if (DataLayer.getUser(lower)) {
      set({ authError: 'That username is taken. Try another!' });
      return false;
    }
    const newUser = createDefaultUser(lower, name, password, role, avatar, age);
    DataLayer.saveUser(newUser);
    DataLayer.setSession(lower);
    set({ currentUser: newUser, authError: '' });
    Analytics.track('register', { role });
    return true;
  },

  logout() {
    DataLayer.clearSession();
    set({ currentUser: null, currentScreen: 'home' });
    Analytics.track('logout', {});
  },

  tryAutoLogin() {
    const saved = DataLayer.getSession();
    if (!saved) return;
    const user = saved === 'alex' ? getDemoUser() : DataLayer.getUser(saved);
    if (user) set({ currentUser: user });
  },

  navigate(screen) {
    set({ currentScreen: screen });
    Analytics.track('navigate', { screen }, get().currentUser?.username);
  },

  addXP(amount) {
    const u = get().currentUser;
    if (!u) return;
    const newXP   = u.xp + amount;
    const newLevel= Math.floor(newXP / 500) + 1;
    const updated = { ...u, xp: newXP, level: newLevel };
    set({ currentUser: updated });
    get().saveUser();
    // Fire-and-forget cloud sync (no-op in demo mode)
    try {
      const { activeChild } = require('@/lib/auth-store').useAuthStore.getState();
      if (activeChild?.id && activeChild.id !== 'demo') {
        scheduleSyncProfile(activeChild.id, { xp: newXP, level: newLevel, coins: u.coins });
      }
    } catch { /* store may not be initialised */ }
  },

  addCoins(amount) {
    const u = get().currentUser;
    if (!u) return;
    const updated = { ...u, coins: u.coins + amount };
    set({ currentUser: updated });
  },

  addGems(amount) {
    const u = get().currentUser;
    if (!u) return;
    const updated = { ...u, gems: u.gems + amount };
    set({ currentUser: updated });
  },

  saveUser() {
    const u = get().currentUser;
    if (!u || u.username === 'alex') return; // demo user not persisted
    DataLayer.saveUser(u);
  },

  updateUser(partial) {
    const u = get().currentUser;
    if (!u) return;
    const updated = { ...u, ...partial };
    set({ currentUser: updated });
    if (u.username !== 'alex') DataLayer.saveUser(updated);
  },

  showModal(emoji, title, body) {
    set({ modal: { show: true, emoji, title, body } });
  },

  closeModal() {
    set({ modal: null });
  },
}));
