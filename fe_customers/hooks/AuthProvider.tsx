import React, { useContext } from 'react';
import { AuthContext, AuthContextType, useAuthState } from './useAuth';

// ─── Provider (JSX) — bọc toàn app trong _layout.tsx ─────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const authState = useAuthState();

    return (
        <AuthContext.Provider value={authState}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook để các màn hình sử dụng ─────────────────────────────────────────────
export function useCustomerAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useCustomerAuth must be used within AuthProvider');
    return ctx;
}
