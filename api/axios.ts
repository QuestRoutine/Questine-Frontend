import axios from 'axios';
import { Platform } from 'react-native';

const axiosInstance = axios.create({
  baseURL: Platform.OS === 'ios' ? 'http://172.30.1.49:4000' : 'http://10.0.2.2:4000',
});

// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Add authorization token to headers if available
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response.data;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
export default axiosInstance;
