"use client";

import React from 'react';
import { Camera, CameraOff, ScanLine, Search, History, ArrowRight, MapPin } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

interface AdjustmentScannerProps {
    cameraActive: boolean;
    setCameraActive: (active: boolean) => void;
    scanState: string;
    onScan: (result: any) => void;
    onManualScan: (code?: string) => void;
    manualCode: string;
    setManualCode: (code: string) => void;
    history: any[];
    currentStation: string;
}

export const AdjustmentScanner: React.FC<AdjustmentScannerProps> = ({
    cameraActive,
    setCameraActive,
    scanState,
    onScan,
    onManualScan,
    manualCode,
    setManualCode,
    history,
    currentStation
}) => {
    return (
        <div className="flex flex-col h-full gap-5">

            {/* ── Camera viewport ─────────────────────────────────────────── */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex-shrink-0">
                {cameraActive ? (
                    <Scanner
                        onScan={onScan}
                        formats={['qr_code']}
                        components={{ finder: false }}
                        styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
                        <CameraOff size={32} className="text-slate-600 mb-3" />
                        <span className="text-slate-500 text-xs font-medium">Camera đã tắt</span>
                    </div>
                )}

                {/* Scan frame overlay */}
                {cameraActive && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-48 h-48 relative">
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg" />
                            {scanState === 'idle' && (
                                <div className="absolute left-2 right-2 top-0 h-[2px] bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-[scanLine_3s_ease-in-out_infinite]" />
                            )}
                        </div>
                    </div>
                )}

                {/* Top badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                        <MapPin size={11} className="text-white/70" />
                        <span className="text-white text-[10px] font-semibold truncate max-w-[120px]">{currentStation}</span>
                    </div>
                    <button
                        onClick={() => setCameraActive(!cameraActive)}
                        className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
                    >
                        {cameraActive ? <CameraOff size={14} /> : <Camera size={14} />}
                    </button>
                </div>

                {/* Status badge */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        scanState === 'scanning' ? 'bg-amber-500 text-white animate-pulse'
                        : scanState === 'found' ? 'bg-emerald-500 text-white'
                        : 'bg-black/50 text-white/50 backdrop-blur-sm'
                    }`}>
                        {scanState === 'scanning' ? 'Đang xác thực...'
                         : scanState === 'found' ? 'Đã tìm thấy'
                         : 'Sẵn sàng quét'}
                    </div>
                </div>
            </div>

            {/* ── Manual input ─────────────────────────────────────────────── */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onManualScan()}
                        placeholder="Nhập mã vé thủ công..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium placeholder:text-slate-300 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition-all bg-white"
                    />
                </div>
                <button
                    onClick={() => onManualScan()}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-1.5 text-sm font-semibold"
                >
                    <ScanLine size={15} />
                </button>
            </div>

            {/* ── History ──────────────────────────────────────────────────── */}
            <div className="flex-1 min-h-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                        <History size={12} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nhật ký điều chỉnh</span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-medium">{history.length} mục</span>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                    {history.length === 0 ? (
                        <div className="text-center py-6 text-slate-300 text-xs">Chưa có lịch sử</div>
                    ) : history.map((log, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-mono text-[11px] font-bold text-slate-700">{log.code}</span>
                                    <span className="text-[10px] text-slate-400">{log.time}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px]">
                                    <span className="text-slate-400 truncate max-w-[70px]">{log.oldDest}</span>
                                    <ArrowRight size={9} className="text-slate-300 flex-shrink-0" />
                                    <span className="text-slate-700 font-semibold truncate max-w-[70px]">{log.newDest}</span>
                                    {log.surcharge > 0 && (
                                        <span className="ml-auto text-amber-600 font-bold text-[10px]">+{log.surcharge.toLocaleString()}₫</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                @keyframes scanLine {
                    0%   { top: 2px; opacity: 0.2; }
                    50%  { top: calc(100% - 2px); opacity: 0.7; }
                    100% { top: 2px; opacity: 0.2; }
                }
            `}</style>
        </div>
    );
};
