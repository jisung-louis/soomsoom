import { useState, useCallback } from 'react';
import { onboardingSteps, CheckboxOption, focusOptions, timeOptions } from '../data/onboardingData';
import { onboardingService, OnboardingAnswerRequest } from '../services/onboardingService';

/**
 * 온보딩 상태 관리 커스텀 훅
 * 
 * 🎯 왜 이렇게 하나요?
 * - 온보딩 관련 상태와 로직을 한 곳에서 관리
 * - 컴포넌트에서 비즈니스 로직 분리
 * - 재사용 가능한 온보딩 로직
 */

export interface OnboardingData {
  selectedFocusIds: string[];
  selectedTimeIds: string[];
}

export interface UseOnboardingReturn {
  // 상태
  currentStep: number;
  onboardingData: OnboardingData;
  isLastStep: boolean;
  
  // 액션
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  updateFocusSelection: (ids: string[]) => void;
  updateTimeSelection: (ids: string[]) => void;
  resetOnboarding: () => void;
  submitOnboardingAnswers: () => Promise<boolean>;
  
  // 유틸리티
  canProceedToNext: () => boolean;
  getCurrentStepData: () => typeof onboardingSteps[0];
}

export function useOnboarding(): UseOnboardingReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    selectedFocusIds: [],
    selectedTimeIds: [],
  });

  // 다음 단계로 이동
  const goToNextStep = useCallback(() => {
    const currentStepData = onboardingSteps[currentStep];
    
    // 유효성 검사
    if (currentStepData.validation && !currentStepData.validation(onboardingData)) {
      console.log('유효성 검사 실패');
      return;
    }

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, onboardingData]);

  // 이전 단계로 이동
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // 특정 단계로 이동
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < onboardingSteps.length) {
      setCurrentStep(step);
    }
  }, []);

  // 집중 목표 선택 업데이트
  const updateFocusSelection = useCallback((ids: string[]) => {
    setOnboardingData(prev => ({
      ...prev,
      selectedFocusIds: ids,
    }));
  }, []);

  // 시간 선택 업데이트
  const updateTimeSelection = useCallback((ids: string[]) => {
    setOnboardingData(prev => ({
      ...prev,
      selectedTimeIds: ids,
    }));
  }, []);

  // 온보딩 초기화
  const resetOnboarding = useCallback(() => {
    setCurrentStep(0);
    setOnboardingData({
      selectedFocusIds: [],
      selectedTimeIds: [],
    });
  }, []);

  // 다음 단계로 진행 가능한지 확인
  const canProceedToNext = useCallback(() => {
    const currentStepData = onboardingSteps[currentStep];
    return !currentStepData.validation || currentStepData.validation(onboardingData);
  }, [currentStep, onboardingData]);

  // 현재 단계 데이터 가져오기
  const getCurrentStepData = useCallback(() => {
    return onboardingSteps[currentStep];
  }, [currentStep]);

  // 온보딩 답변을 서버에 전송
  const submitOnboardingAnswers = useCallback(async (): Promise<boolean> => {
    try {
      // 온보딩 답변이 있는지 확인
      if (!onboardingData.selectedFocusIds.length || !onboardingData.selectedTimeIds.length) {
        console.log('⚠️ 온보딩 답변이 없어서 전송하지 않습니다 (재로그인 또는 답변 미완료)');
        return true; // 답변이 없어도 성공으로 처리 (에러가 아님)
      }

      // 선택된 집중 목표를 API 형식으로 변환
      const focusGoal = onboardingData.selectedFocusIds[0]; // 첫 번째 선택된 목표
      const focusGoalMapping: Record<string, OnboardingAnswerRequest['focusGoal']> = {
        'sleep': 'IMPROVE_SLEEP_QUALITY',
        'peace': 'HAVE_A_CALM_MIND',
        'anxiety': 'MANAGE_ANXIETY',
        'stress': 'MANAGE_STRESS',
        'focus': 'BE_PRESENT',
        'other': 'OTHER',
      };

      // 선택된 시간을 API 형식으로 변환
      const dailyDuration = onboardingData.selectedTimeIds[0]; // 첫 번째 선택된 시간
      const dailyDurationMapping: Record<string, OnboardingAnswerRequest['dailyDuration']> = {
        '3': 'THREE_MINUTES',
        '10': 'TEN_MINUTES',
        '20': 'TWENTY_MINUTES',
        '30': 'THIRTY_MINUTES',
      };

      const request: OnboardingAnswerRequest = {
        focusGoal: focusGoalMapping[focusGoal] || 'OTHER',
        dailyDuration: dailyDurationMapping[dailyDuration] || 'THREE_MINUTES',
      };

      console.log('📤 온보딩 답변 전송:', request);
      await onboardingService.submitOnboardingAnswers(request);
      console.log('✅ 온보딩 답변 전송 완료');
      
      return true;
    } catch (error) {
      console.error('❌ 온보딩 답변 전송 실패:', error);
      return false;
    }
  }, [onboardingData]);

  return {
    // 상태
    currentStep,
    onboardingData,
    isLastStep: currentStep === onboardingSteps.length - 1,
    
    // 액션
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateFocusSelection,
    updateTimeSelection,
    resetOnboarding,
    submitOnboardingAnswers,
    
    // 유틸리티
    canProceedToNext,
    getCurrentStepData,
  };
}
