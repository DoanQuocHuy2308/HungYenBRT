import { useState } from 'react';
import { authService } from '../services/auth.service';
import { AuthStaffResponse } from '../models/auth.model';

export function useStaffAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (username: string, pass: string): Promise<AuthStaffResponse | null> => {
        setLoading(true);
        setError(null);
        try {
            const res = await authService.loginStaff(username, pass);
            
            const userRole = res.data?.user?.role?.id;
            if (userRole === 3) {
                setError("Quyền truy cập bị từ chối: Tài khoản không có vai trò Nhân viên trạm.");
                return { success: false, message: 'Vai trò không hợp lệ' } as any;
            }

            if (res && res.token) {
                 localStorage.setItem('staff_access_token', res.token);
                 localStorage.setItem('staff_data', JSON.stringify(res.data));
            }
            return res;
        } catch (err: any) {
            setError(err.message || "Tài khoản nhân viên hoặc mật khẩu sai.");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            const userDataString = localStorage.getItem('staff_data');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                const targetId = userData?.user?.id || userData?.id;
                if (targetId) {
                    await authService.logoutStaff(targetId);
                }
            }
        } catch (e) {
            console.error('Lỗi khi logout:', e);
        } finally {
            localStorage.removeItem('staff_access_token');
            localStorage.removeItem('staff_data');
            window.location.href = '/login'; 
        }
    }

    return { login, logout, loading, error };
}
