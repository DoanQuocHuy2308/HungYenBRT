"use client";

import React from 'react';
import { 
    CheckCircle, XCircle, AlertTriangle, MapPin, 
    Ticket, CalendarDays, CreditCard, Clock, 
    User as UserIcon, IdCard, Phone, Mail,
    FileText, X
} from 'lucide-react';
import { StatusBadge } from '../../ui/StatusBadge';
import { StaffButton } from '../../ui/StaffButton';

interface TicketDetailPanelProps {
    ticket: any | null;
    onClose: () => void;
}

export const TicketDetailPanel: React.FC<TicketDetailPanelProps> = ({ ticket, onClose }) => {
    if (!ticket) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in fade-in duration-500 bg-white h-full">
                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
                    <FileText size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Chi tiết hồ sơ vé</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                    Chọn một mã vé từ bảng điều khiển bên trái để xem đầy đủ thông tin chi tiết.
                </p>
            </div>
        );
    }

    const isSuccess = ['active', 'unused', 'issued'].includes(ticket.status);
    const isError = ['expired'].includes(ticket.status);

    return (
        <div className="p-8 flex flex-col h-full overflow-y-auto animate-in slide-in-from-right-8 duration-500 bg-white custom-scrollbar">
            {/* Status Header Overlay */}
            <div className={`
                rounded-2xl p-6 mb-8 flex items-center gap-5 border
                ${isSuccess ? 'bg-emerald-50 border-emerald-200' : isError ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}
            `}>
                <div className={`
                    w-14 h-14 rounded-full flex items-center justify-center
                    ${isSuccess ? 'bg-emerald-100 text-emerald-600' : isError ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}
                `}>
                    {isSuccess ? <CheckCircle size={32} />
                     : isError ? <XCircle size={32} />
                     : <AlertTriangle size={32} />}
                </div>
                <div>
                    <h3 className={`font-bold text-xl mb-1 ${
                        isSuccess ? 'text-emerald-700' : isError ? 'text-red-700' : 'text-slate-700'
                    }`}>
                        {isSuccess ? 'VÉ HỢP LỆ' : isError ? 'VÉ HẾT HẠN' : 'ĐÃ SỬ DỤNG'}
                    </h3>
                    <span className={`font-medium text-xs ${isSuccess ? 'text-emerald-600' : isError ? 'text-red-600' : 'text-slate-500'}`}>Dữ liệu hệ thống trung tâm</span>
                </div>
            </div>

            {/* Core Info Badges */}
            <div className="flex gap-3 mb-8 px-1">
                <StatusBadge status={ticket.status} className="h-8 flex items-center px-4 rounded-full" />
                <span className={`px-4 py-1.5 rounded-full font-semibold text-xs border
                    ${ticket.type === 'single' ? 'bg-white text-slate-600 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-100'}
                `}>
                    {ticket.type === 'single' ? 'Loại: Vé Lượt' : 'Loại: Vé Tháng'}
                </span>
            </div>

            {/* Ticket Data Grid */}
            <div className="mb-8 px-1">
                <h4 className="text-slate-500 font-semibold text-xs tracking-wide mb-3">THÔNG TIN VÉ</h4>
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm divide-y divide-slate-100">
                    <div className="flex justify-between items-center py-3">
                        <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                            <Ticket size={16} className="text-slate-400" /> Mã Vé Hệ Thống
                        </span>
                        <span className="font-bold text-slate-800 text-sm font-mono">{ticket.code}</span>
                    </div>
                    {ticket.type === 'single' ? (
                        <>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                                    <MapPin size={16} className="text-slate-400" /> Tuyến đi
                                </span>
                                <span className="font-semibold text-slate-800 text-sm">{ticket.departure}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                                    <MapPin size={16} className="text-slate-400" /> Tuyến đến
                                </span>
                                <span className="font-semibold text-slate-800 text-sm">{ticket.destination}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                                    <FileText size={16} className="text-slate-400" /> Gói Cước
                                </span>
                                <span className="font-semibold text-slate-800 text-sm">{ticket.packageName}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                                    <CalendarDays size={16} className="text-slate-400" /> Hiệu lực đến
                                </span>
                                <span className={`font-semibold text-sm ${isSuccess ? 'text-emerald-600' : 'text-red-500'}`}>{ticket.expiryDate}</span>
                            </div>
                        </>
                    )}
                    <div className="flex justify-between items-center py-3">
                        <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                            <CreditCard size={16} className="text-slate-400" /> Hình thức thanh toán
                        </span>
                        <span className="font-semibold text-slate-800 text-sm">{ticket.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 mt-1 border-t border-dashed border-slate-200">
                        <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                            <Ticket size={16} className="text-slate-400" /> Giá vé
                        </span>
                        <span className="font-bold text-blue-600 text-sm">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticket.price || 0)}</span>
                    </div>
                </div>
            </div>

            {/* Customer Data (Enhanced) */}
            {ticket.customer && (
                <div className="px-1 mb-8">
                    <h4 className="text-slate-500 font-semibold text-xs tracking-wide mb-3">ĐỊNH DANH HÀNH KHÁCH</h4>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="bg-slate-50 p-5 flex items-center gap-4 border-b border-slate-200">
                            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                                {ticket.customer.avatar ? (
                                    <img src={`http://localhost:3000${ticket.customer.avatar}`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <UserIcon size={24} className="text-slate-400" />
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg uppercase">{ticket.customer.fullName}</h4>
                                <span className="text-slate-500 font-medium text-[11px] tracking-wide">{ticket.customer.gender} • {ticket.customer.dob}</span>
                            </div>
                        </div>
                        <div className="p-5 space-y-2 divide-y divide-slate-100">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><IdCard size={14} className="text-slate-400" /> CCCD</span>
                                <span className="font-semibold text-slate-800 text-sm font-mono">{ticket.customer.cccd}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><Phone size={14} className="text-slate-400" /> Số điện thoại</span>
                                <span className="font-semibold text-slate-800 text-sm">{ticket.customer.phone}</span>
                            </div>
                            {ticket.customer.email && (
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><Mail size={14} className="text-slate-400" /> Email</span>
                                    <span className="font-semibold text-slate-800 text-sm">{ticket.customer.email}</span>
                                </div>
                            )}
                            {ticket.customer.address && (
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> Địa chỉ</span>
                                    <span className="font-semibold text-slate-800 text-sm text-right max-w-[200px] truncate" title={ticket.customer.address}>{ticket.customer.address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!ticket.customer && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 mb-8 px-1 mx-1">
                    <AlertTriangle size={20} className="text-slate-400 flex-shrink-0" />
                    <span className="text-slate-600 font-medium text-xs leading-relaxed">
                        Vé lượt tiêu chuẩn không yêu cầu thu thập dữ liệu định danh sinh trắc học của hành khách.
                    </span>
                </div>
            )}

            <div className="mt-auto px-1 flex gap-3 pb-2">
                <StaffButton 
                    variant="secondary" 
                    label="Đóng" 
                    onClick={onClose} 
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border-none h-12"
                />
                <StaffButton 
                    variant="primary" 
                    label="In hóa đơn" 
                    icon={<FileText size={16} />}
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 h-12"
                />
            </div>
        </div>
    );
};
