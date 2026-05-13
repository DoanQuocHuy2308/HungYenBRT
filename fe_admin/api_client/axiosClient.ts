import axios from 'axios';

// Mặc định kết nối tới Backend đang chạy (localhost:3000)
// Thay đổi bằng .env trong môi trường production
export const axiosClient = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, 
});

// Interceptor cho Request: Luôn đính token nếu có
axiosClient.interceptors.request.use(
    (config) => {
        // Trên web (fe_admin / fe_staffs), chúng ta xài localStorage 
        // Lưu ý: với NextJS Server Side (SSR), localStorage ko tồn tại, nên hook này chủ yếu chạy dưới Client.
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho Response: Bắt lỗi 401 khi hết token
axiosClient.interceptors.response.use(
    (response) => {
        // Chỉ bóc data ra cho gọn
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            console.error('Core Axios Error! Token hết hạn hoặc sai xác thực!');
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                window.location.href = '/login'; 
            }
        }
        return Promise.reject(error.response?.data || error.message);
    }
);
