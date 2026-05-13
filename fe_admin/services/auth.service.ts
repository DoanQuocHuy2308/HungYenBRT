import { axiosClient } from '../api_client/axiosClient';
import { AuthResponse } from '../models/auth.model';

export const authService = {
     /**
      * Đăng nhập dành cho Quản trị viên/Nhân viên
      * @param username - Tên đăng nhập Admin
      * @param password - Mật khẩu Admin
      */
     loginEmployee: async (username: string, password: string): Promise<AuthResponse> => {
          return await axiosClient.post('/auth/login-employee', { username, password });
     },

     /**
      * Đăng nhập dành riêng cho Khách hàng di động (Sẽ dùng ở cổng fe_customers)
      */
     loginCustomer: async (cccd_number: string, password: string): Promise<AuthResponse> => {
          return await axiosClient.post('/auth/login-customer', { cccd_number, password });
     },

     /**
      * API Đăng ký khách hàng 
      * @note Phải truyền FormData nếu có kèm file ảnh (avatar, cccd_front...)
      */
     registerCustomer: async (formData: FormData): Promise<AuthResponse> => {
          return await axiosClient.post('/auth/register-customer', formData, {
               headers: {
                    'Content-Type': 'multipart/form-data',
               }
          });
     },

     /**
      * Đăng xuất hệ thống (tắt trạng thái online)
      */
     logoutAdmin: async (userId: string): Promise<AuthResponse> => {
          return await axiosClient.post('/auth/logout', { userId });
     }
}
