"use client";

import React, { useRef } from 'react';
import { 
    IdCard, Camera, CheckCircle, 
    User as UserIcon, Calendar, MapPinned, 
    Phone, Mail, ScanLine, ShieldCheck, Loader2
} from 'lucide-react';
import { InputText } from 'primereact/inputtext';

interface RegistrationFormProps {
    cccd: string;
    setCccd: (v: string) => void;
    fullName: string;
    setFullName: (v: string) => void;
    dob: string;
    setDob: (v: string) => void;
    issueDate: string;
    setIssueDate: (v: string) => void;
    gender: string;
    setGender: (v: string) => void;
    address: string;
    setAddress: (v: string) => void;
    phone: string;
    setPhone: (v: string) => void;
    email: string;
    setEmail: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    frontImage: string | null;
    backImage: string | null;
    avatarImage: string | null;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => void;
    onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onScan: () => void;
    scanned: boolean;
    isScanning?: boolean;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
    cccd, setCccd, fullName, setFullName, dob, setDob, issueDate, setIssueDate,
    gender, setGender, address, setAddress, phone, setPhone,
    email, setEmail, password, setPassword, frontImage, backImage, avatarImage, onImageUpload,
    onAvatarUpload, onScan, scanned, isScanning
}) => {
    const frontInputRef = useRef<HTMLInputElement>(null);
    const backInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                <IdCard size={20} className="text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Hồ sơ khách hàng</h2>
            </div>

            {/* Portraits & Documents */}
            <div className="grid grid-cols-12 gap-8 mb-10">
                <div className="col-span-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Định danh hình ảnh</h3>
                    <p className="text-xs text-slate-400 leading-relaxed italic">Vui lòng tải ảnh chân dung và 2 mặt CCCD.</p>
                </div>
                <div className="col-span-8">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {/* Avatar */}
                        <div onClick={() => !isScanning && avatarInputRef.current?.click()} className={`h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${avatarImage ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-100 bg-slate-50 hover:bg-white'}`}>
                            {avatarImage ? <img src={avatarImage} className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 shadow-lg" alt="Avatar" /> : <div className="flex flex-col items-center gap-1"><UserIcon size={20} className="text-slate-300"/><span className="text-[9px] font-bold text-slate-400 uppercase">Ảnh chân dung</span></div>}
                            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarUpload} />
                        </div>
                        {/* Front */}
                        <div onClick={() => !isScanning && frontInputRef.current?.click()} className={`h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${frontImage ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-100 bg-slate-50 hover:bg-white'}`}>
                            {frontImage ? <div className="flex flex-col items-center gap-1"><CheckCircle size={20} className="text-emerald-500"/><span className="text-[9px] font-bold text-emerald-600 uppercase">Mặt trước OK</span></div> : <div className="flex flex-col items-center gap-1"><Camera size={20} className="text-slate-300"/><span className="text-[9px] font-bold text-slate-400 uppercase">CCCD Mặt trước</span></div>}
                            <input ref={frontInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onImageUpload(e, 'front')} />
                        </div>
                        {/* Back */}
                        <div onClick={() => !isScanning && backInputRef.current?.click()} className={`h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${backImage ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-100 bg-slate-50 hover:bg-white'}`}>
                            {backImage ? <div className="flex flex-col items-center gap-1"><CheckCircle size={20} className="text-emerald-500"/><span className="text-[9px] font-bold text-emerald-600 uppercase">Mặt sau OK</span></div> : <div className="flex flex-col items-center gap-1"><Camera size={20} className="text-slate-300"/><span className="text-[9px] font-bold text-slate-400 uppercase">CCCD Mặt sau</span></div>}
                            <input ref={backInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onImageUpload(e, 'back')} />
                        </div>
                    </div>
                    <button onClick={onScan} disabled={!frontImage || isScanning} className={`w-full h-11 rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-2 transition-all ${frontImage && !isScanning ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                        {isScanning ? <Loader2 size={14} className="animate-spin" /> : <ScanLine size={14} />}
                        {isScanning ? 'Đang trích xuất...' : 'Trích xuất dữ liệu tự động'}
                    </button>
                </div>
            </div>

            {/* Personal Information Fields */}
            <div className="grid grid-cols-12 gap-8 pt-8 border-t border-slate-50">
                <div className="col-span-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Thông tin chi tiết</h3>
                    <p className="text-xs text-slate-400 leading-relaxed italic">Vui lòng kiểm tra và bổ sung các thông tin còn thiếu.</p>
                </div>
                
                <div className="col-span-8 grid grid-cols-2 gap-4">
                    {/* Row 1: CCCD & Phone */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Số Căn cước <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <InputText value={cccd} onChange={(e) => setCccd(e.target.value)} placeholder="Nhập số CCCD" className="w-full pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 text-sm font-bold" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Số điện thoại <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <InputText value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nhập số điện thoại" className="w-full pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 text-sm font-bold" />
                        </div>
                    </div>

                    {/* Row 2: FullName (Span 2) */}
                    <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Họ và Tên <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <InputText value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="NGUYỄN VĂN A" className="w-full pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 text-sm font-bold uppercase" />
                        </div>
                    </div>

                    {/* Row 3: DOB & Issue Date */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngày sinh <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <InputText value={dob} onChange={(e) => setDob(e.target.value)} placeholder="YYYY-MM-DD" className="w-full pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 text-sm font-bold" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngày cấp <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <InputText value={issueDate} onChange={(e) => setIssueDate(e.target.value)} placeholder="YYYY-MM-DD" className="w-full pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 text-sm font-bold" />
                        </div>
                    </div>

                    {/* Row 4: Address (Span 2) */}
                    <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Địa chỉ thường trú <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <InputText value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Nhập địa chỉ đầy đủ" className="w-full pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 text-sm font-bold" />
                        </div>
                    </div>

                    {/* Row 5: Gender & Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Giới tính</label>
                        <div className="flex gap-2 h-11">
                            <button onClick={() => setGender('Nam')} className={`flex-1 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${gender === 'Nam' ? 'bg-indigo-50 border-indigo-600 text-indigo-600 ring-1 ring-indigo-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                                <div className={`w-3 h-3 rounded-full border-2 ${gender === 'Nam' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`} /> Nam
                            </button>
                            <button onClick={() => setGender('Nữ')} className={`flex-1 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${gender === 'Nữ' ? 'bg-indigo-50 border-indigo-600 text-indigo-600 ring-1 ring-indigo-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                                <div className={`w-3 h-3 rounded-full border-2 ${gender === 'Nữ' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`} /> Nữ
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mật khẩu tài khoản <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <InputText type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tạo mật khẩu đăng ký" className="w-full pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 text-sm font-bold" />
                        </div>
                    </div>

                    {/* Row 6: Email */}
                    <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email (Tùy chọn)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <InputText value={email} onChange={(e) => setEmail(e.target.value)} placeholder="VD: email@doanhuy.com" className="w-full pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 text-sm font-bold" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
