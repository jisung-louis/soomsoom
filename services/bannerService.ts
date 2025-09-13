import { apiClient } from './apiClient';
import { createNetworkError } from '../utils/errorHandler';
import { Banner, GetBannersResponse } from '../types';
import { bannerMockData } from '../data/bannerMockData';

/**
 * 활성 배너 목록 조회 API
 * GET /banners
 * 
 * @returns Promise<GetBannersResponse> - 활성 배너 목록
 */
export const getActiveBanners = async (): Promise<GetBannersResponse> => {
  try {
    if (__DEV__) {
      // 개발 환경: Mock 데이터 반환
      console.log('🎯 활성 배너 목록 조회 (개발 모드)');
      
      return bannerMockData;
    } else {
      // 프로덕션 환경: 실제 API 호출
      const response = await apiClient.get<GetBannersResponse>('/banners');
      return response;
    }
  } catch (error) {
    throw createNetworkError(
      '활성 배너 목록 조회에 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};
