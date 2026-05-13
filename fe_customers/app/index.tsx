import "../global.css"
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  Easing,
  withDelay,
  withRepeat,
  withSequence
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const loadingOpacity = useSharedValue(0.3);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Animate logo in
    logoOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });

    // Animate text in after logo
    textOpacity.value = withDelay(
      600, 
      withTiming(1, { duration: 800 })
    );
    textTranslateY.value = withDelay(
      600,
      withSpring(0, { damping: 12, stiffness: 90 })
    );

    // Subtle pulsing for loading text
    loadingOpacity.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.3, { duration: 800 })
        ),
        -1, // infinite repeat
        true // reverse
      )
    );

    // Redirect to login after splash
    const timer = setTimeout(() => {
      router.replace('/login' as any);
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: logoScale.value }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textTranslateY.value }],
    };
  });

  const animatedLoadingStyle = useAnimatedStyle(() => {
    return {
      opacity: loadingOpacity.value,
    };
  });

  return (
    <View className="flex-1 items-center justify-center bg-[#5D4037]">
      <LinearGradient colors={['#DDB892', '#5D4037']} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
      <StatusBar style="light" />
      
      <Animated.View style={[animatedLogoStyle]} className="items-center justify-center shadow-lg shadow-black/30">
        <View className="w-40 h-40 bg-white rounded-[40px] overflow-hidden items-center justify-center border border-white/50">
           <Image
            source={require('../assets/images/icon.png')}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={500}
          />
        </View>
      </Animated.View>

      <Animated.View style={[animatedTextStyle]} className="items-center mt-10">
        <Text className="text-[32px] font-extrabold text-white tracking-wider">
          Hưng Yên BRT
        </Text>
        <Text className="text-base text-[#F5E6D3] font-medium mt-2">
          Hệ thống đặt vé xe buýt nhanh
        </Text>
        
        <Animated.View style={[animatedLoadingStyle]} className="mt-16 flex-row items-center justify-center">
            <Text className="text-sm text-[#DDB892] font-bold uppercase tracking-widest">
                Đang khởi tạo ứng dụng...
            </Text>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[animatedTextStyle, { paddingBottom: Math.max(insets.bottom, 20) }]} className="absolute bottom-4 items-center w-full">
        <Text className="text-sm text-white/50 font-medium">
          Hệ thống được phát triển bởi Doãn Quốc Huy
        </Text>
      </Animated.View>
    </View>
  );
}