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
  const { data } = await axiosInstance.get('/auth/me');
  return data;
}

async function postLogout(): Promise<void> {
  await axiosInstance.post('/auth/logout', null);
}

async function getAccessToken() {
  const { data } = await axiosInstance.get('/auth/refresh');
  return data;
}

async function deleteAccount(): Promise<void> {
  const { data } = await axiosInstance.delete('/auth/me');
  return data;
}

export { postSignup, postSignin, getMe, getAccessToken, postLogout, deleteAccount };
