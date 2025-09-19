import { apiClient } from './apiClient';

// FCM 토큰 등록
export const registerDevice = async (fcmToken: string, osType: 'ANDROID' | 'IOS') => {
  try {
    const response = await apiClient.post('/notifications/devices', {
      fcmToken,
      osType,
    });
    console.log('✅ 디바이스 등록 성공:', response);
    return response;
  } catch (error) {
    console.error('❌ 디바이스 등록 실패:', error);
    throw error;
  }
};

// FCM 토큰 해지
export const unregisterDevice = async (fcmToken: string) => {
  try {
    const response = await apiClient.delete('/notifications/devices', {
      fcmToken,
    });
    console.log('✅ 디바이스 해지 성공:', response);
    return response;
  } catch (error) {
    console.error('❌ 디바이스 해지 실패:', error);
    throw error;
  }
};
