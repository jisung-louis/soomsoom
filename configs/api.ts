import { environmentConfig } from './environment';

/**
 * API 설정을 중앙에서 관리하는 파일
 * 
 * 🎯 왜 이렇게 하나요?
 * - 개발/테스트/실제서비스 환경마다 다른 API 주소를 써야 해요
 * - 매번 파일마다 찾아서 바꾸는 대신, 여기서 한 번만 바꾸면 돼요!
 * - 나중에 API 주소가 바뀌어도 여기만 수정하면 됩니다
 */

// 환경 구분
export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging'
} as const;

// 현재 환경 확인 (개발 중이면 development, 아니면 production)
export const getEnvironment = (): string => {
  return __DEV__ ? ENV.DEVELOPMENT : ENV.PRODUCTION;
};

// API 기본 설정 (환경별 설정 사용 - 단일 소스)
export const API_CONFIG = {
  // 환경별 설정에서 단일 소스로 가져옴
  BASE_URL: environmentConfig.api.baseUrl,
  
  // API 요청 시간 제한 (환경별 설정 사용)
  TIMEOUT: environmentConfig.api.timeout,
  
  // API 엔드포인트들 (아직 사용중이지 않음(= 아직 중앙에서 관리하지 않음))
  ENDPOINTS: {
    // 구매 관련
    PURCHASE: '/api/room/purchase',
    PURCHASE_SINGLE: '/api/room/purchase/single',
    
    // 감정 기록 관련
    EMOTIONS: '/api/emotions',
    EMOTION_RECORD: '/api/emotions/record',
    EMOTION_HISTORY: '/api/emotions/history',
    EMOTION_FIRST_CHECK: '/api/emotions/first-check',
    EMOTION_COUNT: '/api/emotions/count',
    
    // 알람 관련
    ALARMS: '/api/alarms',
    ALARM_CREATE: '/api/alarms/create',
    ALARM_UPDATE: '/api/alarms/update',
    ALARM_DELETE: '/api/alarms/delete',
    
    // 사용자 관련
    USERS: '/api/users',
    USER_PROFILE: '/api/users/profile',
    
    // 방 아이템 관련
    ROOM: '/api/room',
    ROOM_ITEMS: '/api/room/items',
    ROOM_PLACE: '/api/room/place',
    ROOM_REMOVE: '/api/room/remove',
    
    // 명상 관련
    MEDITATION_FAVORITE: '/api/meditation/favorite',
    MEDITATION_INSTRUCTORS: '/api/meditation/instructors',
    MEDITATION_FOLLOW: '/api/meditation/follow',
    
    // 액티비티 관련
    ACTIVITIES: '/activities',
    ACTIVITY_DETAIL: '/activities/{activityId}',
    ACTIVITY_FAVORITE: '/activities/{activityId}/favorite',
    USER_FAVORITES: '/users/me/favorites',
  }
} as const;

// API 응답 타입 정의
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// 에러 응답 타입
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
