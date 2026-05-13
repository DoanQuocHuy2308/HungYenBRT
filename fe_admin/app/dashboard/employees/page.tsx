"use client";

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { UserCircle, Phone, Shield, Lock, Unlock, Key, Plus, RefreshCw, IdCard, Clock, MapPin, Upload, Eye, EyeOff, User, Mail, Calendar, CreditCard, BadgeCheck, ShieldAlert } from 'lucide-react';
import { employeeService, roleService } from '../../../services/managementService';
import { Image } from 'primereact/image';
import { Tag } from 'primereact/tag';


const EMPTY_FORM: any = {
    name: '', phone: '', email: '', birthday: '', sex: 'Nam', cccd_number: '',
    address: '', issue_date: '', id_Role: 2,
    username: '', password: '', shiftStart: '', shiftEnd: '',
    avatar: null, cccd_front: null, cccd_back: null
};

export default function EmployeesPage() {
    const toast = useRef<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(1);

    // Dialog states
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showResetPwd, setShowResetPwd] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [newPassword, setNewPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [showDetailPwd, setShowDetailPwd] = useState(false);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res: any = await employeeService.getAll({ search, page, limit: 10 });
            setEmployees(res.data || []);
            setTotalRecords(res.total || 0);
        } catch (e) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách nhân viên' });
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchEmployees(); }, [search, page]);

    useEffect(() => {
        roleService.getAll().then((res: any) => {
            setRoles((res.data || []).map((r: any) => ({ label: r.Name, value: r.Id })));
        }).catch(() => { });
    }, []);

    const showToast = (severity: string, summary: string, detail: string) =>
        toast.current?.show({ severity, summary, detail, life: 3000 });

    const openCreate = () => { setForm(EMPTY_FORM); setShowCreate(true); };
    const openEdit = (emp: any) => {
        setSelectedEmployee(emp);
        setForm({
            name: emp.user?.name || '', phone: emp.user?.phone || '', email: emp.user?.email || '',
            birthday: emp.user?.birthday || '', sex: emp.user?.sex || 'Nam',
            cccd_number: emp.user?.cccd_number || '', address: emp.user?.address || '',
            issue_date: emp.user?.issue_date || '', id_Role: emp.user?.id_Role || 2,
            username: emp.username || '', password: '', shiftStart: emp.shiftStart || '', shiftEnd: emp.shiftEnd || '',
            avatar: null, cccd_front: null, cccd_back: null
        });
        setShowEdit(true);
    };
    const openDetail = (emp: any) => { setSelectedEmployee(emp); setShowDetail(true); setShowDetailPwd(false); };
    const openResetPwd = (emp: any) => { setSelectedEmployee(emp); setNewPassword(''); setShowResetPwd(true); };

    const handleCreate = async () => {
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (v !== null && v !== undefined && v !== '') {
                    fd.append(k, v as string | Blob);
                }
            });
            await employeeService.create(fd);
            showToast('success', 'Thành công', 'Đã thêm nhân viên mới');
            setShowCreate(false);
            fetchEmployees();
        } catch (e: any) {
            showToast('error', 'Lỗi', e?.message || 'Không thể thêm nhân viên');
        } finally { setSaving(false); }
    };

    const handleUpdate = async () => {
        if (!selectedEmployee) return;
        setSaving(true);
        try {
            await employeeService.update(selectedEmployee.Id, {
                userFields: { name: form.name, phone: form.phone, email: form.email, address: form.address },
                employeeFields: { shiftStart: form.shiftStart, shiftEnd: form.shiftEnd }
            });
            showToast('success', 'Thành công', 'Đã cập nhật thông tin nhân viên');
            setShowEdit(false);
            fetchEmployees();
        } catch (e: any) {
            showToast('error', 'Lỗi', e?.message || 'Không thể cập nhật');
        } finally { setSaving(false); }
    };

    const handleDelete = (emp: any) => {
        confirmDialog({
            message: `Bạn có chắc chắn muốn xóa nhân viên "${emp.user?.name}"?`,
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await employeeService.delete(emp.Id);
                    showToast('success', 'Thành công', 'Đã xóa nhân viên');
                    fetchEmployees();
                } catch (e: any) {
                    showToast('error', 'Lỗi', e?.message || 'Lỗi khi xóa nhân viên');
                }
            }
        });
    };

    const handleToggleLock = async (emp: any) => {
        try {
            await employeeService.toggleLock(emp.Id);
            const action = emp.user?.is_locked ? 'Mở khóa' : 'Khóa';
            showToast('success', 'Thành công', `Đã ${action.toLowerCase()} tài khoản`);
            fetchEmployees();
        } catch (e: any) {
            showToast('error', 'Lỗi', e?.message || 'Thao tác thất bại');
        }
    };

    const handleChangeRole = async (emp: any, roleId: number) => {
        try {
            await employeeService.changeRole(emp.Id, roleId);
            showToast('success', 'Thành công', 'Đã thay đổi quyền hạn');
            fetchEmployees();
        } catch (e: any) {
            showToast('error', 'Lỗi', e?.message || 'Thay đổi quyền thất bại');
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            showToast('warn', 'Cảnh báo', 'Mật khẩu phải ít nhất 6 ký tự');
            return;
        }
        setSaving(true);
        try {
            await employeeService.resetPassword(selectedEmployee.Id, newPassword);
            showToast('success', 'Thành công', 'Đã đặt lại mật khẩu');
            setShowResetPwd(false);
        } catch (e: any) {
            showToast('error', 'Lỗi', e?.message || 'Không thể đặt lại mật khẩu');
        } finally { setSaving(false); }
    };

    // --- Templates Component ---
    const nameTemplate = (row: any) => (
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => openDetail(row)}>
            {row.user?.avatar ? (
                <img src={row.user.avatar.startsWith('http') ? row.user.avatar : `http://localhost:3000${row.user.avatar.startsWith('/') ? '' : '/'}${row.user.avatar}`} className="w-10 h-10 rounded-full border border-slate-200 object-cover" alt="avatar" />
            ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                    {row.user?.name?.charAt(0)}
                </div>
            )}
            <div>
                <p className="font-semibold text-slate-800 text-sm">{row.user?.name || '—'}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">@{row.username || 'chuathietlap'}</p>
            </div>
        </div>
    );

    const roleTemplate = (row: any) => {
        const rName = row.user?.role?.Name || '—';
        const sev = row.user?.id_Role === 1 ? 'info' : row.user?.id_Role === 2 ? 'success' : 'warning';
        return <Tag value={rName} severity={sev} />;
    };

    const statusTemplate = (row: any) => {
        const locked = row.user?.is_locked;
        return <Tag value={locked ? 'ĐÃ KHÓA' : 'HOẠT ĐỘNG'} severity={locked ? 'danger' : 'success'} />;
    };

    const shiftTemplate = (row: any) => {
        if (!row.shiftStart) return <span className="text-sm text-slate-400 font-italic">Chưa xếp ca</span>;
        return <span className="text-sm text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">{row.shiftStart} - {row.shiftEnd}</span>;
    };

    const actionTemplate = (row: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded outlined severity="secondary" aria-label="Detail" className="w-8 h-8" onClick={() => openDetail(row)} />
            <Button icon="pi pi-pencil" rounded outlined severity="info" aria-label="Edit" className="w-8 h-8" onClick={() => openEdit(row)} />
            <Button icon={row.user?.is_locked ? "pi pi-unlock" : "pi pi-lock"} rounded outlined severity={row.user?.is_locked ? "success" : "warning"} aria-label="Lock" className="w-8 h-8" onClick={() => handleToggleLock(row)} />
            <Button icon="pi pi-key" rounded outlined severity="help" aria-label="Reset Password" className="w-8 h-8" onClick={() => openResetPwd(row)} />
            <Button icon="pi pi-trash" rounded outlined severity="danger" aria-label="Delete" className="w-8 h-8" onClick={() => handleDelete(row)} />
        </div>
    );

    const header = (
        <div className="flex flex-col gap-3 p-2 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-xl">
                    <div className="p-inputgroup flex-1">
                        <span className="p-inputgroup-addon bg-slate-50 border-slate-300 px-3">
                            <i className="pi pi-search text-slate-400 text-sm" />
                        </span>
                        <InputText
                            placeholder="Nhập tên, số điện thoại hoặc số CCCD..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchEmployees(); } }}
                            className="text-sm"
                        />
                        {search && (
                            <Button
                                icon="pi pi-times"
                                className="bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200"
                                onClick={() => { setSearch(''); setPage(1); }}
                                tooltip="Xóa tìm kiếm"
                            />
                        )}
                    </div>
                    <Button icon="pi pi-refresh" outlined severity="secondary" onClick={fetchEmployees} disabled={loading} tooltip="Tải lại" tooltipOptions={{ position: 'top' }} />
                </div>
                <Button label="Thêm Mới" icon="pi pi-plus" className="bg-blue-600 hover:bg-blue-700 font-medium border-0" onClick={openCreate} />
            </div>
            <div className="flex items-center gap-2 px-1">
                <span className="text-xs text-slate-400">Tìm theo:</span>
                {['Tên nhân viên', 'Số điện thoại', 'Số CCCD'].map(tag => (
                    <span key={tag} className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
                {search && (
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full ml-auto">
                        Kết quả cho: "{search}" — {totalRecords} nhân viên
                    </span>
                )}
            </div>
        </div>
    );

    const formField = (label: string, key: string, type = 'text', disabled = false) => (
        <div className="flex flex-col gap-1.5 flex-1 w-full">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            <InputText
                type={type}
                value={(form as any)[key]}
                disabled={disabled}
                onChange={(e) => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
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

            {/* Page Title */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý Nhân viên</h1>
                    <p className="text-slate-500 text-sm mt-1">Hệ thống quản lý dữ liệu nhân sự, ca làm việc và phân quyền hệ thống.</p>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <DataTable
                    value={employees}
                    paginator
                    rows={10}
                    lazy
                    totalRecords={totalRecords}
                    onPage={(e: any) => setPage(e.page + 1)}
                    loading={loading}
                    className="p-datatable-sm"
                    rowHover
                    header={header}
                    emptyMessage="Không có dữ liệu nhân sự."
                >
                    <Column field="user.name" header="Nhân Sự" body={nameTemplate} style={{ width: '25%' }}></Column>
                    <Column field="user.phone" header="SĐT / Email" body={(r) => (
                        <div className="text-sm">
                            <p className="font-semibold text-slate-700">{r.user?.phone || '—'}</p>
                            <p className="text-slate-500 text-xs">{r.user?.email || '—'}</p>
                        </div>
                    )} style={{ width: '20%' }}></Column>
                    <Column field="user.id_Role" header="Vai Trò" body={roleTemplate} style={{ width: '12%' }}></Column>
                    <Column field="shift" header="Ca Trực" body={shiftTemplate} style={{ width: '15%' }}></Column>
                    <Column field="status" header="Trạng Thái" body={statusTemplate} style={{ width: '13%' }}></Column>
                    <Column header="Thao Tác" body={actionTemplate} style={{ width: '15%' }}></Column>
                </DataTable>
            </div>

            {/* CREATE DIALOG */}
            <Dialog
                header={<div className="font-semibold text-xl">Thêm Nhan Viên Mới</div>}
                visible={showCreate}
                onHide={() => { if (!saving) setShowCreate(false); }}
                style={{ width: '700px' }}
                className="font-sans"
            >
                <div className="p-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formField('Tên đầy đủ *', 'name')}
                        {formField('Số điện thoại *', 'phone', 'tel')}
                        {formField('Mã CCCD *', 'cccd_number')}
                        {formField('Ngày cấp CCCD *', 'issue_date', 'date')}
                        {formField('Ngày sinh *', 'birthday', 'date')}
                        <div className="flex flex-col gap-1.5 flex-1 w-full">
                            <label className="text-sm font-semibold text-slate-700">Giới tính</label>
                            <Dropdown
                                value={form.sex}
                                options={[{ label: 'Nam', value: 'Nam' }, { label: 'Nữ', value: 'Nữ' }]}
                                onChange={(e) => setForm((p: any) => ({ ...p, sex: e.value }))}
                                pt={{
                                    root: { className: 'w-full bg-slate-50 border border-slate-300 rounded focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden text-sm' },
                                    input: { className: 'p-2.5 text-slate-700 w-full font-sans' },
                                    trigger: { className: 'w-10 text-slate-500 flex items-center justify-center bg-slate-50' },
                                    panel: { className: 'bg-white border border-slate-200 shadow-xl rounded-md my-1' },
                                    item: { className: 'p-3 hover:bg-slate-100 cursor-pointer text-slate-700 transition-colors font-sans' }
                                }}
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            {formField('Địa chỉ *', 'address')}
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            {formField('Email (Tùy chọn)', 'email', 'email')}
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="font-semibold text-slate-700 mb-4">Tài liệu đính kèm</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { key: 'cccd_front', label: 'CCCD Mặt trước' },
                                { key: 'cccd_back', label: 'CCCD Mặt sau' },
                                { key: 'avatar', label: 'Ảnh đại diện' }
                            ].map((item) => (
                                <div key={item.key} className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-slate-500">{item.label}</label>
                                    <div className="relative border-2 border-dashed border-slate-300 rounded p-4 text-center hover:bg-slate-50 cursor-pointer transition-colors h-24 flex items-center justify-center">
                                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setForm((p: any) => ({ ...p, [item.key]: e.target.files?.[0] || null }))} />
                                        {(form as any)[item.key] ? (
                                            <div className="text-emerald-600 font-medium flex items-center gap-1 text-sm"><i className="pi pi-check"></i> Đã chọn files</div>
                                        ) : (
                                            <div className="text-slate-400 flex flex-col items-center gap-1">
                                                <Upload size={16} />
                                                <span className="text-xs">Tải ảnh lên</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="font-semibold text-slate-700 mb-4">Thông tin hệ thống</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formField('Tên đăng nhập *', 'username')}
                            {formField('Mật khẩu mặc định *', 'password', 'password')}
                            {formField('Ca bắt đầu', 'shiftStart', 'time')}
                            {formField('Ca kết thúc', 'shiftEnd', 'time')}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <Button label="Hủy" onClick={() => setShowCreate(false)} className="p-button-text text-slate-600 font-medium" />
                        <Button label="Lưu nhân sự" onClick={handleCreate} loading={saving} className="bg-blue-600 border-none font-medium px-6 hover:bg-blue-700" />
                    </div>
                </div>
            </Dialog>

            {/* EDIT DIALOG */}
            <Dialog
                header={<div className="font-semibold text-xl">Sửa Hồ Sơ</div>}
                visible={showEdit}
                onHide={() => setShowEdit(false)}
                style={{ width: '500px' }}
                className="font-sans"
            >
                <div className="p-2 space-y-4">
                    {formField('Tên đầy đủ', 'name')}
                    {formField('Số điện thoại', 'phone', 'tel')}
                    {formField('Email', 'email', 'email')}
                    {formField('Địa chỉ', 'address')}

                    <div className="grid grid-cols-2 gap-4">
                        {formField('Bắt đầu ca', 'shiftStart', 'time')}
                        {formField('Kết thúc ca', 'shiftEnd', 'time')}
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1 w-full">
                        <label className="text-sm font-semibold text-slate-700">Phân quyền</label>
                        <Dropdown
                            value={form.id_Role}
                            options={roles}
                            onChange={(e) => {
                                setForm((p: any) => ({ ...p, id_Role: e.value }));
                                handleChangeRole(selectedEmployee, e.value);
                            }}
                            pt={{
                                root: { className: 'w-full bg-slate-50 border border-slate-300 rounded focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden text-sm' },
                                input: { className: 'p-2.5 text-slate-700 w-full font-sans' },
                                trigger: { className: 'w-10 text-slate-500 flex items-center justify-center bg-slate-50' },
                                panel: { className: 'bg-white border border-slate-200 shadow-xl rounded-md my-1' },
                                item: { className: 'p-3 hover:bg-slate-100 cursor-pointer text-slate-700 transition-colors font-sans' }
                            }}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                        <Button label="Hủy" onClick={() => setShowEdit(false)} className="p-button-text text-slate-600 font-medium" />
                        <Button label="Lưu cập nhật" onClick={handleUpdate} loading={saving} className="bg-blue-600 border-none font-medium px-6 hover:bg-blue-700" />
                    </div>
                </div>
            </Dialog>

            {/* RESET PWD DIALOG */}
            <Dialog header={<div className="font-semibold text-xl">Đổi Mật Khẩu</div>} visible={showResetPwd} onHide={() => setShowResetPwd(false)} style={{ width: '400px' }}>
                <div className="p-2 space-y-5">
                    <div className="bg-slate-50 p-4 rounded-md border border-slate-200 flex flex-col gap-1">
                        <span className="text-xs text-slate-500 uppercase font-bold">Người Dùng</span>
                        <span className="text-sm font-semibold">{selectedEmployee?.user?.name} (@{selectedEmployee?.username || '—'})</span>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Mật khẩu mới</label>
                        <InputText type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 border-slate-300" placeholder="Tối thiểu 6 ký tự" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button label="Hủy" onClick={() => setShowResetPwd(false)} className="p-button-text text-slate-600" />
                        <Button label="Lưu mật khẩu" onClick={handleResetPassword} loading={saving} className="bg-blue-600 hover:bg-blue-700 border-none px-6" />
                    </div>
                </div>
            </Dialog>

            {/* DETAIL DIALOG */}
            <Dialog
                header={
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                            <IdCard size={18} className="text-amber-700" />
                        </div>
                        <div>
                            <p className="font-black text-slate-900 text-base leading-none">Hồ Sơ Nhân Sự</p>
                            <p className="text-xs font-medium text-slate-400 mt-0.5">Thông tin đầy đủ hồ sơ và tài khoản</p>
                        </div>
                    </div>
                }
                visible={showDetail}
                onHide={() => setShowDetail(false)}
                style={{ width: '720px' }}
                className="font-sans"
                pt={{ content: { className: 'p-0' } }}
            >
                {selectedEmployee && (
                    <div className="overflow-y-auto max-h-[85vh]">

                        {/* Header: Avatar + tên */}
                        <div className="flex items-center gap-5 px-6 py-5 border-b border-slate-100 bg-slate-50">
                            {selectedEmployee.user?.avatar ? (
                                <img
                                    src={selectedEmployee.user.avatar.startsWith('http') ? selectedEmployee.user.avatar : `http://localhost:3000${selectedEmployee.user.avatar.startsWith('/') ? '' : '/'}${selectedEmployee.user.avatar}`}
                                    alt="Avatar"
                                    className="w-16 h-16 rounded-xl border border-slate-200 object-cover shadow-sm flex-shrink-0"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 text-2xl font-black flex-shrink-0">
                                    {selectedEmployee.user?.name?.charAt(0)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-black text-slate-900 truncate">{selectedEmployee.user?.name || '--'}</h3>
                                <p className="text-sm text-slate-500 font-mono mt-0.5">@{selectedEmployee.username || '--'}</p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">{selectedEmployee.user?.role?.Name || 'NHÂN VIÊN'}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${selectedEmployee.user?.is_locked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {selectedEmployee.user?.is_locked ? '🔒 Đã khóa' : '✅ Hoạt động'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">

                            {/* Tài khoản hệ thống */}
                            <div className="px-6 py-5">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Tài khoản hệ thống</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Tên đăng nhập</p>
                                        <p className="font-bold text-slate-900 font-mono text-sm bg-slate-50 border border-slate-200 rounded px-3 py-2">{selectedEmployee.username || '--'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Mật khẩu</p>
                                        <p className="font-mono text-sm bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-400 italic">••••••••</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Ca làm việc</p>
                                        <p className="font-bold text-slate-800 text-sm bg-slate-50 border border-slate-200 rounded px-3 py-2">
                                            {selectedEmployee.shiftStart && selectedEmployee.shiftEnd ? `${selectedEmployee.shiftStart} — ${selectedEmployee.shiftEnd}` : <span className="text-slate-400 font-normal not-italic">Chưa xếp ca</span>}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">ID Nhân viên</p>
                                        <p className="font-mono text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded px-3 py-2 truncate">{selectedEmployee.Id || '--'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin cá nhân */}
                            <div className="px-6 py-5">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Thông tin cá nhân</p>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                    <div><p className="text-xs text-slate-400 mb-1">Họ và tên</p><p className="font-semibold text-slate-800">{selectedEmployee.user?.name || '--'}</p></div>
                                    <div><p className="text-xs text-slate-400 mb-1">Giới tính</p><p className="font-semibold text-slate-800">{selectedEmployee.user?.sex || '--'}</p></div>
                                    <div><p className="text-xs text-slate-400 mb-1">Số điện thoại</p><p className="font-semibold text-slate-800">{selectedEmployee.user?.phone || '--'}</p></div>
                                    <div><p className="text-xs text-slate-400 mb-1">Email</p><p className="font-semibold text-slate-800 truncate">{selectedEmployee.user?.email || '--'}</p></div>
                                    <div><p className="text-xs text-slate-400 mb-1">Ngày sinh</p><p className="font-semibold text-slate-800">{selectedEmployee.user?.birthday || '--'}</p></div>
                                    <div><p className="text-xs text-slate-400 mb-1">Ngày tạo tài khoản</p><p className="font-semibold text-slate-800">{selectedEmployee.user?.created_at ? new Date(selectedEmployee.user.created_at).toLocaleDateString('vi-VN') : '--'}</p></div>
                                    <div className="col-span-2"><p className="text-xs text-slate-400 mb-1">Địa chỉ thường trú</p><p className="font-semibold text-slate-800">{selectedEmployee.user?.address || '--'}</p></div>
                                </div>
                            </div>

                            {/* Căn cước công dân */}
                            <div className="px-6 py-5">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Căn cước công dân</p>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                    <div><p className="text-xs text-slate-400 mb-1">Số CCCD</p><p className="font-black text-slate-900 font-mono tracking-widest">{selectedEmployee.user?.cccd_number || '--'}</p></div>
                                    <div><p className="text-xs text-slate-400 mb-1">Ngày cấp</p><p className="font-semibold text-slate-800">{selectedEmployee.user?.issue_date || '--'}</p></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[{ key: 'cccd_front', label: 'Mặt trước CCCD' }, { key: 'cccd_back', label: 'Mặt sau CCCD' }].map((side) => {
                                        const imgPath = (selectedEmployee.user as any)?.[side.key];
                                        const fullSrc = imgPath && imgPath !== 'none'
                                            ? (imgPath.startsWith('http') ? imgPath : `http://localhost:3000${imgPath.startsWith('/') ? '' : '/'}${imgPath}`)
                                            : null;
                                        return (
                                            <div key={side.key} className="border border-slate-200 rounded-lg overflow-hidden">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1.5 bg-slate-50 border-b border-slate-200">{side.label}</p>
                                                {fullSrc ? (
                                                    <Image src={fullSrc} preview imageClassName="w-full h-28 object-cover" className="w-full flex" />
                                                ) : (
                                                    <div className="w-full h-28 flex items-center justify-center text-slate-400 text-xs bg-slate-50">Không có ảnh</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Đặt lại mật khẩu - inline */}
                            <div className="px-6 py-5 bg-slate-50">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Đặt lại mật khẩu đăng nhập</p>
                                <p className="text-xs text-slate-400 mb-4">Mật khẩu mới sẽ được mã hóa bcrypt và áp dụng ngay lập tức.</p>
                                <div className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-500 mb-1.5 block">Mật khẩu mới <span className="text-red-400">*</span></label>
                                        <div className="relative">
                                            <InputText
                                                type={showDetailPwd ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Tối thiểu 6 ký tự"
                                                className="w-full pr-10 text-sm border-slate-300 bg-white"
                                            />
                                            <button onClick={() => setShowDetailPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" type="button">
                                                {showDetailPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>
                                    <Button
                                        label="Lưu mật khẩu"
                                        icon="pi pi-save"
                                        loading={saving}
                                        onClick={handleResetPassword}
                                        className="bg-slate-800 border-none hover:bg-slate-900 text-sm font-semibold px-5 whitespace-nowrap"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 bg-white">
                            <Button label="Chỉnh sửa" icon="pi pi-pencil" severity="info" outlined className="text-sm font-semibold"
                                onClick={() => { setShowDetail(false); openEdit(selectedEmployee); }} />
                            <Button label="Đóng" icon="pi pi-times" severity="secondary" outlined className="text-sm font-semibold"
                                onClick={() => setShowDetail(false)} />
                        </div>

                    </div>
                )}
            </Dialog>
        </div>
    );
}

