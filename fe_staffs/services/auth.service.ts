import { axiosClient } from '../api_client/axiosClient';
import { AuthStaffResponse } from '../models/auth.model';

export const authService = {
     /**
      * Đăng nhập dành cho Cổng Soát Vé / Nhân Viên 
      */
     loginStaff: async (username: string, password: string): Promise<AuthStaffResponse> => {
          return await axiosClient.post('/auth/login-employee', { username, password });
     },

     /**
      * Đăng xuất Nhân viên
      */
     logoutStaff: async (userId: string): Promise<AuthStaffResponse> => {
          return await axiosClient.post('/auth/logout', { userId });
     }
}
