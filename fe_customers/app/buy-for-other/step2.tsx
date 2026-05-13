import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

export default function BuyForOtherStep2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  // Custom interactive state
  const [gender, setGender] = useState('Nam');
  const [email, setEmail] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Extract OCR and Ticket data
  const ocrCccd = (params.ocr_cccd as string) || '';
  const ocrName = (params.ocr_name as string) || '';
  const ocrDob = (params.ocr_dob as string) || '';
  const ocrAddress = (params.ocr_address as string) || '';
  const ocrIssueDate = (params.ocr_issue_date as string) || '';
  
  const frontImageUri = params.front_image as string;
  const backImageUri = params.back_image as string;

  const pickAvatar = async () => {
    Alert.alert("Cập nhật Ảnh đại diện", "Bạn muốn chọn ảnh lấy từ đâu?", [
      { 
        text: "Chụp ảnh camera", 
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') return;
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1,1], quality: 0.5 });
          if (!result.canceled && result.assets[0]) setAvatarUri(result.assets[0].uri);
        }
      },
      { 
        text: "Chọn từ thư viện", 
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1,1], quality: 0.5 });
          if (!result.canceled && result.assets[0]) setAvatarUri(result.assets[0].uri);
        }
      },
      { text: "Hủy", style: "cancel" }
    ]);
  };

  // Convert URI to base64 if needed for avatar, front, back, or pass URI and let backend handle it
  // Since ticketService.purchaseTimeTicket supports Base64 starting with data:image, we can read base64 or pass it
  // But wait, React Native fetch / FileReader could convert uri to base64
  const uriToBase64 = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return '';
    }
  };

  const handeSubmit = async () => {
    if (!phone) {
      Alert.alert("Lỗi", "Vui lòng nhập Số điện thoại người nhận vé");
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert("Lỗi", "Vui lòng thiết lập Mật khẩu (ít nhất 6 ký tự)");
      return;
    }
    
    // Xử lý base64 nếu cần gửi trực tiếp
    let base64Avatar = '';
    let base64Front = '';
    let base64Back = '';

    if (avatarUri) base64Avatar = await uriToBase64(avatarUri);
    if (frontImageUri) base64Front = await uriToBase64(frontImageUri);
    if (backImageUri) base64Back = await uriToBase64(backImageUri);

    const proxyUserData = {
      cccd_number: ocrCccd,
      name: ocrName,
      phone: phone,
      birthday: ocrDob,
      sex: gender,
      address: ocrAddress,
      email: email,
      password: password, // Mật khẩu người dùng nhập
      cccd_front: base64Front || frontImageUri,
      cccd_back: base64Back || backImageUri,
      avatar: base64Avatar || avatarUri,
      issue_date: ocrIssueDate
    };

    Alert.alert("Duyệt thông tin", "Thông tin sẽ được liên kết và thiết lập cho vé của người này. Bạn có muốn thanh toán luôn chứ?", [
      { text: "Tiếp tục thanh toán", onPress: () => {
          router.push({
            pathname: '/payment',
            params: {
              ...params,
              proxy_user_data: JSON.stringify(proxyUserData)
            }
          })
      }},
      { text: "Xem lại", style: 'cancel' }
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#F8FAFC]">
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-200 z-10 shadow-sm">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 -ml-2 items-center justify-center">
            <MaterialCommunityIcons name="arrow-left" size={26} color="#0f172a" />
          </TouchableOpacity>
          <Text className="flex-1 text-[17px] font-bold text-slate-900 mr-8 text-center">Bổ sung thông tin</Text>
        </View>

        <ScrollView className="flex-1 px-5 pt-6 pb-20" showsVerticalScrollIndicator={false}>
          
          <View className="bg-[#FDFBF7] border border-[#EFDDC4] rounded-2xl p-4 flex-row items-center mb-6 shadow-sm">
            <MaterialCommunityIcons name="check-decagram" size={28} color="#5D4037" />
            <Text className="text-slate-700 font-medium ml-3 flex-1 text-[13px] leading-5">
              Hệ thống đã nhận dạng thành công CCCD. Một số thông tin dưới đây đã được điền tự động.
            </Text>
          </View>

          {/* AUTO-FILLED SECTION */}
          <Text className="font-extrabold text-slate-800 uppercase tracking-widest text-xs mb-4">Thông tin người mua hộ</Text>
          
          <View className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm shadow-slate-200/50 mb-8 gap-y-4">
             {/* CCCD Input */}
             <View>
               <Text className="text-slate-500 font-bold text-xs mb-1">Số Căn cước</Text>
               <TextInput editable={false} value={ocrCccd} className="bg-slate-100/80 text-slate-500 font-bold px-4 py-3 rounded-xl border border-slate-200" />
             </View>

             <View>
               <Text className="text-slate-700 font-bold text-xs mb-1">Số điện thoại *</Text>
               <TextInput 
                 value={phone}
                 onChangeText={setPhone}
                 keyboardType="phone-pad"
                 placeholder="Nhập số điện thoại"
                 className="bg-white text-slate-900 font-bold px-4 py-3 rounded-xl border border-[#7A5448]" 
               />
             </View>

             <View>
               <Text className="text-slate-700 font-bold text-xs mb-1">Mật khẩu *</Text>
               <TextInput 
                 value={password}
                 onChangeText={setPassword}
                 secureTextEntry
                 placeholder="Tạo mật khẩu cho người nhận"
                 className="bg-white text-slate-900 font-bold px-4 py-3 rounded-xl border border-[#7A5448]" 
               />
             </View>

             <View>
               <Text className="text-slate-500 font-bold text-xs mb-1">Họ và Tên</Text>
               <TextInput editable={false} value={ocrName} className="bg-slate-100/80 text-slate-500 font-bold px-4 py-3 rounded-xl border border-slate-200" />
             </View>

             <View className="flex-row gap-x-4">
               <View className="flex-1">
                 <Text className="text-slate-500 font-bold text-xs mb-1">Ngày sinh</Text>
                 <TextInput editable={false} value={ocrDob} className="bg-slate-100/80 text-slate-500 font-bold px-4 py-3 rounded-xl border border-slate-200" />
               </View>
               <View className="flex-[1.2]">
                 <Text className="text-slate-500 font-bold text-xs mb-1">Ngày cấp</Text>
                 <TextInput editable={false} value={ocrIssueDate} className="bg-slate-100/80 text-slate-500 font-bold px-4 py-3 rounded-xl border border-slate-200" />
               </View>
             </View>

             <View>
               <Text className="text-slate-500 font-bold text-xs mb-1">Địa chỉ thường trú</Text>
               <TextInput editable={false} value={ocrAddress} multiline className="bg-slate-100/80 text-slate-500 font-bold px-4 py-3 rounded-xl border border-slate-200" />
             </View>
          </View>

          {/* USER INTERACTIVE SECTION */}
          <Text className="font-extrabold text-slate-800 uppercase tracking-widest text-xs mb-4">Thông tin bổ sung</Text>

          {/* Avatar Upload */}
          <View className="items-center mb-6">
             <TouchableOpacity 
               onPress={pickAvatar}
               className="w-24 h-24 bg-slate-200 rounded-full items-center justify-center border-4 border-white shadow-md shadow-slate-300 relative overflow-hidden"
             >
               {avatarUri ? (
                 <Image source={{ uri: avatarUri }} className="w-full h-full" style={{ resizeMode: 'cover' }} />
               ) : (
                 <MaterialCommunityIcons name="account-circle" size={80} color="#94a3b8" />
               )}
               <View className="absolute bottom-0 w-full bg-black/50 items-center justify-center py-[2px] pb-1">
                 <Text className="text-white text-[10px] font-bold tracking-wider">{avatarUri ? 'Thay đổi' : 'Thêm ảnh'}</Text>
               </View>
             </TouchableOpacity>
          </View>
          
          <View className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm shadow-slate-200/50 mb-8 gap-y-5">
             
             {/* Gender Radio */}
             <View>
               <Text className="text-slate-700 font-bold text-xs mb-2">Giới tính</Text>
               <View className="flex-row justify-between gap-x-3">
                 {['Nam', 'Nữ'].map(g => (
                   <TouchableOpacity 
                     key={g} 
                     onPress={() => setGender(g)}
                     className="flex-1 py-3 rounded-xl border items-center flex-row justify-center shadow-sm"
                     style={{ 
                       borderColor: gender === g ? '#7A5448' : '#e2e8f0', 
                       backgroundColor: gender === g ? '#FDFBF7' : '#ffffff' 
                     }}
                   >
                     <View 
                       className="w-4 h-4 rounded-full border items-center justify-center mr-2 bg-white"
                       style={{ borderColor: gender === g ? '#7A5448' : '#cbd5e1' }}
                     >
                        {gender === g && <View className="w-2 h-2 rounded-full bg-[#7A5448]" />}
                     </View>
                     <Text className="font-bold" style={{ color: gender === g ? '#4E342E' : '#475569' }}>{g}</Text>
                   </TouchableOpacity>
                 ))}
               </View>
             </View>

             <View>
               <Text className="text-slate-700 font-bold text-xs mb-2">Email (Tùy chọn)</Text>
               <View className="bg-[#f8fafc] border border-slate-200 rounded-xl px-4 h-12 justify-center focus:border-[#7A5448] focus:bg-white flex-row items-center">
                  <MaterialCommunityIcons name="email-outline" size={20} color="#64748b" className="mr-2" />
                  <TextInput 
                    className="flex-1 font-semibold text-slate-800" 
                    placeholder="VD: email@doanhuy.com" 
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                  />
               </View>
             </View>

          </View>

          <View className="h-4" />
        </ScrollView>

        <View className="w-full p-5 bg-white border-t border-slate-100" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
           <TouchableOpacity 
             className="w-full bg-[#5D4037] rounded-2xl py-[18px] items-center shadow-lg shadow-stone-900/40"
             onPress={handeSubmit}
           >
             <Text className="text-white font-extrabold text-[16px]">Xác nhận & Thanh toán</Text>
           </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}
