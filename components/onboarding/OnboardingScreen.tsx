import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { useOnboarding } from '../../hooks/useOnboarding';
import { OnboardingStep } from './OnboardingStep';
import { colors } from '../../constants/colors';

interface OnboardingScreenProps {
  onComplete: () => void;
  initialStep?: number; // 특정 스텝으로 바로 이동 (예: 자동로그인 실패 시 register 스텝)
}

/**
 * 온보딩 메인 화면 컴포넌트 (리팩토링 버전)
 * 
 * 🎯 리팩토링 결과:
 * - 341줄 → 약 80줄로 대폭 단축
 * - 비즈니스 로직을 커스텀 훅으로 분리
 * - 각 단계별 컴포넌트로 분리
 * - 데이터를 별도 파일로 분리
 */
const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, initialStep }) => {
  const {
    currentStep,
    onboardingData,
    isLastStep,
    goToNextStep,
    updateFocusSelection,
    updateTimeSelection,
    canProceedToNext,
    getCurrentStepData,
    goToStep,
  } = useOnboarding();

  // initialStep이 제공되면 해당 스텝으로 이동
  React.useEffect(() => {
    if (initialStep !== undefined) {
      goToStep(initialStep);
    }
  }, [initialStep, goToStep]);

  const currentStepData = getCurrentStepData();

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      goToNextStep();
    }
  };

  const handleCountdownComplete = () => {
    goToNextStep();
  };

  // 특별한 단계들 (카운트다운, 결과 화면 등)
  if (currentStepData.id === 'countdown') {
    return (
      <ImageBackground
        source={currentStepData.backgroundImage}
        style={[
          styles.backgroundImage, 
          { backgroundColor: currentStepData.backgroundColor ? `colors.${currentStepData.backgroundColor}` : colors.white }
        ]}
        resizeMode="cover"
      >
        <OnboardingStep
          stepId={currentStepData.id}
          title={currentStepData.title || []}
          selectedFocusIds={onboardingData.selectedFocusIds}
          selectedTimeIds={onboardingData.selectedTimeIds}
          onFocusSelectionChange={updateFocusSelection}
          onTimeSelectionChange={updateTimeSelection}
          onCountdownComplete={handleCountdownComplete}
          onNext={handleNext}
          showNext={currentStepData.showNext}
          specialButtonText={currentStepData.specialButtonText}
          canProceed={canProceedToNext()}
        />
      </ImageBackground>
    );
  }

  // 일반적인 온보딩 단계
  return (
    <ImageBackground
      source={currentStepData.backgroundImage}
      style={[styles.backgroundImage, { backgroundColor: currentStepData.backgroundColor ? currentStepData.backgroundColor : 'white' }]}
      resizeMode="cover"
    >
      <OnboardingStep
        stepId={currentStepData.id}
        title={currentStepData.title || []}
        selectedFocusIds={onboardingData.selectedFocusIds}
        selectedTimeIds={onboardingData.selectedTimeIds}
        onFocusSelectionChange={updateFocusSelection}
        onTimeSelectionChange={updateTimeSelection}
        onCountdownComplete={handleCountdownComplete}
        onNext={handleNext}
        showNext={currentStepData.showNext}
        specialButtonText={currentStepData.specialButtonText}
        canProceed={canProceedToNext()}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default OnboardingScreen;
