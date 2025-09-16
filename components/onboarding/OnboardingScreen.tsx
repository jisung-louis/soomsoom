import React from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleDiaryNotification } from '../../utils/notificationUtils';
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

  const handleNext = async () => {
    if (isLastStep) {
      onComplete();
    } else if (currentStepData.id === 'onboarding06') {
      // 알림 권한 요청 후 허용 시 즉시 초기 스케줄링 수행
      try {
        const { status } = await Notifications.getPermissionsAsync();
        let final = status;
        if (status !== 'granted') {
          const req = await Notifications.requestPermissionsAsync();
          final = req.status;
        }
        if (final === 'granted') {
          const diaryNotification = await AsyncStorage.getItem('diaryNotificationEnabled');
          let diaryNotificationTime = await AsyncStorage.getItem('diaryNotificationTime');
          if (diaryNotification === null) await AsyncStorage.setItem('diaryNotificationEnabled', 'true');
          if (diaryNotificationTime === null) {
            await AsyncStorage.setItem('diaryNotificationTime', '오후 8:30');
            diaryNotificationTime = '오후 8:30';
          }
          const isEnabled = diaryNotification === 'true' || diaryNotification === null;
          if (isEnabled) {
            const timeString = diaryNotificationTime || '오후 8:30';
            await scheduleDiaryNotification(timeString);
          }
        }
      } catch (e) {
        // 권한 요청/초기화 실패는 온보딩 진행을 막지 않음
      }
      // 선택 후(허용/거부 관계없이) 다음 단계로 이동
      goToNextStep();
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
