"use client";

import React from 'react';
import { InputText } from 'primereact/inputtext';

interface StaffInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    label?: string;
    desc?: string;
    icon?: React.ReactNode;
    type?: string;
    className?: string;
    onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const StaffInput: React.FC<StaffInputProps> = ({
    value,
    onChange,
    placeholder,
    label,
    desc,
    icon,
    type = 'text',
    className = '',
    onKeyDown
}) => {
    return (
        <div className={`space-y-2.5 group ${className}`}>
            {label && (
                <label className="block text-slate-400 font-black text-[9px] uppercase tracking-[0.25em] ml-1 group-focus-within:text-[#5D4037] transition-colors">
                    {label}
                </label>
            )}
            <div className="relative flex items-center h-14 w-full">
                {icon && (
                    <div className="absolute left-5 text-slate-300 group-focus-within:text-[#5D4037] transition-all z-10">
                        {icon}
                    </div>
                )}
                <InputText 
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    className={`
                        w-full h-full bg-slate-50 border-none rounded-2xl 
                        text-slate-800 font-bold text-sm tracking-tight
                        placeholder:text-slate-300 placeholder:font-medium
                        focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all shadow-inner
                        ${icon ? 'pl-14' : 'px-6'}
                    `}
                />
            </div>
            {desc && (
                <p className="text-[9px] font-bold text-slate-400 tracking-tight ml-1 opacity-70 italic">
                    {desc}
                </p>
            )}
        </div>
    );
};
