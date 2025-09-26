import { apiClient } from './apiClient';
import { createNetworkError } from '../utils/errorHandler';

export interface ClaimedReward {
  claimedReward: {
    points: number;
    itemId: number;
  }
}

export const claimMission = async (missionId: number): Promise<ClaimedReward> => {
  try {
    const res = await apiClient.post<ClaimedReward>(`/missions/${missionId}/claim`);
    return res;
  } catch (error) {
    throw createNetworkError('미션을 불러오지 못했어요.', error instanceof Error ? error : new Error(String(error)));
  }
};