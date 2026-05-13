import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ticketService, Location, TicketType, TicketPrice } from '../../services/ticket.service';

export default function SingleTicketScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [ticketPrices, setTicketPrices] = useState<TicketPrice[]>([]);
  const [ticketType, setTicketType] = useState<TicketType | null>(null);
  
  const [selectedDeparture, setSelectedDeparture] = useState<Location | null>(null);
  const [showDepartureStations, setShowDepartureStations] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<Location | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [locRes, typeRes] = await Promise.all([
          ticketService.getLocations(),
          ticketService.getTicketTypes()
        ]);
        
        if (locRes.success) {
          const sortedLocs = locRes.data.sort((a, b) => (a.Order || 0) - (b.Order || 0));
          setLocations(sortedLocs);
          if (sortedLocs.length > 0) setSelectedDeparture(sortedLocs[0]);
        }
        
        if (typeRes.success) {
          // Id_Category === 1 thường là Vé lượt
          const singleTicketType = typeRes.data.find(t => t.Id_Category === 1);
          if (singleTicketType) {
            setTicketType(singleTicketType);
            const priceRes = await ticketService.getTicketPrices(singleTicketType.Id);
            if (priceRes.success) {
              setTicketPrices(priceRes.data);
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải cấu hình vé:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const calculatePrice = () => {
    if (!selectedDeparture || !selectedDestination || !ticketPrices.length) return 0;
    
    // Tìm giá vé đặc thù từ ga này đến ga kia
    const specificPrice = ticketPrices.find(
      p => p.From_Location_Id === selectedDeparture.Id && p.To_Location_Id === selectedDestination.Id
    );
    if (specificPrice) return Number(specificPrice.Price);

    // Tìm giá vé ngược lại (nếu có)
    const reversePrice = ticketPrices.find(
      p => p.From_Location_Id === selectedDestination.Id && p.To_Location_Id === selectedDeparture.Id
    );
    if (reversePrice) return Number(reversePrice.Price);

    // Nếu không có giá cụ thể theo trạm, lấy giá mặc định (From/To = null)
    const defaultPrice = ticketPrices.find(p => p.From_Location_Id === null && p.To_Location_Id === null);
    if (defaultPrice) return Number(defaultPrice.Price);

    return 15000; // Fallback
  };

  const unitPrice = calculatePrice();
  const totalPrice = unitPrice * quantity;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#5E3A21" />
        <Text className="mt-4 text-slate-500 font-bold">Đang tải cấu hình trạm...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-1 bg-[#F8FAFC] pt-3">
      {/* Premium Header */}
      <View className="flex-row items-center justify-center py-4 bg-white shadow-sm shadow-black/5 z-10 relative border-b border-gray-100">
        <Text className="text-[#5E3A21] font-extrabold text-lg tracking-wide uppercase">Mua {ticketType?.Name || 'vé lượt'}</Text>
        <TouchableOpacity 
          className="absolute right-4 w-9 h-9 bg-slate-100 rounded-full items-center justify-center"
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as any)}
        >
          <MaterialCommunityIcons name="close" size={20} color="#475569" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          
          {/* Section: Ga đi */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center flex-1">
              <MaterialCommunityIcons name="map-marker-circle" size={22} color="#5E3A21" style={{ marginRight: 8 }} />
              <Text className="text-slate-800 font-extrabold text-base flex-shrink">Ga đi: <Text className="text-[#5D4037]">{selectedDeparture?.Name || 'Chưa chọn'}</Text></Text>
            </View>
            <TouchableOpacity 
              className="flex-row items-center bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 ml-2"
              onPress={() => setShowDepartureStations(!showDepartureStations)}
            >
              <Text className="text-slate-700 font-semibold mr-1 text-sm">{showDepartureStations ? 'Thu gọn' : 'Đổi ga'}</Text>
              <MaterialCommunityIcons name={showDepartureStations ? "chevron-up" : "chevron-down"} size={18} color="#334155" />
            </TouchableOpacity>
          </View>
          
          {/* Horizontal Station List for Departure */}
          {showDepartureStations && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-5 px-5 pb-2 pt-1">
              <View className="flex-row gap-2">
                {locations.map((station) => (
                  <TouchableOpacity 
                    key={station.Id}
                    className={`px-4 py-2.5 rounded-full border ${selectedDeparture?.Id === station.Id ? 'border-[#5D4037] bg-[#5E3A21]/5 shadow-sm shadow-[#5E3A21]/20' : 'border-slate-200 bg-white shadow-sm shadow-black/5'}`}
                    onPress={() => setSelectedDeparture(station)}
                  >
                    <Text className={`font-bold ${selectedDeparture?.Id === station.Id ? 'text-[#5D4037]' : 'text-slate-600'}`}>{station.Name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Section: Chọn ga đến (Destination Grid) */}
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="map-marker-check" size={22} color="#f59e0b" style={{ marginRight: 8 }} />
            <Text className="text-slate-800 font-extrabold text-base">Chọn ga đến</Text>
          </View>
          
          <View className="flex-row flex-wrap justify-between pt-1">
            {locations.filter(l => l.Id !== selectedDeparture?.Id).map((station) => (
              <TouchableOpacity 
                key={station.Id}
                className={`w-[48%] py-4 rounded-2xl border mb-3 items-center justify-center shadow-sm px-2 ${selectedDestination?.Id === station.Id ? 'border-[#5D4037] bg-[#5E3A21]/5 shadow-[#5E3A21]/10' : 'border-slate-100 bg-white shadow-black/5'}`}
                onPress={() => setSelectedDestination(station)}
              >
                <Text className={`font-bold text-[14px] text-center ${selectedDestination?.Id === station.Id ? 'text-[#5D4037]' : 'text-slate-700'}`}>{station.Name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View className="h-40" />
        </View>
      </ScrollView>

      {/* Bottom Fixed Footer */}
      <View className="absolute bottom-0 w-full bg-white/95 backdrop-blur-3xl border-t border-slate-200 px-5 pt-4 pb-10 z-50 rounded-t-3xl shadow-2xl">
        <View className="flex-row justify-between items-center mb-5">
          <View className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 flex-1 mr-4">
             <Text className="text-slate-800 font-black text-base">Đơn giá</Text>
             <Text className="text-amber-600 font-bold text-sm mt-0.5">{unitPrice.toLocaleString('vi-VN')}đ / vé</Text>
          </View>
          <View className="flex-row items-center gap-5 bg-slate-50 border border-slate-200 rounded-full px-2 py-1">
            <TouchableOpacity 
              className={`w-10 h-10 rounded-full items-center justify-center ${quantity <= 1 ? 'bg-slate-100' : 'bg-white border border-slate-200 shadow-sm'}`}
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}
              disabled={quantity <= 1}
            >
              <MaterialCommunityIcons name="minus" size={20} color={quantity <= 1 ? "#cbd5e1" : "#334155"} />
            </TouchableOpacity>
            
            <Text className="text-xl font-extrabold w-6 text-center text-[#5E3A21]">{quantity}</Text>

            <TouchableOpacity 
              className="w-10 h-10 rounded-full bg-white border border-slate-200 items-center justify-center shadow-sm shadow-black/5"
              onPress={() => setQuantity(quantity + 1)}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#334155" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          className={`w-full py-4 rounded-2xl items-center shadow-lg ${selectedDestination ? 'bg-[#5D4037] shadow-sky-500/40' : 'bg-slate-300'}`}
          onPress={() => {
            if (!selectedDestination || !ticketType) {
              alert("Vui lòng chọn ga đến!");
              return;
            }
            // Chuyển sang trang thanh toán và mang theo parameters
            router.push({
              pathname: '/payment',
              params: {
                id_ticket_type: ticketType.Id,
                ticket_name: ticketType.Name,
                ticket_category_code: 'TRIP',
                quantity: quantity,
                price: totalPrice,
                from_loc_id: selectedDeparture?.Id,
                from_loc_name: selectedDeparture?.Name,
                to_loc_id: selectedDestination?.Id,
                to_loc_name: selectedDestination?.Name
              }
            });
          }}
          disabled={!selectedDestination}
        >
          <Text className="text-white font-black text-[17px] tracking-widest uppercase">
            {selectedDestination ? `THANH TOÁN ${totalPrice.toLocaleString('vi-VN')}đ` : 'CHỌN GA ĐẾN'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
  );
}
