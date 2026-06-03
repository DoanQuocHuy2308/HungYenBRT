"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Train, MapPin, CheckCircle2, XCircle, ScanFace, Brain, Fingerprint, ShieldCheck } from 'lucide-react';

type AppState = 'scan_qr' | 'processing_qr' | 'scan_face' | 'processing_face' | 'success' | 'failed';

const API_URL = 'http://localhost:3000';

export default function Home() {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [locations, setLocations] = useState<any[]>([]);
  const [locationId, setLocationId] = useState<string>('');

  const [appState, setAppState] = useState<AppState>('scan_qr');
  const [message, setMessage] = useState<string>('Vui lòng quét QR Vé Điện tử để vào cổng.');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [faceScore, setFaceScore] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [analysisStep, setAnalysisStep] = useState<number>(0);

  // QR camera refs
  const qrVideoRef = useRef<HTMLVideoElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const qrStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  // Face camera refs
  const faceVideoRef = useRef<HTMLVideoElement>(null);
  const faceStreamRef = useRef<MediaStream | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const analysisRef = useRef<NodeJS.Timeout | null>(null);

  // Refs để tránh stale closure
  const lastQrTokenRef = useRef<string>('');
  const locationIdRef = useRef<string>('');
  const appStateRef = useRef<AppState>('scan_qr');
  const isScanningRef = useRef<boolean>(false);

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

  // ───── Start QR Camera (chạy 1 lần khi mount) ─────
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

    // Chỉ decode khi đang ở trạng thái scan_qr
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

    // Dynamic import jsQR để tránh SSR issues
    const jsQR = (await import('jsqr')).default;
    const code = jsQR(imageData.data, w, h, {
      inversionAttempts: 'attemptBoth', // thử cả QR tối và sáng
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

  // Bắt đầu scan loop sau khi camera sẵn sàng
  useEffect(() => {
    const video = qrVideoRef.current;
    if (!video) return;
    const onReady = () => startQrScan();
    video.addEventListener('loadeddata', onReady);
    // Fallback nếu video đã ready
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
    stopFaceCamera();
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (analysisRef.current) clearInterval(analysisRef.current);
    lastQrTokenRef.current = '';
    setUserAvatar(null);
    setUserName(null);
    setFaceScore(null);
    setCountdown(3);
    setAnalysisStep(0);
    setMessage('Vui lòng quét QR Vé Điện tử để vào cổng.');
    setAppStateSynced('scan_qr');
  };

  const showResult = (status: 'success' | 'failed', msg: string, score?: number) => {
    setAppStateSynced(status);
    setMessage(msg);
    if (score !== undefined) setFaceScore(score);
    setTimeout(resetGate, 2500);
  };

  const handleQRScan = async (qrToken: string) => {
    if (!locationIdRef.current) { alert('Vui lòng cấu hình Ga/Trạm hiện hành!'); return; }

    lastQrTokenRef.current = qrToken;
    setAppStateSynced('processing_qr');
    setMessage('Đang xử lý vé...');

    try {
      const res = await fetch(`${API_URL}/ticket-scan/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken, locationId: locationIdRef.current }),
      });
      const data = await res.json();

      if (data.success) {
        showResult('success', data.message);
      } else if (data.code === 'FACE_REQUIRED') {
        setUserAvatar(data.avatarUrl || null);
        setUserName(data.userName || null);
        setAppStateSynced('scan_face');
        setMessage('Vé yêu cầu định danh khuôn mặt bằng MTCNN. Vui lòng nhìn thẳng vào camera.');
        startFaceCamera();
      } else {
        showResult('failed', data.message);
      }
    } catch {
      showResult('failed', 'Lỗi kết nối máy chủ quản lý trạm');
    }
  };

  // ───── Face Camera ─────
  const startFaceCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      faceStreamRef.current = stream;
      if (faceVideoRef.current) faceVideoRef.current.srcObject = stream;

      if (countdownRef.current) clearInterval(countdownRef.current);
      setCountdown(3);
      let ticks = 3;
      countdownRef.current = setInterval(() => {
        ticks -= 1;
        setCountdown(ticks);
        if (ticks <= 0) {
          clearInterval(countdownRef.current!);
          captureAndVerifyFace();
        }
      }, 1000);
    } catch {
      showResult('failed', 'Lỗi không thể truy cập camera eKYC');
    }
  };

  const stopFaceCamera = () => {
    faceStreamRef.current?.getTracks().forEach(t => t.stop());
    faceStreamRef.current = null;
  };

  const ANALYSIS_STEPS = [
    'Phát hiện khuôn mặt (MTCNN P-Net)...',
    'Tinh chỉnh vùng mặt (MTCNN R-Net)...',
    'Trích xuất 5 điểm mốc (O-Net)...',
    'Căn chỉnh & chuẩn hóa khuôn mặt...',
    'Mã hóa đặc trưng FaceNet 512D...',
    'So sánh vector Euclidean...',
  ];

  const captureAndVerifyFace = async () => {
    if (!faceVideoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = faceVideoRef.current.videoWidth || 640;
    canvas.height = faceVideoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(faceVideoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setAppStateSynced('processing_face');
      setMessage('AI MTCNN đang phân tích khuôn mặt...');
      setAnalysisStep(0);

      let step = 0;
      analysisRef.current = setInterval(() => {
        step++;
        setAnalysisStep(step);
        if (step >= ANALYSIS_STEPS.length) clearInterval(analysisRef.current!);
      }, 250);

      const formData = new FormData();
      formData.append('qrToken', lastQrTokenRef.current);
      formData.append('locationId', locationIdRef.current);
      formData.append('face_image', blob, 'face.jpg');

      try {
        const res = await fetch(`${API_URL}/ticket-scan/scan`, { method: 'POST', body: formData });
        const data = await res.json();
        clearInterval(analysisRef.current!);
        if (data.success) {
          showResult('success', data.message);
        } else {
          showResult('failed', data.message, data.distance);
        }
      } catch {
        clearInterval(analysisRef.current!);
        showResult('failed', 'Lỗi kết nối server MTCNN');
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">

      {/* Hidden canvas for jsQR processing */}
      <canvas ref={qrCanvasRef} className="hidden" />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
            <Train size={24} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">Hệ thống Trạm BRT</h1>
            <p className="text-indigo-600 text-[11px] font-semibold tracking-widest uppercase mt-0.5">MTCNN · FaceNet · AI Gate Control</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <a href="/exit" className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl border border-amber-200 transition-all font-semibold text-sm">
            Cổng Ra →
          </a>
          <div className="flex items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
            <MapPin size={16} className="text-slate-500 mr-2" />
            <select className="bg-transparent text-slate-700 font-bold text-sm outline-none cursor-pointer appearance-none min-w-37.5"
              value={locationId} onChange={handleLocationChange}>
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

      <main className="flex-1 flex items-center justify-center p-6 gap-8">

        <div className="flex flex-col items-center gap-5">
          {/* Status Banner */}
          <div className={`px-6 py-4 rounded-2xl border-2 w-full max-w-140 text-center transition-all duration-300 shadow-md ${
            appState === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
            appState === 'failed'  ? 'bg-rose-50 border-rose-200 text-rose-700' :
            (appState === 'processing_qr' || appState === 'processing_face') ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
            'bg-white border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center justify-center gap-3 text-base font-bold">
              {appState === 'success' && <CheckCircle2 size={20} />}
              {appState === 'failed'  && <XCircle size={20} />}
              {(appState === 'processing_qr' || appState === 'processing_face') && (
                <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
              )}
              <span>{message}</span>
            </div>
          </div>

          {/* Main Camera Frame */}
          <div className={`relative w-[min(92vw,680px)] h-[min(85vh,700px)] p-4 bg-linear-to-b from-slate-100 to-slate-200 rounded-[3rem] flex items-center justify-center transition-all duration-500 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-slate-300 ring-4 ring-white`}>
            <div className={`relative w-full h-full bg-slate-900 rounded-[2.5rem] overflow-hidden border-8 transition-colors duration-500 ${
              appState === 'success' ? 'border-emerald-500' :
              appState === 'failed'  ? 'border-rose-500' :
              (appState === 'processing_qr' || appState === 'processing_face') ? 'border-indigo-500' :
              'border-slate-800'
            }`}>
              {/* Grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none z-0" />

              {/* QR Camera — luôn hiển thị, camera không bao giờ tắt */}
              <div className={`absolute inset-0 z-10 transition-opacity duration-300 ${
                appState === 'scan_face' || appState === 'processing_face' ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}>
                <video
                  ref={qrVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {/* Scan overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[62%] h-[62%] relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white/90 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white/90 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white/90 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white/90 rounded-br-xl" />
                    {appState === 'scan_qr' && (
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_12px_3px_rgba(99,102,241,0.9)] animate-[scan_1.5s_ease-in-out_infinite]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Face Scanner */}
              {(appState === 'scan_face' || appState === 'processing_face') && (
                <div className="absolute inset-0 z-10 bg-black">
                  <video ref={faceVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[55%] h-[80%] border-[3px] border-dashed border-white/60 rounded-[120px] relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white px-4 py-1.5 rounded-full border border-indigo-200 flex items-center gap-2 shadow-lg">
                        <Brain size={16} className="text-indigo-600 animate-pulse" />
                        <span className="text-indigo-800 text-xs font-bold">MTCNN</span>
                      </div>
                      {appState === 'scan_face' && countdown > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-7xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] animate-pulse">{countdown}</div>
                        </div>
                      )}
                      {appState === 'processing_face' && (
                        <div className="absolute inset-0 rounded-[120px] overflow-hidden">
                          <div className="absolute top-0 w-full h-17.5 bg-linear-to-b from-transparent via-indigo-500/50 to-transparent animate-[scanFace_1.8s_ease-in-out_infinite]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Result overlay */}
              {(appState === 'success' || appState === 'failed') && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/95 backdrop-blur-md">
                  {appState === 'success' ? (
                    <div className="flex flex-col items-center gap-4 animate-[popIn_0.3s_ease-out]">
                      <div className="w-28 h-28 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-emerald-100 shadow-2xl shadow-emerald-500/20">
                        <ShieldCheck size={56} className="text-emerald-500" />
                      </div>
                      <span className="text-emerald-600 font-black text-3xl uppercase tracking-widest">Đã Mở Cổng</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 animate-[popIn_0.3s_ease-out]">
                      <div className="w-28 h-28 rounded-full bg-rose-50 flex items-center justify-center border-4 border-rose-100 shadow-2xl shadow-rose-500/20">
                        <XCircle size={56} className="text-rose-500" />
                      </div>
                      <span className="text-rose-600 font-black text-3xl uppercase tracking-widest">Từ Chối</span>
                      {faceScore !== null && (
                        <div className="text-center mt-2">
                          <span className="text-slate-500 font-bold text-xs">MTCNN Distance: {faceScore.toFixed(4)}</span>
                          <div className="mt-2 w-48 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(faceScore * 200, 100)}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel — MTCNN Analysis */}
        {(appState === 'scan_face' || appState === 'processing_face') && (
          <div className="flex flex-col gap-4 w-72 animate-[popIn_0.3s_ease-out]">
            {/* User card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ScanFace size={28} className="text-slate-400" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Chủ vé</p>
                <p className="text-slate-900 font-bold text-sm">{userName || 'Đang tải...'}</p>
                <p className="text-slate-500 text-xs mt-0.5">Vé thời gian</p>
              </div>
            </div>

            {/* MTCNN Pipeline */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Brain size={18} className="text-indigo-600" />
                <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">Tiến trình MTCNN</span>
              </div>
              <div className="space-y-4">
                {ANALYSIS_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                      appState === 'processing_face' && analysisStep > i
                        ? 'bg-indigo-600 border-indigo-600'
                        : appState === 'processing_face' && analysisStep === i
                        ? 'border-indigo-600 border-t-transparent animate-spin'
                        : 'border-slate-200'
                    }`}>
                      {appState === 'processing_face' && analysisStep > i && (
                        <CheckCircle2 size={12} className="text-white" />
                      )}
                    </div>
                    <span className={`text-[11px] font-semibold transition-colors duration-300 ${
                      appState === 'processing_face' && analysisStep >= i ? 'text-indigo-900' : 'text-slate-400'
                    }`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Biometric badge */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <Fingerprint size={20} className="text-indigo-600 animate-pulse" />
              <div>
                <p className="text-[11px] text-indigo-900 font-bold">eKYC Biometric</p>
                <p className="text-[10px] text-indigo-600/80 font-medium">FaceNet 512D · Euclidean</p>
              </div>
              {appState === 'scan_face' && countdown > 0 && (
                <div className="ml-auto w-9 h-9 rounded-full bg-white border border-indigo-200 flex items-center justify-center shadow-sm">
                  <span className="text-indigo-700 font-black text-sm">{countdown}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0%   { top: 0;               opacity: 0; }
          15%  {                        opacity: 1; }
          85%  {                        opacity: 1; }
          100% { top: calc(100% - 2px); opacity: 0; }
        }
        @keyframes scanFace {
          0%   { top: -70px; opacity: 0; }
          30%  {             opacity: 1; }
          70%  {             opacity: 1; }
          100% { top: 100%;  opacity: 0; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1);    opacity: 1; }
        }
      `}} />
    </div>
  );
}
