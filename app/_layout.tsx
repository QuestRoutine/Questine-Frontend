import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@/api/queryClient';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import CustomToast, { CustomToastProps } from '@/components/ui/CustomToast';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.tz.setDefault('Asia/Seoul');

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const toastConfig = {
    custom: (props: CustomToastProps) => <CustomToast {...props} />,
    customSuccess: (props: CustomToastProps) => <CustomToast {...props} />,
    error: (props: CustomToastProps) => <CustomToast {...props} />,
    info: (props: CustomToastProps) => <CustomToast {...props} />,
    warning: (props: CustomToastProps) => <CustomToast {...props} />,
  };
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false, title: '홈' }} />
          <Stack.Screen name='auth' options={{ headerShown: false, title: '로그인' }} />
          <Stack.Screen name='settings' options={{ headerShown: true, title: '설정' }} />
          <Stack.Screen name='+not-found' />
        </Stack>
        <Toast config={toastConfig} />
        <StatusBar style='dark' backgroundColor='transparent' />
      </QueryClientProvider>
    </>
  );
}
