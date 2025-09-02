/**
 * 앱 전체의 초기 상태 상수 정의
 * 
 * 🎯 왜 이렇게 하나요?
 * - 하드코딩된 초기값들을 한 곳에서 관리
 * - 개발/프로덕션 환경별로 다른 초기값 설정 가능
 * - 스토어 간 일관성 있는 초기 상태 관리
 */

// 화폐 관련 초기 상태
export const INITIAL_CURRENCY_STATE = {
  heartPoints: 100, // 시작 시 100포인트
} as const;

// 방 아이템 관련 초기 상태
export const INITIAL_ROOM_STATE = {
  ownedItems: [1, 2, 3, 4, 5, 6, 12, 20] as number[], // 기존 IN_POSSESSION_ITEMS 데이터
  placedItems: {
    background: 6,
    eyewear: 12,
    hat: 20,
    frame1: 2,
    frame2: 3,
    floor: 4,
    shelf: 5,
  },
  selectedItems: [] as number[],
};

// 알람 관련 초기 상태
export const INITIAL_ALARM_STATE = {
  alarmList: [] as any[], // 빈 배열로 시작
};

// 플레이 관련 초기 상태
export const INITIAL_PLAY_STATE = {
  favoriteContents: [] as import('../data/playContentData').FavoriteContentData[],
  followedTeacherIds: [] as number[],
};

// 온보딩 관련 초기 상태
export const INITIAL_ONBOARDING_STATE = {
  hasSeenOnboarding: null, // null: 로딩 중, true: 완료, false: 필요
} as const;

// 환경별 초기 상태 (개발/프로덕션)
export const getInitialStates = (environment: 'development' | 'production' = 'development') => {
  if (environment === 'development') {
    return {
      currency: {
        ...INITIAL_CURRENCY_STATE,
        heartPoints: 1000, // 개발 환경에서는 더 많은 포인트 제공
      },
      room: INITIAL_ROOM_STATE,
      alarm: INITIAL_ALARM_STATE,
      play: INITIAL_PLAY_STATE,
      onboarding: INITIAL_ONBOARDING_STATE,
    };
  }
  
  return {
    currency: INITIAL_CURRENCY_STATE,
    room: INITIAL_ROOM_STATE,
    alarm: INITIAL_ALARM_STATE,
    play: INITIAL_PLAY_STATE,
    onboarding: INITIAL_ONBOARDING_STATE,
  };
};
