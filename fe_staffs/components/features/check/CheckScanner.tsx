"use client";

import React from 'react';
import { Camera, RefreshCw, Search, ScanLine } from 'lucide-react';
import { InputText } from 'primereact/inputtext';
import { StaffButton } from '../../ui/StaffButton';
import { Scanner } from '@yudiel/react-qr-scanner';

interface CheckScannerProps {
    cameraActive: boolean;
    onStartCamera: () => void;
    onSimulateScan: (code?: string) => void;
    manualCode: string;
    setManualCode: (v: string) => void;
    isScanning: boolean;
    recentCodes: string[];
    scanState: "idle" | "scanning" | "found" | "not-found";
}

export const CheckScanner: React.FC<CheckScannerProps> = ({
    cameraActive,
    onStartCamera,
    onSimulateScan,
    manualCode,
    setManualCode,
    isScanning,
    recentCodes,
    scanState
}) => {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="relative flex-1 bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-200 min-h-[450px] group">
                {cameraActive && (
                    <div className="absolute inset-0 overflow-hidden mix-blend-normal opacity-90">
                        <Scanner
                            onScan={(result) => {
                                if (result.length > 0 && scanState === "idle") {
                                    onSimulateScan(result[0].rawValue);
                                }
                            }}
                            formats={['qr_code']}
                            scanDelay={100}
                            constraints={{
                                facingMode: 'environment',
                                width: { ideal: 4096 },
                                height: { ideal: 2160 },
                                frameRate: { ideal: 60, min: 30 },
                                advanced: [{ focusMode: 'continuous' } as any]
                            }}
                            styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
                        />
                    </div>
                )}

                {/* Camera Overlay Elements */}
                {!cameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
                        <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mb-6 border border-slate-200 shadow-sm">
                             <Camera size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-slate-800 font-bold text-lg mb-2 tracking-tight">Camera Không Khả Dụng</h3>
                        <p className="text-slate-500 text-sm mb-8 text-center max-w-[250px]">
                            Vui lòng kiểm tra quyền truy cập camera hoặc sử dụng phương thức nhập mã thủ công.
                        </p>
                        <StaffButton 
                            label="Thử kết nối lại" 
                            variant="secondary" 
                            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            onClick={onStartCamera}
                        />
                    </div>
                )}

                {/* Targeting HUD */}
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 relative">
                        {/* Minimalist Brackets */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white/80 rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white/80 rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white/80 rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white/80 rounded-br-xl"></div>

                        {/* Interactive Laser */}
                        {isScanning && (
                            <div className="absolute left-2 right-2 h-[2px] bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)] animate-[scanLine_2s_ease-in-out_infinite] z-30"></div>
                        )}
                    </div>
                </div>

                {/* Indicators */}
                <div className="absolute top-6 left-6 z-30">
                    <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                        <span className="text-white font-medium text-[11px] tracking-wide">
                            {cameraActive ? 'Camera Đang Hoạt Động' : 'Camera Offline'}
                        </span>
                    </div>
                </div>

                {/* Bottom HUD */}
                <div className="absolute bottom-6 left-6 right-6 z-30">
                   <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-slate-300 font-medium text-xs">Cảm biến quang học</span>
                            <span className="text-white font-semibold text-sm">Tự động nhận diện mã QR</span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                           <RefreshCw size={14} />
                        </div>
                   </div>
                </div>
            </div>

            {/* Manual Controls Card */}
            <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex gap-4 items-center">
                <div className="relative flex-1 flex items-center h-12 group/in">
                    <div className="absolute left-4 text-slate-400"><Search size={18} /></div>
                    <InputText 
                        value={manualCode} 
                        onChange={(e) => setManualCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSimulateScan()}
                        placeholder="Nhập mã định danh vé..."
                        className="w-full h-full pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    />
                </div>
                <StaffButton 
                    label="Kiểm tra" 
                    icon={<ScanLine size={16} />}
                    className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl border-none shadow-sm"
                    onClick={() => onSimulateScan()}
                />
            </div>

            {/* Recent/Suggested Tags */}
            <div className="mt-4 flex items-center gap-2 px-1">
                <span className="text-slate-500 text-xs font-medium">Gần đây:</span>
                {recentCodes.length === 0 && <span className="text-slate-300 text-xs italic">Chưa có dữ liệu</span>}
                {recentCodes.map(code => (
                    <button 
                        key={code} 
                        onClick={() => { setManualCode(code); onSimulateScan(code); }}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors active:scale-95"
                    >
                        {code}
                    </button>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes scanLine {
                    0% { top: 10%; opacity: 0; }
                    5% { opacity: 1; }
                    95% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
            `}} />
        </div>
    );
};
