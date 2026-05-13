"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Ticket, 
  Banknote,
  TrendingUp,
  CreditCard,
  UserCheck,
  Building,
  RefreshCw,
  ArrowUpRight,
  Clock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { ticketService, paymentService } from '../../services/managementService';

const fmt = (n: any) => {
    const val = parseFloat(n);
    if (isNaN(val)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentTrans, setRecentTrans] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const [statsRes, transRes] = await Promise.all([
            ticketService.getTicketStats(),
            paymentService.getAll()
        ]);
        setStats(statsRes?.data);
        setRecentTrans(transRes?.data?.slice(0, 5) || []);
    } catch (err) {
        console.error("Dashboard fetch error", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statCards = [
    { name: 'Vé Đang Hoạt Động', value: stats?.activeTickets || 0, icon: Ticket, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Đơn Hàng Hôm Nay', value: stats?.ordersToday || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Vé Đã Sử Dụng', value: stats?.usedTickets || 0, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Tổng Doanh Thu', value: fmt(stats?.totalRevenue), icon: Banknote, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const quickLinks = [
    { title: 'Quản Lý Vé', desc: 'Vé lượt, vé tháng', href: '/dashboard/tickets', icon: CreditCard, color: 'from-slate-800 to-slate-900' },
    { title: 'Thanh Toán', desc: 'Đối soát doanh thu', href: '/dashboard/payments', icon: TrendingUp, color: 'from-slate-800 to-slate-900' },
    { title: 'Nhân Sự', staff: 'Đội ngũ vận hành', href: '/dashboard/employees', icon: Users, color: 'from-slate-800 to-slate-900' },
  ];

  return (
    <div className="space-y-10 p-4 lg:p-0">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hệ thống Điều hành</h1>
          <p className="text-slate-500 font-medium mt-1">Tổng quan hoạt động và doanh thu thời gian thực.</p>
        </div>
        <button onClick={fetchData} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} mb-6`}>
                <Icon size={28} />
              </div>
              <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-2">{stat.name}</h3>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Recent Transactions */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Giao dịch gần nhất</h2>
              <Link href="/dashboard/payments" className="text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-2">Tất cả giao dịch <ArrowRight size={14} /></Link>
           </div>
           
           <div className="space-y-6">
              {recentTrans.length > 0 ? recentTrans.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-900 text-sm">#{t.TransactionId || 'Hệ thống'}</span>
                                <span className="text-[10px] font-black uppercase text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">{t.PaymentMethod}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{new Date(t.created_at).toLocaleString('vi-VN')}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-base font-black text-slate-900">{fmt(t.Amount)}</p>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Thành công</span>
                    </div>
                </div>
              )) : (
                <div className="py-10 text-center text-slate-300 italic text-sm font-medium">Chưa có giao dịch phát sinh hôm nay</div>
              )}
           </div>
        </div>

        {/* Quick Links */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4 px-4">Truy cập nhanh</h2>
            {quickLinks.map((link, i) => {
              const LinkIcon = link.icon;
              return (
                <Link key={i} href={link.href} className="flex items-center gap-5 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-slate-900 transition-all group">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                     <LinkIcon size={24} />
                  </div>
                  <div>
                     <h3 className="font-bold text-slate-900 text-base">{link.title}</h3>
                     <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{link.desc || link.staff}</p>
                  </div>
                  <ArrowUpRight size={18} className="ml-auto text-slate-200 group-hover:text-slate-900 transition-colors" />
                </Link>
              )
            })}
        </div>
      </div>
    </div>
  );
}
