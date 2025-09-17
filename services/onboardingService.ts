import { apiClient } from './apiClient';

export interface OnboardingAnswerRequest {
  focusGoal: 'IMPROVE_SLEEP_QUALITY' | 'HAVE_A_CALM_MIND' | 'MANAGE_ANXIETY' | 'MANAGE_STRESS' | 'BE_PRESENT' | 'OTHER';
  dailyDuration: 'THREE_MINUTES' | 'TEN_MINUTES' | 'TWENTY_MINUTES' | 'THIRTY_MINUTES';
}

/**
 * 온보딩 답변 서비스
 */
export const onboardingService = {
  /**
   * 온보딩 답변을 서버에 저장
   */
  submitOnboardingAnswers: async (request: OnboardingAnswerRequest): Promise<void> => {
    try {
      await apiClient.post('/users/me/onboarding-answers', request);
    } catch (error) {
      console.error('온보딩 답변 저장 실패:', error);
      throw error;
    }
  }
};
