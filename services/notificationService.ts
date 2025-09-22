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

// 알림 설정 토글
export type NotificationSettingType =
  | 'DIARY_REMINDER'
  | 'RE_ENGAGEMENT'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'NEWS_UPDATE'
  | 'REWARD_ACQUIRED';

export const toggleNotificationSetting = async (
  type: NotificationSettingType,
  enabled: boolean
) => {
  try {
    return await apiClient.patch(`/notifications/settings/${type}/toggle`, { enabled });
  } catch (error) {
    console.error('❌ 알림 설정 토글 실패:', error);
    throw error;
  }
};

// 마음일기 알림 시간 변경 (24h "HH:mm:ss")
export const updateDiaryNotificationTime = async (time: string) => {
  try {
    return await apiClient.put('/notifications/settings/diary-time', { time });
  } catch (error) {
    console.error('❌ 마음일기 알림 시간 변경 실패:', error);
    throw error;
  }
};

// 내 알림 설정 조회
export interface NotificationSettingsResponse {
  diaryNotificationEnabled: boolean;
  diaryNotificationTime: string; // e.g. '22:00:00'
  soomsoomNewsNotificationEnabled: boolean;
  reEngagementNotificationEnabled: boolean;
}

export const getNotificationSettings = async (): Promise<NotificationSettingsResponse> => {
  try {
    return await apiClient.get<NotificationSettingsResponse>('/notifications/settings');
  } catch (error) {
    console.error('❌ 알림 설정 조회 실패:', error);
    throw error;
  }
};
