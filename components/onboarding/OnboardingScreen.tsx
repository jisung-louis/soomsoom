import React from 'react';
import { Animated, Image } from 'react-native';
import { Asset } from 'expo-asset';
import { onboardingSteps } from '../../data/onboardingData';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toggleNotificationSetting, updateDiaryNotificationTime } from '../../services/notificationService';
import { registerDevice } from '../../services/notificationService';
import { getFcmTokenAsync } from '../../services/authService';
import { View, StyleSheet, ImageBackground, Platform } from 'react-native';
import { useOnboarding } from '../../hooks/useOnboarding';
import { OnboardingStep } from './OnboardingStep';
import { colors } from '../../constants/colors';
/**DEV ONLY*/
import { ButtonSmall } from '../common/buttons/ButtonSmall';
/**DEV ONLY*/

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
    submitOnboardingAnswers,
  } = useOnboarding();

  // initialStep이 제공되면 해당 스텝으로 이동
  React.useEffect(() => {
    if (initialStep !== undefined) {
      goToStep(initialStep);
    }
  }, [initialStep, goToStep]);

  const currentStepData = getCurrentStepData();

  // 배경 이미지 프리로딩 및 페이드 인 처리
  const [bgReady, setBgReady] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  // 스텝 0 -> 1 전환 시 배경 줌인(10%)
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const prevStepRef = React.useRef<number>(currentStep);
  const [zoomActive, setZoomActive] = React.useState(false);
  const [zoomMode, setZoomMode] = React.useState<'none' | 'first' | 'second'>('none');

  const preloadImage = React.useCallback(async (src: any) => {
    if (!src) return;
    try {
      if (typeof src === 'number') {
        // require(...) 자산
        await Asset.loadAsync(src);
      } else if (typeof src === 'object' && src.uri) {
        await Image.prefetch(src.uri);
      }
    } catch {}
  }, []);

  // 리렌더 최소화를 위한 메모 값들
  const bgSource = React.useMemo(() => {
    if (currentStep === 0 || currentStep === 1) {
      return require('../../assets/images/onboarding/bg_zoom1.png');
    }
    if (currentStep === 6 || currentStep === 7) {
      return require('../../assets/images/onboarding/bg_zoom4.png');
    }
    return currentStepData.backgroundImage;
  }, [currentStep, currentStepData.backgroundImage]);

  const backgroundStyle = React.useMemo(
    () => [styles.backgroundImage, { backgroundColor: currentStepData.backgroundColor ? currentStepData.backgroundColor : 'white' }],
    [currentStepData.backgroundColor]
  );

  const memoTitle = React.useMemo(() => currentStepData.title || [], [currentStepData.id]);

  // 현재 스텝 배경 준비되면 컨텐츠 페이드인, 동시에 다음 스텝 배경을 백그라운드 프리로드
  React.useEffect(() => {
    let mounted = true;
    setBgReady(false);
    fadeAnim.setValue(0);

    (async () => {
      await preloadImage(currentStepData.backgroundImage);
      if (!mounted) return;
      setBgReady(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: (currentStep === 8 || currentStep === 12) ? 800 : 400,
        useNativeDriver: true,
      }).start();
    })();

    // 다음 스텝도 미리 로드
    const nextIndex = currentStep + 1;
    const next = onboardingSteps[nextIndex];
    if (next?.backgroundImage) {
      preloadImage(next.backgroundImage);
    }

    // 0 -> 1로 넘어갈 때 배경 10% 줌인
    const prev = prevStepRef.current;
    const firstZoom = prev === 0 && currentStep === 1;
    const secondZoom = prev === 6 && currentStep === 7;
    if (firstZoom || secondZoom) {
      setZoomActive(true);
      setZoomMode(firstZoom ? 'first' : 'second');
      scaleAnim.setValue(1);
      Animated.timing(scaleAnim, {
        toValue: firstZoom ? 1.3 : 1.8,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else if ((currentStep !== 1 && zoomActive && zoomMode === 'first') || (currentStep !== 7 && zoomActive && zoomMode === 'second')) {
      // 1단계를 벗어나면 줌 상태 해제
      setZoomActive(false);
      setZoomMode('none');
      scaleAnim.setValue(1);
    }
    prevStepRef.current = currentStep;

    return () => {
      mounted = false;
    };
  }, [currentStepData.backgroundImage, currentStep, preloadImage, fadeAnim]);

  const handleNext = React.useCallback(async () => {
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
          // FCM 토큰 등록
          console.log('📱 온보딩 06단계 - FCM 토큰 등록 중...');
          try {
            const fcmToken = await getFcmTokenAsync();
            if (fcmToken) {
              const osType = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
              await registerDevice(fcmToken, osType);
              console.log('✅ FCM 토큰 등록 완료');
            }
          } catch (fcmError) {
            console.error('❌ FCM 토큰 등록 실패:', fcmError);
          }
          
          // 알림 권한 허용 시 모든 알림 설정을 true로 초기화
          const diaryNotification = await AsyncStorage.getItem('diaryNotificationEnabled');
          const greetingNotification = await AsyncStorage.getItem('greetingNotificationEnabled');
          const newsNotification = await AsyncStorage.getItem('newsNotificationEnabled');
          let diaryNotificationTime = await AsyncStorage.getItem('diaryNotificationTime');
          
          // 서버에 초기 토글 상태 반영 (기본 on 가정). 성공 응답 기준으로 저장
          try {
            const toggles = await Promise.all([
              toggleNotificationSetting('DIARY_REMINDER', true),
              toggleNotificationSetting('RE_ENGAGEMENT', true),
              toggleNotificationSetting('NEWS_UPDATE', true),
              // 참고: ACHIEVEMENT_UNLOCKED, REWARD_ACQUIRED는 온보딩에서 건드리지 않습니다.
            ]);
            await AsyncStorage.setItem('diaryNotificationEnabled', 'true');
            await AsyncStorage.setItem('greetingNotificationEnabled', 'true');
            await AsyncStorage.setItem('newsNotificationEnabled', 'true');
          } catch {}
          if (diaryNotificationTime === null) {
            await AsyncStorage.setItem('diaryNotificationTime', '오후 8:30');
            diaryNotificationTime = '오후 8:30';
            // 서버 시간도 기본값으로 설정 (20:30:00)
            try { await updateDiaryNotificationTime('20:30:00'); } catch {}
          }
          
          const isEnabled = true; // 서버 토글 기본 on으로 설정했으므로 true
          if (isEnabled) {
            const timeString = diaryNotificationTime || '오후 8:30';
            // 로컬 스케줄링 제거: 서버가 FCM 발송을 담당
          }
        } else {
          // 알림 권한 불허 시 모든 알림 설정을 false로 초기화
          console.log('📱 알림 권한 불허 - 모든 알림 설정을 false로 초기화');
          await AsyncStorage.setItem('diaryNotificationEnabled', 'false');
          await AsyncStorage.setItem('greetingNotificationEnabled', 'false');
          await AsyncStorage.setItem('newsNotificationEnabled', 'false');
        }
      } catch (e) {
        // 권한 요청/초기화 실패는 온보딩 진행을 막지 않음
      }
      // 다음 단계로 이동
      goToNextStep();
    } else {
      goToNextStep();
    }
  }, [
    isLastStep,
    onComplete,
    currentStepData.id,
    toggleNotificationSetting,
    updateDiaryNotificationTime,
    goToNextStep, // 최신 검증/상태를 반영하기 위해 반드시 포함
  ]);

  const handleCountdownComplete = React.useCallback(() => {
    goToNextStep();
  }, [goToNextStep]);

  // 특별한 단계들 (카운트다운, 결과 화면 등)
  if (currentStepData.id === 'countdown') {
    return (
      <>
      <Animated.View
        style={[
          { flex: 1 },
          zoomActive
            ? zoomMode === 'second'
              // 6->7: 중앙보다 100 아래를 화면 중앙처럼 보이게(아래로 기준 이동 후 확대 후 원위치)
              ? { transform: [{ translateY: 100 }, { scale: scaleAnim }, { translateY: -100 }] }
              // 0->1: 기본 중앙 확대
              : { transform: [{ scale: scaleAnim }] }
            : null,
            { opacity: fadeAnim }
        ]}
      >
        <ImageBackground
          source={currentStep <= 2 ? require('../../assets/images/onboarding/bg_zoom1.png') : currentStepData.backgroundImage}
          style={[
            styles.backgroundImage, 
            { backgroundColor: currentStepData.backgroundColor ? `colors.${currentStepData.backgroundColor}` : colors.white }
          ]}
          resizeMode="cover"
        >
        
        </ImageBackground>
      </Animated.View>
      {bgReady ? (
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flex: 1, opacity: fadeAnim }}>
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
            submitOnboardingAnswers={submitOnboardingAnswers}
          />
        </Animated.View>
      ) : null}
      </>
    );
  }

  // 일반적인 온보딩 단계
  return (
    <>
    <Animated.View
      style={[
        { flex: 1 },
        zoomActive
          ? zoomMode === 'second'
            ? { transform: [{ translateY: 200 }, { scale: scaleAnim }, { translateY: -200 }] }
            : { transform: [{ scale: scaleAnim }] }
          : null,
        { opacity: (currentStep === 8 || currentStep === 13) ? fadeAnim : 1 }
      ]}
    >
      <ImageBackground
        source={
          currentStep === 0 || currentStep === 1 ? require('../../assets/images/onboarding/bg_zoom1.png') : 
          currentStep === 6 || currentStep === 7 ? require('../../assets/images/onboarding/bg_zoom4.png') : 
          currentStepData.backgroundImage}
        style={[styles.backgroundImage, { backgroundColor: currentStepData.backgroundColor ? currentStepData.backgroundColor : 'white' }]}
        resizeMode="cover"
      >
      
      </ImageBackground>
    </Animated.View>
    {bgReady ? (
      <Animated.View style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flex: 1, 
        opacity: currentStep !== 14 ? fadeAnim : 1 
        }}>
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
          submitOnboardingAnswers={submitOnboardingAnswers}
        />
      </Animated.View>
      ) : null}

    {/*DEV ONLY*/}
    {currentStepData.id !== 'register' && (
    <View style={{position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'flex-end', padding: 10}}>
      <ButtonSmall variant="secondary" title="SKIP(DEV ONLY)" onPress={() => goToStep(15)} style={{width: '40%'}} />
    </View>
    )}
    {/*DEV ONLY*/}
    </>
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
