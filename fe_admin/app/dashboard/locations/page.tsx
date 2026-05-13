"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { 
    MapPin, Plus, Edit2, Trash2, Search, 
    RefreshCcw, Navigation, ArrowUp, ArrowDown,
    Bus, Info, Map, Terminal, Satellite
} from 'lucide-react';
import { locationService } from '../../../services/managementService';

export default function LocationManagementPage() {
    const toast = useRef<any>(null);
    const [locations, setLocations] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, hasGps: 0, noGps: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm] = useState({
        Id: null,
        Name: '',
        station_code: '',
        Description: '',
        latitude: '',
        longitude: '',
        order_index: 0
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res: any = await locationService.getAll({ search });
            const statsRes: any = await locationService.getStats();
            setLocations(res?.data || []);
            setStats(statsRes?.data || { total: 0, hasGps: 0, noGps: 0 });
        } catch {
            showToast('error', 'Lỗi', 'Không thể tải dữ liệu nhà ga');
        } finally { setLoading(false); }
    }, [search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const showToast = (s: 'success' | 'info' | 'warn' | 'error', sum: string, d: string) =>
        toast.current?.show({ severity: s, summary: sum, detail: d, life: 3000 });

    const openNew = () => {
        setForm({ Id: null, Name: '', station_code: '', Description: '', latitude: '', longitude: '', order_index: locations.length + 1 });
        setIsEdit(false);
        setDialogVisible(true);
    };

    const editLocation = (loc: any) => {
        setForm({ ...loc, latitude: loc.latitude || '', longitude: loc.longitude || '' });
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleSave = async () => {
        if (!form.Name.trim()) { showToast('warn', 'Thiếu thông tin', 'Vui lòng nhập tên nhà ga'); return; }
        
        try {
            if (isEdit && form.Id) {
                await locationService.update(form.Id, form);
                showToast('success', 'Thành công', 'Cập nhật nhà ga thành công');
            } else {
                await locationService.create(form);
                showToast('success', 'Thành công', 'Thêm nhà ga mới thành công');
            }
            setDialogVisible(false);
            fetchData();
        } catch (e: any) {
            showToast('error', 'Lỗi', e?.response?.data?.message || 'Không thể lưu dữ liệu');
        }
    };

    const confirmDelete = (loc: any) => {
        confirmDialog({
            message: `Bạn có chắc chắn muốn xóa nhà ga "${loc.Name}"?`,
            header: 'Xác nhận xóa',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await locationService.delete(loc.Id);
                    showToast('success', 'Thành công', 'Đã xóa nhà ga');
                    fetchData();
                } catch { showToast('error', 'Lỗi', 'Không thể xóa nhà ga'); }
            }
        });
    };

    const moveOrder = async (id1: number, id2: number) => {
        try {
            await locationService.swapOrder(id1, id2);
            fetchData();
        } catch { showToast('error', 'Lỗi', 'Không thể thay đổi thứ tự'); }
    };

    // ── Row Templates ──────────────────────────────────────────
    const stationTemplate = (row: any) => (
        <div className="flex items-center gap-4 py-2">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm">
                <Bus size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-sm tracking-tight">{row.Name}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.station_code || 'Chưa có mã'}</span>
            </div>
        </div>
    );

    const gpsTemplate = (row: any) => {
        if (!row.latitude || !row.longitude) return <span className="text-[10px] font-bold text-slate-300 italic">Chưa cấu hình GPS</span>;
        return (
            <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 w-max">Lat: {parseFloat(row.latitude).toFixed(5)}</span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 w-max">Lng: {parseFloat(row.longitude).toFixed(5)}</span>
            </div>
        );
    };

    const actionTemplate = (row: any, options: any) => (
        <div className="flex items-center gap-1 justify-end">
            <Button icon={<ArrowUp size={14}/>} text rounded severity="secondary" disabled={options.rowIndex === 0}
                onClick={() => moveOrder(row.Id, locations[options.rowIndex - 1].Id)} tooltip="Lên 1 bậc" />
            <Button icon={<ArrowDown size={14}/>} text rounded severity="secondary" disabled={options.rowIndex === locations.length - 1}
                onClick={() => moveOrder(row.Id, locations[options.rowIndex + 1].Id)} tooltip="Xuống 1 bậc" />
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <Button icon={<Edit2 size={14}/>} text rounded severity="info" onClick={() => editLocation(row)} tooltip="Sửa thông tin" />
            <Button icon={<Trash2 size={14}/>} text rounded severity="danger" onClick={() => confirmDelete(row)} tooltip="Xóa trạm" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFDFF] p-6 lg:p-10 font-[family-name:var(--font-inter)]">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-6 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-20 group-hover:opacity-30 transition-all"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-100">
                            <Navigation size={36} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-4xl font-black tracking-tight text-slate-900">Quản Lý Nhà Ga</h1>
                            <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">BRT Route Manager</span>
                            </div>
                        </div>
                        <p className="text-slate-400 font-medium text-sm max-w-md leading-relaxed">
                            Thêm mới, chỉnh sửa tọa độ và sắp xếp lộ trình cho toàn bộ hệ thống trạm BRT Hưng Yên.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={openNew} className="flex items-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95">
                        <Plus size={18} />
                        Thêm Ga Mới
                    </button>
                </div>
            </div>

            {/* Stat Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                    { label: 'Tổng số nhà ga', value: stats.total, icon: Map, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                    { label: 'Đã gán tọa độ GPS', value: stats.hasGps, icon: Satellite, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                    { label: 'Chưa có tọa độ', value: stats.noGps, icon: Info, color: 'text-rose-500', bg: 'bg-rose-50/50' },
                ].map((s, i) => (
                    <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-5">
                        <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center`}>
                            <s.icon size={24} className={s.color} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative max-w-sm w-full">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400">
                            <Search size={18} />
                        </div>
                        <InputText 
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm tên hoặc mã nhà ga..." 
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                    </div>
                    <Button icon={<RefreshCcw size={16}/>} text rounded severity="secondary" onClick={fetchData} className={loading ? 'animate-spin' : ''} />
                </div>

                <DataTable 
                    value={locations} loading={loading} paginator rows={10} 
                    rowHover className="custom-premium-table" rowClassName={() => 'group'}
                    emptyMessage="Chưa có dữ liệu nhà ga."
                >
                    <Column field="order_index" header="STT" body={(r) => <span className="font-black text-slate-300 text-xs">{r.order_index}</span>} style={{ width: '5%' }} className="pl-8" />
                    <Column header="Nhà Ga / Điểm dừng" body={stationTemplate} style={{ width: '35%' }} />
                    <Column field="Description" header="Mô tả / Ghi chú" body={(r) => <span className="text-xs text-slate-500 font-medium line-clamp-1">{r.Description || '---'}</span>} style={{ width: '25%' }} />
                    <Column header="Tọa độ GPS" body={gpsTemplate} style={{ width: '15%' }} />
                    <Column header="Thao tác & Thứ tự" body={actionTemplate} style={{ width: '20%' }} className="pr-8" />
                </DataTable>
            </div>

            {/* Dialog Form */}
            <Dialog 
                header={<div className="flex items-center gap-3"><Terminal size={20} className="text-indigo-600"/> <span className="font-black tracking-tight">{isEdit ? 'Cập nhật nhà ga' : 'Thêm mới nhà ga'}</span></div>}
                visible={dialogVisible} style={{ width: '450px' }} modal className="premium-dialog"
                onHide={() => setDialogVisible(false)}
                footer={
                    <div className="flex gap-2 justify-end p-4 border-t border-slate-50">
                        <Button label="Hủy" text className="p-button-secondary font-bold" onClick={() => setDialogVisible(false)} />
                        <Button label={isEdit ? 'Cập nhật' : 'Thêm mới'} className="p-button-indigo font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-100" onClick={handleSave} />
                    </div>
                }
            >
                <div className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên nhà ga / Trạm dừng</label>
                        <InputText value={form.Name || ''} onChange={e => setForm({...form, Name: e.target.value})} className="w-full h-12 rounded-xl" placeholder="Ví dụ: Trạm Hưng Yên Central" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã trạm (Code)</label>
                            <InputText value={form.station_code || ''} onChange={e => setForm({...form, station_code: e.target.value})} className="w-full h-12 rounded-xl" placeholder="ST001" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thứ tự tuyến</label>
                            <InputText type="number" value={(form.order_index ?? '').toString()} onChange={e => setForm({...form, order_index: parseInt(e.target.value)})} className="w-full h-12 rounded-xl" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vĩ độ (Latitude)</label>
                            <InputText value={form.latitude || ''} onChange={e => setForm({...form, latitude: e.target.value})} className="w-full h-12 rounded-xl" placeholder="21.0..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kinh độ (Longitude)</label>
                            <InputText value={form.longitude || ''} onChange={e => setForm({...form, longitude: e.target.value})} className="w-full h-12 rounded-xl" placeholder="105.0..." />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả thêm</label>
                        <InputTextarea value={form.Description || ''} onChange={e => setForm({...form, Description: e.target.value})} rows={3} className="w-full rounded-xl" placeholder="Vị trí chi tiết, hướng tiếp cận..." />
                    </div>
                </div>
            </Dialog>

            <style jsx global>{`
                .p-datatable.custom-premium-table .p-datatable-thead > tr > th {
                    background: #FDFDFF;
                    color: #94A3B8;
                    font-size: 10px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    padding: 2rem 1rem;
                    border-bottom: 1px solid #F1F5F9;
                }
                .p-datatable.custom-premium-table .p-datatable-tbody > tr > td {
                    padding: 1rem 1rem;
                    border-bottom: 1px solid #F8FAFC;
                }
                .p-inputtext:focus {
                    border-color: #6366f1 !important;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
                }
                .p-button-indigo {
                    background: #4f46e5 !important;
                    border: none !important;
                }
                .p-button-indigo:hover {
                    background: #4338ca !important;
                }
            `}</style>
        </div>
    );
}
