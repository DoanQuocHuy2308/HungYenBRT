import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function HelpScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <StatusBar style="dark" />
      
      {/* Premium Header */}
      <View 
        className="flex-row items-center justify-center px-5 py-4 bg-white shadow-sm shadow-black/5 z-10 relative border-b border-gray-100"
        style={{ paddingTop: Math.max(insets.top, 20) + 10 }}
      >
        <TouchableOpacity 
          className="absolute left-5 w-10 h-10 items-center justify-center -ml-2"
          style={{ top: Math.max(insets.top, 20) + 10 }}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="#0f172a" />
        </TouchableOpacity>
        
        <Text className="text-slate-800 font-extrabold text-lg tracking-wide uppercase">Trợ giúp & Liên hệ</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6 pb-20" showsVerticalScrollIndicator={false}>
        
        {/* Support Graphic / Logo Placeholder */}
        <View className="items-center mb-8">
           <View className="w-24 h-24 bg-[#EFDDC4] rounded-full items-center justify-center shadow-lg shadow-orange-900/10 mb-4 border-4 border-white">
             <MaterialCommunityIcons name="headset-dock" size={45} color="#5D4037" />
           </View>
           <Text className="text-slate-800 font-black text-[22px] mb-2 text-center">Chúng tôi có thể giúp gì?</Text>
           <Text className="text-slate-500 font-medium text-[14px] text-center px-4 leading-5">
             Bộ phận Hỗ trợ Sinh viên & Khách hàng của hệ thống Vận tải luôn thường trực 24/7 để lắng nghe bạn.
           </Text>
        </View>

        {/* Developer Contact Card */}
        <View className="flex-row items-center mb-3">
          <MaterialCommunityIcons name="card-account-mail-outline" size={24} color="#5D4037" className="mr-2" />
          <Text className="text-slate-800 font-bold uppercase tracking-widest text-sm">thông tin liên hệ dev</Text>
        </View>

        <View className="bg-white rounded-3xl p-5 shadow-sm shadow-slate-200 border border-slate-100/50 mb-6">
          
          <View className="flex-row items-center mb-5 pb-5 border-b border-dashed border-slate-200">
            <View className="w-14 h-14 rounded-full mr-4 border-2 border-[#DDB892] overflow-hidden bg-[#5D4037]">
              <Image 
                source={require('../../assets/images/admin.jpg')} 
                className="w-full h-full"
                style={{ resizeMode: 'cover' }}
              />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-black text-[18px] uppercase tracking-wide">Doãn Quốc Huy</Text>
              <Text className="text-[#7A5448] font-bold text-[14px] mt-0.5">Sinh viên & Developer</Text>
            </View>
          </View>

          <View className="gap-y-4">
            <View className="flex-row items-center">
              <View className="w-8 items-center justify-center">
                 <MaterialCommunityIcons name="email-outline" size={20} color="#94a3b8" />
              </View>
              <Text className="text-slate-700 font-semibold flex-1 ml-2 text-[14px]">
                doanquochuy23082004@gmail.com
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 items-center justify-center">
                 <MaterialCommunityIcons name="phone-in-talk-outline" size={20} color="#94a3b8" />
              </View>
              <Text className="text-[#5D4037] font-bold flex-1 ml-2 text-[15px]">
                0978.320.093
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 items-center justify-center">
                 <MaterialCommunityIcons name="map-marker-outline" size={20} color="#94a3b8" />
              </View>
              <Text className="text-slate-700 font-semibold flex-1 ml-2 text-[14px]">
                Hưng Yên
              </Text>
            </View>

            <View className="flex-row items-center pt-2">
              <View className="flex-1 bg-[#FDFBF7] border border-[#EFDDC4] rounded-2xl p-4 mr-2 items-center shadow-sm shadow-orange-900/5">
                <MaterialCommunityIcons name="card-account-details-outline" size={24} color="#7A5448" className="mb-1" />
                <Text className="text-slate-500 font-medium text-[12px] mb-0.5">Mã sinh viên</Text>
                <Text className="text-slate-900 font-black text-[15px]">10122192</Text>
              </View>
              
              <View className="flex-1 bg-[#FDFBF7] border border-[#EFDDC4] rounded-2xl p-4 ml-2 items-center shadow-sm shadow-orange-900/5">
                <MaterialCommunityIcons name="google-classroom" size={24} color="#7A5448" className="mb-1" />
                <Text className="text-slate-500 font-medium text-[12px] mb-0.5">Mã lớp</Text>
                <Text className="text-slate-900 font-black text-[15px]">12522W.1</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>

    </View>
  );
}
