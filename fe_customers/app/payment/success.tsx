import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function PaymentSuccessScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white items-center justify-between" style={{ paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 24) }}>
      <StatusBar style="dark" />
      
      <View className="flex-1 items-center justify-center px-6 w-full">
        {/* Success Icon */}
        <View className="w-28 h-28 bg-green-50 rounded-full items-center justify-center mb-6 border-8 border-green-100">
          <MaterialCommunityIcons name="check-bold" size={60} color="#10b981" />
        </View>

        <Text className="text-slate-900 font-black text-[24px] mb-2 text-center">Thanh toán thành công!</Text>
        <Text className="text-slate-500 font-medium text-[15px] text-center px-4 mb-10 leading-6">
          Đơn hàng mua vé của bạn đã được xác nhận và thiết lập vào tài khoản. Cảm ơn bạn đã đồng hành cùng Hưng Yên BRT.
        </Text>

        {/* Receipt Box */}
        <View className="w-full bg-[#FDFBF7] border border-[#EFDDC4] rounded-2xl p-5 shadow-sm">
          <View className="flex-row justify-between mb-3 border-b border-dashed border-slate-200 pb-3">
            <Text className="text-slate-500 font-medium">Mã giao dịch</Text>
            <Text className="text-slate-800 font-bold uppercase">PAY-A984B2</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-slate-500 font-medium">Loại vé</Text>
            <Text className="text-slate-800 font-bold">Vé lượt - 1 vé</Text>
          </View>
          <View className="flex-row justify-between pt-1">
            <Text className="text-slate-500 font-bold">Tổng thanh toán</Text>
            <Text className="text-[#5D4037] font-black text-[18px]">16.330 VNĐ</Text>
          </View>
        </View>
      </View>

      {/* Footer Nav */}
      <View className="w-full px-6 gap-y-3 pb-4">
        <TouchableOpacity 
          className="w-full bg-[#5D4037] rounded-2xl py-4 items-center shadow-lg shadow-orange-900/20"
          onPress={() => router.replace('/(tabs)' as any)}
        >
          <Text className="text-white font-extrabold text-[16px]">Về trang chủ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="w-full bg-slate-100 rounded-2xl py-4 items-center"
          onPress={() => router.replace('/(tabs)/my-tickets' as any)}
        >
          <Text className="text-slate-700 font-bold text-[16px]">Xem vé của tôi</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
