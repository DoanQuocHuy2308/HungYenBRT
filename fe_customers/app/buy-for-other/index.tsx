import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '../../services/auth.service';

export default function BuyForOtherStep1Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const insets = useSafeAreaInsets();

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
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.5 });
          if (!result.canceled && result.assets[0]) {
            setUri(result.assets[0].uri);
          }
        }
      },
      { 
        text: "Chọn từ thư viện", 
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.5 });
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
    
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('cccd_images', {
        uri: frontUri,
        type: 'image/jpeg',
        name: 'front.jpg',
      } as any);
      formData.append('cccd_images', {
        uri: backUri,
        type: 'image/jpeg',
        name: 'back.jpg',
      } as any);

      const res = await authService.scanCccdQr(formData);
      if (res.success && res.data) {
        // Pass params to step 2 + OCR data
        router.push({
          pathname: '/buy-for-other/step2',
          params: {
            ...params,
            ocr_cccd: res.data.cccd_number || '',
            ocr_name: res.data.name || '',
            ocr_dob: res.data.birthday || '',
            ocr_address: res.data.address || '',
            ocr_issue_date: res.data.issue_date || '',
            front_image: frontUri, // we can upload base64 later or let backend handle it
            back_image: backUri
          }
        });
      } else {
        Alert.alert("Lỗi", res.message || "Không thể quét thẻ CCCD.");
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Lỗi server", error.message || "Đã xảy ra sự cố kết nối");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-200 shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 -ml-2 items-center justify-center">
          <MaterialCommunityIcons name="arrow-left" size={26} color="#0f172a" />
        </TouchableOpacity>
        <Text className="flex-1 text-[17px] font-bold text-slate-900 mr-8 text-center">Mua hộ vé</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6 pb-20" showsVerticalScrollIndicator={false}>
        
        <View className="items-center mb-8">
           <View className="w-16 h-16 bg-[#FDFBF7] rounded-full items-center justify-center mb-4 border border-[#EFDDC4]">
             <MaterialCommunityIcons name="card-account-details-outline" size={32} color="#5D4037" />
           </View>
           <Text className="text-xl font-black text-slate-800 mb-2">Đăng ký CCCD người mua hộ</Text>
           <Text className="text-sm text-slate-500 font-medium text-center leading-5 px-4">
             Vui lòng chụp Mặt trước và Mặt sau thẻ Căn cước công dân gắn chip để hệ thống tự động nhận diện thông tin vé được cấp.
           </Text>
        </View>

        {/* MẶT TRƯỚC */}
        <Text className="text-slate-800 font-bold mb-3 uppercase tracking-wider text-[13px]">Mặt trước CCCD</Text>
        <TouchableOpacity 
          className="w-full h-44 border-2 border-dashed border-[#DDB892] bg-[#FDFBF7]/50 rounded-3xl items-center justify-center mb-8 overflow-hidden relative"
          onPress={() => pickImage(setFrontUri)}
        >
          {frontUri ? (
            <View className="absolute inset-0 items-center justify-center bg-black">
              <Image source={{ uri: frontUri }} className="absolute inset-0 w-full h-full opacity-60" style={{ resizeMode: 'cover' }} />
              <View className="absolute top-4 left-4 bg-green-500 rounded-full px-3 py-1 flex-row items-center shadow-lg">
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
          className="w-full h-44 border-2 border-dashed border-[#DDB892] bg-[#FDFBF7]/50 rounded-3xl items-center justify-center mb-8 overflow-hidden relative"
          onPress={() => pickImage(setBackUri)}
        >
          {backUri ? (
            <View className="absolute inset-0 items-center justify-center bg-black">
              <Image source={{ uri: backUri }} className="absolute inset-0 w-full h-full opacity-60" style={{ resizeMode: 'cover' }} />
              <View className="absolute top-4 left-4 bg-green-500 rounded-full px-3 py-1 flex-row items-center shadow-lg">
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
           style={{ backgroundColor: frontUri && backUri ? '#5D4037' : '#cbd5e1' }}
           disabled={!frontUri || !backUri || isProcessing}
           onPress={handleNext}
         >
           {isProcessing ? (
             <ActivityIndicator color="white" />
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
