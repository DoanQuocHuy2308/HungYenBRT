import React, { useRef, useState, useEffect } from 'react';
import { View, Text, FlatList, useWindowDimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

const slides = [
  {
    id: '1',
    title: 'Đăng ký Sinh trắc học',
    description: 'Xác thực tài khoản bảo mật cao cấp qua Căn cước công dân gắn chip và nhận diện khuôn mặt. Nhanh chóng và an toàn tuyệt đối.',
    icon: 'card-account-details-outline',
  },
  {
    id: '2',
    title: 'Mua vé Online Thuận tiện',
    description: 'Thanh toán bảo mật mọi lúc, mọi nơi. Hệ thống đặt vé thông minh, quản lý vé và lịch sử chuyến đi chuyên nghiệp.',
    icon: 'ticket-confirmation-outline',
  },
  {
    id: '3',
    title: 'Xác thực QR & Khuôn mặt',
    description: 'Chỉ cần quét mã QR hoặc xác thực khuôn mặt tại trạm để lên xe buýt BRT. Trải nghiệm công nghệ di chuyển hiện đại.',
    icon: 'qrcode-scan',
  }
];

export default function IntroScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  const logoTranslateY = useSharedValue(0);

  useEffect(() => {
    logoTranslateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // infinite repeat
      true // reverse
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: logoTranslateY.value }],
    };
  });

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Route to tabs or main screen after onboarding
      router.replace('/(tabs)' as any);
    }
  };

  const onMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View className="flex-1 bg-[#5D4037]">
      <LinearGradient colors={['#DDB892', '#5D4037']} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
      <StatusBar style="light" />
      
      {/* Header with Logo and Skip Button */}
      <View className="px-6 flex-row justify-between items-center" style={{ paddingTop: Math.max(insets.top, 40) + 14 }}>
        <Animated.View entering={FadeInUp.duration(1000).springify()}>
          <Animated.View 
            style={[animatedLogoStyle]} 
            className="w-14 h-14 bg-white/90 rounded-2xl overflow-hidden shadow-lg border border-white/50 items-center justify-center p-0.5"
          >
            <View className="w-full h-full bg-white rounded-xl overflow-hidden items-center justify-center">
              <Image
                source={require('../../assets/images/icon.png')}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={500}
              />
            </View>
          </Animated.View>
        </Animated.View>

        <TouchableOpacity onPress={() => router.replace('/(tabs)' as any)}>
          <Text className="text-[#5E3A21] font-bold text-base bg-white/50 px-4 py-1.5 rounded-full overflow-hidden">
            Bỏ qua
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 items-center justify-center px-8">
            <Animated.View entering={FadeInUp.duration(800).delay(200)}>
              <Animated.View 
                className="w-56 h-56 bg-white/10 rounded-full items-center justify-center border-4 border-white/20 mb-10 shadow-lg"
              >
                <MaterialCommunityIcons name={item.icon as any} size={100} color="#FFFFFF" />
              </Animated.View>
            </Animated.View>
            
            <Animated.View entering={FadeInDown.duration(800).delay(400)}>
              <Animated.View className="items-center w-full">
                <Text className="text-[28px] font-extrabold text-white text-center mb-4 tracking-wide shadow-md shadow-black/30">
                  {item.title}
                </Text>
                <Text className="text-base text-[#F5E6D3] text-center leading-relaxed font-medium px-4">
                  {item.description}
                </Text>
              </Animated.View>
            </Animated.View>
          </View>
        )}
      />

      {/* Pagination & Next Button Container */}
      <View className="px-8 w-full flex-row items-center justify-between" style={{ paddingBottom: Math.max(insets.bottom, 20) + 14 }}>
        
        {/* Pagination Dots */}
        <View className="flex-row items-center space-x-2">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`h-2.5 rounded-full ${
                currentIndex === index 
                  ? 'w-8 bg-white' 
                  : 'w-2.5 bg-white/30'
              }`}
            />
          ))}
        </View>

        {/* Next/Finish Button */}
        <TouchableOpacity 
          onPress={handleNext}
          className="bg-white px-6 py-3.5 rounded-2xl shadow-lg flex-row items-center justify-center"
        >
          <Text className="text-[#5D4037] font-bold text-lg mr-2">
            {currentIndex === slides.length - 1 ? 'Bắt đầu' : 'Tiếp tục'}
          </Text>
          <MaterialCommunityIcons 
            name={currentIndex === slides.length - 1 ? "check-circle" : "arrow-right-circle"} 
            size={24} 
            color="#5D4037" 
          />
        </TouchableOpacity>
        
      </View>
    </View>
  );
}
