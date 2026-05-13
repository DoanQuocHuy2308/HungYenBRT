"use client";

import React from 'react';
import { Search, Clock, User as UserIcon } from 'lucide-react';
import { StaffInput } from '../../ui/StaffInput';
import { StatusBadge } from '../../ui/StatusBadge';

interface TicketSearchSidebarProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    filteredTickets: any[];
    selectedTicketCode?: string;
    onSelectTicket: (ticket: any) => void;
}

export const TicketSearchSidebar: React.FC<TicketSearchSidebarProps> = ({
    searchQuery,
    setSearchQuery,
    filteredTickets,
    selectedTicketCode,
    onSelectTicket
}) => {
    return (
        <div className="flex flex-col h-full bg-slate-50 border-r border-slate-100">
            {/* Search Bar */}
            <div className="p-6 pb-2">
                <StaffInput 
                    label="Tìm kiếm vé"
                    placeholder="Nhập mã vé, Tên, SĐT, CCCD..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    icon={<Search size={18} className="text-slate-400" />}
                    className="mb-4"
                />
                <div className="flex items-center justify-between px-1">
                    <span className="text-slate-500 font-medium text-xs">
                        Đã tìm thấy <span className="font-bold text-slate-800">{filteredTickets.length}</span> bản ghi
                    </span>
                    <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    </div>
                </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredTickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Search size={32} className="text-slate-300 mb-3" />
                        <h3 className="font-medium text-slate-400 text-sm">Không có dữ liệu</h3>
                    </div>
                ) : (
                    filteredTickets.map((ticket, i) => (
                        <button
                            key={i}
                            onClick={() => onSelectTicket(ticket)}
                            className={`
                                w-full text-left bg-white rounded-xl border p-4 transition-all duration-200
                                ${selectedTicketCode === ticket.code 
                                    ? 'border-blue-500 shadow-md ring-2 ring-blue-50' 
                                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}
                            `}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-sm text-slate-800 font-mono">{ticket.code}</span>
                                <StatusBadge status={ticket.status} />
                            </div>
                            
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`
                                    px-2 py-0.5 rounded text-[10px] font-semibold border
                                    ${ticket.type === 'single' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-100'}
                                `}>
                                    {ticket.type === 'single' ? 'Vé Lượt' : 'Vé Tháng'}
                                </span>
                                <span className="text-slate-600 font-medium text-xs truncate">
                                    {ticket.type === 'single' ? `${ticket.departure} → ${ticket.destination}` : ticket.packageName}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px]">
                                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                    <Clock size={12} className="text-slate-400" /> {new Date(ticket.purchaseDate).toLocaleDateString('vi-VN')}
                                </span>
                                <span className="font-bold text-blue-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticket.price || 0)}</span>
                            </div>

                            {ticket.customer && (
                                <div className="mt-3 pt-3 flex items-center gap-2 border-t border-slate-100">
                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                        <UserIcon size={10} className="text-slate-500" />
                                    </div>
                                    <span className="font-semibold text-[11px] text-slate-700">{ticket.customer.fullName}</span>
                                </div>
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};
