"use client";

import React from 'react';
import { BusFront, ShieldCheck, Fingerprint } from 'lucide-react';

export const BrandingSection: React.FC = () => {
    return (
        <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden flex-col justify-between p-16">
            {/* Dynamic Background */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center grayscale-[0.2] brightness-[0.4]"
                style={{ backgroundImage: "url('/login2.png')" }}
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#3E2723]/95 via-[#5D4037]/80 to-[#DDB892]/20" />
            
            {/* Micro-animations Background Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse duration-[10000ms]"></div>
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-amber-200/10 rounded-full blur-[80px]"></div>

            <div className="relative z-20">
                <div className="flex items-center gap-4 mb-20 animate-in fade-in slide-in-from-top-10 duration-1000">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center justify-center shadow-2xl">
                        <BusFront size={32} className="text-[#EFDDC4]" />
                    </div>
                    <div className="h-10 w-px bg-white/20 mx-2"></div>
                    <div>
                        <h1 className="text-white font-black text-3xl tracking-tighter leading-none mb-1">HY-BRT</h1>
                        <span className="text-[#EFDDC4]/60 font-bold text-[10px] uppercase tracking-[0.4em]">Internal System</span>
                    </div>
                </div>

                <div className="max-w-xl animate-in fade-in slide-in-from-left-10 duration-1000 delay-300">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-8">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                        <span className="text-white/70 text-[9px] font-black uppercase tracking-widest">Network Secure Access</span>
                    </div>
                    <h2 className="text-white text-7xl font-black tracking-tight leading-[0.9] mb-8">
                        Staff <br/><span className="text-[#DDB892]">Terminal</span>
                    </h2>
                    <p className="text-slate-300 font-medium text-xl leading-relaxed opacity-80 decoration-slate-500">
                        Cổng xác thực nghiệp vụ dành riêng cho Nhân viên Soát vé và Quản lý Ga Hưng Yên BRT. 
                        Giám sát luồng khách, bán vé và kiểm soát trạm thời gian thực.
                    </p>
                </div>
            </div>

            <div className="relative z-20 flex items-end justify-between animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                <div className="flex items-center gap-6">
                    <div className="flex -space-x-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-12 h-12 rounded-2xl bg-white/10 border-2 border-[#3E2723] backdrop-blur-md flex items-center justify-center">
                                <ShieldCheck size={20} className="text-[#EFDDC4]/30" />
                            </div>
                        ))}
                    </div>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-loose">
                        +250 Staffs <br/> Online Globally
                    </p>
                </div>
                
                <div className="text-right">
                    <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Version 2.4.5-Enterprise</p>
                    <div className="flex gap-4 justify-end opacity-40">
                        <ShieldCheck size={20} className="text-[#DDB892]" />
                        <Fingerprint size={20} className="text-[#DDB892]" />
                    </div>
                </div>
            </div>
        </div>
    );
};
