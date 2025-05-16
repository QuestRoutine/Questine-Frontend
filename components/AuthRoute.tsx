import useAuth from '@/hooks/useAuth';
import { router, useFocusEffect } from 'expo-router';
import { ReactNode } from 'react';
export default function AuthRoute({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  useFocusEffect(() => {
    !auth.user_id && router.replace('/auth/Login');
  });
  return <>{children}</>;
}
