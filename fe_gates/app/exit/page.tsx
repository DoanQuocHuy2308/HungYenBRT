"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Train, MapPin, CheckCircle2, XCircle, LogOut } from 'lucide-react';

type AppState = 'scan_qr' | 'processing_qr' | 'success' | 'failed';

const API_URL = 'http://localhost:3000';

export default function ExitGate() {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [locations, setLocations] = useState<any[]>([]);
  const [locationId, setLocationId] = useState<string>('');

  const [appState, setAppState] = useState<AppState>('scan_qr');
  const [message, setMessage] = useState<string>('Vui lòng quét QR Vé Điện tử để ra cổng.');

  const appStateRef = useRef<AppState>('scan_qr');
  const lastQrTokenRef = useRef<string>('');
  const locationIdRef = useRef<string>('');
  const isScanningRef = useRef<boolean>(false);

  // QR camera refs
  const qrVideoRef = useRef<HTMLVideoElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const qrStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const setAppStateSynced = (s: AppState) => {
    appStateRef.current = s;
    setAppState(s);
  };

  // ───── Clock ─────
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // ───── Locations ─────
  useEffect(() => {
    fetch(`${API_URL}/locations`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setLocations(res.data);
          const savedLoc = localStorage.getItem('gate_location_id');
          if (savedLoc && res.data.some((l: any) => l.Id.toString() === savedLoc)) {
            setLocationId(savedLoc);
            locationIdRef.current = savedLoc;
          } else if (res.data.length > 0) {
            setLocationId(res.data[0].Id.toString());
            locationIdRef.current = res.data[0].Id.toString();
          }
        }
      }).catch(console.error);
  }, []);

  // ───── Start QR Camera (1 lần khi mount) ─────
  useEffect(() => {
    startQrCamera();
    return () => {
      stopQrScan();
      qrStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startQrCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 4096 },
          height: { ideal: 2160 },
          frameRate: { ideal: 60, min: 30 },
          advanced: [{ focusMode: 'continuous' } as any]
        }
      });
      qrStreamRef.current = stream;
      if (qrVideoRef.current) {
        qrVideoRef.current.srcObject = stream;
        qrVideoRef.current.play();
      }
    } catch (e) {
      console.error('Không thể mở camera QR:', e);
    }
  };

  // ───── jsQR scan loop ─────
  const scanLoop = useCallback(async () => {
    const video = qrVideoRef.current;
    const canvas = qrCanvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    if (appStateRef.current !== 'scan_qr' || isScanningRef.current) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) { rafRef.current = requestAnimationFrame(scanLoop); return; }

    ctx.drawImage(video, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);

    const jsQR = (await import('jsqr')).default;
    const code = jsQR(imageData.data, w, h, {
      inversionAttempts: 'attemptBoth',
    });

    if (code && code.data && code.data !== lastQrTokenRef.current) {
      isScanningRef.current = true;
      await handleQRScan(code.data);
      isScanningRef.current = false;
    }

    rafRef.current = requestAnimationFrame(scanLoop);
  }, []);

  const startQrScan = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(scanLoop);
  }, [scanLoop]);

  const stopQrScan = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => {
    const video = qrVideoRef.current;
    if (!video) return;
    const onReady = () => startQrScan();
    video.addEventListener('loadeddata', onReady);
    if (video.readyState >= 2) startQrScan();
    return () => video.removeEventListener('loadeddata', onReady);
  }, [startQrScan]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLocationId(val);
    locationIdRef.current = val;
    localStorage.setItem('gate_location_id', val);
  };

  const resetGate = () => {
    lastQrTokenRef.current = '';
    setMessage('Vui lòng quét QR Vé Điện tử để ra cổng.');
    setAppStateSynced('scan_qr');
  };

  const showResult = (status: 'success' | 'failed', msg: string) => {
    setAppStateSynced(status);
    setMessage(msg);
    setTimeout(resetGate, 2000);
  };

  const handleQRScan = async (qrToken: string) => {
    if (!locationIdRef.current) {
      alert('Vui lòng cấu hình Ga/Trạm hiện hành!');
      return;
    }

    lastQrTokenRef.current = qrToken;
    setAppStateSynced('processing_qr');
    setMessage('Đang xử lý xuất bến...');

    try {
      const res = await fetch(`${API_URL}/ticket-scan/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken, locationId: locationIdRef.current, direction: 'EXIT' })
      });
      const data = await res.json();

      if (data.success) {
        showResult('success', data.message);
      } else {
        showResult('failed', data.message);
      }
    } catch {
      showResult('failed', 'Lỗi kết nối máy chủ quản lý trạm');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">

      {/* Hidden canvas for jsQR */}
      <canvas ref={qrCanvasRef} className="hidden" />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-40 relative shadow-sm">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
            <LogOut size={24} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">Cổng Ra (Exit Gate)</h1>
            <p className="text-amber-600 text-[11px] font-semibold tracking-widest uppercase mt-0.5">Hung Yen BRT Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <a href="/" className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 transition-all font-semibold text-sm">
            Chuyển sang Cổng Vào
          </a>
          <div className="flex items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
            <MapPin size={16} className="text-slate-500 mr-2" />
            <select
              className="bg-transparent text-slate-700 font-bold text-sm outline-none cursor-pointer appearance-none min-w-37.5"
              value={locationId}
              onChange={handleLocationChange}
            >
              <option value="" disabled>-- Cấu hình Ga / Trạm --</option>
              {locations.map(loc => (
                <option key={loc.Id} value={loc.Id}>{loc.Name}</option>
              ))}
            </select>
          </div>
          <div className="text-right border-l border-slate-200 pl-6">
            <div className="text-2xl font-mono font-bold tracking-tighter text-slate-900">{time || '--:--:--'}</div>
            <div className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">{date || '-------'}</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative">

        {/* Banner trạng thái */}
        <div className={`mb-10 text-center px-6 py-4 rounded-2xl border-2 w-full max-w-140 transition-all duration-300 shadow-md ${
          appState === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
          appState === 'failed' ? 'bg-rose-50 border-rose-200 text-rose-700' :
          appState === 'processing_qr' ? 'bg-amber-50 border-amber-200 text-amber-700' :
          'bg-white border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center justify-center gap-3 text-base font-bold">
            {appState === 'success' && <CheckCircle2 size={20} />}
            {appState === 'failed' && <XCircle size={20} />}
            {appState === 'processing_qr' && (
              <div className="w-5 h-5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
            )}
            <span>{message}</span>
          </div>
        </div>

        {/* Camera Frame */}
        <div className={`relative w-[min(92vw,680px)] h-[min(85vh,700px)] p-4 bg-linear-to-b from-slate-100 to-slate-200 rounded-[3rem] flex items-center justify-center transition-all duration-500 border border-slate-300 ring-4 ring-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)]`}>

          <div className={`relative w-full h-full bg-slate-900 rounded-[2.5rem] overflow-hidden border-8 transition-colors duration-500 flex items-center justify-center
            ${appState === 'success' ? 'border-emerald-500' :
              appState === 'failed' ? 'border-rose-500' :
              appState === 'processing_qr' ? 'border-amber-500' :
              'border-slate-800'}
          `}>
            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none z-0" />

            {/* QR Camera — luôn chạy ngầm */}
            <div className="absolute inset-0 z-10">
              <video
                ref={qrVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                <div className="w-[65%] h-[65%] relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white/90 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white/90 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white/90 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white/90 rounded-br-xl" />
                  {appState === 'scan_qr' && (
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-500 shadow-[0_0_12px_3px_rgba(245,158,11,0.9)] animate-[scan_1.5s_ease-in-out_infinite]" />
                  )}
                </div>
              </div>
            </div>

            {/* Result overlay */}
            {(appState === 'success' || appState === 'failed') && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/95 backdrop-blur-md">
                {appState === 'success' ? (
                  <div className="flex flex-col items-center animate-[popIn_0.3s_ease-out]">
                    <div className="w-28 h-28 rounded-full bg-emerald-50 flex items-center justify-center mb-4 border-4 border-emerald-100 shadow-2xl shadow-emerald-500/20">
                      <CheckCircle2 size={56} className="text-emerald-500" />
                    </div>
                    <span className="text-emerald-600 font-black text-3xl uppercase tracking-widest">Đã Mở Cửa</span>
                    <span className="text-slate-500 font-semibold mt-2 text-sm">Hẹn gặp lại quý khách!</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center animate-[popIn_0.3s_ease-out]">
                    <div className="w-28 h-28 rounded-full bg-rose-50 flex items-center justify-center mb-4 border-4 border-rose-100 shadow-2xl shadow-rose-500/20">
                      <XCircle size={56} className="text-rose-500" />
                    </div>
                    <span className="text-rose-600 font-black text-3xl uppercase tracking-widest">Từ Chối</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hardware corner decorations */}
          <div className={`absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 rounded-tl-[2.5rem] pointer-events-none transition-colors duration-500
            ${appState === 'success' ? 'border-emerald-500' : appState === 'failed' ? 'border-rose-500' : appState === 'processing_qr' ? 'border-amber-500' : 'border-slate-300'}`} />
          <div className={`absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 rounded-tr-[2.5rem] pointer-events-none transition-colors duration-500
            ${appState === 'success' ? 'border-emerald-500' : appState === 'failed' ? 'border-rose-500' : appState === 'processing_qr' ? 'border-amber-500' : 'border-slate-300'}`} />
          <div className={`absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 rounded-bl-[2.5rem] pointer-events-none transition-colors duration-500
            ${appState === 'success' ? 'border-emerald-500' : appState === 'failed' ? 'border-rose-500' : appState === 'processing_qr' ? 'border-amber-500' : 'border-slate-300'}`} />
          <div className={`absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 rounded-br-[2.5rem] pointer-events-none transition-colors duration-500
            ${appState === 'success' ? 'border-emerald-500' : appState === 'failed' ? 'border-rose-500' : appState === 'processing_qr' ? 'border-amber-500' : 'border-slate-300'}`} />
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: calc(100% - 2px); opacity: 0; }
        }
        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
}
