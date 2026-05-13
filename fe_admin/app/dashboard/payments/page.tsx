"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputSwitch } from 'primereact/inputswitch';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import {
    CreditCard, Banknote, TrendingUp, Activity,
    RefreshCw, Plus, Pencil, Trash2, Settings,
    DollarSign, ReceiptText, Wallet, ArrowUpRight
} from 'lucide-react';
import { paymentService, paymentMethodService } from '../../../services/managementService';

const fmt = (n: any) => {
    const val = parseFloat(n);
    if (isNaN(val)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const fmtDate = (d: any) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
    'Tiền mặt': <Banknote size={15} />,
    'ZaloPay': <Wallet size={15} />,
    'Chuyển khoản': <CreditCard size={15} />,
};

export default function PaymentManagementPage() {
    const toast = useRef<any>(null);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [methods, setMethods] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ totalRevenue: 0, totalTransactions: 0, paymentMethods: [] });

    const [search, setSearch] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [dates, setDates] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'transactions' | 'methods'>('transactions');

    const [methodDialog, setMethodDialog] = useState(false);
    const [currentMethod, setCurrentMethod] = useState<any>({ Name: '', Code: '', Description: '', IsActive: true });
    const [isEdit, setIsEdit] = useState(false);
    const [saving, setSaving] = useState(false);

    const showToast = (s: 'success' | 'warn' | 'error', sum: string, d: string) =>
        toast.current?.show({ severity: s, summary: sum, detail: d, life: 3000 });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [transRes, methodRes, statsRes]: any[] = await Promise.all([
                paymentService.getAll(),
                paymentMethodService.getAll(),
                paymentService.getStats()
            ]);
            setTransactions(transRes?.data || []);
            setMethods(methodRes?.data || []);
            setStats(statsRes?.data || { totalRevenue: 0, totalTransactions: 0, paymentMethods: [] });
        } catch {
            showToast('error', 'Lỗi', 'Không thể đồng bộ dữ liệu thanh toán');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSaveMethod = async () => {
        if (!currentMethod.Name || !currentMethod.Code) return showToast('warn', 'Thiếu thông tin', 'Tên và Mã là bắt buộc');
        setSaving(true);
        try {
            if (isEdit) await paymentMethodService.update(currentMethod.Id, currentMethod);
            else await paymentMethodService.create(currentMethod);
            showToast('success', 'Thành công', 'Đã lưu phương thức');
            setMethodDialog(false);
            fetchData();
        } catch { showToast('error', 'Lỗi', 'Thao tác thất bại'); }
        finally { setSaving(false); }
    };

    const confirmDeleteMethod = (id: number) => {
        confirmDialog({
            header: 'Xác nhận xóa',
            message: 'Xóa phương thức thanh toán này?',
            acceptLabel: 'Xóa', rejectLabel: 'Hủy',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try { await paymentMethodService.delete(id); showToast('success', 'Thành công', 'Đã xóa'); fetchData(); }
                catch { showToast('error', 'Lỗi', 'Không thể xóa'); }
            }
        });
    };

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filteredTransactions = transactions.filter(t => {
        const q = search.toLowerCase();
        const matchSearch = !search ||
            (t.TransactionId && t.TransactionId.toLowerCase().includes(q)) ||
            t.PaymentMethod.toLowerCase().includes(q) ||
            (t.tickets?.[0]?.user?.name && t.tickets[0].user.name.toLowerCase().includes(q)) ||
            (t.tickets?.[0]?.user?.phone && t.tickets[0].user.phone.includes(q));
        const matchMethod = !selectedMethod || t.PaymentMethod === selectedMethod;
        let matchDate = true;
        if (dates?.[0] && dates?.[1]) {
            const d = new Date(t.created_at);
            matchDate = d >= dates[0] && d <= dates[1];
        }
        return matchSearch && matchMethod && matchDate;
    });

    const filteredRevenue = filteredTransactions.reduce((s, t) => s + parseFloat(t.Amount || 0), 0);
    const methodBreakdown = Array.from(new Set(filteredTransactions.map(t => t.PaymentMethod))).map(m => ({
        method: m,
        revenue: filteredTransactions.filter(t => t.PaymentMethod === m).reduce((s, t) => s + parseFloat(t.Amount || 0), 0),
        count: filteredTransactions.filter(t => t.PaymentMethod === m).length
    }));

    const methodOptions = [
        { label: 'Tất cả phương thức', value: null },
        ...stats.paymentMethods.map((m: any) => ({ label: m.method, value: m.method }))
    ];

    // ── Summary Cards ─────────────────────────────────────────────────────────
    const summaryCards = [
        {
            label: 'Doanh thu hiển thị',
            value: fmt(filteredRevenue),
            icon: <TrendingUp size={18} className="text-emerald-600" />,
            bg: 'bg-emerald-50',
        },
        {
            label: 'Số giao dịch',
            value: `${filteredTransactions.length} đơn`,
            icon: <Activity size={18} className="text-blue-600" />,
            bg: 'bg-blue-50',
        },
        {
            label: 'Tổng doanh thu hệ thống',
            value: fmt(stats.totalRevenue),
            icon: <DollarSign size={18} className="text-slate-600" />,
            bg: 'bg-slate-100',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* ── Page Header ─────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Quản lý Thanh toán</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Theo dõi giao dịch và cấu hình phương thức thanh toán</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        icon={<RefreshCw size={15} className={loading ? 'animate-spin' : ''} />}
                        onClick={fetchData}
                        severity="secondary"
                        outlined
                        className="text-sm"
                        tooltip="Tải lại dữ liệu"
                    />
                    <Button
                        label="Thêm cổng"
                        icon={<Plus size={15} />}
                        onClick={() => { setIsEdit(false); setCurrentMethod({ Name: '', Code: '', Description: '', IsActive: true }); setMethodDialog(true); }}
                        className="bg-slate-900 border-none text-sm font-semibold"
                    />
                </div>
            </div>

            {/* ── Summary Cards ────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {summaryCards.map((c, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
                        <div>
                            <p className="text-xs text-slate-400 font-semibold mb-1">{c.label}</p>
                            <p className="text-xl font-bold text-slate-900">{c.value}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
                            {c.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Phân bổ theo phương thức ──────────────────────────── */}
            {methodBreakdown.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Phân bổ doanh thu theo phương thức</p>
                    <div className="flex flex-wrap gap-3">
                        {methodBreakdown.map((m, i) => (
                            <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex-1 min-w-[150px]">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                                    {METHOD_ICONS[m.method] || <ReceiptText size={15} />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-700">{m.method}</p>
                                    <p className="text-sm font-bold text-slate-900">{fmt(m.revenue)}</p>
                                    <p className="text-[10px] text-slate-400">{m.count} giao dịch</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Tabs ─────────────────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                {/* Tab Bar */}
                <div className="flex border-b border-slate-200">
                    {[
                        { key: 'transactions', label: 'Lịch sử giao dịch', icon: <ReceiptText size={14} /> },
                        { key: 'methods', label: 'Cổng thanh toán', icon: <Settings size={14} /> },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                                activeTab === tab.key
                                    ? 'border-slate-900 text-slate-900'
                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab: Lịch sử giao dịch ──────────────────────── */}
                {activeTab === 'transactions' && (
                    <div>
                        {/* Filter Bar */}
                        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
                            <div className="relative flex-1 min-w-[220px] max-w-sm">
                                <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                <InputText
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Mã GD, tên, SĐT..."
                                    className="w-full pl-8 py-2 text-sm border-slate-200 bg-white rounded-lg"
                                />
                            </div>

                            <Dropdown
                                value={selectedMethod}
                                options={methodOptions}
                                onChange={e => setSelectedMethod(e.value)}
                                placeholder="Phương thức"
                                className="text-sm w-44"
                                pt={{
                                    root: { className: 'border-slate-200 rounded-lg bg-white text-sm' },
                                    input: { className: 'py-2 text-sm font-medium' }
                                }}
                            />

                            <Calendar
                                value={dates}
                                onChange={(e: any) => setDates(e.value)}
                                selectionMode="range"
                                placeholder="Khoảng ngày"
                                className="w-56 text-sm"
                                inputClassName="py-2 text-sm border-slate-200 rounded-lg"
                                showButtonBar
                            />

                            <div className="flex gap-1">
                                {['Hôm nay', 'Hôm qua'].map((label, i) => (
                                    <button
                                        key={label}
                                        onClick={() => {
                                            const today = new Date(); today.setHours(0, 0, 0, 0);
                                            const end = new Date(); end.setHours(23, 59, 59, 999);
                                            if (i === 0) { setDates([today, end]); }
                                            else {
                                                const y = new Date(today); y.setDate(y.getDate() - 1);
                                                const ye = new Date(y); ye.setHours(23, 59, 59, 999);
                                                setDates([y, ye]);
                                            }
                                        }}
                                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        {label}
                                    </button>
                                ))}
                                {(search || selectedMethod || dates) && (
                                    <button
                                        onClick={() => { setSearch(''); setSelectedMethod(null); setDates(null); }}
                                        className="px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        Xóa lọc
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Table */}
                        <DataTable
                            value={filteredTransactions}
                            loading={loading}
                            paginator
                            rows={15}
                            rowsPerPageOptions={[10, 15, 30]}
                            sortField="created_at"
                            sortOrder={-1}
                            rowHover
                            emptyMessage="Không có giao dịch nào"
                            className="text-sm"
                            pt={{
                                thead: { className: 'bg-slate-50' },
                            }}
                        >
                            <Column
                                header="Mã giao dịch"
                                body={r => (
                                    <div>
                                        <p className="font-mono font-bold text-slate-800 text-xs">{r.TransactionId || '—'}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">ID: {r.Id}</p>
                                    </div>
                                )}
                                style={{ width: '18%' }}
                            />
                            <Column
                                header="Khách hàng"
                                body={r => (
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{r.tickets?.[0]?.user?.name || 'Khách lẻ'}</p>
                                        <p className="text-xs text-slate-400">{r.tickets?.[0]?.user?.phone || '—'}</p>
                                    </div>
                                )}
                                style={{ width: '25%' }}
                            />
                            <Column
                                header="Phương thức"
                                body={r => (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-slate-500">{METHOD_ICONS[r.PaymentMethod] || <ReceiptText size={13} />}</span>
                                        <span className="text-xs font-semibold text-slate-700">{r.PaymentMethod}</span>
                                    </div>
                                )}
                                style={{ width: '18%' }}
                            />
                            <Column
                                header="Số tiền"
                                body={r => (
                                    <span className="font-bold text-slate-900 text-sm">{fmt(r.Amount)}</span>
                                )}
                                style={{ width: '15%' }}
                            />
                            <Column
                                field="created_at"
                                header="Thời gian"
                                sortable
                                body={r => (
                                    <span className="text-xs text-slate-500">{fmtDate(r.created_at)}</span>
                                )}
                                style={{ width: '24%' }}
                            />
                        </DataTable>
                    </div>
                )}

                {/* ── Tab: Cổng thanh toán ──────────────────────────── */}
                {activeTab === 'methods' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {methods.length === 0 && (
                                <div className="col-span-3 text-center py-12 text-slate-400 text-sm">
                                    Chưa có cổng thanh toán nào. Nhấn "Thêm cổng" để bắt đầu.
                                </div>
                            )}
                            {methods.map(m => (
                                <div key={m.Id} className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col gap-4 hover:border-slate-300 transition-colors">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${m.IsActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                {METHOD_ICONS[m.Name] || <Settings size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{m.Name}</p>
                                                <p className="text-xs font-mono text-slate-400">{m.Code}</p>
                                            </div>
                                        </div>
                                        <Tag
                                            value={m.IsActive ? 'Hoạt động' : 'Tắt'}
                                            severity={m.IsActive ? 'success' : 'secondary'}
                                            className="text-[10px]"
                                        />
                                    </div>

                                    {/* Description */}
                                    {m.Description && (
                                        <p className="text-xs text-slate-500 line-clamp-2">{m.Description}</p>
                                    )}

                                    {/* Toggle + Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <InputSwitch
                                                checked={m.IsActive}
                                                onChange={e => paymentMethodService.update(m.Id, { IsActive: e.value }).then(() => fetchData())}
                                            />
                                            <span className="text-xs text-slate-500">{m.IsActive ? 'Đang bật' : 'Đã tắt'}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => { setIsEdit(true); setCurrentMethod(m); setMethodDialog(true); }}
                                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => confirmDeleteMethod(m.Id)}
                                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Dialog: Cấu hình cổng ────────────────────────────── */}
            <Dialog
                header={<span className="text-base font-bold text-slate-900">{isEdit ? 'Chỉnh sửa cổng thanh toán' : 'Thêm cổng thanh toán'}</span>}
                visible={methodDialog}
                onHide={() => setMethodDialog(false)}
                modal
                style={{ width: 420 }}
                className="font-sans"
                pt={{ content: { className: 'p-6' } }}
            >
                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Tên hiển thị <span className="text-red-400">*</span></label>
                        <InputText
                            value={currentMethod.Name}
                            onChange={e => setCurrentMethod({ ...currentMethod, Name: e.target.value })}
                            placeholder="VD: Tiền mặt, ZaloPay..."
                            className="text-sm border-slate-300"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Mã (Code) <span className="text-red-400">*</span></label>
                        <InputText
                            value={currentMethod.Code}
                            onChange={e => setCurrentMethod({ ...currentMethod, Code: e.target.value.toUpperCase() })}
                            placeholder="VD: CASH, ZALOPAY..."
                            className="text-sm border-slate-300 font-mono"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Ghi chú</label>
                        <InputTextarea
                            value={currentMethod.Description}
                            onChange={e => setCurrentMethod({ ...currentMethod, Description: e.target.value })}
                            rows={3}
                            placeholder="Mô tả ngắn về phương thức này..."
                            className="text-sm border-slate-300"
                        />
                    </div>
                    <div className="flex items-center gap-3 py-1">
                        <InputSwitch
                            checked={currentMethod.IsActive}
                            onChange={e => setCurrentMethod({ ...currentMethod, IsActive: e.value })}
                        />
                        <span className="text-sm text-slate-600">Kích hoạt ngay</span>
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <Button label="Hủy" text className="text-sm text-slate-600 font-semibold" onClick={() => setMethodDialog(false)} />
                        <Button
                            label={isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
                            loading={saving}
                            onClick={handleSaveMethod}
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
                    letter-spacing: 0.05em !important;
                    color: #64748b !important;
                    padding: 0.9rem 1rem !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                }
                .p-datatable-tbody > tr > td {
                    padding: 0.85rem 1rem !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    font-size: 13px !important;
                }
                .p-datatable-tbody > tr:hover > td {
                    background: #f8fafc !important;
                }
                .p-paginator { border-top: 1px solid #f1f5f9 !important; background: #fff !important; padding: 0.75rem !important; }
                .p-paginator .p-paginator-pages .p-paginator-page.p-highlight { background: #0f172a !important; color: #fff !important; border-radius: 8px; }
                .p-calendar .p-inputtext { font-size: 13px !important; }
                .p-dropdown .p-dropdown-label { font-size: 13px !important; }
            `}</style>
        </div>
    );
}
