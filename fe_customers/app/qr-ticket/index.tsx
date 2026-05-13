import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomerAuth } from '../../hooks/AuthProvider';
import { axiosClient } from '../../api_client/axiosClient';

export default function QrTicketScreen() {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const params = useLocalSearchParams();
  const { userData } = useCustomerAuth();

  const ticketId = (params.ticketId as string) || '';
  const displayId = ticketId.substring(0, 8).toUpperCase();
  const type = (params.type as string) || 'VÉ BRT';
  const routeStr = (params.route as string) || 'Tất cả các tuyến';
  const startDate = (params.startDate as string) || '';
  const expiry = (params.expiry as string) || '';
  const status = (params.status as string) || '';

  // State lưu token QR động (JWT) lấy từ server
  const [qrToken, setQrToken] = useState<string>(ticketId);

  useEffect(() => {
    if (!ticketId) return;

    const fetchToken = async () => {
      try {
        const res: any = await axiosClient.get(`/ticket-scan/qr/${ticketId}`);
        // axiosClient unwraps response.data tự động → res chính là {success, data: {token}}
        if (res?.success && res?.data?.token) {
          setQrToken(res.data.token);
        } else {
          // Fallback về ticketId tĩnh
          setQrToken(ticketId);
        }
      } catch (e) {
        console.log("Lỗi lấy token QR động:", e);
        setQrToken(ticketId);
      }
    };

    fetchToken();
    const timer = setInterval(fetchToken, 10000 );

    return () => clearInterval(timer);
  }, [ticketId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Vô thời hạn';
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <View className="flex-1 bg-[#DDB892]">

      {/* Orange Header bar mimicking the card top wrapper */}
      <View className="bg-[#5D4037] w-full items-center justify-between flex-row px-5 pb-5 z-10" style={{ paddingTop: insets.top + 16 }}>
        <View className="bg-white/30 px-3 py-1.5 rounded pr-4">
          <Text className="text-white font-extrabold text-[15px]">{type}</Text>
        </View>
        <Text className="text-white font-extrabold text-[16px]">{routeStr}</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* Main Card */}
        <View className="bg-white mx-4 rounded-3xl shadow-lg shadow-black/10 overflow-hidden" style={{ minHeight: screenHeight * 0.65 }}>

          {/* Top Half of Card (QR Code) */}
          <View className="pt-8 pb-4 items-center px-4 relative z-0">
            {/* Logo */}
            <View className="flex-row items-center justify-center mb-6">
              <View className="p-1 border border-[#5D4037] rounded-full w-8 h-8 items-center justify-center mr-2">
                <MaterialCommunityIcons name="train" size={18} color="#5D4037" />
              </View>
              <Text className="text-[#4E342E] font-extrabold text-xl italic tracking-widest">BRT</Text>
            </View>

            <View className="w-80 h-80 border-2 border-indigo-100 rounded-3xl p-3 items-center justify-center mb-6 bg-white shadow-xl shadow-indigo-100/50">
              <Image
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${qrToken}` }}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>

            <Text className="text-slate-500 font-medium text-[13px] text-center px-2">
              Quét mã để qua cổng. Vui lòng không đưa mã cho người khác.
            </Text>
          </View>

          {/* Dashed Separator with Cutouts */}
          <View className="flex-row items-center w-full relative h-[30px]">
            <View className="w-8 h-8 rounded-full bg-[#DDB892] absolute -left-4 z-20" />
            <View className="flex-1 h-[1px] border-t-[2px] border-dashed border-slate-200" />
            <View className="w-8 h-8 rounded-full bg-[#DDB892] absolute -right-4 z-20" />
          </View>

          {/* Bottom Half of Card (Details) */}
          <View className="px-5 pt-4 pb-6">
            <Text className="text-center font-extrabold text-[#334155] text-[17px] mb-6 tracking-wide uppercase">{type}</Text>

            <View className="flex-row justify-between mb-4">
              <Text className="text-slate-500 font-medium text-[14px]">Mã vé</Text>
              <Text className="text-slate-900 font-medium text-[14px]">{displayId}</Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <Text className="text-slate-500 font-medium text-[14px]">Trạng thái</Text>
              <Text className={`font-bold text-[14px] ${status === 'UNUSED' ? 'text-blue-500' : status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}`}>
                {status === 'UNUSED' ? 'Chưa kích hoạt' : status === 'ACTIVE' ? 'Đang sử dụng' : 'Hết hạn/Đã dùng'}
              </Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <Text className="text-slate-500 font-medium text-[14px]">
                {status === 'ACTIVE' ? 'Thời gian' : 'Ngày hết hạn'}
              </Text>
              <Text className="text-[#5D4037] font-bold text-[14px]">
                {status === 'UNUSED'
                  ? 'Tính từ lúc qua cổng'
                  : status === 'ACTIVE'
                    ? `${startDate && startDate !== 'undefined' && startDate !== 'null' ? formatDate(startDate) : '???'} - ${expiry && expiry !== 'undefined' && expiry !== 'null' ? formatDate(expiry) : '???'}`
                    : (expiry && expiry !== 'undefined' && expiry !== 'null')
                      ? formatDate(expiry)
                      : 'Không rõ hạn'}
              </Text>
            </View>

            <View className="flex-row justify-between mb-4 mt-2">
              <Text className="text-slate-500 font-medium text-[14px]">Người sử dụng</Text>
              <Text className="text-slate-900 font-medium text-[14px]">{userData?.name || 'Khách hàng'}</Text>
            </View>

            {userData?.cccd_number && (
              <View className="flex-row justify-between mb-4">
                <Text className="text-slate-500 font-medium text-[14px]">Số CCCD</Text>
                <Text className="text-slate-900 font-medium text-[14px]">{userData.cccd_number}</Text>
              </View>
            )}

            <View className="flex-row justify-between mb-6">
              <Text className="text-slate-500 font-medium text-[14px] w-1/3">Ga có thể xuống</Text>
              <Text className="text-slate-700 font-medium text-[13px] text-right w-2/3 leading-5">
                {routeStr}
              </Text>
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center py-2"
              onPress={() => router.push({
                pathname: '/ticket-details',
                params: {
                  ticketId: ticketId,
                  type: type,
                  route: routeStr,
                  startDate: startDate,
                  expiry: expiry
                }
              })}
            >
              <MaterialCommunityIcons name="information-outline" size={18} color="#5D4037" className="mr-1" />
              <Text className="text-[#5D4037] font-bold text-[15px] ml-1">Chi tiết vé</Text>
            </TouchableOpacity>

          </View>
        </View>

        <View className="h-6" />

      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View className="flex-row justify-between w-full px-5 py-4 bg-transparent" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
        <TouchableOpacity onPress={() => router.back()} className="flex-1 bg-white rounded-2xl py-4 items-center mr-2 shadow-sm shadow-black/10">
          <Text className="text-slate-800 font-extrabold text-[16px]">Trở về</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-[#5D4037] rounded-2xl py-4 items-center ml-2 shadow-sm shadow-stone-900/20"
          onPress={() => {
            // Refetch tickets or go to tickets screen
            router.push('/(tabs)/my-tickets' as any)
          }}
        >
          <Text className="text-white font-extrabold text-[16px]">Làm mới</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
