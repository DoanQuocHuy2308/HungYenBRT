import { useState } from 'react';
import { authService } from '../services/auth.service';
import { AuthResponse } from '../models/auth.model';

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loginAdmin = async (username: string, pass: string): Promise<AuthResponse | null> => {
        setLoading(true);
        setError(null);
        try {
            const res = await authService.loginEmployee(username, pass);
            if (res && res.token) {
                 // Gắn khóa lưu vào kho hệ thống để axios chặn gọi 
                 localStorage.setItem('access_token', res.token);
                 localStorage.setItem('user_data', JSON.stringify(res.data));
            }
            return res;
        } catch (err: any) {
            setError(err.message || "Tài khoản hoặc thẻ cào bảo mật không khớp.");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            const userDataString = localStorage.getItem('user_data');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                // `userData.user.id` or `userData.id` depends on the payload schema
                const targetId = userData?.user?.id || userData?.id;
                if (targetId) {
                    await authService.logoutAdmin(targetId);
                }
            }
        } catch (e) {
            console.error('Lỗi khi logout:', e);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            window.location.href = '/login'; 
        }
    }

    return { loginAdmin, logout, loading, error };
}
