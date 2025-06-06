import useAuth from '@/hooks/useAuth';
import { router, useFocusEffect } from 'expo-router';
import { ReactNode, useCallback } from 'react';

function AuthLoading() {
  return null;
}

function LoginRedirect() {
  useFocusEffect(
    useCallback(() => {
      router.replace('/auth/Login');
    }, [])
  );
  return null;
}

export default function AuthRoute({ children }: { children: ReactNode }) {
  const { auth, isAuthLoading } = useAuth();
  const isLoggedIn = Boolean(auth.user_id);

  if (isAuthLoading) return <AuthLoading />;
  if (!isLoggedIn) return <LoginRedirect />;

  return <>{children}</>;
}
