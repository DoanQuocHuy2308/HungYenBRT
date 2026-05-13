import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { authService } from '../../services/auth.service';

export default function RegisterStep1Screen() {
  const router = useRouter();
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Đang xử lý...');

  // Helper nén ảnh cho iPhone (Rất quan trọng để giảm tải cho server và tăng tốc độ quét QR)
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
    Alert.alert("Chọn ảnh", "Bạn muốn cung cấp hình ảnh CCCD bằng cách nào?", [
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
    setLoadingMsg("Đang tối ưu dung lượng ảnh...");
    try {
      // 1. Tối ưu ảnh (Phone chụp thường rất nặng, cần nén về JPEG)
      const optimizedFront = await optimizeImage(frontUri);
      const optimizedBack = await optimizeImage(backUri);

      // 2. Quét QR CCCD
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

      // 5. Quét thành công, chuyển dữ liệu sang Step 2
      router.push({
         pathname: '/register/step2',
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
      Alert.alert("Lỗi kết nối", "Không thể gọi API. Kiểm tra lại địa chỉ IP máy chủ trong axiosClient.ts.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-200 shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 -ml-2 items-center justify-center">
          <MaterialCommunityIcons name="arrow-left" size={26} color="#0f172a" />
        </TouchableOpacity>
        <Text className="flex-1 text-[17px] font-bold text-slate-900 mr-8 text-center">Đăng ký tài khoản</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6 pb-20" showsVerticalScrollIndicator={false}>
        
        <View className="items-center mb-8">
           <View className="w-16 h-16 bg-[#FDFBF7] rounded-full items-center justify-center mb-4 border border-[#EFDDC4]">
             <MaterialCommunityIcons name="card-account-details-outline" size={32} color="#5D4037" />
           </View>
           <Text className="text-xl font-black text-slate-800 mb-2">Định danh tự động</Text>
           <Text className="text-sm text-slate-500 font-medium text-center leading-5 px-4">
             Vui lòng chụp Mặt trước và Mặt sau thẻ Căn cước công dân gắn chip để hệ thống tự động nhận diện thông tin bản thân.
           </Text>
        </View>

        {/* MẶT TRƯỚC */}
        <Text className="text-slate-800 font-bold mb-3 uppercase tracking-wider text-[13px]">Mặt trước CCCD</Text>
        <TouchableOpacity 
          className="w-full h-56 border-2 border-dashed border-[#DDB892] bg-[#FDFBF7]/50 rounded-2xl items-center justify-center mb-8 overflow-hidden relative"
          onPress={() => pickImage(setFrontUri)}
        >
          {frontUri ? (
            <View className="absolute inset-0 items-center justify-center bg-slate-900/20">
              <Image source={{ uri: frontUri }} className="absolute inset-0 w-full h-full opacity-90" style={{ resizeMode: 'contain' }} />
              <View className="absolute top-4 left-4 bg-emerald-500 rounded-full px-4 py-1.5 flex-row items-center shadow-md">
                 <MaterialCommunityIcons name="check-circle" size={16} color="white" />
                 <Text className="text-white font-bold ml-1 text-xs">Đã cập nhật</Text>
              </View>
              <View className="w-16 h-16 bg-black/40 rounded-full items-center justify-center">
                <MaterialCommunityIcons name="camera-retake" size={30} color="white" />
              </View>
            </View>
          ) : (
            <>
              <View className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm shadow-orange-200 mb-2">
                 <MaterialCommunityIcons name="camera-plus" size={28} color="#7A5448" />
              </View>
              <Text className="text-[#5D4037] font-bold">Chạm để cung cấp ảnh</Text>
            </>
          )}
        </TouchableOpacity>

        {/* MẶT SAU */}
        <Text className="text-slate-800 font-bold mb-3 uppercase tracking-wider text-[13px]">Mặt sau CCCD</Text>
        <TouchableOpacity 
          className="w-full h-56 border-2 border-dashed border-[#DDB892] bg-[#FDFBF7]/50 rounded-2xl items-center justify-center mb-8 overflow-hidden relative"
          onPress={() => pickImage(setBackUri)}
        >
          {backUri ? (
            <View className="absolute inset-0 items-center justify-center bg-slate-900/20">
              <Image source={{ uri: backUri }} className="absolute inset-0 w-full h-full opacity-90" style={{ resizeMode: 'contain' }} />
              <View className="absolute top-4 left-4 bg-emerald-500 rounded-full px-4 py-1.5 flex-row items-center shadow-md">
                 <MaterialCommunityIcons name="check-circle" size={16} color="white" />
                 <Text className="text-white font-bold ml-1 text-xs">Đã cập nhật</Text>
              </View>
              <View className="w-16 h-16 bg-black/40 rounded-full items-center justify-center">
                <MaterialCommunityIcons name="camera-retake" size={30} color="white" />
              </View>
            </View>
          ) : (
            <>
              <View className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm shadow-orange-200 mb-2">
                 <MaterialCommunityIcons name="camera-plus" size={28} color="#7A5448" />
              </View>
              <Text className="text-[#5D4037] font-bold">Chạm để cung cấp ảnh</Text>
            </>
          )}
        </TouchableOpacity>
        
        <View className="h-20" />
      </ScrollView>

      {/* Button Navigate Step 2 */}
      <View className="absolute bottom-0 w-full p-5 bg-white border-t border-slate-100" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
         <TouchableOpacity 
           className="w-full py-[18px] rounded-2xl items-center flex-row justify-center shadow-sm"
           style={{ backgroundColor: (frontUri && backUri && !isLoading) ? '#5D4037' : '#cbd5e1' }}
           disabled={!frontUri || !backUri || isLoading}
           onPress={handleNext}
         >
           {isLoading ? (
             <>
               <ActivityIndicator color="white" className="mr-2" />
               <Text className="font-extrabold text-[15px] text-white italic">{loadingMsg}</Text>
             </>
           ) : (
             <>
               <Text className="font-extrabold text-[16px] mr-2" style={{ color: frontUri && backUri ? '#ffffff' : '#64748b' }}>Tiếp tục</Text>
               <MaterialCommunityIcons name="arrow-right" size={20} color={frontUri && backUri ? "white" : "#64748b"} />
             </>
           )}
         </TouchableOpacity>
      </View>

    </View>
  );
}
