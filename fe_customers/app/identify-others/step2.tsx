import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '../../services/auth.service';

export default function IdentifyOthersStep2Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Real Form State from Params
  const [cccd, setCccd] = useState((params.cccd as string) || '');
  const [fullName, setFullName] = useState((params.fullName as string) || '');
  const [dob, setDob] = useState((params.dob as string) || '');
  const [address, setAddress] = useState((params.address as string) || '');
  const [issueDate, setIssueDate] = useState((params.issueDate as string) || '');
  const [sex, setSex] = useState((params.sex as string) || 'Nam');

  // Interactive fields
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickAvatar = async () => {
    Alert.alert("Cập nhật Ảnh đại diện", "Bạn muốn chọn ảnh của người này từ đâu?", [
      {
        text: "Chụp ảnh camera",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') return;
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
          if (!result.canceled && result.assets[0]) setAvatarUri(result.assets[0].uri);
        }
      },
      {
        text: "Chọn từ thư viện",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
          if (!result.canceled && result.assets[0]) setAvatarUri(result.assets[0].uri);
        }
      },
      { text: "Hủy", style: "cancel" }
    ]);
  };

  const handleSubmit = async () => {
    if (!phone || !password || !cccd || !fullName) {
      Alert.alert("Thông tin thiếu", "Số điện thoại và Mật khẩu là bắt buộc để người này có thể đăng nhập.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', fullName);
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('cccd_number', cccd);
      formData.append('birthday', dob);
      formData.append('sex', sex);
      formData.append('address', address);
      formData.append('issue_date', issueDate);
      formData.append('id_Role', '3');
      formData.append('status', 'false');

      if (params.frontUri) {
        formData.append('cccd_front', {
          uri: Platform.OS === 'android' ? params.frontUri : (params.frontUri as string).replace('file://', ''),
          type: 'image/jpeg',
          name: 'front.jpg'
        } as any);
      }
      if (params.backUri) {
        formData.append('cccd_back', {
          uri: Platform.OS === 'android' ? params.backUri : (params.backUri as string).replace('file://', ''),
          type: 'image/jpeg',
          name: 'back.jpg'
        } as any);
      }

      if (avatarUri) {
        formData.append('avatar', {
          uri: Platform.OS === 'android' ? avatarUri : avatarUri.replace('file://', ''),
          type: 'image/jpeg',
          name: 'avatar.jpg'
        } as any);
      }

      const response: any = await authService.registerProxyCustomer(formData);

      if (response.success) {
        Alert.alert("Thành công", `Người dùng ${fullName} đã được định danh chính thức trên hệ thống!`, [
          { text: "Hoàn tất", onPress: () => router.replace('/(tabs)/profile' as any) }
        ]);
      } else {
        Alert.alert("Thất bại", response.message || "Không thể đăng ký người này.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi kết nối", "Hệ thống đang bận, vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#FDFBF7]">
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-[#EFDDC4] z-10 shadow-sm">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 -ml-2 items-center justify-center">
            <MaterialCommunityIcons name="chevron-left" size={30} color="#5D4037" />
          </TouchableOpacity>
          <Text className="flex-1 text-[17px] font-black text-[#5D4037] mr-8 text-center uppercase tracking-tight">Bổ sung hồ sơ</Text>
        </View>

        <ScrollView className="flex-1 px-5 pt-6 pb-20" showsVerticalScrollIndicator={false}>

          <View className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex-row items-center mb-8 shadow-sm">
            <View className="w-10 h-10 bg-emerald-500 rounded-full items-center justify-center">
              <MaterialCommunityIcons name="check-decagram" size={24} color="white" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-emerald-900 font-black text-[14px]">Xác thực thành công</Text>
              <Text className="text-emerald-700/80 text-[12px] font-bold mt-0.5 leading-4">Thông tin CCCD đã được AI nhận dạng tự động.</Text>
            </View>
          </View>

          <Text className="font-black text-[#5D4037] uppercase tracking-[3px] text-[11px] mb-4 ml-1">Thông tin hệ thống</Text>

          <View className="bg-white border border-[#F5E6D3] rounded-[28px] p-5 shadow-xl shadow-stone-200/50 mb-8 gap-y-4">
            <View>
              <Text className="text-stone-400 font-black text-[10px] uppercase mb-1.5 ml-1">Số Căn cước</Text>
              <TextInput editable={true} value={cccd} onChangeText={setCccd} className="bg-stone-50 text-[#5D4037] font-black px-4 py-3.5 rounded-2xl border border-stone-100" />
            </View>

            <View>
              <Text className="text-stone-400 font-black text-[10px] uppercase mb-1.5 ml-1">Họ và Tên</Text>
              <TextInput editable={true} value={fullName} onChangeText={setFullName} className="bg-stone-50 text-[#5D4037] font-black px-4 py-3.5 rounded-2xl border border-stone-100 uppercase" />
            </View>

            <View className="flex-row gap-x-3">
              <View className="flex-1">
                <Text className="text-stone-400 font-black text-[10px] uppercase mb-1.5 ml-1">Ngày sinh</Text>
                <TextInput editable={true} value={dob} onChangeText={setDob} className="bg-stone-50 text-[#5D4037] font-black px-4 py-3.5 rounded-2xl border border-stone-100" />
              </View>
              <TouchableOpacity
                className="flex-1"
                onPress={() => setSex(sex === 'Nam' ? 'Nữ' : 'Nam')}>
                <Text className="text-stone-400 font-black text-[10px] uppercase mb-1.5 ml-1">Giới tính</Text>
                <View className="bg-stone-50 px-4 py-3.5 rounded-2xl border border-stone-100 flex-row items-center justify-between">
                  <Text className="text-[#5D4037] font-black">{sex}</Text>
                  <MaterialCommunityIcons name="swap-horizontal" size={18} color="#A1887F" />
                </View>
              </TouchableOpacity>
            </View>

            <View>
              <Text className="text-stone-400 font-black text-[10px] uppercase mb-1.5 ml-1">Địa chỉ (Trong CCCD)</Text>
              <TextInput editable={true} multiline value={address} onChangeText={setAddress} className="bg-stone-50 text-[#5D4037] font-black px-4 py-3.5 rounded-2xl border border-stone-100 min-h-[80px]" />
            </View>
          </View>

          <Text className="font-black text-[#5D4037] uppercase tracking-[3px] text-[11px] mb-4 ml-1">Thông tin bổ sung</Text>

          <View className="items-center mb-8">
            <TouchableOpacity
              onPress={pickAvatar}
              className="w-28 h-28 bg-white rounded-full items-center justify-center border-[6px] border-[#FFFBEB] shadow-2xl shadow-amber-200 relative overflow-hidden"
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} className="w-full h-full" style={{ resizeMode: 'cover' }} />
              ) : (
                <MaterialCommunityIcons name="account-plus-outline" size={40} color="#DDB892" />
              )}
              <View className="absolute bottom-0 w-full bg-[#5D4037]/80 items-center justify-center py-1">
                <Text className="text-white text-[9px] font-black uppercase tracking-tighter">Ảnh hồ sơ</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="bg-white border border-[#F5E6D3] rounded-[28px] p-5 shadow-xl shadow-stone-200/50 mb-10 gap-y-5">

            <View>
              <Text className="text-stone-500 font-black text-[12px] mb-2 ml-1 italic">Số điện thoại liên lạc</Text>
              <View className="bg-stone-50 border border-stone-100 rounded-[20px] px-5 h-[56px] justify-center flex-row items-center">
                <MaterialCommunityIcons name="phone-outline" size={20} color="#A1887F" className="mr-3" />
                <TextInput
                  className="flex-1 font-black text-[#5D4037] text-[15px]"
                  placeholder="VD: 0912345678"
                  placeholderTextColor="#D1D5DB"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <View>
              <Text className="text-stone-500 font-black text-[12px] mb-2 ml-1 italic">Thiết lập mật khẩu</Text>
              <View className="bg-stone-50 border border-stone-100 rounded-[20px] px-5 h-[56px] justify-center flex-row items-center">
                <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#A1887F" className="mr-3" />
                <TextInput
                  className="flex-1 font-black text-[#5D4037] text-[15px]"
                  placeholder="Tạo mật khẩu đăng nhập"
                  placeholderTextColor="#D1D5DB"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#D1D5DB" />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-stone-500 font-black text-[12px] mb-2 ml-1 italic">Email (Tùy chọn)</Text>
              <View className="bg-stone-50 border border-stone-100 rounded-[20px] px-5 h-[56px] justify-center flex-row items-center">
                <MaterialCommunityIcons name="email-outline" size={20} color="#A1887F" className="mr-3" />
                <TextInput
                  className="flex-1 font-black text-[#5D4037] text-[15px]"
                  placeholder="dia-chi@email.com"
                  placeholderTextColor="#D1D5DB"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>
          </View>
          <View className="h-6" />
        </ScrollView>

        <View className="w-full p-6 bg-white/80 backdrop-blur-xl border-t border-[#EFDDC4]" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
          <TouchableOpacity
            className="w-full bg-[#5D4037] py-5 rounded-[24px] items-center shadow-2xl shadow-stone-400 flex-row justify-center"
            disabled={isLoading}
            onPress={handleSubmit}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialCommunityIcons name="account-check-outline" size={22} color="white" className="mr-2" />
                <Text className="font-black text-[16px] text-white uppercase tracking-widest ml-2">Xác nhận định danh</Text>
              </>
            )
            }
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}
