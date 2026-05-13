import { axiosClient } from '../api_client/axiosClient';
import { AuthMobileResponse } from '../models/auth.model';

export const authService = {
     /**
      * Đăng nhập với Cổng Khách Hàng (Sử dụng CCCD và Password)
      */
     loginMobileCustomer: async (cccd_number: string, password: string): Promise<AuthMobileResponse> => {
          return await axiosClient.post('/auth/login-customer', { cccd_number, password });
     },

     /**
      * Đăng ký thẻ (Có FormData upload cccd 2 mặt)
      */
     registerMobileCustomer: async (formData: FormData): Promise<AuthMobileResponse> => {
          return await axiosClient.post('/auth/register-customer', formData, {
               headers: {
                    'Content-Type': 'multipart/form-data',
               }
          });
     },

     registerProxyCustomer: async (formData: FormData): Promise<AuthMobileResponse> => {
          return await axiosClient.post('/auth/register-proxy', formData, {
               headers: {
                    'Content-Type': 'multipart/form-data',
               }
          });
     },

     /**
      * Upload ảnh CCCD (Mặt trước/Mặt sau) để Python bóc tách QR Code
      */
     scanCccdQr: async (formData: FormData): Promise<any> => {
          return await axiosClient.post('/upload/cccd-qr', formData, {
               headers: {
                    'Content-Type': 'multipart/form-data',
               }
          });
     }
}
