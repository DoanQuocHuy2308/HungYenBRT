"use client";

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
    label: string;
    value: string;
    trend: string;
    isUp: boolean;
    icon: React.ReactNode;
    colorClass: string;
}

export const KPICard: React.FC<KPICardProps> = ({
    label,
    value,
    trend,
    isUp,
    icon,
    colorClass
}) => {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-600">
                    {icon}
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold ${isUp ? 'text-emerald-600 bg-emerald-50/50' : 'text-rose-600 bg-rose-50/50'}`}>
                    {isUp ? <ArrowUpRight size={14} strokeWidth={2.5} /> : <ArrowDownRight size={14} strokeWidth={2.5} />}
                    <span>{trend}</span>
                </div>
            </div>

            <div className="flex flex-col">
                <span className="text-slate-500 text-sm font-medium mb-1">{label}</span>
                <span className="font-bold text-3xl text-slate-900 tracking-tight">
                    {value}
                </span>
            </div>
        </div>
    );
};
