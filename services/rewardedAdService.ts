import { apiClient } from './apiClient';

export interface RewardedAd {
  id: number;
  title: string;
  adUnitId: string;
  rewardAmount: number;
  watchedToday: boolean;
}

/**
 * 보상형 광고 목록 조회
 * 사용자가 시청할 수 있는 활성화된 광고 목록과 오늘의 시청 완료 여부를 조회
 */
export const getRewardedAds = async (): Promise<RewardedAd[]> => {
  const response = await apiClient.get<RewardedAd[]>('/rewarded-ads/me');
  return response;
};

