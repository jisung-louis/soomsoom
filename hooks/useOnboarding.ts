import { useState, useCallback } from 'react';
import { onboardingSteps, CheckboxOption } from '../data/onboardingData';

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
    
    // 유틸리티
    canProceedToNext,
    getCurrentStepData,
  };
}
