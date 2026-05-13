"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, TrendingUp, Ticket, Users, DollarSign, Clock,
  MapPin, CreditCard, RefreshCw, Activity,
  Wallet, Banknote, Bus, QrCode, ShoppingBag, Package,
  Zap, ArrowUpRight
} from 'lucide-react';
import { Calendar } from 'primereact/calendar';
import { ticketService } from '../../../services/managementService';

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
  <div className={`bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse rounded-xl ${className}`} style={style} />
);

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, icon: Icon, color, loading }: any) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-xl hover:-translate-y-1 transition-all">
      {loading ? (
        <>
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
              <Icon size={28} style={{ color }} />
            </div>
          </div>
          <div>
            <p className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-2">{label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-2 font-medium">{sub}</p>}
          </div>
        </>
      )}
    </div>
  );
}

// ── Revenue Bar Chart ─────────────────────────────────────────────────────────
function RevenueChart({ data, loading }: { data: any[]; loading: boolean }) {
  if (loading) return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm h-[400px] flex flex-col gap-4">
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
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp size={22} className="text-amber-500" /> Xu hướng Doanh thu
          </h3>
          <p className="text-sm text-slate-400 mt-1">Vé lượt vs Vé thời gian</p>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-600 inline-block" /> Vé lượt</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-800 inline-block" /> Vé thời gian</span>
        </div>
      </div>
      <div className="flex items-end gap-2 h-[260px] relative">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[100, 75, 50, 25, 0].map(p => (
            <div key={p} className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-300 w-12 text-right">{fmtM(maxVal * p / 100)}</span>
              <div className="flex-1 border-t border-dashed border-slate-200" />
            </div>
          ))}
        </div>
        <div className="flex-1 flex items-end gap-3 h-full pl-16 pr-2">
          {data.map((d, i) => {
            const tripH = Math.round(((d.trip || 0) / maxVal) * 100);
            const timeH = Math.round(((d.time || 0) / maxVal) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center group relative justify-end h-full">
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl z-10 pointer-events-none">
                  {fmt(d.total || 0)} ₫
                </div>
                <div className="w-full flex flex-col gap-1 justify-end max-w-[40px]" style={{ height: '100%' }}>
                  <div className="w-full rounded-t-xl bg-slate-800 hover:brightness-110 transition-all duration-700 shadow-inner" style={{ height: `${timeH}%` }} />
                  <div className="w-full rounded-b-xl bg-amber-600 hover:brightness-110 transition-all duration-700 shadow-inner" style={{ height: `${tripH}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-400 mt-3">{d.day}</span>
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
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-full">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-8">
        <CreditCard size={22} className="text-emerald-500" /> Thanh toán
      </h3>
      {loading ? (
        <div className="space-y-6">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : data.length === 0 ? (
        <p className="text-slate-400 text-sm text-center my-10">Chưa có dữ liệu</p>
      ) : (
        <div className="space-y-6 flex-1 flex flex-col justify-center">
          {data.map((m, i) => {
            const Icon = METHOD_ICONS[m.methodCode] || CreditCard;
            const color = METHOD_COLORS[m.methodCode] || PALETTE[i];
            const pct = Math.round((m.revenue / total) * 100);
            return (
              <div key={i} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: `${color}18` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <span className="text-base font-bold text-slate-700">{m.method}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-slate-900">{fmtM(m.revenue)}₫</span>
                    <span className="text-xs font-bold text-slate-400 ml-2 bg-slate-50 px-2 py-0.5 rounded-md">{m.count} đơn</span>
                  </div>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden ml-13">
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

// ── Top Employees ─────────────────────────────────────────────────────────────
function TopEmployees({ data, loading }: { data: any[]; loading: boolean }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-full">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
        <Users size={22} className="text-teal-500" /> Top Nhân viên (Doanh thu)
      </h3>
      {loading ? (
        <div className="space-y-5">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : data.length === 0 ? (
        <p className="text-slate-400 text-sm text-center my-8">Chưa có dữ liệu</p>
      ) : (
        <div className="space-y-5 flex-1">
          {data.map((emp, i) => (
            <div key={i} className="flex items-center justify-between group p-3 -mx-3 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {emp.avatar ? (
                    <img src={emp.avatar.startsWith('http') ? emp.avatar : `http://localhost:3000${emp.avatar}`} className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {i === 0 && <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white">👑</div>}
                  {i === 1 && <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white">🥈</div>}
                  {i === 2 && <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-700 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white">🥉</div>}
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 truncate max-w-[150px]">{emp.name}</p>
                  <p className="text-xs text-slate-400 font-bold tracking-wider">{emp.orderCount} ĐƠN</p>
                </div>
              </div>
              <span className="text-lg font-black text-teal-600">{fmtM(emp.revenue)}₫</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Ticket Type Breakdown ─────────────────────────────────────────────────────
function TicketTypeChart({ data, loading }: { data: any[]; loading: boolean }) {
  const total = data.reduce((s, t) => s + t.count, 0) || 1;
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm h-full">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
        <Package size={22} className="text-indigo-500" /> Cơ cấu hình thức
      </h3>
      {loading ? (
        <div className="space-y-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : data.length === 0 ? (
        <p className="text-slate-400 text-sm text-center my-8">Chưa có dữ liệu</p>
      ) : (
        <div className="space-y-4 flex-1">
          {data.map((t, i) => {
            const pct = Math.round((t.count / total) * 100);
            const color = PALETTE[i] || '#94a3b8';
            return (
              <div key={i} className="flex items-center gap-4 group hover:bg-slate-50 rounded-2xl p-3 -mx-3 transition-colors cursor-default">
                <div className="w-4 h-4 rounded-full flex-shrink-0 shadow-inner" style={{ backgroundColor: color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base font-bold text-slate-700 truncate">{t.name}</span>
                    <span className="text-sm font-black text-slate-900 ml-2 flex-shrink-0">{t.count} vé <span className="text-slate-400 text-xs ml-1 font-semibold">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
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
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm h-full">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
        <MapPin size={22} className="text-rose-500" /> Tuyến vé lượt phổ biến
      </h3>
      {loading ? (
        <div className="space-y-5">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : data.length === 0 ? (
        <p className="text-slate-400 text-sm text-center my-8">Chưa có dữ liệu vé lượt</p>
      ) : (
        <div className="space-y-5 flex-1">
          {data.map((r, i) => (
            <div key={i} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-slate-100 text-slate-600 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <span className="text-sm font-bold text-slate-700 truncate max-w-[200px] xl:max-w-[260px]">{r.route}</span>
                </div>
                <span className="text-base font-black text-slate-900 ml-2 flex-shrink-0">{r.count}</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden ml-9">
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
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm h-full">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
        <Activity size={22} className="text-violet-500" /> Lưu lượng theo giờ
      </h3>
      <p className="text-sm text-slate-400 mb-6 font-medium">Lưu lượng hành khách trong ngày theo khung giờ</p>
      {loading ? (
        <div className="space-y-3">{Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
      ) : (
        <div className="space-y-2 flex-1">
          {data.map((h, i) => {
            const pct = (h.count / max) * 100;
            const intensity = pct > 70 ? '#6366f1' : pct > 40 ? '#818cf8' : '#c7d2fe';
            return (
              <div key={i} className="flex items-center gap-4 group">
                <span className="w-10 text-right text-sm font-bold text-slate-400">{h.hour}h</span>
                <div className="flex-1 h-6 bg-slate-50 rounded-xl overflow-hidden relative">
                  <div
                    className="h-full rounded-xl transition-all duration-700 flex items-center"
                    style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: intensity }}
                  />
                </div>
                <span className="w-10 text-sm font-black text-slate-700 tabular-nums">{h.count}</span>
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
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-8 border-b border-slate-50">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShoppingBag size={22} className="text-blue-500" /> Giao dịch gần đây
        </h3>
        <span className="text-sm text-slate-400 font-bold bg-slate-50 px-3 py-1 rounded-lg">Top 10 mới nhất</span>
      </div>
      {loading ? (
        <div className="p-8 space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="overflow-x-auto p-4">
          <table className="w-full">
            <thead>
              <tr>
                {['Mã đơn', 'Khách hàng', 'Loại vé', 'Tuyến / Gói', 'Số tiền', 'Thanh toán', 'Thời gian'].map(h => (
                  <th key={h} className="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((tx, i) => {
                const isTime = tx.type === 'time';
                const d = new Date(tx.time);
                const timeStr = `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
                return (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm font-bold text-slate-700 bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg">{tx.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-base font-bold text-slate-900 truncate max-w-[150px] block">{tx.customer}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black border ${isTime ? 'bg-violet-50 text-violet-700 border-violet-100' : 'bg-sky-50 text-sky-700 border-sky-100'}`}>
                        {isTime ? 'Thời gian' : 'Lượt'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-600 font-bold truncate max-w-[220px] block">{tx.route}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-black text-base text-slate-900 tabular-nums">{fmt(tx.amount)}₫</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${tx.method === 'Tiền mặt' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        {tx.method}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-500 font-bold tabular-nums">{timeStr}</span>
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
      let params: any = { range };
      if (range === 'custom' && dates && dates.length === 2 && dates[0] && dates[1]) {
        params.start = dates[0].toISOString();
        params.end = dates[1].toISOString();
      } else if (range === 'custom') {
        setLoading(false);
        return;
      }
      
      const res: any = await ticketService.getFullStats(params);
      if (res.success) setData(res.data);
    } catch (e) { console.error(e); }
    finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [range, dates]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const revenueByMethod = (data?.revenueByMethod || []).map((m: any) => ({
    ...m,
    methodCode: Object.keys(METHOD_COLORS).find(k =>
      m.method?.toLowerCase().includes(k.toLowerCase())
    ) || 'CASH'
  }));

  const s = data?.summary || {};

  return (
    <div className="space-y-8">
      {/* ── Header Area ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Thống Kê Nâng Cao</h1>
          <div className="flex items-center gap-2 mt-2">
            <Zap size={16} className="text-amber-500" />
            <p className="text-sm font-bold text-slate-400">
              Dữ liệu cập nhật real-time lúc: {isMounted && lastRefresh ? lastRefresh.toLocaleTimeString('vi-VN') : '--:--:--'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Custom Date Picker */}
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
                   input: { className: 'h-12 text-sm font-bold px-5 rounded-2xl border-slate-200 shadow-sm focus:ring-amber-500' },
                   panel: { className: 'text-sm shadow-xl rounded-2xl border-none' }
                }}
             />
          )}

          {/* Range selector */}
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner overflow-x-auto">
            {RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => {
                   setRange(r.value);
                   if (r.value !== 'custom') setDates(null);
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${range === r.value ? 'bg-white text-amber-700 shadow-md ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-black rounded-2xl px-6 py-3 text-sm font-bold shadow-xl shadow-slate-900/20 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard loading={loading} label="Tổng doanh thu" value={`${fmtM(s.totalRevenue || 0)}₫`}
          sub={`${fmt(s.totalOrders || 0)} đơn hàng`} icon={DollarSign} color="#10b981" />
        <KPICard loading={loading} label="Lượt vé xuất" value={fmt(s.totalTicketItems || 0)}
          sub="Hành khách" icon={Ticket} color="#3b82f6" />
        <KPICard loading={loading} label="Khách mua hàng" value={fmt(s.totalUniqueUsers || 0)}
          sub="Khách độc lập" icon={Users} color="#f59e0b" />
        <KPICard loading={loading} label="TB / Đơn hàng" value={`${fmtM(s.avgOrderValue || 0)}₫`}
          sub="Giá trị trung bình" icon={BarChart3} color="#8b5cf6" />
      </div>

      {/* ── Row 2: Revenue Chart + Top Employees ──────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart data={data?.revenueByDay || []} loading={loading} />
        </div>
        <TopEmployees data={data?.topEmployees || []} loading={loading} />
      </div>

      {/* ── Row 3: Payment + TicketType + TopRoutes + Hourly ──────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <PaymentBreakdown data={revenueByMethod} loading={loading} />
        <TicketTypeChart data={data?.ticketTypeBreakdown || []} loading={loading} />
        <TopRoutes data={data?.topRoutes || []} loading={loading} />
        <HourlyHeatmap data={data?.hourlyHeatmap || []} loading={loading} />
      </div>

      {/* ── Row 4: Recent Transactions ─────────────────────────────────── */}
      <RecentTransactions data={data?.recentTransactions || []} loading={loading} />
    </div>
  );
}
