"use client";

import React from 'react';
import {
    CheckCircle, AlertTriangle, RefreshCw, ArrowRight,
    MapPin, CreditCard, User, Banknote, ScanLine, Zap, XCircle, PenLine, Clock
} from 'lucide-react';

interface AdjustmentDetailsProps {
    scanState: string;
    ticketData: any | null;
    ticketMatch: "correct" | "wrong" | "monthly" | null;
    currentStation: string;
    onUpdateClick: () => void;
    onReset: () => void;
}

export const AdjustmentDetails: React.FC<AdjustmentDetailsProps> = ({
    scanState,
    ticketData,
    ticketMatch,
    currentStation,
    onUpdateClick,
    onReset
}) => {
    // ─── Idle State ──────────────────────────────────────────────────────────
    if (scanState === "idle") {
        return (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                    <ScanLine size={36} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">Chờ quét mã vé</h3>
                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                    Đưa mã QR vào vùng quét hoặc nhập mã thủ công để kiểm tra thông tin hành trình.
                </p>
            </div>
        );
    }

    // ─── Scanning State ───────────────────────────────────────────────────────
    if (scanState === "scanning") {
        return (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-6 animate-pulse">
                    <Zap size={36} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">Đang xác thực</h3>
                <p className="text-sm text-slate-400">Đang truy vấn dữ liệu trung tâm...</p>
            </div>
        );
    }

    // ─── Not Found State ──────────────────────────────────────────────────────
    if (scanState === "not-found") {
        return (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mb-6">
                    <XCircle size={36} className="text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Không tìm thấy vé</h3>
                <p className="text-sm text-slate-400 mb-8 max-w-xs leading-relaxed">
                    Mã định danh không tồn tại hoặc đã bị thu hồi khỏi hệ thống.
                </p>
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <RefreshCw size={15} /> Thử lại
                </button>
            </div>
        );
    }

    // ─── Found State ──────────────────────────────────────────────────────────
    const isWrong = ticketMatch === 'wrong';
    const isCorrect = ticketMatch === 'correct';
    const isMonthly = ticketMatch === 'monthly';

    return (
        <div className="h-full flex flex-col overflow-hidden">

            {/* ── Top status bar ────────────────────────────────────────────── */}
            <div className={`px-8 py-4 flex items-center justify-between border-b ${
                isWrong
                    ? 'bg-red-50 border-red-100'
                    : (isCorrect || isMonthly)
                        ? 'bg-emerald-50 border-emerald-100'
                        : 'bg-slate-50 border-slate-100'
            }`}>
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                        isWrong ? 'bg-red-500' : (isCorrect || isMonthly) ? 'bg-emerald-500' : 'bg-slate-300'
                    }`} />
                    <span className={`text-xs font-bold uppercase tracking-widest ${
                        isWrong ? 'text-red-600' : (isCorrect || isMonthly) ? 'text-emerald-700' : 'text-slate-500'
                    }`}>
                        {isWrong ? 'Cần điều chỉnh' : isMonthly ? 'Vé tháng — Hợp lệ' : isCorrect ? 'Hành trình hợp lệ' : 'Đang phân tích...'}
                    </span>
                </div>
                <button
                    onClick={onReset}
                    className="p-2 rounded-lg hover:bg-white/60 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <RefreshCw size={15} />
                </button>
            </div>

            {/* ── Scrollable content ────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">

                {/* Ticket code + type */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">Mã vé</p>
                        <h2 className="text-2xl font-black text-slate-900 tracking-wider font-mono">
                            {ticketData?.code}
                        </h2>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        ticketData?.type === 'single'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-violet-50 text-violet-700 border border-violet-200'
                    }`}>
                        {ticketData?.type === 'single' ? 'Vé lượt' : 'Vé tháng'}
                    </span>
                </div>

                <hr className="border-slate-100" />

                {/* Journey route */}
                {ticketData?.type === 'single' ? (
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lộ trình vé</p>

                        {/* Departure → Destination → Current */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                            {/* Departure */}
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center flex-shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-medium">Ga khởi hành</p>
                                    <p className="text-sm font-bold text-slate-800">{ticketData?.departure}</p>
                                </div>
                            </div>

                            {/* Connector */}
                            <div className="ml-3.5 w-px h-4 bg-slate-200" />

                            {/* Destination (from ticket) */}
                            <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    isWrong
                                        ? 'bg-red-50 border-red-400'
                                        : 'bg-slate-100 border-slate-400'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${isWrong ? 'bg-red-500' : 'bg-slate-500'}`} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-medium">Ga đích (hồ sơ)</p>
                                    <p className={`text-sm font-bold ${isWrong ? 'text-red-600 line-through' : 'text-slate-800'}`}>
                                        {ticketData?.destination}
                                    </p>
                                </div>
                            </div>

                            {/* Current station row — only shown on mismatch */}
                            {isWrong && (
                                <>
                                    <div className="ml-3.5 w-px h-4 bg-red-200" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center flex-shrink-0">
                                            <MapPin size={12} className="text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-medium">Ga hiện tại (thực tế)</p>
                                            <p className="text-sm font-bold text-amber-700">{currentStation}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Current station pill for valid exits */}
                        {!isWrong && (
                            <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <MapPin size={14} className="text-slate-400" />
                                    <span className="text-sm font-semibold text-slate-600">Ga hiện tại</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-800">{currentStation}</span>
                                    {(isCorrect || isMonthly) && (
                                        <CheckCircle size={16} className="text-emerald-500" />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Monthly ticket info */
                    <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
                                <CheckCircle size={16} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-violet-500 font-bold">Vé Tháng</p>
                                <p className="text-sm font-black text-violet-800">{ticketData?.packageName}</p>
                            </div>
                        </div>
                        <p className="text-xs text-violet-500 flex items-center gap-2">
                            <Clock size={12} /> HSD: {ticketData?.expiryDate ? new Date(ticketData.expiryDate).toLocaleDateString('vi-VN') : 'Không xác định'}
                        </p>
                        <p className="text-xs text-violet-600 font-medium">Hành trình linh hoạt — được phép ra tại mọi điểm ga.</p>
                    </div>
                )}

                <hr className="border-slate-100" />

                {/* Detail rows */}
                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chi tiết nghiệp vụ</p>

                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-3 bg-white">
                            <span className="text-xs text-slate-500 flex items-center gap-2">
                                <CreditCard size={13} /> Giá vé gốc
                            </span>
                            <span className="text-sm font-bold text-slate-800 tabular-nums">
                                {Number(ticketData?.price || 0).toLocaleString()} ₫
                            </span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 bg-white">
                            <span className="text-xs text-slate-500 flex items-center gap-2">
                                <Banknote size={13} /> Phương thức
                            </span>
                            <span className="text-sm font-semibold text-slate-700">{ticketData?.paymentMethod || '—'}</span>
                        </div>
                        {ticketData?.customer && (
                            <div className="flex justify-between items-center px-4 py-3 bg-white">
                                <span className="text-xs text-slate-500 flex items-center gap-2">
                                    <User size={13} /> Chủ thẻ
                                </span>
                                <span className="text-sm font-bold text-slate-800 uppercase">
                                    {ticketData.customer.fullName}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Wrong station alert box */}
                {isWrong && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                        <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-red-700 mb-1">Sai ga đích — Cần cập nhật</p>
                            <p className="text-xs text-red-500 leading-relaxed">
                                Hành khách đang tại <strong>{currentStation}</strong>, vượt ngoài phạm vi vé đã đăng ký.
                                Cần bổ sung vé và thu phụ phí khoảng cách.
                            </p>
                        </div>
                    </div>
                )}

                {/* Valid exit green box */}
                {(isCorrect || isMonthly) && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 items-center">
                        <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-emerald-700">Cho phép mở cổng</p>
                            <p className="text-xs text-emerald-600">Mã vé hợp lệ tại trạm này.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Fixed footer actions ──────────────────────────────────────── */}
            <div className="p-6 border-t border-slate-100 space-y-3 bg-white">
                {/* UPDATE BUTTON — show when wrong station (or when ticketMatch is null after scan = indeterminate) */}
                {isWrong && (
                    <button
                        onClick={onUpdateClick}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-slate-900 text-white text-sm font-bold tracking-wide hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20"
                    >
                        <PenLine size={16} />
                        Cập nhật & Bổ sung vé
                    </button>
                )}

                {/* Reset button */}
                <button
                    onClick={onReset}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-slate-100 transition-all"
                >
                    <RefreshCw size={14} />
                    Quét mã tiếp theo
                </button>
            </div>
        </div>
    );
};
