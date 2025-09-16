import { apiClient } from './apiClient';
import { createNetworkError } from '../utils/errorHandler';

/**
 * 사용자 포인트 조회 API
 * GET /users/me/points
 * 
 * @param userId - 관리자용. userId 입력 시 해당 유저의 포인트 조회 가능. 없으면 본인
 * @returns Promise<UserPointsResponse> - 사용자 포인트 정보
 */
export interface UserPointsResponse {
  points: number;
}

export interface GetUserPointsParams {
  userId?: number;
}

export const getUserPoints = async (
  params?: GetUserPointsParams
): Promise<UserPointsResponse> => {
  try {
    // 실제 API 호출 (모킹은 apiClient에서 처리)
    const queryParams = new URLSearchParams();
    if (params?.userId !== undefined) {
      queryParams.append('userId', String(params.userId));
    }

    const query = queryParams.toString();
    const url = query 
      ? `/users/me/points?${query}` 
      : '/users/me/points';

    const response = await apiClient.get<UserPointsResponse>(url);
    return response;
  } catch (error) {
    throw createNetworkError(
      '사용자 포인트 조회에 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};
