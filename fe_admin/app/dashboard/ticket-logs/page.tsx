"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import {
    History, Search, RefreshCw, LogIn, LogOut,
    ScanLine, MapPin, MonitorSmartphone, AlertTriangle,
    CheckCircle2, Filter, XCircle, Ticket, Download, Eye, Clock
} from 'lucide-react';
import { ticketLogService } from '../../../services/managementService';

const DIRECTION_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    ENTRY: { label: 'Vào trạm', icon: LogIn,    color: 'text-emerald-700', bg: 'bg-emerald-50' },
    EXIT:  { label: 'Ra trạm',  icon: LogOut,   color: 'text-rose-700',    bg: 'bg-rose-50' },
    CHECK: { label: 'Soát vé',  icon: ScanLine, color: 'text-blue-700',    bg: 'bg-blue-50' },
};

const STATUS_CONFIG: Record<string, { label: string; severity: "success" | "warning" | "danger" | "info" | "secondary" }> = {
    valid:           { label: 'Hợp lệ',       severity: 'success' },
    invalid_station: { label: 'Sai trạm',     severity: 'warning' },
    expired:         { label: 'Hết hạn',      severity: 'danger' },
    over_zone:       { label: 'Vượt vùng',    severity: 'warning' },
    invalid:         { label: 'Không hợp lệ', severity: 'danger' },
};

export default function TicketLogsPage() {
    const toast = useRef<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, entry: 0, exit: 0, check: 0, valid: 0, invalid: 0, surcharge: 0 });
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage]   = useState(1);
    const LIMIT = 50;

    // Filters
    const [search,    setSearch]    = useState('');
    const [direction, setDirection] = useState('');
    const [status,    setStatus]    = useState('');
    const [dateFrom,  setDateFrom]  = useState<Date | null>(null);
    const [dateTo,    setDateTo]    = useState<Date | null>(null);
    const [showFilter, setShowFilter] = useState(false);

    // Detail dialog
    const [detailLog, setDetailLog] = useState<any>(null);

    const showToast = (s: 'success' | 'error', sum: string, d: string) =>
        toast.current?.show({ severity: s, summary: sum, detail: d, life: 3000 });

    const toDateStr = (d: Date | null) => d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0] : undefined;

    const fetchStats = useCallback(async () => {
        try {
            const res: any = await ticketLogService.getStats({
                date_from: toDateStr(dateFrom) as any,
                date_to:   toDateStr(dateTo) as any,
            });
            setStats(res?.data || res || {});
        } catch { /* ignore stats error */ }
    }, [dateFrom, dateTo]);

    const fetchData = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const res: any = await ticketLogService.getAll({
                scan_direction: direction || undefined,
                status: status || undefined,
                date_from: toDateStr(dateFrom) as any,
                date_to:   toDateStr(dateTo) as any,
                page: p, limit: LIMIT,
            });
            setLogs(res?.data || []);
            setTotal(res?.total || 0);
            setPage(p);
        } catch {
            showToast('error', 'Lỗi', 'Không thể tải nhật ký soát vé');
        } finally {
            setLoading(false);
        }
    }, [direction, status, dateFrom, dateTo]);

    useEffect(() => {
        const interval = setInterval(() => { fetchData(page); fetchStats(); }, 30000);
        return () => clearInterval(interval);
    }, [fetchData, fetchStats, page]);

    useEffect(() => { fetchData(1); fetchStats(); }, [fetchData, fetchStats]);

    const filteredLogs = logs.filter(l => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            l.Id_Ticket?.toLowerCase().includes(s) ||
            l.location?.Name?.toLowerCase().includes(s) ||
            l.device_id?.toLowerCase().includes(s) ||
            l.Id?.toString().includes(s)
        );
    });

    const clearFilters = () => {
        setDirection(''); setStatus(''); setDateFrom(null); setDateTo(null); setSearch('');
    };
    const hasFilter = direction || status || dateFrom || dateTo;

    const exportCSV = () => {
        const header = ['ID Log', 'ID Vé', 'Chiều quét', 'Trạng thái', 'Trạm', 'Thiết bị', 'Phụ thu', 'Thời gian'];
        const rows = filteredLogs.map(l => [
            l.Id, l.Id_Ticket, l.scan_direction, l.status,
            l.location?.Name || '', l.device_id || '', l.surcharge_amount || 0, new Date(l.scan_time).toLocaleString('vi-VN')
        ]);
        const csv = [header, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'ticket_logs.csv'; a.click();
    };

    // ── Table Templates ──────────────────────────────────────────────────────
    const ticketTemplate = (row: any) => (
        <div>
            <p className="font-mono font-bold text-slate-800 text-xs">#{row.Id_Ticket?.split('-')[0]?.toUpperCase() || row.Id_Ticket}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Log ID: {row.Id}</p>
        </div>
    );

    const directionTemplate = (row: any) => {
        const cfg = DIRECTION_CONFIG[row.scan_direction] || { label: row.scan_direction, icon: ScanLine, color: 'text-slate-700', bg: 'bg-slate-100' };
        const Icon = cfg.icon;
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${cfg.bg} ${cfg.color}`}>
                <Icon size={12} />
                <span className="text-[11px] font-semibold">{cfg.label}</span>
            </div>
        );
    };

    const locationTemplate = (row: any) => (
        <div>
            <p className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <MapPin size={12} className="text-slate-400" />
                {row.location?.Name || '—'}
            </p>
            {row.device_id && (
                <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <MonitorSmartphone size={10} /> {row.device_id}
                </p>
            )}
        </div>
    );

    const statusTemplate = (row: any) => {
        const key = row.status?.toLowerCase();
        const cfg = STATUS_CONFIG[key] || { label: row.status, severity: 'secondary' };
        return (
            <div className="flex flex-col items-start gap-1">
                <Tag severity={cfg.severity} value={cfg.label} className="text-[10px]" />
                {row.surcharge_amount > 0 && (
                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        Phạt: {row.surcharge_amount.toLocaleString('vi-VN')}₫
                    </span>
                )}
            </div>
        );
    };

    const timeTemplate = (row: any) => {
        const d = new Date(row.scan_time);
        return (
            <div>
                <p className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" />
                    {d.toLocaleTimeString('vi-VN')}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 ml-4">
                    {d.toLocaleDateString('vi-VN')}
                </p>
            </div>
        );
    };

    const actionTemplate = (row: any) => (
        <Button
            icon={<Eye size={14} />}
            label="Chi tiết"
            className="p-button-sm p-button-text p-button-secondary text-xs font-semibold px-2 py-1"
            onClick={() => setDetailLog(row)}
        />
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <Toast ref={toast} position="top-right" />

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-slate-900">Nhật Ký Soát Vé</h1>
                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Live
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">Theo dõi thời gian thực giao dịch soát vé vào/ra và các lỗi phát sinh.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        label="Xuất CSV"
                        icon={<Download size={14} />}
                        onClick={exportCSV}
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold"
                    />
                    <Button
                        label="Làm mới"
                        icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
                        onClick={() => { fetchData(1); fetchStats(); }}
                        className="bg-slate-900 border-none text-white text-sm font-semibold"
                    />
                </div>
            </div>

            {/* ── Summary Stats ──────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                {[
                    { label: 'Tổng quét', value: stats.total, color: 'text-slate-900', border: 'border-slate-200' },
                    { label: 'Vào trạm',  value: stats.entry, color: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50/50' },
                    { label: 'Ra trạm',   value: stats.exit,  color: 'text-rose-700',    border: 'border-rose-200',    bg: 'bg-rose-50/50' },
                    { label: 'Soát vé',   value: stats.check, color: 'text-blue-700',    border: 'border-blue-200',    bg: 'bg-blue-50/50' },
                    { label: 'Hợp lệ',    value: stats.valid, color: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50/50' },
                    { label: 'Lỗi',       value: stats.invalid, color: 'text-rose-700',  border: 'border-rose-200',    bg: 'bg-rose-50/50' },
                    { label: 'Phụ thu',   value: `${(stats.surcharge || 0).toLocaleString('vi-VN')}₫`, color: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50/50' },
                ].map((s, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${s.border} ${s.bg || 'bg-white'} shadow-sm`}>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{s.label}</p>
                        <p className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Main Panel ─────────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                
                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50">
                    <div className="relative flex-1 max-w-sm">
                        <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <InputText
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm mã vé, tên trạm..."
                            className="w-full pl-8 py-2 text-sm border-slate-200 rounded-lg"
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        <Dropdown
                            value={direction}
                            onChange={e => setDirection(e.value)}
                            options={[
                                { label: 'Tất cả chiều', value: '' },
                                { label: 'Vào trạm', value: 'ENTRY' },
                                { label: 'Ra trạm',  value: 'EXIT' },
                                { label: 'Soát vé',  value: 'CHECK' },
                            ]}
                            className="text-sm w-36"
                            pt={{ root: { className: 'border-slate-200 rounded-lg h-9 flex items-center' } }}
                        />
                        <Dropdown
                            value={status}
                            onChange={e => setStatus(e.value)}
                            options={[
                                { label: 'Mọi trạng thái', value: '' },
                                { label: 'Hợp lệ',        value: 'valid' },
                                { label: 'Sai trạm',       value: 'invalid_station' },
                                { label: 'Hết hạn',        value: 'expired' },
                                { label: 'Vượt vùng',      value: 'over_zone' },
                            ]}
                            className="text-sm w-40"
                            pt={{ root: { className: 'border-slate-200 rounded-lg h-9 flex items-center' } }}
                        />
                        <Button
                            icon={<Filter size={14} className="mr-1.5" />}
                            label="Khoảng thời gian"
                            onClick={() => setShowFilter(!showFilter)}
                            className={`px-3 py-2 text-sm font-semibold rounded-lg border transition-colors ${showFilter || dateFrom || dateTo ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        />
                        {hasFilter && (
                            <Button
                                icon={<XCircle size={14} className="mr-1.5" />}
                                label="Xóa lọc"
                                onClick={clearFilters}
                                className="px-3 py-2 text-sm font-semibold rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                            />
                        )}
                    </div>
                </div>

                {/* Date Panel */}
                {showFilter && (
                    <div className="flex items-end gap-3 p-4 bg-slate-50/50 border-b border-slate-100">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-600">Từ ngày</label>
                            <Calendar value={dateFrom} onChange={e => setDateFrom(e.value as Date)} dateFormat="dd/mm/yy" placeholder="Chọn ngày" className="w-40 text-sm" inputClassName="py-2 rounded-lg border-slate-200 text-sm" showIcon />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-600">Đến ngày</label>
                            <Calendar value={dateTo} onChange={e => setDateTo(e.value as Date)} dateFormat="dd/mm/yy" placeholder="Chọn ngày" className="w-40 text-sm" inputClassName="py-2 rounded-lg border-slate-200 text-sm" showIcon />
                        </div>
                        <Button
                            label="Áp dụng"
                            onClick={() => { fetchData(1); fetchStats(); setShowFilter(false); }}
                            className="bg-slate-900 border-none text-white text-sm font-semibold px-4 h-9 rounded-lg"
                        />
                    </div>
                )}

                {/* Data Table */}
                <DataTable
                    value={filteredLogs}
                    loading={loading}
                    rowHover
                    className="text-sm"
                    emptyMessage="Không tìm thấy nhật ký soát vé nào."
                >
                    <Column header="Mã Vé"         body={ticketTemplate}    style={{ width: '16%' }} />
                    <Column header="Chiều Quét"    body={directionTemplate} style={{ width: '14%' }} />
                    <Column header="Trạm / Thiết bị" body={locationTemplate}  style={{ width: '25%' }} />
                    <Column header="Trạng thái"    body={statusTemplate}    style={{ width: '18%' }} />
                    <Column header="Thời gian"     body={timeTemplate}      style={{ width: '17%' }} />
                    <Column header=""              body={actionTemplate}    style={{ width: '10%' }} align="right" />
                </DataTable>

                {/* Pagination */}
                {total > LIMIT && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
                        <span className="text-xs text-slate-500 font-medium">
                            Đang xem {(page - 1) * LIMIT + 1} – {Math.min(page * LIMIT, total)} trên tổng {total}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button label="Trang trước" icon="pi pi-chevron-left" className="p-button-text p-button-sm text-slate-600 font-semibold" disabled={page <= 1} onClick={() => fetchData(page - 1)} />
                            <span className="px-3 py-1 bg-slate-100 rounded text-xs font-bold text-slate-700">{page}</span>
                            <Button label="Trang sau" icon="pi pi-chevron-right" iconPos="right" className="p-button-text p-button-sm text-slate-600 font-semibold" disabled={page * LIMIT >= total} onClick={() => fetchData(page + 1)} />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Detail Dialog ──────────────────────────────────── */}
            <Dialog
                header={
                    <div className="flex items-center gap-2">
                        <ScanLine size={18} className="text-slate-600" />
                        <span className="font-bold text-slate-900 text-base">Chi tiết quét vé #{detailLog?.Id}</span>
                    </div>
                }
                visible={!!detailLog}
                onHide={() => setDetailLog(null)}
                style={{ width: '450px' }}
                modal
                className="font-sans"
                pt={{ content: { className: 'p-6 pt-2' } }}
            >
                {detailLog && (
                    <div className="space-y-4">
                        {/* Status Alert */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border ${detailLog.status === 'valid' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                            <div className="flex items-center gap-3">
                                {detailLog.status === 'valid' ? <CheckCircle2 size={24} className="text-emerald-600" /> : <AlertTriangle size={24} className="text-rose-600" />}
                                <div>
                                    <p className={`font-bold text-sm ${detailLog.status === 'valid' ? 'text-emerald-800' : 'text-rose-800'}`}>
                                        {STATUS_CONFIG[detailLog.status?.toLowerCase()]?.label || detailLog.status}
                                    </p>
                                    <p className={`text-xs ${detailLog.status === 'valid' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {DIRECTION_CONFIG[detailLog.scan_direction]?.label || detailLog.scan_direction}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-slate-800 text-sm">{new Date(detailLog.scan_time).toLocaleTimeString('vi-VN')}</p>
                                <p className="text-xs text-slate-500">{new Date(detailLog.scan_time).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>

                        {/* Details List */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            {[
                                { label: 'Mã vé', value: <span className="font-mono text-slate-800">{detailLog.Id_Ticket}</span> },
                                { label: 'Loại vé', value: detailLog.ticket?.ticket_type?.name || '—' },
                                { label: 'Tình trạng vé hiện tại', value: <Tag severity={STATUS_CONFIG[detailLog.ticket?.status?.toLowerCase()]?.severity || 'info'} value={detailLog.ticket?.status || '—'} className="text-[10px]" /> },
                                { label: 'Trạm quét', value: detailLog.location?.Name || '—' },
                                { label: 'Thiết bị quét', value: <span className="font-mono text-slate-600">{detailLog.device_id || 'Không có'}</span> },
                                { label: 'Phụ thu phát sinh', value: detailLog.surcharge_amount > 0 ? <span className="text-rose-600 font-bold">{detailLog.surcharge_amount.toLocaleString('vi-VN')}₫</span> : 'Không' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between py-3 px-4 border-b border-slate-100 last:border-0 bg-white">
                                    <span className="text-xs font-medium text-slate-500">{item.label}</span>
                                    <span className="text-sm text-slate-900 text-right">{item.value}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="pt-2 flex justify-end">
                            <Button label="Đóng" severity="secondary" outlined className="px-6 py-2 text-sm font-semibold" onClick={() => setDetailLog(null)} />
                        </div>
                    </div>
                )}
            </Dialog>

            <style>{`
                .p-datatable-thead > tr > th { background: #f8fafc !important; font-size: 11px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.06em !important; color: #64748b !important; padding: 0.8rem 1rem !important; border-bottom: 1px solid #e2e8f0 !important; }
                .p-datatable-tbody > tr > td { padding: 0.8rem 1rem !important; border-bottom: 1px solid #f1f5f9 !important; font-size: 13px !important; }
                .p-datatable-tbody > tr:hover > td { background: #f8fafc !important; }
            `}</style>
        </div>
    );
}
