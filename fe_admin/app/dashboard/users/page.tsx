"use client";

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { Image } from 'primereact/image';
import { Phone, IdCard, ScanFace, Lock, Unlock, MapPin, Mail, Calendar, User } from 'lucide-react';
import { userService } from '../../../services/managementService';

export default function UsersPage() {
    const toast = useRef<any>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(1);

    const [showDetail, setShowDetail] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [saving, setSaving] = useState(false);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res: any = await userService.getCustomers({ search, page, limit: 10 });
            setCustomers(res.data || []);
            setTotalRecords(res.total || 0);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách khách hàng' });
        } finally { setLoading(false); }
    };

    const fetchStats = async () => {
        try {
            const res: any = await userService.getStats();
            setStats(res.data);
        } catch {}
    };

    useEffect(() => { fetchCustomers(); }, [search, page]);
    useEffect(() => { fetchStats(); }, []);

    const showToast = (severity: string, summary: string, detail: string) =>
        toast.current?.show({ severity, summary, detail, life: 3000 });

    const openDetail = (user: any) => { setSelected(user); setShowDetail(true); };
    const openEdit = (user: any) => {
        setSelected(user);
        setEditForm({ name: user.name, phone: user.phone, email: user.email || '', address: user.address || '', sex: user.sex });
        setShowEdit(true);
    };

    const handleToggleLock = async (user: any) => {
        try {
            const res: any = await userService.toggleLock(user.id);
            showToast('success', user.is_locked ? 'Đã mở khóa' : 'Đã khóa', 'Cập nhật trạng thái thành công');
            fetchCustomers();
        } catch (e: any) {
            showToast('error', 'Lỗi', e?.message || 'Thao tác thất bại');
        }
    };

    const handleDelete = (user: any) => {
        confirmDialog({
            message: `Bạn có chắc muốn xóa tài khoản "${user.name}"? Thao tác này không thể hoàn tác.`,
            header: 'Xác nhận xóa',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Xóa',
            rejectLabel: 'Hủy',
            accept: async () => {
                try {
                    await userService.delete(user.id);
                    showToast('success', 'Đã xóa', `Tài khoản ${user.name} đã bị xóa`);
                    fetchCustomers();
                    fetchStats();
                } catch (e: any) {
                    showToast('error', 'Lỗi', e?.message || 'Không thể xóa');
                }
            }
        });
    };

    const handleUpdate = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await userService.update(selected.id, editForm);
            showToast('success', 'Thành công', 'Đã cập nhật thông tin khách hàng');
            setShowEdit(false);
            fetchCustomers();
        } catch (e: any) {
            showToast('error', 'Lỗi', e?.message || 'Không thể cập nhật');
        } finally { setSaving(false); }
    };

    // ─── Templates ─────────────────────────────────────────────────
    const imgUrl = (path: string) => {
        if (!path || path === 'none') return null;
        return path.startsWith('http') ? path : `http://localhost:3000${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const nameTemplate = (row: any) => (
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => openDetail(row)}>
            {imgUrl(row.avatar) ? (
                <img src={imgUrl(row.avatar)!} className="w-10 h-10 rounded-full border border-slate-200 object-cover" alt="avatar" />
            ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                    {row.name?.charAt(0)}
                </div>
            )}
            <div>
                <p className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{row.name}</p>
                <p className="text-xs text-slate-400 font-mono">#{row.id?.slice(0, 8)}</p>
            </div>
        </div>
    );

    const cccdTemplate = (row: any) => (
        <span className="text-sm font-mono text-slate-700 flex items-center gap-1.5">
            <IdCard size={13} className="text-slate-400" />
            {row.cccd_number || '—'}
        </span>
    );

    const phoneTemplate = (row: any) => !row.phone
        ? <span className="text-slate-400 text-sm">—</span>
        : <span className="text-sm text-slate-700 flex items-center gap-1.5"><Phone size={13} className="text-slate-400" />{row.phone}</span>;

    const kycTemplate = (row: any) => row.is_face_registered
        ? <Tag value="KYC Verified" severity="success" icon="pi pi-check" />
        : <Tag value="Chưa xác minh" severity="warning" />;

    const statusTemplate = (row: any) => row.is_locked
        ? <Tag value="Đã khóa" severity="danger" icon="pi pi-lock" />
        : <Tag value="Hoạt động" severity="success" icon="pi pi-check-circle" />;

    const dateTemplate = (row: any) => (
        <span className="text-sm text-slate-600">
            {row.created_at ? new Date(row.created_at).toLocaleDateString('vi-VN') : '—'}
        </span>
    );

    const actionTemplate = (row: any) => (
        <div className="flex gap-1.5">
            <Button icon="pi pi-eye" rounded outlined severity="secondary" className="w-8 h-8" tooltip="Xem chi tiết" tooltipOptions={{ position: 'top' }} onClick={() => openDetail(row)} />
            <Button icon="pi pi-pencil" rounded outlined severity="info" className="w-8 h-8" tooltip="Chỉnh sửa" tooltipOptions={{ position: 'top' }} onClick={() => openEdit(row)} />
            <Button
                icon={row.is_locked ? 'pi pi-unlock' : 'pi pi-lock'}
                rounded outlined
                severity={row.is_locked ? 'success' : 'warning'}
                className="w-8 h-8"
                tooltip={row.is_locked ? 'Mở khóa' : 'Khóa tài khoản'}
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleToggleLock(row)}
            />
            <Button icon="pi pi-trash" rounded outlined severity="danger" className="w-8 h-8" tooltip="Xóa" tooltipOptions={{ position: 'top' }} onClick={() => handleDelete(row)} />
        </div>
    );

    const tableHeader = (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-white">
            <div className="flex items-center gap-2 w-full sm:w-96">
                <div className="p-inputgroup flex-1">
                    <InputText
                        placeholder="Tìm tên, CCCD, SĐT..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchCustomers(); } }}
                    />
                    <Button icon="pi pi-search" className="bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200" onClick={() => { setPage(1); fetchCustomers(); }} />
                </div>
                <Button icon="pi pi-refresh" outlined severity="secondary" onClick={() => { fetchCustomers(); fetchStats(); }} disabled={loading} tooltip="Tải lại" tooltipOptions={{ position: 'top' }} />
            </div>
        </div>
    );

    const formField = (label: string, key: string, type = 'text') => (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            <InputText
                type={type}
                value={editForm[key] || ''}
                onChange={(e) => setEditForm((p: any) => ({ ...p, [key]: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder={`Nhập ${label.toLowerCase()}`}
            />
        </div>
    );

    return (
        <div className="p-4 md:p-6 bg-[#F8FAFC] min-h-screen">
            <Toast ref={toast} pt={{
                root: { className: 'font-sans max-w-[340px] w-full' },
                message: { className: 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl border-0 overflow-hidden mb-3' },
                content: { className: 'p-4 flex items-start gap-3' },
                icon: { className: 'text-2xl mt-0.5' },
                summary: { className: 'font-bold text-slate-800 text-[15px] mb-1 block' },
                detail: { className: 'text-slate-500 text-[13px] font-medium' },
                closeButton: { className: 'w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 ml-auto flex items-center justify-center transition-colors focus:outline-none focus:ring-0' }
            }} />
            <ConfirmDialog />

            {/* Page Title + Stats */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý Khách hàng</h1>
                    <p className="text-slate-500 text-sm mt-1">Danh sách tài khoản người dùng đã đăng ký trên ứng dụng BRT.</p>
                </div>
                {/* Stats Cards */}
                <div className="flex gap-3">
                    <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 text-center shadow-sm min-w-[100px]">
                        <p className="text-xs text-slate-500 font-medium">Tổng KH</p>
                        <p className="text-xl font-bold text-slate-800">{stats?.totalCustomers ?? '—'}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 text-center shadow-sm min-w-[100px]">
                        <p className="text-xs text-slate-500 font-medium">KYC Verified</p>
                        <p className="text-xl font-bold text-emerald-600">{stats?.faceRegistered ?? '—'}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 text-center shadow-sm min-w-[100px]">
                        <p className="text-xs text-slate-500 font-medium">Bị khóa</p>
                        <p className="text-xl font-bold text-red-500">{stats?.lockedUsers ?? customers.filter(c => c.is_locked).length}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <DataTable
                    value={customers}
                    loading={loading}
                    paginator
                    rows={10}
                    totalRecords={totalRecords}
                    lazy
                    onPage={(e: any) => setPage((e.page ?? 0) + 1)}
                    className="p-datatable-sm"
                    rowHover
                    header={tableHeader}
                    emptyMessage="Không có dữ liệu khách hàng."
                >
                    <Column header="Khách hàng" body={nameTemplate} style={{ width: '22%' }} />
                    <Column header="CCCD" body={cccdTemplate} style={{ width: '18%' }} />
                    <Column header="Số điện thoại" body={phoneTemplate} style={{ width: '14%' }} />
                    <Column header="Ngày đăng ký" body={dateTemplate} style={{ width: '13%' }} />
                    <Column header="Xác minh KYC" body={kycTemplate} style={{ width: '13%' }} />
                    <Column header="Trạng thái" body={statusTemplate} style={{ width: '12%' }} />
                    <Column header="Thao tác" body={actionTemplate} style={{ width: '8%' }} />
                </DataTable>
            </div>

            {/* DETAIL DIALOG */}
            <Dialog
                header={<div className="font-semibold text-xl">Hồ Sơ Khách Hàng</div>}
                visible={showDetail}
                onHide={() => setShowDetail(false)}
                style={{ width: '560px' }}
            >
                {selected && (
                    <div className="p-2 space-y-5">
                        {/* Header section */}
                        <div className="flex items-center gap-4">
                            {imgUrl(selected.avatar) ? (
                                <Image src={imgUrl(selected.avatar)!} preview alt="avatar" imageClassName="w-16 h-16 rounded-full border border-slate-200 object-cover shadow-sm" className="flex" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 text-xl font-bold">
                                    {selected.name?.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{selected.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    {selected.is_face_registered
                                        ? <Tag value="KYC Verified" severity="success" icon="pi pi-check" />
                                        : <Tag value="Chưa KYC" severity="warning" />
                                    }
                                    {selected.is_locked
                                        ? <Tag value="Bị khóa" severity="danger" icon="pi pi-lock" />
                                        : <Tag value="Hoạt động" severity="success" />
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Info grid */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-500 font-medium flex items-center gap-1 mb-1"><Phone size={12} /> Điện thoại</span>
                                <span className="font-semibold text-slate-800">{selected.phone || '—'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 font-medium flex items-center gap-1 mb-1"><IdCard size={12} /> Số CCCD</span>
                                <span className="font-semibold text-slate-800 font-mono">{selected.cccd_number || '—'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 font-medium flex items-center gap-1 mb-1"><User size={12} /> Giới tính</span>
                                <span className="font-semibold text-slate-800">{selected.sex || '—'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 font-medium flex items-center gap-1 mb-1"><Calendar size={12} /> Ngày sinh</span>
                                <span className="font-semibold text-slate-800">{selected.birthday || '—'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 font-medium flex items-center gap-1 mb-1"><Calendar size={12} /> Ngày cấp CCCD</span>
                                <span className="font-semibold text-slate-800">{selected.issue_date || '—'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 font-medium flex items-center gap-1 mb-1"><Calendar size={12} /> Ngày đăng ký</span>
                                <span className="font-semibold text-slate-800">{selected.created_at ? new Date(selected.created_at).toLocaleDateString('vi-VN') : '—'}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-slate-500 font-medium flex items-center gap-1 mb-1"><Mail size={12} /> Email</span>
                                <span className="font-semibold text-slate-800">{selected.email || '—'}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-slate-500 font-medium flex items-center gap-1 mb-1"><MapPin size={12} /> Địa chỉ</span>
                                <span className="font-semibold text-slate-800">{selected.address || '—'}</span>
                            </div>
                        </div>

                        {/* CCCD images */}
                        {(selected.cccd_front || selected.cccd_back) && (
                            <div>
                                <p className="text-sm font-semibold text-slate-700 mb-2">Hình ảnh định danh CCCD</p>
                                <div className="flex gap-3">
                                    {['cccd_front', 'cccd_back'].map((key) => {
                                        const url = imgUrl(selected[key]);
                                        return (
                                            <div key={key} className="flex-1 border border-slate-200 rounded bg-slate-50 p-1">
                                                {url ? (
                                                    <Image src={url} preview imageClassName="w-full h-32 object-cover rounded-sm" className="w-full flex" alt={key} />
                                                ) : (
                                                    <div className="w-full h-32 flex items-center justify-center text-slate-400 text-xs italic">
                                                        Không có ({key === 'cccd_front' ? 'mặt trước' : 'mặt sau'})
                                                    </div>
                                                )}
                                                <p className="text-center text-xs text-slate-400 mt-1">{key === 'cccd_front' ? 'Mặt trước' : 'Mặt sau'}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                            <Button
                                label={selected.is_locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                                icon={selected.is_locked ? 'pi pi-unlock' : 'pi pi-lock'}
                                severity={selected.is_locked ? 'success' : 'warning'}
                                outlined
                                className="font-medium text-sm"
                                onClick={() => { setShowDetail(false); handleToggleLock(selected); }}
                            />
                            <div className="flex gap-2">
                                <Button label="Đóng" onClick={() => setShowDetail(false)} className="p-button-text text-slate-600" />
                                <Button label="Chỉnh sửa" icon="pi pi-pencil" className="bg-blue-600 border-none font-medium hover:bg-blue-700" onClick={() => { setShowDetail(false); openEdit(selected); }} />
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* EDIT DIALOG */}
            <Dialog
                header={<div className="font-semibold text-xl">Sửa Thông Tin Khách Hàng</div>}
                visible={showEdit}
                onHide={() => setShowEdit(false)}
                style={{ width: '500px' }}
            >
                <div className="p-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {formField('Họ và Tên', 'name')}
                        {formField('Số điện thoại', 'phone', 'tel')}
                        {formField('Email', 'email', 'email')}
                        {formField('Giới tính', 'sex')}
                    </div>
                    {formField('Địa chỉ', 'address')}
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                        <Button label="Hủy" onClick={() => setShowEdit(false)} className="p-button-text text-slate-600" />
                        <Button label="Lưu cập nhật" onClick={handleUpdate} loading={saving} className="bg-blue-600 border-none font-medium px-6 hover:bg-blue-700" />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
