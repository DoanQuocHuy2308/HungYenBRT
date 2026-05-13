"use client";

import React, { useState, useRef } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, BusFront, MapPin, Bus, LayoutDashboard } from 'lucide-react';
import { Toast } from 'primereact/toast';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { loginAdmin, loading, error } = useAuth();
  const toast = useRef<Toast>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!username || !password) {
      toast.current?.show({ severity: 'error', summary: 'Thông tin trống', detail: 'Tên đăng nhập và mật khẩu không được để rỗng.', life: 3000 });
      return;
    }

    const res = await loginAdmin(username, password);
    if (res && res.success) {
       toast.current?.show({ severity: 'success', summary: 'Xác thực Thành công', detail: 'Đang chuyển hướng vào Dashboard...', life: 1500 });
       setTimeout(() => {
           window.location.href = '/dashboard'; 
       }, 1500);
    } else {
       toast.current?.show({ severity: 'error', summary: 'Lỗi Đăng Nhập', detail: 'Tài khoản hoặc mật khẩu không chính xác.', life: 3000 });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] font-sans antialiased overflow-hidden">
      <Toast ref={toast} position="top-right" />
      
      {/* ───────────────────────────────────────────────────────── */}
      {/* LEFT PANEL : BRANDING & GRAPHICS                        */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:flex-[1.2] relative overflow-hidden flex-col justify-between p-12">
        {/* Background Image */}
        <div 
           className="absolute inset-0 bg-cover bg-center z-0" 
           style={{ backgroundImage: 'url(/login2.png)' }} 
        />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-0" />

        {/* Top Logo Area */}
        <div className="relative z-10 flex items-center gap-3">
           <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-orange-300 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/50">
              <BusFront size={28} className="text-[#3E2723]" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Hưng Yên BRT</h1>
              <p className="text-amber-200/90 font-bold text-[10px] uppercase tracking-[0.2em] drop-shadow-md">Hệ Thống Quản Lý</p>
           </div>
        </div>

        {/* Center spacing since image provides graphics */}
        <div className="flex-1" />

        {/* Bottom Text Area */}
        <div className="relative z-10 max-w-md">
           <h2 className="text-4xl font-black text-white mb-4 leading-tight">Admin<br/><span className="text-amber-300">Workspace</span></h2>
           <p className="text-white/60 font-medium text-sm leading-relaxed mb-8">
              Khu vực dành riêng cho Ban Quản Lý Hệ Thống BRT Hưng Yên. Theo dõi tuyến đường, quản lý ga, thống kê thẻ xe buýt và giám sát doanh thu theo thời gian thực.
           </p>
           <div className="flex items-center gap-4 text-xs font-bold text-white/40 uppercase tracking-widest">
              <span>Secure Connection</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>System Online</span>
           </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* RIGHT PANEL : LOGIN FORM                                  */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white relative">
        {/* Mobile Logo - Only visible on small screens */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
           <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-400 rounded-xl flex items-center justify-center shadow-md">
              <BusFront size={22} className="text-white" />
           </div>
           <div>
              <h1 className="text-xl font-black text-[#5D4037] tracking-tight">Hưng Yên BRT</h1>
              <p className="text-amber-600 font-bold text-[9px] uppercase tracking-[0.2em]">Hệ Thống Quản Lý</p>
           </div>
        </div>

        <div className="w-full max-w-md lg:px-6">
          <div className="mb-10 lg:text-left text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-2">Đăng Nhập</h2>
            <p className="text-slate-500 font-medium">Truy cập vào trung tâm điều hành BRT</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Username Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={20} className="text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Tên đăng nhập (Admin ID)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-4 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 font-semibold placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all focus:ring-4 focus:ring-amber-400/10"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={20} className="text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <input 
                type="password" 
                placeholder="Mật khẩu bảo mật"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-4 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 font-semibold placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all focus:ring-4 focus:ring-amber-400/10"
                required
              />
            </div>

            {/* Remember & Forgot options */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded-md border-2 border-slate-300 group-hover:border-amber-500 transition-colors bg-white">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="absolute inset-0 bg-amber-500 rounded-sm scale-0 peer-checked:scale-100 transition-transform flex items-center justify-center border-none">
                     <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-600 select-none">Ghi nhớ đăng nhập</span>
              </label>
              
              <button type="button" className="text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors">
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
               <button 
                 type="submit" 
                 disabled={loading}
                 className="group relative w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[#5D4037] to-[#7A5448] hover:from-[#4E342E] hover:to-[#5D4037] text-white font-black text-lg uppercase tracking-wider shadow-lg shadow-orange-900/20 transition-all overflow-hidden"
               >
                 {loading ? (
                   <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                   <>
                     ĐĂNG NHẬP
                     <ArrowRight size={20} className="text-amber-200 group-hover:translate-x-1 transition-transform" />
                   </>
                 )}
               </button>
            </div>

          </form>

          {/* Footer Warning */}
          <div className="mt-12 text-center border-t border-slate-100 pt-6">
             <p className="text-xs font-semibold text-slate-400 leading-relaxed">
               Hệ thống chỉ dành cho Ban Quản Lý nội bộ.<br/>Truy cập trái phép sẽ bị ghi log và xử lý theo quy định bảo mật.
             </p>
          </div>
        </div>

      </div>

    </div>
  );
}
