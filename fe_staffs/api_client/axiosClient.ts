import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, 
});

axiosClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('staff_access_token');
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

axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            console.error('Staff Axios Error! Token hết hạn!');
            if (typeof window !== 'undefined') {
                localStorage.removeItem('staff_access_token');
                window.location.href = '/login'; 
            }
        }
        return Promise.reject(error.response?.data || error.message);
    }
);
