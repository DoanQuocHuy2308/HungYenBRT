import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { authService } from '../../services/auth.service';

export default function IdentifyOthersStep1Screen() {
  const router = useRouter();
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Đang xử lý...');

  // Helper nén ảnh (Giảm tải server và quét QR tốt hơn)
  const optimizeImage = async (uri: string) => {
    try {
      const result = await manipulateAsync(
        uri,
        [{ resize: { width: 1000 } }], // Giảm kích thước xuống mức tối ưu cho thư viện pyzbar đọc QR
        { compress: 0.8, format: SaveFormat.JPEG }
      );
      return result.uri;
    } catch (e) {
      console.error("Optimize error:", e);
      return uri;
    }
  };

  const pickImage = async (setUri: (uri: string) => void) => {
    Alert.alert("Chọn ảnh", "Bạn muốn cung cấp hình ảnh CCCD của người này bằng cách nào?", [
      {
        text: "Chụp ảnh camera",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert("Lỗi", "Bạn cần cấp quyền máy ảnh để chụp");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 1 });
          if (!result.canceled && result.assets[0]) {
            setUri(result.assets[0].uri);
          }
        }
      },
      {
        text: "Chọn từ thư viện",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 1 });
          if (!result.canceled && result.assets[0]) {
            setUri(result.assets[0].uri);
          }
        }
      },
      { text: "Hủy", style: "cancel" }
    ]);
  };

  const handleNext = async () => {
    if (!frontUri || !backUri) {
      Alert.alert("Thiếu thông tin", "Bạn cần cập nhật đủ cả mặt trước và mặt sau CCCD để tiêp tục!");
      return;
    }

    setIsLoading(true);
    setLoadingMsg("Đang tối ưu ảnh...");
    try {
      const optimizedFront = await optimizeImage(frontUri);
      const optimizedBack = await optimizeImage(backUri);

      // Quét QR
      setLoadingMsg("Đang quét mã QR CCCD...");
      let formData = new FormData();
      formData.append('cccd_images', {
        uri: optimizedFront,
        type: 'image/jpeg',
        name: 'front.jpg',
      } as any);
      formData.append('cccd_images', {
        uri: optimizedBack,
        type: 'image/jpeg',
        name: 'back.jpg',
      } as any);

      const response: any = await authService.scanCccdQr(formData);

      if (!response.success || !response.data) {
        Alert.alert("Quét thất bại", response.message || "Hệ thống không tìm thấy mã QR hợp lệ trên CCCD. Vui lòng chụp lại rõ nét hơn.");
        return;
      }

      const scanResult = response.data;

      // Quét thành công
      router.push({
        pathname: '/identify-others/step2',
        params: {
          cccd: scanResult.cccd_number,
          fullName: scanResult.name,
          dob: scanResult.birthday,
          sex: scanResult.sex,
          address: scanResult.address,
          issueDate: scanResult.issue_date,
          frontUri: optimizedFront,
          backUri: optimizedBack
        }
      });

    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể kết nối với máy chủ AI. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FDFBF7]" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-[#EFDDC4] shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 -ml-2 items-center justify-center">
          <MaterialCommunityIcons name="chevron-left" size={30} color="#5D4037" />
        </TouchableOpacity>
        <Text className="flex-1 text-[17px] font-black text-[#5D4037] mr-8 text-center uppercase tracking-tight">Định danh hộ</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6 pb-20" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-[#FFFBEB] rounded-full items-center justify-center mb-4 border border-amber-100 shadow-inner">
            <MaterialCommunityIcons name="account-multiple-plus-outline" size={32} color="#F59E0B" />
          </View>
          <Text className="text-2xl font-black text-[#5D4037] mb-2 tracking-tight">Quét thẻ CCCD</Text>
          <Text className="text-sm text-stone-500 font-bold text-center leading-5 px-6 italic">
            Vui lòng cung cấp cả hai mặt CCCD của người bạn muốn định danh để hệ thống AI nhận dạng tự động.
          </Text>
        </View>

        <Text className="text-[#5D4037] font-black mb-3 uppercase tracking-[2px] text-[12px] ml-1">Mặt trước CCCD</Text>
        <TouchableOpacity
          className="w-full h-52 border-2 border-dashed border-[#DDB892] bg-white rounded-[32px] items-center justify-center mb-8 overflow-hidden relative shadow-sm shadow-stone-200"
          onPress={() => pickImage(setFrontUri)}
        >
          {frontUri ? (
            <View className="absolute inset-0 items-center justify-center bg-stone-900/10">
              <Image source={{ uri: frontUri }} className="absolute inset-0 w-full h-full opacity-90" style={{ resizeMode: 'cover' }} />
              <View className="absolute top-4 left-4 bg-emerald-500 rounded-full px-4 py-1.5 flex-row items-center shadow-lg border border-white/20">
                <MaterialCommunityIcons name="check-decagram" size={16} color="white" />
                <Text className="text-white font-black ml-1.5 text-[11px] uppercase">Đã chọn</Text>
              </View>
              <View className="w-14 h-14 bg-black/40 rounded-full items-center justify-center border border-white/30">
                <MaterialCommunityIcons name="camera-flip-outline" size={30} color="white" />
              </View>
            </View>
          ) : (
            <View className="items-center">
              <View className="w-16 h-16 bg-stone-50 rounded-full items-center justify-center shadow-inner mb-3">
                <MaterialCommunityIcons name="card-account-details-star-outline" size={32} color="#A1887F" />
              </View>
              <Text className="text-[#A1887F] font-black text-sm">Chụp mặt trước CCCD</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text className="text-[#5D4037] font-black mb-3 uppercase tracking-[2px] text-[12px] ml-1">Mặt sau CCCD</Text>
        <TouchableOpacity
          className="w-full h-52 border-2 border-dashed border-[#DDB892] bg-white rounded-[32px] items-center justify-center mb-8 overflow-hidden relative shadow-sm shadow-stone-200"
          onPress={() => pickImage(setBackUri)}
        >
          {backUri ? (
            <View className="absolute inset-0 items-center justify-center bg-stone-900/10">
              <Image source={{ uri: backUri }} className="absolute inset-0 w-full h-full opacity-90" style={{ resizeMode: 'cover' }} />
              <View className="absolute top-4 left-4 bg-emerald-500 rounded-full px-4 py-1.5 flex-row items-center shadow-lg border border-white/20">
                <MaterialCommunityIcons name="check-decagram" size={16} color="white" />
                <Text className="text-white font-black ml-1.5 text-[11px] uppercase">Đã chọn</Text>
              </View>
              <View className="w-14 h-14 bg-black/40 rounded-full items-center justify-center border border-white/30">
                <MaterialCommunityIcons name="camera-flip-outline" size={30} color="white" />
              </View>
            </View>
          ) : (
            <View className="items-center">
              <View className="w-16 h-16 bg-stone-50 rounded-full items-center justify-center shadow-inner mb-3">
                <MaterialCommunityIcons name="card-bulleted-outline" size={32} color="#A1887F" />
              </View>
              <Text className="text-[#A1887F] font-black text-sm">Chụp mặt sau CCCD</Text>
            </View>
          )}
        </TouchableOpacity>

        <View className="h-24" />
      </ScrollView>

      <View className="absolute bottom-0 w-full p-6 bg-white/80 backdrop-blur-xl border-t border-[#EFDDC4]" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
        <TouchableOpacity
          className="w-full py-5 rounded-[24px] items-center flex-row justify-center shadow-xl shadow-stone-300"
          style={{ backgroundColor: (frontUri && backUri && !isLoading) ? '#5D4037' : '#E2E8F0' }}
          disabled={!frontUri || !backUri || isLoading}
          onPress={handleNext}
        >
          {isLoading ? (
            <>
              <ActivityIndicator color="white" className="mr-3" />
              <Text className="font-black text-[15px] text-white uppercase tracking-widest italic">{loadingMsg}</Text>
            </>
          ) : (
            <>
              <Text className="font-black text-[16px] mr-2 uppercase tracking-widest" style={{ color: frontUri && backUri ? '#ffffff' : '#94A3B8' }}>Tiếp tục xử lý</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={frontUri && backUri ? "white" : "#94A3B8"} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
