"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { InputSwitch } from 'primereact/inputswitch';
import { 
    Ticket, MapPin, Sun, CalendarDays, CalendarRange, Clock3, 
    Search, Plus, RefreshCw, Pencil, Trash2, 
    Info, CheckCircle2, ShieldCheck, 
    ArrowRightLeft, History, LayoutGrid, List, Sparkles,
    Settings2, Timer, Bookmark
} from 'lucide-react';
import { ticketTypeService } from '../../../services/managementService';

/* ─── Constants & Metadata ──────────────────────────────── */
const TAB_ITEMS = [
    { key: 'all',   label: 'Tất cả loại', icon: <Ticket    size={16}/> },
    { key: 'trip',  label: 'Vé lượt',     icon: <MapPin    size={16}/> },
    { key: 'day',   label: 'Vé ngày',     icon: <Sun       size={16}/> },
    { key: 'week',  label: 'Vé tuần',     icon: <Clock3    size={16}/> },
    { key: 'month', label: 'Vé tháng',    icon: <CalendarDays size={16}/> },
    { key: 'year',  label: 'Vé năm',      icon: <CalendarRange size={16}/> },
];

const META_BY_CODE: Record<string, { color: string; bg: string; border: string; icon: any; shadow: string }> = {
    TRIP:  { color: '#6366f1', bg: '#f5f3ff', border: '#e0e7ff', icon: <MapPin size={18}/>, shadow: 'shadow-indigo-100' },
    TIME:  { color: '#10b981', bg: '#ecfdf5', border: '#d1fae5', icon: <Clock3 size={18}/>, shadow: 'shadow-emerald-100' },
    PROMO: { color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7', icon: <Sparkles size={18}/>, shadow: 'shadow-amber-100' },
};

const DURATION_OPTIONS = [
    { label: '1 ngày',    value: 1   },
    { label: '7 ngày',    value: 7   },
    { label: '30 ngày',   value: 30  },
    { label: '90 ngày',   value: 90  },
    { label: '1 năm',     value: 365 },
    { label: 'Tùy chỉnh', value: -1  },
];

const EMPTY_FORM = {
    Name: '', 
    Description: '',
    Duration_Day: 1,
    requiresFace: false,
    Id_Category: null as number | null,
    id_discount_type: null as number | null,
    is_active: true,
    customDuration: false,
};

export default function TicketTypesPage() {
    const toast = useRef<any>(null);
    const [types, setTypes] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [discountTypes, setDiscountTypes] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, trip: 0, time: 0, promo: 0 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [typesRes, statsRes, catsRes, discsRes]: any[] = await Promise.all([
                ticketTypeService.getAll({ search, category: activeTab === 'all' ? undefined : activeTab } as any),
                ticketTypeService.getStats(),
                ticketTypeService.getCategories(),
                ticketTypeService.getDiscountTypes()
            ]);
            setTypes(typesRes?.data ?? []);
            setStats(statsRes?.data ?? { total: 0, trip: 0, time: 0, promo: 0 });
            setCategories(catsRes?.data ?? []);
            setDiscountTypes(discsRes?.data ?? []);
        } catch (err) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải dữ liệu loại vé' });
        } finally { setLoading(false); }
    }, [search, activeTab]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const showToast = (s: string, sum: string, d: string) =>
        toast.current?.show({ severity: s, summary: sum, detail: d, life: 3000 });

    const openCreate = () => { setForm({ ...EMPTY_FORM }); setShowCreate(true); };
    
    const openEdit = (t: any) => {
        setSelected(t);
        const isCustom = !DURATION_OPTIONS.slice(0, 5).some(o => o.value === t.Duration_Day);
        setForm({
            Name: t.Name ?? '',
            Description: t.Description ?? '',
            Duration_Day: t.Duration_Day ?? 1,
            requiresFace: !!t.requiresFace,
            Id_Category: t.Id_Category ?? null,
            id_discount_type: t.id_discount_type ?? null,
            is_active: !!t.is_active,
            customDuration: isCustom,
        });
        setShowEdit(true);
    };

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
        if (!form.Name.trim()) { showToast('warn', 'Thiếu thông tin', 'Vui lòng nhập tên loại vé'); return; }
        if (!form.Id_Category) { showToast('warn', 'Thiếu thông tin', 'Vui lòng chọn danh mục vé'); return; }
        handleAction(() => ticketTypeService.create(form as any), `Đã thêm thành công "${form.Name}"`);
    };

    const handleUpdate = () => {
        if (!selected) return;
        if (!form.Name.trim()) { showToast('warn', 'Thiếu thông tin', 'Tên loại vé không được để trống'); return; }
        handleAction(() => ticketTypeService.update(selected.Id, form as any), 'Cập nhật thông tin thành công');
    };

    const handleDelete = (t: any) => {
        confirmDialog({
            message: `Xác nhận xóa loại vé "${t.Name}"? Lưu ý: Mức giá của loại vé này cũng sẽ bị gỡ bỏ.`,
            header: 'Xác nhận xóa', 
            icon: <Trash2 className="text-rose-500 mr-2" size={20} />,
            acceptClassName: 'bg-rose-600 border-none rounded-xl px-6',
            rejectClassName: 'p-button-text text-slate-400 font-bold',
            accept: () => handleAction(() => ticketTypeService.delete(t.Id), 'Đã xóa loại vé')
        });
    };

    const toggleStatus = async (r: any) => {
        try {
            await ticketTypeService.update(r.Id, { is_active: !r.is_active });
            fetchData();
        } catch {
            showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái');
        }
    };

    /* ─── Render Templates ──────────────────────────────── */
    const typeTemplate = (r: any) => {
        const meta = META_BY_CODE[r.category?.code] || META_BY_CODE.TIME;
        return (
            <div className="flex items-center gap-4 py-2">
                <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center border-2 ${meta.shadow}`} style={{ backgroundColor: meta.bg, borderColor: meta.border, color: meta.color }}>
                    {meta.icon}
                </div>
                <div>
                    <span className="block font-black text-slate-900 text-base tracking-tight">{r.Name}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-60" style={{ color: meta.color }}>
                        {r.category?.name}
                    </span>
                </div>
            </div>
        );
    };

    const durationTemplate = (r: any) => {
        const isTrip = r.category?.code === 'TRIP' || r.Id_Category === 1;
        if (isTrip) {
            return (
                <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 w-fit">
                    <History size={14} />
                    <span className="text-[11px] font-black uppercase tracking-tight">Dùng 1 lần</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 w-fit">
                <Timer size={14} />
                <span className="text-[11px] font-black uppercase tracking-tight">{r.Duration_Day} ngày hiệu lực</span>
            </div>
        );
    };

    const tagsTemplate = (r: any) => (
        <div className="flex gap-2">
            {r.requiresFace && <Tag value="Face ID" className="rounded-lg px-2 text-[9px] font-black bg-slate-900 text-white border-none" />}
            {r.id_discount_type && <Tag value="Ưu đãi" className="rounded-lg px-2 text-[9px] font-black bg-amber-100 text-amber-700 border-none" />}
        </div>
    );

    const activeCat = categories.find(c => c.Id === form.Id_Category);
    const isTripMode = activeCat?.code === 'TRIP' || form.Id_Category === 1;

    return (
        <div className="min-h-screen bg-[#FDFDFF] p-8 lg:p-12 font-[family-name:var(--font-inter)] text-slate-900">
            <Toast ref={toast} />
            <ConfirmDialog className="rounded-[2rem] overflow-hidden" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-100 pb-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                        <Ticket size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Cấu hình Loại Vé</h1>
                        <p className="text-slate-500 text-sm font-semibold max-w-md">
                            Thiết lập quy tắc vận hành và thời hạn cho các loại vé BRT. (Giá vé được quản lý tại mục Bảng giá)
                        </p>
                    </div>
                </div>

                <Button 
                    label="Thêm loại vé mới"
                    icon={<Plus size={20} className="mr-2" />}
                    onClick={openCreate}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white border-none px-8 py-4 rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all font-bold"
                />
            </div>

            {/* Stat Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Tổng số loại', value: stats.total, icon: <LayoutGrid size={20}/>, color: 'indigo' },
                    { label: 'Vé Lượt', value: stats.trip, icon: <MapPin size={20}/>, color: 'blue' },
                    { label: 'Vé Thời Gian', value: stats.time, icon: <Clock3 size={20}/>, color: 'emerald' },
                    { label: 'Vé Ưu Đãi', value: stats.promo, icon: <Sparkles size={20}/>, color: 'amber' },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
                        <div>
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">{s.label}</span>
                            <span className="text-2xl font-black text-slate-900 tracking-tight">{s.value}</span>
                        </div>
                        <div className={`w-12 h-12 bg-${s.color}-50 rounded-2xl flex items-center justify-center text-${s.color}-500 border border-${s.color}-100 group-hover:scale-110 transition-transform`}>
                            {s.icon}
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
                            placeholder="Tìm tên loại vé..." 
                            className="w-full pl-14 pr-6 py-4 bg-white border-slate-200 rounded-2xl text-sm font-bold focus:border-indigo-600 focus:ring-0 transition-all placeholder:text-slate-300 shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        {TAB_ITEMS.map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === tab.key ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'}`}>
                                {tab.label}
                            </button>
                        ))}
                        <Button icon={<RefreshCw size={18} className={loading ? 'animate-spin' : ''} />} onClick={fetchData} text className="text-slate-300 hover:text-indigo-600 ml-2" />
                    </div>
                </div>

                <DataTable value={types} loading={loading} paginator rows={10} rowHover className="p-datatable-modern">
                    <Column header="TÊN LOẠI VÉ" body={typeTemplate} style={{ width: '30%' }} className="pl-10" />
                    <Column header="THỜI HẠN SỬ DỤNG" body={durationTemplate} style={{ width: '25%' }} />
                    <Column header="THIẾT LẬP" body={tagsTemplate} style={{ width: '15%' }} />
                    <Column header="TRẠNG THÁI" body={(r) => (
                        <div className="flex items-center gap-3">
                            <InputSwitch checked={!!r.is_active} onChange={() => toggleStatus(r)} className="custom-switch-minimal" />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${r.is_active ? 'text-slate-900' : 'text-slate-300'}`}>
                                {r.is_active ? 'Active' : 'Hidden'}
                            </span>
                        </div>
                    )} style={{ width: '15%' }} />
                    <Column header="THAO TÁC" body={(r) => (
                        <div className="flex gap-2 pr-10 justify-end">
                            <button onClick={() => openEdit(r)} className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                                <Pencil size={16} />
                            </button>
                            <button onClick={() => handleDelete(r)} className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )} style={{ width: '15%' }} className="text-right" />
                </DataTable>
            </div>

            {/* MODAL DIALOG */}
            <Dialog 
                header={
                    <div className="flex items-center gap-5 py-2 px-4">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Settings2 size={24} />
                        </div>
                        <div>
                            <span className="block text-2xl font-black text-slate-900 tracking-tight">
                                {showEdit ? 'Cập nhật loại vé' : 'Tạo loại vé mới'}
                            </span>
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Cấu hình tham số vận hành</span>
                        </div>
                    </div>
                }
                visible={showCreate || showEdit} onHide={() => { setShowCreate(false); setShowEdit(false); }}
                style={{ width: 560 }} className="rounded-[3rem] overflow-hidden shadow-2xl border-none"
                contentStyle={{ padding: '2.5rem 3.5rem' }}
                footer={
                    <div className="flex justify-end gap-3 p-8 bg-slate-50 border-t border-slate-100">
                        <Button label="Hủy bỏ" text className="px-8 font-bold text-slate-400 hover:text-slate-900 rounded-2xl" onClick={() => { setShowCreate(false); setShowEdit(false); }} />
                        <button 
                            onClick={showEdit ? handleUpdate : handleCreate} 
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 transition-all disabled:opacity-50 active:scale-95"
                        >
                            {saving ? 'Đang xử lý...' : (showEdit ? 'Lưu thay đổi' : 'Xác nhận tạo')}
                        </button>
                    </div>
                }
            >
                <div className="space-y-10">
                    {/* Category Selector */}
                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Chọn danh mục vé</label>
                        <div className="grid grid-cols-3 gap-3">
                            {categories.map(c => {
                                const active = form.Id_Category === c.Id;
                                const meta = META_BY_CODE[c.code] || META_BY_CODE.TIME;
                                return (
                                    <button key={c.Id} onClick={() => setForm(p => ({ ...p, Id_Category: c.Id, Duration_Day: c.code === 'TRIP' ? 1 : p.Duration_Day }))}
                                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${active ? 'border-indigo-600 bg-indigo-50 shadow-md scale-105' : 'border-slate-50 bg-slate-50/50 opacity-60'}`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>
                                            {meta.icon}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase ${active ? 'text-indigo-900' : 'text-slate-500'}`}>{c.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên loại vé</label>
                            <InputText value={form.Name} onChange={e => setForm({...form, Name: e.target.value})} placeholder="VD: Vé Lượt Thường, Vé Tháng Sinh Viên..." className="w-full h-14 bg-white border-slate-200 rounded-xl px-5 font-bold text-lg" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả đặc điểm</label>
                            <InputText value={form.Description} onChange={e => setForm({...form, Description: e.target.value})} placeholder="Vị trí hiển thị hoặc đối tượng áp dụng..." className="w-full h-12 bg-white border-slate-200 rounded-xl px-5 font-semibold text-slate-500" />
                        </div>
                    </div>

                    {/* Duration Config */}
                    {form.Id_Category && (
                        <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                            <div className="flex items-center gap-2 text-slate-900">
                                <Bookmark size={18} strokeWidth={2.5} />
                                <span className="text-xs font-black uppercase tracking-widest">Quy tắc thời hạn sử dụng</span>
                            </div>

                            {isTripMode ? (
                                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-indigo-100">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                        <History size={24} />
                                    </div>
                                    <div>
                                        <span className="block font-black text-slate-900 text-sm">Vé dùng 1 lần duy nhất</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Hết hiệu lực ngay sau khi quét thẻ đầu ra</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex gap-2 flex-wrap">
                                        {DURATION_OPTIONS.slice(0, 5).map(opt => (
                                            <button key={opt.value} onClick={() => setForm({...form, Duration_Day: opt.value, customDuration: false})}
                                                    className={`px-4 py-2 rounded-full text-[10px] font-black tracking-tight transition-all ${form.Duration_Day === opt.value && !form.customDuration ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                                {opt.label}
                                            </button>
                                        ))}
                                        <button onClick={() => setForm({...form, customDuration: true})}
                                                className={`px-4 py-2 rounded-full text-[10px] font-black tracking-tight transition-all ${form.customDuration ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                            Tùy chỉnh
                                        </button>
                                    </div>
                                    {form.customDuration && (
                                        <InputNumber value={form.Duration_Day} onValueChange={e => setForm({...form, Duration_Day: e.value ?? 1})} min={1} suffix=" ngày" className="w-full" inputClassName="h-14 border-slate-200 rounded-xl px-5 font-black text-lg text-emerald-600" />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Options Toggle */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${form.requiresFace ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-50 opacity-60'}`}
                             onClick={() => setForm({...form, requiresFace: !form.requiresFace})}>
                            <ShieldCheck size={24} className={form.requiresFace ? 'text-indigo-600' : 'text-slate-300'} />
                            <span className="text-[10px] font-black uppercase text-slate-600">Xác thực Face ID</span>
                        </div>
                        <div className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${form.is_active ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-50 opacity-60'}`}
                             onClick={() => setForm({...form, is_active: !form.is_active})}>
                            <CheckCircle2 size={24} className={form.is_active ? 'text-emerald-500' : 'text-slate-300'} />
                            <span className="text-[10px] font-black uppercase text-slate-600">Cho phép bán</span>
                        </div>
                    </div>
                </div>
            </Dialog>

            <style jsx global>{`
                .p-datatable-modern .p-datatable-thead > tr > th {
                    background: #FDFDFF;
                    color: #94A3B8;
                    font-size: 10px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    padding: 2rem 1rem;
                    border-bottom: 2px solid #F8FAFC;
                }
                .p-datatable-modern .p-datatable-tbody > tr > td {
                    padding: 1.5rem 1rem;
                    border-bottom: 1px solid #F8FAFC;
                }
                .custom-switch-minimal.p-inputswitch {
                    width: 40px !important;
                    height: 22px !important;
                }
                .custom-switch-minimal .p-inputswitch-slider {
                    background: #E2E8F0 !important;
                    border-radius: 20px !important;
                }
                .custom-switch-minimal.p-inputswitch-checked .p-inputswitch-slider {
                    background: #0F172A !important;
                }
                .custom-switch-minimal .p-inputswitch-slider:before {
                    width: 14px !important;
                    height: 14px !important;
                    left: 4px !important;
                    margin-top: -7px !important;
                }
            `}</style>
        </div>
    );
}
