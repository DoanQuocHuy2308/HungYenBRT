import Constants from 'expo-constants';

/**
 * Lấy IP tự động từ Expo Metro server.
 * Khi đổi mạng và restart Expo, IP sẽ tự cập nhật — không cần sửa tay.
 */
function getBaseUrl(): string {
  // Lấy hostUri từ Expo (có dạng "192.168.x.x:8081")
  const hostUri = Constants.expoConfig?.hostUri;

  if (hostUri) {
    // Tách lấy IP (bỏ phần :port của metro)
    const ip = hostUri.split(':')[0];
    const url = `http://${ip}:3000`;
    console.log(`[API] 🌐 hostUri từ Expo: ${hostUri}`);
    console.log(`[API] ✅ Base URL: ${url}`);
    return url;
  }

  // Fallback khi build production hoặc chạy standalone
  console.log('[API] ⚠️ Không lấy được hostUri — dùng fallback: http://localhost:3000');
  return 'http://localhost:3000';
}

export const BASE_URL = getBaseUrl();
console.log('[API] 🚀 BASE_URL đang dùng:', BASE_URL);

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${BASE_URL}/api/auth/login`,
  REGISTER: `${BASE_URL}/api/auth/register`,

  // Thêm các endpoint khác tại đây...
};
