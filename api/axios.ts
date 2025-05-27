import { getSecureStore } from '@/utils/secureStore';
import axios from 'axios';
import { Platform } from 'react-native';

const axiosInstance = axios.create({
  baseURL: Platform.OS === 'ios' ? 'http://172.30.1.49:4000' : 'http://10.0.2.2:4000',
});

axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = await getSecureStore('accessToken');
  if (accessToken) {
    if (config.headers) config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

export default axiosInstance;
