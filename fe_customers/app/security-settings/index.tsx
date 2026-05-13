import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator, Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useCustomerAuth } from '../../hooks/AuthProvider';
import { axiosClient } from '../../api_client/axiosClient';

function Toast({ visible, message, type = 'success' }: { visible: boolean; message: string; type?: 'success' | 'error' }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const isSuccess = type === 'success';
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', bottom: 100, left: 20, right: 20, zIndex: 9999,
        opacity, transform: [{ translateY }],
        backgroundColor: isSuccess ? '#166534' : '#991b1b',
        borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25, shadowRadius: 12, elevation: 10,
      }}>
      <MaterialCommunityIcons
        name={isSuccess ? 'check-circle' : 'alert-circle'}
        size={22} color="white"
        style={{ marginRight: 10 }}/>
      <Text style={{ color: 'white', fontWeight: '700', fontSize: 14, flex: 1 }}>{message}</Text>
    </Animated.View>
  );
}

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { userData, refreshUserData, updateUserData } = useCustomerAuth();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isNewAvatar, setIsNewAvatar] = useState(false);
  const [email, setEmail] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3000);
  };

  useEffect(() => {
    if (userData) {
      setEmail(userData.email || '');
      if (userData.avatar) {
        const base = 'http://localhost:3000';
        const fullUrl = `${base}${userData.avatar.startsWith('/') ? '' : '/'}${userData.avatar}`;
        setAvatarUri(fullUrl);
        setIsNewAvatar(false);
      }
    }
  }, [userData]);

  const pickAvatar = () => {
    Alert.alert('Cập nhật Ảnh đại diện', 'Bạn muốn chọn ảnh lấy từ đâu?', [
      {
        text: 'Chụp ảnh camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') return;
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.6 });
          if (!result.canceled && result.assets[0]) {
            setAvatarUri(result.assets[0].uri);
            setIsNewAvatar(true);
          }
        },
      },
      {
        text: 'Chọn từ thư viện',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.6 });
          if (!result.canceled && result.assets[0]) {
            setAvatarUri(result.assets[0].uri);
            setIsNewAvatar(true);
          }
        },
      },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const handeSubmit = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      showToast('Mật khẩu xác nhận không trùng khớp.', 'error');
      return;
    }
    if (newPassword && !currentPassword) {
      showToast('Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu.', 'error');
      return;
    }
    if (!userData?.id) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('email', email);
      if (currentPassword) formData.append('currentPassword', currentPassword);
      if (newPassword) formData.append('newPassword', newPassword);

      if (avatarUri && isNewAvatar) {
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('avatar', { uri: avatarUri, name: filename, type } as any);
      }

      const res: any = await axiosClient.put(`/users/profile/${userData.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // axiosClient đã unwrap response.data → res chính là data rồi, không phải res.data
      if (res?.success) {
        const updatedUser = res.data;

        await updateUserData({
          email: updatedUser.email,
          avatar: updatedUser.avatar,
        });

        // Cập nhật avatarUri ngay lập tức với cache-buster để React Native hiện ảnh mới
        if (updatedUser.avatar) {
          const base = 'http://localhost:3000';
          const freshUrl = `${base}${updatedUser.avatar.startsWith('/') ? '' : '/'}${updatedUser.avatar}?t=${Date.now()}`;
          setAvatarUri(freshUrl);
        }

        // Reset form mật khẩu
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsNewAvatar(false);

        // Hiện Toast thành công
        showToast('✅ Thông tin cá nhân đã được cập nhật!');
      } else {
        showToast(res?.message || 'Cập nhật thất bại, vui lòng thử lại.', 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Không thể cập nhật thông tin.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#F8FAFC]">
      <View className="flex-1" style={{ paddingTop: insets.top }}>

        <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-200 z-10 shadow-sm">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 -ml-2 items-center justify-center">
            <MaterialCommunityIcons name="arrow-left" size={26} color="#0f172a" />
          </TouchableOpacity>
          <Text className="flex-1 text-[17px] font-bold text-slate-900 mr-8 text-center">Cập nhật thông tin</Text>
        </View>

        <ScrollView className="flex-1 px-5 pt-6 pb-20" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-8">
            <TouchableOpacity
              onPress={pickAvatar}
              className="w-28 h-28 bg-[#EFDDC4] rounded-full items-center justify-center border-4 border-white shadow-md shadow-slate-300 relative overflow-hidden"
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  className="w-full h-full"
                  style={{ resizeMode: 'cover' }}
                />
              ) : (
                <MaterialCommunityIcons name="account-circle" size={90} color="#DDB892" />
              )}
              <View className="absolute bottom-0 w-full bg-[#5D4037]/70 items-center justify-center py-1">
                <Text className="text-white text-xs font-bold tracking-wider uppercase">Đổi ảnh</Text>
              </View>
            </TouchableOpacity>
            {isNewAvatar && (
              <View className="mt-2 bg-amber-100 rounded-lg px-3 py-1 flex-row items-center gap-1">
                <MaterialCommunityIcons name="image-edit" size={14} color="#92400e" />
                <Text className="text-amber-800 text-xs font-semibold">Ảnh mới chưa lưu</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="card-account-details-outline" size={22} color="#f97316" />
            <Text className="ml-2 font-extrabold text-slate-800 uppercase tracking-widest text-[13px]">Thông tin liên hệ</Text>
          </View>

          <View className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm shadow-slate-200/50 mb-8 gap-y-4 pt-5">
            <View>
              <Text className="text-slate-500 font-bold text-xs mb-1">Họ và Tên</Text>
              <TextInput editable={false} value={userData?.name || ''} className="bg-slate-50/80 text-slate-400 font-bold px-4 py-3 rounded-xl border border-slate-200/50" />
            </View>

            <View>
              <Text className="text-slate-500 font-bold text-xs mb-1">Số CCCD / Định danh</Text>
              <TextInput editable={false} value={userData?.cccd_number || ''} className="bg-slate-50/80 text-[#5D4037] font-bold px-4 py-3 rounded-xl border border-slate-200/50" />
            </View>

            <View>
              <Text className="text-slate-700 font-bold text-xs mb-2">Email hỗ trợ</Text>
              <View className="bg-[#FDFBF7] border border-[#EFDDC4] rounded-xl px-4 h-12 justify-center flex-row items-center">
                <MaterialCommunityIcons name="email-outline" size={20} color="#7A5448" />
                <TextInput
                  className="flex-1 font-semibold text-slate-800 ml-2"
                  placeholder="Nhập email mới"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#10b981" />
            <Text className="ml-2 font-extrabold text-slate-800 uppercase tracking-widest text-[13px]">Trình Quản lý Mật khẩu</Text>
          </View>

          <View className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm shadow-slate-200/50 mb-8 gap-y-5 pt-5">
            <View>
              <Text className="text-slate-700 font-bold text-xs mb-2">Mật khẩu hiện tại</Text>
              <View className="bg-[#f8fafc] border border-slate-200 rounded-xl px-4 h-12 justify-center flex-row items-center">
                <MaterialCommunityIcons name="lock-outline" size={20} color="#64748b" />
                <TextInput
                  className="flex-1 font-semibold text-slate-800 ml-2"
                  placeholder="Nhập mật khẩu cũ"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword1}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword1(!showPassword1)}>
                  <MaterialCommunityIcons name={showPassword1 ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="h-[1px] bg-slate-100 w-full my-1" />

            <View>
              <Text className="text-slate-700 font-bold text-xs mb-2">Mật khẩu Mới</Text>
              <View className="bg-[#f8fafc] border border-slate-200 rounded-xl px-4 h-12 justify-center flex-row items-center">
                <MaterialCommunityIcons name="lock-plus-outline" size={20} color="#64748b" />
                <TextInput
                  className="flex-1 font-semibold text-slate-800 ml-2"
                  placeholder="Tạo mật khẩu mới"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword2}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword2(!showPassword2)}>
                  <MaterialCommunityIcons name={showPassword2 ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-slate-700 font-bold text-xs mb-2">Xác nhận Mật khẩu Mới</Text>
              <View className={`bg-[#f8fafc] border rounded-xl px-4 h-12 justify-center flex-row items-center ${confirmPassword && newPassword !== confirmPassword ? 'border-red-400' : 'border-slate-200'}`}>
                <MaterialCommunityIcons name="lock-check-outline" size={20} color="#64748b" />
                <TextInput
                  className="flex-1 font-semibold text-slate-800 ml-2"
                  placeholder="Nhập lại mật khẩu mới"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword3}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword3(!showPassword3)}>
                  <MaterialCommunityIcons name={showPassword3 ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              {confirmPassword !== '' && newPassword !== confirmPassword && (
                <Text className="text-red-500 font-medium text-xs mt-1 ml-1">Mật khẩu không khớp!</Text>
              )}
            </View>
          </View>

          <View className="h-4" />
        </ScrollView>
        <View className="w-full p-5 bg-white border-t border-slate-100" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
          <TouchableOpacity
            className={`w-full rounded-2xl py-[18px] items-center shadow-lg shadow-orange-900/30 flex-row justify-center ${isSubmitting ? 'bg-[#5D4037]/70' : 'bg-[#5D4037]'}`}
            onPress={handeSubmit}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-extrabold text-[16px]">Lưu thay đổi</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <Toast visible={toastVisible} message={toastMessage} type={toastType} />

    </KeyboardAvoidingView>
  );
}
