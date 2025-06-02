import { getSecureStore } from '@/utils/secureStore';
import axios from 'axios';
import { Platform } from 'react-native';

const axiosInstance = axios.create({
  baseURL: Platform.OS === 'ios' ? `${process.env.EXPO_PUBLIC_IOS_URL}` : `${process.env.EXPO_PUBLIC_ANDROID_URL}`,
});

axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = await getSecureStore('accessToken');
  if (accessToken) {
    if (config.headers) config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

export default axiosInstance;
