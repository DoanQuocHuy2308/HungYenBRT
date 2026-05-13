import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '../../services/auth.service';
import { ActivityIndicator } from 'react-native';

export default function RegisterStep2Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // local params from Route step 1
  const params = useLocalSearchParams();
  // Interactive states (populated from QR scan results)
  const [cccd, setCccd] = useState(params.cccd as string || "");
  const [fullName, setFullName] = useState(params.fullName as string || "");
  const [dob, setDob] = useState(params.dob as string || "");
  const [address, setAddress] = useState(params.address as string || "");
  const [issueDate, setIssueDate] = useState(params.issueDate as string || "");

  const [gender, setGender] = useState('Nam');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (params.sex) {
      setGender(params.sex as string);
    }
  }, [params.sex]);

  const pickAvatar = async () => {
    Alert.alert("Cập nhật Ảnh đại diện", "Bạn muốn chọn ảnh từ đâu?", [
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

  const handeSubmit = async () => {
    if (!password || !phone) {
      Alert.alert("Thiếu thông tin", "Vui lòng đặt mật khẩu và cung cấp số điện thoại để liên lạc.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', fullName);
      formData.append('phone', phone);
      formData.append('cccd_number', cccd);
      formData.append('password', password);
      formData.append('birthday', dob);
      formData.append('sex', gender);
      formData.append('address', address);
      formData.append('issue_date', issueDate);
      formData.append('id_Role', '3'); // 3 = Khách hàng
      formData.append('status', 'false');
      if (email) formData.append('email', email);

      // Kéo các ảnh gốc gán vào FormData
      formData.append('cccd_front', {
        uri: params.frontUri,
        type: 'image/jpeg',
        name: 'cccd_front.jpg',
      } as any);

      formData.append('cccd_back', {
        uri: params.backUri,
        type: 'image/jpeg',
        name: 'cccd_back.jpg',
      } as any);

      if (avatarUri) {
        formData.append('avatar', {
          uri: avatarUri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        } as any);
      }

      const response: any = await authService.registerMobileCustomer(formData);
      if (response.success) {
        const granted = response.data?.user?.elderlyTicketGranted;
        if (granted) {
          Alert.alert(
            "🎉 Đăng ký thành công",
            "Tài khoản đã được tạo!\n\n🎫 Vì bạn trên 60 tuổi, hệ thống đã tự động cấp Vé Người Cao Tuổi miễn phí (thời hạn vĩnh viễn) vào tài khoản của bạn. Chúc bạn hành trình vui vẻ!",
            [{ text: "Khởi hành ngay! 🚌", onPress: () => router.replace('/login' as any) }]
          );
        } else {
          Alert.alert(
            "✅ Đăng ký thành công",
            "Tài khoản của bạn đã được đăng ký và lưu trên hệ thống. Hãy đăng nhập ngay!",
            [{ text: "Khởi hành ngay!", onPress: () => router.replace('/login' as any) }]
          );
        }
      } else {
        Alert.alert("Đăng ký thất bại", response.message || "Lỗi do dữ liệu nhập không đúng");
      }
    } catch (error: any) {
      console.error("Register err: ", error);
      Alert.alert("Lỗi", "Số điện thoại hoặc số CCCD này có thể đã được đăng ký trước đó. Vui lòng kiểm tra lại.");
    } finally {
      setIsLoading(false);
    }
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
          <Text className="font-extrabold text-slate-800 uppercase tracking-widest text-xs mb-4">Thông tin từ hệ thống</Text>

          <View className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm shadow-slate-200/50 mb-8 gap-y-4">
            {/* CCCD Input */}
            <View>
              <Text className="text-slate-700 font-bold text-[13px] mb-1">Số Căn cước <Text className="text-red-500">*</Text></Text>
              <TextInput editable={true} value={cccd} onChangeText={setCccd} keyboardType="number-pad" className="bg-white text-slate-800 font-bold px-4 py-3 rounded-xl border border-[#DDB892] focus:border-[#7A5448]" />
            </View>

            <View>
              <Text className="text-slate-700 font-bold text-[13px] mb-1">Số điện thoại <Text className="text-red-500">*</Text></Text>
              <TextInput editable={true} value={phone} onChangeText={setPhone} placeholder="Nhập số điện thoại liên lạc" keyboardType="phone-pad" className="bg-white text-slate-800 font-bold px-4 py-3 rounded-xl border border-[#DDB892] focus:border-[#7A5448]" />
            </View>

            <View>
              <Text className="text-slate-700 font-bold text-[13px] mb-1">Họ và Tên <Text className="text-red-500">*</Text></Text>
              <TextInput editable={true} value={fullName} onChangeText={setFullName} className="bg-white text-slate-800 font-bold px-4 py-3 rounded-xl border border-[#DDB892] focus:border-[#7A5448]" />
            </View>

            <View className="flex-row gap-x-4">
              <View className="flex-1">
                <Text className="text-slate-700 font-bold text-[13px] mb-1">Ngày sinh <Text className="text-red-500">*</Text></Text>
                <TextInput editable={true} value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" className="bg-white text-slate-800 font-bold px-4 py-3 rounded-xl border border-[#DDB892] focus:border-[#7A5448]" />
              </View>
              <View className="flex-[1.2]">
                <Text className="text-slate-700 font-bold text-[13px] mb-1">Ngày cấp <Text className="text-red-500">*</Text></Text>
                <TextInput editable={true} value={issueDate} onChangeText={setIssueDate} placeholder="YYYY-MM-DD" className="bg-white text-slate-800 font-bold px-4 py-3 rounded-xl border border-[#DDB892] focus:border-[#7A5448]" />
              </View>
            </View>

            <View>
              <Text className="text-slate-700 font-bold text-[13px] mb-1">Địa chỉ thường trú <Text className="text-red-500">*</Text></Text>
              <TextInput editable={true} value={address} onChangeText={setAddress} multiline className="bg-white text-slate-800 font-bold px-4 py-3 rounded-xl border border-[#DDB892] focus:border-[#7A5448]" />
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
                      backgroundColor: gender === g ? '#eff6ff' : '#ffffff'
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
              <Text className="text-slate-700 font-bold text-xs mb-2">Mật khẩu mới</Text>
              <View className="bg-[#f8fafc] border border-slate-200 rounded-xl px-4 h-12 justify-center focus:border-[#7A5448] focus:bg-white flex-row items-center">
                <MaterialCommunityIcons name="lock-outline" size={20} color="#64748b" className="mr-2" />
                <TextInput
                  className="flex-1 font-semibold text-slate-800"
                  placeholder="Tạo mật khẩu đăng nhập"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
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
            className="w-full py-[18px] rounded-2xl items-center shadow-lg shadow-green-500/40 flex-row justify-center"
            style={{ backgroundColor: isLoading ? '#cbd5e1' : '#5E3A21' }}
            disabled={isLoading}
            onPress={handeSubmit}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-extrabold text-[16px] text-white">ĐĂNG KÝ NGAY</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}
