"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { 
   ArrowLeft, ScanLine, ShieldCheck, ShieldX, User, 
   IdCard, CalendarDays, MapPin, Clock, Ticket, 
   CreditCard, Phone, Mail, Camera, Search, RefreshCw,
   CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';

import { CheckScanner } from '../../components/features/check/CheckScanner';
import { ValidationDetailPanel } from '../../components/features/check/ValidationDetailPanel';
import { PageWrapper } from '../../components/layout/PageWrapper';

// Using real backend API
const API_URL = 'http://localhost:3000';

type ScanState = "idle" | "scanning" | "found" | "not-found";

export default function CheckTicketPOS() {
   const router = useRouter();
   const toast = useRef<Toast>(null);
   const [scanState, setScanState] = useState<ScanState>("idle");
   const [manualCode, setManualCode] = useState("");
   const [ticketData, setTicketData] = useState<any>(null);
   const [cameraActive, setCameraActive] = useState(true);

   // Tự động xử lý camera trong Scanner component
   const startCamera = () => setCameraActive(true);

   // Scan with real API
   const simulateScan = async (code?: string) => {
      const searchCode = (code || manualCode).trim();
      if (!searchCode) {
         toast.current?.show({ severity: 'warn', summary: 'Terminal', detail: 'Vui lòng cung cấp mã định danh để thực hiện truy vấn.', life: 2500 });
         return;
      }
      
      setScanState("scanning");
      toast.current?.show({ severity: 'info', summary: 'Authenticating', detail: 'Đang gửi yêu cầu tra cứu tới máy chủ...', life: 1500 });

      try {
         const res = await fetch(`${API_URL}/ticket-scan/lookup`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ qrToken: searchCode })
         });
         const data = await res.json();
         
         if (data.success) {
            setTicketData({ ...data.data, code: searchCode });
            setScanState("found");
            if (['active', 'unused', 'issued'].includes(data.data.status)) {
               toast.current?.show({ severity: 'success', summary: 'Tra cứu thành công', detail: `Mã vé hợp lệ.`, life: 2500 });
            } else {
               toast.current?.show({ severity: 'warn', summary: 'Cảnh báo vé', detail: `Vé có trạng thái: ${data.data.status.toUpperCase()}.`, life: 3000 });
            }
         } else {
            setTicketData(null);
            setScanState("not-found");
            toast.current?.show({ severity: 'error', summary: 'Không tìm thấy', detail: data.message || `Dữ liệu không tồn tại cho chuỗi định danh [${searchCode}].`, life: 3000 });
         }
      } catch (err) {
         setTicketData(null);
         setScanState("not-found");
         toast.current?.show({ severity: 'error', summary: 'Lỗi kết nối', detail: 'Không thể kết nối đến máy chủ quản lý.', life: 3000 });
      }
   };

   const resetScan = () => {
      setScanState("idle");
      setTicketData(null);
      setManualCode("");
   };

   // Tự động reset trạng thái sau khi quét xong (thành công hoặc thất bại) để nhân viên sẵn sàng quét vé tiếp theo
   useEffect(() => {
      if (scanState === "found" || scanState === "not-found") {
         const timer = setTimeout(() => {
            resetScan();
         }, 10000); // Đợi 10 giây hiển thị thông tin vé rồi tự động reset
         return () => clearTimeout(timer);
      }
   }, [scanState]);

   return (
      <PageWrapper 
         title="Xác Thực Vé Cửa Soát" 
         description="Hệ thống quét và kiểm tra hiệu lực thẻ vé dành cho bộ phận soát vé tại các điểm ga."
      >
         <Toast ref={toast} position="top-right" />

         <div className="flex bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-[#3E2723]/5 overflow-hidden min-h-187.5 -mx-4 lg:-mx-8">
            {/* Left: Interactive Scanner Section */}
            <div className="flex-[0.55] p-10 overflow-y-auto w-full bg-[#FDFCFB]/30 border-r border-slate-50">
               <CheckScanner 
                    cameraActive={cameraActive}
                    onStartCamera={startCamera}
                    onSimulateScan={simulateScan}
                    manualCode={manualCode}
                    setManualCode={setManualCode}
                    isScanning={scanState === "scanning"}
                    recentCodes={[]}
                    scanState={scanState}
               />
            </div>

            {/* Right: Validation Result Panel */}
            <div className="flex-[0.45] bg-white overflow-y-auto max-h-187.5">
               <ValidationDetailPanel 
                    scanState={scanState}
                    ticketData={ticketData}
                    onReset={resetScan}
               />
            </div>
         </div>
      </PageWrapper>
   );
}
