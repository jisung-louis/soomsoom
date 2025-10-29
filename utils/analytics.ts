import analytics from '@react-native-firebase/analytics';

/**
 * Firebase Analytics 유틸리티 함수
 * 앱 전체에서 사용할 수 있는 Analytics 헬퍼 함수들
 */

/**
 * 화면 조회 이벤트
 */
export const logScreenView = async (screenName: string, screenClass?: string) => {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
    console.log(`📊 [Analytics] 화면 조회: ${screenName}`);
  } catch (error) {
    console.warn('⚠️ [Analytics] 화면 조회 이벤트 로깅 실패:', error);
  }
};

/**
 * 커스텀 이벤트 로깅
 */
export const logEvent = async (eventName: string, params?: Record<string, any>) => {
  try {
    await analytics().logEvent(eventName, params || {});
    console.log(`📊 [Analytics] 이벤트: ${eventName}`, params || {});
  } catch (error) {
    console.warn('⚠️ [Analytics] 이벤트 로깅 실패:', error);
  }
};

/**
 * 사용자 속성 설정
 */
export const setUserProperty = async (name: string, value: string) => {
  try {
    await analytics().setUserProperty(name, value);
    console.log(`📊 [Analytics] 사용자 속성 설정: ${name} = ${value}`);
  } catch (error) {
    console.warn('⚠️ [Analytics] 사용자 속성 설정 실패:', error);
  }
};

/**
 * 사용자 ID 설정 (로그인 시)
 */
export const setUserId = async (userId: string | null) => {
  try {
    await analytics().setUserId(userId);
    console.log(`📊 [Analytics] 사용자 ID 설정: ${userId || '(null - 로그아웃)'}`);
  } catch (error) {
    console.warn('⚠️ [Analytics] 사용자 ID 설정 실패:', error);
  }
};

// ===== 주요 비즈니스 이벤트들 =====

/**
 * 탭 전환 이벤트
 */
export const logTabChange = async (tabName: 'home' | 'record' | 'play' | 'alarm' | 'my') => {
  await logEvent('tab_change', { tab_name: tabName });
};

/**
 * 감정 기록 이벤트
 */
export const logEmotionRecord = async (emotion: string) => {
  await logEvent('emotion_recorded', { emotion });
};

/**
 * 명상/호흡 실행 이벤트
 */
export const logPlayActivity = async (activityType: string, activityId?: number) => {
  await logEvent('play_activity_start', {
    activity_type: activityType,
    activity_id: activityId,
  });
};

/**
 * 명상/호흡 완료 이벤트
 */
export const logPlayActivityComplete = async (
  activityType: string,
  duration: number,
  activityId?: number
) => {
  await logEvent('play_activity_complete', {
    activity_type: activityType,
    duration_seconds: duration,
    activity_id: activityId,
  });
};

/**
 * 아이템 구매 시작 이벤트
 */
export const logPurchaseStart = async (itemIds: number[], totalPrice: number) => {
  await logEvent('purchase_start', {
    item_count: itemIds.length,
    total_price: totalPrice,
    item_ids: itemIds.join(','),
  });
};

/**
 * 아이템 구매 완료 이벤트 (Conversion!)
 */
export const logPurchaseComplete = async (
  itemIds: number[],
  totalPrice: number,
  currency: string = 'heart_points'
) => {
  await logEvent('purchase', {
    value: totalPrice,
    currency,
    item_count: itemIds.length,
    item_ids: itemIds.join(','),
  });
};

/**
 * 방 꾸미기 시작 이벤트
 */
export const logRoomDecorationStart = async () => {
  await logEvent('room_decoration_start');
};

/**
 * 방 꾸미기 저장 이벤트
 */
export const logRoomDecorationSave = async (itemIds: number[]) => {
  await logEvent('room_decoration_save', {
    item_count: itemIds.length,
    item_ids: itemIds.join(','),
  });
};

/**
 * 알람 설정 이벤트
 */
export const logAlarmSet = async (time: string, type?: string) => {
  await logEvent('alarm_set', {
    alarm_time: time,
    alarm_type: type,
  });
};

/**
 * 소셜 로그인 이벤트
 */
export const logSocialLogin = async (provider: 'GOOGLE' | 'APPLE') => {
  await logEvent('login', {
    method: provider.toLowerCase(),
  });
};

/**
 * 회원탈퇴 이벤트
 */
export const logAccountDeletion = async () => {
  await logEvent('user_account_deletion');
};

/**
 * 업적 달성 이벤트
 */
export const logAchievementUnlock = async (achievementId: number, achievementName: string) => {
  await logEvent('achievement_unlock', {
    achievement_id: achievementId,
    achievement_name: achievementName,
  });
};

