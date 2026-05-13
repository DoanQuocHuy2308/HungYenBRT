"use client";

import React from 'react';
import { TrendingUp } from 'lucide-react';

interface DailyRevenue {
    day: string;
    single: number;
    time: number;
}

interface RevenueChartProps {
    data: DailyRevenue[];
    maxRevenue: number;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, maxRevenue }) => {
    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                        <TrendingUp size={20} className="text-blue-500" /> Biểu đồ Doanh thu
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">
                        Phân tích biến động doanh thu vé Lượt vs Vé Tháng trong 07 ngày gần nhất.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="font-semibold text-xs text-slate-500">Vé lượt</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                        <span className="font-semibold text-xs text-slate-500">Vé tháng</span>
                    </div>
                </div>
            </div>

            <div className="flex items-end gap-4 flex-1 relative px-2">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map(i => <div key={i} className="border-t border-slate-100 w-full"></div>)}
                </div>

                {data.map((d, i) => {
                    const total = d.single + d.time;
                    const singleH = (d.single / maxRevenue) * 100;
                    const timeH = (d.time / maxRevenue) * 100;

                    return (
                        <div key={i} className="flex-1 flex flex-col items-center group/bar relative h-[240px] justify-end">
                            <div className="absolute -top-10 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold z-20 shadow-lg pointer-events-none">
                                {(total / 1000000).toFixed(1)}M ₫
                            </div>

                            <div className="w-full flex flex-col items-center gap-1 relative z-10">
                                <div 
                                    className="w-full max-w-[32px] rounded-t-sm bg-slate-200 transition-colors group-hover/bar:bg-slate-300"
                                    style={{ height: `${timeH}%` }}
                                ></div>
                                <div 
                                    className="w-full max-w-[32px] rounded-b-sm bg-blue-500 transition-colors group-hover/bar:bg-blue-600"
                                    style={{ height: `${singleH}%` }}
                                ></div>
                            </div>

                            <span className="mt-4 text-xs font-semibold text-slate-500 group-hover/bar:text-slate-800 transition-colors">
                                {d.day}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
