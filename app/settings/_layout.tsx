import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function SettingsLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors['light'];

  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: '설정',
          headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='account'
        options={{
          title: '계정 설정',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='display'
        options={{
          title: '화면 설정',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='notifications'
        options={{
          title: '공지사항',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
