import { QuestineColors } from '@/constants/Colors';
import { Stack } from 'expo-router';
import { ChevronLeft, StepBack } from 'lucide-react-native';
import { Text, View } from 'react-native';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: '설정',
          headerShown: true,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name='account'
        options={{
          title: '계정 설정',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
