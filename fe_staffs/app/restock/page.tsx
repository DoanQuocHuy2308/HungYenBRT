"use client";

import { useState, useRef, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { MapPin, Banknote, CreditCard, QrCode, ChevronDown, CheckCircle, Wallet, X } from 'lucide-react';

const BANK_CONFIG = {
    ID: 'Vietinbank',
    ACCOUNT_NO: '102873813822',
    ACCOUNT_NAME: 'DOAN QUOC HUY',
};

import { PageWrapper } from '../../components/layout/PageWrapper';
import { AdjustmentScanner } from '../../components/features/adjustment/AdjustmentScanner';
import { AdjustmentDetails } from '../../components/features/adjustment/AdjustmentDetails';
import { ZaloPayDialog } from '../../components/features/pos/ZaloPayDialog';

const INITIAL_HISTORY = [
    { time: '14:42', code: 'BRT-582390', oldDest: 'Ga Hà Nội', newDest: 'Ecopark', reason: 'Xuống nhầm ga', staff: 'Doãn Quốc Huy', surcharge: 0 },
    { time: '13:15', code: 'BRT-582385', oldDest: 'Mỹ Đình', newDest: 'Ecopark', reason: 'Xuống nhầm ga', staff: 'Doãn Quốc Huy', surcharge: 0 },
    { time: '11:30', code: 'BRT-582380', oldDest: 'Nhổn', newDest: 'Ecopark', reason: 'Thay đổi lộ trình', staff: 'Trần Văn B', surcharge: 0 },
];

type ScanState = "idle" | "scanning" | "found" | "not-found";
type TicketMatch = "correct" | "wrong" | "monthly";

const REASON_OPTIONS = ['Xuống nhầm ga', 'Thay đổi lộ trình', 'Sự cố kỹ thuật', 'Yêu cầu khác'];

export default function TicketUpdatePage() {
    const toast = useRef<Toast>(null);
    const [scanState, setScanState] = useState<ScanState>("idle");
    const [manualCode, setManualCode] = useState('');
    const [ticketData, setTicketData] = useState<any>(null);
    const [ticketMatch, setTicketMatch] = useState<TicketMatch | null>(null);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [newDestination, setNewDestination] = useState<string>('');
    const [updateReason, setUpdateReason] = useState('Xuống nhầm ga');
    const [surchargeMethod, setSurchargeMethod] = useState<'cash' | 'bank' | 'zalopay'>('cash');
    const [history, setHistory] = useState(INITIAL_HISTORY);
    const [cameraActive, setCameraActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stations, setStations] = useState<any[]>([]);
    const [currentStationName, setCurrentStationName] = useState<string>('');
    const [ticketPrices, setTicketPrices] = useState<any[]>([]);

    // Bank QR state
    const [showBankQR, setShowBankQR] = useState(false);
    const [transferMemo, setTransferMemo] = useState('');

    // ZaloPay state
    const [showZaloPayDialog, setShowZaloPayDialog] = useState(false);
    const [zaloOrderId, setZaloOrderId] = useState('');
    const [zaloPreOrderData, setZaloPreOrderData] = useState<any>(null);
    const [isCreatingZaloPay, setIsCreatingZaloPay] = useState(false);

    // ─── Load data ───────────────────────────────────────────────────────────
    useEffect(() => {
        fetch('http://localhost:3000/locations')
            .then(r => r.json())
            .then(r => {
                if (r.success) {
                    setStations(r.data);
                    if (r.data.length > 0) {
                        setCurrentStationName(r.data[0].Name);
                        setNewDestination(r.data[0].Name);
                    }
                }
            }).catch(console.error);

        fetch('http://localhost:3000/ticket-prices')
            .then(r => r.json())
            .then(r => { if (r.data) setTicketPrices(r.data); })
            .catch(console.error);
    }, []);

    // ─── Price lookup (từ bảng ticket_prices, tra theo cặp trạm) ─────────────
    // Trả về giá chính xác từ trạm đầu → trạm đích mới
    const lookupPrice = (fromName: string | null, toName: string | null): number => {
        if (!fromName || !toName || ticketPrices.length === 0 || stations.length === 0) return 0;
        const fromLoc = stations.find(s => s.Name === fromName);
        const toLoc = stations.find(s => s.Name === toName);
        if (!fromLoc || !toLoc) return 0;
        const match = ticketPrices.find(p =>
            (p.From_Location_Id === fromLoc.Id && p.To_Location_Id === toLoc.Id) ||
            (p.From_Location_Id === toLoc.Id && p.To_Location_Id === fromLoc.Id)
        );
        return match ? parseFloat(match.Price) : 0;
    };

    // Giá đầy đủ hành trình mới (từ ga đầu → ga xuống thực tế)
    const fullNewPrice = ticketData ? lookupPrice(ticketData.departure, newDestination) : 0;
    // Phụ phí = giá mới - giá đã trả (tối thiểu 0)
    const surcharge = Math.max(0, fullNewPrice - (Number(ticketData?.price) || 0));

    // ─── Scan handler ─────────────────────────────────────────────────────────
    const handleScan = (detectedResult: any) => {
        if (scanState !== "idle") return;
        if (detectedResult?.length > 0 && detectedResult[0].rawValue) simulateScan(detectedResult[0].rawValue);
        else if (typeof detectedResult === "string") simulateScan(detectedResult);
    };

    const simulateScan = async (code?: string) => {
        const searchCode = (code || manualCode).trim();
        if (!searchCode) {
            toast.current?.show({ severity: 'warn', summary: 'Thông báo', detail: 'Vui lòng nhập mã vé.', life: 2500 });
            return;
        }
        setScanState("scanning");
        try {
            const res = await fetch('http://localhost:3000/ticket-scan/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrToken: searchCode })
            });
            const result = await res.json();
            if (result.success) {
                const ticket = result.data;
                setTicketData({
                    id: ticket.id,
                    type: ticket.type,
                    code: ticket.code || ticket.id?.split('-')[0].toUpperCase(),
                    departure: ticket.departure,
                    destination: ticket.destination,
                    price: ticket.price,
                    purchaseDate: ticket.purchaseDate,
                    paymentMethod: ticket.paymentMethod,
                    customer: ticket.customer
                });
                setScanState("found");

                if (ticket.type === 'monthly') {
                    setTicketMatch("monthly");
                    toast.current?.show({ severity: 'success', summary: 'Vé tháng', detail: 'Cho phép ra mọi ga.', life: 3000 });
                } else {
                    const depLoc = stations.find(s => s.Name === ticket.departure);
                    const destLoc = stations.find(s => s.Name === ticket.destination);
                    const currLoc = stations.find(s => s.Name === currentStationName);
                    let isValidExit = false;
                    if (depLoc && destLoc && currLoc) {
                        const minOrder = Math.min(depLoc.order_index, destLoc.order_index);
                        const maxOrder = Math.max(depLoc.order_index, destLoc.order_index);
                        if (currLoc.order_index >= minOrder && currLoc.order_index <= maxOrder) isValidExit = true;
                    } else if (ticket.destination === currentStationName) {
                        isValidExit = true;
                    }
                    if (isValidExit) {
                        setTicketMatch("correct");
                        setNewDestination(currentStationName);
                        toast.current?.show({ severity: 'success', summary: 'Hành trình hợp lệ', detail: `Hành khách có quyền xuống tại ga [${currentStationName}].`, life: 3000 });
                    } else {
                        setTicketMatch("wrong");
                        setNewDestination(currentStationName);
                        toast.current?.show({ severity: 'error', summary: 'Cần điều chỉnh', detail: `Vượt quá ga đích. Ga ghi trên vé: [${ticket.destination}].`, life: 4000 });
                    }
                }
            } else {
                setTicketData(null);
                setScanState("not-found");
                setTicketMatch(null);
                toast.current?.show({ severity: 'error', summary: 'Không tìm thấy', detail: result.message || 'Không tìm thấy vé.', life: 3000 });
            }
        } catch (err) {
            console.error(err);
            setScanState("not-found");
            toast.current?.show({ severity: 'error', summary: 'Lỗi kết nối', detail: 'Không thể kết nối máy chủ.', life: 3000 });
        }
    };

    // ─── Restock handler ─────────────────────────────────────────────────────
    const handleUpdateTicket = async () => {
        if (!ticketData) return;
        if (surcharge > 0 && surchargeMethod === 'qr') {
            await handleZaloPaySurcharge();
        } else {
            await executeRestock(1); // Tiền mặt
        }
    };

    const handleZaloPaySurcharge = async () => {
        setIsCreatingZaloPay(true);
        try {
            const orderId = Date.now().toString(36).toUpperCase();
            const res = await fetch('http://localhost:3000/zalopay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: surcharge,
                    orderId,
                    description: `Hung Yen BRT - Thu phu phi ve ${ticketData.code}`,
                    // ticketPayload để null để không tự động xuất vé ở backend khi ZaloPay thành công
                    // mà sẽ để frontend tự gọi executeRestock sau khi thanh toán
                    ticketPayload: null,
                    returnUrl: `${window.location.origin}/zalopay/return`
                })
            });
            const data = await res.json();
            if (data.success) {
                setZaloOrderId(orderId);
                setZaloPreOrderData(data);
                setShowZaloPayDialog(true);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: data.message || 'Không thể tạo đơn ZaloPay', life: 4000 });
            }
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi kết nối', detail: err.message, life: 3000 });
        } finally {
            setIsCreatingZaloPay(false);
        }
    };

    const executeRestock = async (paymentMethodId: number) => {
        setIsSubmitting(true);
        const oldDest = ticketData.destination;
        const newLocObj = stations.find(s => s.Name === newDestination);
        if (!newLocObj) { setIsSubmitting(false); return; }
        const staffStr = localStorage.getItem('staff_data');
        const staffId = staffStr ? (JSON.parse(staffStr).id || JSON.parse(staffStr).user?.id) : null;
        try {
            const res = await fetch('http://localhost:3000/ticket-scan/restock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId: ticketData.id,
                    newLocationId: newLocObj.Id,
                    employeeId: staffId,
                    paymentMethodId: paymentMethodId
                })
            });
            const result = await res.json();
            if (result.success) {
                // Ưu tiên dùng giá từ server trả về (chính xác nhất)
                const finalNewPrice = result.new_price ?? fullNewPrice;
                const finalSurcharge = result.surcharge_amount ?? surcharge;
                setTicketData((prev: any) => ({
                    ...prev,
                    destination: newDestination,
                    price: finalNewPrice,
                    qr_token: result.new_qr_token
                }));
                setHistory(prev => [{
                    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    code: ticketData.code, oldDest, newDest: newDestination,
                    reason: updateReason, staff: staffId ? 'Staff' : 'Unknown', surcharge: finalSurcharge,
                }, ...prev]);
                setTicketMatch('correct');
                setShowUpdateDialog(false);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Bổ sung vé thành công',
                    detail: `[${ticketData.code}] → [${newDestination}]. Giá mới: ${finalNewPrice.toLocaleString()}₫. Thu thêm: ${finalSurcharge.toLocaleString()}₫.`,
                    life: 5000
                });
            } else {
                toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: result.message, life: 3000 });
            }
        } catch (err) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi máy chủ', detail: 'Không thể xử lý yêu cầu.', life: 3000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetScan = () => {
        setScanState('idle');
        setTicketData(null);
        setTicketMatch(null);
        setManualCode('');
    };

    const stationOptions = stations.filter(s => s.Name !== ticketData?.departure);

    return (
        <PageWrapper
            title="Điều Chỉnh Ra Ga"
            description="Xử lý ngoại lệ hành khách xuống sai ga hoặc cần bổ sung hành trình."
        >
            <Toast ref={toast} position="top-right" />

            <div className="flex gap-6 min-h-[calc(100vh-220px)]">

                {/* Left — Scanner panel */}
                <div className="w-105 shrink-0 flex flex-col gap-5">
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            <MapPin size={11} /> Ga đang trực
                        </label>
                        <div className="relative">
                            <select
                                value={currentStationName}
                                onChange={(e) => { setCurrentStationName(e.target.value); setNewDestination(e.target.value); }}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-400 transition-all pr-9 cursor-pointer"
                            >
                                {stations.map(s => <option key={s.Id} value={s.Name}>{s.Name}</option>)}
                            </select>
                            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <AdjustmentScanner
                            cameraActive={cameraActive}
                            setCameraActive={setCameraActive}
                            scanState={scanState}
                            onScan={handleScan}
                            onManualScan={simulateScan}
                            manualCode={manualCode}
                            setManualCode={setManualCode}
                            history={history}
                            currentStation={currentStationName}
                        />
                    </div>
                </div>

                {/* Right — Details panel */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <AdjustmentDetails
                        scanState={scanState}
                        ticketData={ticketData}
                        ticketMatch={ticketMatch}
                        currentStation={currentStationName}
                        onUpdateClick={() => setShowUpdateDialog(true)}
                        onReset={resetScan}
                    />
                </div>
            </div>

            {/* ── Dialog bổ sung vé ────────────────────────────────────────── */}
            <Dialog
                visible={showUpdateDialog}
                onHide={() => setShowUpdateDialog(false)}
                header={null}
                style={{ width: '480px' }}
                pt={{
                    root: { className: 'rounded-2xl border-none shadow-2xl overflow-hidden' },
                    mask: { className: 'backdrop-blur-sm bg-slate-900/30' },
                    content: { className: 'p-0 rounded-2xl' },
                }}
            >
                <div className="bg-white rounded-2xl overflow-hidden">
                    <div className="px-7 py-5 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-800">Cập nhật & Bổ sung vé</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Điều chỉnh ga đến và thu phụ phí theo bảng giá</p>
                    </div>

                    <div className="p-7 space-y-5">
                        {/* Route info */}
                        <div className="flex items-stretch gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-400 font-medium mb-0.5">Ga khởi hành</p>
                                <p className="text-sm font-bold text-slate-700">{ticketData?.departure}</p>
                            </div>
                            <div className="w-px bg-slate-200" />
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-400 font-medium mb-0.5">Ga đích (hồ sơ)</p>
                                <p className="text-sm font-bold text-red-500 line-through">{ticketData?.destination}</p>
                            </div>
                        </div>

                        {/* New destination */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Ga đích điều chỉnh</label>
                            <div className="relative">
                                <select
                                    value={newDestination}
                                    onChange={(e) => setNewDestination(e.target.value)}
                                    className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-400 transition-all pr-9 cursor-pointer"
                                >
                                    {stationOptions.map(s => <option key={s.Id} value={s.Name}>{s.Name}</option>)}
                                </select>
                                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Lý do</label>
                            <div className="relative">
                                <select
                                    value={updateReason}
                                    onChange={(e) => setUpdateReason(e.target.value)}
                                    className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-400 transition-all pr-9 cursor-pointer"
                                >
                                    {REASON_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Pricing breakdown */}
                        {fullNewPrice > 0 ? (
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-slate-900 px-5 py-4">
                                    <p className="text-[10px] text-slate-400 font-medium mb-3 uppercase tracking-widest">Chi tiết thanh toán</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Giá vé đã trả</span>
                                            <span className="text-slate-300 tabular-nums">{Number(ticketData?.price || 0).toLocaleString()} ₫</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Giá vé hành trình mới</span>
                                            <span className="text-white font-bold tabular-nums">{fullNewPrice.toLocaleString()} ₫</span>
                                        </div>
                                        <div className="h-px bg-slate-700 my-1" />
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-slate-300 font-semibold text-sm">Cần thu thêm</span>
                                            <span className={`text-xl font-black tabular-nums ${surcharge > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                {surcharge > 0 ? `+${surcharge.toLocaleString()} ₫` : 'Không thu thêm'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <CheckCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-700">Chưa có bảng giá cho tuyến này</p>
                                    <p className="text-xs text-amber-600 mt-0.5">Vẫn có thể cập nhật ga mà không thu thêm tiền</p>
                                </div>
                            </div>
                        )}

                        {/* Payment method */}
                        {surcharge > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Phương thức thu phụ phí</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {/* Tiền mặt */}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSurchargeMethod('cash'); }}
                                        className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                                            surchargeMethod === 'cash'
                                                ? 'border-slate-900 bg-slate-900 text-white'
                                                : 'border-slate-200 text-slate-500 hover:border-slate-400 bg-white'
                                        }`}
                                    >
                                        <Banknote size={18} />
                                        Tiền mặt
                                    </button>
                                    {/* QR Ngân hàng */}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSurchargeMethod('bank'); }}
                                        className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                                            surchargeMethod === 'bank'
                                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                                : 'border-slate-200 text-slate-500 hover:border-emerald-400 bg-white'
                                        }`}
                                    >
                                        <QrCode size={18} />
                                        QR Ngân hàng
                                    </button>
                                    {/* ZaloPay */}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSurchargeMethod('zalopay'); }}
                                        className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                                            surchargeMethod === 'zalopay'
                                                ? 'border-blue-500 text-white'
                                                : 'border-slate-200 text-slate-500 hover:border-blue-300 bg-white'
                                        }`}
                                        style={surchargeMethod === 'zalopay' ? { background: 'linear-gradient(135deg,#0068FF,#00B4FF)', borderColor: 'transparent' } : {}}
                                    >
                                        <span className={`font-black text-[11px] px-1.5 py-0.5 rounded ${
                                            surchargeMethod === 'zalopay' ? 'bg-white/25' : 'bg-blue-100 text-blue-600'
                                        }`}>ZLP</span>
                                        ZaloPay
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => setShowUpdateDialog(false)}
                                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Hủy
                            </button>

                            {surcharge > 0 && surchargeMethod === 'zalopay' ? (
                                <button
                                    type="button"
                                    onClick={handleZaloPaySurcharge}
                                    disabled={isCreatingZaloPay}
                                    className="flex-1 py-3 rounded-xl text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg,#0068FF,#00B4FF)' }}
                                >
                                    {isCreatingZaloPay
                                        ? 'Đang tạo đơn...'
                                        : <><span className="font-black text-[11px] bg-white/25 px-1.5 py-0.5 rounded">ZLP</span> Thanh toán ZaloPay</>
                                    }
                                </button>
                            ) : surcharge > 0 && surchargeMethod === 'bank' ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const memo = `BRT-RS-${Math.random().toString(36).substring(2,7).toUpperCase()}`;
                                        setTransferMemo(memo);
                                        setShowBankQR(true);
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <QrCode size={16} /> Hiện QR Ngân hàng
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => executeRestock(1)}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-60"
                                >
                                    {isSubmitting
                                        ? 'Đang xử lý...'
                                        : surcharge > 0
                                            ? `Thu ${surcharge.toLocaleString()}₫ (Tiền mặt)`
                                            : 'Xác nhận cập nhật'}
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </Dialog>

            {/* ZaloPay Loading */}
            {isCreatingZaloPay && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                        <span className="text-white font-bold text-sm">ZLP</span>
                    </div>
                    <p className="text-white font-semibold text-sm">Đang kết nối ZaloPay...</p>
                </div>
            )}

            {/* ZaloPay Dialog */}
            <ZaloPayDialog
                visible={showZaloPayDialog}
                onHide={() => setShowZaloPayDialog(false)}
                orderId={zaloOrderId}
                preOrderData={zaloPreOrderData}
                onSuccess={() => {
                    setShowZaloPayDialog(false);
                    // Sau khi thanh toán ZaloPay thành công, gọi API restock để cập nhật vé
                    executeRestock(2); 
                }}
                onError={(msg) => toast.current?.show({ severity: 'error', summary: 'Lỗi thanh toán', detail: msg, life: 4000 })}
            />
            {/* Bank QR Dialog */}
            <Dialog
                visible={showBankQR}
                onHide={() => setShowBankQR(false)}
                header={null}
                style={{ width: '420px' }}
                pt={{
                    root: { className: 'rounded-2xl border-none shadow-2xl overflow-hidden' },
                    mask: { className: 'backdrop-blur-sm bg-slate-900/40' },
                    content: { className: 'p-0' },
                }}
            >
                <div className="bg-white rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <QrCode size={16} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">QR Ngân hàng</p>
                                <p className="text-[10px] text-slate-400">Chuyển khoản qua VietQR</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setShowBankQR(false)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                            <X size={14} className="text-slate-500" />
                        </button>
                    </div>

                    <div className="p-6 flex flex-col items-center gap-5">
                        {/* Amount */}
                        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Số tiền cần thu</span>
                            <span className="text-xl font-black text-amber-500">+{surcharge.toLocaleString()} ₫</span>
                        </div>

                        {/* VietQR Image */}
                        <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
                            <img
                                src={`https://img.vietqr.io/image/${BANK_CONFIG.ID}-${BANK_CONFIG.ACCOUNT_NO}-compact2.png?amount=${surcharge}&addInfo=${transferMemo}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`}
                                alt="VietQR"
                                className="w-56 h-56 object-contain"
                            />
                        </div>

                        {/* Transfer memo */}
                        <div className="w-full text-center">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Nội dung chuyển khoản</p>
                            <div className="bg-slate-50 border border-slate-200 py-2.5 px-4 rounded-xl">
                                <span className="text-base font-black text-slate-900 tracking-wider">{transferMemo}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="px-6 pb-6 flex gap-3">
                        <button type="button" onClick={() => setShowBankQR(false)}
                            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowBankQR(false); setShowUpdateDialog(false); executeRestock(2); }}
                            disabled={isSubmitting}
                            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-60"
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đã nhận tiền'}
                        </button>
                    </div>
                </div>
            </Dialog>
        </PageWrapper>
    );
}
