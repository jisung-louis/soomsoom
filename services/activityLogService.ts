import { apiClient } from './apiClient';
import { createNetworkError } from '../utils/errorHandler';
import { useActivityHistoryStore } from '../stores/activityHistoryStore';
import { useTodayMissionStore } from '../stores/todayMissionStore';

/**
 * 액티비티 로그 기록 관련 API 서비스
 * 사용자의 액티비티 완료, 진행 상황 기록, 이어듣기 등의 기능을 담당
 */

// Activity 진행 상황 기록 요청 타입
export interface UpdateActivityProgressParams {
  lastPlaybackPosition: number; // 이어듣기를 위한 마지막 재생 위치 (초)
  actualPlayTimeInSeconds: number; // 이번 세션에서 실제 재생한 시간 (초)
}

// 마지막 진행 상황 조회 응답 타입
export interface ActivityProgressResponse {
  activityId: number;
  progressSeconds: number; // 마지막 재생 위치 (초)
}

// 내 활동 요약 정보 조회 응답 타입
export interface UserActivitySummaryResponse {
  diaryCount: number; // 일기 작성 횟수
  activityCount: number; // 활동 완료 횟수
  totalActivitySeconds: number; // 총 활동 시간 (초)
}

// 내 활동 요약 정보 조회 요청 타입
export interface GetUserActivitySummaryParams {
  userId?: number; // (ADMIN용) 특정 사용자의 활동 요약 정보를 조회할 때 사용. 없으면 본인 기록 조회.
}

// 액티비티 완료 처리 응답 타입
export interface CompleteActivityResponse {
  activityId: number;
  completionEffectTexts: string[]; // 효과 3줄
  rewardable: boolean; // 하트 보상 가능 여부
}

/**
 * 액티비티 완료 처리 API
 * POST /activities/{activityId}/history/complete
 * 
 * @param activityId - 완료할 액티비티 ID
 * @returns Promise<CompleteActivityResponse> - 200 OK 응답
 */
export const completeActivity = async (activityId: number): Promise<CompleteActivityResponse> => {
  try {
    // 실제 API 호출 (모킹은 apiClient에서 처리)
    const response = await apiClient.post<CompleteActivityResponse>(`/activities/${activityId}/history/complete`);
    // 오늘 미션 상태 갱신 (NEED_ACTIVITY → ALL_DONE 등)
    try {
      await useTodayMissionStore.getState().refresh();
    } catch {}
    return response;
  } catch (error) {
    throw createNetworkError(
      '액티비티 완료 처리에 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};

/**
 * Activity 진행 상황 기록 API
 * PATCH /activities/{activityId}/history
 * 
 * @param activityId - 액티비티 ID
 * @param params - 진행 상황 기록 파라미터
 * @returns Promise<void> - 204 No Content 응답
 */
export const updateActivityProgress = async (
  activityId: number,
  params: UpdateActivityProgressParams
): Promise<void> => {
  try {
    // 실제 API 호출 (모킹은 apiClient에서 처리)
    console.log(`💾 진행상황 저장: ${params.lastPlaybackPosition}초, 재생시간: ${params.actualPlayTimeInSeconds}초`);
    await apiClient.patch<void>(`/activities/${activityId}/history`, params);
  } catch (error) {
    throw createNetworkError(
      '액티비티 진행 상황 기록에 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};

/**
 * 마지막 진행 상황 조회 (이어듣기) API
 * GET /activities/{activityId}/history
 * 
 * @param activityId - 액티비티 ID
 * @returns Promise<ActivityProgressResponse | null> - 진행 상황 정보 또는 null (기록이 없을 때)
 */
export const getActivityProgress = async (
  activityId: number
): Promise<ActivityProgressResponse | null> => {
  try {
    // 실제 API 호출 (모킹은 apiClient에서 처리)
    const response = await apiClient.get<ActivityProgressResponse | undefined>(`/activities/${activityId}/history`);
    return response ?? null;
  } catch (error) {
    throw createNetworkError(
      '액티비티 진행 상황 조회에 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};

/**
 * 내 활동 요약 정보 조회 API
 * GET /users/me/summary
 * 
 * @param params - 조회 파라미터 (선택사항)
 * @returns Promise<UserActivitySummaryResponse> - 사용자 활동 요약 정보
 */
export const getUserActivitySummary = async (
  params?: GetUserActivitySummaryParams
): Promise<UserActivitySummaryResponse> => {
  try {
    // 실제 API 호출 (모킹은 apiClient에서 처리)
    const queryParams = new URLSearchParams();
    if (params?.userId !== undefined) {
      queryParams.append('userId', String(params.userId));
    }

    const query = queryParams.toString();
    const url = query 
      ? `/users/me/summary?${query}` 
      : '/users/me/summary';

    const response = await apiClient.get<UserActivitySummaryResponse>(url);
    return response;
  } catch (error) {
    throw createNetworkError(
      '내 활동 요약 정보 조회에 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};
