import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { PortalProvider } from '@gorhom/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './navigations/AppNavigator';
import { ToastProvider } from './contexts/ToastContext';
import CustomToast from './components/common/toast/CustomToast';
import { NotificationBehavior } from 'expo-notifications';
import { enableScreens } from 'react-native-screens';
import { scheduleDiaryNotification } from './utils/notificationUtils';
import { loadFonts } from './utils/fontLoader';
import { View, Text } from 'react-native';
import { SplashScreen, OnboardingScreen } from './components/onboarding';
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext';
import { useAuthStore } from './stores/authStore';
import { loadTokens, loadUser } from './services/authService';
import { useAchievementStore } from './stores/achievementStore';
import AchievementUnlockedPopup from './components/common/achievement/AchievementUnlockedPopup';
// initializeMockUserProgress는 achievementStore에서 자동으로 호출됨

const AppContent = () => {
  enableScreens(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { hasSeenOnboarding, setHasSeenOnboarding } = useOnboarding();
  const { setSession } = useAuthStore();
  const { initOnAppStart } = useAchievementStore();
  
  // 폰트 로딩
  useEffect(() => {
    const loadAppFonts = async () => {
      try {
        await loadFonts();
        setFontsLoaded(true);
      } catch (error) {
        console.error('폰트 로딩 실패:', error);
        setFontsLoaded(true); // 폰트 로딩 실패해도 앱은 계속 실행
      }
    };
    
    loadAppFonts();
  }, []);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      console.error('온보딩 완료 상태 저장 실패:', error);
      setHasSeenOnboarding(true);
    }
  };

  // 자동 로그인 체크 함수
  const checkAutoLogin = async () => {
    try {
      console.log('🔍 자동 로그인 체크 시작...');
      const tokens = await loadTokens();
      const user = await loadUser();
      
      if (tokens && tokens.accessToken && user) {
        console.log('✅ 저장된 토큰과 사용자 정보 발견, 자동 로그인 시도...');
        
        // 실제로는 서버에 토큰 유효성을 확인해야 하지만, 
        // 개발 환경에서는 토큰이 있으면 로그인된 것으로 간주
        await setSession({
          user: user,
          tokens: tokens,
        });
        
        console.log('✅ 자동 로그인 완료!');
      } else {
        console.log('❌ 저장된 토큰 또는 사용자 정보 없음, 로그아웃 상태 유지');
      }
    } catch (error) {
      console.error('❌ 자동 로그인 체크 실패:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // 앱 시작 시 알림 설정 초기화
  useEffect(() => {
    initializeNotificationSettings();
  }, []);

  // 앱 시작 시 자동 로그인 체크 및 업적 시스템 초기화
  useEffect(() => {
    const initializeApp = async () => {
      await checkAutoLogin();
      // 업적 시스템 초기화 (Mock 데이터 초기화 포함)
      await initOnAppStart();
    };

    initializeApp();
  }, [initOnAppStart]);

  const initializeNotificationSettings = async () => {
    try {
      // 각 알림 설정이 없으면 기본값으로 초기화
      const diaryNotification = await AsyncStorage.getItem('diaryNotificationEnabled');
      const greetingNotification = await AsyncStorage.getItem('greetingNotificationEnabled');
      const newsNotification = await AsyncStorage.getItem('newsNotificationEnabled');
      let diaryNotificationTime = await AsyncStorage.getItem('diaryNotificationTime');

      if (diaryNotification === null) {
        await AsyncStorage.setItem('diaryNotificationEnabled', 'true');
        console.log('마음일기 알림 기본값 true로 설정 완료');
      }
      
      if (greetingNotification === null) {
        await AsyncStorage.setItem('greetingNotificationEnabled', 'true');
        console.log('숨숨 인사 알림 기본값 true로 설정 완료');
      }
      
      if (newsNotification === null) {
        await AsyncStorage.setItem('newsNotificationEnabled', 'true');
        console.log('숨숨 소식 알림 기본값 true로 설정 완료');
      }

      if (diaryNotificationTime === null) {
        await AsyncStorage.setItem('diaryNotificationTime', '오후 8:30');
        diaryNotificationTime = '오후 8:30'; // 메모리에 직접 설정
        console.log('마음일기 알림 시간 기본값 오후 8:30으로 설정 완료');
      }

      // 마음일기 알림이 활성화되어 있다면 실제로 스케줄링
      const isDiaryNotificationEnabled = diaryNotification === 'true' || diaryNotification === null;
      if (isDiaryNotificationEnabled) {
        console.log('diaryNotificationTime 값:', diaryNotificationTime);
        const timeString = diaryNotificationTime || '오후 8:30';
        console.log('마음일기 알림 스케줄링 시작:', timeString);
        
        const success = await scheduleDiaryNotification(timeString);
        
        if (success) {
          console.log('마음일기 알림 스케줄링 완료');
        } else {
          console.error('마음일기 알림 스케줄링 실패');
        }
      }
    } catch (error) {
      console.error('알림 설정 초기화 실패:', error);
    }
  };

  Notifications.setNotificationHandler({
    handleNotification: async () => {
      return {
        shouldShowBanner: true, // 알림 배너 표시
        shouldShowList: true, // 알림 리스트 표시
        shouldPlaySound: true, // 알림 사운드 재생
        shouldSetBadge: false, // 배지 설정 여부 (뱃지 : 앱 아이콘 옆에 숫자 표시 된 거)
      } as NotificationBehavior;
    },
  });
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PortalProvider>
        <ToastProvider>
          {showSplash ? (
            <SplashScreen onComplete={() => setShowSplash(false)} />
          ) : hasSeenOnboarding === null || isCheckingAuth ? (
            // 온보딩 상태 또는 인증 상태를 확인하는 중
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>로딩 중...</Text>
            </View>
          ) : !hasSeenOnboarding ? (
            <OnboardingScreen onComplete={completeOnboarding} />
          ) : fontsLoaded ? (
            <>
              <AppNavigator />
              <StatusBar style="auto" />
              <CustomToast />
              <AchievementUnlockedPopup />
            </>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>폰트 로딩 중...</Text>
            </View>
          )}
        </ToastProvider>
      </PortalProvider>
    </GestureHandlerRootView>
  );
};

export default function App() {
  return (
    <OnboardingProvider>
      <AppContent />
    </OnboardingProvider>
  );
}