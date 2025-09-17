import { apiClient } from './apiClient';

export interface HomeTimeLogRequest {
  durationInSeconds: number;
}

/**
 * 홈 화면 체류 시간 로그 서비스
 */
export const homeTimeLogService = {
  /**
   * 홈 화면 체류 시간을 서버에 저장
   */
  logHomeTime: async (request: HomeTimeLogRequest): Promise<void> => {
    try {
      await apiClient.post('/user-activities/screen-time', request);
    } catch (error) {
      console.error('홈 화면 체류 시간 로그 저장 실패:', error);
      throw error;
    }
  }
};