"use client";

import React from 'react';

interface DashboardActionProps {
    title: string;
    desc: string;
    icon: React.ReactNode;
    colorClass: string;
    onClick: () => void;
}

export const DashboardAction: React.FC<DashboardActionProps> = ({
    title,
    desc,
    icon,
    colorClass,
    onClick
}) => {
    return (
        <button 
            className={`
                flex flex-col items-center justify-center p-6 sm:p-10 
                rounded-[40px] border-2 shadow-sm transition-all duration-500 
                transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#3E2723]/5
                group bg-white border-slate-50 hover:border-[#DDB892]/30
            `}
            onClick={onClick}
        >
            <div className={`
                w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center 
                shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500
                ${colorClass}
            `}>
                <div className="text-[#3E2723] opacity-80 group-hover:opacity-100 transition-opacity">
                    {icon}
                </div>
            </div>
            <h3 className="text-[#3E2723] font-black text-lg sm:text-xl tracking-tight mb-2 text-center uppercase">
                {title}
            </h3>
            <p className="text-slate-400 font-bold text-xs sm:text-sm text-center line-clamp-2 max-w-[180px] leading-relaxed">
                {desc}
            </p>
        </button>
    );
};
