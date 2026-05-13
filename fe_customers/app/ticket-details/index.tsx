import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomerAuth } from '../../hooks/AuthProvider';
import { axiosClient } from '../../api_client/axiosClient';

export default function TicketDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { userData } = useCustomerAuth();

  const ticketId = (params.ticketId as string) || '';
  const displayId = ticketId ? ticketId.substring(0, 8).toUpperCase() : 'VÉ MỚI';
  const type = (params.type as string) || 'VÉ BRT';
  const routeStr = (params.route as string) || 'Tất cả các tuyến';
  const expiry = (params.expiry as string) || '';
  const startDate = (params.startDate as string) || '';

  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Gọi API lấy lịch sử quét của vé
        const res: any = await axiosClient.get(`/ticket-logs/ticket/${ticketId}`);
        if (res?.success && Array.isArray(res?.data)) {
          // Sắp xếp: lần quét gần nhất lên đầu
          const sorted = [...res.data].sort(
            (a, b) => new Date(b.scan_time).getTime() - new Date(a.scan_time).getTime()
          );
          setUsageHistory(sorted);
        } else {
          setUsageHistory([]);
        }
      } catch (err) {
        console.error('Lỗi lấy lịch sử quét:', err);
        setUsageHistory([]);
      } finally {
        setLoading(false);
      }
    };
    if (ticketId) fetchHistory();
    else setLoading(false);
  }, [ticketId]);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    const date = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    return `${time} — ${date}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'undefined' || dateString === 'null') return 'Chưa kích hoạt';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Chưa kích hoạt';
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const getDirectionLabel = (dir: string) => {
    if (dir === 'ENTRY') return 'Vào ga';
    if (dir === 'EXIT')  return 'Ra khỏi ga';
    return 'Kiểm tra';
  };

  const getDirectionColor = (dir: string) => {
    if (dir === 'ENTRY') return { dot: '#22c55e', text: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
    if (dir === 'EXIT')  return { dot: '#ef4444', text: '#dc2626', bg: '#fff1f2', border: '#fecaca' };
    return { dot: '#3b82f6', text: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
  };

  const getDirectionIcon = (dir: string): any => {
    if (dir === 'ENTRY') return 'location-enter';
    if (dir === 'EXIT')  return 'location-exit';
    return 'barcode-scan';
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 z-10 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 -ml-2 items-center justify-center">
          <MaterialCommunityIcons name="arrow-left" size={26} color="#0f172a" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[18px] font-bold text-slate-900 mr-8">Thông tin vé</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">

          {/* Main Title Block */}
          <Text className="text-slate-800 font-extrabold text-[16px] mb-1.5 text-center leading-6 uppercase">
            {type} - {userData?.name || 'Khách hàng'}
          </Text>
          <Text className="text-slate-500 font-medium text-[15px] mb-4 text-center">{routeStr}</Text>
            
          {/* Card 1: Info Details */}
          <View className="bg-white rounded-2xl p-4 shadow-sm shadow-slate-200/50 mb-5 border border-slate-100">
            <View className="flex-row justify-between mb-3 items-center">
              <Text className="text-slate-500 font-medium text-[15px]">Mã vé:</Text>
              <Text className="text-[#5D4037] font-bold text-[15px]">{displayId}</Text>
            </View>
            <View className="flex-row justify-between mb-3 items-center">
              <Text className="text-slate-500 font-medium text-[15px]">Khách hàng:</Text>
              <Text className="text-slate-900 font-extrabold text-[15px]">{userData?.name || 'Không có tên'}</Text>
            </View>
            {userData?.cccd_number && (
              <View className="flex-row justify-between mb-3 items-center">
                <Text className="text-slate-500 font-medium text-[15px]">CMND/CCCD:</Text>
                <Text className="text-slate-900 font-extrabold text-[15px]">{userData.cccd_number}</Text>
              </View>
            )}
            <View className="flex-row justify-between items-center mt-1">
              <Text className="text-slate-500 font-medium text-[15px]">Hiệu lực:</Text>
              <Text className="text-slate-900 font-extrabold text-[15px]">
                {startDate && startDate !== 'undefined' && startDate !== 'null'
                  ? `${formatDate(startDate)} - ${expiry && expiry !== 'undefined' && expiry !== 'null' ? formatDate(expiry) : '???'}`
                  : 'Tính từ lúc qua cổng'}
              </Text>
            </View>
          </View>

          {/* Card 2: Allowed Stations */}
          <View className="bg-white rounded-2xl p-4 shadow-sm shadow-slate-200/50 mb-6 border border-slate-100">
            <Text className="text-slate-800 font-extrabold text-[14px] mb-2.5">Danh sách ga được phép lên/xuống:</Text>
            <Text className="text-slate-600 font-medium text-[14px] leading-6">{routeStr}</Text>
          </View>

          {/* Section 3: History Timeline */}
          <View className="flex-row items-center mb-4">
            <Text className="text-slate-800 font-extrabold text-[16px] flex-1">Lịch sử sử dụng</Text>
            {!loading && (
              <View className="bg-slate-100 rounded-full px-3 py-1">
                <Text className="text-slate-500 font-bold text-[13px]">{usageHistory.length} lần quét</Text>
              </View>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#5D4037" style={{ marginVertical: 24 }} />
          ) : usageHistory.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center border border-slate-100">
              <MaterialCommunityIcons name="history" size={40} color="#cbd5e1" />
              <Text className="text-slate-400 italic mt-3 text-[14px]">Chưa có lịch sử quét vé.</Text>
            </View>
          ) : (
            <View style={{ paddingBottom: 40, position: 'relative' }}>
              {/* Timeline Vertical Line */}
              <View style={{ position: 'absolute', left: 20, top: 20, bottom: 40, width: 2, backgroundColor: '#e2e8f0' }} />

              {usageHistory.map((item: any, index: number) => {
                const color = getDirectionColor(item.scan_direction);
                return (
                  <View key={index} style={{ flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' }}>
                    
                    {/* Dot trên timeline */}
                    <View style={{ width: 42, alignItems: 'center', paddingTop: 14, zIndex: 10 }}>
                      <View style={{
                        width: 16, height: 16, borderRadius: 8,
                        backgroundColor: color.dot,
                        borderWidth: 2, borderColor: '#fff',
                        shadowColor: color.dot, shadowOpacity: 0.5, shadowRadius: 4, elevation: 3
                      }} />
                    </View>
                    
                    {/* Content Card */}
                    <View style={{ flex: 1, borderRadius: 16, padding: 14, backgroundColor: color.bg, borderWidth: 1, borderColor: color.border }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <MaterialCommunityIcons name={getDirectionIcon(item.scan_direction)} size={15} color={color.text} />
                          <Text style={{ color: color.text, fontWeight: '800', fontSize: 14 }}>
                            {getDirectionLabel(item.scan_direction)}
                          </Text>
                        </View>
                        <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '500' }}>
                          {formatDateTime(item.scan_time)}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MaterialCommunityIcons name="map-marker-outline" size={15} color="#64748b" />
                        <Text style={{ color: '#334155', fontWeight: '600', fontSize: 14 }}>
                          {item.location?.Name || `Ga ID: ${item.location_id}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}
