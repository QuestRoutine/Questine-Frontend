import { getAccessToken, getMe, postLogout, postSignin, postSignup } from '@/api/auth';
import queryClient from '@/api/queryClient';
import { removeHeader, setHeader } from '@/utils/header';
import { deleteSecureStore, setSecureStore } from '@/utils/secureStore';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';

function useGetMe() {
  const { data, isError } = useQuery({
    queryFn: getMe,
    queryKey: ['getMe'],
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 60, // 1 hour
  });
  useEffect(() => {
    if (isError) {
      removeHeader('Authorization');
      deleteSecureStore('refreshToken');
    }
  }, [isError]);

  return { data };
}

function useSignup() {
  return useMutation({
    mutationFn: postSignup,
    onSuccess: () => {
      router.replace('/auth/Login');
    },
    onError: (error) => {
      console.error('Signup failed:', error);
    },
  });
}

function useSignin() {
  return useMutation({
    mutationFn: postSignin,
    onSuccess: async ({ accessToken, refreshToken }) => {
      console.log('로그인 성공');
      setHeader('Authorization', `Bearer ${accessToken}`);
      await setSecureStore('accessToken', accessToken);
      await setSecureStore('refreshToken', refreshToken);

      await queryClient.fetchQuery({ queryKey: ['getMe'], queryFn: getMe });
      router.replace('/(tabs)');
    },
    onError: (error) => {
      console.error('Signin failed:', error);
    },
  });
}

function useLogout() {
  return useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      removeHeader('Authorization');
      deleteSecureStore('refreshToken');
      queryClient.clear();
      router.replace('/auth/Login');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });
}

interface AccessTokenResponse {
  accessToken: string;
  refreshToken: string;
}

function useRefreshToken() {
  const { isSuccess, data, isError } = useQuery<AccessTokenResponse>({
    queryFn: getAccessToken,
    queryKey: ['accessToken'],
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 60, // 1 hour
    refetchOnReconnect: true,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (isSuccess) {
      setHeader('Authorization', `Bearer ${data.accessToken}`);
      setSecureStore('refreshToken', data.refreshToken);
    }
  }, [isSuccess, data]);
  useEffect(() => {
    if (isError) {
      removeHeader('Authorization');
      deleteSecureStore('refreshToken');
    }
  }, [isError]);
  return { isSuccess, isError };
}

function useAuth() {
  const { data: auth } = useGetMe();
  const signupMutation = useSignup();
  const signinMutation = useSignin();
  const refreshTokenQuery = useRefreshToken();
  const logoutMutation = useLogout();

  return {
    auth: {
      user_id: auth?.user_id || '',
    },
    signupMutation,
    signinMutation,
    refreshTokenQuery,
    logoutMutation,
  };
}

export default useAuth;
