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
import { InputSwitch } from 'primereact/inputswitch';
import { Tag } from 'primereact/tag';
import {
    WalletCards, Plus, Pencil, Trash2,
    RefreshCw, Banknote, CreditCard, SmartphoneNfc, Settings
} from 'lucide-react';
import { paymentMethodService } from '../../../services/managementService';

// ── Helpers ────────────────────────────────────────────────────────────────
const getMethodMeta = (code: string) => {
    if (code?.includes('CASH'))   return { Icon: Banknote,       iconCls: 'text-slate-700', bg: 'bg-slate-100' };
    if (code?.includes('BANK'))   return { Icon: CreditCard,     iconCls: 'text-slate-700', bg: 'bg-slate-100' };
    if (code?.includes('WALLET')) return { Icon: SmartphoneNfc,  iconCls: 'text-slate-700', bg: 'bg-slate-100' };
    return { Icon: WalletCards, iconCls: 'text-slate-700', bg: 'bg-slate-100' };
};

const EMPTY_FORM = { id: null as number | null, Code: '', Name: '', Description: '', IsActive: true };

export default function PaymentMethodPage() {
    const toast = useRef<any>(null);
    const [methods, setMethods]         = useState<any[]>([]);
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit]           = useState(false);
    const [saving, setSaving]           = useState(false);
    const [form, setForm]               = useState(EMPTY_FORM);

    const showToast = (s: 'success' | 'info' | 'warn' | 'error', sum: string, d: string) =>
        toast.current?.show({ severity: s, summary: sum, detail: d, life: 3500 });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res: any = await paymentMethodService.getAll();
            setMethods(res?.data || []);
        } catch {
            showToast('error', 'Lỗi', 'Không thể tải phương thức thanh toán');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredMethods = methods.filter(m =>
        m.Name?.toLowerCase().includes(search.toLowerCase()) ||
        m.Code?.toLowerCase().includes(search.toLowerCase())
    );

    const openNew = () => { setForm(EMPTY_FORM); setIsEdit(false); setDialogVisible(true); };
    const openEdit = (row: any) => {
        setForm({ id: row.Id, Code: row.Code, Name: row.Name, Description: row.Description || '', IsActive: row.IsActive });
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleSave = async () => {
        if (!form.Name.trim() || !form.Code.trim()) {
            showToast('warn', 'Thiếu thông tin', 'Tên và Mã không được để trống');
            return;
        }
        setSaving(true);
        try {
            const payload = { Code: form.Code, Name: form.Name, Description: form.Description, IsActive: form.IsActive };
            if (isEdit && form.id) {
                await paymentMethodService.update(form.id, payload);
                showToast('success', 'Thành công', 'Đã cập nhật phương thức');
            } else {
                await paymentMethodService.create(payload);
                showToast('success', 'Thành công', 'Đã thêm phương thức mới');
            }
            setDialogVisible(false);
            fetchData();
        } catch (e: any) {
            showToast('error', 'Lỗi', e?.response?.data?.message || 'Không thể lưu dữ liệu');
        } finally { setSaving(false); }
    };

    const confirmDelete = (row: any) => {
        confirmDialog({
            header: 'Xác nhận xóa',
            message: `Xóa phương thức "${row.Name}"? Lưu ý: nếu đã có giao dịch liên kết, nên tắt thay vì xóa.`,
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Xóa',
            rejectLabel: 'Hủy',
            accept: async () => {
                try {
                    await paymentMethodService.delete(row.Id);
                    showToast('success', 'Đã xóa', `Đã xóa "${row.Name}"`);
                    fetchData();
                } catch (e: any) {
                    showToast('error', 'Lỗi', e?.response?.data?.message || 'Không thể xóa');
                }
            },
        });
    };

    // ── Column Templates ──────────────────────────────────────────────────────
    const nameTemplate = (row: any) => {
        const { Icon, iconCls, bg } = getMethodMeta(row.Code);
        return (
            <div className="flex items-center gap-3 py-0.5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                    <Icon size={16} className={iconCls} />
                </div>
                <div>
                    <p className="font-semibold text-slate-800 text-sm">{row.Name}</p>
                    <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">{row.Code}</p>
                </div>
            </div>
        );
    };

    const statusTemplate = (row: any) => (
        <Tag
            value={row.IsActive ? 'Hoạt động' : 'Đã tắt'}
            severity={row.IsActive ? 'success' : 'secondary'}
            className="text-[10px] font-semibold"
        />
    );

    const toggleTemplate = (row: any) => (
        <InputSwitch
            checked={row.IsActive}
            onChange={e => paymentMethodService.update(row.Id, { IsActive: e.value }).then(() => fetchData())}
        />
    );

    const actionTemplate = (row: any) => (
        <div className="flex items-center gap-1 justify-end">
            <Button icon={<Pencil size={13} />} text rounded severity="secondary"
                onClick={() => openEdit(row)} tooltip="Chỉnh sửa" tooltipOptions={{ position: 'top' }} />
            <Button icon={<Trash2 size={13} />} text rounded severity="danger"
                onClick={() => confirmDelete(row)} tooltip="Xóa" tooltipOptions={{ position: 'top' }} />
        </div>
    );

    // ── Stats ─────────────────────────────────────────────────────────────────
    const totalActive   = methods.filter(m => m.IsActive).length;
    const totalInactive = methods.filter(m => !m.IsActive).length;

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* ── Page Header ─────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Phương thức Thanh toán</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Cấu hình các kênh thanh toán tại điểm phát vé (POS)</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        icon={<RefreshCw size={15} className={loading ? 'animate-spin' : ''} />}
                        onClick={fetchData}
                        severity="secondary"
                        outlined
                        tooltip="Tải lại"
                    />
                    <Button
                        label="Thêm mới"
                        icon={<Plus size={15} />}
                        onClick={openNew}
                        className="bg-slate-900 border-none text-sm font-semibold"
                    />
                </div>
            </div>

            {/* ── Summary Strip ────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Tổng phương thức', value: methods.length, icon: <Settings size={16} className="text-slate-600" />, bg: 'bg-slate-100' },
                    { label: 'Đang hoạt động',   value: totalActive,   icon: <WalletCards size={16} className="text-emerald-600" />, bg: 'bg-emerald-50' },
                    { label: 'Đã tắt',            value: totalInactive, icon: <WalletCards size={16} className="text-slate-400" />, bg: 'bg-slate-100' },
                ].map((c, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                        <div>
                            <p className="text-xs text-slate-400 font-semibold mb-1">{c.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
                        </div>
                        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
                            {c.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Table Card ───────────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                {/* Toolbar */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <div className="relative max-w-sm w-full">
                        <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <InputText
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm theo tên hoặc mã..."
                            className="w-full pl-8 py-2 text-sm border-slate-200 bg-white rounded-lg"
                        />
                    </div>
                    {search && (
                        <span className="text-xs text-slate-500">
                            {filteredMethods.length} / {methods.length} kết quả
                        </span>
                    )}
                </div>

                <DataTable
                    value={filteredMethods}
                    loading={loading}
                    rowHover
                    emptyMessage="Chưa có phương thức nào. Nhấn «Thêm mới» để bắt đầu."
                    className="text-sm"
                >
                    <Column
                        field="Id"
                        header="#"
                        body={r => <span className="text-xs font-mono text-slate-400">#{r.Id}</span>}
                        style={{ width: '6%' }}
                    />
                    <Column header="Phương thức" body={nameTemplate} style={{ width: '30%' }} />
                    <Column
                        field="Description"
                        header="Ghi chú"
                        style={{ width: '34%' }}
                        body={r => <span className="text-xs text-slate-500">{r.Description || '—'}</span>}
                    />
                    <Column header="Trạng thái" body={statusTemplate} style={{ width: '12%' }} />
                    <Column header="Bật/Tắt" body={toggleTemplate} style={{ width: '10%' }} />
                    <Column header="" body={actionTemplate} style={{ width: '8%' }} />
                </DataTable>
            </div>

            {/* ── Dialog ───────────────────────────────────────────── */}
            <Dialog
                header={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <WalletCards size={16} className="text-slate-600" />
                        </div>
                        <span className="font-bold text-slate-900 text-base">
                            {isEdit ? 'Chỉnh sửa phương thức' : 'Thêm phương thức mới'}
                        </span>
                    </div>
                }
                visible={dialogVisible}
                style={{ width: '440px' }}
                modal
                onHide={() => setDialogVisible(false)}
                className="font-sans"
                pt={{ content: { className: 'p-6' } }}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600">
                                Mã (Code) <span className="text-red-400">*</span>
                            </label>
                            <InputText
                                value={form.Code}
                                onChange={e => setForm({ ...form, Code: e.target.value.toUpperCase() })}
                                placeholder="VD: CASH, ZALOPAY"
                                className="text-sm border-slate-300 font-mono"
                                autoFocus
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600">Kích hoạt</label>
                            <div className="h-[38px] flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3">
                                <InputSwitch
                                    checked={form.IsActive}
                                    onChange={e => setForm({ ...form, IsActive: e.value || false })}
                                />
                                <span className="text-sm text-slate-600 font-medium">
                                    {form.IsActive ? 'Hoạt động' : 'Đã tắt'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">
                            Tên phương thức <span className="text-red-400">*</span>
                        </label>
                        <InputText
                            value={form.Name}
                            onChange={e => setForm({ ...form, Name: e.target.value })}
                            placeholder="VD: Tiền mặt, ZaloPay..."
                            className="text-sm border-slate-300"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Ghi chú (tùy chọn)</label>
                        <InputTextarea
                            value={form.Description}
                            onChange={e => setForm({ ...form, Description: e.target.value })}
                            rows={3}
                            placeholder="Mô tả ngắn về kênh thanh toán này..."
                            className="text-sm border-slate-300 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <Button
                            label="Hủy"
                            text
                            className="text-sm text-slate-600 font-semibold"
                            onClick={() => setDialogVisible(false)}
                            disabled={saving}
                        />
                        <Button
                            label={isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
                            loading={saving}
                            onClick={handleSave}
                            className="bg-slate-900 border-none text-sm font-semibold px-6"
                        />
                    </div>
                </div>
            </Dialog>

            <style>{`
                .p-datatable-thead > tr > th {
                    background: #f8fafc !important;
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.06em !important;
                    color: #64748b !important;
                    padding: 0.8rem 1rem !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                }
                .p-datatable-tbody > tr > td {
                    padding: 0.8rem 1rem !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    font-size: 13px !important;
                }
                .p-datatable-tbody > tr:hover > td { background: #f8fafc !important; }
            `}</style>
        </div>
    );
}
