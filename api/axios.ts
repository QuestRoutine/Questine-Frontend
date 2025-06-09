import { getSecureStore, setSecureStore } from '@/utils/secureStore';
import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';

const REFRESH_ENDPOINT = '/auth/refresh';

const axiosInstance = axios.create({
  baseURL: Platform.OS === 'ios' ? `${process.env.EXPO_PUBLIC_IOS_URL}` : `${process.env.EXPO_PUBLIC_ANDROID_URL}`,
});

async function getAccessToken(): Promise<string> {
  const refreshToken = await getSecureStore('refreshToken');
  const { data } = await axiosInstance.get(REFRESH_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  await setSecureStore('accessToken', data.accessToken);
  await setSecureStore('refreshToken', data.refreshToken);
  return data.accessToken;
}

axiosInstance.interceptors.request.use(async (config) => {
  const isRefreshRequest = config.url?.includes(REFRESH_ENDPOINT);
  const tokenKey = isRefreshRequest ? 'refreshToken' : 'accessToken';
  const token = await getSecureStore(tokenKey);

  if (token) {
    if (!config.headers) config.headers = new axios.AxiosHeaders();
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;
    const isConfigDefined = !!config; // error.config undefined 체크
    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = config?.url?.includes(REFRESH_ENDPOINT);

    if (isConfigDefined && isUnauthorized && !isRefreshRequest) {
      try {
        const newAccessToken = await getAccessToken();
        if (newAccessToken) {
          if (!config.headers) config.headers = new axios.AxiosHeaders();
          config.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }
        return axiosInstance(config);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
export default axiosInstance;
