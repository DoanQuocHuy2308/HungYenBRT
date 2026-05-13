"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { 
    Fingerprint, Plus, Trash2, Save, X, Type, 
    Image as ImageIcon, AlertCircle, ShieldCheck, 
    ChevronLeft, Settings2, Info, GripVertical, Check
} from 'lucide-react';
import { discountRegistrationService } from '../../../../services/managementService';
import Link from 'next/link';

export default function DiscountConfigPage() {
    const toast = useRef<any>(null);
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Type Modal
    const [typeVisible, setTypeVisible] = useState(false);
    const [selectedType, setSelectedType] = useState<any>(null);
    const [typeForm, setTypeForm] = useState<any>({
        Name: '',
        Description: '',
        DiscountPercentage: 0,
        is_free: false,
        max_discount_value: null,
        requires_document: true
    });

    // Field Builder Modal
    const [fieldVisible, setFieldVisible] = useState(false);
    const [fields, setFields] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res: any = await discountRegistrationService.getFullConfig();
            setConfigs(res?.data || []);
        } catch {
            showToast('error', 'Lỗi', 'Không thể tải cấu hình');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const showToast = (s: 'success' | 'info' | 'warn' | 'error', sum: string, d: string) =>
        toast.current?.show({ severity: s, summary: sum, detail: d, life: 3000 });

    const openTypeModal = (type: any = null) => {
        setSelectedType(type);
        if (type) {
            setTypeForm({ ...type });
        } else {
            setTypeForm({
                Name: '',
                Description: '',
                DiscountPercentage: 0,
                is_free: false,
                max_discount_value: null,
                requires_document: true
            });
        }
        setTypeVisible(true);
    };

    const handleSaveType = async () => {
        if (!typeForm.Name) return showToast('warn', 'Thiếu thông tin', 'Vui lòng nhập tên loại ưu đãi');
        setSaving(true);
        try {
            await discountRegistrationService.saveType(typeForm);
            showToast('success', 'Thành công', 'Đã lưu cấu hình chính sách');
            setTypeVisible(false);
            fetchData();
        } catch {
            showToast('error', 'Lỗi', 'Không thể lưu dữ liệu');
        } finally {
            setSaving(false);
        }
    };

    const deleteType = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa chính sách này? Hành động này không thể hoàn tác.')) return;
        try {
            await discountRegistrationService.deleteType(id);
            showToast('success', 'Đã xóa', 'Xóa thành công');
            fetchData();
        } catch {
            showToast('error', 'Lỗi', 'Không thể xóa');
        }
    };

    // ── Field Builder Logic ──────────────────────────────────────
    const openFieldBuilder = (type: any) => {
        setSelectedType(type);
        setFields([...(type.discount_fields || [])]);
        setFieldVisible(true);
    };

    const addField = () => {
        setFields([...fields, { field_Name: '', field_Type: 'text', is_Required: true }]);
    };

    const removeField = (index: number) => {
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
    };

    const updateField = (index: number, key: string, value: any) => {
        const newFields = [...fields];
        newFields[index][key] = value;
        setFields(newFields);
    };

    const handleSyncFields = async () => {
        if (fields.some(f => !f.field_Name)) return showToast('warn', 'Lỗi', 'Vui lòng nhập đủ tên nhãn (Label)');
        
        setSaving(true);
        try {
            await discountRegistrationService.syncFields({
                id_Discount_Type: selectedType.Id,
                fields: fields
            });
            showToast('success', 'Thành công', 'Đã cập nhật bộ Form đăng ký');
            setFieldVisible(false);
            fetchData();
        } catch {
            showToast('error', 'Lỗi', 'Không thể đồng bộ Fields');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-10 font-[family-name:var(--font-inter)] text-slate-900">
            <Toast ref={toast} />

            {/* Back Bar */}
            <div className="mb-10">
                <Link href="/dashboard/discounts" className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Quay lại quản lý hồ sơ</span>
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm">
                        <Settings2 size={28} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Cấu hình chính sách</h1>
                        <p className="text-slate-500 font-medium text-xs tracking-tight mt-1">
                            Thiết lập các gói ưu đãi và quản lý các trường thông tin khách hàng cần cung cấp.
                        </p>
                    </div>
                </div>
                <Button 
                    label="TẠO GÓI MỚI" icon={<Plus size={16}/>}
                    className="bg-slate-900 border-none px-8 py-3.5 rounded-xl font-black text-[10px] tracking-widest text-white shadow-xl shadow-slate-200 hover:bg-black transition-all"
                    onClick={() => openTypeModal()}
                />
            </div>

            {/* Config List */}
            <div className="grid grid-cols-1 gap-6">
                {configs.map((type) => (
                    <div key={type.Id} className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-10 hover:border-slate-300 transition-all shadow-sm">
                        <div className="flex items-center gap-8 flex-[3]">
                            <div className="w-20 h-20 bg-slate-50 rounded-[1.8rem] border border-slate-100 flex items-center justify-center text-indigo-500 shadow-inner">
                                <Fingerprint size={32} strokeWidth={1} />
                            </div>
                            <div className="flex flex-col gap-2 min-w-0">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{type.Name}</h3>
                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest">Active</span>
                                </div>
                                <p className="text-sm font-medium text-slate-400 line-clamp-2 max-w-xl italic">
                                    {type.Description || 'Không có mô tả chi tiết cho gói bảo mật này.'}
                                </p>
                                <div className="flex items-center gap-6 mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Mức giảm giá</span>
                                        <span className="text-xs font-bold text-slate-700">{type.is_free ? 'N/A (Miễn phí)' : `${type.DiscountPercentage}%`}</span>
                                    </div>
                                    <div className="w-px h-6 bg-slate-100"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Hồ sơ yêu cầu</span>
                                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-tight">{type.discount_fields?.length || 0} trường dữ liệu</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 flex-[1.5] justify-end">
                            <Button 
                                label="SỬA FORM ĐĂNG KÝ" icon={<Plus size={14}/>}
                                className="bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 px-6 py-3 rounded-xl font-bold text-[10px] tracking-widest"
                                onClick={() => openFieldBuilder(type)}
                            />
                            <Button 
                                icon={<Settings2 size={16}/>}
                                className="p-button-secondary p-button-text hover:bg-slate-50"
                                onClick={() => openTypeModal(type)}
                            />
                            <Button 
                                icon={<Trash2 size={16}/>}
                                className="p-button-danger p-button-text hover:bg-rose-50"
                                onClick={() => deleteType(type.Id)}
                            />
                        </div>
                    </div>
                ))}

                {configs.length === 0 && !loading && (
                    <div className="p-20 bg-white border border-dashed border-slate-200 rounded-[3rem] text-center">
                        <ShieldCheck size={48} className="text-slate-200 mx-auto mb-6" />
                        <h4 className="text-slate-400 font-black uppercase tracking-widest text-xs">Chưa có cấu hình chính sách nào</h4>
                    </div>
                )}
            </div>

            {/* POLICY TYPE MODAL */}
            <Dialog 
                header={null} visible={typeVisible} onHide={() => setTypeVisible(false)}
                modal closable={false} className="config-dialog"
                style={{ width: '500px' }}
            >
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{selectedType ? 'Cấu hình gói' : 'Tạo gói ưu đãi mới'}</h3>
                        <Button icon={<X size={18}/>} text onClick={() => setTypeVisible(false)} />
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tên gói ưu đãi *</label>
                            <InputText 
                                value={typeForm.Name} onChange={(e) => setTypeForm({ ...typeForm, Name: e.target.value })}
                                placeholder="VD: Sinh viên / Giảng viên / Người cao tuổi"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold secondary-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mô tả chi tiết</label>
                            <InputTextarea 
                                value={typeForm.Description} onChange={(e) => setTypeForm({ ...typeForm, Description: e.target.value })}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium" rows={3}
                                placeholder="Mô tả các điều kiện được hưởng gói này..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mức giảm (%)</label>
                                <InputNumber 
                                    value={typeForm.DiscountPercentage} onValueChange={(e) => setTypeForm({ ...typeForm, DiscountPercentage: e.value })}
                                    className="w-full" inputClassName="px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                                    suffix=" %" min={0} max={100}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Giảm tối đa (đ)</label>
                                <InputNumber 
                                    value={typeForm.max_discount_value} onValueChange={(e) => setTypeForm({ ...typeForm, max_discount_value: e.value })}
                                    className="w-full" inputClassName="px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-indigo-600"
                                    placeholder="Không giới hạn"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-2">
                        <Button 
                            label="HỦY" text onClick={() => setTypeVisible(false)}
                            className="bg-slate-100/50 flex-1 text-slate-400 font-black text-[10px] tracking-widest py-3.5 rounded-xl"
                        />
                        <Button 
                            label="LƯU CHÍNH SÁCH" loading={saving} onClick={handleSaveType}
                            className="bg-slate-900 flex-[2] text-white font-black text-[10px] tracking-widest py-3.5 rounded-xl border-none shadow-xl shadow-slate-200"
                        />
                    </div>
                </div>
            </Dialog>

            {/* FIELD BUILDER MODAL */}
            <Dialog 
                header={null} visible={fieldVisible} onHide={() => setFieldVisible(false)}
                modal closable={false} className="config-dialog"
                style={{ width: '700px' }}
            >
                <div className="p-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                                <Settings2 size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Form Builder</h3>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Cấu hình hồ sơ: {selectedType?.Name}</p>
                            </div>
                        </div>
                        <Button icon={<X size={18}/>} text onClick={() => setFieldVisible(false)} />
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mb-8 max-h-[450px] overflow-y-auto">
                        <div className="space-y-4">
                            {fields.map((f, i) => (
                                <div key={i} className="bg-white p-4 border border-slate-200 rounded-xl flex items-center gap-4 group transition-shadow hover:shadow-sm">
                                    <div className="cursor-grab text-slate-300 group-hover:text-slate-400"><GripVertical size={16}/></div>
                                    <div className="flex-[2]">
                                        <InputText 
                                            value={f.field_Name} onChange={(e) => updateField(i, 'field_Name', e.target.value)}
                                            placeholder="Tên nhãn (Label) VD: Ảnh thẻ sinh viên"
                                            className="w-full text-xs font-bold border-none bg-slate-50/50 py-2.5 px-4 rounded-lg focus:bg-white transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Dropdown 
                                            value={f.field_Type} options={[
                                                { label: 'Văn bản (Text)', value: 'text', icon: <Type size={12}/> },
                                                { label: 'Hình ảnh (Image)', value: 'image', icon: <ImageIcon size={12}/> }
                                            ]} 
                                            onChange={(e) => updateField(i, 'field_Type', e.value)}
                                            placeholder="Loại dữ liệu"
                                            className="w-full text-[10px] font-bold uppercase rounded-lg border-slate-200"
                                            panelClassName="text-[10px]"
                                            itemTemplate={(option) => (
                                                <div className="flex items-center gap-2">
                                                    {option.icon}
                                                    <span>{option.label}</span>
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                                        <input 
                                            type="checkbox" checked={f.is_Required} 
                                            onChange={(e) => updateField(i, 'is_Required', e.target.checked)}
                                            className="w-4 h-4 rounded text-slate-900 focus:ring-slate-400"
                                        />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bắt buộc</span>
                                    </div>
                                    <Button icon={<Trash2 size={16}/>} text severity="danger" onClick={() => removeField(i)} className="shrink-0" />
                                </div>
                            ))}

                            {fields.length === 0 && (
                                <div className="text-center py-10">
                                    <AlertCircle size={32} className="text-slate-200 mx-auto mb-3" />
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Form này hiện chưa có trường dữ liệu nào</p>
                                </div>
                            )}

                            <Button 
                                label="THÊM TRƯỜNG DỮ LIỆU" icon={<Plus size={14}/>}
                                className="w-full p-button-text font-black text-[9px] tracking-[0.2em] py-4 text-indigo-500 hover:bg-white transition-colors"
                                onClick={addField}
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4 mb-10">
                        <Info size={20} className="text-indigo-500 shrink-0" />
                        <p className="text-[11px] font-medium text-indigo-700 leading-relaxed">
                            Cấu hình này sẽ trực tiếp thay đổi biểu mẫu nộp đơn của khách hàng. Hãy chắc chắn tên nhãn rõ ràng để người dùng dễ dàng thực hiện.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button 
                            label="HỦY" text onClick={() => setFieldVisible(false)}
                            className="bg-slate-100 flex-1 text-slate-400 font-black text-[10px] tracking-widest py-4 rounded-xl"
                        />
                        <Button 
                            label="LƯU CẤU HÌNH FORM" icon={<Save size={16}/>}
                            loading={saving} onClick={handleSyncFields}
                            className="bg-indigo-600 flex-[3] text-white font-black text-[10px] tracking-[0.1em] py-4 rounded-xl border-none shadow-xl shadow-indigo-100"
                        />
                    </div>
                </div>
            </Dialog>

            <style jsx global>{`
                .config-dialog .p-dialog-content {
                    padding: 0;
                    border-radius: 2.5rem;
                    overflow: hidden;
                }
                .secondary-input:focus {
                    border-color: #0f172a !important;
                    box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.05) !important;
                }
                .p-dropdown {
                    border: 1px solid #e2e8f0;
                }
                .p-dropdown-label {
                    font-size: 10px !important;
                    padding-top: 0.65rem !important;
                    padding-bottom: 0.65rem !important;
                }
            `}</style>
        </div>
    );
}
