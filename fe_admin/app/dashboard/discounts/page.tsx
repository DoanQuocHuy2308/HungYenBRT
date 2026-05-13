"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { 
    ShieldCheck, Clock, CheckCircle2, XCircle, 
    Eye, Trash2, Search, RefreshCw, 
    Calendar as CalendarIcon, FileText, ExternalLink, Sparkles
} from 'lucide-react';
import { discountRegistrationService, promotionService } from '../../../services/managementService';

// Link to the config page logic
import DiscountConfigView from './config_view';

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
};

const formatDateShort = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(new Date(dateString));
};

export default function DiscountManagementPage() {
    const toast = useRef<any>(null);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'registrations' | 'config'>('registrations');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');

    // Detail Modal
    const [showDetail, setShowDetail] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [processing, setProcessing] = useState(false);

    // Approval/Rejection State
    const [expiryDate, setExpiryDate] = useState<Date | null>(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);
    
    const [promotions, setPromotions] = useState<any[]>([]);
    const [selectedPromotion, setSelectedPromotion] = useState<string | null>(null);

    // Xóa hồ sơ
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    useEffect(() => {
        const loadPromotions = async () => {
            try {
                const res: any = await promotionService.getAll({ status: 'active' });
                setPromotions(res?.data || []);
            } catch (e) {
                console.error(e);
            }
        };
        loadPromotions();
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res: any = await discountRegistrationService.getAll({ 
                status: statusFilter === 'all' ? undefined : statusFilter,
                search 
            });
            setRegistrations(res?.data || []);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách hồ sơ' });
        } finally {
            setLoading(false);
        }
    }, [statusFilter, search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
        if (status === 'rejected' && !rejectReason) {
            toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng nhập lý do từ chối' });
            return;
        }
        if (status === 'approved' && !selectedPromotion) {
            toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng chọn Mã khuyến mãi' });
            return;
        }

        setProcessing(true);
        try {
            await discountRegistrationService.updateStatus(id, {
                status,
                expiry_date: status === 'approved' ? expiryDate : undefined,
                PromotionCode: status === 'approved' ? (selectedPromotion || undefined) : undefined,
                rejected_reason: status === 'rejected' ? rejectReason : undefined
            });
            toast.current?.show({ 
                severity: 'success', 
                summary: 'Thành công', 
                detail: status === 'approved' ? 'Đã duyệt hồ sơ & Gán mã khuyến mãi' : 'Đã từ chối hồ sơ' 
            });
            setShowDetail(false);
            fetchData();
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: err.message || 'Không thể cập nhật hồ sơ' });
        } finally {
            setProcessing(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await discountRegistrationService.delete(deleteConfirmId);
            toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa hồ sơ ưu đãi' });
            fetchData();
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa hồ sơ' });
        } finally {
            setDeleteConfirmId(null);
        }
    };

    // ── Table Templates ──────────────────────────────────────────────────────
    const statusTemplate = (r: any) => {
        const maps: any = {
            pending:  { label: 'Chờ duyệt', severity: 'warning',   icon: Clock },
            approved: { label: 'Đã duyệt',  severity: 'success',   icon: CheckCircle2 },
            rejected: { label: 'Từ chối',   severity: 'danger',    icon: XCircle },
            expired:  { label: 'Hết hạn',   severity: 'secondary', icon: CalendarIcon },
        };
        const m = maps[r.status] || maps.pending;
        const Icon = m.icon;
        return (
            <div className="flex items-center gap-1.5">
                <Tag value={m.label} severity={m.severity} className="text-[10px] uppercase font-bold" />
            </div>
        );
    };

    const userTemplate = (r: any) => {
        const name = r.user?.name || r.user?.Full_Name || 'Ẩn danh';
        const phone = r.user?.phone || r.user?.Phone || 'Không có SĐT';
        return (
            <div className="flex items-center gap-3 py-1">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                    {name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <span className="font-bold text-slate-800 text-sm block leading-tight">{name}</span>
                    <span className="text-[10px] font-medium text-slate-400">{phone}</span>
                </div>
            </div>
        );
    };

    const typeTemplate = (r: any) => (
        <div>
            <span className="font-bold text-sm text-slate-800 block leading-tight">{r.discount_type?.Name}</span>
            <span className="text-xs font-semibold text-emerald-600">Giảm: {r.discount_type?.DiscountPercentage}%</span>
        </div>
    );

    const actionTemplate = (r: any) => (
        <div className="flex items-center justify-end gap-1">
            <Button 
                icon={r.status === 'pending' ? <ShieldCheck size={14}/> : <Eye size={14}/>}
                label={r.status === 'pending' ? 'Duyệt' : 'Chi tiết'}
                onClick={async () => { 
                    try {
                        const res: any = await discountRegistrationService.getById(r.id);
                        setSelected(res?.data || r); 
                        setShowDetail(true); 
                        setShowRejectInput(false); 
                        setRejectReason(''); 
                    } catch (e) {
                        toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải chi tiết hồ sơ' });
                    }
                }}
                className={`p-button-sm px-3 py-1.5 text-xs font-semibold ${r.status === 'pending' ? 'bg-slate-900 text-white border-none' : 'p-button-secondary p-button-text'}`}
            />
            <Button 
                icon={<Trash2 size={14}/>}
                onClick={() => setDeleteConfirmId(r.id)}
                className="p-button-sm p-button-danger p-button-text px-2"
                tooltip="Xóa hồ sơ" tooltipOptions={{ position: 'top' }}
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <Toast ref={toast} position="top-right" />

            {/* DELETE CONFIRM DIALOG */}
            <Dialog
                visible={deleteConfirmId !== null}
                onHide={() => setDeleteConfirmId(null)}
                header="Xác nhận xóa"
                modal
                style={{ width: '400px' }}
                pt={{ content: { className: 'p-6 pt-2' } }}
            >
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <Trash2 size={20} className="text-red-500" />
                    </div>
                    <div>
                        <p className="text-slate-700 text-sm leading-relaxed mb-4">
                            Bạn có chắc chắn muốn xóa hồ sơ ưu đãi này? 
                            Mọi thông tin và giấy tờ đính kèm sẽ bị xóa vĩnh viễn và không thể khôi phục.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <Button label="Hủy" onClick={() => setDeleteConfirmId(null)} className="p-button-text p-button-secondary text-sm font-semibold" />
                            <Button label="Xóa vĩnh viễn" onClick={confirmDelete} className="bg-red-600 border-none text-sm font-semibold text-white px-4" />
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Quản lý Ưu Đãi</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Hệ thống xét duyệt và cấu hình chính sách giảm giá</p>
                </div>

                <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('registrations')}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'registrations' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Duyệt hồ sơ
                    </button>
                    <button 
                        onClick={() => setActiveTab('config')}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'config' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Cấu hình form
                    </button>
                </div>
            </div>

            {activeTab === 'registrations' ? (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {/* FILTER BAR */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50">
                        <div className="relative max-w-sm w-full">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <InputText 
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Tìm kiếm tên, số điện thoại..." 
                                className="w-full pl-9 py-2 bg-white border-slate-200 rounded-lg text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex p-1 bg-white border border-slate-200 rounded-lg">
                                {[
                                    { id: 'all', label: 'Tất cả' },
                                    { id: 'pending', label: 'Chờ duyệt' },
                                    { id: 'approved', label: 'Đã duyệt' },
                                    { id: 'rejected', label: 'Từ chối' }
                                ].map(s => (
                                    <button 
                                        key={s.id} onClick={() => setStatusFilter(s.id)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${statusFilter === s.id ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                            <Button icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />} onClick={fetchData} className="p-button-secondary bg-white border-slate-200 text-slate-600 w-9 h-9 p-0 flex items-center justify-center" tooltip="Làm mới" />
                        </div>
                    </div>

                    {/* DATA TABLE */}
                    <DataTable 
                        value={registrations} 
                        loading={loading} 
                        paginator rows={15} 
                        rowHover 
                        className="text-sm"
                        emptyMessage="Không có hồ sơ ưu đãi nào."
                    >
                        <Column header="Khách Hàng" body={userTemplate} style={{ width: '25%' }} className="pl-4" />
                        <Column header="Gói Ưu Đãi" body={typeTemplate} style={{ width: '25%' }} />
                        <Column header="Ngày Đăng Ký" body={(r) => <span className="text-xs text-slate-600">{formatDate(r.registration_Date)}</span>} style={{ width: '20%' }} />
                        <Column header="Trạng Thái" body={statusTemplate} style={{ width: '15%' }} />
                        <Column header="" body={actionTemplate} style={{ width: '15%' }} align="right" className="pr-4" />
                    </DataTable>
                </div>
            ) : (
                <DiscountConfigView />
            )}

            {/* DETAIL & APPROVAL DIALOG */}
            <Dialog 
                header={
                    <div className="flex items-center gap-2">
                        <FileText size={18} className="text-slate-600" />
                        <span className="font-bold text-slate-900 text-base">Hồ sơ đăng ký ưu đãi</span>
                    </div>
                }
                visible={showDetail} 
                onHide={() => setShowDetail(false)}
                modal 
                style={{ width: '600px' }}
                pt={{ content: { className: 'p-6 pt-2' } }}
            >
                {selected && (
                    <div className="space-y-6">
                        {/* Profile Info Summary */}
                        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 text-lg">
                                {(selected.user?.name || selected.user?.Full_Name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">{selected.user?.name || selected.user?.Full_Name || 'Ẩn danh'}</h3>
                                <p className="text-sm text-slate-500 font-medium">Gói: <span className="text-emerald-600 font-semibold">{selected.discount_type?.Name}</span></p>
                            </div>
                        </div>

                        {/* Submitted Fields */}
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Tài liệu đính kèm</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {selected.field_values?.map((val: any) => (
                                    <div key={val.id} className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex flex-col gap-2">
                                        <span className="text-xs font-semibold text-slate-500">{val.discount_field?.field_Name || 'Thông tin'}</span>
                                        {val.discount_field?.field_Type === 'image' ? (
                                            <div className="relative aspect-video rounded-md overflow-hidden border border-slate-200 bg-white group cursor-pointer" onClick={() => window.open(`http://localhost:3000${val.field_Value}`, '_blank')}>
                                                <img 
                                                    src={`http://localhost:3000${val.field_Value}`} 
                                                    alt={val.discount_field?.field_Name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <ExternalLink size={20} className="text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm font-semibold text-slate-800">{val.field_Value}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Processing Section */}
                        {selected.status === 'pending' && (
                            <div className="border-t border-slate-100 pt-4">
                                {!showRejectInput ? (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                        <p className="font-bold text-sm text-slate-800">Xét duyệt hồ sơ</p>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold text-slate-600">Ngày hết hạn (tự động)</label>
                                                <Calendar 
                                                    value={expiryDate} onChange={(e) => setExpiryDate(e.value as Date)} 
                                                    dateFormat="dd/mm/yy" showIcon className="w-full text-sm"
                                                    inputClassName="py-2 text-sm border-slate-300"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold text-slate-600">Mã khuyến mãi áp dụng <span className="text-red-400">*</span></label>
                                                <Dropdown 
                                                    value={selectedPromotion} onChange={(e) => setSelectedPromotion(e.value)} 
                                                    options={promotions} optionLabel="Name" optionValue="Code"
                                                    placeholder="Chọn mã KM" 
                                                    className="w-full text-sm border-slate-300"
                                                    pt={{ root: { className: 'h-9 flex items-center' } }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2 pt-2">
                                            <Button label="Từ chối" severity="danger" outlined className="w-1/3 text-sm font-semibold" onClick={() => setShowRejectInput(true)} />
                                            <Button label="Phê duyệt" loading={processing} onClick={() => handleUpdateStatus(selected.id, 'approved')} className="w-2/3 bg-slate-900 border-none text-white text-sm font-semibold" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 space-y-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-rose-700">Lý do từ chối <span className="text-rose-500">*</span></label>
                                            <InputTextarea 
                                                value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                                                className="w-full border-rose-200 text-sm"
                                                rows={3} placeholder="Ví dụ: Ảnh giấy tờ bị mờ, thông tin không khớp..."
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button label="Quay lại" severity="secondary" outlined className="w-1/3 text-sm font-semibold" onClick={() => setShowRejectInput(false)} />
                                            <Button label="Xác nhận từ chối" severity="danger" loading={processing} onClick={() => handleUpdateStatus(selected.id, 'rejected')} className="w-2/3 border-none text-sm font-semibold" disabled={!rejectReason} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Approved Info */}
                        {selected.status === 'approved' && (
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-3">
                                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                                    <CheckCircle2 size={16} /> Hồ sơ đã được phê duyệt
                                </div>
                                <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-100/50 p-2 rounded">
                                    <span>Hạn sử dụng: <strong>{formatDateShort(selected.expiry_date)}</strong></span>
                                    {selected.promotion && (
                                        <span>Mã KM: <strong>{selected.promotion.Code}</strong></span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Rejected Info */}
                        {selected.status === 'rejected' && (
                            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 space-y-2">
                                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                                    <XCircle size={16} /> Hồ sơ bị từ chối
                                </div>
                                <p className="text-sm text-rose-800 bg-rose-100/50 p-3 rounded italic">Lý do: "{selected.rejected_reason || 'Không có lý do'}"</p>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>

            <style>{`
                .p-datatable-thead > tr > th { background: #f8fafc !important; font-size: 11px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.06em !important; color: #64748b !important; padding: 0.8rem 1rem !important; border-bottom: 1px solid #e2e8f0 !important; }
                .p-datatable-tbody > tr > td { padding: 0.8rem 1rem !important; border-bottom: 1px solid #f1f5f9 !important; font-size: 13px !important; }
                .p-datatable-tbody > tr:hover > td { background: #f8fafc !important; }
            `}</style>
        </div>
    );
}
