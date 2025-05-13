import { getSecureStore } from '@/utils/secureStore';
import axiosInstance from './axios';

type RequestUser = {
  email: string;
  password: string;
};

async function postSignup(body: RequestUser): Promise<void> {
  const { data } = await axiosInstance.post('/auth/signup', body);
  return data;
}
async function postSignin(body: RequestUser): Promise<{ accessToken: string; refreshToken: string }> {
  const { data } = await axiosInstance.post('/auth/signin', body);
  return data;
}

async function getMe() {
  const accessToken = await getSecureStore('accessToken');
  const { data } = await axiosInstance.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data;
}

async function postLogout(): Promise<void> {
  console.log('postLogout');
  const accessToken = await getSecureStore('accessToken');

  await axiosInstance.post('/auth/logout', null, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function getAccessToken() {
  const refreshToken = await getSecureStore('refreshToken');
  const { data } = await axiosInstance.get('/auth/refresh', {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });
  return data;
}

export { postSignup, postSignin, getMe, getAccessToken, postLogout };
