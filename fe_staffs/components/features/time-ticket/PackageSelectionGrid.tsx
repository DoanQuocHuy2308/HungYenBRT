"use client";

import React from 'react';
import { Ticket, CalendarDays, Clock, ShieldCheck } from 'lucide-react';

interface TicketPackage {
    id: string;
    name: string;
    duration: string;
    price: number;
    categoryId: number;
}

interface PackageSelectionGridProps {
    packages: TicketPackage[];
    selectedPackageId?: string;
    onSelect: (pkg: TicketPackage) => void;
}

export const PackageSelectionGrid: React.FC<PackageSelectionGridProps> = ({
    packages,
    selectedPackageId,
    onSelect
}) => {
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <Ticket size={20} className="text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Lựa chọn gói cước</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {packages.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;
                    const isPromo = pkg.categoryId === 3;

                    return (
                        <div
                            key={pkg.id}
                            onClick={() => onSelect(pkg)}
                            className={`
                                relative p-5 rounded-xl border-2 transition-all cursor-pointer group
                                ${isSelected 
                                    ? 'border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50' 
                                    : 'border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white'}
                            `}
                        >
                            {isPromo && (
                                <div className="absolute -top-2 -right-2 bg-rose-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-lg">
                                    Ưu đãi
                                </div>
                            )}

                            {isSelected && (
                                <div className="absolute top-4 right-4 text-indigo-600">
                                    <ShieldCheck size={20} strokeWidth={3} />
                                </div>
                            )}

                            <div className="flex flex-col gap-4">
                                <div className="space-y-1">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                                        {pkg.categoryId === 2 ? 'Vé thời hạn' : 'Vé ưu đãi'}
                                    </span>
                                    <h3 className={`text-lg font-bold leading-tight ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                                        {pkg.name}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-4 py-3 border-y border-slate-100/50">
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <CalendarDays size={14} />
                                        <span className="text-xs font-bold">{pkg.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Clock size={14} />
                                        <span className="text-xs font-bold">Không giới hạn lượt</span>
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-1">
                                    <span className={`text-xl font-black ${isSelected ? 'text-indigo-600' : 'text-slate-900'}`}>
                                        {pkg.price.toLocaleString('vi-VN')}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">VND</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
