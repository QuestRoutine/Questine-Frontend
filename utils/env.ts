import { Platform } from 'react-native';

export function getServerUrl() {
  if (Platform.OS === 'ios') return process.env.EXPO_PUBLIC_IOS_URL;
  if (Platform.OS === 'android') return process.env.EXPO_PUBLIC_ANDROID_URL;
}
