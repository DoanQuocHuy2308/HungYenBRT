"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Train, ShieldCheck, Mail, Lock, LayoutDashboard, 
    Ticket, BusFront, Fingerprint, User, RefreshCcw, 
    ChevronRight, Info 
} from 'lucide-react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useStaffAuth } from '../../hooks/useAuth';
import '../../styles/password.css';
import "@/styles/password.css";

import { BrandingSection } from '../../components/features/auth/BrandingSection';
import { LoginForm } from '../../components/features/auth/LoginForm';
import { PageWrapper } from '../../components/layout/PageWrapper';

export default function StaffLoginScreen() {
  const toast = useRef<Toast>(null);

  const handleSuccess = () => {
    toast.current?.show({ 
      severity: 'success', 
      summary: 'Xác thực thành công', 
      detail: 'Đang khởi tạo phiên làm việc tại trạm...', 
      life: 1500 
    });
    setTimeout(() => {
        window.location.href = '/'; 
    }, 1500);
  };

  const handleError = (msg: string) => {
    toast.current?.show({ 
      severity: 'error', 
      summary: 'Truy cập bị từ chối', 
      detail: msg, 
      life: 3000 
    });
  };

  return (
    <PageWrapper showNav={false} requireAuth={false}>
      <Toast ref={toast} position="top-right" />
      
      <div className="flex min-h-screen -mx-8 -my-0 overflow-hidden">
        {/* Branding (Left) */}
        <BrandingSection />

        {/* Auth Form (Right) */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-20 lg:px-28 bg-white relative">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#5D4037]/40 to-transparent"></div>
          <LoginForm onSuccess={handleSuccess} onError={handleError} />
        </div>
      </div>
    </PageWrapper>
  );
}
