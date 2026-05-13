import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomerAuth } from '../../hooks/AuthProvider';
import { ticketService } from '../../services/ticket.service';

export default function MyTicketsScreen() {
  const insets = useSafeAreaInsets();
  const { userData } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    if (!userData || !userData.id) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await ticketService.getMyOrders(userData.id);
      if (res.success && res.data) {
        // Trải phẳng các chi tiết vé từ tất cả các đơn hàng
        let allDetails: any[] = [];
        res.data.forEach((order: any) => {
          if (order.details && order.details.length > 0) {
            order.details.forEach((detail: any) => {
              allDetails.push({
                ...detail,
                order_total_price: order.total_price, // Lưu lại giá gốc của đơn
                purchase_date: order.PurchaseDate
              });
            });
          }
        });

        // Sắp xếp vé mới mua lên đầu
        allDetails.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
        setTickets(allDetails);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách vé:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Cập nhật lại vé mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [userData?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không có hạn';
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Lọc vé
  const currentTickets = tickets.filter(t => {
    // Với vé lượt (Category 1) -> Chỉ vào Lịch sử khi đã USED (quét ở cổng Ra)
    if (t.ticket_type && t.ticket_type.Id_Category === 1) {
      return ['ACTIVE', 'UNUSED'].includes(t.status);
    }
    // Với vé thời gian (Category 2, 3) -> Chỉ vào lịch sử khi đã quá hạn EndDate hoặc bị khoá
    if (t.ticket_type && (t.ticket_type.Id_Category === 2 || t.ticket_type.Id_Category === 3)) {
      if (t.status === 'LOCKED' || t.status === 'EXPIRED') return false;
      const isExpired = t.EndDate && new Date() > new Date(t.EndDate);
      return !isExpired;
    }
    return ['ACTIVE', 'UNUSED'].includes(t.status);
  });

  const historyTickets = tickets.filter(t => {
    if (t.ticket_type && t.ticket_type.Id_Category === 1) {
      return !['ACTIVE', 'UNUSED'].includes(t.status);
    }
    if (t.ticket_type && (t.ticket_type.Id_Category === 2 || t.ticket_type.Id_Category === 3)) {
      if (t.status === 'LOCKED' || t.status === 'EXPIRED') return true;
      const isExpired = t.EndDate && new Date() > new Date(t.EndDate);
      return isExpired;
    }
    return !['ACTIVE', 'UNUSED'].includes(t.status);
  });

  const displayTickets = activeTab === 'current' ? currentTickets : historyTickets;

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="items-center justify-center py-4 bg-white border-b border-gray-100">
        <Text className="text-slate-900 font-extrabold text-[17px] tracking-wide">Ví vé của tôi</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity
          className={`flex-1 py-3.5 items-center border-b-[3px] ${activeTab === 'current' ? 'border-[#5D4037]' : 'border-transparent'}`}
          onPress={() => setActiveTab('current')}
        >
          <Text className={`font-bold text-[15px] ${activeTab === 'current' ? 'text-[#5D4037]' : 'text-slate-500'}`}>
            Vé hiện hành ({currentTickets.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3.5 items-center border-b-[3px] ${activeTab === 'history' ? 'border-[#5D4037]' : 'border-transparent'}`}
          onPress={() => setActiveTab('history')}
        >
          <Text className={`font-bold text-[15px] ${activeTab === 'history' ? 'text-[#5D4037]' : 'text-slate-500'}`}>
            Lịch sử vé
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ticket List */}
      <ScrollView
        className="flex-1 px-4 mt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#5E3A21" className="mt-10" />
        ) : displayTickets.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <MaterialCommunityIcons name="ticket-outline" size={64} color="#cbd5e1" />
            <Text className="text-slate-500 font-medium mt-4">Không có vé nào trong mục này</Text>
          </View>
        ) : (
          displayTickets.map((ticket, index) => {
            const isSingle = ticket.ticket_type?.Id_Category === 1;
            const fromLoc = ticket.fromLocation?.Name || 'Tất cả các tuyến';
            const toLoc = ticket.toLocation?.Name || '';
            const routeStr = isSingle && toLoc ? `${fromLoc} - ${toLoc}` : fromLoc;

            return (
              <TouchableOpacity
                key={ticket.Id || index}
                className="bg-white rounded-xl shadow-sm shadow-slate-200/50 border border-slate-100 mb-4 flex-row overflow-hidden relative"
                onPress={() => {
                  router.push({
                    pathname: '/qr-ticket',
                    params: {
                      ticketId: ticket.Id,
                      qrCode: ticket.Id, // Mã định danh duy nhất quét QR
                      type: ticket.ticket_type?.Name,
                      route: routeStr,
                      status: ticket.status,
                      startDate: ticket.StartDate,
                      expiry: ticket.EndDate
                    }
                  });
                }}
              >
                {/* Left indicator border */}
                <View className={`w-[4px] ${activeTab === 'history' ? 'bg-slate-300' : 'bg-[#5D4037]'}`} />

                <View className="flex-1 p-4 pb-3">
                  <View className="flex-row justify-between items-center mb-1.5">
                    <Text className="text-slate-900 font-extrabold text-[15px] tracking-wide">
                      {ticket.Id ? ticket.Id.substring(0, 8).toUpperCase() : `VÉ MỚI`}
                    </Text>
                    <View className="flex-row items-baseline">
                      <Text className="text-slate-900 font-extrabold text-[15px]">
                        {Number(ticket.price ?? ticket.order_total_price).toLocaleString('vi-VN')}{' '}
                      </Text>
                      <Text className="text-slate-900 font-bold underline text-xs">đ</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-slate-600 font-medium text-[14px]">{userData?.name || 'Khách hàng'}</Text>
                    <View className="bg-amber-100/80 px-2 py-0.5 rounded-md">
                      <Text className="text-amber-700 font-bold text-xs">{ticket.ticket_type?.Name || 'Vé BRT'}</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-slate-900 font-extrabold text-[14px] tracking-wide max-w-[65%]" numberOfLines={1}>
                      {routeStr}
                    </Text>
                    <Text className="text-slate-400 font-medium text-[11px]">{formatDate(ticket.purchase_date)}</Text>
                  </View>

                  {ticket.status === 'UNUSED' ? (
                    <Text className="text-slate-500 font-medium text-[12px] mb-3 italic">
                      Vé sẽ tự động kích hoạt khi quét qua cổng
                    </Text>
                  ) : ticket.status === 'ACTIVE' ? (
                    <Text className="text-[#5D4037] font-bold text-[12px] mb-3">
                      Từ {ticket.StartDate ? formatDate(ticket.StartDate) : '???'} đến {ticket.EndDate ? formatDate(ticket.EndDate) : 'Không giới hạn'}
                    </Text>
                  ) : (
                    <Text className="text-slate-400 font-medium text-[12px] mb-3">
                      {ticket.EndDate ? `Đã hết hạn lúc: ${formatDate(ticket.EndDate)}` : 'Vé đã hoàn thành / vô hiệu hóa'}
                    </Text>
                  )}

                  <View className="flex-row items-center justify-end mt-1">
                    <MaterialCommunityIcons
                      name={ticket.status === 'UNUSED' ? 'ticket-confirmation-outline' : ticket.status === 'ACTIVE' ? "clock-outline" : "check-circle-outline"}
                      size={14}
                      color={ticket.status === 'UNUSED' ? '#3b82f6' : ticket.status === 'ACTIVE' ? "#16a34a" : "#ef4444"}
                      style={{ marginRight: 4 }}
                    />
                    <Text className={`font-medium text-[12px] ${ticket.status === 'UNUSED' ? 'text-blue-500' : ticket.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}`}>
                      {ticket.status === 'UNUSED' ? 'Chưa sử dụng' : ticket.status === 'ACTIVE' ? 'Đang sử dụng' : ticket.status === 'EXPIRED' ? 'Hết hạn' : 'Đã sử dụng'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        )}

        {/* Empty state pad */}
        <View className="h-32" />
      </ScrollView>
    </View>
  );
}
