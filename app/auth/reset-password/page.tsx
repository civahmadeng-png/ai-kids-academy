'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { ResetPasswordScreen } from '@/components/auth/ResetPasswordScreens';
import SplashScreen from '@/components/auth/SplashScreen';

// This page is loaded when user clicks the reset link in their email.
// Supabase sets the session automatically via the URL hash.
export default function ResetPasswordPage() {
  const { setAuthScreen, authScreen } = useAuthStore();

  useEffect(() => {
    // Supabase auth.onAuthStateChange fires PASSWORD_RECOVERY event
    // which sets authScreen to 'reset-password' in auth-store.ts
    // But if they land here directly, force the screen:
    setAuthScreen('reset-password');
  }, [setAuthScreen]);

  if (authScreen === 'splash') return <SplashScreen />;
  return <ResetPasswordScreen />;
}
