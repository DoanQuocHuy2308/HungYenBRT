import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Hệ thống bảo trì thành công',
    msg: 'Hệ thống trạm thu phí đã hoàn tất cập nhật. Cảm ơn bạn đã đồng hành.',
    time: '1 giờ trước',
    type: 'system',
    unread: true
  },
  {
    id: '2',
    title: 'Sắp hết hạn vé dùng nhiều lần',
    msg: 'Vé theo tháng của bạn chỉ còn hạn sử dụng trong 3 ngày tới. Vui lòng gia hạn để không bị gián đoạn.',
    time: '3 giờ trước',
    type: 'ticket',
    unread: true
  },
  {
    id: '3',
    title: 'Khuyến mãi 20% tháng 4',
    msg: 'Nhập mã BRT20 để nhận ưu đãi giảm 20% khi mua vé trên ứng dụng.',
    time: '1 ngày trước',
    type: 'promo',
    unread: false
  },
  {
    id: '4',
    title: 'Giao dịch thành công',
    msg: 'Thẻ công vụ - HMC vừa được quét qua cửa xoay tại Ga Cát Linh.',
    time: '1 ngày trước',
    type: 'success',
    unread: false
  }
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const getIconData = (type: string) => {
    switch(type) {
      case 'system': return { name: 'cog-refresh-outline', color: '#5D4037', bg: '#EFDDC4' };
      case 'ticket': return { name: 'ticket-outline', color: '#f97316', bg: '#ffedd5' };
      case 'promo': return { name: 'brightness-percent', color: '#10b981', bg: '#d1fae5' };
      case 'success': return { name: 'check-circle-outline', color: '#3b82f6', bg: '#dbeafe' };
      default: return { name: 'bell-outline', color: '#5D4037', bg: '#FDFBF7' };
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <StatusBar style="dark" />
      
      {/* Premium Header */}
      <View 
        className="flex-row items-center justify-between px-5 py-4 bg-white shadow-sm shadow-black/5 z-10 relative border-b border-gray-100"
        style={{ paddingTop: Math.max(insets.top, 20) + 10 }}
      >
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center -ml-2"
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="#0f172a" />
        </TouchableOpacity>
        
        <Text className="text-slate-800 font-extrabold text-lg tracking-wide flex-1 text-center mr-2">Thông báo</Text>
        
        <TouchableOpacity onPress={markAllRead}>
          <MaterialCommunityIcons name="check-all" size={24} color="#7A5448" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        
        {notifications.map((item, index) => {
          const icon = getIconData(item.type);
          return (
            <TouchableOpacity 
              key={item.id} 
              className={`flex-row p-4 mb-3 rounded-2xl border ${item.unread ? 'bg-white border-[#DDB892] shadow-sm shadow-black/5' : 'bg-[#FDFBF7] border-transparent'}`}
            >
              <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: icon.bg }}>
                <MaterialCommunityIcons name={icon.name as any} size={24} color={icon.color} />
              </View>
              
              <View className="flex-1">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className={`font-bold flex-1 mr-2 ${item.unread ? 'text-slate-800' : 'text-slate-600'}`}>{item.title}</Text>
                  <Text className="text-xs text-slate-400 font-medium">{item.time}</Text>
                </View>
                <Text className={`text-[13px] leading-5 ${item.unread ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                  {item.msg}
                </Text>
              </View>

              {item.unread && (
                <View className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </TouchableOpacity>
          );
        })}
        
        <View className="items-center py-6">
          <Text className="text-slate-400 text-sm font-medium">Đã tải hết thông báo</Text>
        </View>
        <View className="h-10" />
      </ScrollView>

    </View>
  );
}
