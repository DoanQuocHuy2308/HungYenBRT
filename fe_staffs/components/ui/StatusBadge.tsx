"use client";

import React from 'react';

interface StatusBadgeProps {
    status: 'valid' | 'expired' | 'used' | 'active' | 'locked' | string;
    label?: string;
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
    const getStyles = () => {
        switch (status.toLowerCase()) {
            case 'valid':
            case 'active':
                return 'bg-emerald-50 text-emerald-600 border-emerald-100 uppercase';
            case 'expired':
            case 'locked':
                return 'bg-rose-50 text-rose-600 border-rose-100 uppercase';
            case 'used':
                return 'bg-slate-100 text-slate-500 border-slate-200 uppercase';
            default:
                return 'bg-amber-50 text-amber-600 border-amber-100 uppercase';
        }
    };

    const defaultLabels: Record<string, string> = {
        valid: 'Hợp lệ',
        active: 'Hoạt động',
        expired: 'Hết hạn',
        locked: 'Đã khóa',
        used: 'Đã dùng',
    };

    return (
        <span className={`
            px-3 py-1 rounded-lg border text-[9px] font-black tracking-[0.15em]
            ${getStyles()}
            ${className}
        `}>
            {label || defaultLabels[status.toLowerCase()] || status}
        </span>
    );
};
