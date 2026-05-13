import { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth.service';
import { AuthMobileResponse, UserMobile } from '../models/auth.model';

// ─── Context Types ─────────────────────────────────────────────────────────────
export interface AuthContextType {
    userData: UserMobile | null;
    loading: boolean;
    error: string | null;
    login: (cccd: string, pass: string) => Promise<AuthMobileResponse | null>;
    logout: () => Promise<void>;
    refreshUserData: () => Promise<void>;
    updateUserData: (partial: Partial<UserMobile>) => Promise<void>;
}

// ─── Context (export để AuthProvider.tsx dùng) ────────────────────────────────
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Shared logic cho AuthProvider dùng ────────────────────────────────────────
export function useAuthState() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserMobile | null>(null);

    const loadUserData = useCallback(async () => {
        try {
            const data = await AsyncStorage.getItem('@user_data');
            if (data) setUserData(JSON.parse(data));
        } catch (err) {
            console.error('Failed to load user data', err);
        }
    }, []);

    useEffect(() => {
        loadUserData();
    }, []);

    const refreshUserData = useCallback(async () => {
        await loadUserData();
    }, [loadUserData]);

    const updateUserData = useCallback(async (partial: Partial<UserMobile>) => {
        setUserData(prev => prev ? { ...prev, ...partial } : prev);
        const raw = await AsyncStorage.getItem('@user_data');
        if (raw) {
            const current = JSON.parse(raw);
            await AsyncStorage.setItem('@user_data', JSON.stringify({ ...current, ...partial }));
        }
    }, []);

    const login = useCallback(async (cccd: string, pass: string): Promise<AuthMobileResponse | null> => {
        setLoading(true);
        setError(null);
        try {
            const res = await authService.loginMobileCustomer(cccd, pass);
            if (res && res.token && res.data) {
                await AsyncStorage.setItem('@access_token', res.token);
                await AsyncStorage.setItem('@user_data', JSON.stringify(res.data));
                setUserData(res.data);
            }
            return res;
        } catch (err: any) {
            setError(err.message || 'Kết nối mạng hoặc Căn Cước/Mật khẩu bị sai.');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await AsyncStorage.removeItem('@access_token');
            await AsyncStorage.removeItem('@user_data');
            setUserData(null);
        } catch (err) {
            console.error('Failed to logout', err);
        }
    }, []);

    return { userData, loading, error, login, logout, refreshUserData, updateUserData };
}
