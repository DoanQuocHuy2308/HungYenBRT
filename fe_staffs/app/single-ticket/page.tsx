"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import QRCode from 'react-qr-code';
import { 
    Printer, Banknote, QrCode, Loader2, Wallet,
    ChevronRight, CreditCard, X, RefreshCw, CheckCircle, ArrowRight
} from 'lucide-react';

import { StationSelector } from '../../components/features/pos/StationSelector';
import { ReceiptPanel } from '../../components/features/pos/ReceiptPanel';
import { ZaloPayDialog } from '../../components/features/pos/ZaloPayDialog';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { StaffButton } from '../../components/ui/StaffButton';
import { posService, Location, TicketType } from '../../services/pos.service';

const BANK_CONFIG = {
    ID: "Vietinbank", 
    ACCOUNT_NO: "102873813822",
    ACCOUNT_NAME: "DOAN QUOC HUY",
};

const fmt = (n: any) => {
    const val = parseFloat(n);
    if (isNaN(val)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

export default function SingleTicketPOS() {
    const toast = useRef<Toast>(null);
    const [stations, setStations] = useState<Location[]>([]);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    
    const [departure, setDeparture] = useState<Location | null>(null);
    const [destination, setDestination] = useState<Location | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState(0); 
    
    const [idEmployee, setIdEmployee] = useState<string | null>(null);
    const [idGuest, setIdGuest] = useState<string | null>(null);

    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [showQRDialog, setShowQRDialog] = useState(false);
    const [showTransferQR, setShowTransferQR] = useState(false); 
    const [ticketDetails, setTicketDetails] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState({ id: 0, name: "", code: "" });
    const [transferMemo, setTransferMemo] = useState(""); 

    const [prices, setPrices] = useState<any[]>([]);
    const [paymentMethodsDB, setPaymentMethodsDB] = useState<any[]>([]);

    // ZaloPay dialog state
    const [showZaloPayDialog, setShowZaloPayDialog] = useState(false);
    const [zaloOrderId, setZaloOrderId]             = useState('');
    const [zaloPayload, setZaloPayload]             = useState<any>(null);
    const [isCreatingZaloPay, setIsCreatingZaloPay] = useState(false);

    useEffect(() => {
        const init = async () => {
             setLoadingData(true);
             try {
                 const [locRes, typeRes, userRes, payMRes] = await Promise.all([
                     posService.getLocations(),
                     posService.getTicketTypes(),
                     posService.getUsers(),
                     posService.getPaymentMethods()
                 ]);

                 if (locRes.success) {
                    setStations(locRes.data);
                    if (locRes.data.length > 0) setDeparture(locRes.data[0]);
                 }
                 if (payMRes?.success) setPaymentMethodsDB(payMRes.data);
                 if (typeRes.success) {
                    setTicketTypes(typeRes.data);
                    const singleType = typeRes.data.find((t: any) => (t.Id_Category || t.id_category) === 1);
                    if (singleType) {
                        const priceRes = await posService.getTicketPrices(singleType.Id || (singleType as any).id);
                        if (priceRes.success) setPrices(priceRes.data);
                    }
                 }
                 const guest = userRes.data?.find((u: any) => (u.id_Role || u.Id_Role) === 3);
                 if (guest) setIdGuest(guest.id || guest.Id);

                 const staffData = localStorage.getItem('staff_data');
                 if (staffData) {
                    const parsed = JSON.parse(staffData);
                    setIdEmployee(parsed.id || parsed.Id);
                 }
             } catch (err) {
                 toast.current?.show({ severity: 'error', summary: 'Lỗi đồng bộ', detail: 'Không thể kết nối máy chủ POS.', life: 3000 });
             } finally {
                 setLoadingData(false);
             }
        };
        init();
    }, []);

    useEffect(() => {
        if (departure && destination && prices.length > 0) {
            const depId = departure.Id || (departure as any).id;
            const destId = destination.Id || (destination as any).id;
            const match = prices.find((p: any) => p.From_Location_Id === depId && p.To_Location_Id === destId);
            setUnitPrice(match ? Number(match.Price) : 0);
        } else {
            setUnitPrice(0); 
        }
    }, [departure, destination, prices]);

    const handleProcessPayment = (method: any) => {
        setPaymentMethod({ id: method.Id, name: method.Name, code: method.Code });
        setShowPaymentDialog(false);

        const code = (method.Code || '').toUpperCase();

        if (code.includes('ZALO')) {
            handleZaloPayRedirect(method.Id);
        } else if (code.includes('BANK') || code.includes('TRANSFER')) {
            const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            setTransferMemo(`BRT-${randomCode}`);
            setShowTransferQR(true);
        } else {
            executePurchase(method.Id);
        }
    };

    const handleZaloPayRedirect = async (methodId: number) => {
        setIsCreatingZaloPay(true);
        try {
            const orderId    = Date.now().toString(36).toUpperCase();
            const singleType = ticketTypes.find(t => (t.Id_Category || (t as any).id_category) === 1);
            const ticketPayload = {
                Id_Ticket_Type:    singleType?.Id || (singleType as any)?.id,
                Id_User:           idGuest || '00000000-0000-0000-0000-000000000000',
                Quantity:          quantity,
                price:             unitPrice,
                id_payment_method: methodId,
                id_employee:       idEmployee,
                From_Location:     departure?.Id || (departure as any)?.id,
                To_Location:       destination?.Id || (destination as any)?.id,
            };

            const res  = await fetch('http://localhost:3000/zalopay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount:       totalAmount,
                    orderId,
                    description:  'Hung Yen BRT - Thanh toan ve',
                    ticketPayload,
                    returnUrl:    `${window.location.origin}/zalopay/return`,
                }),
            });
            const data = await res.json();

            if (data.success) {
                setZaloOrderId(orderId);
                setZaloPayload({ ...ticketPayload, _preCreated: true, _orderData: data });
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

    const executePurchase = async (methodId: number) => {
        setIsPurchasing(true);
        try {
            const singleType = ticketTypes.find(t => (t.Id_Category || (t as any).id_category) === 1);
            if (!singleType) throw new Error("Lỗi cấu hình loại vé");

            const payload = {
                Id_Ticket_Type: singleType.Id || (singleType as any).id,
                Id_User: idGuest || "00000000-0000-0000-0000-000000000000",
                Quantity: quantity,
                price: unitPrice,
                id_payment_method: methodId,
                id_employee: idEmployee,
                From_Location: departure?.Id || (departure as any)?.id,
                To_Location: destination?.Id || (destination as any)?.id,
                transaction_id: transferMemo
            };

            const res = await posService.purchaseTicket(payload);
            if (res.success) {
                setTicketDetails(res.data);
                setShowTransferQR(false);
                setShowQRDialog(true);
                toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã xuất vé thành công', life: 2000 });
            }
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: err.message, life: 3000 });
        } finally {
            setIsPurchasing(false);
        }
    };

    const resetPOS = () => {
        setShowQRDialog(false);
        setDestination(null);
        setQuantity(1);
        setTicketDetails(null);
        setTransferMemo("");
    };

    if (loadingData) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
        );
    }

    const totalAmount = quantity * unitPrice;
    const vietQRUrl = `https://img.vietqr.io/image/${BANK_CONFIG.ID}-${BANK_CONFIG.ACCOUNT_NO}-compact2.png?amount=${totalAmount}&addInfo=${transferMemo}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`;

    return (
        <PageWrapper showNav={true}>
            <Toast ref={toast} position="top-right" />
            
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Bán vé lượt</h1>
                    <p className="text-sm text-slate-500 mt-1">Hệ thống đầu cuối Terminal POS</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Trạng thái</span>
                    <div className="flex items-center gap-1.5 ml-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></div>
                        <span className="text-sm font-semibold text-slate-800">Trực tuyến</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
                <div className="md:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-y-auto">
                    <StationSelector 
                        stations={stations}
                        departureId={departure?.Id || (departure as any)?.id || null}
                        destinationId={destination?.Id || (destination as any)?.id || null}
                        onSelect={setDestination}
                    />
                </div>
                <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 flex-1 overflow-y-auto">
                        <ReceiptPanel 
                            departure={departure}
                            destination={destination}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            unitPrice={unitPrice}
                            onBuy={() => setShowPaymentDialog(true)}
                            loading={isPurchasing}
                        />
                    </div>
                </div>
            </div>

            {/* PAYMENT METHOD DIALOG */}
            <Dialog
                visible={showPaymentDialog} onHide={() => setShowPaymentDialog(false)}
                header={
                    <div className="flex items-center gap-2">
                        <CreditCard className="text-slate-700" size={20} /> 
                        <span className="font-bold text-slate-900 text-lg">Phương thức thanh toán</span>
                    </div>
                }
                style={{ width: '400px' }} 
                className="font-sans" modal
                pt={{ content: { className: 'p-6 flex flex-col gap-3' } }}
            >
                {paymentMethodsDB?.filter(m => m.IsActive).map(method => {
                    const code = (method.Code || '').toUpperCase();
                    const isZalo = code.includes('ZALO');
                    const isCash = code.includes('CASH');
                    return (
                        <button key={method.Id} onClick={() => handleProcessPayment(method)}
                            className="w-full bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between transition-colors hover:border-slate-400 hover:bg-slate-50 group"
                        >
                            <div className="flex items-center gap-3">
                                {isZalo ? (
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-blue-600 font-bold text-xs">ZLP</span>
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0 group-hover:text-slate-800">
                                        {isCash ? <Banknote size={20} /> : <QrCode size={20} />}
                                    </div>
                                )}
                                <div className="text-left">
                                    <span className="font-semibold text-slate-800 text-sm block">{method.Name}</span>
                                    {isZalo && (
                                        <span className="text-xs text-blue-500 font-medium">Quét QR · Tự động xác nhận</span>
                                    )}
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500" />
                        </button>
                    );
                })}
            </Dialog>

            {/* TRANSFER QR DIALOG */}
            <Dialog
                visible={showTransferQR} onHide={() => setShowTransferQR(false)}
                header={
                    <div className="flex items-center gap-2">
                        <RefreshCw className="text-slate-700 animate-spin-slow" size={20} /> 
                        <span className="font-bold text-slate-900 text-lg">Thanh toán chuyển khoản</span>
                    </div>
                }
                style={{ width: '450px' }} 
                className="font-sans" modal
                pt={{ content: { className: 'p-0 flex flex-col' } }}
            >
                <div className="p-6 flex flex-col items-center bg-white">
                    <div className="w-full bg-slate-50 p-6 rounded-xl mb-6 flex justify-between items-center border border-slate-200">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Số tiền thanh toán</p>
                            <p className="text-3xl font-bold text-slate-900">{totalAmount.toLocaleString()} <span className="text-lg text-slate-500">₫</span></p>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
                            <Wallet className="text-slate-600" size={24} />
                        </div>
                    </div>
                    
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm mb-6">
                        <img src={vietQRUrl} alt="VietQR" className="w-64 h-64 object-contain" />
                    </div>

                    <div className="w-full text-center">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Nội dung chuyển khoản</p>
                        <div className="bg-slate-50 border border-slate-200 py-3 rounded-lg flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-slate-900 tracking-wider">{transferMemo}</span>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                    <button onClick={() => setShowTransferQR(false)} className="flex-1 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Hủy giao dịch</button>
                    <StaffButton 
                        label="Xác nhận đã nhận tiền" 
                        onClick={() => executePurchase(paymentMethod.id)} 
                        loading={isPurchasing}
                        className="flex-[2] bg-slate-900 text-white font-semibold text-sm py-3 rounded-lg hover:bg-slate-800 transition-colors"
                    />
                </div>
            </Dialog>

            {/* TICKET SUCCESS DIALOG */}
            <Dialog 
                visible={showQRDialog} 
                onHide={resetPOS}
                header={
                    <div className="flex items-center gap-3">
                        <CheckCircle size={24} className="text-emerald-600" />
                        <span className="text-xl font-bold text-slate-900">Giao dịch hoàn tất</span>
                    </div>
                }
                style={{ width: '480px' }}
                className="font-sans" modal blockScroll
                pt={{ content: { className: 'p-0 flex flex-col bg-slate-50' } }}
            >
                <div className="p-6 overflow-y-auto max-h-[65vh]">
                    <div className="space-y-6">
                        {[1, 2].map((copyNum) => (
                            <div key={`copy-${copyNum}`} className={copyNum === 2 ? "hidden print:block mt-8 pt-8 border-t-2 border-dashed border-slate-300" : ""}>
                                <div className="text-center mb-4 hidden print:block">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        {copyNum === 1 ? "--- LIÊN KHÁCH HÀNG ---" : "--- LIÊN TRẠM LƯU ---"}
                                    </p>
                                </div>

                                {ticketDetails?.details?.map((ticket: any, idx: number) => (
                                    <div key={`${copyNum}-${ticket.Id}`} className="mb-6 last:mb-0">
                                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                                            
                                            <div className="w-full flex justify-between items-start mb-6">
                                                <div className="space-y-1">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">VÉ LƯỢT #{idx+1}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-bold text-slate-900">{departure?.Name}</span>
                                                        <ArrowRight size={16} className="text-slate-400" />
                                                        <span className="text-lg font-bold text-slate-900">{destination?.Name}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-bold uppercase border border-slate-200">
                                                    TERM-POS
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm inline-block">
                                                <QRCode value={ticket.Id} size={180} fgColor="#0f172a" bgColor="#ffffff" />
                                            </div>

                                            <div className="mt-6 text-center">
                                                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Quét mã tại cổng soát vé</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-6 flex justify-between items-end px-2">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Mã đơn</p>
                                        <p className="text-sm font-bold text-slate-900 uppercase">#{transferMemo || ticketDetails?.Id?.split('-')[0]}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Thanh toán</p>
                                        <p className="text-xl font-bold text-slate-900">{fmt(totalAmount)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="p-4 bg-white border-t border-slate-200 flex gap-3">
                    <StaffButton 
                        label="In vé & Kết thúc"
                        icon={<Printer size={18} />}
                        className="flex-1 bg-slate-900 text-white rounded-lg font-semibold text-sm py-3 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                        onClick={() => { window.print(); resetPOS(); }}
                    />
                    <button 
                        onClick={resetPOS}
                        className="px-6 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors font-semibold text-sm"
                    >
                        Đóng
                    </button>
                </div>
            </Dialog>

            {/* Loading khi đang tạo đơn ZaloPay */}
            {isCreatingZaloPay && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                        <span className="text-white font-bold text-sm">ZLP</span>
                    </div>
                    <p className="text-white font-semibold text-sm">Đang kết nối ZaloPay...</p>
                </div>
            )}

            {/* ZaloPay QR Dialog */}
            <ZaloPayDialog
                visible={showZaloPayDialog}
                onHide={() => setShowZaloPayDialog(false)}
                orderId={zaloOrderId}
                preOrderData={zaloPayload?._orderData}
                onSuccess={(ticketData) => {
                    setShowZaloPayDialog(false);
                    setTicketDetails(ticketData);
                    setShowQRDialog(true);
                    toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'ZaloPay: Đã xuất vé!', life: 3000 });
                }}
                onError={(msg) => toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: msg, life: 4000 })}
            />
        </PageWrapper>
    );
}
