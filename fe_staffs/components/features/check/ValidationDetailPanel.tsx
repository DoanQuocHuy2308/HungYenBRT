"use client";

import React from 'react';
import { 
    CheckCircle, XCircle, AlertTriangle, RefreshCw, 
    ScanLine, MapPin, Ticket, CalendarDays, 
    CreditCard, Clock, User as UserIcon, IdCard, 
    Phone, Mail 
} from 'lucide-react';
import { StaffButton } from '../../ui/StaffButton';

interface ValidationDetailPanelProps {
    scanState: "idle" | "scanning" | "found" | "not-found";
    ticketData: any | null;
    onReset: () => void;
}

export const ValidationDetailPanel: React.FC<ValidationDetailPanelProps> = ({
    scanState,
    ticketData,
    onReset
}) => {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-700">
            {/* IDLE STATE */}
            {scanState === "idle" && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
                    <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-8 border border-slate-100">
                        <ScanLine size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Sẵn sàng kiểm tra</h3>
                    <p className="text-slate-500 text-sm max-w-[280px]">
                        Đang chờ dữ liệu đầu vào từ máy quét camera hoặc mã vé nhập thủ công.
                    </p>
                </div>
            )}

            {/* SCANNING STATE */}
            {scanState === "scanning" && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
                    <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-8 border border-blue-100">
                        <RefreshCw size={40} className="text-blue-500 animate-spin" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Đang tra cứu...</h3>
                    <p className="text-slate-500 text-sm">Kết nối với hệ thống trung tâm</p>
                </div>
            )}

            {/* NOT FOUND STATE */}
            {scanState === "not-found" && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
                    <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-8 border border-red-100">
                        <XCircle size={48} className="text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy vé</h3>
                    <p className="text-slate-500 text-sm mb-8 max-w-[280px]">
                        Hệ thống không ghi nhận bất kỳ chứng chỉ hợp lệ nào cho mã vừa cung cấp.
                    </p>
                    <StaffButton 
                        label="Làm mới" 
                        variant="secondary" 
                        className="text-slate-600 bg-slate-100 hover:bg-slate-200"
                        onClick={onReset}
                    />
                </div>
            )}

            {/* FOUND STATE */}
            {scanState === "found" && ticketData && (
                <div className="p-8 flex flex-col h-full bg-white">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3 pb-4 border-b border-slate-100">
                        <CheckCircle size={24} className="text-blue-500" /> Kết quả tra cứu
                    </h2>

                    {/* Minimalist Status Banner */}
                    <div className={`
                        p-6 rounded-2xl mb-8 flex items-center gap-5 border
                        ${['active', 'unused', 'issued'].includes(ticketData.status) 
                            ? 'bg-emerald-50 border-emerald-200' 
                            : 'bg-red-50 border-red-200'
                        }
                    `}>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center
                            ${['active', 'unused', 'issued'].includes(ticketData.status) ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}
                        `}>
                            {['active', 'unused', 'issued'].includes(ticketData.status) ? <CheckCircle size={32} /> : <XCircle size={32} />}
                        </div>
                        <div>
                            <h3 className={`font-bold text-xl mb-1
                                ${['active', 'unused', 'issued'].includes(ticketData.status) ? 'text-emerald-700' : 'text-red-700'}
                            `}>
                                {ticketData.status === 'unused' ? "Vé chưa sử dụng" : 
                                 ticketData.status === 'active' ? "Đang sử dụng" : 
                                 ticketData.status === 'issued' ? "Vé mới cấp" :
                                 ticketData.status === 'used' ? "Đã sử dụng hết" : "Chứng chỉ Hết hạn"}
                            </h3>
                            <div className={`flex items-center gap-2 text-sm font-medium
                                ${['active', 'unused', 'issued'].includes(ticketData.status) ? 'text-emerald-600' : 'text-red-600'}
                            `}>
                                <ScanLine size={16} />
                                <span>ID: {ticketData.code}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {/* Ticket Class Module */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-slate-500 font-semibold text-xs tracking-wide">THÔNG TIN VÉ</span>
                                <span className={`
                                    px-2.5 py-1 rounded-md font-semibold text-[10px] uppercase shadow-sm border
                                    ${ticketData.type === 'single' ? 'bg-white text-slate-700 border-slate-200' : 'bg-blue-50 text-blue-700 border-blue-100'}
                                `}>
                                    {ticketData.type === 'single' ? 'Vé Lượt Cơ Bản' : 'Vé Thuê Bao'}
                                </span>
                            </div>
                            
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm divide-y divide-slate-100">
                                {ticketData.type === "single" ? (
                                    <>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><MapPin size={16} className="text-slate-400" /> Tuyến đi</span>
                                            <span className="font-semibold text-slate-800 text-sm">{ticketData.departure}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><MapPin size={16} className="text-slate-400" /> Tuyến đến</span>
                                            <span className="font-semibold text-slate-800 text-sm">{ticketData.destination}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><Ticket size={16} className="text-slate-400" /> Số lượng</span>
                                            <span className="font-semibold text-slate-800 text-sm">{ticketData.quantity || 1} vé</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><Ticket size={16} className="text-slate-400" /> Gói cước</span>
                                            <span className="font-semibold text-slate-800 text-sm">{ticketData.packageName}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><CalendarDays size={16} className="text-slate-400" /> Hiệu lực đến</span>
                                            <span className={`font-semibold text-sm ${['active', 'unused', 'issued'].includes(ticketData.status) ? 'text-emerald-600' : 'text-red-500'}`}>{ticketData.expiryDate}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><CreditCard size={16} className="text-slate-400" /> Thanh toán</span>
                                    <span className="font-semibold text-slate-800 text-sm">{ticketData.paymentMethod || 'Chuyển khoản'}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><Ticket size={16} className="text-slate-400" /> Giá vé</span>
                                    <span className="font-semibold text-slate-800 text-sm text-blue-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticketData.price || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 mt-1 border-t border-dashed border-slate-200">
                                    <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wide flex items-center gap-2"><Clock size={14}/> Thời gian phát hành</span>
                                    <span className="font-medium text-slate-500 text-xs">{new Date(ticketData.purchaseDate).toLocaleString('vi-VN')}</span>
                                </div>
                            </div>
                        </div>

                        {ticketData.customer && (
                            <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-700">
                                <span className="text-slate-500 font-semibold text-xs tracking-wide px-1 block">ĐỊNH DANH HÀNH KHÁCH</span>
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                    <div className="bg-slate-50 p-5 flex items-center gap-4 border-b border-slate-200">
                                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                                            {ticketData.customer.avatar ? (
                                                <img src={`http://localhost:3000${ticketData.customer.avatar}`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <UserIcon size={24} className="text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg uppercase">{ticketData.customer.fullName}</h4>
                                            <span className="text-slate-500 font-medium text-[11px] tracking-wide">{ticketData.customer.gender} • {ticketData.customer.dob}</span>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-2 divide-y divide-slate-100">
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><IdCard size={14} className="text-slate-400" /> CCCD</span>
                                            <span className="font-semibold text-slate-800 text-sm font-mono">{ticketData.customer.cccd}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><Phone size={14} className="text-slate-400" /> Số điện thoại</span>
                                            <span className="font-semibold text-slate-800 text-sm">{ticketData.customer.phone}</span>
                                        </div>
                                        {ticketData.customer.email && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><Mail size={14} className="text-slate-400" /> Email</span>
                                                <span className="font-semibold text-slate-800 text-sm">{ticketData.customer.email}</span>
                                            </div>
                                        )}
                                        {ticketData.customer.address && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> Địa chỉ</span>
                                                <span className="font-semibold text-slate-800 text-sm text-right max-w-[200px] truncate" title={ticketData.customer.address}>{ticketData.customer.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!ticketData.customer && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertTriangle size={20} className="text-slate-400 flex-shrink-0" />
                                <span className="text-slate-600 font-medium text-xs leading-relaxed">
                                    Vé lượt tiêu chuẩn không yêu cầu thu thập dữ liệu định danh sinh trắc học của hành khách.
                                </span>
                            </div>
                        )}

                        <StaffButton 
                            label="Hoàn tất phiên quét" 
                            variant="secondary"
                            className="w-full h-12 mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border-none"
                            onClick={onReset}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
