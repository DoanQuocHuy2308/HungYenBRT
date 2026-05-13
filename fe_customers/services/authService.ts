import api from './api';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email?: string;
}

/** Đăng nhập */
export const login = async (payload: LoginPayload) => {
  const response = await api.post('/api/auth/login', payload);
  return response.data;
};

/** Đăng ký */
export const register = async (payload: RegisterPayload) => {
  const response = await api.post('/api/auth/register', payload);
  return response.data;
};
