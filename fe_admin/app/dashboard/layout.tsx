"use client";

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Ticket,
  Tags,
  Layers,
  Banknote,
  MapPin,
  Users,
  UserCircle,
  Percent,
  Menu,
  LogOut,
  BusFront,
  Bell,
  Search,
  ChevronDown,
  History,
  Activity,
  ShieldCheck,
  Settings,
  Route,
  Sparkles,
  Receipt,
  WalletCards
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'Nghiệp Vụ Vé': true,
    'Hệ Thống & Hạ Tầng': true,
    'Khách Hàng & Ưu Đãi': true
  });
  const { logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/login';
    } else {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    }
  }, []);

  const toggleMenu = (name: string) => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setExpandedMenus(prev => ({ ...prev, [name]: true }));
      return;
    }
    setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const navigation = [
    { name: 'Tổng Quan', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Thống Kê Nâng Cao', href: '/dashboard/statistics', icon: Activity },

    {
      name: 'Hệ Thống & Hạ Tầng',
      icon: ShieldCheck,
      children: [
        { name: 'Nhân Viên', href: '/dashboard/employees', icon: UserCircle },
        { name: 'Phân quyền (Roles)', href: '/dashboard/roles', icon: ShieldCheck },
        { name: 'Quản lý Nhà ga', href: '/dashboard/locations', icon: MapPin },
        { name: 'Cấu hình Cổng Thanh toán', href: '/dashboard/payment-methods', icon: WalletCards },
      ]
    },

    {
      name: 'Nghiệp Vụ Vé',
      icon: Ticket,
      children: [
        { name: 'Kiểu vé (Categories)', href: '/dashboard/ticket-categories', icon: Layers },
        { name: 'Loại vé (Types)', href: '/dashboard/ticket-types', icon: Tags },
        { name: 'Bảng giá niêm yết', href: '/dashboard/ticket-prices', icon: Banknote },
        { name: 'Quản lý đơn hàng', href: '/dashboard/tickets', icon: Activity },
        { name: 'Nhật ký soát vé', href: '/dashboard/ticket-logs', icon: History },
        { name: 'Quản trị Thanh toán', href: '/dashboard/payments', icon: Receipt },
      ]
    },

    {
      name: 'Khách Hàng & Ưu Đãi',
      icon: Users,
      children: [
        { name: 'Danh sách khách hàng', href: '/dashboard/users', icon: Users },
        { name: 'Hồ sơ Ưu đãi', href: '/dashboard/discounts', icon: Percent },
        { name: 'Chương trình Khuyến mãi', href: '/dashboard/promotions', icon: Sparkles },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-[#FCFbf8] flex font-sans antialiased">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-20'
          } bg-white shadow-2xl shadow-slate-200/50 border-r border-slate-100 flex flex-col transition-all duration-300 z-20`}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-50">
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${!sidebarOpen ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-700 to-amber-900 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-900/20">
              <BusFront size={22} className="text-white" />
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-black text-slate-800 text-lg tracking-tight">BRT Hưng Yên</span>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest text-center">Executive Admin</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-xl text-slate-400 hover:text-amber-800 hover:bg-amber-50 transition-all ${!sidebarOpen && 'mx-auto'}`}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2 scrollbar-hide">
          {navigation.map((item) => {
            const isParent = !!item.children;
            const isChildActive = isParent && item.children?.some(c => pathname === c.href);
            const isActive = pathname === item.href || isChildActive;
            const Icon = item.icon;
            const isExpanded = expandedMenus[item.name];

            if (isParent) {
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`
                      w-full flex items-center justify-between px-3 py-3 rounded-2xl transition-all group
                      ${isActive ? 'bg-amber-50/50 text-amber-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={`${isActive ? 'text-amber-700' : 'text-slate-400 group-hover:text-amber-600'} shrink-0`} />
                      <span className={`text-sm font-bold whitespace-nowrap transition-all duration-300 ${!sidebarOpen ? 'opacity-0 hidden' : 'opacity-100 block'}`}>
                        {item.name}
                      </span>
                    </div>
                    {sidebarOpen && (
                      <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isActive ? 'text-amber-600' : 'text-slate-300'}`} />
                    )}
                  </button>

                  {sidebarOpen && isExpanded && (
                    <div className="pl-6 pr-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
                      {item.children?.map(child => {
                        const isCActive = pathname === child.href;
                        const CIcon = child.icon;
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`
                              flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative
                              ${isCActive
                                ? 'bg-amber-900/5 text-amber-800 font-black'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50/50 font-semibold'
                              }
                            `}
                          >
                            <CIcon size={16} className={`${isCActive ? 'text-amber-700' : 'text-slate-400 group-hover:text-slate-600'}`} />
                            <span className="text-xs whitespace-nowrap">{child.name}</span>
                            {isCActive && (
                              <div className="absolute right-2 w-1.5 h-1.5 bg-amber-600 rounded-full shadow-[0_0_8px_rgba(217,119,6,0.5)]" />
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href || '#'}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group relative
                  ${isActive
                    ? 'bg-amber-900/10 text-amber-800 font-black'
                    : 'text-slate-500 hover:bg-amber-900/5 hover:text-slate-800 font-bold'
                  }
                `}
              >
                <Icon size={20} className={`${isActive ? 'text-amber-800' : 'text-slate-400 group-hover:text-amber-700'} shrink-0`} />
                <span className={`text-sm whitespace-nowrap transition-all duration-300 ${!sidebarOpen ? 'opacity-0 hidden' : 'opacity-100 block'}`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-amber-800 rounded-r-full shadow-[0_0_10px_rgba(146,64,14,0.3)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile / Logout */}
        <div className="p-5 border-t border-slate-50 mt-auto">
          <button
            onClick={() => logout()}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all ${!sidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} className="shrink-0" />
            <span className={`text-sm font-black whitespace-nowrap ${!sidebarOpen && 'hidden'}`}>Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 z-10 shrink-0">

          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-sm hidden md:block group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-600 transition-colors" />
              <input
                type="text"
                placeholder="Tra cứu nhanh..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <button className="relative text-slate-300 hover:text-amber-600 transition-all hover:scale-110">
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>

            <div className="flex items-center gap-4 p-1 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-slate-100 hover:bg-slate-50/50 pr-4">
              <div className="relative">
                {currentUser?.user?.avatar ? (
                  <img
                    src={currentUser.user.avatar.startsWith('http') ? currentUser.user.avatar : `http://localhost:3000${currentUser.user.avatar.startsWith('/') ? '' : '/'}${currentUser.user.avatar}`}
                    className="w-10 h-10 rounded-xl object-cover ring-4 ring-white shadow-xl bg-slate-100 group-hover:rotate-3 transition-all"
                    alt="User Avatar"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white flex items-center justify-center font-black shadow-lg shadow-slate-900/10 group-hover:scale-105 transition-transform">
                    {currentUser?.user?.name ? currentUser.user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>

              <div className="text-left hidden md:block max-w-[140px]">
                <p className="text-xs font-black text-slate-800 leading-none truncate mb-1.5 uppercase tracking-wide">
                  {currentUser?.user?.name || 'Guest User'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                    {currentUser?.user?.role?.Name || 'System Admin'}
                  </span>
                  <ChevronDown size={10} className="text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#FCFbf8]/30 p-10">
          {children}
        </main>
      </div>

    </div>
  );
}
