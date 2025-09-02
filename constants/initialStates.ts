/**
 * 앱 전체의 초기 상태 상수 정의 (프리셋)
 * 
 * 🎯 왜 이렇게 하나요?
 * - 하드코딩된 초기값들을 한 곳에서 관리
 * - 개발/프로덕션 환경별로 다른 초기값 설정 가능
 * - 스토어 간 일관성 있는 초기 상태 관리
 * 
 * ⚠️ 주의: 이 값들은 앱 첫 구동 시에만 사용되는 프리셋입니다.
 * 실제 사용자 데이터는 서버와 동기화되며, 서버 데이터가 우선순위를 가집니다.
 */

import { initialStates } from '../configs/environment';

// 화폐 관련 초기 상태 (환경별 설정 사용)
export const INITIAL_CURRENCY_STATE = {
  heartPoints: initialStates.currency.heartPoints, // 개발: 1000, 프로덕션: 100
} as const;

// 방 아이템 관련 초기 상태 (환경별 설정 사용)
export const INITIAL_ROOM_STATE = {
  ownedItems: initialStates.room.ownedItems, // 개발: 더 많은 아이템, 프로덕션: 기본 아이템
  placedItems: initialStates.room.placedItems,
  selectedItems: initialStates.room.selectedItems,
};

// 알람 관련 초기 상태 (환경별 설정 사용)
export const INITIAL_ALARM_STATE = {
  alarmList: initialStates.alarm.alarmList, // 빈 배열로 시작
};

// 플레이 관련 초기 상태 (환경별 설정 사용)
export const INITIAL_PLAY_STATE = {
  favoriteContents: initialStates.play.favoriteContents,
  followedTeacherIds: initialStates.play.followedTeacherIds,
};

// 온보딩 관련 초기 상태
export const INITIAL_ONBOARDING_STATE = {
  hasSeenOnboarding: null, // null: 로딩 중, true: 완료, false: 필요
} as const;

// 환경별 초기 상태는 이제 configs/environment.ts에서 관리됩니다.
// 각 스토어는 위의 INITIAL_*_STATE 상수들을 사용하여
// 자동으로 환경에 맞는 초기값을 가져옵니다.
