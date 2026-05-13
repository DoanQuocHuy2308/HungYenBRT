"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { 
    Ticket, ShoppingCart, Users, Activity, 
    Search, RefreshCw, QrCode, ArrowRight,
    CheckCircle2, Clock, XCircle, ShieldAlert,
    CircleDollarSign, TrendingUp, Filter, Eye,
    CreditCard, Calendar, User, History, MapPin,
    ArrowUpRight, ArrowDownLeft, Ban, RotateCcw,
    ChevronRight, MoreHorizontal, FileText, ExternalLink, Printer
} from 'lucide-react';
import { ticketService, ticketLogService } from '../../../services/managementService';

const fmt = (n: any) => {
    const val = parseFloat(n);
    if (isNaN(val)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

export default function TicketsPage() {
    const toast = useRef<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [stats, setStats] = useState({ ordersToday: 0, totalRevenue: 0, activeTickets: 0, usedTickets: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedRows, setExpandedRows] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    // Detail Modal State
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [logDialogVisible, setLogDialogVisible] = useState(false);
    const [selectedTicketLogs, setSelectedTicketLogs] = useState<any[]>([]);
    const [logLoading, setLogLoading] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [ordersRes, statsRes]: any[] = await Promise.all([
                ticketService.getAllOrders({ search, status: statusFilter || undefined }),
                ticketService.getStats(),
            ]);
            setOrders(ordersRes?.data ?? []);
            setStats(statsRes?.data ?? { ordersToday: 0, totalRevenue: 0, activeTickets: 0, usedTickets: 0 });
        } catch {
            showToast('error', 'Lỗi', 'Không thể tải dữ liệu đơn hàng');
        } finally { setLoading(false); }
    }, [search, statusFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const showToast = (s: 'success' | 'info' | 'warn' | 'error', sum: string, d: string) =>
        toast.current?.show({ severity: s, summary: sum, detail: d, life: 3000 });

    const handleViewDetail = (order: any) => {
        setSelectedOrder(order);
        setDetailVisible(true);
    };

    const handleViewLogs = async (ticketId: string) => {
        setSelectedTicketId(ticketId);
        setLogLoading(true);
        setLogDialogVisible(true);
        try {
            const res: any = await ticketLogService.getByTicket(ticketId);
            setSelectedTicketLogs(res?.data || []);
        } catch {
            showToast('error', 'Lỗi', 'Không thể tải nhật ký quét vé');
        } finally {
            setLogLoading(false);
        }
    };

    const handleRefundOrder = (orderId: string) => {
        confirmDialog({
            header: 'Xác nhận hoàn tiền',
            message: 'Bạn có chắc chắn muốn hoàn tiền cho toàn bộ đơn hàng này? Tất cả các vé chưa sử dụng sẽ bị khóa vĩnh viễn.',
            icon: <RotateCcw className="text-amber-500 mr-2" size={24} />,
            acceptClassName: 'bg-rose-500 text-white rounded-xl border-none',
            rejectClassName: 'p-button-text text-slate-400',
            accept: async () => {
                try {
                    await ticketService.updateOrderStatus(orderId, 'REFUNDED');
                    showToast('success', 'Thành công', 'Đơn hàng đã được hoàn tiền');
                    setDetailVisible(false);
                    fetchData();
                } catch {
                    showToast('error', 'Lỗi', 'Không thể hoàn tiền đơn hàng này');
                }
            }
        });
    };

    const handleDeleteOrder = (orderId: string) => {
        confirmDialog({
            header: 'Xóa đơn hàng vĩnh viễn',
            message: 'Toàn bộ dữ liệu của đơn hàng (vé con, lịch sử quét vé) sẽ bị xóa khỏi hệ thống. Thao tác này không thể hoàn tác. Bạn có chắc chắn?',
            icon: <Ban className="text-red-500 mr-2" size={24} />,
            acceptClassName: 'bg-red-600 text-white rounded-xl border-none',
            rejectClassName: 'p-button-text text-slate-400',
            accept: async () => {
                try {
                    await ticketService.deleteOrder(orderId);
                    showToast('success', 'Thành công', 'Đơn hàng đã được xóa');
                    setDetailVisible(false);
                    fetchData();
                } catch {
                    showToast('error', 'Lỗi', 'Không thể xóa đơn hàng lúc này');
                }
            }
        });
    };

    /* ── Render Templates ────────────────────────────────────────── */
    const orderIdTemplate = (row: any) => (
        <div className="flex flex-col gap-1">
            <span className="font-mono text-xs font-black text-slate-900 tracking-wider">#{row.Id.substring(0, 8).toUpperCase()}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Order Token</span>
        </div>
    );

    const userTemplate = (row: any) => (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                {row.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 leading-none">{row.user?.name || 'Khách vãng lai'}</span>
                <span className="text-[10px] text-slate-400 font-medium mt-1">{row.user?.phone || 'Bán tại quầy'}</span>
            </div>
        </div>
    );

    const statusTemplate = (row: any) => {
        const maps: any = {
            'COMPLETED': { label: 'Hoàn tất', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            'PENDING': { label: 'Chờ duyệt', color: 'bg-amber-50 text-amber-600 border-amber-100' },
            'CANCELLED': { label: 'Đã hủy', color: 'bg-rose-50 text-rose-600 border-rose-100' },
            'REFUNDED': { label: 'Đã hoàn tiền', color: 'bg-slate-100 text-slate-500 border-slate-200' }
        };
        const s = maps[row.status] || { label: row.status, color: 'bg-slate-50 text-slate-400 border-slate-100' };
        return (
            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${s.color}`}>
                {s.label}
            </span>
        );
    };

    const paymentTemplate = (row: any) => {
        const pm = row.payment_method || { Name: 'Tiền mặt', Code: 'CASH' };
        return (
            <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{pm.Name}</span>
                {row.PaymentNote && (
                    <div className="bg-slate-900 text-white px-2 py-0.5 rounded-md w-fit border border-slate-700">
                        <span className="text-[8px] font-mono font-bold tracking-widest">{row.PaymentNote}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-[family-name:var(--font-inter)] text-slate-900">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                        <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                        Quản Lý Đơn Hàng
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">Theo dõi vòng đời vé và đối soát doanh thu thực tế.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    {['ALL', 'COMPLETED', 'PENDING', 'REFUNDED'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s === 'ALL' ? null : s)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${((!statusFilter && s === 'ALL') || statusFilter === s) ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}>
                            {s === 'ALL' ? 'Tất cả' : s === 'COMPLETED' ? 'Thành công' : s === 'PENDING' ? 'Chờ' : 'Hoàn tiền'}
                        </button>
                    ))}
                </div>
            </div>

            {/* STATS INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Doanh thu tổng', value: fmt(stats.totalRevenue), icon: CircleDollarSign, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Đơn hôm nay', value: stats.ordersToday, icon: ShoppingCart, color: 'text-sky-600', bg: 'bg-sky-50' },
                    { label: 'Vé hoạt động', value: stats.activeTickets, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Vé đã sử dụng', value: stats.usedTickets, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 group hover:border-slate-400 transition-all">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.bg} ${s.color} group-hover:scale-110 transition-transform`}>
                            <s.icon size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">{s.label}</span>
                            <span className="text-xl font-black text-slate-900 tracking-tight">{s.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* MAIN DATA TABLE */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <InputText value={search} onChange={e => setSearch(e.target.value)}
                                   placeholder="Tìm Mã đơn, SĐT hoặc Nội dung chuyển khoản..."
                                   className="w-full pl-12 pr-4 py-3 bg-white border-slate-200 rounded-xl text-xs font-bold shadow-sm" />
                    </div>
                    <Button icon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />} 
                            onClick={fetchData} text className="text-slate-400 hover:text-slate-900" />
                </div>

                <DataTable 
                    value={orders} loading={loading} paginator rows={10} rowHover 
                    dataKey="Id" className="p-datatable-clean"
                    emptyMessage={<div className="py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest italic">Hệ thống chưa ghi nhận đơn hàng nào</div>}>
                    <Column header="ĐƠN HÀNG" body={orderIdTemplate} style={{ width: '12%' }} className="pl-8" />
                    <Column header="KHÁCH HÀNG" body={userTemplate} style={{ width: '22%' }} />
                    <Column header="THỜI GIAN" body={(r) => (
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{new Date(r.PurchaseDate).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' })}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(r.PurchaseDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                    )} style={{ width: '15%' }} />
                    <Column header="THANH TOÁN" body={paymentTemplate} style={{ width: '18%' }} />
                    <Column header="TRẠNG THÁI" body={statusTemplate} style={{ width: '12%' }} />
                    <Column header="TỔNG TIỀN" body={(r) => (
                        <div className="text-right">
                            <span className="block text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{fmt(r.total_price)}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">SL: {r.total_quantity} vé</span>
                        </div>
                    )} style={{ width: '13%' }} />
                    <Column header="" body={(r) => (
                        <div className="flex justify-end pr-8">
                            <button onClick={() => handleViewDetail(r)}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                <Eye size={16} />
                            </button>
                        </div>
                    )} style={{ width: '8%' }} />
                </DataTable>
            </div>

            {/* DETAIL MODAL - INDUSTRIAL CLEAN STYLE */}
            <Dialog 
                visible={detailVisible} onHide={() => setDetailVisible(false)}
                header={<div className="flex items-center gap-3"><FileText className="text-slate-400" size={20}/> <span className="font-black text-slate-900 text-lg uppercase tracking-tighter">Chi Tiết Đơn Hàng #{selectedOrder?.Id?.substring(0,8).toUpperCase()}</span></div>}
                style={{ width: '850px' }} className="rounded-[2.5rem] overflow-hidden border-none shadow-2xl"
                contentStyle={{ padding: 0 }}
            >
                {selectedOrder && (
                    <div className="bg-[#F8FAFC] min-h-[500px]">
                        {/* Order Meta Header */}
                        <div className="bg-white p-8 border-b border-slate-100 grid grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời gian tạo</p>
                                <p className="text-xs font-black text-slate-800 uppercase">{new Date(selectedOrder.PurchaseDate).toLocaleString('vi-VN')}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phương thức</p>
                                <div className="flex items-center gap-2">
                                    <CreditCard size={14} className="text-slate-400" />
                                    <span className="text-xs font-black text-slate-800 uppercase">{selectedOrder.payment_method?.Name || 'Tiền mặt'}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái đơn</p>
                                {statusTemplate(selectedOrder)}
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="p-8 pb-0">
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black">
                                        {selectedOrder.user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 uppercase tracking-tight">{selectedOrder.user?.name || 'Khách vãng lai'}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedOrder.user?.phone || 'Bán lẻ tại máy POS'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Mã đối soát</p>
                                    <span className="font-mono text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                        {selectedOrder.PaymentNote || 'KHÔNG CÓ'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Items List */}
                        <div className="p-8">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Danh sách vé trong đơn ({selectedOrder.details?.length})</h3>
                            <div className="space-y-3">
                                {selectedOrder.details?.map((ticket: any, idx: number) => (
                                    <div key={ticket.Id} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between hover:border-slate-300 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                <span className="text-[10px] font-black">{idx + 1}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{ticket.ticket_type?.Name}</span>
                                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${ticket.status === 'UNUSED' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <MapPin size={10} />
                                                    <span>{ticket.fromLocation?.Name || 'Toàn tuyến'}</span>
                                                    <ArrowRight size={10} />
                                                    <span>{ticket.toLocation?.Name || 'Kết thúc'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right mr-4">
                                                <span className="text-[10px] font-bold text-slate-300 uppercase block leading-none mb-1">Giá vé</span>
                                                <span className="text-xs font-black text-slate-700 tracking-tight">{fmt(ticket.price)}</span>
                                            </div>
                                            <button onClick={() => handleViewLogs(ticket.Id)}
                                                    className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-slate-100">
                                                Lịch sử quét
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Summary */}
                        <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-between">
                            <div className="flex gap-3">
                                {selectedOrder.status === 'COMPLETED' && (
                                    <button onClick={() => handleRefundOrder(selectedOrder.Id)}
                                            className="px-6 py-3 bg-rose-50 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
                                        Hoàn tiền đơn hàng
                                    </button>
                                )}
                                <button className="px-6 py-3 bg-slate-50 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                    <Printer size={14}/> In lại đơn
                                </button>
                                <button onClick={() => handleDeleteOrder(selectedOrder.Id)}
                                        className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all">
                                    <Ban size={14}/> Xóa đơn
                                </button>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Tổng cộng đơn hàng</span>
                                <span className="text-3xl font-black text-slate-900 tracking-tighter">{fmt(selectedOrder.total_price)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* LOGS POPUP */}
            <Dialog 
                header={<span className="font-black text-slate-900 text-lg uppercase tracking-tighter">Nhật ký quét vé</span>}
                visible={logDialogVisible} onHide={() => setLogDialogVisible(false)}
                modal className="rounded-[2rem] overflow-hidden shadow-2xl border-none"
                style={{ width: 500 }}
            >
                <div className="p-6 bg-slate-50 min-h-[300px]">
                    {logLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <RefreshCw className="animate-spin text-slate-400" size={24} />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang tải nhật ký...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {selectedTicketLogs.length > 0 ? selectedTicketLogs.map((log, idx) => (
                                <div key={log.Id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 relative">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.scan_direction === 'IN' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                        {log.scan_direction === 'IN' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-slate-900 uppercase">{log.location?.Name}</span>
                                            <span className="text-[9px] font-bold text-slate-400">{new Date(log.scan_time).toLocaleTimeString('vi-VN')}</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            {log.scan_direction === 'IN' ? 'Check-in' : 'Check-out'}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center space-y-4">
                                    <ShieldAlert size={40} className="text-slate-200 mx-auto" />
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Vé này chưa được sử dụng</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Dialog>

            <style jsx global>{`
                .p-datatable-clean .p-datatable-thead > tr > th {
                    background: #fff;
                    color: #94A3B8;
                    font-size: 10px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    padding: 2rem 1rem;
                    border-bottom: 1px solid #F1F5F9;
                }
                .p-datatable-clean .p-datatable-tbody > tr > td {
                    padding: 1.5rem 1rem;
                    border-bottom: 1px solid #F8FAFC;
                    font-size: 12px;
                }
                .p-dialog-header { border-bottom: 1px solid #f1f5f9 !important; padding: 1.5rem 2rem !important; }
                .p-paginator { border: none !important; padding: 1.5rem !important; background: #fff !important; }
            `}</style>
        </div>
    );
}
