import axios from 'axios';
import { BASE_URL } from '@/constants/api';

/**
 * Axios instance dùng chung cho toàn app.
 * Base URL tự động lấy IP từ Expo — không cần sửa khi đổi mạng.
 */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — thêm token vào header nếu cần
api.interceptors.request.use(
  (config) => {
    // TODO: lấy token từ storage và thêm vào nếu có
    // const token = await AsyncStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — xử lý lỗi tập trung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`[API Error] ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('[API Error] Không kết nối được server. Kiểm tra mạng hoặc backend.');
    } else {
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
