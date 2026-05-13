"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { 
    Fingerprint, Plus, Trash2, Type, 
    Image as ImageIcon, GripVertical,
    Settings2, Info, Eye
} from 'lucide-react';
import { discountRegistrationService } from '../../../services/managementService';

export default function DiscountConfigView() {
    const toast = useRef<any>(null);
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Type Modal
    const [typeVisible, setTypeVisible] = useState(false);
    const [selectedType, setSelectedType] = useState<any>(null);
    const [typeForm, setTypeForm] = useState<any>({
        Name: '', Description: '', DiscountPercentage: 0, is_free: false, max_discount_value: null, requires_document: true
    });

    // Field Builder Modal
    const [fieldVisible, setFieldVisible] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [fields, setFields] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res: any = await discountRegistrationService.getFullConfig();
            setConfigs(res?.data || []);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải cấu hình' });
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
                Name: '', Description: '', DiscountPercentage: 0, is_free: false, max_discount_value: null, requires_document: true
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
        <div className="space-y-4 font-sans">
            <Toast ref={toast} />

            {/* Header Action */}
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-500 font-medium">Cấu hình các loại gói ưu đãi và biểu mẫu yêu cầu thu thập từ khách hàng.</p>
                <Button 
                    label="Tạo gói ưu đãi mới" icon={<Plus size={14}/>}
                    className="bg-slate-900 border-none text-white text-sm font-semibold px-4"
                    onClick={() => openTypeModal()}
                />
            </div>

            {/* Config Cards */}
            <div className="grid grid-cols-1 gap-4">
                {configs.map((type) => (
                    <div key={type.Id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-sm transition-all">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 flex-shrink-0">
                                <Fingerprint size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-base font-bold text-slate-900">{type.Name}</h3>
                                    <Tag value="Hoạt động" severity="success" className="text-[10px] uppercase font-bold px-2 py-0.5" />
                                </div>
                                <p className="text-xs text-slate-500 max-w-xl mb-2 line-clamp-1">{type.Description || 'Không có mô tả chi tiết.'}</p>
                                <div className="flex items-center gap-4 text-xs">
                                    <span className="font-medium text-slate-600">Giảm giá: <strong className="text-emerald-600">{type.is_free ? 'Miễn phí' : `${type.DiscountPercentage}%`}</strong></span>
                                    <div className="w-px h-3 bg-slate-300"></div>
                                    <span className="font-medium text-slate-600">Form: <strong className="text-indigo-600">{type.discount_fields?.length || 0} trường</strong></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button 
                                icon={<Eye size={14}/>} label="Xem trước"
                                className="p-button-outlined p-button-secondary text-sm font-semibold px-3 py-1.5"
                                onClick={() => { setSelectedType(type); setFields(type.discount_fields || []); setPreviewVisible(true); }}
                            />
                            <Button 
                                icon={<Settings2 size={14}/>} label="Form mẫu"
                                className="p-button-outlined p-button-info text-sm font-semibold px-3 py-1.5"
                                onClick={() => openFieldBuilder(type)}
                            />
                            <Button 
                                icon={<Settings2 size={14}/>} 
                                className="p-button-text p-button-secondary w-9 h-9 p-0 flex items-center justify-center"
                                tooltip="Cấu hình gói" tooltipOptions={{ position: 'top' }}
                                onClick={() => openTypeModal(type)}
                            />
                            <Button 
                                icon={<Trash2 size={14}/>} 
                                className="p-button-text p-button-danger w-9 h-9 p-0 flex items-center justify-center"
                                tooltip="Xóa gói" tooltipOptions={{ position: 'top' }}
                                onClick={() => deleteType(type.Id)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* POLICY TYPE MODAL */}
            <Dialog 
                header={
                    <span className="font-bold text-slate-900 text-base">
                        {selectedType ? 'Cập nhật gói ưu đãi' : 'Tạo gói ưu đãi mới'}
                    </span>
                }
                visible={typeVisible} onHide={() => setTypeVisible(false)}
                modal style={{ width: '450px' }}
                pt={{ content: { className: 'p-6 pt-2' } }}
            >
                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Tên gói ưu đãi <span className="text-red-400">*</span></label>
                        <InputText 
                            value={typeForm.Name} onChange={(e) => setTypeForm({ ...typeForm, Name: e.target.value })}
                            placeholder="VD: Học sinh - Sinh viên" className="text-sm border-slate-300"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Mô tả chi tiết</label>
                        <InputTextarea 
                            value={typeForm.Description} onChange={(e) => setTypeForm({ ...typeForm, Description: e.target.value })}
                            className="text-sm border-slate-300" rows={3} placeholder="Điều kiện được hưởng gói này..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600">Mức giảm (%)</label>
                            <InputNumber 
                                value={typeForm.DiscountPercentage} onValueChange={(e) => setTypeForm({ ...typeForm, DiscountPercentage: e.value })}
                                inputClassName="text-sm border-slate-300 py-2" className="w-full"
                                suffix=" %" min={0} max={100}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600">Giảm tối đa (VNĐ)</label>
                            <InputNumber 
                                value={typeForm.max_discount_value} onValueChange={(e) => setTypeForm({ ...typeForm, max_discount_value: e.value })}
                                inputClassName="text-sm border-slate-300 py-2" className="w-full"
                                placeholder="Không giới hạn"
                            />
                        </div>
                    </div>
                    
                    <div className="pt-2 flex justify-end gap-2">
                        <Button label="Hủy" severity="secondary" outlined className="px-4 py-2 text-sm font-semibold" onClick={() => setTypeVisible(false)} />
                        <Button label="Lưu chính sách" loading={saving} onClick={handleSaveType} className="bg-slate-900 border-none text-white px-4 py-2 text-sm font-semibold" />
                    </div>
                </div>
            </Dialog>

            {/* FIELD BUILDER MODAL */}
            <Dialog 
                header={
                    <span className="font-bold text-slate-900 text-base">Thiết kế biểu mẫu yêu cầu</span>
                }
                visible={fieldVisible} onHide={() => setFieldVisible(false)}
                modal style={{ width: '600px' }}
                pt={{ content: { className: 'p-6 pt-2' } }}
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 font-medium">Cấu hình thông tin khách hàng cần cung cấp khi đăng ký gói <strong className="text-slate-800">{selectedType?.Name}</strong>.</p>
                    
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 max-h-[350px] overflow-y-auto space-y-3">
                        {fields.map((f, i) => (
                            <div key={i} className="bg-white p-3 border border-slate-200 rounded-lg flex items-center gap-3">
                                <GripVertical size={14} className="text-slate-300 cursor-grab flex-shrink-0" />
                                <InputText 
                                    value={f.field_Name} onChange={(e) => updateField(i, 'field_Name', e.target.value)}
                                    placeholder="Tên nhãn (VD: Ảnh thẻ)" className="flex-[2] text-sm border-slate-300 py-1.5"
                                />
                                <Dropdown 
                                    value={f.field_Type} 
                                    options={[ { label: 'Văn bản', value: 'text' }, { label: 'Hình ảnh', value: 'image' } ]} 
                                    onChange={(e) => updateField(i, 'field_Type', e.value)}
                                    className="flex-1 text-sm border-slate-300" pt={{ root: { className: 'h-8 flex items-center' } }}
                                />
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <input 
                                        type="checkbox" checked={f.is_Required} 
                                        onChange={(e) => updateField(i, 'is_Required', e.target.checked)}
                                        className="w-3.5 h-3.5 text-slate-900 rounded border-slate-300"
                                    />
                                    <span className="text-xs text-slate-600 font-medium">Bắt buộc</span>
                                </div>
                                <Button icon={<Trash2 size={14}/>} className="p-button-text p-button-danger p-0 w-6 h-6 flex-shrink-0" onClick={() => removeField(i)} />
                            </div>
                        ))}

                        <Button 
                            label="Thêm trường dữ liệu" icon={<Plus size={14}/>}
                            className="w-full p-button-dashed border border-dashed border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-700 py-2.5 text-sm font-semibold rounded-lg"
                            onClick={addField}
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <Button label="Đóng" severity="secondary" outlined className="px-4 py-2 text-sm font-semibold" onClick={() => setFieldVisible(false)} />
                        <Button label="Lưu biểu mẫu" icon={<Settings2 size={14}/>} loading={saving} onClick={handleSyncFields} className="bg-slate-900 border-none text-white px-4 py-2 text-sm font-semibold" />
                    </div>
                </div>
            </Dialog>

            {/* PREVIEW FORM MODAL */}
            <Dialog 
                header={
                    <div className="flex items-center gap-2">
                        <Eye size={16} className="text-slate-600" />
                        <span className="font-bold text-slate-900 text-base">Xem trước biểu mẫu ({selectedType?.Name})</span>
                    </div>
                }
                visible={previewVisible} onHide={() => setPreviewVisible(false)}
                modal style={{ width: '400px' }}
                pt={{ content: { className: 'p-6 pt-2' } }}
            >
                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {fields.length > 0 ? (
                            <div className="space-y-3">
                                {fields.map((f, i) => (
                                    <div key={i} className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-slate-700">
                                            {f.field_Name} {f.is_Required && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="w-full h-9 bg-white border border-slate-300 rounded-md flex items-center px-3 text-slate-400">
                                            {f.field_Type === 'image' ? <ImageIcon size={14} /> : <Type size={14} />}
                                            <span className="text-xs ml-2">Nhập / Tải lên {f.field_Type === 'image' ? 'ảnh' : 'văn bản'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4 italic">Biểu mẫu trống.</p>
                        )}
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-xs">
                        <Info size={16} className="flex-shrink-0 mt-0.5" />
                        <p>Đây là giao diện mô phỏng cách người dùng sẽ nhìn thấy các trường dữ liệu trên ứng dụng di động.</p>
                    </div>
                    <div className="pt-2 flex justify-end">
                        <Button label="Đóng" severity="secondary" outlined className="px-6 py-2 text-sm font-semibold" onClick={() => setPreviewVisible(false)} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
