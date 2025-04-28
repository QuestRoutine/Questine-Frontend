import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Award, House, UserCog } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: '홈',
          tabBarActiveTintColor: 'hotpink',
          tabBarIcon: ({ color }) => <House size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name='Award'
        options={{
          title: '업적',
          tabBarActiveTintColor: 'hotpink',
          tabBarIcon: ({ color }) => <Award size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name='Profile'
        options={{
          title: '프로필',
          tabBarActiveTintColor: 'hotpink',
          tabBarIcon: ({ color }) => <UserCog size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
