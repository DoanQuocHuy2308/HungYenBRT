"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import QRCode from 'react-qr-code';
import {
    Printer, ArrowLeft, Banknote,
    X, Ticket, QrCode, CalendarDays, IdCard,
    User, Phone, Camera, CheckCircle2, Mail, MapPinned, Calendar, ScanLine, Clock, Shield,
    ChevronRight, Wallet, Info, ArrowRight, Loader2, CreditCard, RefreshCw, ShieldCheck
} from 'lucide-react';

import { PackageSelectionGrid } from '../../components/features/time-ticket/PackageSelectionGrid';
import { RegistrationForm } from '../../components/features/time-ticket/RegistrationForm';
import { ZaloPayDialog } from '../../components/features/pos/ZaloPayDialog';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { StaffButton } from '../../components/ui/StaffButton';
import { posService } from '../../services/pos.service';

const BANK_CONFIG = {
    ID: "Vietinbank",
    ACCOUNT_NO: "102873813822",
    ACCOUNT_NAME: "DOAN QUOC HUY",
};

export default function TimeTicketPOS() {
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [packages, setPackages] = useState<any[]>([]);
    const [isLoadingPackages, setIsLoadingPackages] = useState(true);

    // Customer Info
    const [cccd, setCccd] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");
    const [issueDate, setIssueDate] = useState("");
    const [address, setAddress] = useState("");
    const [gender, setGender] = useState("Nam");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [avatarImage, setAvatarImage] = useState<string | null>(null);
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [scanned, setScanned] = useState(false);

    // States
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [showTransferQR, setShowTransferQR] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [ticketDetails, setTicketDetails] = useState<any>(null);
    const [transferMemo, setTransferMemo] = useState("");
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

    // Discount
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
    const [isCheckingDiscount, setIsCheckingDiscount] = useState(false);
    const [promotions, setPromotions] = useState<any[]>([]);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);

    // Customer Type
    const [customerType, setCustomerType] = useState<'new' | 'old'>('new');
    const [lookupCCCD, setLookupCCCD] = useState("");
    const [isLookingUp, setIsLookingUp] = useState(false);

    // ZaloPay
    const [showZaloPayDialog, setShowZaloPayDialog] = useState(false);
    const [zaloOrderId, setZaloOrderId]             = useState('');
    const [zaloPreOrderData, setZaloPreOrderData]   = useState<any>(null);
    const [isCreatingZaloPay, setIsCreatingZaloPay] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [typesRes, methodsRes, promoRes] = await Promise.all([
                    posService.getTicketTypes(),
                    posService.getPaymentMethods(),
                    posService.getPromotions()
                ]);

                if (promoRes.success) {
                    setPromotions(promoRes.data.filter((p: any) => p.isActive));
                }

                if (typesRes.success) {
                    // Filter categories 2 (TIME) and 3 (PROMO)
                    const timeTypes = typesRes.data.filter(t => t.Id_Category === 2 || t.Id_Category === 3);

                    // For each type, get its price
                    const pkgs = await Promise.all(timeTypes.map(async (t) => {
                        const priceRes = await posService.getTicketPrices(t.Id);
                        const basePrice = priceRes.data.find(p => p.From_Location_Id === null)?.Price || 0;
                        return {
                            id: t.Id.toString(),
                            name: t.Name,
                            duration: `${t.Duration_Day} ngày`,
                            price: Number(basePrice),
                            categoryId: t.Id_Category
                        };
                    }));
                    setPackages(pkgs);
                }

                if (methodsRes.success) {
                    setPaymentMethods(methodsRes.data.filter(m => m.IsActive));
                }
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải dữ liệu cấu hình' });
            } finally {
                setIsLoadingPackages(false);
            }
        };
        fetchData();
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
        const file = e.target.files?.[0];
        if (file) {
            if (side === 'front') setFrontFile(file);
            else setBackFile(file);

            const reader = new FileReader();
            reader.onload = (ev) => {
                if (side === 'front') setFrontImage(ev.target?.result as string);
                else setBackImage(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => {
                setAvatarImage(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLookupOldCustomer = async () => {
        if (!lookupCCCD.trim()) return;
        setIsLookingUp(true);
        try {
            const res = await posService.getUserByCCCD(lookupCCCD.trim());
            if (res.success && res.data) {
                const user = res.data;
                setCccd(user.cccd_number || "");
                setFullName(user.name || "");
                setPhone(user.phone || "");
                setDob(user.birthday || "");
                setIssueDate(user.issue_date || "");
                setAddress(user.address || "");
                setGender(user.sex || "Nam");
                setEmail(user.email || "");

                // Note: Cần cẩn thận với avatar/cccd_front lưu db có thể là path
                if (user.avatar) setAvatarImage(user.avatar.startsWith('http') || user.avatar.startsWith('data:') ? user.avatar : `${user.avatar}`);
                if (user.cccd_front) setFrontImage(user.cccd_front.startsWith('http') || user.cccd_front.startsWith('data:') ? user.cccd_front : `${user.cccd_front}`);
                if (user.cccd_back) setBackImage(user.cccd_back.startsWith('http') || user.cccd_back.startsWith('data:') ? user.cccd_back : `${user.cccd_back}`);

                setScanned(true);
                toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã tải thông tin khách hàng cũ', life: 2000 });
            }
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Thất bại', detail: err.message || 'Không tìm thấy khách hàng này', life: 3000 });
        } finally {
            setIsLookingUp(false);
        }
    };

    const handleScanCCCD = async () => {
        if (!frontFile && !backFile) return;

        setIsScanning(true);
        toast.current?.show({ severity: 'info', summary: 'OCR', detail: 'Đang trích xuất dữ liệu từ các ảnh...', life: 2000 });

        try {
            const formData = new FormData();
            // Append all available files to the same field "cccd_images"
            if (frontFile) formData.append('cccd_images', frontFile);
            if (backFile) formData.append('cccd_images', backFile);

            const res = await posService.scanCCCD(formData);

            if (res && res.success && res.data) {
                const { cccd_number, name, birthday, address, issue_date } = res.data;
                setCccd(cccd_number || "");
                setFullName(name || "");
                setDob(birthday || "");
                setIssueDate(issue_date || "");
                setAddress(address || "");
                setScanned(true);
                toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã trích xuất dữ liệu CCCD.', life: 3000 });
            } else {
                toast.current?.show({ severity: 'error', summary: 'Thất bại', detail: res?.message || 'Không tìm thấy mã QR hợp lệ trên cả 2 mặt' });
            }
        } catch (err: any) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Lỗi kết nối server khi quét CCCD' });
        } finally {
            setIsScanning(false);
        }
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;
        setIsCheckingDiscount(true);
        try {
            const res = await posService.getPromotionByCode(discountCode.trim().toUpperCase());
            if (res.success && res.data) {
                setAppliedDiscount(res.data);
                toast.current?.show({ severity: 'success', summary: 'Giảm giá', detail: `Đã áp dụng mã: ${res.data.Name}` });
            } else {
                setAppliedDiscount(null);
                toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: res.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
            }
        } catch (err) {
            setAppliedDiscount(null);
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể kiểm tra mã giảm giá' });
        } finally {
            setIsCheckingDiscount(false);
        }
    };

    const handleProcessPayment = (method: any) => {
        const code = (method.Code || '').toUpperCase();
        setShowPaymentDialog(false);
        if (code.includes('ZALO')) {
            handleZaloPayTime(method.Id);
        } else if (code.includes('BANK') || code.includes('TRANSFER')) {
            const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            setTransferMemo(`BRT-T-${randomCode}`);
            setShowTransferQR(true);
        } else {
            executePurchase(method.Id);
        }
    };

    const handleZaloPayTime = async (methodId: number) => {
        if (!selectedPackage || !cccd || !fullName || !phone) {
            toast.current?.show({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng hoàn tất hồ sơ khách hàng trước', life: 3000 });
            return;
        }

        // Tính lại amount vì totalAmount được declare ở bên dưới component
        const baseAmount = selectedPackage.price || 0;
        let discountValue = 0;
        if (appliedDiscount) {
            if (appliedDiscount.DiscountPercent) {
                discountValue = (baseAmount * appliedDiscount.DiscountPercent) / 100;
            } else if (appliedDiscount.DiscountAmount) {
                discountValue = appliedDiscount.DiscountAmount;
            }
        }
        const currentTotalAmount = Math.max(0, baseAmount - discountValue);

        setIsCreatingZaloPay(true);
        try {
            const orderId = Date.now().toString(36).toUpperCase();
            const staffData = JSON.parse(localStorage.getItem('staff_data') || '{}');
            const ticketPayload = {
                Id_Ticket_Type:    Number(selectedPackage.id),
                userData: {
                    cccd_number: cccd, name: fullName, phone, birthday: dob,
                    sex: gender, address, email, password,
                    cccd_front: frontImage || 'default_front',
                    cccd_back:  backImage  || 'default_back',
                    avatar: avatarImage,
                    issue_date: issueDate || '2020-01-01',
                    price: currentTotalAmount
                },
                id_payment_method: methodId,
                id_employee:       staffData.id || staffData.Id,
                code_promotion:    appliedDiscount?.Code || null,
            };

            const res = await fetch('http://localhost:3000/zalopay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount:       currentTotalAmount,
                    orderId,
                    description:  'Hung Yen BRT - Ve thoi han',
                    ticketPayload,
                    returnUrl:    `${window.location.origin}/zalopay/return`,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setZaloOrderId(orderId);
                setZaloPreOrderData(data);
                setShowZaloPayDialog(true);
            } else {
                toast.current?.show({ severity: 'error', summary: 'ZaloPay lỗi', detail: data.message || 'Không thể tạo đơn', life: 4000 });
            }
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi kết nối', detail: err.message, life: 3000 });
        } finally {
            setIsCreatingZaloPay(false);
        }
    };

    const executePurchase = async (methodId: number) => {
        if (!selectedPackage || !cccd || !fullName || !phone) {
            toast.current?.show({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng hoàn tất hồ sơ khách hàng' });
            return;
        }

        setIsPurchasing(true);
        try {
            const staffData = JSON.parse(localStorage.getItem('staff_data') || '{}');
            const payload = {
                Id_Ticket_Type: Number(selectedPackage.id),
                userData: {
                    cccd_number: cccd,
                    name: fullName,
                    phone: phone,
                    birthday: dob,
                    sex: gender,
                    address: address,
                    email: email,
                    password: password,
                    cccd_front: frontImage || "default_front",
                    cccd_back: backImage || "default_back",
                    avatar: avatarImage,
                    issue_date: issueDate || "2020-01-01",
                    price: totalAmount
                },
                id_payment_method: methodId,
                id_employee: staffData.id || staffData.Id,
                transaction_id: transferMemo,
                code_promotion: appliedDiscount?.Code || null
            };

            const res = await posService.purchaseTimeTicket(payload);
            if (res.success) {
                const detail = res.data.details?.[0];
                setTicketDetails({
                    ticket_id: detail?.Id || res.data.Id,
                    qr_code: detail?.qr_token || "N/A",
                    expiry_date: detail?.EndDate || null
                });
                setShowTransferQR(false);
                setShowSuccessDialog(true);
                toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã đăng ký vé tháng', life: 2000 });
            }
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: err.message });
        } finally {
            setIsPurchasing(false);
        }
    };

    const resetPOS = () => {
        setShowSuccessDialog(false);
        setSelectedPackage(null);
        setCccd(""); setFullName(""); setPhone(""); setDob(""); setIssueDate(""); setAddress(""); setEmail(""); setPassword("");
        setFrontImage(null); setBackImage(null); setAvatarImage(null); setScanned(false);
        setDiscountCode(""); setAppliedDiscount(null);
        setLookupCCCD("");
    };

    const baseAmount = selectedPackage?.price || 0;
    let discountValue = 0;
    if (appliedDiscount && selectedPackage) {
        if (appliedDiscount.DiscountPercent) {
            discountValue = (baseAmount * appliedDiscount.DiscountPercent) / 100;
        } else if (appliedDiscount.DiscountAmount) {
            discountValue = appliedDiscount.DiscountAmount;
        }
    }
    const totalAmount = Math.max(0, baseAmount - discountValue);
    const vietQRUrl = `https://img.vietqr.io/image/${BANK_CONFIG.ID}-${BANK_CONFIG.ACCOUNT_NO}-compact2.png?amount=${totalAmount}&addInfo=${transferMemo}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`;

    return (
        <PageWrapper title="Quản lý Vé thời hạn">
            <Toast ref={toast} />

            {/* Header Section */}
            <div className="mb-6 flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <Ticket size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Đăng ký & Phát hành Vé thời hạn</h1>
                        <p className="text-xs text-slate-500">Hệ thống quản lý khách hàng định danh Hưng Yên BRT</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Mã trạm</span>
                        <span className="text-sm font-bold text-slate-900 uppercase">HY-POS-01</span>
                    </div>
                    <div className="h-10 w-px bg-slate-100"></div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Ngày vận hành</span>
                        <span className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0 mb-8">
                {/* Left: Registration & Package Selection */}
                <div className="col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col min-h-0 overflow-y-auto">
                    {isLoadingPackages ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải cấu hình...</span>
                        </div>
                    ) : (
                        <>
                            <PackageSelectionGrid
                                packages={packages}
                                selectedPackageId={selectedPackage?.id}
                                onSelect={(pkg) => setSelectedPackage(pkg as any)}
                            />
                            <div className="mt-12">
                                {/* Tabs Khách hàng mới / cũ */}
                                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                                    <button
                                        onClick={() => setCustomerType('new')}
                                        className={`flex-1 flex justify-center items-center py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${customerType === 'new' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        <User size={16} className="mr-2" /> Đăng ký mới
                                    </button>
                                    <button
                                        onClick={() => setCustomerType('old')}
                                        className={`flex-1 flex justify-center items-center py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${customerType === 'old' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        <ScanLine size={16} className="mr-2" /> Khách hàng cũ
                                    </button>
                                </div>

                                {customerType === 'old' && (
                                    <div className="mb-8 p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                                        <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2 block">Tra cứu số CCCD</label>
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                                                <input
                                                    value={lookupCCCD}
                                                    onChange={(e) => setLookupCCCD(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleLookupOldCustomer()}
                                                    placeholder="Nhập 12 số CCCD của khách hàng"
                                                    className="w-full pl-12 h-14 bg-white border border-emerald-200 rounded-xl text-sm font-bold text-emerald-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-emerald-300"
                                                />
                                            </div>
                                            <button
                                                onClick={handleLookupOldCustomer}
                                                disabled={isLookingUp || !lookupCCCD}
                                                className="h-14 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                            >
                                                {isLookingUp ? <Loader2 size={16} className="animate-spin" /> : 'Tra cứu'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <RegistrationForm
                                    cccd={cccd} setCccd={setCccd}
                                    fullName={fullName} setFullName={setFullName}
                                    dob={dob} setDob={setDob}
                                    issueDate={issueDate} setIssueDate={setIssueDate}
                                    gender={gender} setGender={setGender}
                                    address={address} setAddress={setAddress}
                                    phone={phone} setPhone={setPhone}
                                    email={email} setEmail={setEmail}
                                    password={password} setPassword={setPassword}
                                    frontImage={frontImage} backImage={backImage}
                                    avatarImage={avatarImage}
                                    onImageUpload={handleImageUpload}
                                    onAvatarUpload={handleAvatarUpload}
                                    onScan={handleScanCCCD}
                                    scanned={scanned}
                                    isScanning={isScanning}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Right: Official Summary Receipt */}
                <div className="col-span-4 flex flex-col gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Banknote size={16} className="text-indigo-600" />
                                Tóm tắt biên nhận
                            </h2>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">HY-{Math.random().toString(36).substring(7).toUpperCase()}</span>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Customer Section */}
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khách hàng</span>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-900 uppercase">{fullName || 'Chưa có thông tin'}</span>
                                    {scanned && <ShieldCheck size={14} className="text-emerald-500" />}
                                </div>
                                {cccd && <p className="text-[10px] text-slate-400 font-medium">CCCD: {cccd}</p>}
                            </div>

                            {/* Ticket Section */}
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại vé phát hành</span>
                                <div className="text-sm font-bold text-slate-900">
                                    {selectedPackage ? selectedPackage.name : 'Vui lòng chọn gói cước'}
                                </div>
                                {selectedPackage && (
                                    <p className="text-[10px] text-slate-500 italic">Hiệu lực: {selectedPackage.duration} kể từ ngày đăng ký</p>
                                )}
                            </div>

                            {/* Discount Section */}
                            <div className="pt-6 border-t border-slate-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khuyến mãi</span>
                                    <button
                                        onClick={() => setShowPromotionDialog(true)}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-tight flex items-center gap-1 transition-colors"
                                    >
                                        <RefreshCw size={10} /> Chọn mã
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                        <input
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value)}
                                            placeholder="Nhập mã ưu đãi"
                                            className="w-full pl-9 h-10 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:border-indigo-600 transition-all uppercase"
                                        />
                                    </div>
                                    <button
                                        onClick={handleApplyDiscount}
                                        disabled={isCheckingDiscount || !discountCode}
                                        className={`px-4 h-10 rounded-xl font-bold text-[10px] uppercase transition-all ${discountCode && !isCheckingDiscount ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-300'
                                            }`}
                                    >
                                        {isCheckingDiscount ? <Loader2 size={12} className="animate-spin" /> : 'Áp dụng'}
                                    </button>
                                </div>
                                {appliedDiscount && (
                                    <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-indigo-600" />
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-indigo-700 uppercase">{appliedDiscount.Name}</span>
                                                <span className="text-[10px] font-black text-indigo-600 uppercase">-{appliedDiscount.DiscountPercent ? `${appliedDiscount.DiscountPercent}%` : `${appliedDiscount.DiscountAmount.toLocaleString()}đ`}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => setAppliedDiscount(null)} className="text-indigo-300 hover:text-indigo-600"><X size={14} /></button>
                                    </div>
                                )}
                            </div>

                            {/* Financial Section */}
                            <div className="pt-6 border-t border-dashed border-slate-200 space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Đơn giá niêm yết</span>
                                    <span className="font-bold text-slate-900">{baseAmount.toLocaleString()} đ</span>
                                </div>
                                {discountValue > 0 && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-emerald-600 font-medium italic">Khuyến mãi đã giảm</span>
                                        <span className="font-bold text-emerald-600">-{discountValue.toLocaleString()} đ</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Phí dịch vụ POS</span>
                                    <span className="font-bold text-slate-900">Miễn phí</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                    <span className="text-sm font-bold text-slate-900 uppercase">Tổng cộng</span>
                                    <div className="text-right">
                                        <span className="text-xl font-black text-indigo-600">
                                            {totalAmount.toLocaleString()}
                                        </span>
                                        <span className="text-xs font-bold text-indigo-400 ml-1">đ</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto">
                            <button
                                onClick={() => setShowPaymentDialog(true)}
                                disabled={!selectedPackage || !fullName || !cccd}
                                className={`w-full h-14 rounded-xl flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest transition-all ${selectedPackage && fullName && cccd
                                        ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg active:scale-[0.98]'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                Tiến hành phát hành vé <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Business Guidance */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                                <Info size={16} className="text-slate-400" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Lưu ý nghiệp vụ</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                            Nhân viên cần kiểm tra tính nguyên vẹn của ảnh CCCD trước khi Quét OCR. Sau khi phát hành, thông tin không thể thay đổi.
                        </p>
                    </div>
                </div>
            </div>

            {/* Promotion Selection Dialog */}
            <Dialog
                showHeader={false}
                visible={showPromotionDialog}
                onHide={() => setShowPromotionDialog(false)}
                className="w-[500px] rounded-2xl"
                contentClassName="p-0 border-none shadow-2xl"
            >
                <div className="p-8 bg-white">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Danh sách khuyến mãi</h2>
                        <button onClick={() => setShowPromotionDialog(false)} className="text-slate-300 hover:text-slate-600 transition-colors"><X size={20} /></button>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                        {promotions.length === 0 ? (
                            <div className="py-10 text-center text-slate-400 font-medium">Hiện không có chương trình khuyến mãi nào</div>
                        ) : (
                            promotions.map((promo) => (
                                <button
                                    key={promo.Code}
                                    onClick={() => {
                                        setDiscountCode(promo.Code);
                                        setAppliedDiscount(promo);
                                        setShowPromotionDialog(false);
                                        toast.current?.show({ severity: 'success', summary: 'Giảm giá', detail: `Đã áp dụng: ${promo.Name}` });
                                    }}
                                    className="w-full p-4 rounded-xl border border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/20 flex items-center gap-4 transition-all group text-left"
                                >
                                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex flex-col items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <span className="text-[10px] font-black uppercase">{promo.DiscountPercent ? `${promo.DiscountPercent}%` : 'FIX'}</span>
                                        <QrCode size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-900 text-xs uppercase">{promo.Name}</div>
                                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Mã: {promo.Code}</div>
                                        <p className="text-[9px] text-slate-500 mt-1 line-clamp-1">{promo.Description || 'Áp dụng cho tất cả gói vé thời hạn'}</p>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </Dialog>

            {/* Payment Selection Dialog */}
            <Dialog
                showHeader={false}
                visible={showPaymentDialog}
                onHide={() => setShowPaymentDialog(false)}
                className="w-[450px] rounded-2xl overflow-hidden"
                contentClassName="p-0 border-none shadow-2xl"
            >
                <div className="p-8 bg-white">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Chọn hình thức thanh toán</h2>
                        <button onClick={() => setShowPaymentDialog(false)} className="text-slate-300 hover:text-slate-600 transition-colors"><X size={20} /></button>
                    </div>

                    <div className="space-y-3">
                        {paymentMethods.map((method) => {
                            const code = (method.Code || '').toUpperCase();
                            const isZalo = code.includes('ZALO');
                            const isCash = method.Name.toLowerCase().includes('tiền mặt');
                            return (
                                <button
                                    key={method.Id}
                                    onClick={() => handleProcessPayment(method)}
                                    className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all group ${
                                        isZalo
                                            ? 'border-blue-100 hover:border-blue-400 hover:bg-blue-50/20'
                                            : 'border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/20'
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        isZalo ? '' : 'bg-white border border-slate-100 text-slate-400 group-hover:text-indigo-600 transition-colors'
                                    }`} style={isZalo ? { background: 'linear-gradient(135deg,#0068FF,#00B4FF)' } : undefined}>
                                        {isZalo
                                            ? <span className="text-white font-black text-[11px]">ZLP</span>
                                            : isCash ? <Banknote size={24} /> : <CreditCard size={24} />}
                                    </div>
                                    <div className="text-left">
                                        <div className={`font-bold uppercase text-xs ${
                                            isZalo ? 'text-blue-700' : 'text-slate-900'
                                        }`}>{method.Name}</div>
                                        <div className="text-[9px] font-bold uppercase mt-0.5 text-slate-400">
                                            {isZalo ? 'Quét QR · Tự động xác nhận' : 'Xử lý ngay lập tức'}
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className={`ml-auto transition-colors ${
                                        isZalo ? 'text-blue-300 group-hover:text-blue-500' : 'text-slate-200 group-hover:text-indigo-600'
                                    }`} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Dialog>

            {/* Success & Official Ticket Release Dialog */}
            <Dialog
                header="Chi tiết vé điện tử"
                visible={showSuccessDialog}
                onHide={resetPOS}
                maximizable
                maximized
                className="w-full h-full"
                contentClassName="p-0 border-none overflow-y-auto"
            >
                <div className="flex flex-col items-center p-10 bg-white min-h-full">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Phát hành vé thành công</h2>
                    <p className="text-sm text-slate-400 mb-10 font-medium">Vé đã được kích hoạt và gán cho hồ sơ hành khách</p>

                    {/* Minimalist Professional Digital Ticket Card */}
                    <div className="w-full max-w-[600px] bg-[#0a0a0a] rounded-3xl p-10 text-white mb-8 border border-slate-800 shadow-xl">
                        <div className="flex justify-between items-start mb-8 pb-8 border-b border-white/10">
                            <div className="flex items-center gap-5">
                                {avatarImage && (
                                    <img src={avatarImage} alt="Avatar" className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0" />
                                )}
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hành khách</div>
                                    <div className="text-xl font-black text-white uppercase tracking-tight">{fullName}</div>
                                    <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">ID: {cccd}</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số hiệu vé</div>
                                <div className="text-2xl font-black text-white tracking-widest">
                                    #{ticketDetails?.ticket_id ? ticketDetails.ticket_id.substring(0, 8).toUpperCase() : '---'}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-inner">
                                <QRCode value={ticketDetails?.qr_code || "N/A"} size={260} level="H" />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-5 font-bold uppercase tracking-widest">Mã vạch dùng để qua cửa kiểm soát</p>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-white/10">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                <span className="text-slate-500">Loại hình:</span>
                                <span className="text-slate-200">{selectedPackage?.name}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                <span className="text-slate-500">Hạn sử dụng:</span>
                                <span className="text-white">
                                    {ticketDetails?.expiry_date ? new Date(ticketDetails.expiry_date).toLocaleDateString('vi-VN') : '---'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full max-w-[600px]">
                        <button
                            onClick={() => window.print()}
                            className="flex-1 h-14 rounded-2xl bg-black text-white font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg"
                        >
                            <Printer size={20} /> In Mã Thẻ Vé
                        </button>
                        <button
                            onClick={resetPOS}
                            className="h-14 px-10 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            Hoàn tất
                        </button>
                    </div>
                </div>
            </Dialog>

            <style jsx global>{`
        .p-dialog-content { border-radius: 0 0 1.5rem 1.5rem !important; overflow-y: auto !important; overflow-x: hidden !important; }
        .p-dialog-header { border-radius: 1.5rem 1.5rem 0 0 !important; }
        @media print {
            body * { visibility: hidden; }
            .p-dialog * { visibility: visible; }
            .p-dialog { position: absolute; left: 0; top: 0; width: 100%; }
            .p-dialog-header { display: none !important; }
        }
      `}</style>

            {/* Loading ZaloPay */}
            {isCreatingZaloPay && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-2xl animate-ping opacity-25"
                            style={{ background: 'linear-gradient(135deg,#0068FF,#00C2FF)' }} />
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
                            style={{ background: 'linear-gradient(135deg,#0068FF,#00B4FF)' }}>
                            <span className="text-white font-black text-base">ZLP</span>
                        </div>
                    </div>
                    <p className="text-white font-black text-base">Đang tạo đơn ZaloPay...</p>
                    <div className="flex gap-1.5">
                        {[0,0.15,0.3].map((d,i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                                style={{ animationDelay: `${d}s` }} />
                        ))}
                    </div>
                </div>
            )}

            {/* ZaloPay Dialog */}
            <ZaloPayDialog
                visible={showZaloPayDialog}
                onHide={() => setShowZaloPayDialog(false)}
                orderId={zaloOrderId}
                preOrderData={zaloPreOrderData}
                onSuccess={(ticketData) => {
                    setShowZaloPayDialog(false);
                    const detail = ticketData?.details?.[0] || ticketData;
                    setTicketDetails({
                        ticket_id:   detail?.Id || ticketData?.Id,
                        qr_code:     detail?.qr_token || 'N/A',
                        expiry_date: detail?.EndDate || null,
                    });
                    setShowSuccessDialog(true);
                    toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'ZaloPay: Đã phát hành vé!', life: 3000 });
                }}
                onError={(msg) => toast.current?.show({ severity: 'error', summary: 'ZaloPay lỗi', detail: msg, life: 4000 })}
            />
        </PageWrapper>
    );
}
