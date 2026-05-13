"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from 'primereact/inputswitch';
import { SelectButton } from 'primereact/selectbutton';
import { Tag } from 'primereact/tag';
import { 
    Sparkles, Plus, Edit2, Trash2, Search, 
    RefreshCcw, CalendarDays, Percent, Image as ImageIcon, 
    Clock, CheckCircle2, AlertCircle, XCircle,
    Megaphone, Save, Upload, X, Banknote
} from 'lucide-react';
import { promotionService } from '../../../services/managementService';

const fmt = (n: number | null) =>
    n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '---';

const DISCOUNT_TYPES = [
    { label: 'Số tiền cố định', value: 'amount', icon: <Banknote size={14} className="mr-2"/> },
    { label: 'Phần trăm (%)', value: 'percent', icon: <Percent size={14} className="mr-2"/> }
];

export default function PromotionsPage() {
    const toast = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [promotions, setPromotions] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, expiringSoon: 0, scheduled: 0 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [discountType, setDiscountType] = useState('amount');
    const [form, setForm] = useState({
        Code: '',
        Name: '',
        Description: '',
        DiscountAmount: null as number | null,
        DiscountPercent: null as number | null,
        StartDate: null as Date | null,
        EndDate: null as Date | null,
        isActive: true,
        ImageUrl: ''
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [dataRes, statsRes]: any[] = await Promise.all([
                promotionService.getAll({ search, status: statusFilter !== 'all' ? statusFilter : undefined }),
                promotionService.getStats()
            ]);
            setPromotions(dataRes?.data || []);
            setStats(statsRes?.data || { total: 0, active: 0, expiringSoon: 0, scheduled: 0 });
        } catch {
            showToast('error', 'Lỗi', 'Không thể tải dữ liệu khuyến mãi');
        } finally { setLoading(false); }
    }, [search, statusFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const showToast = (s: 'success' | 'info' | 'warn' | 'error', sum: string, d: string) =>
        toast.current?.show({ severity: s, summary: sum, detail: d, life: 3000 });

    const openNew = () => {
        setForm({ Code: '', Name: '', Description: '', DiscountAmount: 0, DiscountPercent: null, StartDate: null, EndDate: null, isActive: true, ImageUrl: '' });
        setDiscountType('amount');
        setIsEdit(false);
        setDialogVisible(true);
    };

    const editPromo = (promo: any) => {
        setForm({
            ...promo,
            StartDate: new Date(promo.StartDate),
            EndDate: new Date(promo.EndDate)
        });
        setDiscountType(promo.DiscountPercent ? 'percent' : 'amount');
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('banner', file);

        setUploading(true);
        try {
            const res: any = await promotionService.uploadBanner(formData);
            if (res?.success) {
                setForm(prev => ({ ...prev, ImageUrl: `http://localhost:3000${res.url}` }));
                showToast('success', 'Thành công', 'Đã tải ảnh lên máy chủ');
            }
        } catch {
            showToast('error', 'Lỗi', 'Không thể tải ảnh lên');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        if (!form.Code || !form.Name || !form.StartDate || !form.EndDate) {
            showToast('warn', 'Thiếu thông tin', 'Vui lòng nhập đầy đủ thông tin bắt buộc');
            return;
        }

        const payload = { ...form };
        if (discountType === 'amount') payload.DiscountPercent = null;
        else payload.DiscountAmount = null;

        setSaving(true);
        try {
            if (isEdit) {
                await promotionService.update(form.Code, payload);
                showToast('success', 'Thành công', 'Cập nhật khuyến mãi thành công');
            } else {
                await promotionService.create(payload);
                showToast('success', 'Thành công', 'Tạo khuyến mãi mới thành công');
            }
            setDialogVisible(false);
            fetchData();
        } catch (e: any) {
            showToast('error', 'Lỗi', e?.response?.data?.message || 'Không thể lưu dữ liệu');
        } finally { setSaving(false); }
    };

    const confirmDelete = (promo: any) => {
        confirmDialog({
            message: `Bạn có chắc chắn muốn xóa chương trình "${promo.Name}"?`,
            header: 'Xác nhận xóa',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Xóa',
            rejectLabel: 'Hủy',
            accept: async () => {
                try {
                    await promotionService.delete(promo.Code);
                    showToast('success', 'Thành công', 'Đã xóa khuyến mãi');
                    fetchData();
                } catch { showToast('error', 'Lỗi', 'Không thể xóa khuyến mãi'); }
            }
        });
    };

    // ── Templates ──────────────────────────────────────────────
    const nameTemplate = (row: any) => (
        <div className="flex items-center gap-3 py-1">
            <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
                {row.ImageUrl ? (
                    <img src={row.ImageUrl} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                    <ImageIcon size={16} className="text-slate-400" />
                )}
            </div>
            <div>
                <span className="font-semibold text-slate-800 text-sm block leading-tight">{row.Name}</span>
                <span className="text-xs font-bold text-slate-500">{row.Code}</span>
            </div>
        </div>
    );

    const discountTemplate = (row: any) => {
        if (row.DiscountPercent) {
            return (
                <div className="flex items-center gap-1.5 font-bold text-slate-700 text-sm">
                    <Percent size={14} className="text-slate-400" />
                    <span>{parseFloat(row.DiscountPercent)}%</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 text-sm">
                <Banknote size={14} className="text-emerald-500" />
                <span>{fmt(parseFloat(row.DiscountAmount))}</span>
            </div>
        );
    };

    const statusTemplate = (row: any) => {
        const now = new Date();
        const start = new Date(row.StartDate);
        const end = new Date(row.EndDate);

        if (!row.isActive) return <Tag value="Tắt" severity="danger" className="text-[10px] font-bold uppercase" />;
        if (now > end) return <Tag value="Hết hạn" severity="secondary" className="text-[10px] font-bold uppercase" />;
        if (now < start) return <Tag value="Sắp tới" severity="warning" className="text-[10px] font-bold uppercase" />;
        return <Tag value="Đang diễn ra" severity="success" className="text-[10px] font-bold uppercase" />;
    };

    const dateTemplate = (row: any) => (
        <div className="text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1">
                <span className="w-10 text-slate-400">Từ:</span> {new Date(row.StartDate).toLocaleDateString('vi-VN')}
            </div>
            <div className="flex items-center gap-1">
                <span className="w-10 text-slate-400">Đến:</span> {new Date(row.EndDate).toLocaleDateString('vi-VN')}
            </div>
        </div>
    );

    const actionTemplate = (row: any) => (
        <div className="flex items-center gap-1 justify-end">
            <Button 
                icon={<Edit2 size={13}/>} text rounded severity="secondary" 
                onClick={() => editPromo(row)} tooltip="Sửa" tooltipOptions={{ position: 'top' }}
            />
            <Button 
                icon={<Trash2 size={13}/>} text rounded severity="danger" 
                onClick={() => confirmDelete(row)} tooltip="Xóa" tooltipOptions={{ position: 'top' }}
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <Toast ref={toast} position="top-right" />
            <ConfirmDialog />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Chiến Dịch Khuyến Mãi</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Quản lý mã giảm giá và chương trình ưu đãi.</p>
                </div>
                <Button 
                    label="Tạo chiến dịch" icon={<Plus size={15}/>}
                    onClick={openNew} 
                    className="bg-slate-900 border-none text-white text-sm font-semibold" 
                />
            </div>

            {/* Stat Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Tổng số chiến dịch', value: stats.total, icon: Megaphone, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Đang hoạt động', value: stats.active, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Sắp hết hạn', value: stats.expiringSoon, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
                    { label: 'Lịch trình tương lai', value: stats.scheduled, icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                        <div>
                            <p className="text-xs text-slate-400 font-semibold mb-1">{s.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                        </div>
                        <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                            <s.icon size={16} className={s.color} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <div className="relative max-w-sm w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <InputText 
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm mã hoặc tên chiến dịch..." 
                            className="w-full pl-9 py-2 text-sm border-slate-200 bg-white rounded-lg"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select 
                            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 font-medium outline-none"
                        >
                            <option value="all">Tất cả</option>
                            <option value="active">Đang diễn ra</option>
                            <option value="scheduled">Sắp diễn ra</option>
                            <option value="expired">Hết hạn/Tắt</option>
                        </select>
                        <Button 
                            icon={<RefreshCcw size={14} className={loading ? 'animate-spin' : ''}/>} 
                            className="p-button-secondary bg-white border-slate-200 text-slate-600 w-9 h-9 p-0 flex items-center justify-center" 
                            onClick={fetchData} tooltip="Làm mới"
                        />
                    </div>
                </div>

                <DataTable 
                    value={promotions} loading={loading} paginator rows={10} 
                    rowHover className="text-sm"
                    emptyMessage="Chưa có chương trình khuyến mãi nào."
                >
                    <Column header="Chiến dịch" body={nameTemplate} style={{ width: '35%' }} />
                    <Column header="Mức giảm" body={discountTemplate} style={{ width: '20%' }} />
                    <Column header="Trạng thái" body={statusTemplate} style={{ width: '15%' }} />
                    <Column header="Thời gian" body={dateTemplate} style={{ width: '20%' }} />
                    <Column header="" body={actionTemplate} style={{ width: '10%' }} align="right" />
                </DataTable>
            </div>

            {/* Dialog Form */}
            <Dialog 
                header={
                    <div className="flex items-center gap-2">
                        <Megaphone size={16} className="text-slate-600"/> 
                        <span className="font-bold text-slate-900 text-base">{isEdit ? 'Cập nhật chiến dịch' : 'Tạo chiến dịch mới'}</span>
                    </div>
                }
                visible={dialogVisible} style={{ width: '650px' }} modal
                onHide={() => !saving && setDialogVisible(false)}
                pt={{ content: { className: 'p-6 pt-2' } }}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Side: Basic Info */}
                    <div className="col-span-2 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Mã Code <span className="text-red-400">*</span></label>
                                <InputText value={form.Code} disabled={isEdit} onChange={e => setForm({...form, Code: e.target.value.toUpperCase()})} className="w-full text-sm font-semibold uppercase border-slate-300" placeholder="VD: KM2024" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Tên chương trình <span className="text-red-400">*</span></label>
                                <InputText value={form.Name} onChange={e => setForm({...form, Name: e.target.value})} className="w-full text-sm border-slate-300" placeholder="VD: Khuyến mãi sinh viên" />
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Cấu hình mức giảm</label>
                                <SelectButton 
                                    value={discountType} 
                                    options={DISCOUNT_TYPES} 
                                    onChange={(e) => e.value && setDiscountType(e.value)} 
                                    className="text-sm"
                                    pt={{ button: { className: 'py-2 px-3 text-xs' } }}
                                />
                            </div>
                            
                            {discountType === 'amount' ? (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-600">Số tiền giảm (VNĐ)</label>
                                    <InputNumber value={form.DiscountAmount} onValueChange={e => setForm({...form, DiscountAmount: e.value ?? null})} className="w-full" inputClassName="text-sm border-slate-300 font-semibold" />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-600">Tỷ lệ giảm (%)</label>
                                    <InputNumber value={form.DiscountPercent} onValueChange={e => setForm({...form, DiscountPercent: e.value ?? null})} className="w-full" inputClassName="text-sm border-slate-300 font-semibold" suffix="%" min={0} max={100} />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Ngày bắt đầu</label>
                                <Calendar value={form.StartDate} onChange={e => setForm({...form, StartDate: e.value as Date})} showIcon className="w-full text-sm" inputClassName="text-sm border-slate-300" dateFormat="dd/mm/yy" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Ngày kết thúc</label>
                                <Calendar value={form.EndDate} onChange={e => setForm({...form, EndDate: e.value as Date})} showIcon className="w-full text-sm" inputClassName="text-sm border-slate-300" dateFormat="dd/mm/yy" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600">Mô tả chương trình</label>
                            <InputTextarea value={form.Description} onChange={e => setForm({...form, Description: e.target.value})} rows={2} className="w-full border-slate-300 text-sm" />
                        </div>
                    </div>

                    {/* Right Side: Media & Status */}
                    <div className="col-span-1 space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600">Banner chiến dịch</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-[4/5] bg-slate-50 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors relative group overflow-hidden"
                            >
                                {uploading && (
                                    <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
                                    </div>
                                )}
                                
                                {form.ImageUrl ? (
                                    <>
                                        <img src={form.ImageUrl} className="w-full h-full object-cover" alt="Banner" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-white text-xs font-semibold">Đổi ảnh</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <Upload size={20} />
                                        <span className="text-xs font-medium">Tải ảnh lên</span>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                            </div>
                            {form.ImageUrl && (
                                <Button 
                                    label="Xóa ảnh" icon={<X size={12}/>} severity="danger" text size="small"
                                    onClick={() => setForm({...form, ImageUrl: ''})}
                                    className="p-0 text-xs mt-1 self-start"
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600">Trạng thái</label>
                            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <span className="text-sm font-semibold text-slate-700">{form.isActive ? 'Đang bật' : 'Đã tắt'}</span>
                                <InputSwitch checked={form.isActive} onChange={e => setForm({...form, isActive: e.value})} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-6 mt-4 border-t border-slate-100">
                    <Button label="Hủy" severity="secondary" outlined className="px-4 py-2 text-sm font-semibold" onClick={() => setDialogVisible(false)} />
                    <Button label={isEdit ? 'Lưu cập nhật' : 'Tạo chiến dịch'} icon={<Save size={14}/>} loading={saving} onClick={handleSave} className="bg-slate-900 border-none text-white px-4 py-2 text-sm font-semibold" />
                </div>
            </Dialog>

            <style>{`
                .p-datatable-thead > tr > th { background: #f8fafc !important; font-size: 11px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.06em !important; color: #64748b !important; padding: 0.8rem 1rem !important; border-bottom: 1px solid #e2e8f0 !important; }
                .p-datatable-tbody > tr > td { padding: 0.8rem 1rem !important; border-bottom: 1px solid #f1f5f9 !important; font-size: 13px !important; }
                .p-datatable-tbody > tr:hover > td { background: #f8fafc !important; }
            `}</style>
        </div>
    );
}
