import { Platform } from 'react-native';

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

// API 기본 설정
export const API_CONFIG = {
  // 환경에 따라 다른 API 주소 사용
  BASE_URL: getEnvironment() === ENV.DEVELOPMENT 
    ? Platform.select({
        ios: 'http://localhost:3000',        // iOS 시뮬레이터
        android: 'http://10.0.2.2:3000',    // Android 에뮬레이터
        default: 'http://localhost:3000'
      })
    : 'https://api.sumsum.app',              // 실제 서비스 주소 (나중에 설정)
  
  // API 요청 시간 제한 (10초)
  TIMEOUT: 10000,
  
  // API 엔드포인트들 (나중에 추가할 API들)
  ENDPOINTS: {
    PURCHASE: '/api/room/purchase',
    EMOTIONS: '/api/emotions',
    ALARMS: '/api/alarms',
    USERS: '/api/users',
    ROOM: '/api/room'
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
