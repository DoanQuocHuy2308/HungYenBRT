"use client";

import React from 'react';

interface StaffAvatarProps {
    src?: string;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | number;
    className?: string;
}

export const StaffAvatar: React.FC<StaffAvatarProps> = ({ 
    src, 
    name = 'Staff', 
    size = 'md', 
    className = '' 
}) => {
    const getSizeStyles = () => {
        if (typeof size === 'number') return { width: size, height: size };
        switch (size) {
            case 'sm': return { width: 32, height: 32 };
            case 'lg': return { width: 56, height: 56 };
            default: return { width: 44, height: 44 };
        }
    };

    const initials = name.charAt(0).toUpperCase();
    const sizeStyle = getSizeStyles();

    return (
        <div 
            style={sizeStyle}
            className={`
                shrink-0 rounded-[18px] border-2 border-white shadow-sm overflow-hidden 
                flex items-center justify-center bg-[#F8F1E9] text-[#5D4037] font-black text-sm
                ${className}
            `}
        >
            {src ? (
                <img 
                    src={src.startsWith('http') || src.startsWith('/') ? src : `http://localhost:3000/${src}`} 
                    className="w-full h-full object-cover"
                    alt={name}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
};
