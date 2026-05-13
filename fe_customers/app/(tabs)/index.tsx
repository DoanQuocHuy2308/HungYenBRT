import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions, Modal, Image as RNImage } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Swiper from 'react-native-swiper';

import { useCustomerAuth } from '../../hooks/AuthProvider';
import { BASE_URL } from '../../api_client/axiosClient';
import { ticketService } from '../../services/ticket.service';
import { LinearGradient } from 'expo-linear-gradient';

const BANNERS = [
  require('../../assets/images/banner.png'),
  require('../../assets/images/banner1.png'),
  require('../../assets/images/banner2.png'),
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { userData } = useCustomerAuth();
  const [isAvatarOpen, setIsAvatarOpen] = React.useState(false);
  const [closestTicket, setClosestTicket] = React.useState<any>(null);

  const fetchClosestTicket = async () => {
    if (!userData || !userData.id) return;
    try {
      const res = await ticketService.getMyOrders(userData.id);
      if (res.success && res.data) {
        let allDetails: any[] = [];
        res.data.forEach((order: any) => {
          if (order.details && order.details.length > 0) {
            order.details.forEach((detail: any) => {
              // Chỉ lấy vé còn hạn hoặc đang sử dụng
              if (['ACTIVE', 'UNUSED'].includes(detail.status)) {
                allDetails.push(detail);
              }
            });
          }
        });

        if (allDetails.length > 0) {
           // Ưu tiên vé ACTIVE trước, sau đó là vé UNUSED, sau đó sắp xếp theo ngày hết hạn hoặc ngày mua
           allDetails.sort((a, b) => {
              if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
              if (b.status === 'ACTIVE' && a.status !== 'ACTIVE') return 1;
              
              const dateA = a.expiry_date ? new Date(a.expiry_date).getTime() : new Date(a.purchase_date || Date.now()).getTime();
              const dateB = b.expiry_date ? new Date(b.expiry_date).getTime() : new Date(b.purchase_date || Date.now()).getTime();
              return dateA - dateB;
           });
           setClosestTicket(allDetails[0]);
        } else {
           setClosestTicket(null);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Vô thời hạn';
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchClosestTicket();
    }, [userData?.id])
  );

  const avatarUri = (userData?.avatar && userData.avatar.trim() !== "") 
    ? { uri: `${BASE_URL}${userData.avatar.startsWith('/') ? '' : '/'}${userData.avatar}` }
    : require('../../assets/images/icon.png');

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <StatusBar style="light" />
      
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Premium Banner Section with Bottom Curve */}
        <View className="w-full h-[300px] relative bg-[#5E3A21] rounded-b-[40px] overflow-hidden shadow-2xl shadow-stone-400">
          <Swiper
            autoplay
            autoplayTimeout={5}
            showsPagination={true}
            activeDot={<View className="w-5 h-1.5 rounded-full bg-amber-400 mx-1" />}
            dot={<View className="w-1.5 h-1.5 rounded-full bg-white/40 mx-1" />}
            paginationStyle={{ bottom: 85 }}
          >
            {BANNERS.map((banner, index) => (
              <Image
                key={index}
                source={banner}
                style={{ width: '100%', height: 300 }}
                contentFit="cover"
              />
            ))}
          </Swiper>

          {/* Elegant Overlay Gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(94, 58, 33, 0.4)', '#5E3A21']}
            className="absolute bottom-0 w-full h-32"
          />

          {/* Absolute Header - Floating Glass Entry */}
          <View pointerEvents="box-none" className="absolute top-12 left-0 w-full px-5 flex-row items-center justify-between z-10">
            
            <View 
               className="flex-row items-center bg-white/50 backdrop-blur-2xl pr-5 pl-1.5 py-1.5 rounded-full border border-white/20 shadow-2xl"
            >
              <TouchableOpacity onPress={() => setIsAvatarOpen(true)} className="relative">
                <View className="w-11 h-11 bg-white rounded-full overflow-hidden border-2 border-white/80 shadow-md">
                  <Image source={avatarUri} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                </View>
                <View className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              </TouchableOpacity>

              <TouchableOpacity 
                className="ml-3" 
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Text className="text-gray-700 font-black text-[15px] tracking-tight">
                  {userData?.name || "Khách Hàng"}
                </Text>
                <Text className="text-gray-700/70 text-[11px] font-bold tracking-widest uppercase mt-0.5">
                  {userData?.cccd_number ? `*******${userData.cccd_number.slice(-4)}` : "Chưa định danh"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Premium Notification Button */}
            <TouchableOpacity 
              className="w-11 h-11 bg-white/10 rounded-full items-center justify-center backdrop-blur-2xl border border-white/20 relative"
              onPress={() => router.push('/notifications' as any)}
            >
              <MaterialCommunityIcons name="bell-ring-outline" size={24} color="white" />
              <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-[#5E3A21]" />
            </TouchableOpacity>
          </View>

          {/* Banner Caption Info */}
          <View className="absolute bottom-16 left-8">
            <Text className="text-white/60 text-xs font-black uppercase tracking-[3px] mb-1">Tin mới nhất</Text>
            <Text className="text-white font-black text-xl tracking-tight">Hành trình Xanh cùng BRT</Text>
          </View>
          
        </View>

        <View className="px-5 -mt-10 space-y-6 pb-32 z-20">
          
          {/* Nearest Station Card - Premium Style */} 
          <View className="bg-white rounded-[28px] p-5 flex-row items-center shadow-2xl shadow-stone-200 border border-stone-50">
            <View className="w-14 h-14 bg-amber-50 rounded-2xl items-center justify-center">
               <MaterialCommunityIcons name="google-maps" size={32} color="#7A5448" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-[#5E3A21] font-black text-[16px]">Trạm gần nhất</Text>
              <Text className="text-stone-400 text-[12px] font-bold mt-1">Sử dụng GPS để tìm trạm quanh bạn</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
          </View>

          {/* Feature Grid - Clean & Minimalist */}
          <View className="flex-row justify-between gap-3 my-2 px-1">
            <FeatureButton 
              icon="ticket-outline" 
              label="Vé lượt" 
              color="#F59E0B" 
              bgColor="#FFFBEB" 
              onPress={() => router.push('/single-ticket' as any)}
            />
            <FeatureButton 
              icon="calendar-check-outline" 
              label="Vé thời gian" 
              color="#DC2626" 
              bgColor="#FEF2F2" 
              onPress={() => router.push('/time-ticket' as any)}
            />
            <FeatureButton 
              icon="account-star-outline" 
              label="Vé ưu đãi" 
              color="#7A5448" 
              bgColor="#FDF2F0" 
              onPress={() => router.push('/discount-ticket' as any)}
            />
          </View>

          {/* VIP Journey Card - The Masterpiece */}
          {closestTicket ? (
            <TouchableOpacity 
              className="bg-[#5E3A21] rounded-[32px] p-7 shadow-2xl shadow-stone-400 relative overflow-hidden active:opacity-90"
              onPress={() => {
                router.push('/my-tickets');
              }}
            >
              {/* Card Background Patterns */}
              <View className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full" />
              <View className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-400/10 rounded-full" />
              
              <View className="flex-row justify-between items-start mb-6">
                 <View className="flex-1 pr-4">
                    <Text className="text-amber-400/80 font-black text-[11px] uppercase tracking-[4px] mb-2">Thẻ thành viên BRT</Text>
                    <Text className="text-white font-black text-2xl uppercase tracking-tighter" numberOfLines={2}>
                      {closestTicket.ticket_type?.Name || 'Vé lộ trình'}
                    </Text>
                 </View>
                 <View className="p-3 bg-white/10 rounded-2xl border border-white/20">
                    <MaterialCommunityIcons name="qrcode-scan" size={28} color="#FBBF24" />
                 </View>
              </View>

              <View className="flex-row items-end justify-between">
                 <View>
                    <Text className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-1">Trạng thái</Text>
                    {closestTicket.status === 'UNUSED' ? (
                      <Text className="text-blue-400 font-black text-lg">Chưa kích hoạt</Text>
                    ) : closestTicket.status === 'ACTIVE' ? (
                      <View>
                         <Text className="text-green-400 font-black text-lg mb-0.5">Đang sử dụng</Text>
                         <Text className="text-white/80 font-medium text-xs">
                           Hạn: Từ {closestTicket.StartDate ? formatDate(closestTicket.StartDate) : '???'} đến {closestTicket.EndDate ? formatDate(closestTicket.EndDate) : 'Không giới hạn'}
                         </Text>
                      </View>
                    ) : null}
                 </View>
                 <View className="bg-amber-400 px-6 py-3 rounded-2xl shadow-lg">
                    <Text className="text-[#5E3A21] font-black text-[13px] uppercase">Quét ngay</Text>
                 </View>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              className="bg-[#5E3A21] rounded-[32px] p-7 shadow-2xl shadow-stone-400 relative overflow-hidden active:opacity-90 items-center justify-center min-h-[160px]"
              onPress={() => router.push('/time-ticket' as any)}
            >
               <View className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full" />
               <View className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-400/10 rounded-full" />
               <MaterialCommunityIcons name="ticket-percent-outline" size={40} color="#FBBF24" className="mb-3" />
               <Text className="text-white font-black text-[16px] mb-1">Bạn chưa có vé nào</Text>
               <Text className="text-white/60 font-bold text-[12px] text-center">Mua ngay vé tháng để tiết kiệm chi phí di chuyển hàng ngày</Text>
            </TouchableOpacity>
          )}

          {/* High-End News Section */}
          <View className="mt-4 px-1">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[#5E3A21] font-black text-[20px]">Tin tức & Khám phá</Text>
              <TouchableOpacity>
                <Text className="text-stone-400 font-bold text-sm">Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between gap-3">
               <NewsCard 
                 image={require('../../assets/images/icon.png')} 
                 title="Foodtour Hưng Yên: Đi BRT ăn gì ngon?"
                 tag="Ẩm thực"
                 bgColor="#991B1B"
               />
               <NewsCard 
                 image={require('../../assets/images/icon.png')} 
                 title="Hướng dẫn sử dụng hệ thống vé mới"
                 tag="Cẩm nang"
                 bgColor="#1E3A8A"
               />
            </View>

            <TouchableOpacity className="mt-4 w-full h-32 bg-emerald-900 rounded-[28px] overflow-hidden shadow-xl shadow-stone-200">
                <Image source={require('../../assets/images/icon.png')} style={{width:'100%', height:'100%', opacity: 0.15}} contentFit="cover" />
                <View className="absolute inset-0 p-6 justify-center">
                    <Text className="text-emerald-400 font-black text-[10px] uppercase tracking-[4px] mb-1">Môi trường</Text>
                    <Text className="text-white font-black text-xl tracking-tighter">HÀNH TRÌNH XANH 2024</Text>
                    <Text className="text-white/60 text-[12px] mt-1 font-bold">Vì một Hưng Yên không khói bụi.</Text>
                </View>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      <AvatarModal 
        visible={isAvatarOpen} 
        onClose={() => setIsAvatarOpen(false)} 
        imageSource={avatarUri} 
      />
    </View>
  );
}

const FeatureButton = ({ icon, label, color, bgColor, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={{ backgroundColor: bgColor }} className="flex-1 rounded-[28px] py-6 px-2 items-center shadow-lg shadow-stone-100 border border-white">
    <View style={{ backgroundColor: 'white' }} className="w-12 h-12 rounded-2xl items-center justify-center mb-3 shadow-sm">
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </View>
    <Text className="text-[#5E3A21] font-black text-[13px]">{label}</Text>
  </TouchableOpacity>
);

const NewsCard = ({ image, title, tag, bgColor }: any) => (
  <TouchableOpacity style={{ backgroundColor: bgColor }} className="flex-1 h-44 rounded-[28px] overflow-hidden shadow-xl shadow-stone-100">
    <Image source={image} style={{ width: '100%', height: '100%', opacity: 0.15 }} contentFit="cover" />
    <View className="absolute inset-0 p-4 justify-end">
      <View className="bg-white/10 self-start px-2 py-0.5 rounded-md mb-2 border border-white/20">
        <Text className="text-white text-[9px] font-black uppercase tracking-widest">{tag}</Text>
      </View>
      <Text className="text-white font-black text-[14px] leading-5 tracking-tight" numberOfLines={3}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const AvatarModal = ({ visible, onClose, imageSource }: { visible: boolean; onClose: () => void; imageSource: any }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-[#1a1411]/95 items-center justify-center p-6">
        <TouchableOpacity 
          className="absolute top-12 right-6 z-50 w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/20"
          onPress={onClose}
        >
          <MaterialCommunityIcons name="close" size={28} color="white" />
        </TouchableOpacity>
        
        <View className="w-full aspect-square bg-white rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/10">
          <RNImage source={imageSource} className="w-full h-full" resizeMode="cover" />
        </View>
        
        <TouchableOpacity 
          onPress={onClose} 
          className="mt-12 bg-white/10 px-10 py-4 rounded-[20px] border border-white/20 active:bg-white/20"
        >
          <Text className="text-white font-black uppercase tracking-widest text-xs">Đóng xem ảnh</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
