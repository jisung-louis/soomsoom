import { apiClient } from './apiClient';
import { createNetworkError } from '../utils/errorHandler';
import { Banner, GetBannersResponse } from '../types';

/**
 * 활성 배너 목록 조회 API
 * GET /banners
 * 
 * @returns Promise<GetBannersResponse> - 활성 배너 목록
 */
export const getActiveBanners = async (): Promise<GetBannersResponse> => {
  try {
    // 분기 제거: 항상 apiClient를 통해 호출
    // useMockApi=true면 apiClient가 mockRoutes로 응답을 반환합니다.
    const response = await apiClient.get<GetBannersResponse>('/banners');
    return response;
  } catch (error) {
    throw createNetworkError(
      '활성 배너 목록 조회에 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};
