// ONLY FOR DEV

// 사용자의 액티비티 완료, 진행 상황 기록, 이어듣기 등의 기록을 담당

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 액티비티 진행 상황 타입
export interface ActivityProgress {
  activityId: number;
  lastPlaybackPosition: number; // 마지막 재생 위치 (초)
  actualPlayTimeInSeconds: number; // 실제 재생한 시간 (초)
  lastUpdatedAt: string; // 마지막 업데이트 시간 (ISO string)
}

// 액티비티 완료 기록 타입
export interface ActivityCompletion {
  activityId: number;
  completedAt: string; // 완료 시간 (ISO string)
}

// 사용자 활동 요약 정보 타입
export interface UserActivitySummary {
  diaryCount: number;
  activityCount: number;
  totalActivitySeconds: number;
}

interface ActivityHistoryState {
  // 액티비티 진행 상황 관리
  activityProgress: Record<number, ActivityProgress>; // activityId를 키로 하는 맵
  
  // 액티비티 완료 기록 관리
  completedActivities: ActivityCompletion[];
  
  // 사용자 활동 요약 정보
  userSummary: UserActivitySummary | null;
  
  // 진행 상황 업데이트 액션
  updateActivityProgress: (activityId: number, lastPlaybackPosition: number, actualPlayTimeInSeconds: number) => void;
  
  // 액티비티 완료 처리 액션
  completeActivity: (activityId: number) => void;
  
  // 진행 상황 조회 액션
  getActivityProgress: (activityId: number) => ActivityProgress | null;
  
  // 완료된 액티비티 확인 액션
  isActivityCompleted: (activityId: number) => boolean;
  
  // 사용자 요약 정보 업데이트 액션
  updateUserSummary: (summary: UserActivitySummary) => void;
  
  // 요약 정보 계산 액션 (로컬 데이터 기반)
  calculateUserSummary: () => UserActivitySummary;
  
  // 스토어 초기화 액션
  clearHistory: () => void;
}

export const useActivityHistoryStore = create<ActivityHistoryState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      activityProgress: {},
      completedActivities: [],
      userSummary: null,

      // 진행 상황 업데이트
      updateActivityProgress: (activityId: number, lastPlaybackPosition: number, actualPlayTimeInSeconds: number) => {
        set((state) => {
          const now = new Date().toISOString();
          const progress: ActivityProgress = {
            activityId,
            lastPlaybackPosition,
            actualPlayTimeInSeconds,
            lastUpdatedAt: now,
          };

          return {
            activityProgress: {
              ...state.activityProgress,
              [activityId]: progress,
            },
          };
        });
      },

      // 액티비티 완료 처리
      completeActivity: (activityId: number) => {
        set((state) => {
          const now = new Date().toISOString();
          const completion: ActivityCompletion = {
            activityId,
            completedAt: now,
          };

          // 이미 완료된 액티비티인지 확인
          const isAlreadyCompleted = state.completedActivities.some(
            completed => completed.activityId === activityId
          );

          if (isAlreadyCompleted) {
            return state; // 이미 완료된 경우 변경하지 않음
          }

          return {
            completedActivities: [...state.completedActivities, completion],
          };
        });
      },

      // 진행 상황 조회
      getActivityProgress: (activityId: number) => {
        const state = get();
        return state.activityProgress[activityId] || null;
      },

      // 완료된 액티비티 확인
      isActivityCompleted: (activityId: number) => {
        const state = get();
        return state.completedActivities.some(
          completed => completed.activityId === activityId
        );
      },

      // 사용자 요약 정보 업데이트
      updateUserSummary: (summary: UserActivitySummary) => {
        set({ userSummary: summary });
      },

      // 요약 정보 계산 (로컬 데이터 기반)
      calculateUserSummary: () => {
        const state = get();
        
        // 일기 작성 횟수는 별도 store에서 가져와야 함 (현재는 임시값)
        const diaryCount = 0; // TODO: 감정 기록 store에서 가져오기
        
        // 완료된 액티비티 수
        const activityCount = state.completedActivities.length;
        
        // 총 활동 시간 계산 (진행 상황에서 actualPlayTimeInSeconds 합계)
        const totalActivitySeconds = Object.values(state.activityProgress).reduce(
          (total, progress) => total + progress.actualPlayTimeInSeconds,
          0
        );

        return {
          diaryCount,
          activityCount,
          totalActivitySeconds,
        };
      },

      // 스토어 초기화
      clearHistory: () => {
        set({
          activityProgress: {},
          completedActivities: [],
          userSummary: null,
        });
      },
    }),
    {
      name: 'activity-history-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
