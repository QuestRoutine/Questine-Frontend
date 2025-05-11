import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false, title: '홈' }} />
        <Stack.Screen name='auth' options={{ headerShown: false, title: '로그인' }} />
        <Stack.Screen name='settings' options={{ headerShown: true, title: '설정' }} />
        <Stack.Screen name='+not-found' />
      </Stack>
      {children}
      <Toast />
      <StatusBar style='dark' backgroundColor='transparent' translucent={true} />
    </View>
  );
}
