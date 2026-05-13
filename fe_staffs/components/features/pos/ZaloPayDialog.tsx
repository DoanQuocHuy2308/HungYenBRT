"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog } from 'primereact/dialog';
import {
    CheckCircle2, XCircle, Loader2, Smartphone,
    Clock, RefreshCw, X, Copy, Check, ExternalLink, Shield, QrCode
} from 'lucide-react';

interface ZaloPayDialogProps {
    visible: boolean;
    onHide: () => void;
    orderId: string;
    /** Dữ liệu đơn đã tạo sẵn từ backend (tránh gọi API 2 lần) */
    preOrderData?: {
        cashier_order_url?: string;
        order_url?: string;
        qr_code?: string;
        app_trans_id?: string;
    };
    onSuccess: (ticketData: any) => void;
    onError?: (message: string) => void;
}

type Status = 'PENDING' | 'PAID' | 'FAILED' | 'TIMEOUT';

const POLL_MS    = 3000;          // polling mỗi 3 giây
const TIMEOUT_MS = 10 * 60 * 1000; // hết hạn sau 10 phút

export function ZaloPayDialog({
    visible, onHide, orderId, preOrderData, onSuccess, onError,
}: ZaloPayDialogProps) {
    const [status, setStatus]     = useState<Status>('PENDING');
    const [elapsed, setElapsed]   = useState(0);
    const [copied, setCopied]     = useState(false);
    const [errMsg, setErrMsg]     = useState('');

    const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startRef = useRef(0);

    const stopAll = useCallback(() => {
        if (pollRef.current)  { clearInterval(pollRef.current);  pollRef.current  = null; }
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }, []);

    // Polling trạng thái đơn hàng
    const pollStatus = useCallback(async () => {
        try {
            const r = await fetch(`http://localhost:3000/zalopay/query/${orderId}`);
            const d = await r.json();
            if (d.success && d.status === 'PAID') {
                stopAll();
                setStatus('PAID');
                setTimeout(() => { onSuccess(d.ticket); onHide(); }, 1500);
            } else if (d.status === 'FAILED') {
                stopAll();
                setStatus('FAILED');
                setErrMsg('Giao dịch thất bại hoặc bị huỷ.');
            }
        } catch { /* bỏ qua lỗi mạng khi polling */ }
    }, [orderId, onSuccess, onHide, stopAll]);

    useEffect(() => {
        if (!visible || !orderId) return;

        setStatus('PENDING');
        setElapsed(0);
        setErrMsg('');
        startRef.current = Date.now();

        // Bắt đầu polling
        pollRef.current  = setInterval(pollStatus, POLL_MS);

        // Đếm giây + kiểm tra timeout
        timerRef.current = setInterval(() => {
            const s = Math.floor((Date.now() - startRef.current) / 1000);
            setElapsed(s);
            if (Date.now() - startRef.current > TIMEOUT_MS) {
                stopAll();
                setStatus('TIMEOUT');
            }
        }, 1000);

        return () => stopAll();
    }, [visible, orderId]); // eslint-disable-line

    // Tính thời gian còn lại
    const remainSec = Math.max(0, TIMEOUT_MS / 1000 - elapsed);
    const mins      = String(Math.floor(remainSec / 60)).padStart(2, '0');
    const secs      = String(remainSec % 60).padStart(2, '0');
    const progress  = Math.min(100, (elapsed / (TIMEOUT_MS / 1000)) * 100);
    const timerColor = progress > 80 ? '#ef4444' : progress > 50 ? '#f59e0b' : '#3b82f6';

    // QR image từ chuỗi EMV của ZaloPay
    const qrData   = preOrderData?.qr_code || preOrderData?.order_url || '';
    const qrImgUrl = qrData
        ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}&color=0068FF&bgcolor=FFFFFF&qzone=2`
        : '';

    const appTransId = preOrderData?.app_trans_id || '';
    const openUrl    = preOrderData?.cashier_order_url || preOrderData?.order_url || '';

    const copyId = () => {
        if (appTransId) {
            navigator.clipboard.writeText(appTransId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Dialog
            visible={visible}
            onHide={() => { stopAll(); onHide(); }}
            header={null}
            style={{ width: '420px', padding: 0 }}
            pt={{
                root:    { className: 'rounded-3xl overflow-hidden border-none shadow-2xl shadow-blue-900/20' },
                mask:    { className: 'backdrop-blur-sm bg-slate-900/50' },
                content: { className: 'p-0' },
            }}
        >
            {/* ── Header gradient ─────────────────────────────────────────── */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0068FF 0%,#0096FF 60%,#00C2FF 100%)' }}>
                <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
                <div className="relative flex items-center justify-between px-5 pt-5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                            <span className="text-white font-black text-[11px]">ZLP</span>
                        </div>
                        <div>
                            <p className="text-white font-black text-sm">ZaloPay QC Sandbox</p>
                            <p className="text-blue-200 text-[10px] font-semibold">Dùng Devtool để giả lập thanh toán</p>
                        </div>
                    </div>
                    <button onClick={() => { stopAll(); onHide(); }}
                        className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                        <X size={15} />
                    </button>
                </div>
                {/* App trans ID dưới header */}
                {appTransId && (
                    <div className="relative px-5 pb-4">
                        <button onClick={copyId}
                            className="flex items-center gap-2 text-[10px] text-blue-200 hover:text-white transition-colors font-mono">
                            {copied ? <Check size={11} className="text-emerald-300" /> : <Copy size={11} />}
                            <span>{appTransId}</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white">
                {/* ── PENDING ─────────────────────────────────────────────── */}
                {status === 'PENDING' && (
                    <div className="px-5 py-5 space-y-4">
                        {/* Số tiền — lấy từ query param nếu có, dialog không nhận amount trực tiếp */}
                        {/* QR Code */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <div className="absolute -inset-2 rounded-3xl blur-xl opacity-20"
                                    style={{ background: 'linear-gradient(135deg,#0068FF,#00C2FF)' }} />
                                <div className="relative p-3 bg-white rounded-2xl border-2 border-blue-100 shadow-xl">
                                    {qrImgUrl ? (
                                        <img src={qrImgUrl} alt="ZaloPay QR" className="w-48 h-48 rounded-xl" />
                                    ) : (
                                        <div className="w-48 h-48 bg-blue-50 rounded-xl flex flex-col items-center justify-center gap-2">
                                            <QrCode size={32} className="text-blue-300" />
                                            <p className="text-[10px] text-blue-300 font-semibold">Đang tải QR...</p>
                                        </div>
                                    )}
                                    {/* Logo ZaloPay overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-9 h-9 rounded-lg border-2 border-white shadow-lg flex items-center justify-center"
                                            style={{ background: 'linear-gradient(135deg,#0068FF,#00B4FF)' }}>
                                            <span className="text-white font-black text-[9px]">ZLP</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pulse indicator */}
                            <div className="flex items-center gap-2">
                                <div className="relative w-2 h-2">
                                    <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75" />
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                </div>
                                <p className="text-xs text-slate-400 font-medium">Đang chờ xác nhận thanh toán...</p>
                            </div>
                        </div>

                        {/* Hướng dẫn sandbox */}
                        <div className="bg-amber-50 rounded-xl p-3 flex gap-2.5 border border-amber-100">
                            <Smartphone size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                <strong>Sandbox:</strong> Mở <strong>ZaloPay Devtool</strong> → mô phỏng thanh toán thành công để kích hoạt callback tự động.
                            </p>
                        </div>

                        {/* Nút mở devtool */}
                        {openUrl && (
                            <a href={openUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 hover:opacity-90"
                                style={{ background: 'linear-gradient(135deg,#0068FF,#00B4FF)' }}>
                                <ExternalLink size={14} /> Mở trang thanh toán (devtool)
                            </a>
                        )}

                        {/* Timer */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <span className="flex items-center gap-1.5"><Clock size={11} /> Hết hạn sau</span>
                                <span className={`font-black tabular-nums px-2 py-0.5 rounded-lg text-xs`}
                                    style={{ color: timerColor, background: `${timerColor}15` }}>
                                    {mins}:{secs}
                                </span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.max(1, 100 - progress)}%`, backgroundColor: timerColor }} />
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-300">
                            <Shield size={10} /> SSL 256-bit · Sandbox ZaloPay QC
                        </div>
                    </div>
                )}

                {/* ── PAID ────────────────────────────────────────────────── */}
                {status === 'PAID' && (
                    <div className="flex flex-col items-center py-12 gap-4 px-5">
                        <div className="relative">
                            <div className="absolute -inset-4 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />
                            <div className="relative w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center">
                                <CheckCircle2 size={36} className="text-emerald-500" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h4 className="text-lg font-black text-slate-800 mb-1">Thanh toán thành công!</h4>
                            <p className="text-sm text-slate-400">ZaloPay đã xác nhận · Đang xuất vé...</p>
                        </div>
                    </div>
                )}

                {/* ── FAILED / TIMEOUT ────────────────────────────────────── */}
                {(status === 'FAILED' || status === 'TIMEOUT') && (
                    <div className="flex flex-col items-center py-10 gap-4 px-5">
                        <div className="w-18 h-18 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center p-4">
                            <XCircle size={36} className="text-red-400" />
                        </div>
                        <div className="text-center">
                            <h4 className="text-base font-black text-slate-800 mb-1">
                                {status === 'TIMEOUT' ? 'Mã QR đã hết hạn' : 'Giao dịch thất bại'}
                            </h4>
                            <p className="text-sm text-slate-400">{errMsg || 'Vui lòng thử lại.'}</p>
                        </div>
                        <button onClick={() => { stopAll(); onHide(); }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95">
                            <RefreshCw size={13} /> Quay lại chọn phương thức
                        </button>
                    </div>
                )}
            </div>
        </Dialog>
    );
}
