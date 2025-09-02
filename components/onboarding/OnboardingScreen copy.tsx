import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { useOnboarding } from '../../hooks/useOnboarding';
import { OnboardingStep } from './OnboardingStep';
import PlayResult from './PlayResult';

interface OnboardingScreenProps {
  onComplete: () => void;
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
const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const {
    currentStep,
    onboardingData,
    isLastStep,
    goToNextStep,
    updateFocusSelection,
    updateTimeSelection,
    canProceedToNext,
    getCurrentStepData,
  } = useOnboarding();

  const currentStepData = getCurrentStepData();

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      goToNextStep();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleCountdownComplete = () => {
    goToNextStep();
  };

  // 특별한 단계들 (카운트다운, 결과 화면 등)
  if (currentStepData.id === 'countdown') {
    return (
      <ImageBackground
        source={require('../../assets/images/onboarding/bg3.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <OnboardingStep
          stepId={currentStepData.id}
          title={currentStepData.title}
          selectedFocusIds={onboardingData.selectedFocusIds}
          selectedTimeIds={onboardingData.selectedTimeIds}
          onFocusSelectionChange={updateFocusSelection}
          onTimeSelectionChange={updateTimeSelection}
          onCountdownComplete={handleCountdownComplete}
          onNext={handleNext}
          onSkip={handleSkip}
          showSkip={currentStepData.showSkip}
          showNext={currentStepData.showNext}
          canProceed={canProceedToNext()}
        />
      </ImageBackground>
    );
  }

  // 일반적인 온보딩 단계
  return (
    <ImageBackground
      source={require('../../assets/images/onboarding/bg1.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <OnboardingStep
        stepId={currentStepData.id}
        title={currentStepData.title}
        selectedFocusIds={onboardingData.selectedFocusIds}
        selectedTimeIds={onboardingData.selectedTimeIds}
        onFocusSelectionChange={updateFocusSelection}
        onTimeSelectionChange={updateTimeSelection}
        onCountdownComplete={handleCountdownComplete}
        onNext={handleNext}
        onSkip={handleSkip}
        showSkip={currentStepData.showSkip}
        showNext={currentStepData.showNext}
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
