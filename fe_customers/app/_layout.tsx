import { Stack } from "expo-router";
import '@/constants/api';
import { AuthProvider } from "../hooks/AuthProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login/index" />
        <Stack.Screen name="register/index" />
        <Stack.Screen name="register/step2" />
        <Stack.Screen name="intro/index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="single-ticket/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="time-ticket/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="discount-ticket/index" />
        <Stack.Screen name="ticket-details/index" />
        <Stack.Screen name="qr-ticket/index" />
        <Stack.Screen name="priority-tickets/index" />
        <Stack.Screen name="payment/index" options={{ presentation: 'modal' }} />
      </Stack>
    </AuthProvider>
  );
}
