"use client";

import { useRouter } from 'next/navigation';
import { 
  Train, LogOut, Ticket, CalendarDays, 
  ScanBarcode, BarChart3, Search, 
  PlusSquare, Bell, User 
} from 'lucide-react';
import { Carousel } from 'primereact/carousel';
import { Toast } from 'primereact/toast';
import { useRef, useEffect, useState } from 'react';
import { useStaffAuth } from '../hooks/useAuth';

import { DashboardAction } from '../components/features/dashboard/DashboardAction';
import { BannerCarousel } from '../components/features/dashboard/BannerCarousel';
import { PageWrapper } from '../components/layout/PageWrapper';

export default function StaffDashboard() {
  const router = useRouter();

  const actionCards = [
    { title: "Vé Lượt", desc: "Bán vé chặng / 1 chiều nội thành", icon: <Ticket size={32} />, color: "bg-orange-50/50", route: '/single-ticket' },
    { title: "Vé Thời Gian", desc: "Đăng ký vé Tháng / Học sinh", icon: <CalendarDays size={32} />, color: "bg-blue-50/50", route: '/time-ticket' },
    { title: "Kiểm Tra Vé", desc: "Quét tra cứu lỗi mã QR trạm", icon: <ScanBarcode size={32} />, color: "bg-purple-50/50", route: '/check-ticket' },
    { title: "Thống Kê", desc: "Báo cáo Doanh số & Lưu lượng", icon: <BarChart3 size={32} />, color: "bg-emerald-50/50", route: '/statistics' },
    { title: "Tra Cứu", desc: "Tìm kiếm vé hệ thống theo mã", icon: <Search size={32} />, color: "bg-sky-50/50", route: '/lookup' },
    { title: "Bổ sung vé", desc: "Cập nhật vé xuống sai ga", icon: <PlusSquare size={32} />, color: "bg-[#FDFBF7]", route: '/restock' },
  ];

  return (
    <PageWrapper 
        title="Bảng Điều Khiển" 
        description="Chào mừng trở lại. Chọn tác vụ nghiệp vụ để bắt đầu phiên làm việc tại trạm."
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        {actionCards.map((card, idx) => (
          <DashboardAction 
            key={idx}
            title={card.title}
            desc={card.desc}
            icon={card.icon}
            colorClass={card.color}
            onClick={() => router.push(card.route)}
          />
        ))}
      </div>

      <BannerCarousel />
    </PageWrapper>
  );
}
