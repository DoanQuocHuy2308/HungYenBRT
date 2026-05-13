"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { 
  User, Mail, Phone, MapPin, ShieldCheck, 
  Clock, CheckCircle2, Camera, UserSquare2
} from 'lucide-react';

const API = 'http://localhost:3000';

const SEX_OPTIONS = [
  { label: 'Nam', value: 'Nam' },
  { label: 'Nữ', value: 'Nữ' },
  { label: 'Khác', value: 'Khác' }
];

export default function ProfilePage() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<any>(null);
  
  // Password State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPwd, setChangingPwd] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const dataStr = localStorage.getItem('staff_data');
    if (dataStr) {
      try {
        const staffData = JSON.parse(dataStr);
        const empId = staffData?.id || staffData?.user?.id;
        if (empId) {
          setEmployeeId(empId);
          fetchEmployee(empId);
        } else {
          router.push('/login');
        }
      } catch (e) {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchEmployee = async (id: string) => {
    try {
      const res = await fetch(`${API}/employees/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        const emp = json.data;
        const u = emp.user || {};
        
        setEmployeeData(emp);
        
        if (u.avatar) {
          setAvatarPreview(`${API}${u.avatar}`);
        }
      }
    } catch (error) {
      console.error(error);
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải thông tin' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (!employeeId || !avatarFile) {
        toast.current?.show({ severity: 'info', summary: 'Thông báo', detail: 'Vui lòng chọn ảnh mới' });
        return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      form.append('userFields', JSON.stringify({})); // Empty to not overwrite other info
      form.append('avatar', avatarFile);

      const res = await fetch(`${API}/employees/${employeeId}`, {
        method: 'PUT',
        body: form
      });

      const json = await res.json();
      if (json.success) {
        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật ảnh đại diện' });
        
        // Update local storage so header avatar reflects instantly
        const dataStr = localStorage.getItem('staff_data');
        if (dataStr) {
          const staffData = JSON.parse(dataStr);
          if (json.data?.user) {
             staffData.avatar = json.data.user.avatar;
             localStorage.setItem('staff_data', JSON.stringify(staffData));
             window.dispatchEvent(new Event('staff_data_updated'));
          }
        }
        setAvatarFile(null); // Reset file
      } else {
        throw new Error(json.message);
      }
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Không thể lưu ảnh' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
      if (!employeeId) return;
      if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
          toast.current?.show({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng điền đầy đủ thông tin mật khẩu' });
          return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
          toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Mật khẩu mới không khớp' });
          return;
      }
      
      setChangingPwd(true);
      try {
          const res = await fetch(`${API}/employees/${employeeId}/change-password`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  oldPassword: passwordData.oldPassword,
                  newPassword: passwordData.newPassword
              })
          });
          const json = await res.json();
          if (json.success) {
              toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đổi mật khẩu thành công' });
              setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
          } else {
              throw new Error(json.message);
          }
      } catch (e: any) {
          toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: e.message || 'Lỗi đổi mật khẩu' });
      } finally {
          setChangingPwd(false);
      }
  };

  if (loading) return <PageWrapper title="Trang Cá Nhân"><div className="animate-pulse h-64 bg-slate-100 rounded-3xl" /></PageWrapper>;

  const u = employeeData?.user || {};
  const r = u.role || {};

  return (
    <PageWrapper 
      title="Hồ Sơ Cá Nhân" 
      description="Quản lý và cập nhật thông tin cá nhân trên hệ thống BRT."
    >
      <Toast ref={toast} position="top-right" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Avatar & Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-[#3E2723]/5 flex flex-col items-center text-center relative overflow-hidden">
             <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-[#3E2723] to-[#5D4037]"></div>
             
             <div className="relative mt-8 mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white relative group">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                       <User size={48} strokeWidth={1.5} />
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div 
                    className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                     <Camera size={24} className="text-white mb-1" />
                     <span className="text-[10px] font-bold text-white uppercase tracking-wider">Đổi ảnh</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*" 
                  className="hidden" 
                />
             </div>

             <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">{u.name || 'Chưa cập nhật'}</h3>
             <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <ShieldCheck size={14} />
                <span>{r.Name || 'Nhân viên'}</span>
             </div>

             <div className="w-full space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                   <div className="flex items-center gap-3 text-slate-500">
                      <UserSquare2 size={18} />
                      <span className="text-sm font-semibold">Tên đăng nhập</span>
                   </div>
                   <span className="text-sm font-bold text-slate-800">{employeeData?.username}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                   <div className="flex items-center gap-3 text-slate-500">
                      <Clock size={18} />
                      <span className="text-sm font-semibold">Ca làm việc</span>
                   </div>
                   <span className="text-sm font-bold text-slate-800">{employeeData?.shiftStart} - {employeeData?.shiftEnd}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Col: Edit Form */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-[#3E2723]/5 mb-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Thông tin chi tiết</h3>
                 <button 
                    onClick={handleSaveAvatar}
                    disabled={saving || !avatarFile}
                    className="flex items-center gap-2 bg-[#3E2723] hover:bg-[#5D4037] text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-[#3E2723]/20 disabled:opacity-50"
                 >
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={18} />}
                    {saving ? 'Đang lưu...' : 'Lưu ảnh mới'}
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Name */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Họ và tên</label>
                    <div className="relative">
                       <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <InputText 
                          value={u.name || ''} 
                          readOnly
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                       />
                    </div>
                 </div>

                 {/* Phone */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Số điện thoại</label>
                    <div className="relative">
                       <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <InputText 
                          value={u.phone || ''} 
                          readOnly
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                       />
                    </div>
                 </div>

                 {/* Email */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                    <div className="relative">
                       <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <InputText 
                          value={u.email || ''} 
                          readOnly
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                       />
                    </div>
                 </div>

                 {/* CCCD */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Số CCCD</label>
                    <div className="relative">
                       <UserSquare2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <InputText 
                          value={u.cccd_number || ''} 
                          readOnly
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                       />
                    </div>
                 </div>

                 {/* Birthday */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Ngày sinh</label>
                    <div className="relative">
                       <InputText 
                          value={u.birthday ? new Date(u.birthday).toLocaleDateString('vi-VN') : ''} 
                          readOnly
                          className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                       />
                    </div>
                 </div>

                 {/* Sex */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Giới tính</label>
                    <InputText 
                        value={u.sex || ''} 
                        readOnly
                        className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                 </div>

                 {/* Address */}
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Địa chỉ liên hệ</label>
                    <div className="relative">
                       <MapPin size={18} className="absolute left-4 top-4 text-slate-400" />
                       <textarea 
                          value={u.address || ''} 
                          readOnly
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-500 cursor-not-allowed outline-none resize-none min-h-[100px]"
                       />
                    </div>
                 </div>

              </div>
           </div>

           {/* Change Password Card */}
           <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-[#3E2723]/5">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Đổi mật khẩu</h3>
                 <button 
                    onClick={handleChangePassword}
                    disabled={changingPwd}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50"
                 >
                    {changingPwd ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck size={18} />}
                    {changingPwd ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mật khẩu hiện tại</label>
                    <InputText 
                        type="password"
                        value={passwordData.oldPassword} 
                        onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                        className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-100 transition-all"
                        placeholder="••••••••"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mật khẩu mới</label>
                    <InputText 
                        type="password"
                        value={passwordData.newPassword} 
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-100 transition-all"
                        placeholder="••••••••"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Xác nhận mật khẩu</label>
                    <InputText 
                        type="password"
                        value={passwordData.confirmPassword} 
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-100 transition-all"
                        placeholder="••••••••"
                    />
                 </div>
              </div>
           </div>
        </div>

      </div>
    </PageWrapper>
  );
}
