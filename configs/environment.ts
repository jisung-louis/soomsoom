/**
 * 환경별 설정 관리
 * 
 * 개발 환경과 프로덕션 환경을 구분하여
 * 각각에 맞는 설정을 제공합니다.
 */

// 환경 구분 (STAGING 환경 지원)
export const getEnvironment = (): 'development' | 'staging' | 'production' => {
  // STAGING 환경은 환경변수나 빌드 플래그로 제어
  if (__DEV__) {
    return 'development';
  }
  
  // STAGING 환경 체크 (예: 환경변수 또는 빌드 설정)
  // 실제 구현 시에는 빌드 시점에 설정
  const isStaging = false; // TODO: 실제 STAGING 환경 감지 로직
  
  return isStaging ? 'staging' : 'production';
};

export const isDevelopment = getEnvironment() === 'development';
export const isStaging = getEnvironment() === 'staging';
export const isProduction = getEnvironment() === 'production';

/**
 * 환경별 기본 설정
 */
export const environmentConfig = {
  // API 설정
  api: {
    baseUrl: isDevelopment 
      ? (() => {
          // 개발 환경에서 플랫폼별 로컬 서버 사용
          const { Platform } = require('react-native');
          return Platform.select({
            ios: 'http://localhost:3000',        // iOS 시뮬레이터
            android: 'http://10.0.2.2:3000',    // Android 에뮬레이터
            default: 'http://localhost:3000'
          });
        })()
      : 'https://api.sumsum.com',     // 프로덕션 API 서버
    
    timeout: isDevelopment 
      ? 10000  // 개발: 10초 (디버깅 시간 고려)
      : 5000,  // 프로덕션: 5초 (빠른 응답)
  },

  // 디버깅 설정
  debug: {
    enabled: isDevelopment,
    logLevel: isDevelopment ? 'verbose' : 'error',
    showDevTools: isDevelopment, // Zustand DevTools 활성화
  },

  // 앱 설정
  app: {
    name: isDevelopment ? '숨숨 (개발)' : '숨숨',
    version: '1.0.0',
    buildNumber: isDevelopment ? 'dev' : '1',
  },

  // 기능 플래그 (Feature Flags)
  features: {
    enableAnalytics: isProduction,        // 프로덕션에서만 분석 수집
    enableCrashReporting: isProduction,   // 프로덕션에서만 크래시 리포팅
    enableLocalPurchaseSimulator: isDevelopment, // 개발에서만 로컬 구매 시뮬레이터
    showDebugInfo: isDevelopment,         // 개발에서만 디버그 정보 표시
  },
} as const;

/**
 * 환경별 초기 상태 설정 (프리셋)
 * 
 * ⚠️ 주의: 이 값들은 앱 첫 구동 시에만 사용되는 프리셋입니다.
 * 실제 사용자 데이터는 서버와 동기화되며, 서버 데이터가 우선순위를 가집니다.
 * 
 * 🔄 서버 동기화 시점:
 * - 로그인 후: 서버에서 최신 사용자 데이터 로드
 * - 앱 시작 시: 로컬 저장된 데이터와 서버 데이터 비교/동기화
 * - 실시간 업데이트: 서버 상태 변경 시 자동 동기화
 */
export const initialStates = {
  // 화폐 관련 초기 상태 (프리셋)
  currency: {
    heartPoints: isDevelopment ? 1000 : 100, // 개발: 1000포인트, 실제: 100포인트
  },

  // 방 아이템 관련 초기 상태 (프리셋)
  room: {
    ownedItems: isDevelopment 
      ? [1, 2, 3, 4, 5, 6, 12, 20, 21, 22, 23, 24] // 개발: 더 많은 아이템
      : [1, 2, 3, 4, 5, 6, 12, 20],                // 실제: 기본 아이템만
    
    placedItems: {
      background: 6,
      eyewear: 12,
      hat: 20,
      frame: [2, 3] as [number | null, number | null],
      floor: 4,
      shelf: 5,
    },
    
    selectedItems: [] as number[],
  },

  // 플레이 관련 초기 상태 (프리셋)
  play: {
    favoriteActivities: [] as any[],
    followedInstructorIds: [] as number[],
  },

  // 알람 관련 초기 상태 (프리셋)
  alarm: {
    alarmList: [] as any[],
    selectedAlarmList: [] as any[],
    selectedAlarmListId: [] as any[],
  },

  // 온보딩 관련 초기 상태 (프리셋)
  onboarding: {
    hasSeenOnboarding: isDevelopment ? false : null, // 개발: false, 실제: null
  },
} as const;

/**
 * 환경별 로깅 함수
 */
export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },

  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
};

/**
 * 환경별 에러 처리
 */
export const errorHandler = {
  // 개발 환경: 상세한 에러 정보
  development: (error: Error, context?: string) => {
    console.error(`[DEV ERROR] ${context || 'Unknown'}:`, error);
    console.error('Stack trace:', error.stack);
    return {
      message: `개발 에러: ${error.message}`,
      details: error.stack,
      context,
    };
  },

  // 프로덕션 환경: 사용자 친화적 에러 메시지
  production: (error: Error, context?: string) => {
    // 프로덕션에서는 에러를 외부 서비스로 전송
    // 예: Sentry, Crashlytics 등
    
    return {
      message: '앗, 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
      details: null,
      context: null,
    };
  },

  // 통합 에러 처리 함수
  handle: (error: Error, context?: string) => {
    return isDevelopment 
      ? errorHandler.development(error, context)
      : errorHandler.production(error, context);
  },
};

/**
 * 환경 정보 출력 (개발 환경에서만)
 */
export const printEnvironmentInfo = () => {
  if (isDevelopment) {
    console.log('--------------------------------');
    console.log('| 🚀 환경 정보:');
    console.log(`| - 환경: ${isDevelopment ? '개발' : '프로덕션'}`);
    console.log(`| - API URL: ${environmentConfig.api.baseUrl}`);
    console.log(`| - 디버깅: ${environmentConfig.debug.enabled ? '활성화' : '비활성화'}`);
    console.log(`| - 초기 하트: ${initialStates.currency.heartPoints}`);
    console.log(`| - 소유 아이템 수: ${initialStates.room.ownedItems.length}`);
    console.log(`| - 배치 아이템 수: ${Object.values(initialStates.room.placedItems).length}`);
    console.log(`| - 온보딩 상태: ${initialStates.onboarding.hasSeenOnboarding}`);
    console.log(`| - 알람 상태: ${initialStates.alarm.alarmList.length}`);
    console.log('--------------------------------');
  }
};

// 환경 정보 출력 함수는 필요 시에만 호출
// 앱 시작 시 자동 출력을 원하지 않으면 아래 주석 처리
if (isDevelopment) {
  printEnvironmentInfo();
}
