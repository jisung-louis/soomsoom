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
          // 개발 서버 고정(사용자 제공)
          return 'http://3.34.190.34:8080';
        })()
      : 'http://3.34.190.34:8080',     // 프로덕션 API 서버
    
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
    enableSSVTesting: isDevelopment,      // 개발에서만 SSV 테스트 활성화
  },

  // 소셜 로그인 설정
  auth: {
    google: {
      clientId: isDevelopment 
        ? '107458236623-5cc2h8h6ot6irjfnso4bmgrf2c8pi5sm.apps.googleusercontent.com'  // 개발용 Web Application Client ID
        : '107458236623-5cc2h8h6ot6irjfnso4bmgrf2c8pi5sm.apps.googleusercontent.com',  // 프로덕션용 Web Application Client ID (동일)
      iosClientId: isDevelopment
        ? '107458236623-0mru63ph97l3va5ru46hravkoo7r2q9q.apps.googleusercontent.com'  // 개발용 iOS Client ID
        : '107458236623-0mru63ph97l3va5ru46hravkoo7r2q9q.apps.googleusercontent.com', // 프로덕션용 iOS Client ID (동일)
    },
  },

  // 광고 설정
  ads: {
    // SSV 콜백 URL (서버 엔드포인트)
    ssvCallbackUrl:'https://185c348d8980.ngrok-free.app/callbacks/admob/ssv',  // 개발 서버 (ngrok)
    
    // 광고 단위 ID 설정
    rewardedAdUnitId: isDevelopment
      ? 'ca-app-pub-3940256099942544/5224354917'  // Google 테스트 광고 ID (SSV 지원)
      : 'ca-app-pub-4758709448782249/4206373001', // 실제 광고 ID
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
    heartPoints: 0,
  },

  // 방 아이템 관련 초기 상태 (프리셋)
  room: {
    ownedItems: isDevelopment 
      ? [6] // 개발
      : [],// 실제
    
    placedItems: {
      background: 6,
      eyewear: null,
      hat: null,
      frame: null,
      floor: null,
      shelf: null,
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
