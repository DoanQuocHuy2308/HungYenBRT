import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator,
  Alert, Modal, TextInput, Animated, FlatList
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useCustomerAuth } from '../../hooks/AuthProvider';
import { ticketService } from '../../services/ticket.service';
import { axiosClient, BASE_URL } from '../../api_client/axiosClient';

// ─── Kiểu dữ liệu Promotion ──────────────────────────────────────────────────
interface Promotion {
  Code: string;
  Name: string;
  Description?: string;
  DiscountAmount?: number;
  DiscountPercent?: number;
  StartDate: string;
  EndDate: string;
  isActive?: boolean;
}

// ─── Tính giá sau giảm ────────────────────────────────────────────────────────
function calcFinalPrice(original: number, promo: Promotion | null): number {
  if (!promo) return original;
  if (promo.DiscountPercent) return Math.max(0, original - (original * Number(promo.DiscountPercent)) / 100);
  if (promo.DiscountAmount) return Math.max(0, original - Number(promo.DiscountAmount));
  return original;
}

// ─── Format tiền ────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

// ─── Promo Bottom Sheet ───────────────────────────────────────────────────────
function PromoSheet({
  visible,
  onClose,
  onSelect,
  selectedCode,
  originalPrice,
  userId,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (p: Promotion | null) => void;
  selectedCode: string;
  originalPrice: number;
  userId: string;
}) {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible) {
      setManualCode('');
      setError('');
      fetchPromos();
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 12 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 600, duration: 250, useNativeDriver: true }).start();
    }
  }, [visible]);

  const fetchPromos = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res: any = await axiosClient.get(`/vouchers/my-vouchers/${userId}`);
      const rawData = res.data?.data || res.data || [];
      const mapped = rawData.map((v: any) => ({
        Code: v.Code,
        Name: v.registration?.discount_type?.Name || 'Voucher cá nhân',
        Description: 'Áp dụng cho vé thời gian',
        DiscountPercent: v.registration?.discount_type?.DiscountPercentage || 0,
        StartDate: v.Start_Date,
        EndDate: v.End_Date,
        isActive: v.is_active
      }));
      setPromos(mapped);
    } catch {
      setPromos([]);
    } finally {
      setLoading(false);
    }
  };

  const applyManual = async () => {
    if (!userId) return;
    const code = manualCode.trim().toUpperCase();
    if (!code) { setError('Vui lòng nhập mã giảm giá'); return; }
    setLoading(true);
    setError('');
    try {
      const res: any = await axiosClient.get(`/vouchers/validate/${code}?userId=${userId}`);
      const v = res.data?.data || res.data;
      if (!v || !v.Code) { setError('Mã giảm giá không tồn tại'); return; }
      const promo: Promotion = {
        Code: v.Code,
        Name: v.registration?.discount_type?.Name || 'Voucher cá nhân',
        Description: 'Áp dụng cho vé thời gian',
        DiscountPercent: v.registration?.discount_type?.DiscountPercentage || 0,
        StartDate: v.Start_Date,
        EndDate: v.End_Date,
        isActive: v.is_active
      };
      const now = new Date();
      if (new Date(promo.EndDate) < now) { setError('Mã giảm giá đã hết hạn'); return; }
      onSelect(promo);
      onClose();
    } catch {
      setError('Mã voucher không hợp lệ hoặc không thuộc về bạn');
    } finally {
      setLoading(false);
    }
  };

  const discountLabel = (p: Promotion) => {
    if (p.DiscountPercent) return `Giảm ${p.DiscountPercent}%`;
    if (p.DiscountAmount) return `Giảm ${fmt(Number(p.DiscountAmount))}`;
    return '';
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}
      />
      <Animated.View
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
          maxHeight: '80%', transform: [{ translateY: slideAnim }],
          shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12, shadowRadius: 20, elevation: 20,
        }}
      >
        {/* Handle */}
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#cbd5e1' }} />
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: '#0f172a' }}>🏷️ Mã giảm giá</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={22} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Manual Input */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            borderWidth: 1.5, borderColor: error ? '#f87171' : '#e2e8f0',
            borderRadius: 14, paddingHorizontal: 14, height: 48, backgroundColor: '#f8fafc'
          }}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={20} color="#7A5448" />
            <TextInput
              style={{ flex: 1, marginLeft: 8, fontSize: 15, fontWeight: '600', color: '#0f172a', letterSpacing: 1 }}
              placeholder="Nhập mã giảm giá..."
              placeholderTextColor="#94a3b8"
              value={manualCode}
              onChangeText={t => { setManualCode(t); setError(''); }}
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={applyManual}
            />
            <TouchableOpacity
              onPress={applyManual}
              style={{ backgroundColor: '#5D4037', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 }}
            >
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Áp dụng</Text>}
            </TouchableOpacity>
          </View>
          {error ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 4 }}>{error}</Text> : null}
        </View>

        <View style={{ height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 20, marginVertical: 8 }} />

        <Text style={{ paddingHorizontal: 20, fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Mã khuyến mãi đang có
        </Text>

        {/* Promo List */}
        <FlatList
          data={promos}
          keyExtractor={item => item.Code}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          ListEmptyComponent={
            loading ? <ActivityIndicator color="#7A5448" style={{ marginTop: 24 }} /> :
              <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 24, fontSize: 14 }}>Không có mã khuyến mãi nào</Text>
          }
          renderItem={({ item }) => {
            const isSelected = item.Code === selectedCode;
            const saved = calcFinalPrice(originalPrice, item);
            const discount = originalPrice - saved;
            return (
              <TouchableOpacity
                onPress={() => { onSelect(isSelected ? null : item); if (!isSelected) onClose(); }}
                style={{
                  flexDirection: 'row', alignItems: 'center', padding: 14,
                  borderRadius: 16, marginBottom: 10,
                  borderWidth: 1.5,
                  borderColor: isSelected ? '#7A5448' : '#e2e8f0',
                  backgroundColor: isSelected ? '#FDF8F5' : '#fff',
                }}
              >
                {/* Icon */}
                <View style={{
                  width: 44, height: 44, borderRadius: 12, marginRight: 12, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isSelected ? '#7A5448' : '#f1f5f9'
                }}>
                  <MaterialCommunityIcons name="sale" size={22} color={isSelected ? '#fff' : '#7A5448'} />
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#7A5448', letterSpacing: 0.5, marginRight: 6 }}>{item.Code}</Text>
                    <View style={{ backgroundColor: '#fef3c7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#92400e' }}>{discountLabel(item)}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, color: '#334155', fontWeight: '600' }}>{item.Name}</Text>
                  {item.Description ? <Text style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{item.Description}</Text> : null}
                  {originalPrice > 0 && discount > 0 && (
                    <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '700', marginTop: 3 }}>
                      Tiết kiệm {fmt(discount)}
                    </Text>
                  )}
                </View>

                {/* Check */}
                <View style={{
                  width: 22, height: 22, borderRadius: 11,
                  borderWidth: 2, borderColor: isSelected ? '#7A5448' : '#cbd5e1',
                  backgroundColor: isSelected ? '#7A5448' : 'transparent',
                  alignItems: 'center', justifyContent: 'center', marginLeft: 8
                }}>
                  {isSelected && <MaterialCommunityIcons name="check" size={13} color="#fff" />}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </Animated.View>
    </Modal>
  );
}

// ─── Main Payment Screen ───────────────────────────────────────────────────────
export default function PaymentScreen() {
  const { userData } = useCustomerAuth();
  const params = useLocalSearchParams();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPromoSheet, setShowPromoSheet] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [dbPaymentMethods, setDbPaymentMethods] = useState<Array<{Id: number; Code: string; Name: string; IsActive: number}>>([]);

  // Map Code -> icon & color for display
  const ICON_MAP: Record<string, { icon: string; color: string; desc: string }> = {
    CASH:    { icon: 'cash',               color: '#16a34a', desc: 'Thanh toán trực tiếp tại quầy' },
    BANKING: { icon: 'bank-transfer',      color: '#0284c7', desc: 'Chuyển khoản ngân hàng / QRPay' },
    WALLET:  { icon: 'lightning-bolt',     color: '#0068FF', desc: 'ZaloPay, MoMo, VNPay...' },
    ZALOPAY: { icon: 'lightning-bolt',     color: '#0068FF', desc: 'Quét mã QR · Xác nhận tự động' },
    MOMO:    { icon: 'wallet-outline',     color: '#a21d70', desc: '' },
    CARD:    { icon: 'credit-card-outline',color: '#5D4037', desc: 'Cổng thanh toán VietinBank' },
  };

  // Fetch payment methods from DB on mount
  useEffect(() => {
    axiosClient.get('/payment-methods').then((res: any) => {
      const list = Array.isArray(res) ? res : (res.data || []);
      const active = list.filter((m: any) => m.IsActive);
      setDbPaymentMethods(active);
      // Pre-select: ưu tiên WALLET (ZaloPay), fallback về phương thức đầu tiên
      const wallet = active.find((m: any) => m.Code === 'WALLET');
      setSelectedMethod(wallet ? String(wallet.Id) : (active[0] ? String(active[0].Id) : ''));
    }).catch(() => {
      // Fallback nếu API lỗi
      setDbPaymentMethods([
        { Id: 1, Code: 'CASH',    Name: 'Tiền mặt',           IsActive: 1 },
        { Id: 2, Code: 'BANKING', Name: 'Chuyển khoản / QRPay', IsActive: 1 },
        { Id: 3, Code: 'WALLET',  Name: 'Ví điện tử',          IsActive: 1 },
      ]);
      setSelectedMethod('3');
    });
  }, []);

  // ZaloPay polling state
  const [showZaloModal, setShowZaloModal] = useState(false);
  const [zaloOrderId, setZaloOrderId] = useState('');
  const [zaloElapsed, setZaloElapsed] = useState(0);
  const [zaloQrData, setZaloQrData] = useState('');
  const [zaloPaid, setZaloPaid] = useState(false);
  const [zaloCheckError, setZaloCheckError] = useState('');
  const [isManualChecking, setIsManualChecking] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopZaloPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const idTicketType = Number(params.id_ticket_type);
  const ticketName = params.ticket_name as string;
  const quantity = Number(params.quantity);
  const price = Number(params.price);
  const fromLocId = params.from_loc_id ? Number(params.from_loc_id) : null;
  const fromLocName = params.from_loc_name as string;
  const toLocId = params.to_loc_id ? Number(params.to_loc_id) : null;
  const toLocName = params.to_loc_name as string;
  const proxyUserDataStr = params.proxy_user_data as string;
  const isProxy = !!proxyUserDataStr;
  // ticket_category_code: 'TRIP' = vé lượt, 'TIME' = vé thời gian
  const ticketCategoryCode = (params.ticket_category_code as string || '').toUpperCase();
  const isTimeTicket = ticketCategoryCode === 'TIME' || isProxy; // vé hộ cũng là time ticket
  const isPromoAllowed = isTimeTicket;

  // Nếu vé lượt đã chọn promo → xóa ngay
  useEffect(() => {
    if (!isPromoAllowed && selectedPromo) setSelectedPromo(null);
  }, [isPromoAllowed]);

  const finalPrice = calcFinalPrice(price, selectedPromo);
  const discountAmount = price - finalPrice;

  // Phương thức thanh toán lấy từ DB (đã được set trong useEffect)

  // ── ZaloPay / Wallet handler (dùng khi phương thức là WALLET/ZALOPAY) ───────
  const handleZaloPay = async () => {
    if (!userData?.id) { Alert.alert('Lỗi', 'Bạn chưa đăng nhập!'); return; }
    const methodId = Number(selectedMethod);
    setIsProcessing(true);
    try {
      const orderId = Date.now().toString(36).toUpperCase();
      const ticketPayload = isProxy
        ? { Id_Ticket_Type: idTicketType, userData: { ...JSON.parse(proxyUserDataStr), price: finalPrice }, id_payment_method: methodId, code_promotion: selectedPromo?.Code || null }
        : {
          Id_Ticket_Type: idTicketType, Id_User: userData.id, Quantity: quantity,
          price: Math.round(finalPrice / (quantity || 1)), id_payment_method: methodId,
          From_Location: fromLocId, To_Location: toLocId,
          code_promotion: selectedPromo?.Code || null
        };

      const res = await fetch(`${BASE_URL}/zalopay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalPrice,
          orderId,
          description: 'Hung Yen BRT - Thanh toan ve',
          ticketPayload,
          returnUrl: 'hungyen-brt://payment-success',
        }),
      });
      const data = await res.json();

      if (!data.success) {
        Alert.alert('ZaloPay lỗi', data.message || 'Không thể tạo đơn');
        return;
      }

      // Đơn 0đ (mã giảm 100%) — auto success
      if (data.is_zero_amount) {
        await new Promise(r => setTimeout(r, 1500)); // chờ BE xử lý
        Alert.alert('✅ Thành công', 'Phát hành vé thành công!', [
          { text: 'Xem vé', onPress: () => router.replace('/(tabs)/my-tickets' as any) }
        ]);
        return;
      }

      // Hiện QR trực tiếp trong app
      setZaloOrderId(orderId);
      setZaloElapsed(0);
      setZaloPaid(false);
      setZaloQrData(data.qr_code || data.order_url || '');
      setShowZaloModal(true);

      // Polling
      pollRef.current = setInterval(async () => {
        try {
          const qr = await fetch(`${BASE_URL}/zalopay/query/${orderId}`);
          const qd = await qr.json();
          if (qd.success && qd.status === 'PAID') {
            stopZaloPolling();
            setZaloPaid(true);
            setTimeout(() => {
              setShowZaloModal(false);
              Alert.alert('✅ Thành công', 'Thanh toán ZaloPay thành công!', [
                { text: 'Xem vé', onPress: () => router.replace('/(tabs)/my-tickets' as any) }
              ]);
            }, 2000);
          } else if (qd.status === 'FAILED') {
            stopZaloPolling();
            setZaloCheckError('Giao dịch thất bại. Vui lòng thử lại.');
          }
        } catch (e: any) {
          console.warn('[ZaloPay polling error]', e.message);
        }
      }, 3000);

      // Timeout 10 phút
      timerRef.current = setInterval(() => {
        setZaloElapsed(prev => {
          if (prev >= 600) {
            stopZaloPolling();
            setShowZaloModal(false);
            Alert.alert('Hết hạn', 'Giao dịch ZaloPay đã hết thời gian chờ.');
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Normal payment handler (CASH / BANKING) ──────────────────────────────────
  const handlePayment = async () => {
    const selectedDbMethod = dbPaymentMethods.find(m => String(m.Id) === selectedMethod);
    const methodCode = selectedDbMethod?.Code || '';
    // Nếu là ví điện tử (WALLET) → dùng ZaloPay flow
    if (methodCode === 'WALLET' || methodCode === 'ZALOPAY') { handleZaloPay(); return; }
    if (!userData || !userData.id) { Alert.alert('Lỗi', 'Bạn chưa đăng nhập!'); return; }
    setIsProcessing(true);
    try {
      let res;
      if (isProxy) {
        const proxyUserData = JSON.parse(proxyUserDataStr);
        res = await ticketService.purchaseTimeTicket({
          Id_Ticket_Type: idTicketType,
          userData: { ...proxyUserData, price: finalPrice },
          id_payment_method: Number(selectedMethod),
          code_promotion: selectedPromo?.Code || null,
          transaction_id: `MOB-PRX-${Date.now()}`,
        });
      } else {
        res = await ticketService.purchaseTicket({
          Id_Ticket_Type: idTicketType,
          Id_User: userData.id,
          Quantity: quantity,
          price: Math.round(finalPrice / (quantity || 1)),
          id_payment_method: Number(selectedMethod),
          IsFree: false,
          From_Location: fromLocId,
          To_Location: toLocId,
          code_promotion: selectedPromo?.Code || null,
          transaction_id: `MOB-${Date.now()}`,
        });
      }
      if (res.success) {
        Alert.alert('✅ Thành công', isProxy ? 'Mua vé hộ thành công!' : 'Thanh toán và phát hành vé thành công!', [
          { text: 'Xem vé ngay', onPress: () => router.replace('/(tabs)/my-tickets' as any) },
        ]);
      } else {
        Alert.alert('Thất bại', res.message || 'Giao dịch không thành công.');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi gọi API thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, paddingTop: 18 }}>
        <View style={{ width: 32 }} />
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#0f172a' }}>Thanh toán</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="close" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 20 }}>

          {/* Ticket Summary Card */}
          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', padding: 16, marginBottom: 16 }}>
            <Text style={{ color: '#334155', fontWeight: '700', fontSize: 15, marginBottom: 10 }}>
              {ticketName || 'Vé lượt'} | {quantity} vé
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#10b981" style={{ marginTop: 2 }} />
              <Text style={{ flex: 1, marginLeft: 6, color: '#334155', fontSize: 13 }}>
                <Text style={{ fontWeight: '700' }}>Điểm đi: </Text>{fromLocName || 'Tất cả các tuyến'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 }}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#ef4444" style={{ marginTop: 2 }} />
              <Text style={{ flex: 1, marginLeft: 6, color: '#334155', fontSize: 13 }}>
                <Text style={{ fontWeight: '700' }}>Điểm đến: </Text>{toLocName || 'Tất cả các tuyến'}
              </Text>
            </View>

            {/* Price breakdown */}
            <View style={{ borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#cbd5e1', paddingTop: 12, gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#64748b', fontSize: 13 }}>Giá gốc</Text>
                <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>{fmt(price)}</Text>
              </View>
              {selectedPromo && discountAmount > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#16a34a', fontSize: 13 }}>Giảm giá ({selectedPromo.Code})</Text>
                  <Text style={{ color: '#16a34a', fontWeight: '700', fontSize: 13 }}>-{fmt(discountAmount)}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, borderTopWidth: 1, borderColor: '#f1f5f9', paddingTop: 8 }}>
                <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 15 }}>Tổng thanh toán</Text>
                <Text style={{ color: '#5D4037', fontWeight: '800', fontSize: 18 }}>{fmt(finalPrice)}</Text>
              </View>
            </View>
          </View>

          {/* Promo Code Button - Chỉ hiện cho vé thời gian */}
          {isPromoAllowed ? (
            <TouchableOpacity
              onPress={() => setShowPromoSheet(true)}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                borderRadius: 16, borderWidth: 1.5,
                borderColor: selectedPromo ? '#7A5448' : '#e2e8f0',
                backgroundColor: selectedPromo ? '#FDF8F5' : '#fff',
                padding: 14, marginBottom: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: selectedPromo ? '#7A5448' : '#f1f5f9', marginRight: 12
                }}>
                  <MaterialCommunityIcons name="ticket-percent-outline" size={20} color={selectedPromo ? '#fff' : '#7A5448'} />
                </View>
                <View style={{ flex: 1 }}>
                  {selectedPromo ? (
                    <>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#7A5448' }}>{selectedPromo.Code} — {selectedPromo.Name}</Text>
                      <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '600', marginTop: 1 }}>
                        Tiết kiệm {fmt(discountAmount)}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>Chọn mã giảm giá</Text>
                      <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>Voucher ưu đãi hoặc mã khuyến mãi</Text>
                    </>
                  )}
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {selectedPromo && (
                  <TouchableOpacity onPress={(e) => { e.stopPropagation(); setSelectedPromo(null); }} style={{ marginRight: 8, padding: 4 }}>
                    <MaterialCommunityIcons name="close-circle" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                )}
                <MaterialCommunityIcons name="chevron-right" size={20} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          ) : (
            // Vé lượt — không áp dụng mã giảm giá
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              borderRadius: 16, borderWidth: 1.5, borderColor: '#f1f5f9',
              backgroundColor: '#f8fafc', padding: 14, marginBottom: 20, opacity: 0.6,
            }}>
              <View style={{
                width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#e2e8f0', marginRight: 12
              }}>
                <MaterialCommunityIcons name="ticket-percent-outline" size={20} color="#94a3b8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#94a3b8' }}>Mã giảm giá</Text>
                <Text style={{ fontSize: 11, color: '#cbd5e1', marginTop: 1 }}>Không áp dụng cho vé lượt</Text>
              </View>
              <MaterialCommunityIcons name="lock-outline" size={18} color="#cbd5e1" />
            </View>
          )}

          {/* Payment Methods - Dynamic from DB */}
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 14, textAlign: 'center' }}>Chọn phương thức thanh toán</Text>

          {dbPaymentMethods.length === 0 ? (
            <ActivityIndicator color="#0068FF" style={{ marginVertical: 20 }} />
          ) : (
            dbPaymentMethods.map((method) => {
              const isWallet = method.Code === 'WALLET' || method.Code === 'ZALOPAY';
              const isSelected = selectedMethod === String(method.Id);
              const ui = ICON_MAP[method.Code] || { icon: 'credit-card-outline', color: '#64748b', desc: '' };
              return (
                <TouchableOpacity
                  key={method.Id}
                  onPress={() => setSelectedMethod(String(method.Id))}
                  style={{
                    flexDirection: 'row', alignItems: 'center', padding: 14,
                    borderRadius: 16, marginBottom: 10, borderWidth: isWallet ? 2 : 1.5,
                    borderColor: isSelected ? ui.color : '#e2e8f0',
                    backgroundColor: isSelected ? `${ui.color}15` : '#fff',
                  }}
                >
                  {/* Radio */}
                  <View style={{
                    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
                    borderColor: isSelected ? ui.color : '#cbd5e1',
                    marginRight: 12, alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isSelected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: ui.color }} />}
                  </View>
                  {/* Icon */}
                  <View style={{
                    width: 40, height: 40, borderRadius: 12, alignItems: 'center',
                    justifyContent: 'center', marginRight: 12, backgroundColor: ui.color,
                  }}>
                    {isWallet
                      ? <Text style={{ color: '#fff', fontWeight: '900', fontSize: 10 }}>ZLP</Text>
                      : <MaterialCommunityIcons name={ui.icon as any} size={20} color="#fff" />}
                  </View>
                  {/* Label */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: isWallet ? '800' : '600', color: isWallet ? ui.color : '#0f172a' }}>
                      {method.Name}
                    </Text>
                    {ui.desc ? <Text style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{ui.desc}</Text> : null}
                  </View>
                  {isWallet && isSelected && (
                    <View style={{ backgroundColor: '#DBEAFE', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#0068FF' }}>KHUYẾN NGHỊ</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Sticky Pay Button */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#f1f5f9' }}>
        <TouchableOpacity
          onPress={handlePayment}
          disabled={isProcessing}
          style={{
            borderRadius: 20, paddingVertical: 16, alignItems: 'center',
            flexDirection: 'row', justifyContent: 'center',
            backgroundColor: isProcessing ? '#94a3b8'
              : (ICON_MAP[dbPaymentMethods.find(m => String(m.Id) === selectedMethod)?.Code || '']?.color || '#5D4037'),
          }}
        >
          {isProcessing && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
            {isProcessing ? 'Đang xử lý...' : `Thanh toán ${fmt(finalPrice)}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Promo Bottom Sheet */}
      <PromoSheet
        visible={showPromoSheet}
        onClose={() => setShowPromoSheet(false)}
        onSelect={setSelectedPromo}
        selectedCode={selectedPromo?.Code || ''}
        originalPrice={price}
        userId={userData?.id || ''}
      />

      {/* ZaloPay QR Modal */}
      <Modal transparent visible={showZaloModal} animationType="slide" onRequestClose={() => { stopZaloPolling(); setShowZaloModal(false); }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
            paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40,
          }}>
            {/* Handle bar */}
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0', alignSelf: 'center', marginBottom: 20 }} />

            {zaloPaid ? (
              // ── SUCCESS STATE ──
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <MaterialCommunityIcons name="check-circle" size={48} color="#16a34a" />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 6 }}>Thanh toán thành công!</Text>
                <Text style={{ fontSize: 14, color: '#64748b' }}>Hệ thống đang xử lý vé của bạn...</Text>
                <ActivityIndicator color="#16a34a" style={{ marginTop: 16 }} />
              </View>
            ) : (
              // ── QR STATE ──
              <>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#0068FF', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 11 }}>ZLP</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }}>Thanh toán ZaloPay</Text>
                      <Text style={{ fontSize: 12, color: '#64748b' }}>{fmt(finalPrice)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => { stopZaloPolling(); setShowZaloModal(false); }}>
                    <MaterialCommunityIcons name="close" size={22} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                {/* QR Code */}
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <View style={{
                    padding: 16, backgroundColor: '#fff', borderRadius: 20,
                    borderWidth: 2, borderColor: '#e0f0ff',
                    shadowColor: '#0068FF', shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
                  }}>
                    {zaloQrData ? (
                      <QRCode
                        value={zaloQrData}
                        size={220}
                        color="#0068FF"
                        backgroundColor="#fff"
                      />
                    ) : (
                      <ActivityIndicator size="large" color="#0068FF" style={{ width: 220, height: 220 }} />
                    )}
                  </View>
                </View>

                {/* Instructions */}
                <View style={{ backgroundColor: '#f0f7ff', borderRadius: 14, padding: 14, marginBottom: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0052CC', marginBottom: 6 }}>Hướng dẫn thanh toán</Text>
                  <Text style={{ fontSize: 12, color: '#334155', lineHeight: 18 }}>
                    {'1. Chup anh ma QR nay\n2. Mo ZaloPay => Quet ma\n3. Chon anh => Thanh toan\n4. He thong tu dong xac nhan sau vai giay'}
                  </Text>
                </View>

                {/* Timer */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ActivityIndicator size="small" color="#0068FF" />
                    <Text style={{ fontSize: 12, color: '#64748b' }}>Đang chờ xác nhận tự động...</Text>
                  </View>
                  <Text style={{
                    fontSize: 13, fontWeight: '700',
                    color: (600 - zaloElapsed) < 60 ? '#ef4444' : '#0068FF',
                    backgroundColor: (600 - zaloElapsed) < 60 ? '#fef2f2' : '#eff6ff',
                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                  }}>
                    {Math.floor((600 - zaloElapsed) / 60)}:{String((600 - zaloElapsed) % 60).padStart(2, '0')}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
