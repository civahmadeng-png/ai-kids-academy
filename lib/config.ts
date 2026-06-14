// ============================================================
// AI Kids Academy — Frontend App Configuration
// Step 4: API key REMOVED from frontend config entirely.
// The key now lives ONLY in OPENROUTER_API_KEY (server-side).
// ============================================================

export const APP_CONFIG = {
  version: '11.0',
  appName: 'AI Kids Academy',
  tagline: 'Your AI Learning World',
  // API key intentionally absent — handled by /api/ai/* routes
  imageBaseUrl: 'https://image.pollinations.ai/prompt',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
} as const;

export const COLORS = {
  sky: '#4F8EF7',       skyLight: '#E8F1FF',   skyDark: '#2563EB',
  mint: '#22D3A6',      mintLight: '#DCFDF2',
  sun: '#FFB800',       sunLight: '#FFF7D6',
  coral: '#FF6B6B',     coralLight: '#FFE8E8',
  violet: '#8B5CF6',    violetLight: '#EDE9FE',
} as const;
