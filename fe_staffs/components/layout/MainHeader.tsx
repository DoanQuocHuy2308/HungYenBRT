"use client";

import React from 'react';
import { ArrowLeft, Bell, LogOut, User as UserIcon, BusFront } from 'lucide-react';
import { StaffAvatar } from '../ui/StaffAvatar';
import { StaffButton } from '../ui/StaffButton';
import { useRouter } from 'next/navigation';
import { useStaffAuth } from '../../hooks/useAuth';

interface MainHeaderProps {
    currentUser: any;
}

export const MainHeader: React.FC<MainHeaderProps> = ({ currentUser }) => {
    const router = useRouter();
    const { logout } = useStaffAuth();

    return (
        <header className="h-20 bg-white border-b border-slate-200 z-[100] px-8 flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <BusFront size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter text-slate-900">BRT Hưng Yên</h1>
                        <p className="text-indigo-600 font-black text-[9px] uppercase tracking-[0.3em] leading-none">Hệ thống Nội bộ</p>
                    </div>
                </div>

                <div className="h-8 w-px bg-slate-100 mx-2 hidden lg:block"></div>

                <button 
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10 active:scale-95"
                >
                    <ArrowLeft size={16} strokeWidth={3} />
                    Quay lại
                </button>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-3 pr-6 border-r border-slate-100">
                    <div className="text-right">
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Ca làm việc</div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">
                                {currentUser?.shiftStart && currentUser?.shiftEnd 
                                    ? `Ca Hiện Tại (${currentUser.shiftStart.slice(0, 5)} - ${currentUser.shiftEnd.slice(0, 5)})` 
                                    : 'Ca Sáng (06:00 - 14:00)'}
                            </span>
                        </div>
                    </div>
                    <button className="relative p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-slate-400">
                        <Bell size={18} />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white"></span>
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div 
                        className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 px-2 py-1.5 rounded-xl transition-all"
                        onClick={() => router.push('/profile')}
                        title="Trang cá nhân"
                    >
                        <div className="text-right hidden sm:block">
                            <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                                {currentUser?.user?.name || currentUser?.name || 'Loading...'}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                                Staff ID: {currentUser?.username || '---'}
                            </div>
                        </div>
                        <StaffAvatar
                            src={currentUser?.user?.avatar ? `http://localhost:3000${currentUser.user.avatar}` : (currentUser?.avatar ? `http://localhost:3000${currentUser.avatar}` : undefined)}
                            name={currentUser?.user?.name || currentUser?.name}
                        />
                    </div>
                    <div className="w-px h-8 bg-slate-100 mx-1"></div>
                    <button
                        onClick={logout}
                        className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all shadow-sm active:scale-95"
                        title="Đăng xuất"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};
