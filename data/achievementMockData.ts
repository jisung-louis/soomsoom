// 개발용 업적 Mock 데이터
// TODO: 백엔드 연동 후 실제 API 데이터로 교체

import { Achievement } from '../types';

// 정적 Mock 데이터는 제거됨 - 동적 Mock 데이터만 사용

export const mockAchievementDefinitions : Achievement[] = [
  {
    id: 101,
    name: '첫 일기 작성',
    description: '일기를 처음으로 작성했어요.',
    phrase: '시작이 반이에요!',
    grade: 'BRONZE' as const,
    category: 'DIARY' as const,
    rewardPoints: 10,
    rewardItemId: null,
    conditions: [
      { id: 1, type: 'DIARY_COUNT', targetValue: 1 }
    ]
  },
  {
    id: 102,
    name: '일기 10회 작성',
    description: '일기를 10회 작성했어요.',
    phrase: '꾸준함이 답이에요!',
    grade: 'SILVER' as const,
    category: 'DIARY' as const,
    rewardPoints: 50,
    rewardItemId: 1001,
    conditions: [
      { id: 2, type: 'DIARY_COUNT', targetValue: 10 }
    ]
  },
  {
    id: 201,
    name: '첫 명상',
    description: '명상을 처음으로 완료했어요.',
    phrase: '마음의 평화를 찾아보세요!',
    grade: 'BRONZE' as const,
    category: 'MEDITATION' as const,
    rewardPoints: 15,
    rewardItemId: null,
    conditions: [
      { id: 3, type: 'MEDITATION_COUNT', targetValue: 1 }
    ]
  },
  {
    id: 202,
    name: '명상 달인',
    description: '명상을 100회 완료하세요.',
    phrase: '명상의 달인이 되었어요!',
    grade: 'GOLD' as const,
    category: 'MEDITATION' as const,
    rewardPoints: 200,
    rewardItemId: 9001,
    conditions: [
      { id: 4, type: 'MEDITATION_COUNT', targetValue: 100 }
    ]
  },
  {
    id: 301,
    name: '첫 호흡 운동',
    description: '호흡 운동을 처음으로 완료했어요.',
    phrase: '깊은 호흡으로 스트레스를 날려보세요!',
    grade: 'BRONZE' as const,
    category: 'BREATHING' as const,
    rewardPoints: 12,
    rewardItemId: null,
    conditions: [
      { id: 5, type: 'BREATHING_COUNT', targetValue: 1 }
    ]
  },
  {
    id: 401,
    name: '꾸준한 방문자',
    description: '앱을 10일 연속으로 방문했어요.',
    phrase: '꾸준함이 최고의 재능이에요!',
    grade: 'SPECIAL' as const,
    category: 'HIDDEN' as const,
    rewardPoints: 100,
    rewardItemId: 8001,
    conditions: [
      { id: 6, type: 'VISIT_STREAK', targetValue: 10 }
    ]
  }
];

// 불필요한 Mock 데이터 제거됨 - 현재는 팝업 시스템만 사용

// 동적 Mock 데이터를 위한 전역 상태
let mockUserProgress: Map<number, { current: number; target: number; isAchieved: boolean }> = new Map();

/**
 * Mock 사용자 진행도 초기화
 */
export const initializeMockUserProgress = () => {
  // 이미 초기화되어 있으면 스킵
  if (mockUserProgress.size > 0) {
    console.log('🔧 Mock 진행도 이미 초기화됨, 스킵');
    return;
  }
  
  mockUserProgress = new Map([
    [101, { current: 0, target: 1, isAchieved: false }], // 첫 일기 작성
    [102, { current: 0, target: 10, isAchieved: false }], // 일기 10회 작성
    [201, { current: 0, target: 1, isAchieved: false }], // 첫 명상
    [202, { current: 0, target: 100, isAchieved: false }], // 명상 달인
    [301, { current: 0, target: 1, isAchieved: false }], // 첫 호흡 운동
    [401, { current: 0, target: 10, isAchieved: false }], // 꾸준한 방문자
  ]);
  
  console.log('🔧 Mock 사용자 진행도 초기화 완료!');
};

/**
 * Mock 사용자 진행도 업데이트
 */
export const updateMockUserProgress = (achievementId: number, progress: number) => {
  const current = mockUserProgress.get(achievementId);
  if (current) {
    const newCurrent = Math.min(current.current + progress, current.target);
    const isAchieved = newCurrent >= current.target;
    
    mockUserProgress.set(achievementId, {
      current: newCurrent,
      target: current.target,
      isAchieved: isAchieved
    });
    
    console.log(`🔧 Mock 진행도 업데이트: ${achievementId}번 업적 ${current.current} → ${newCurrent}/${current.target} (달성: ${isAchieved})`);
  }
};

/**
 * Mock 사용자 진행도 리셋
 */
export const resetMockUserProgress = () => {
  console.log('🔄 Mock 사용자 진행도 리셋 중...');
  
  mockUserProgress = new Map([
    [101, { current: 0, target: 1, isAchieved: false }], // 첫 일기 작성
    [102, { current: 0, target: 10, isAchieved: false }], // 일기 10회 작성
    [201, { current: 0, target: 1, isAchieved: false }], // 첫 명상
    [202, { current: 0, target: 100, isAchieved: false }], // 명상 달인
    [301, { current: 0, target: 1, isAchieved: false }], // 첫 호흡 운동
    [401, { current: 0, target: 10, isAchieved: false }], // 꾸준한 방문자
  ]);
  
  console.log('✅ Mock 사용자 진행도 리셋 완료!');
};

/**
 * 사용자 행동 시뮬레이션 함수
 * 실제 사용자 행동을 시뮬레이션하여 관련된 모든 업적을 업데이트
 */
export const simulateUserAction = (actionType: string, count: number = 1) => {
  console.log(`🎭 Mock: ${actionType} ${count}회 수행`);
  
  switch (actionType) {
    case 'DIARY_WRITE':
      // 일기 작성 시 모든 일기 관련 업적 업데이트
      updateMockUserProgress(101, Math.min(count, 1)); // 첫 일기 작성 (최대 1)
      updateMockUserProgress(102, count); // 일기 10회 작성 (실제 진행도)
      break;
      
    case 'MEDITATION_COMPLETE':
      // 명상 완료 시 모든 명상 관련 업적 업데이트
      updateMockUserProgress(201, Math.min(count, 1)); // 첫 명상 (최대 1)
      updateMockUserProgress(202, count); // 명상 100회 (실제 진행도)
      break;
      
    case 'BREATHING_COMPLETE':
      updateMockUserProgress(301, Math.min(count, 1)); // 첫 호흡 (최대 1)
      break;
      
    case 'APP_VISIT':
      updateMockUserProgress(401, count); // 방문 10일 (실제 진행도)
      break;
      
    default:
      console.warn(`⚠️ 알 수 없는 행동 타입: ${actionType}`);
  }
};

/**
 * 동적 Mock 업적 데이터 생성
 */
export const getDynamicMockAchievementData = () => {
  return {
    content: [
      {
        achievementId: 101,
        name: '첫 일기 작성',
        description: '일기를 처음으로 작성했어요.',
        phrase: '시작이 반이에요!',
        grade: 'BRONZE' as const,
        category: 'DIARY' as const,
        isAchieved: mockUserProgress.get(101)?.isAchieved ?? false,
        achievedAt: mockUserProgress.get(101)?.isAchieved ? new Date().toISOString() : null,
        progress: mockUserProgress.get(101) ?? { current: 0, target: 1 }
      },
      {
        achievementId: 102,
        name: '일기 10회 작성',
        description: '일기를 10회 작성했어요.',
        phrase: '꾸준함이 답이에요!',
        grade: 'SILVER' as const,
        category: 'DIARY' as const,
        isAchieved: mockUserProgress.get(102)?.isAchieved ?? false,
        achievedAt: mockUserProgress.get(102)?.isAchieved ? new Date().toISOString() : null,
        progress: mockUserProgress.get(102) ?? { current: 0, target: 10 }
      },
      {
        achievementId: 201,
        name: '첫 명상',
        description: '명상을 처음으로 완료했어요.',
        phrase: '마음의 평화를 찾아보세요!',
        grade: 'BRONZE' as const,
        category: 'MEDITATION' as const,
        isAchieved: mockUserProgress.get(201)?.isAchieved ?? false,
        achievedAt: mockUserProgress.get(201)?.isAchieved ? new Date().toISOString() : null,
        progress: mockUserProgress.get(201) ?? { current: 0, target: 1 }
      },
      {
        achievementId: 202,
        name: '명상 달인',
        description: '명상을 100회 완료하세요.',
        phrase: '명상의 달인이 되었어요!',
        grade: 'GOLD' as const,
        category: 'MEDITATION' as const,
        isAchieved: mockUserProgress.get(202)?.isAchieved ?? false,
        achievedAt: mockUserProgress.get(202)?.isAchieved ? new Date().toISOString() : null,
        progress: mockUserProgress.get(202) ?? { current: 0, target: 100 }
      },
      {
        achievementId: 301,
        name: '첫 호흡 운동',
        description: '호흡 운동을 처음으로 완료했어요.',
        phrase: '깊은 호흡으로 스트레스를 날려보세요!',
        grade: 'BRONZE' as const,
        category: 'BREATHING' as const,
        isAchieved: mockUserProgress.get(301)?.isAchieved ?? false,
        achievedAt: mockUserProgress.get(301)?.isAchieved ? new Date().toISOString() : null,
        progress: mockUserProgress.get(301) ?? { current: 0, target: 1 }
      },
      {
        achievementId: 401,
        name: '꾸준한 방문자',
        description: '앱을 10일 연속으로 방문했어요.',
        phrase: '꾸준함이 최고의 재능이에요!',
        grade: 'SPECIAL' as const,
        category: 'HIDDEN' as const,
        isAchieved: mockUserProgress.get(401)?.isAchieved ?? false,
        achievedAt: mockUserProgress.get(401)?.isAchieved ? new Date().toISOString() : null,
        progress: mockUserProgress.get(401) ?? { current: 0, target: 10 }
      }
    ],
    totalElements: 6,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false
  };
};

// 불필요한 Mock 함수들 제거됨 - 현재는 팝업 시스템만 사용
