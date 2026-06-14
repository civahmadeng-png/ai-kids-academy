'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import LandingScreen         from './LandingScreen';
import SignInScreen          from './SignInScreen';
import SignUpScreen          from './SignUpScreen';
import VerifyEmailScreen     from './VerifyEmailScreen';
import { ResetRequestScreen, ResetPasswordScreen } from './ResetPasswordScreens';
import ChildSelectScreen     from './ChildSelectScreen';
import ChildCreateScreen     from './ChildCreateScreen';
import SplashScreen          from './SplashScreen';

export default function AuthRouter() {
  const { authScreen, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  switch (authScreen) {
    case 'splash':          return <SplashScreen />;
    case 'landing':         return <LandingScreen />;
    case 'signin':          return <SignInScreen />;
    case 'signup':          return <SignUpScreen />;
    case 'verify-email':    return <VerifyEmailScreen />;
    case 'reset-request':   return <ResetRequestScreen />;
    case 'reset-password':  return <ResetPasswordScreen />;
    case 'child-select':    return <ChildSelectScreen />;
    case 'child-create':    return <ChildCreateScreen />;
    default:                return null; // 'app' — handled by page.tsx
  }
}
