import { apiClient } from './apiClient';
import { createNetworkError } from '../utils/errorHandler';

export type TodayMissionStatus = 'NEED_DIARY' | 'NEED_ACTIVITY' | 'ALL_DONE';

export interface TodayMissionResponse {
  status: TodayMissionStatus;
}

/**
 * 오늘 미션 상태 조회
 * GET /users/me/today-missions
 * 권한: USER, ADMIN
 */
export const getTodayMissions = async (): Promise<TodayMissionResponse> => {
  try {
    const res = await apiClient.get<TodayMissionResponse>('/users/me/today-missions');
    return res;
  } catch (error) {
    throw createNetworkError(
      '오늘의 미션 상태를 불러오지 못했어요.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};


