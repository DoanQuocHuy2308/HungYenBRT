"use client";

import React, { useState } from 'react';
import { User, Lock, RefreshCcw, ChevronRight, Info, BusFront } from 'lucide-react';
import { Password } from 'primereact/password';
import { StaffInput } from '../../ui/StaffInput';
import { StaffButton } from '../../ui/StaffButton';
import { useStaffAuth } from '../../../hooks/useAuth';

interface LoginFormProps {
    onSuccess: () => void;
    onError: (msg: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useStaffAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            onError('Tài khoản và mật khẩu là bắt buộc.');
            return;
        }

        const res = await login(username, password);
        if (res && res.success) {
            onSuccess();
        } else {
            onError(error || 'Tài khoản hoặc mật khẩu không chính xác.');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-right-10 duration-1000 delay-300">
            {/* Logo Mobile */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-16">
                <div className="w-12 h-12 bg-[#5D4037] rounded-2xl flex items-center justify-center shadow-2xl">
                    <BusFront size={24} className="text-[#EFDDC4]" />
                </div>
                <h1 className="text-[#3E2723] font-black text-2xl tracking-tighter uppercase">HY-BRT</h1>
            </div>

            <div className="mb-14 text-center lg:text-left">
                <h3 className="text-[#3E2723] text-5xl font-black tracking-tight mb-4 uppercase">Đăng nhập</h3>
                <div className="flex items-center justify-center lg:justify-start gap-4">
                    <div className="w-10 h-[2px] bg-[#DDB892]"></div>
                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">
                        Terminal Security Access
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <StaffInput 
                        label="Credential Identifier"
                        value={username}
                        onChange={setUsername}
                        placeholder="Mã nhân viên / Username"
                        icon={<User size={20} strokeWidth={2.5} />}
                    />

                    <div className="space-y-2.5 group">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-slate-400 font-black text-[9px] uppercase tracking-[0.25em] ml-1 group-focus-within:text-[#5D4037] transition-colors">
                                Encrypted Key
                            </label>
                            <a href="#" className="text-[#DDB892] text-[9px] font-black uppercase tracking-widest hover:text-[#5D4037] transition-colors">
                                Quên mật khẩu?
                            </a>
                        </div>
                        <div className="relative flex items-center h-14 w-full">
                            <div className="absolute left-5 text-slate-300 group-focus-within:text-[#5D4037] transition-all z-10">
                                <Lock size={20} strokeWidth={2.5} />
                            </div>
                            <Password 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                toggleMask 
                                feedback={false}
                                placeholder="Security Password"
                                inputClassName="w-full h-full pl-14 pr-12 bg-slate-50 border-none rounded-2xl text-slate-800 font-bold text-sm tracking-tight placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all shadow-inner"
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <StaffButton 
                        type="submit"
                        loading={loading}
                        label="Xác nhận trạm"
                        icon={<ChevronRight size={18} className="text-[#DDB892]" />}
                        className="w-full h-16"
                    />
                </div>
            </form>

            <div className="mt-20">
                <div className="p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 flex items-start gap-4">
                    <Info size={18} className="text-slate-300 mt-1 shrink-0" />
                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                        Hệ thống giám sát bảo mật cấp 2. Chỉ có tài khoản vai trò <span className="text-[#5D4037]">"Staff"</span> mới được phép truy cập. 
                        Xác nhận thông tin trước khi khởi tạo phiên terminal.
                    </p>
                </div>
            </div>
            
            <style jsx global>{`
                .p-password-input {
                    width: 100% !important;
                }
            `}</style>
        </div>
    );
};
