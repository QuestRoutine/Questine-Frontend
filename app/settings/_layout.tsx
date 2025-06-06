import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: '설정',
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
    </Stack>
  );
}
