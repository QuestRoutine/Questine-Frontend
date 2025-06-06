import { deleteAccount, getAccessToken, getMe, postLogout, postSignin, postSignup } from '@/api/auth';
import queryClient from '@/api/queryClient';
import { removeHeader, setHeader } from '@/utils/header';
import { deleteSecureStore, getSecureStore, setSecureStore } from '@/utils/secureStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';

function useGetMe() {
  const { data, isError, isSuccess, isLoading } = useQuery({
    queryFn: getMe,
    queryKey: ['getMe'],
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 60, // 1 hour
  });

  useEffect(() => {
    (async () => {
      if (isSuccess) {
        const accessToken = await getSecureStore('accessToken');
        setHeader('Authorization', `Bearer ${accessToken}`);
      }
    })();
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      removeHeader('Authorization');
      deleteSecureStore('refreshToken');
    }
  }, [isError]);

  return { data, isLoading };
}

function useSignup() {
  return useMutation({
    mutationFn: postSignup,
    onSuccess: () => {
      router.replace('/auth/Login');
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: '회원가입 실패',
        text2: '입력한 정보를 확인해주세요.',
      });
    },
  });
}

function useSignin() {
  return useMutation({
    mutationFn: postSignin,
    onSuccess: async ({ accessToken, refreshToken }) => {
      setHeader('Authorization', `Bearer ${accessToken}`);
      await setSecureStore('accessToken', accessToken);
      await setSecureStore('refreshToken', refreshToken);
      await queryClient.fetchQuery({ queryKey: ['getMe'], queryFn: getMe });
      router.replace('/(tabs)');
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: '로그인 실패',
        text2: '아이디와 비밀번호를 확인해주세요.',
      });
    },
  });
}

function useLogout() {
  return useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      AsyncStorage.clear();
      removeHeader('Authorization');
      deleteSecureStore('accessToken');
      deleteSecureStore('refreshToken');
      queryClient.clear();
      router.dismissAll();
      router.replace('/auth/Login');
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: '로그아웃 실패',
        text2: '다시 시도해주세요.',
      });
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

function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      AsyncStorage.clear();
      queryClient.clear();
      removeHeader('Authorization');
      deleteSecureStore('accessToken');
      deleteSecureStore('refreshToken');
      router.replace('/auth/Login');
      Toast.show({
        type: 'success',
        text1: '계정 삭제 성공',
        text2: '계정이 성공적으로 삭제되었습니다.',
      });
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: '계정 삭제 실패',
        text2: '다시 시도해주세요.',
      });
    },
  });
}

function useAuth() {
  const { data: auth, isLoading: isAuthLoading } = useGetMe();
  const signupMutation = useSignup();
  const signinMutation = useSignin();
  const refreshTokenQuery = useRefreshToken();
  const logoutMutation = useLogout();
  const deleteAccountMutation = useDeleteAccount();

  return {
    auth: {
      user_id: auth?.user_id || '',
    },
    isAuthLoading,
    signupMutation,
    signinMutation,
    refreshTokenQuery,
    logoutMutation,
    deleteAccountMutation,
  };
}

export default useAuth;
