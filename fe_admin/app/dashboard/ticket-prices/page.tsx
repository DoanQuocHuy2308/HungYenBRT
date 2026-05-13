"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputSwitch } from 'primereact/inputswitch';
import { 
    Banknote, MapPin, ArrowRight, CircleDollarSign, 
    TrendingUp, TrendingDown, BarChart3, Search, 
    RefreshCcw, LayoutGrid, Tag as TagIcon, Plus, Info, 
    CalendarRange, CheckCircle2, XCircle, Route,
    AlertCircle, Pencil, Trash2, ArrowRightLeft, Eye,
    MapPinned, ChevronRight
} from 'lucide-react';
import { ticketPriceService, locationService } from '../../../services/managementService';

const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function TicketPricesPage() {
    const toast = useRef<any>(null);
    const [prices, setPrices] = useState<any[]>([]);
    const [allTypes, setAllTypes] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, minPrice: 0, maxPrice: 0, avgPrice: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);

    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selected, setSelected] = useState<any>(null);

    const [form, setForm] = useState({
        Id_Ticket_Type: null as number | null,
        From_Location_Id: null as number | null,
        To_Location_Id: null as number | null,
        Price: 0,
        is_active: true
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pricesRes, statsRes, typesRes, locationsRes]: any[] = await Promise.all([
                ticketPriceService.getAll({ search }),
                ticketPriceService.getStats(),
                ticketPriceService.getTypes(),
                locationService.getAll(),
            ]);
            setPrices(pricesRes?.data ?? []);
            setAllTypes(typesRes?.data ?? []);
            setLocations(locationsRes?.data ?? []);
            setStats(statsRes?.data ?? { total: 0, minPrice: 0, maxPrice: 0, avgPrice: 0 });
        } catch {
            showToast('error', 'Lỗi', 'Không thể tải dữ liệu giá vé');
        } finally { setLoading(false); }
    }, [search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const showToast = (s: 'success' | 'info' | 'warn' | 'error', sum: string, d: string) =>
        toast.current?.show({ severity: s, summary: sum, detail: d, life: 3000 });

    const handleAction = async (action: () => Promise<any>, successMsg: string) => {
        setSaving(true);
        try {
            await action();
            showToast('success', 'Thành công', successMsg);
            setShowCreate(false); setShowEdit(false); fetchData();
        } catch (e: any) {
            showToast('error', 'Lỗi', e?.response?.data?.message || e?.message);
        } finally { setSaving(false); }
    };

    const handleCreate = () => {
        if (!form.Id_Ticket_Type) return showToast('warn', 'Thiếu thông tin', 'Vui lòng chọn loại vé');
        const type = allTypes.find(t => t.Id === form.Id_Ticket_Type);
        const isTrip = type?.category?.code?.toUpperCase() === 'TRIP' || type?.Id_Category === 1;
        
        if (isTrip && (!form.From_Location_Id || !form.To_Location_Id)) {
            return showToast('warn', 'Thiếu thông tin', 'Vé lượt yêu cầu chọn điểm đi và điểm đến');
        }
        if (isTrip && form.From_Location_Id === form.To_Location_Id) {
            return showToast('warn', 'Lỗi vị trí', 'Điểm đi và điểm đến không được trùng nhau');
        }

        handleAction(() => ticketPriceService.create(form as any), 'Đã thêm mức giá mới');
    };

    const handleUpdate = () => {
        if (!selected) return;
        handleAction(() => ticketPriceService.update(selected.Id, form as any), 'Đã cập nhật mức giá');
    };

    const handleDelete = (row: any) => {
        confirmDialog({
            message: `Xác nhận xóa mức giá của "${row.ticket_type?.Name}"?`,
            header: 'Xác nhận xóa',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'bg-red-600 border-none rounded-lg text-white font-bold px-6 py-2',
            rejectClassName: 'p-button-text p-button-secondary rounded-lg font-bold px-6 py-2',
            accept: () => handleAction(() => ticketPriceService.delete(row.Id), 'Đã xóa bản ghi')
        });
    };

    const toggleActive = (row: any) => {
        handleAction(() => ticketPriceService.update(row.Id, { is_active: !row.is_active }), 
            `Đã ${!row.is_active ? 'bật' : 'tắt'} mức giá`);
    };

    // ── Logic tính danh sách ga được phép ──────────────────────
    const getAllowedStations = (row: any) => {
        if (!row || !row.fromLocation || !row.toLocation) return [];
        const minIdx = Math.min(row.fromLocation.order_index, row.toLocation.order_index);
        const maxIdx = Math.max(row.fromLocation.order_index, row.toLocation.order_index);
        
        return locations
            .filter(loc => loc.order_index >= minIdx && loc.order_index <= maxIdx)
            .sort((a, b) => a.order_index - b.order_index);
    };

    // ── Templates ──────────────────────────────────────────────
    const typeTemplate = (row: any) => {
        const type = row.ticket_type;
        const isTrip = type?.category?.code?.toUpperCase() === 'TRIP' || type?.Id_Category === 1;
        return (
            <div className="flex items-center gap-4 py-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 
                    ${isTrip ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                    {isTrip ? <MapPin size={20} /> : <CalendarRange size={20} />}
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-900 text-sm tracking-tight">{type?.Name || 'N/A'}</span>
                    <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isTrip ? 'text-slate-400' : 'text-amber-600'}`}>
                            {type?.category?.name || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const routeTemplate = (row: any) => {
        const type = row.ticket_type;
        const isTrip = type?.category?.code?.toUpperCase() === 'TRIP' || type?.Id_Category === 1;

        if (!isTrip) {
            return (
                <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg w-fit border border-slate-100">
                    <LayoutGrid size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Toàn Hệ thống</span>
                </div>
            );
        }

        if (!row.fromLocation || !row.toLocation) {
            return (
                <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg w-fit border border-rose-100 animate-pulse">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-black uppercase">Chưa cấu hình lộ trình</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-4 py-1">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase mb-0.5 ml-0.5">Điểm đi</span>
                    <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm font-bold text-slate-700 text-xs">
                        {row.fromLocation?.Name}
                    </div>
                </div>
                <div className="pt-4">
                    <ArrowRight size={16} className="text-slate-300" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase mb-0.5 ml-0.5">Điểm đến</span>
                    <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm font-bold text-slate-700 text-xs">
                        {row.toLocation?.Name}
                    </div>
                </div>
            </div>
        );
    };

    const currencyTemplate = (row: any) => (
        <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase mb-0.5 ml-0.5 tracking-wider text-right lg:text-left">Đơn giá</span>
            <span className="text-slate-900 font-black text-base">{fmt(parseFloat(row.Price))}</span>
        </div>
    );

    const statusTemplate = (row: any) => (
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <InputSwitch checked={!!row.is_active} onChange={() => toggleActive(row)} className="custom-switch-minimal" />
            <span className={`text-[10px] font-black uppercase tracking-widest ${row.is_active ? 'text-slate-900' : 'text-slate-300'}`}>
                {row.is_active ? 'Active' : 'Hidden'}
            </span>
        </div>
    );

    const actionTemplate = (row: any) => (
        <div className="flex items-center justify-end gap-2 pr-2">
            <Button 
                icon={<Eye size={14} />} 
                className="p-button-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border-none shadow-sm px-3 rounded-lg transition-all" 
                tooltip="Xem chi tiết ga dừng" tooltipOptions={{ position: 'top' }}
                onClick={() => { setSelected(row); setShowDetail(true); }} 
            />
            <Button 
                icon={<Pencil size={14} />} 
                className="p-button-sm bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm px-3 rounded-lg transition-all" 
                onClick={() => { setSelected(row); setForm({ ...row, Price: parseFloat(row.Price) }); setShowEdit(true); }} 
            />
            <Button 
                icon={<Trash2 size={14} />} 
                className="p-button-sm bg-white hover:bg-rose-50 text-rose-500 border-rose-100 shadow-sm px-3 rounded-lg transition-all" 
                onClick={() => handleDelete(row)} 
            />
        </div>
    );

    const selectedType = allTypes.find(t => t.Id === form.Id_Ticket_Type);
    const isTripMode = selectedType?.category?.code?.toUpperCase() === 'TRIP' || selectedType?.Id_Category === 1;

    return (
        <div className="min-h-screen bg-[#FDFDFF] p-8 lg:p-12 font-[family-name:var(--font-inter)] text-slate-900">
            <Toast ref={toast} className="custom-toast" />
            <ConfirmDialog className="premium-confirm-minimal" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-100 pb-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-slate-200">
                        <ArrowRightLeft size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Bảng giá vé BRT</h1>
                        <p className="text-slate-500 text-sm font-semibold max-w-md">
                            Quản lý giá vé chi tiết theo lộ trình cho vé lượt và giá toàn tuyến cho vé thời gian.
                        </p>
                    </div>
                </div>

                <Button 
                    label="Thêm mức giá mới"
                    icon={<Plus size={20} className="mr-2" />}
                    onClick={() => { setForm({ Id_Ticket_Type: null, From_Location_Id: null, To_Location_Id: null, Price: 0, is_active: true }); setShowCreate(true); }}
                    className="bg-slate-900 hover:bg-slate-800 text-white border-none px-8 py-4 rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-all font-bold"
                />
            </div>

            {/* Stat Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Tổng mức giá', value: stats.total, icon: BarChart3 },
                    { label: 'Giá thấp nhất', value: fmt(stats.minPrice), icon: TrendingDown },
                    { label: 'Giá trung bình', value: fmt(stats.avgPrice), icon: CircleDollarSign },
                    { label: 'Giá cao nhất', value: fmt(stats.maxPrice), icon: TrendingUp },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
                        <div>
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">{s.label}</span>
                            <span className="text-2xl font-black text-slate-900 tracking-tight">{s.value}</span>
                        </div>
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-50 group-hover:scale-110 transition-transform">
                            <s.icon size={22} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Data Area */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
                    <div className="relative max-w-md w-full">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <InputText 
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm loại vé hoặc nhà ga..." 
                            className="w-full pl-14 pr-6 py-4 bg-white border-slate-200 rounded-2xl text-sm font-bold focus:border-slate-900 focus:ring-0 transition-all placeholder:text-slate-300 shadow-sm"
                        />
                    </div>
                    <Button icon={<RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />} onClick={fetchData} text className="text-slate-300 hover:text-slate-900" />
                </div>

                <DataTable 
                    value={prices} loading={loading} paginator rows={10} rowHover 
                    className="p-datatable-modern"
                    paginatorClassName="border-t border-slate-50 py-10"
                    alwaysShowPaginator={false}
                    emptyMessage={<div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">Dữ liệu trống</div>}
                >
                    <Column header="PHÂN LOẠI VÉ" body={typeTemplate} style={{ width: '25%' }} className="pl-10" />
                    <Column header="LỘ TRÌNH CHI TIẾT" body={routeTemplate} style={{ width: '35%' }} />
                    <Column header="ĐƠN GIÁ" body={currencyTemplate} style={{ width: '15%' }} />
                    <Column header="TRẠNG THÁI" body={statusTemplate} style={{ width: '10%' }} />
                    <Column body={actionTemplate} style={{ width: '15%' }} className="pr-10" />
                </DataTable>
            </div>

            {/* DIALOG: VIEW DETAIL (Danh sách ga được xuống) */}
            <Dialog
                header={
                    <div className="flex items-center gap-4 py-2 px-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 shadow-sm border border-amber-100">
                            <MapPinned size={22} />
                        </div>
                        <div>
                            <span className="block text-xl font-black text-slate-900 tracking-tight">Chi tiết ga dừng cho phép</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mt-1">Lộ trình vận hành chi tiết</span>
                        </div>
                    </div>
                }
                visible={showDetail} onHide={() => setShowDetail(false)}
                style={{ width: 450 }} className="rounded-[2.5rem] overflow-hidden shadow-2xl border-none"
                contentStyle={{ padding: '2rem 3rem' }}
            >
                {selected && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Loại vé áp dụng</span>
                                <span className="font-black text-slate-800">{selected.ticket_type?.Name}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Đơn giá</span>
                                <span className="font-black text-amber-700">{fmt(parseFloat(selected.Price))}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Route size={16} className="text-slate-900" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-900">Danh sách các ga trong lộ trình</span>
                            </div>

                            <div className="max-h-[380px] overflow-y-auto pr-4 custom-scrollbar">
                                <div className="relative pl-8 space-y-6 pb-4">
                                    {/* Dòng kẻ dọc timeline */}
                                    <div className="absolute left-3.5 top-2 bottom-6 w-0.5 bg-slate-200 border-dashed border-l-2 border-slate-100"></div>
                                    
                                    {selected.ticket_type?.category?.code?.toUpperCase() === 'TRIP' || selected.ticket_type?.Id_Category === 1 ? (
                                        getAllowedStations(selected).map((st, idx, arr) => (
                                            <div key={st.Id} className="relative flex items-center justify-between group">
                                                {/* Nút tròn timeline */}
                                                <div className={`absolute -left-[25px] w-5 h-5 rounded-full border-4 transition-all duration-300 z-10
                                                    ${idx === 0 ? 'bg-emerald-500 border-emerald-100' : 
                                                    idx === arr.length - 1 ? 'bg-amber-600 border-amber-100' : 
                                                    'bg-white border-slate-200 group-hover:border-slate-400'}`}>
                                                </div>
                                                
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-bold tracking-tight ${idx === 0 || idx === arr.length - 1 ? 'text-slate-900' : 'text-slate-600'}`}>
                                                        {st.Name}
                                                    </span>
                                                    {idx === 0 && <span className="text-[9px] font-black text-emerald-600 uppercase">Ga khởi hành</span>}
                                                    {idx === arr.length - 1 && <span className="text-[9px] font-black text-amber-700 uppercase">Ga kết thúc (Tối đa)</span>}
                                                </div>

                                                <div className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                    <span className="text-[9px] font-black text-slate-400">#{st.order_index}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                                                <CheckCircle2 size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block font-black text-slate-800 text-sm uppercase">Toàn bộ nhà ga</span>
                                                <p className="text-[10px] text-slate-400 font-bold max-w-[200px] leading-relaxed">
                                                    Loại vé này cho phép hành khách lên và xuống tại bất kỳ nhà ga nào trên toàn hệ thống BRT.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex gap-3">
                            <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-900 leading-relaxed font-semibold italic">
                                Chú ý: Hành khách chỉ được phép quét mã để xuống (Exit) tại các nhà ga có tên trong danh sách trên.
                            </p>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* MODAL DIALOG: CREATE / EDIT */}
            <Dialog 
                header={
                    <div className="flex items-center gap-5 py-2 px-4">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Banknote size={24} />
                        </div>
                        <div>
                            <span className="block text-2xl font-black text-slate-900 tracking-tight">
                                {showEdit ? 'Cập nhật giá vé' : 'Cấu hình giá mới'}
                            </span>
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block">Thiết lập dữ liệu niêm yết</span>
                        </div>
                    </div>
                }
                visible={showCreate || showEdit} 
                onHide={() => { setShowCreate(false); setShowEdit(false); }}
                style={{ width: 560 }} className="rounded-[3rem] overflow-hidden shadow-2xl border-none"
                contentStyle={{ padding: '2rem 3rem' }}
                footer={
                    <div className="flex justify-end gap-3 p-8 bg-slate-50 border-t border-slate-100">
                        <Button label="Hủy bỏ" text className="px-8 font-bold text-slate-400 hover:text-slate-900 rounded-2xl" onClick={() => { setShowCreate(false); setShowEdit(false); }} />
                        <button 
                            onClick={showEdit ? handleUpdate : handleCreate} 
                            disabled={saving}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-12 py-4 rounded-2xl font-black text-sm shadow-xl shadow-slate-200 transition-all disabled:opacity-50 active:scale-95"
                        >
                            {saving ? 'Đang xử lý...' : (showEdit ? 'Lưu thay đổi' : 'Xác nhận tạo')}
                        </button>
                    </div>
                }
            >
                <div className="space-y-10">
                    {/* Select Type */}
                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Chọn loại vé áp dụng</label>
                        {showEdit ? (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <span className="font-black text-slate-800 text-base">{selected?.ticket_type?.Name}</span>
                                <Tag value="CỐ ĐỊNH" className="bg-white border border-slate-200 text-slate-400 px-3 text-[9px] font-black rounded-lg shadow-sm" />
                            </div>
                        ) : (
                            <Dropdown 
                                value={form.Id_Ticket_Type} 
                                options={allTypes.map(t => ({ label: t.Name, value: t.Id, sub: t.category?.name }))} 
                                onChange={e => setForm(p => ({ ...p, Id_Ticket_Type: e.value, From_Location_Id: null, To_Location_Id: null }))}
                                placeholder="Chọn loại vé..." 
                                className="w-full h-16 rounded-2xl bg-white border border-slate-200 font-bold text-base" 
                                filter
                                appendTo={typeof window !== 'undefined' ? document.body : null}
                                itemTemplate={(opt) => (
                                    <div className="flex flex-col py-1">
                                        <span className="font-black text-slate-700 text-sm">{opt.label}</span>
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{opt.sub}</span>
                                    </div>
                                )}
                            />
                        )}
                    </div>

                    {/* Route Config */}
                    {isTripMode && (
                        <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                            <div className="flex items-center gap-2 text-slate-900 mb-1">
                                <Route size={18} strokeWidth={2.5} />
                                <span className="text-xs font-black uppercase tracking-widest">Cấu hình lộ trình vé chặng</span>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Điểm khởi hành</label>
                                    <Dropdown 
                                        value={form.From_Location_Id} 
                                        options={locations.map(l => ({ label: l.Name, value: l.Id }))} 
                                        onChange={e => setForm(p => ({ ...p, From_Location_Id: e.value }))}
                                        placeholder="Chọn ga đầu..." 
                                        className="w-full h-14 rounded-xl border-slate-200 font-bold text-sm" filter appendTo={typeof window !== 'undefined' ? document.body : null}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Điểm kết thúc</label>
                                    <Dropdown 
                                        value={form.To_Location_Id} 
                                        options={locations.map(l => ({ label: l.Name, value: l.Id }))} 
                                        onChange={e => setForm(p => ({ ...p, To_Location_Id: e.value }))}
                                        placeholder="Chọn ga cuối..." 
                                        className="w-full h-14 rounded-xl border-slate-200 font-bold text-sm" filter appendTo={typeof window !== 'undefined' ? document.body : null}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {!isTripMode && form.Id_Ticket_Type && (
                        <div className="p-6 bg-slate-900 rounded-[2.5rem] flex items-center gap-4 text-white">
                            <LayoutGrid size={24} className="text-slate-400" />
                            <div>
                                <span className="block text-xs font-black uppercase tracking-widest">Áp dụng toàn hệ thống</span>
                                <span className="text-[10px] text-slate-400 font-bold">Không giới hạn trạm dừng cho loại vé này</span>
                            </div>
                        </div>
                    )}

                    {/* Price Input */}
                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Thiết lập đơn giá (VNĐ)</label>
                        <InputNumber 
                            value={form.Price} onValueChange={e => setForm(p => ({ ...p, Price: e.value ?? 0 }))}
                            mode="currency" currency="VND" locale="vi-VN" 
                            className="w-full" inputClassName="w-full h-20 text-3xl font-black text-slate-900 bg-white border-2 border-slate-100 rounded-[2rem] px-8 focus:border-slate-900 transition-all shadow-inner text-center" 
                        />
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-black text-slate-900">Trạng thái phát hành</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Kích hoạt để cho phép bán vé ngay</span>
                        </div>
                        <InputSwitch checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.value }))} className="custom-switch-minimal scale-125" />
                    </div>
                </div>
            </Dialog>

            <style jsx global>{`
                /* Sửa lỗi hiển thị Dropdown */
                .p-dropdown-panel {
                    background: #ffffff !important;
                    border: 1px solid #E2E8F0 !important;
                    border-radius: 20px !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1) !important;
                    z-index: 10001 !important;
                    padding: 0.5rem !important;
                }
                .p-dropdown-items .p-dropdown-item {
                    border-radius: 12px !important;
                    margin: 4px 0 !important;
                    padding: 1rem !important;
                    transition: all 0.2s ease;
                }
                .p-dropdown-items .p-dropdown-item:hover {
                    background: #F8FAFC !important;
                    transform: translateX(4px);
                }
                .p-dropdown-items .p-dropdown-item.p-highlight {
                    background: #F1F5F9 !important;
                    color: #0F172A !important;
                }

                /* Tùy chỉnh Table hiện đại */
                .p-datatable-modern .p-datatable-thead > tr > th {
                    background: #FDFDFF;
                    color: #94A3B8;
                    font-size: 10px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    padding: 2.5rem 1rem;
                    border-bottom: 2px solid #F8FAFC;
                }
                .p-datatable-modern .p-datatable-tbody > tr {
                    transition: all 0.3s ease;
                }
                .p-datatable-modern .p-datatable-tbody > tr > td {
                    padding: 2rem 1rem;
                    border-bottom: 1px solid #F8FAFC;
                }
                .p-datatable-modern .p-datatable-tbody > tr:hover {
                    background: #F8FAFC !important;
                }

                /* Switch chuyên nghiệp */
                .custom-switch-minimal.p-inputswitch {
                    width: 46px !important;
                    height: 26px !important;
                }
                .custom-switch-minimal .p-inputswitch-slider {
                    background: #E2E8F0 !important;
                    border-radius: 30px !important;
                }
                .custom-switch-minimal.p-inputswitch-checked .p-inputswitch-slider {
                    background: #0F172A !important;
                }
                .custom-switch-minimal .p-inputswitch-slider:before {
                    width: 18px !important;
                    height: 18px !important;
                    left: 4px !important;
                    margin-top: -8px !important;
                    background: #ffffff !important;
                    border-radius: 50% !important;
                }
                .custom-switch-minimal.p-inputswitch-checked .p-inputswitch-slider:before {
                    transform: translateX(20px) !important;
                }

                /* Tùy chỉnh Scrollbar mượt mà */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f8fafc;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
