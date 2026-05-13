"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Printer, ArrowLeft, Ticket, RefreshCw } from 'lucide-react';
import QRCode from 'react-qr-code';

/* ─── Types ──────────────────────────────────────────────────────────────── */
type PageStatus = 'verifying' | 'success' | 'failed' | 'cancelled';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

/* ─── Main content (needs useSearchParams → must be in Suspense) ─────────── */
function ReturnContent() {
    const router       = useRouter();
    const sp           = useSearchParams();

    const [status, setStatus]       = useState<PageStatus>('verifying');
    const [step, setStep]           = useState('Đang xác thực giao dịch...');
    const [ticket, setTicket]       = useState<any>(null);
    const [errMsg, setErrMsg]       = useState('');
    const [amount, setAmount]       = useState(0);
    const [departure, setDeparture] = useState('');
    const [destination, setDest]    = useState('');
    const [transId, setTransId]     = useState('');

    useEffect(() => {
        const run = async () => {
            // ── 1. Đọc params từ ZaloPay redirect ────────────────────────────
            const zlpStatus      = sp.get('status')         || '';
            const apptransid     = sp.get('apptransid')     || '';
            const pmcid          = sp.get('pmcid')          || '';
            const bankcode       = sp.get('bankcode')       || '';
            const zlpAmount      = sp.get('amount')         || '0';
            const discountamount = sp.get('discountamount') || '0';
            const checksum       = sp.get('checksum')       || '';

            setTransId(apptransid);

            // ── 2. Đọc session data (đã lưu trước khi redirect) ───────────
            const orderId    = sessionStorage.getItem('zlp_order_id') || '';
            const payloadStr = sessionStorage.getItem('zlp_payload')  || '';
            const savedAmt   = sessionStorage.getItem('zlp_amount')   || '0';
            const savedDep   = sessionStorage.getItem('zlp_departure')  || '';
            const savedDest  = sessionStorage.getItem('zlp_destination') || '';

            setAmount(Number(savedAmt));
            setDeparture(savedDep);
            setDest(savedDest);

            // ── 3. ZaloPay huỷ / lỗi ─────────────────────────────────────
            if (zlpStatus !== '1') {
                setStatus('cancelled');
                setErrMsg('Thanh toán bị huỷ. Vui lòng thử lại.');
                return;
            }

            // ── 4. Gọi backend verify-return (xác thực checksum phía server) ─
            setStep('Đang xác minh chữ ký bảo mật...');
            try {
                const verRes = await fetch('http://localhost:3000/zalopay/verify-return', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: zlpStatus,
                        apptransid,
                        pmcid,
                        bankcode,
                        amount:         zlpAmount,
                        discountamount,
                        checksum,
                        orderId,        // để backend tra pending orders
                    }),
                });
                const verData = await verRes.json();

                if (!verData.success) {
                    setStatus('failed');
                    setErrMsg(verData.message || 'Xác minh thất bại');
                    return;
                }

                // ── 5. Thành công ─────────────────────────────────────────
                setStep('Xuất vé thành công!');
                setTicket(verData.ticket);
                setStatus('success');

                // Xóa session
                ['zlp_order_id','zlp_payload','zlp_amount','zlp_departure','zlp_destination']
                    .forEach(k => sessionStorage.removeItem(k));

            } catch (err: any) {
                setStatus('failed');
                setErrMsg('Lỗi kết nối máy chủ: ' + err.message);
            }
        };
        run();
    }, []); // eslint-disable-line

    /* ── VERIFYING ─────────────────────────────────────────────────────────── */
    if (status === 'verifying') {
        return (
            <div className="flex flex-col items-center gap-8 max-w-sm text-center">
                {/* Animated logo */}
                <div className="relative w-28 h-28">
                    <div className="absolute inset-0 rounded-3xl opacity-30 animate-ping"
                        style={{ background: 'linear-gradient(135deg,#0068FF,#00C2FF)' }} />
                    <div className="absolute inset-0 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40"
                        style={{ background: 'linear-gradient(135deg,#0068FF,#00B4FF)' }}>
                        <span className="text-white font-black text-2xl tracking-tight">ZLP</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-800">Đang xử lý...</h2>
                    <p className="text-sm text-slate-400 font-medium">{step}</p>
                </div>
                <div className="flex gap-2">
                    {[0, 0.2, 0.4].map((d, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-bounce"
                            style={{ animationDelay: `${d}s` }} />
                    ))}
                </div>
            </div>
        );
    }

    /* ── SUCCESS ───────────────────────────────────────────────────────────── */
    if (status === 'success') {
        const tickets = ticket?.details || (ticket ? [ticket] : []);
        return (
            <div className="w-full max-w-md space-y-5">
                {/* Header */}
                <div className="text-center">
                    <div className="relative inline-flex mb-4">
                        <div className="absolute -inset-4 rounded-full bg-emerald-400/20 blur-2xl" />
                        <div className="relative w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center">
                            <CheckCircle2 size={44} className="text-emerald-500" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">Thanh toán thành công!</h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">Vé đã được kích hoạt · ZaloPay đã xác nhận</p>
                </div>

                {/* Summary card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    {/* Route */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 text-center">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-0.5">Ga đi</p>
                            <p className="font-black text-slate-800 text-sm">{departure || '—'}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="h-px w-12 bg-gradient-to-r from-blue-300 to-blue-500" />
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <div className="h-px w-12 bg-gradient-to-r from-blue-500 to-blue-300" />
                        </div>
                        <div className="flex-1 text-center">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-0.5">Ga đến</p>
                            <p className="font-black text-slate-800 text-sm">{destination || '—'}</p>
                        </div>
                    </div>
                    <div className="h-px bg-slate-100" />
                    {/* Amount + method */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-0.5">Đã thanh toán</p>
                            <p className="text-2xl font-black text-blue-600 tabular-nums">{fmt(amount)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-1">Phương thức</p>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                                style={{ background: 'linear-gradient(135deg,#0068FF,#00B4FF)' }}>
                                <span className="text-white font-black text-xs">ZaloPay</span>
                            </div>
                        </div>
                    </div>
                    {transId && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="text-[10px] text-slate-400">Mã giao dịch</span>
                            <span className="text-[10px] text-slate-600 font-mono font-bold">{transId}</span>
                        </div>
                    )}
                </div>

                {/* Ticket QR codes */}
                {tickets.length > 0 ? (
                    <div className="space-y-4">
                        {tickets.map((t: any, i: number) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <Ticket size={12} /> Vé lượt #{i + 1}
                                    </span>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Sẵn sàng</span>
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-inner">
                                        <QRCode value={t.Id || t.id || `ticket-${i}`} size={180} fgColor="#0F172A" bgColor="#FFFFFF" />
                                    </div>
                                </div>
                                <p className="text-center text-[9px] text-slate-300 font-mono mt-3 tracking-widest">
                                    {t.Id || t.id}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                        <p className="text-sm text-amber-700 font-semibold">
                            Thanh toán xác nhận thành công. Vé sẽ được xử lý trong vài giây.
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pb-6">
                    <button onClick={() => window.print()}
                        className="flex-1 flex items-center justify-center gap-2 h-12 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 active:scale-95 transition-all shadow-lg">
                        <Printer size={16} /> In vé
                    </button>
                    <button onClick={() => router.push('/single-ticket')}
                        className="flex-1 flex items-center justify-center gap-2 h-12 border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 active:scale-95 transition-all">
                        <ArrowLeft size={16} /> Bán vé tiếp
                    </button>
                </div>
            </div>
        );
    }

    /* ── CANCELLED / FAILED ────────────────────────────────────────────────── */
    return (
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: status === 'cancelled' ? '#FFF7ED' : '#FEF2F2',
                         border: `4px solid ${status === 'cancelled' ? '#FED7AA' : '#FECACA'}` }}>
                <XCircle size={44} className={status === 'cancelled' ? 'text-amber-400' : 'text-red-400'} />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800">
                    {status === 'cancelled' ? 'Đã huỷ thanh toán' : 'Xác minh thất bại'}
                </h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">{errMsg}</p>
            </div>
            <div className="flex flex-col gap-3 w-full">
                <button onClick={() => router.push('/single-ticket')}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
                    style={{ background: 'linear-gradient(135deg,#0068FF,#00B4FF)' }}>
                    <ArrowLeft size={16} /> Quay về bán vé
                </button>
                <button onClick={() => window.history.back()}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all">
                    <RefreshCw size={14} /> Thử lại
                </button>
            </div>
        </div>
    );
}

/* ─── Page wrapper ─────────────────────────────────────────────────────────── */
export default function ZaloPayReturnPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col items-center justify-center p-6">
            {/* Header bar */}
            <div className="fixed top-0 left-0 right-0 h-1"
                style={{ background: 'linear-gradient(90deg,#0068FF,#00C2FF,#0068FF)' }} />

            <Suspense fallback={
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl animate-pulse"
                        style={{ background: 'linear-gradient(135deg,#0068FF,#00B4FF)' }} />
                    <p className="text-sm text-slate-400 font-medium">Đang tải...</p>
                </div>
            }>
                <ReturnContent />
            </Suspense>

            {/* Footer */}
            <div className="fixed bottom-4 text-center">
                <p className="text-[10px] text-slate-300 font-medium">
                    Được xử lý bảo mật bởi ZaloPay · Hưng Yên BRT
                </p>
            </div>
        </div>
    );
}
