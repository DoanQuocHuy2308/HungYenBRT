import React from 'react';
import { Tabs, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5D4037', // sky-600
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          height: 85,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-tickets"
        options={{
          title: 'Vé của tôi',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="ticket-outline" size={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="qr"
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push('/my-tickets' as any);
          },
        })}
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <View className="mb-8 w-20 h-20 bg-[#5D4037] rounded-full items-center justify-center border-4 border-white shadow-xl shadow-stone-900/50">
              <MaterialCommunityIcons name="qrcode-scan" size={30} color="white" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: 'Tìm ga',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map-outline" size={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="emoticon-outline" size={30} color={color} />,
        }}
      />
    </Tabs>
  );
}
