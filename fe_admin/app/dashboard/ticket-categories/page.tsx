"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { Tag } from 'primereact/tag';
import { Layers, MapPin, Timer, Gift, Plus, ShieldCheck, Route, Eye, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { ticketCategoryService } from '../../../services/managementService';

const CODE_META: Record<string, { Icon: any; desc: string }> = {
    TRIP:  { Icon: MapPin,  desc: 'Khách chọn điểm đi/đến. Thường dùng cho vé chặng ngắn.' },
    TIME:  { Icon: Timer,   desc: 'Đi toàn tuyến theo hạn định. Thường cần KYC.' },
    PROMO: { Icon: Gift,    desc: 'Vé ưu đãi đặc biệt. Yêu cầu hồ sơ xác thực.' },
};
const getMeta = (code: string) => CODE_META[code?.toUpperCase()] ?? { Icon: Layers, desc: 'Nhóm nghiệp vụ tùy chỉnh.' };

const EMPTY_FORM = { code: '', name: '', description: '', sort_order: 0, requires_route: false, requires_kyc_default: false, is_active: true };

export default function TicketCategoriesPage() {
    const toast = useRef<any>(null);
    const [cats, setCats] = useState<any[]>([]);
    const [statsMap, setStatsMap] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });

    const showToast = (s: string, sum: string, d: string) =>
        toast.current?.show({ severity: s, summary: sum, detail: d, life: 3500 });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [catsRes, statsRes]: any[] = await Promise.all([
                ticketCategoryService.getAll({ search }),
                ticketCategoryService.getStats(),
            ]);
            const rawCats = catsRes?.data ?? catsRes;
            const rawStats: any[] = statsRes?.data ?? [];
            setCats(Array.isArray(rawCats) ? rawCats : []);
            const map: Record<number, number> = {};
            rawStats.forEach((s: any) => { map[s.Id] = s.typeCount ?? 0; });
            setStatsMap(map);
        } catch { showToast('error', 'Lỗi', 'Không thể tải dữ liệu'); }
        finally { setLoading(false); }
    }, [search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openCreate = () => { setForm({ ...EMPTY_FORM, sort_order: cats.length }); setIsEdit(false); setShowForm(true); };
    const openEdit = (row: any) => {
        setSelected(row);
        setForm({ code: row.code, name: row.name, description: row.description ?? '', sort_order: row.sort_order, requires_route: !!row.requires_route, requires_kyc_default: !!row.requires_kyc_default, is_active: row.is_active !== false });
        setIsEdit(true); setShowForm(true);
    };
    const openDetail = (row: any) => { setSelected(row); setShowDetail(true); };

    const handleSave = async () => {
        if (!form.code.trim()) { showToast('warn', 'Thiếu thông tin', 'Mã kiểu vé là bắt buộc'); return; }
        if (!form.name.trim()) { showToast('warn', 'Thiếu thông tin', 'Tên kiểu vé là bắt buộc'); return; }
        setSaving(true);
        try {
            if (isEdit && selected) {
                await ticketCategoryService.update(selected.Id, { name: form.name, description: form.description, sort_order: form.sort_order, requires_route: form.requires_route, requires_kyc_default: form.requires_kyc_default, is_active: form.is_active });
                showToast('success', 'Đã cập nhật', 'Thông tin danh mục đã được lưu');
            } else {
                await ticketCategoryService.create({ ...form, code: form.code.toUpperCase().trim() });
                showToast('success', 'Thành công', 'Đã tạo danh mục mới');
            }
            setShowForm(false); fetchData();
        } catch (e: any) { showToast('error', 'Lỗi', e?.response?.data?.message || e?.message || 'Không thể lưu'); }
        finally { setSaving(false); }
    };

    const toggleStatus = async (row: any) => {
        try { await ticketCategoryService.update(row.Id, { is_active: !row.is_active }); fetchData(); }
        catch { showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái'); }
    };

    const handleDelete = (row: any) => {
        const count = statsMap[row.Id] ?? 0;
        confirmDialog({
            header: count > 0 ? 'Không thể xóa' : 'Xác nhận xóa',
            message: count > 0 ? `Danh mục "${row.name}" đang có ${count} loại vé. Hãy chuyển hoặc xóa loại vé trước.` : `Xóa danh mục "${row.name}"? Hành động này không thể hoàn tác.`,
            icon: count > 0 ? 'pi pi-ban' : 'pi pi-exclamation-triangle',
            acceptClassName: count > 0 ? 'p-button-secondary' : 'p-button-danger',
            acceptLabel: count > 0 ? 'Đã hiểu' : 'Xóa',
            rejectLabel: count > 0 ? undefined : 'Hủy',
            accept: async () => {
                if (count > 0) return;
                try { await ticketCategoryService.delete(row.Id); showToast('success', 'Đã xóa', `"${row.name}" đã được xóa`); if (showDetail) setShowDetail(false); fetchData(); }
                catch (e: any) { showToast('error', 'Lỗi', e?.response?.data?.message || 'Không thể xóa'); }
            }
        });
    };

    // ── Column Templates ─────────────────────────────────────────────────────
    const nameTemplate = (row: any) => {
        const { Icon } = getMeta(row.code);
        return (
            <div className="flex items-center gap-3 py-0.5 cursor-pointer" onClick={() => openDetail(row)}>
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-slate-600" />
                </div>
                <div>
                    <p className="font-semibold text-slate-800 text-sm">{row.name}</p>
                    <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">{row.code}</p>
                </div>
            </div>
        );
    };

    const settingsTemplate = (row: any) => (
        <div className="flex gap-1.5">
            {row.requires_route && <Tag severity="info" value="Chặng" className="text-[10px]" />}
            {row.requires_kyc_default && <Tag severity="warning" value="KYC" className="text-[10px]" />}
            {!row.requires_route && !row.requires_kyc_default && <span className="text-xs text-slate-300">—</span>}
        </div>
    );

    const statusTemplate = (row: any) => (
        <div className="flex items-center gap-2">
            <Tag severity={row.is_active ? 'success' : 'secondary'} value={row.is_active ? 'Hoạt động' : 'Tạm dừng'} className="text-[10px]" />
            <InputSwitch checked={row.is_active} onChange={() => toggleStatus(row)} />
        </div>
    );

    const actionTemplate = (row: any) => (
        <div className="flex items-center gap-1 justify-end">
            <Button icon={<Eye size={13} />} text rounded severity="secondary" onClick={() => openDetail(row)} tooltip="Chi tiết" tooltipOptions={{ position: 'top' }} />
            <Button icon={<Pencil size={13} />} text rounded severity="secondary" onClick={() => openEdit(row)} tooltip="Chỉnh sửa" tooltipOptions={{ position: 'top' }} />
            <Button icon={<Trash2 size={13} />} text rounded severity="danger" onClick={() => handleDelete(row)} tooltip="Xóa" tooltipOptions={{ position: 'top' }} />
        </div>
    );

    const totalActive = cats.filter(c => c.is_active).length;
    const totalKyc    = cats.filter(c => c.requires_kyc_default).length;
    const totalRoute  = cats.filter(c => c.requires_route).length;

    // ── Toggle field helper ───────────────────────────────────────────────────
    const ToggleRow = ({ label, sub, field }: { label: string; sub: string; field: keyof typeof form }) => (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <div>
                <p className="text-sm font-semibold text-slate-700">{label}</p>
                <p className="text-xs text-slate-400">{sub}</p>
            </div>
            <InputSwitch checked={!!form[field]} onChange={e => setForm({ ...form, [field]: e.value })} />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <Toast ref={toast} position="top-right" />
            <ConfirmDialog />

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Danh mục Vé</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Cấu hình nhóm nghiệp vụ, yêu cầu hành trình và xác thực</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button icon={<RefreshCw size={15} className={loading ? 'animate-spin' : ''} />} onClick={fetchData} severity="secondary" outlined tooltip="Tải lại" />
                    <Button label="Thêm danh mục" icon={<Plus size={15} />} onClick={openCreate} className="bg-slate-900 border-none text-sm font-semibold" />
                </div>
            </div>

            {/* ── Summary ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Tổng danh mục', value: cats.length,   icon: <Layers size={16} className="text-slate-600" />,    bg: 'bg-slate-100' },
                    { label: 'Đang hoạt động', value: totalActive,   icon: <Layers size={16} className="text-emerald-600" />,  bg: 'bg-emerald-50' },
                    { label: 'Yêu cầu KYC',    value: totalKyc,     icon: <ShieldCheck size={16} className="text-slate-600" />, bg: 'bg-slate-100' },
                    { label: 'Cần hành trình', value: totalRoute,    icon: <Route size={16} className="text-slate-600" />,     bg: 'bg-slate-100' },
                ].map((c, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                        <div>
                            <p className="text-xs text-slate-400 font-semibold mb-1">{c.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
                        </div>
                        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>{c.icon}</div>
                    </div>
                ))}
            </div>

            {/* ── Table ──────────────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <div className="relative max-w-sm w-full">
                        <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <InputText value={search} onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') fetchData(); }}
                            placeholder="Tìm theo tên hoặc mã..."
                            className="w-full pl-8 py-2 text-sm border-slate-200 bg-white rounded-lg" />
                    </div>
                </div>

                <DataTable value={cats} loading={loading} rowHover emptyMessage="Chưa có danh mục nào." className="text-sm">
                    <Column field="sort_order" header="#" style={{ width: '6%' }} body={r => <span className="text-xs font-mono text-slate-400">{r.sort_order}</span>} />
                    <Column header="Danh mục" body={nameTemplate} style={{ width: '28%' }} />
                    <Column field="description" header="Mô tả" style={{ width: '28%' }} body={r => <span className="text-xs text-slate-500">{r.description || getMeta(r.code).desc}</span>} />
                    <Column header="Cấu hình" body={settingsTemplate} style={{ width: '16%' }} />
                    <Column header="Trạng thái" body={statusTemplate} style={{ width: '14%' }} />
                    <Column header="" body={actionTemplate} style={{ width: '8%' }} />
                </DataTable>
            </div>

            {/* ── Form Dialog ────────────────────────────────────── */}
            <Dialog
                header={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            {isEdit ? <Pencil size={15} className="text-slate-600" /> : <Plus size={15} className="text-slate-600" />}
                        </div>
                        <span className="font-bold text-slate-900 text-base">{isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</span>
                    </div>
                }
                visible={showForm}
                onHide={() => { if (!saving) setShowForm(false); }}
                style={{ width: 500 }}
                modal
                className="font-sans"
                pt={{ content: { className: 'p-6' } }}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {!isEdit && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Mã Code <span className="text-red-400">*</span></label>
                                <InputText value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    placeholder="VD: TRIP, TIME..." className="text-sm border-slate-300 font-mono" autoFocus />
                            </div>
                        )}
                        <div className={`flex flex-col gap-1.5 ${!isEdit ? '' : 'col-span-2'}`}>
                            <label className="text-xs font-semibold text-slate-600">Thứ tự hiển thị</label>
                            <InputNumber value={form.sort_order} onValueChange={e => setForm({ ...form, sort_order: e.value ?? 0 })}
                                showButtons min={0} max={99} className="w-full"
                                inputClassName="text-sm border-slate-300 py-2" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Tên danh mục <span className="text-red-400">*</span></label>
                        <InputText value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="VD: Vé chặng, Vé tháng..." className="text-sm border-slate-300" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Mô tả (tùy chọn)</label>
                        <InputText value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Mô tả ngắn về đặc điểm danh mục..." className="text-sm border-slate-300" />
                    </div>

                    <div className="border border-slate-200 rounded-lg px-4 pt-2 pb-1">
                        <ToggleRow label="Yêu cầu hành trình" sub="Khách phải chọn ga đi/đến" field="requires_route" />
                        <ToggleRow label="Yêu cầu xác thực (KYC)" sub="Bắt buộc hồ sơ giấy tờ" field="requires_kyc_default" />
                        <ToggleRow label="Đang hoạt động" sub="Hiển thị trên App và POS" field="is_active" />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <Button label="Hủy" text className="text-sm text-slate-600 font-semibold" onClick={() => setShowForm(false)} disabled={saving} />
                        <Button label={isEdit ? 'Lưu thay đổi' : 'Thêm mới'} loading={saving} onClick={handleSave} className="bg-slate-900 border-none text-sm font-semibold px-6" />
                    </div>
                </div>
            </Dialog>

            {/* ── Detail Dialog ──────────────────────────────────── */}
            <Dialog
                header={<span className="font-bold text-slate-900 text-base">Chi tiết danh mục</span>}
                visible={showDetail}
                onHide={() => setShowDetail(false)}
                style={{ width: 440 }}
                modal
                className="font-sans"
                pt={{ content: { className: 'p-6' } }}
            >
                {selected && (() => {
                    const { Icon, desc } = getMeta(selected.code);
                    const count = statsMap[selected.Id] ?? 0;
                    return (
                        <div className="space-y-5">
                            {/* Header */}
                            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <Icon size={22} className="text-slate-700" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 text-base">{selected.name}</p>
                                    <p className="text-xs font-mono font-bold text-slate-400 mt-0.5">{selected.code}</p>
                                </div>
                                <Tag severity={selected.is_active ? 'success' : 'secondary'} value={selected.is_active ? 'Hoạt động' : 'Tạm dừng'} className="text-[10px]" />
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Loại vé', value: count },
                                    { label: 'Thứ tự', value: `#${selected.sort_order}` },
                                ].map((s, i) => (
                                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                                        <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Flags */}
                            <div className="space-y-2">
                                {[
                                    { label: 'Yêu cầu hành trình', active: selected.requires_route, icon: <Route size={14} /> },
                                    { label: 'Yêu cầu xác thực (KYC)', active: selected.requires_kyc_default, icon: <ShieldCheck size={14} /> },
                                ].map((f, i) => (
                                    <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-semibold ${f.active ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white border-slate-100 text-slate-300'}`}>
                                        <span>{f.icon}</span>
                                        <span>{f.label}</span>
                                        <span className="ml-auto text-xs font-bold">{f.active ? 'Có' : 'Không'}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <p className="text-xs font-semibold text-slate-400 mb-1">Mô tả</p>
                                <p className="text-sm text-slate-600">{selected.description || desc}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t border-slate-100">
                                <Button label="Xóa" severity="danger" outlined className="flex-1 text-sm font-semibold" onClick={() => handleDelete(selected)} />
                                <Button label="Chỉnh sửa" icon={<Pencil size={14} />} className="flex-[2] bg-slate-900 border-none text-sm font-semibold" onClick={() => { setShowDetail(false); openEdit(selected); }} />
                            </div>
                        </div>
                    );
                })()}
            </Dialog>

            <style>{`
                .p-datatable-thead > tr > th { background: #f8fafc !important; font-size: 11px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.06em !important; color: #64748b !important; padding: 0.8rem 1rem !important; border-bottom: 1px solid #e2e8f0 !important; }
                .p-datatable-tbody > tr > td { padding: 0.8rem 1rem !important; border-bottom: 1px solid #f1f5f9 !important; font-size: 13px !important; }
                .p-datatable-tbody > tr:hover > td { background: #f8fafc !important; }
            `}</style>
        </div>
    );
}
