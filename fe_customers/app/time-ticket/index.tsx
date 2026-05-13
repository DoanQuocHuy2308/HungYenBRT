import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ticketService } from '../../services/ticket.service';

export default function TimeTicketScreen() {
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [buyForOther, setBuyForOther] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const typesRes = await ticketService.getTicketTypes();
        if (typesRes.success) {
          // Lấy vé thời gian (Category 2)
          const timeTypes = typesRes.data.filter(t => t.Id_Category === 2);
          
          const pkgs = await Promise.all(timeTypes.map(async (t) => {
            const priceRes = await ticketService.getTicketPrices(t.Id);
            const basePrice = priceRes.data.find(p => p.From_Location_Id === null)?.Price || 0;
            return {
              id: t.Id.toString(),
              name: t.Name,
              price: Number(basePrice)
            };
          }));
          
          // Sắp xếp theo giá tăng dần
          setPackages(pkgs.sort((a, b) => a.price - b.price));
        }
      } catch (error) {
        console.error("Lỗi khi lấy gói vé thời gian:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <View className="flex-1 bg-[#F8FAFC] pt-3">
        {/* Premium Header */}
        <View className="flex-row items-center justify-center py-4 bg-white shadow-sm shadow-black/5 z-10 relative border-b border-gray-100">
          <Text className="text-[#5E3A21] font-extrabold text-lg tracking-wide uppercase">Mua vé dùng nhiều lần</Text>
          <TouchableOpacity 
            className="absolute right-4 w-9 h-9 bg-slate-100 rounded-full items-center justify-center"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)' as any);
              }
            }}
          >
            <MaterialCommunityIcons name="close" size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-5">
            
            {/* Section 2: Chọn gói */}
            <View className="flex-row items-center mb-4">
              <MaterialCommunityIcons name="ticket-confirmation" size={22} color="#f59e0b" className="mr-2" />
              <Text className="text-slate-800 font-extrabold text-base">Chọn gói:</Text>
            </View>
            
            {isLoading ? (
              <ActivityIndicator size="large" color="#5E3A21" className="mt-10" />
            ) : packages.length === 0 ? (
              <Text className="text-center text-slate-500 mt-10">Chưa có gói vé nào khả dụng.</Text>
            ) : (
              <View className="gap-3">
                {packages.map((pkg) => (
                  <TouchableOpacity 
                    key={pkg.id}
                    className={`flex-row items-center px-4 py-3.5 rounded-2xl border ${selectedPackage === pkg.id ? 'border-[#5D4037] bg-sky-50 shadow-sm shadow-sky-500/20' : 'border-slate-200 bg-white shadow-sm shadow-black/5'}`}
                    onPress={() => setSelectedPackage(pkg.id)}
                  >
                    <MaterialCommunityIcons 
                      name="ticket-outline" 
                      size={28} 
                      color={selectedPackage === pkg.id ? '#5D4037' : '#94a3b8'} 
                      style={{ transform: [{ rotate: '-45deg' }] }}
                      className="mr-3"
                    />
                    <View>
                      <Text className={`font-extrabold text-[15px] mb-0.5 ${selectedPackage === pkg.id ? 'text-slate-900' : 'text-slate-900'}`}>
                        {pkg.name}
                      </Text>
                      <View className="flex-row items-baseline">
                        <Text className="font-extrabold text-[15px] text-[#5E3A21] mr-1">
                          {pkg.price.toLocaleString('vi-VN')}
                        </Text>
                        <Text className="font-bold text-xs text-slate-800">
                          VNĐ
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View className="h-44" />
          </View>
        </ScrollView>

        {/* Bottom Fixed Footer */}
        <View className="absolute bottom-0 w-full bg-white/95 backdrop-blur-3xl border-t border-slate-200 px-5 pt-4 pb-10 z-50 rounded-t-3xl shadow-2xl">
          
          <TouchableOpacity 
            className="flex-row items-center mb-5 ml-1"
            onPress={() => setBuyForOther(!buyForOther)}
          >
            <View className={`w-5 h-5 rounded-md border items-center justify-center mr-3 ${buyForOther ? 'bg-[#5D4037] border-[#5D4037]' : 'bg-white border-slate-300'}`}>
              {buyForOther && <MaterialCommunityIcons name="check" size={14} color="white" />}
            </View>
            <MaterialCommunityIcons name="account-multiple-outline" size={20} color="#475569" className="mr-1" />
            <Text className="text-slate-800 font-bold ml-1 text-[15px]">Mua vé hộ người khác</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className={`w-full py-4 rounded-2xl items-center shadow-lg ${selectedPackage ? 'bg-[#5D4037] shadow-sky-500/40' : 'bg-slate-300'}`}
            onPress={() => {
              const pkg = packages.find(p => p.id === selectedPackage);
              if (!pkg) {
                alert("Vui lòng chọn gói vé muốn mua!");
                return;
              }
              if (buyForOther) {
                router.push({
                  pathname: '/buy-for-other',
                  params: {
                    id_ticket_type: pkg.id,
                    ticket_name: pkg.name,
                    quantity: 1,
                    price: pkg.price,
                    from_loc_id: '',
                    from_loc_name: 'Tất cả các tuyến',
                    to_loc_id: '',
                    to_loc_name: ''
                  }
                });
              } else {
                router.push({
                  pathname: '/payment',
                  params: {
                    id_ticket_type: pkg.id,
                    ticket_name: pkg.name,
                    ticket_category_code: 'TIME',
                    quantity: 1,
                    price: pkg.price,
                    from_loc_id: '',
                    from_loc_name: 'Tất cả các tuyến',
                    to_loc_id: '',
                    to_loc_name: ''
                  }
                });
              }
            }}
            disabled={!selectedPackage}
          >
            <Text className={`font-black text-[17px] tracking-widest uppercase ${selectedPackage ? 'text-white' : 'text-slate-500'}`}>
              Xác nhận
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
