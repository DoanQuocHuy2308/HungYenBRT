"use client";

import React from 'react';
import { Button as PrimeButton } from 'primereact/button';
import { Loader2 } from 'lucide-react';

interface StaffButtonProps {
    label?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    className?: string;
    type?: "button" | "submit" | "reset";
    children?: React.ReactNode;
}

export const StaffButton: React.FC<StaffButtonProps> = ({
    label,
    icon,
    onClick,
    loading = false,
    disabled = false,
    variant = 'primary',
    className = '',
    type = 'button',
    children
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return 'bg-[#3E2723] text-[#EFDDC4] border-none hover:bg-[#5D4037] shadow-lg shadow-orange-900/10';
            case 'secondary':
                return 'bg-[#FDFBF7] text-[#5D4037] border-2 border-[#DDB892] hover:bg-[#F8F1E9]';
            case 'ghost':
                return 'bg-transparent text-slate-500 hover:bg-slate-50 border-none';
            case 'danger':
                return 'bg-rose-500 text-white border-none hover:bg-rose-600 shadow-lg shadow-rose-900/10';
            case 'success':
                return 'bg-emerald-500 text-white border-none hover:bg-emerald-600 shadow-lg shadow-emerald-900/10';
            default:
                return 'bg-[#3E2723] text-white';
        }
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`
                relative flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl 
                font-black text-[10px] tracking-[0.2em] uppercase transition-all duration-300
                active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed
                ${getVariantStyles()}
                ${className}
            `}
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin text-inherit opacity-70" />
            ) : (
                <>
                    {icon && <span className="shrink-0">{icon}</span>}
                    {label && <span>{label}</span>}
                    {children}
                </>
            )}
        </button>
    );
};
