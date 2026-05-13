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
    ShieldCheck, Plus, Pencil, Trash2, Search, 
    RefreshCw, Shield, Users, Lock, KeyRound, Crown,
    LayoutGrid, Info
} from 'lucide-react';
import { roleService } from '../../../services/managementService';

// Metadata cho các vai trò mặc định
const ROLE_THEME: Record<number, { label: string; icon: any }> = {
    1: { label: 'Admin', icon: Crown },
    2: { label: 'Staff', icon: Shield },
    3: { label: 'Customer', icon: Users },
};

const SYSTEM_IDS: number[] = []; // Đã mở khóa tất cả các vai trò

export default function RoleManagementPage() {
    const toast = useRef<any>(null);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ id: null as number | null, Name: '', Description: '' });

    const showToast = (s: 'success' | 'warn' | 'error', sum: string, d: string) =>
        toast.current?.show({ severity: s, summary: sum, detail: d, life: 3000 });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res: any = await roleService.getAll();
            setRoles(res?.data || []);
        } catch {
            showToast('error', 'Lỗi hệ thống', 'Không thể đồng bộ danh sách vai trò');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredRoles = roles.filter(r =>
        r.Name?.toLowerCase().includes(search.toLowerCase()) ||
        r.Description?.toLowerCase().includes(search.toLowerCase())
    );

    const openNew = () => {
        setForm({ id: null, Name: '', Description: '' });
        setIsEdit(false);
        setDialogVisible(true);
    };

    const openEdit = (role: any) => {
        setForm({ id: role.Id, Name: role.Name, Description: role.Description || '' });
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleSave = async () => {
        if (!form.Name.trim()) return showToast('warn', 'Thiếu dữ liệu', 'Tên vai trò không được để trống');
        
        setSaving(true);
        try {
            if (isEdit && form.id) {
                await roleService.update(form.id, { Name: form.Name, Description: form.Description });
                showToast('success', 'Thành công', 'Đã cập nhật thông tin vai trò');
            } else {
                await roleService.create({ Name: form.Name, Description: form.Description });
                showToast('success', 'Thành công', 'Đã khởi tạo vai trò mới');
            }
            setDialogVisible(false);
            fetchData();
        } catch (e: any) {
            showToast('error', 'Lỗi', e?.response?.data?.message || 'Thao tác thất bại');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (role: any) => {
        confirmDialog({
            header: 'Xác nhận xóa',
            message: `Xóa vai trò "${role.Name}"? Hành động này không thể hoàn tác.`,
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Xóa',
            rejectLabel: 'Hủy',
            accept: async () => {
                try {
                    await roleService.delete(role.Id);
                    showToast('success', 'Đã xóa', 'Xóa vai trò thành công');
                    fetchData();
                } catch (e: any) {
                    showToast('error', 'Lỗi', 'Không thể xóa vai trò này do có dữ liệu liên kết');
                }
            },
        });
    };

    /* ── Render Templates ───────────────────────────── */
    const roleNameTemplate = (row: any) => {
        const theme = ROLE_THEME[row.Id] || { icon: Shield };
        const Icon = theme.icon;
        const isSystem = SYSTEM_IDS.includes(row.Id);

        return (
            <div className="flex items-center gap-3 py-0.5">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600">
                    <Icon size={16} />
                </div>
                <div>
                    <span className="font-semibold text-slate-800 text-sm block leading-tight">{row.Name}</span>
                    {isSystem && (
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                            <Lock size={10} /> Hệ thống
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const actionTemplate = (row: any) => {
        return (
            <div className="flex items-center gap-1 justify-end">
                <Button 
                    icon={<Pencil size={13} />} 
                    text rounded severity="secondary"
                    onClick={() => openEdit(row)}
                    tooltip="Chỉnh sửa" tooltipOptions={{ position: 'top' }}
                />
                <Button 
                    icon={<Trash2 size={13} />} 
                    text rounded severity="danger"
                    onClick={() => confirmDelete(row)}
                    tooltip="Xóa" tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <Toast ref={toast} position="top-right" />
            <ConfirmDialog />

            {/* ── Page Header ─────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Vai trò & Quyền</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Thiết lập nhóm vai trò và phân quyền hệ thống</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        icon={<RefreshCw size={15} className={loading ? 'animate-spin' : ''} />} 
                        onClick={fetchData} 
                        severity="secondary" outlined 
                        tooltip="Tải lại" 
                    />
                    <Button 
                        label="Thêm vai trò" 
                        icon={<Plus size={15} />} 
                        onClick={openNew}
                        className="bg-slate-900 border-none text-sm font-semibold" 
                    />
                </div>
            </div>

            {/* ── Summary Stats ──────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Tổng số vai trò', value: roles.length, icon: ShieldCheck, color: 'text-slate-600', bg: 'bg-slate-100' },
                    { label: 'Vai trò Hệ thống', value: SYSTEM_IDS.length, icon: Lock, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Vai trò tùy chỉnh', value: roles.length - SYSTEM_IDS.length, icon: LayoutGrid, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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

            {/* ── Table Card ─────────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <div className="relative max-w-sm w-full">
                        <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <InputText 
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm kiếm vai trò..."
                            className="w-full pl-8 py-2 text-sm border-slate-200 bg-white rounded-lg" 
                        />
                    </div>
                </div>

                <DataTable 
                    value={filteredRoles} 
                    loading={loading} 
                    rowHover 
                    emptyMessage="Chưa có dữ liệu. Nhấn 'Thêm vai trò' để tạo mới."
                    className="text-sm"
                >
                    <Column field="Id" header="#" body={(r) => <span className="text-xs font-mono text-slate-400">#{r.Id}</span>} style={{ width: '8%' }} />
                    <Column header="Vai trò" body={roleNameTemplate} style={{ width: '30%' }} />
                    <Column field="Description" header="Mô tả" 
                            body={(r) => <span className="text-xs text-slate-500">{r.Description || '—'}</span>} 
                            style={{ width: '47%' }} />
                    <Column header="" body={actionTemplate} style={{ width: '15%' }} align="right" />
                </DataTable>
            </div>

            {/* ── Form Dialog ────────────────────────────────────── */}
            <Dialog 
                header={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                            {isEdit ? <Pencil size={15} /> : <Plus size={15} />}
                        </div>
                        <span className="font-bold text-slate-900 text-base">
                            {isEdit ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
                        </span>
                    </div>
                }
                visible={dialogVisible} 
                onHide={() => setDialogVisible(false)} 
                modal
                style={{ width: 440 }} 
                className="font-sans"
                pt={{ content: { className: 'p-6' } }}
            >
                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Tên vai trò <span className="text-red-400">*</span></label>
                        <InputText 
                            value={form.Name} 
                            onChange={e => setForm({...form, Name: e.target.value})}
                            placeholder="VD: Kiểm soát viên..."
                            className="text-sm border-slate-300" 
                            autoFocus
                        />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Mô tả chức năng</label>
                        <InputTextarea 
                            value={form.Description} 
                            onChange={e => setForm({...form, Description: e.target.value})}
                            rows={3} 
                            className="text-sm border-slate-300 resize-none"
                            placeholder="Ghi chú về phạm vi quyền hạn..." 
                        />
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                        <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Lưu ý: Sau khi tạo, bạn có thể gán vai trò này cho nhân viên tại mục "Quản lý nhân viên".
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <Button 
                            label="Hủy" text 
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
                .p-datatable-tbody > tr:hover > td { 
                    background: #f8fafc !important; 
                }
            `}</style>
        </div>
    );
}
