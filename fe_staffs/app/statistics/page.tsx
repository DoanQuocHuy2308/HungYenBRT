"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart3, TrendingUp, Ticket, Users, DollarSign, Clock,
  MapPin, CreditCard, ArrowUpRight, RefreshCw, Activity,
  Wallet, Banknote, Bus, QrCode, ShoppingBag, Package,
  ChevronRight, CalendarDays, Zap
} from 'lucide-react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Calendar } from 'primereact/calendar';

const API = 'http://localhost:3000';
const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n));
const fmtM = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1000).toFixed(0)}K` : String(Math.round(n));

const RANGES = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Hôm qua', value: 'yesterday' },
  { label: '7 ngày', value: '7d' },
  { label: '30 ngày', value: '30d' },
  { label: 'Tháng này', value: 'month' },
  { label: 'Tùy chọn', value: 'custom' },
];

const METHOD_COLORS: Record<string, string> = {
  CASH: '#16a34a', BANKING: '#0284c7', WALLET: '#0068FF',
  ZALOPAY: '#0068FF', CARD: '#7c3aed',
};
const METHOD_ICONS: Record<string, any> = {
  CASH: Banknote, BANKING: CreditCard, WALLET: Wallet,
  ZALOPAY: QrCode, CARD: CreditCard,
};

const PALETTE = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse rounded-xl ${className}`} style={style} />
);

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, icon: Icon, color, loading }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
      {loading ? (
        <>
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold">
              <ArrowUpRight size={12} strokeWidth={3} />
              <span>Live</span>
            </div>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-1 font-medium">{sub}</p>}
          </div>
        </>
      )}
    </div>
  );
}

// ── Revenue Bar Chart ─────────────────────────────────────────────────────────
function RevenueChart({ data, loading }: { data: any[]; loading: boolean }) {
  if (loading) return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-85 flex flex-col gap-4">
      <Skeleton className="h-6 w-48" />
      <div className="flex-1 flex items-end gap-3">
        {Array(7).fill(0).map((_, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${30 + Math.random() * 60}%` } as any} />
        ))}
      </div>
    </div>
  );

  const maxVal = Math.max(...data.map(d => d.total || 0), 1);
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" /> Xu hướng Doanh thu
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Vé lượt vs Vé thời gian</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> Vé lượt</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-400 inline-block" /> Vé thời gian</span>
        </div>
      </div>
      <div className="flex items-end gap-2 h-50 relative">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[100, 75, 50, 25, 0].map(p => (
            <div key={p} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-300 w-10 text-right">{fmtM(maxVal * p / 100)}</span>
              <div className="flex-1 border-t border-dashed border-slate-100" />
            </div>
          ))}
        </div>
        <div className="flex-1 flex items-end gap-2 h-full pl-14 pr-2">
          {data.map((d, i) => {
            const tripH = Math.round(((d.trip || 0) / maxVal) * 100);
            const timeH = Math.round(((d.time || 0) / maxVal) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center group relative justify-end h-full">
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg shadow-lg z-10 pointer-events-none">
                  {fmt(d.total || 0)} ₫
                </div>
                <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: '100%' }}>
                  <div className="w-full rounded-t bg-sky-400 transition-all duration-700" style={{ height: `${timeH}%` }} />
                  <div className="w-full rounded-b bg-indigo-500 transition-all duration-700" style={{ height: `${tripH}%` }} />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 mt-2">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Payment Method Breakdown ──────────────────────────────────────────────────
function PaymentBreakdown({ data, loading }: { data: any[]; loading: boolean }) {
  const total = data.reduce((s, m) => s + m.revenue, 0) || 1;
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
        <CreditCard size={18} className="text-emerald-500" /> Phương thức Thanh toán
      </h3>
      {loading ? (
        <div className="space-y-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : data.length === 0 ? (
        <p className="text-slate-400 text-sm text-center my-8">Chưa có dữ liệu</p>
      ) : (
        <div className="space-y-4">
          {data.map((m, i) => {
            const Icon = METHOD_ICONS[m.methodCode] || CreditCard;
            const color = METHOD_COLORS[m.methodCode] || PALETTE[i];
            const pct = Math.round((m.revenue / total) * 100);
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{m.method}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800">{fmtM(m.revenue)}₫</span>
                    <span className="text-xs text-slate-400 ml-2">{m.count} đơn</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Ticket Type Breakdown ─────────────────────────────────────────────────────
function TicketTypeChart({ data, loading }: { data: any[]; loading: boolean }) {
  const total = data.reduce((s, t) => s + t.count, 0) || 1;
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
        <Package size={18} className="text-amber-500" /> Cơ cấu Loại vé
      </h3>
      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : data.length === 0 ? (
        <p className="text-slate-400 text-sm text-center my-8">Chưa có dữ liệu</p>
      ) : (
        <div className="space-y-3">
          {data.map((t, i) => {
            const pct = Math.round((t.count / total) * 100);
            const color = PALETTE[i] || '#94a3b8';
            return (
              <div key={i} className="flex items-center gap-3 group hover:bg-slate-50 rounded-xl p-2 -mx-2 transition-colors cursor-default">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700 truncate">{t.name}</span>
                    <span className="text-xs font-bold text-slate-600 ml-2 shrink-0">{t.count} vé · {pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Top Routes ────────────────────────────────────────────────────────────────
function TopRoutes({ data, loading }: { data: any[]; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
        <MapPin size={18} className="text-rose-500" /> Tuyến phổ biến
      </h3>
      {loading ? (
        <div className="space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : data.length === 0 ? (
        <p className="text-slate-400 text-sm text-center my-8">Chưa có dữ liệu vé lượt</p>
      ) : (
        <div className="space-y-4">
          {data.map((r, i) => (
            <div key={i} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="text-sm font-medium text-slate-700 truncate max-w-55">{r.route}</span>
                </div>
                <span className="text-sm font-bold text-slate-800 ml-2 shrink-0">{r.count}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden ml-7">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${r.pct}%`, backgroundColor: i === 0 ? '#ef4444' : i === 1 ? '#f97316' : '#fbbf24' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Hourly Heatmap ────────────────────────────────────────────────────────────
function HourlyHeatmap({ data, loading }: { data: any[]; loading: boolean }) {
  const max = Math.max(...data.map(h => h.count), 1);
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
        <Activity size={18} className="text-violet-500" /> Nhiệt kế theo Giờ
      </h3>
      <p className="text-xs text-slate-400 mb-5">Lưu lượng hành khách hôm nay theo khung giờ</p>
      {loading ? (
        <div className="space-y-2">{Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-7" />)}</div>
      ) : (
        <div className="space-y-1.5">
          {data.map((h, i) => {
            const pct = (h.count / max) * 100;
            const intensity = pct > 70 ? '#6366f1' : pct > 40 ? '#818cf8' : '#c7d2fe';
            return (
              <div key={i} className="flex items-center gap-3 group">
                <span className="w-8 text-right text-[11px] font-bold text-slate-400">{h.hour}h</span>
                <div className="flex-1 h-5 bg-slate-50 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full rounded-lg transition-all duration-700 flex items-center"
                    style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: intensity }}
                  />
                </div>
                <span className="w-7 text-[11px] font-bold text-slate-600 tabular-nums">{h.count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Recent Transactions ───────────────────────────────────────────────────────
function RecentTransactions({ data, loading }: { data: any[]; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <ShoppingBag size={18} className="text-blue-500" /> Giao dịch gần nhất
        </h3>
        <span className="text-xs text-slate-400 font-medium">10 đơn mới nhất (toàn hệ thống)</span>
      </div>
      {loading ? (
        <div className="p-6 space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                {['Mã đơn', 'Khách hàng', 'Loại vé', 'Tuyến / Gói', 'Số tiền', 'Thanh toán', 'Thời gian'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((tx, i) => {
                const isTime = tx.type === 'time';
                const d = new Date(tx.time);
                const timeStr = `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
                return (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">{tx.id}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-semibold text-slate-800 truncate max-w-30 block">{tx.customer}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isTime ? 'bg-violet-50 text-violet-600 border-violet-100' : 'bg-sky-50 text-sky-600 border-sky-100'}`}>
                        {isTime ? 'Thời gian' : 'Lượt'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-slate-600 font-medium truncate max-w-45 block">{tx.route}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-sm text-slate-800 tabular-nums">{fmt(tx.amount)}₫</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${tx.method === 'Tiền mặt' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        {tx.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-slate-400 font-medium tabular-nums">{timeStr}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StatisticsPage() {
  const [range, setRange] = useState('7d');
  const [dates, setDates] = useState<Date[] | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API}/tickets/admin/full-stats?range=${range}`;
      if (range === 'custom' && dates && dates.length === 2 && dates[0] && dates[1]) {
        url += `&start=${dates[0].toISOString()}&end=${dates[1].toISOString()}`;
      } else if (range === 'custom') {
        // Wait until both dates are selected
        setLoading(false);
        return;
      }
      
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) { console.error(e); }
    finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [range, dates]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Normalize method code field from API
  const revenueByMethod = (data?.revenueByMethod || []).map((m: any) => ({
    ...m,
    methodCode: Object.keys(METHOD_COLORS).find(k =>
      m.method?.toLowerCase().includes(k.toLowerCase())
    ) || 'CASH'
  }));

  const s = data?.summary || {};

  return (
    <PageWrapper
      title="Thống Kê Vận Hành"
      description="Tổng hợp doanh thu, lưu lượng hành khách và hiệu suất toàn hệ thống BRT Hưng Yên theo thời gian thực."
      actions={
        <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
          {/* Custom Date Picker (shows when range is custom) */}
          {range === 'custom' && (
             <Calendar 
                value={dates} 
                onChange={(e: any) => setDates(e.value)} 
                selectionMode="range" 
                showTime 
                hourFormat="24"
                readOnlyInput 
                hideOnRangeSelection 
                placeholder="Chọn ngày và giờ bắt đầu - kết thúc"
                className="w-[320px]"
                pt={{
                   input: { className: 'h-10 text-xs font-semibold px-4 rounded-2xl border-slate-200' },
                   panel: { className: 'text-sm' }
                }}
             />
          )}

          {/* Range selector */}
          <div className="flex bg-white rounded-2xl p-1 gap-1 border border-slate-200 shadow-sm overflow-x-auto max-w-[90vw] md:max-w-none">
            {RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => {
                   setRange(r.value);
                   if (r.value !== 'custom') setDates(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${range === r.value ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {/* Refresh */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-2xl px-4 py-2.5 h-10 text-xs font-bold shadow-sm transition-all disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>
      }
    >
      {/* Last refresh */}
      <div className="flex items-center gap-1.5 mb-8 text-xs text-slate-400">
        <Zap size={12} className="text-amber-400" />
        <span>Cập nhật lúc: {isMounted && lastRefresh ? lastRefresh.toLocaleTimeString('vi-VN') : '--:--:--'}</span>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KPICard loading={loading} label="Tổng doanh thu" value={`${fmtM(s.totalRevenue || 0)}₫`}
          sub={`${fmt(s.totalOrders || 0)} đơn`} icon={DollarSign} color="#10b981" />
        <KPICard loading={loading} label="Số đơn hàng" value={fmt(s.totalOrders || 0)}
          sub="Tất cả loại vé" icon={ShoppingBag} color="#6366f1" />
        <KPICard loading={loading} label="Lượt vé bán ra" value={fmt(s.totalTicketItems || 0)}
          sub="Vé đơn lẻ" icon={Ticket} color="#0ea5e9" />
        <KPICard loading={loading} label="Khách hàng" value={fmt(s.totalUniqueUsers || 0)}
          sub="Lượt hành khách" icon={Users} color="#f59e0b" />
        <KPICard loading={loading} label="Giá trị TB/đơn" value={`${fmtM(s.avgOrderValue || 0)}₫`}
          sub="Trung bình đơn hàng" icon={BarChart3} color="#8b5cf6" />
      </div>

      {/* ── Row 2: Revenue Chart + Payment Methods ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RevenueChart data={data?.revenueByDay || []} loading={loading} />
        </div>
        <PaymentBreakdown data={revenueByMethod} loading={loading} />
      </div>

      {/* ── Row 3: Ticket Type + Top Routes + Hourly ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <TicketTypeChart data={data?.ticketTypeBreakdown || []} loading={loading} />
        <TopRoutes data={data?.topRoutes || []} loading={loading} />
        <HourlyHeatmap data={data?.hourlyHeatmap || []} loading={loading} />
      </div>

      {/* ── Row 4: Recent Transactions ─────────────────────────────────── */}
      <RecentTransactions data={data?.recentTransactions || []} loading={loading} />
    </PageWrapper>
  );
}
