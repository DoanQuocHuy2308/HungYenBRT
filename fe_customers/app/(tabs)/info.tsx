import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function InfoTabScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#F8FAFC] items-center justify-center px-6" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Premium Construction Icon */}
      <View className="relative items-center justify-center mb-8">
        <View className="w-40 h-40 bg-[#EFDDC4] rounded-full absolute opacity-30 blur-2xl" />
        <View className="w-32 h-32 bg-white rounded-full items-center justify-center shadow-xl shadow-orange-900/10 border-8 border-[#FDFBF7]">
          <MaterialCommunityIcons name="crane" size={56} color="#5D4037" />
        </View>
        <View className="absolute bottom-0 right-0 w-10 h-10 bg-[#5D4037] rounded-full items-center justify-center border-4 border-white">
          <MaterialCommunityIcons name="tools" size={18} color="white" />
        </View>
      </View>

      {/* Main Content */}
      <Text className="text-slate-900 font-black text-[22px] mb-3 text-center uppercase tracking-wider">
        Đang nâng cấp
      </Text>

      <Text className="text-slate-500 font-medium text-[15px] text-center px-4 leading-6 mb-10">
        Tính năng Bản đồ Tìm Ga và tra cứu hệ thống trạm hiện đang trong giai đoạn nâng cấp đồng bộ dữ liệu. Nó sẽ sớm được ra mắt trong bản cập nhật tiếp theo!
      </Text>

      {/* Action Button */}
      <TouchableOpacity
        className="w-full bg-[#5D4037] py-[16px] rounded-2xl items-center shadow-md shadow-orange-900/20 max-w-[250px]"
        onPress={() => router.navigate('/(tabs)' as any)}
      >
        <Text className="text-white font-bold text-[15px]">Quay về Trang chủ</Text>
      </TouchableOpacity>

    </View>
  );
}
