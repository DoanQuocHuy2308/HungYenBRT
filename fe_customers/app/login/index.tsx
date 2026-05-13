import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useCustomerAuth } from '../../hooks/AuthProvider';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading } = useCustomerAuth();
  const [cccd, setCccd] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!cccd || !password) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập số Căn cước và Mật khẩu!");
      return;
    }
    if (cccd.length !== 12) {
      Alert.alert("Sai định dạng", "Số Căn cước công dân phải đủ 12 chữ số.");
      return;
    }
    const result = await login(cccd, password);
    if (result && result.token) {
      router.replace('/(tabs)' as any);
    } else {
      Alert.alert("Đăng nhập thất bại", "Số CCCD hoặc Mật khẩu không đúng. Vui lòng thử lại.");
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar style="light" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false}>

        <View className="h-[300px] w-full relative shrink-0">
          <Image
            source={require('../../assets/images/login2.png')}
            className="w-full h-full absolute inset-0"
            style={{ resizeMode: 'cover' }}
          />
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.9)']}
            className="absolute inset-0"
          />
          <View className="absolute bottom-12 left-6">
            <View className="flex-row items-center mb-2">
              <View className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-2xl items-center justify-center border border-white/20 mr-3 shadow-lg">
                <MaterialCommunityIcons name="train-car" size={28} color="white" />
              </View>
              <View>
                <Text
                  className="text-white font-black text-[26px] tracking-tight leading-8"
                  style={{ textShadowColor: 'rgba(0, 0, 0, 0.90)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}
                >
                  Hưng Yên BRT
                </Text>
                <Text
                  className="text-[#EFDDC4] font-bold text-[13px] uppercase tracking-widest mt-0.5"
                  style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}
                >
                  Hệ thống vé điện tử
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dynamic Form Area */}
        <View className="flex-1 bg-white rounded-t-[36px] -mt-8 px-6 pt-8 min-h-[600px] shadow-2xl shadow-black">

          {/* Welcome Text */}
          <View className="mb-8 pl-1">
            <Text className="text-slate-900 font-extrabold text-[28px] mb-1.5 tracking-tight">Xin chào!</Text>
            <Text className="text-slate-500 font-medium text-[15px]">Đăng nhập bằng số Căn cước công dân để tiếp tục</Text>
          </View>

          {/* Form Inputs */}
          <View className="mb-5">
            <Text className="text-slate-700 font-bold text-[13px] uppercase tracking-wider mb-2 ml-1">Số Căn cước</Text>
            <View className="flex-row items-center bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 h-[60px] focus:border-[#5D4037] focus:bg-white shadow-sm shadow-slate-100">
              <MaterialCommunityIcons name="card-account-details-outline" size={22} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-slate-800 font-bold text-[16px] h-full"
                placeholder="Nhập 12 số CCCD"
                placeholderTextColor="#cbd5e1"
                keyboardType="numeric"
                maxLength={12}
                value={cccd}
                onChangeText={setCccd}
              />
            </View>
          </View>

          <View className="mb-3">
            <Text className="text-slate-700 font-bold text-[13px] uppercase tracking-wider mb-2 ml-1">Mật khẩu</Text>
            <View className="flex-row items-center bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 h-[60px] focus:border-[#5D4037] focus:bg-white shadow-sm shadow-slate-100">
              <MaterialCommunityIcons name="lock-outline" size={22} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-slate-800 font-bold text-[16px] h-full"
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#cbd5e1"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2 -mr-2">
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity className="self-end mb-8 pt-2 pr-1">
            <Text className="text-[#5D4037] font-bold text-[14px]">Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="w-full rounded-2xl py-[18px] items-center shadow-lg shadow-orange-900/30 mb-8 flex-row justify-center"
            style={{ backgroundColor: loading ? '#a1887f' : '#5D4037' }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-extrabold text-[16px] tracking-widest uppercase">Đăng nhập</Text>
            )}
          </TouchableOpacity>

          {/* Biometric Title */}
          <View className="flex-row items-center justify-center mb-6">
            <View className="h-[1px] flex-1 bg-slate-100" />
            <Text className="text-slate-400 font-bold px-4 text-[12px] uppercase tracking-widest">Đăng nhập cực nhanh</Text>
            <View className="h-[1px] flex-1 bg-slate-100" />
          </View>

          {/* Biometric Methods */}
          <View className="flex-row items-center justify-center gap-6 mb-12">
            <TouchableOpacity className="w-16 h-16 rounded-[20px] border border-slate-100 shadow-sm shadow-slate-200 items-center justify-center bg-white active:bg-slate-50">
              <MaterialCommunityIcons name="face-recognition" size={34} color="#5D4037" />
            </TouchableOpacity>
            <TouchableOpacity className="w-16 h-16 rounded-[20px] border border-slate-100 shadow-sm shadow-slate-200 items-center justify-center bg-white active:bg-slate-50">
              <MaterialCommunityIcons name="fingerprint" size={34} color="#7A5448" />
            </TouchableOpacity>
          </View>

          {/* Register Nav */}
          <View className="flex-row justify-center pb-20 mt-auto">
            <Text className="text-slate-500 font-medium text-[15px]">Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/register' as any)}>
              <Text className="text-[#5D4037] font-black text-[15px]">Đăng ký bằng CCCD</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
