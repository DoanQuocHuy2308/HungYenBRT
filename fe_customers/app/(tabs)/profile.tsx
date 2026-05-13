import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomerAuth } from '../../hooks/AuthProvider';
import { BASE_URL, axiosClient } from '../../api_client/axiosClient';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { logout, userData } = useCustomerAuth();
  const [isAvatarOpen, setIsAvatarOpen] = React.useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = React.useState(false);
  const [myVouchers, setMyVouchers] = React.useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = React.useState(false);

  React.useEffect(() => {
    if (isVoucherModalOpen && userData?.id) {
      fetchVouchers();
    }
  }, [isVoucherModalOpen]);

  const fetchVouchers = async () => {
    setLoadingVouchers(true);
    try {
      const res: any = await axiosClient.get(`/vouchers/my-vouchers/${userData?.id}`);
      setMyVouchers(res.data?.data || res.data || []);
    } catch (e) {
      setMyVouchers([]);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  // Helper format ngày sinh sang VN (YYYY-MM-DD -> DD/MM/YYYY)
  const formatBirthday = (dateStr: string | undefined) => {
    if (!dateStr) return "Chưa cập nhật";
    try {
      const parts = dateStr.includes('T') ? dateStr.split('T')[0].split('-') : dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const [y, m, d] = parts;
      return `${d}/${m}/${y}`;
    } catch (e) {
      return dateStr;
    }
  };
   
  const avatarUri = userData?.avatar 
    ? { uri: `${BASE_URL}${userData.avatar.startsWith('/') ? '' : '/'}${userData.avatar}` }
    : require('@/assets/images/icon.png');

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Premium Header with Dynamic Gradient */}
        <View className="relative">
          <LinearGradient
            colors={['#5E3A21', '#7A5448', '#FDFBF7']}
            locations={[0, 0.4, 1]}
            style={{ paddingTop: insets.top + 30, paddingBottom: 40 }}
            className="px-8 rounded-b-[40px] shadow-2xl shadow-stone-400"
          >
            <View className="flex-row items-center">
              {/* Avatar with Glow Effect */}
              <TouchableOpacity 
                onPress={() => setIsAvatarOpen(true)}
                className="w-24 h-24 rounded-full bg-white/20 items-center justify-center p-1 mr-5 border border-white/30"
              >
                <View className="w-full h-full rounded-full bg-white overflow-hidden shadow-lg border-2 border-white">
                  <Image 
                    source={avatarUri} 
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                {/* VIP Badge icon if needed (Optional) */}
                <View className="absolute -bottom-1 -right-1 bg-amber-400 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-sm">
                   <MaterialCommunityIcons name="crown" size={16} color="white" />
                </View>
              </TouchableOpacity>
              
              <View className="flex-1">
                <Text className="text-white font-black text-[24px] mb-1 tracking-tight" numberOfLines={1}>
                  {userData?.name || "Khách Hàng"}
                </Text>
                <View className="flex-row items-center bg-white/10 self-start px-3 py-1 rounded-full border border-white/20">
                  <MaterialCommunityIcons name="calendar-range" size={14} color="rgba(255,255,255,0.8)" />
                  <Text className="text-white/80 font-bold text-[13px] ml-1.5 uppercase tracking-widest">{formatBirthday(userData?.birthday)}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View className="px-5 -mt-6">
          {/* Detailed Account Info - Modern Card */}
          <View className="bg-white rounded-[32px] p-6 shadow-xl shadow-stone-200 border border-stone-50 mb-8">
             <Text className="text-[#5E3A21] font-black text-xs uppercase tracking-[3px] mb-6 ml-1 opacity-60">Thông tin xác thực</Text>
             
             <View className="space-y-5">
                <View className="flex-row items-center justify-between pb-4 border-b border-stone-100">
                   <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-amber-50 rounded-lg items-center justify-center mr-3">
                         <MaterialCommunityIcons name="phone" size={18} color="#7A5448" />
                      </View>
                      <Text className="text-stone-500 font-bold text-[14px]">Số điện thoại</Text>
                   </View>
                   <Text className="text-stone-900 font-extrabold text-[15px]">{userData?.phone || "N/A"}</Text>
                </View>

                <View className="flex-row items-center justify-between pb-4 border-b border-stone-100">
                   <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-amber-50 rounded-lg items-center justify-center mr-3">
                         <MaterialCommunityIcons name="card-account-details" size={18} color="#7A5448" />
                      </View>
                      <Text className="text-stone-500 font-bold text-[14px]">Số định danh (CCCD)</Text>
                   </View>
                   <Text className="text-stone-900 font-extrabold text-[15px] letter-spacing-1">
                      {userData?.cccd_number?.replace(/\d(?=\d{4})/g, "*") || "N/A"}
                   </Text>
                </View>

                <View className="flex-row items-center justify-between">
                   <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-amber-50 rounded-lg items-center justify-center mr-3">
                         <MaterialCommunityIcons name="email-seal" size={18} color="#7A5448" />
                      </View>
                      <Text className="text-stone-500 font-bold text-[14px]">Địa chỉ Email</Text>
                   </View>
                   <Text className="text-stone-900 font-extrabold text-[15px] text-right flex-1 ml-4" numberOfLines={1}>
                      {userData?.email || "Chưa bổ sung"}
                   </Text>
                </View>
             </View>
          </View>

          {/* Payment Method Section */}
          <View className="flex-row justify-between items-end mb-5 px-1">
            <Text className="text-[#5E3A21] font-black text-[18px]">Thanh toán</Text>
            <TouchableOpacity>
              <Text className="text-amber-700 font-bold text-sm tracking-wide">Xem chi tiết</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-[#4E342E] rounded-[28px] p-6 shadow-xl shadow-stone-300 flex-row items-center mb-10 overflow-hidden relative">
            {/* Abstract Background pattern for card */}
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
            
            <View className="w-14 h-14 bg-white/10 rounded-2xl items-center justify-center mr-5 border border-white/20">
              <MaterialCommunityIcons name="wallet-outline" size={32} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-black text-[16px] mb-1">Ví Hưng Yên BRT</Text>
              <Text className="text-white/60 text-[12px]">Kích hoạt để nhận ưu đãi lượt đi</Text>
            </View>
            
            <TouchableOpacity className="bg-amber-400 px-5 py-2.5 rounded-2xl shadow-md">
              <Text className="text-[#4E342E] font-black text-[13px] uppercase">Mở Ví</Text>
            </TouchableOpacity>
          </View>

          {/* Utilities Section */}
          <View className="px-1 mb-5">
            <Text className="text-[#5E3A21] font-black text-[18px]">Tiện ích & Hỗ trợ</Text>
          </View>

          <View className="bg-white rounded-[32px] p-2 shadow-xl shadow-stone-200 border border-stone-50 mb-10 overflow-hidden">
            
            <UtilityItem 
              icon="ticket-percent" 
              iconBg="#FEF9C3" 
              iconColor="#CA8A04" 
              title="Voucher cá nhân" 
              desc="Xem các mã ưu đãi dành riêng cho bạn"
              onPress={() => setIsVoucherModalOpen(true)}
              divider
            />

            <UtilityItem 
              icon="account-group" 
              iconBg="#EEF2FF" 
              iconColor="#1E3A8A" 
              title="Quản lý vé ưu tiên" 
              desc="Theo dõi và đăng ký các loại vé trợ giá"
              onPress={() => router.push('/priority-tickets' as any)}
            />

            <UtilityItem 
              icon="calendar-clock" 
              iconBg="#FEF2F2" 
              iconColor="#991B1B" 
              title="Gia hạn tự động" 
              desc="Thanh toán tự động cho các loại vé tháng"
              divider
            />

            <UtilityItem 
              icon="account-multiple-plus" 
              iconBg="#F0FDF4" 
              iconColor="#166534" 
              title="Định danh hộ" 
              desc="Hỗ trợ bạn bè, người thân xác thực"
              onPress={() => router.push('/identify-others' as any)}
              divider
            />

            <UtilityItem 
              icon="shield-key-outline" 
              iconBg="#FFF7ED" 
              iconColor="#9A3412" 
              title="Cài đặt bảo mật" 
              desc="Mật khẩu, FaceID và bảo mật 2 lớp"
              onPress={() => router.push('/security-settings' as any)}
              divider
            />

            <UtilityItem 
              icon="headphones" 
              iconBg="#F5F3FF" 
              iconColor="#5B21B6" 
              title="Hỗ trợ trực tuyến" 
              desc="Giải đáp thắc mắc 24/7 về lộ trình"
              onPress={() => router.push('/help' as any)}
              divider
            />

          </View>

          {/* Logout Section */}
          <View className="items-center pb-16">
            <TouchableOpacity 
              className="flex-row items-center bg-rose-50 px-8 py-3.5 rounded-2xl border border-rose-100" 
              onPress={handleLogout}
            >
              <MaterialCommunityIcons name="logout-variant" size={20} color="#E11D48" className="mr-3" />
              <Text className="text-rose-600 font-extrabold text-[15px]">Gỡ định danh thiết bị</Text>
            </TouchableOpacity>
            <Text className="text-stone-300 text-[11px] mt-4 font-bold tracking-widest uppercase">Phát triển bởi Hưng Yên BRT Team</Text>
          </View>

        </View>
      </ScrollView>

      {/* Vouchers Modal */}
      <Modal visible={isVoucherModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsVoucherModalOpen(false)}>
        <View className="flex-1 bg-slate-50">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
            <View className="w-8" />
            <Text className="text-[17px] font-bold text-slate-900">Voucher của tôi</Text>
            <TouchableOpacity onPress={() => setIsVoucherModalOpen(false)} className="w-8 h-8 items-center justify-center bg-slate-100 rounded-full">
              <MaterialCommunityIcons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
            {loadingVouchers ? (
              <View className="items-center justify-center mt-10">
                <Text className="text-slate-500 font-medium mt-4">Đang tải dữ liệu...</Text>
              </View>
            ) : myVouchers.length === 0 ? (
              <View className="items-center justify-center mt-20">
                <MaterialCommunityIcons name="ticket-outline" size={64} color="#cbd5e1" />
                <Text className="text-slate-500 font-medium mt-4">Bạn chưa có voucher nào</Text>
              </View>
            ) : (
              myVouchers.map((v, idx) => (
                <View key={idx} className="bg-white rounded-2xl p-4 mb-4 border-l-4 border-[#7A5448] shadow-sm shadow-slate-200 flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-[#FDF8F5] items-center justify-center mr-4">
                    <MaterialCommunityIcons name="sale" size={24} color="#7A5448" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 font-bold text-[15px] mb-1">{v.registration?.discount_type?.Name || 'Voucher'}</Text>
                    <View className="flex-row items-center mb-1">
                      <Text className="text-[#7A5448] font-black text-[13px] bg-[#FDF8F5] px-2 py-0.5 rounded-md overflow-hidden">{v.Code}</Text>
                    </View>
                    {v.registration?.discount_type?.DiscountPercentage ? (
                      <Text className="text-emerald-600 font-bold text-[12px]">Giảm {v.registration.discount_type.DiscountPercentage}% (Vé thời gian)</Text>
                    ) : null}
                    <Text className="text-slate-400 text-[11px] mt-1">HSD: {new Date(v.End_Date).toLocaleDateString('vi-VN')}</Text>
                  </View>
                </View>
              ))
            )}
            <View className="h-10" />
          </ScrollView>
        </View>
      </Modal>

      {/* Avatar Viewer Modal */}
      <AvatarModal 
        visible={isAvatarOpen} 
        onClose={() => setIsAvatarOpen(false)} 
        imageSource={avatarUri} 
      />
    </View>
  );
}

const UtilityItem = ({ icon, iconBg, iconColor, title, desc, onPress, divider }: any) => (
  <TouchableOpacity 
    className={`flex-row items-center p-4 py-5 ${divider ? 'border-t border-stone-50' : ''}`}
    onPress={onPress}
  >
    <View style={{ backgroundColor: iconBg }} className="w-12 h-12 rounded-2xl items-center justify-center mr-4">
      <MaterialCommunityIcons name={icon} size={26} color={iconColor} />
    </View>
    <View className="flex-1">
      <Text className="text-stone-900 font-black text-[16px] mb-1">{title}</Text>
      <Text className="text-stone-400 font-medium text-[12px]">{desc}</Text>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
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
          <Image source={imageSource} className="w-full h-full" resizeMode="cover" />
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
