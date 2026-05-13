import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PriorityTicketsListScreen() {
  const insets = useSafeAreaInsets();

  const registrations = [
    { id: 1, title: 'Đăng ký ưu đãi', category: 'Học sinh sinh viên', date: '18/11/2025', status: 'Đã duyệt' },
  ];

  return (
    <View className="flex-1 bg-[#F1F5F9]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white z-10 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 -ml-2 items-center justify-center">
          <MaterialCommunityIcons name="arrow-left" size={26} color="#0f172a" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[17px] font-bold text-slate-900 mr-8">Danh sách đơn đăng kí</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 pt-5">
          
          {registrations.map(req => (
            <TouchableOpacity key={req.id} className="bg-white rounded-2xl p-4 shadow-sm shadow-slate-200/50 flex-row items-start mb-4">
              {/* Left Icon Square */}
              <View className="w-[60px] h-[60px] bg-[#E0F2FE] rounded-2xl items-center justify-center mr-4">
                <Text className="text-[#7A5448] font-black text-[28px]">H</Text>
              </View>

              {/* Main Content */}
              <View className="flex-1">
                <Text className="text-slate-900 font-bold text-[16px] mb-0.5">{req.title}</Text>
                <Text className="text-slate-800 text-[15px] mb-1">{req.category}</Text>
                <Text className="text-slate-400 font-medium text-[13px] mb-2">{req.date}</Text>
                <View className="self-start">
                  <View className="bg-green-100/80 px-2 py-1 flex-row items-center rounded-xl">
                    <MaterialCommunityIcons name="clock-time-three" size={14} color="#5E3A21" />
                    <Text className="text-green-700 font-bold text-[13px] ml-1 pr-1">{req.status}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
        </View>
      </ScrollView>

      {/* Fixed Bottom Button Area */}
      <View className="w-full bg-white px-5 py-4 border-t border-slate-100" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        <TouchableOpacity 
          className="w-full bg-[#5D4037] rounded-3xl py-4 items-center active:bg-[#5D4037]"
          onPress={() => router.push('/discount-ticket' as any)}
        >
          <Text className="text-white font-bold text-[16px]">Gửi đơn đăng ký mới</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
