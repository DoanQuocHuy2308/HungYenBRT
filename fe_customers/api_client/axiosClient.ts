import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

/**
 * Tự động lấy IP máy chủ từ Expo runtime.
 * Khi bạn đổi mạng WiFi và restart `npm start`, IP mới sẽ tự update.
 * Không cần sửa tay nữa!
 */
function getBaseUrl(): string {
    if (__DEV__) {
        // Expo biết IP của máy tính đang chạy server qua hostUri (vd: "192.168.1.60:8081")
        const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost;
        if (hostUri) {
            const ip = hostUri.split(':')[0]; // Chỉ lấy phần IP, bỏ port Expo
            return `http://${ip}:3000`;
        }
    }
    // Fallback khi không lấy được (Production build)
    return 'http://192.168.1.60:3000';
}

export const BASE_URL = getBaseUrl();
console.log('[AxiosClient] Đang kết nối tới Backend:', BASE_URL);

export const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

axiosClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('@access_token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch(e) {
            console.error("Lỗi lấy AsyncStorage Token", e);
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
    async (error) => {
        if (error.response?.status === 401) {
            console.error('Core Axios React Native Error! Hết hạn token.');
            await AsyncStorage.removeItem('@access_token');
            // Cần trigger logic bật AuthScreen trên App.tsx (vd qua Redux/Context)
        }
        return Promise.reject(error.response?.data || { message: error.message });
    }
);
