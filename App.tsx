import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, AppState } from 'react-native';
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
import { SplashScreen, OnboardingScreen } from './components/onboarding';
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext';
import { useAuthStore } from './stores/authStore';
import { loadTokens, loadUser, validateToken, refreshAccessToken } from './services/authService';
import { apiClient } from './services/apiClient';
import { useAchievementStore } from './stores/achievementStore';
import AchievementUnlockedPopup from './components/common/achievement/AchievementUnlockedPopup';
import { useOwnedItems } from './hooks/useOwnedItems';
import { checkAppVersionOnStart } from './services/versionService';
import { MathMission, MultiStepMission, validateMathAnswer } from './utils/mathMissionGenerator';
import { useAlarmStore } from './stores/alarmStore';
import { setupMissionNotificationCategory } from './services/alarmNotificationService';
import { NavigationContainerRef } from '@react-navigation/native';

enableScreens(true);

// iOS/Android 공통 알림 표시 정책: 모듈 스코프에서 1회만 등록
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,   // 배너 표시
    shouldShowList: true,     // 알림 리스트 표시
    shouldPlaySound: true,    // 사운드
    shouldSetBadge: false,    // 배지 미사용
  }),
});

const AppContent = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authStatus, setAuthStatus] = useState<'checking' | 'logged_in' | 'logged_out' | 'auto_login_failed'>('checking');
  const { hasSeenOnboarding, setHasSeenOnboarding } = useOnboarding();
  const { setSession, isLoggedIn } = useAuthStore();
  const { initOnAppStart } = useAchievementStore();
  const { loadOwnedItems } = useOwnedItems();
  const { updateMissionProgress, dismissAlarm } = useAlarmStore();
  
  // Navigation ref for programmatic navigation
  const navigationRef = React.useRef<NavigationContainerRef<any>>(null);

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

  // 로그인 상태 변화 감지
  useEffect(() => {
    if (authStatus === 'checking') return; // 초기 로딩 중이면 무시
    
    if (!isLoggedIn && authStatus === 'logged_in') {
      console.log('🚪 로그아웃 감지, 로그인 화면으로 이동');
      setAuthStatus('logged_out');
    }
  }, [isLoggedIn, authStatus]);

  // 앱 포그라운드 복귀 시 소유 아이템 동기화
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && isLoggedIn) {
        console.log('📱 앱 포그라운드 복귀, 소유 아이템 동기화');
        loadOwnedItems();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isLoggedIn, loadOwnedItems]);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setHasSeenOnboarding(true);
      setAuthStatus('logged_in'); // 온보딩 완료 시 로그인 상태로 설정
    } catch (error) {
      console.error('온보딩 완료 상태 저장 실패:', error);
      setHasSeenOnboarding(true);
      setAuthStatus('logged_in');
    }
  };

  // 알림 응답 리스너 등록 (구독 반환)
  const setupNotificationResponseListener = () => {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const { actionIdentifier, notification } = response;
      const { alarmId, missionType, missionData, missionPack } = notification.request.content.data as { alarmId: string, missionType?: string, missionData?: MathMission, missionPack?: MultiStepMission };

      // 기본 탭 → 해제/미션 화면으로
      if (!actionIdentifier || actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        navigationRef.current?.navigate('alarm', {
          screen: 'AlarmDismissScreen',
          params: { alarmId, missionType, missionData, missionPack },
        });
        return;
      }

      // 미션 응답 처리
      if (missionType === 'math' && missionData) {
        handleMathMissionResponse(actionIdentifier, missionData, alarmId);
      }
    });
    return sub;
  };
  
  // 수학 미션 응답 처리
  const handleMathMissionResponse = (actionIdentifier: string, missionData: MathMission, alarmId: string) => {
    if (actionIdentifier.startsWith('answer_')) {
      // 숫자 버튼 클릭 시
      const answer = actionIdentifier.split('_')[1];
      console.log(`사용자 답변: ${answer}`);
      
      // 정답 검증
      const { isCorrect, shouldDismiss } = validateMathAnswer(missionData, answer);
      
      if (isCorrect) {
        console.log('정답! 알람 해제');
        // 미션 완료로 알람 해제
        dismissAlarm(alarmId);
      } else if (shouldDismiss) {
        console.log('최대 시도 횟수 도달, 알람 해제');
        // 최대 시도 횟수 도달로 알람 해제
        dismissAlarm(alarmId);
      } else {
        console.log('틀렸습니다. 다시 시도하세요.');
        // 미션 진행 상태 업데이트 (시도 횟수 증가)
        updateMissionProgress(alarmId, missionData);
      }
    } else if (actionIdentifier === 'submit') {
      console.log('제출 버튼 클릭');
      // 제출 버튼은 현재 구현하지 않음 (숫자 버튼으로만 답변)
    }
  };

  // 자동 로그인 체크 함수
  const checkAutoLogin = async () => {
    try {
      console.log('🔍 자동 로그인 체크 시작...');
      const tokens = await loadTokens();
      const user = await loadUser();
      
      if (tokens && tokens.accessToken && user) {
        console.log('✅ 저장된 토큰과 사용자 정보 발견, 토큰 유효성 검증 중...');
        
        try {
          // 1단계: 토큰 유효성 검증
          const isValidToken = await validateToken(tokens.accessToken);
          
          if (isValidToken) {
            // 토큰이 유효하면 로그인 성공
            await setSession({
              user: user,
              tokens: tokens,
            });
            
            // ApiClient에 토큰 설정 (setSession에서 이미 설정되지만 확실히 하기 위해)
            apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
            
            console.log('✅ 자동 로그인 완료!');
            setAuthStatus('logged_in');
            
            // 로그인 성공 후 소유 아이템 로드
            loadOwnedItems();
          } else {
            // 토큰이 만료되었으면 갱신 시도
            console.log('🔄 토큰 만료, 갱신 시도...');
            
            if (tokens.refreshToken) {
              const newTokens = await refreshAccessToken(tokens.refreshToken);
              
              if (newTokens) {
                // 토큰 갱신 성공
                await setSession({
                  user: user,
                  tokens: newTokens,
                });
                
                // ApiClient에 새로운 토큰 설정
                apiClient.setTokens(newTokens.accessToken, newTokens.refreshToken);
                
                console.log('✅ 토큰 갱신 후 자동 로그인 완료!');
                setAuthStatus('logged_in');
                
                // 토큰 갱신 후 소유 아이템 로드
                loadOwnedItems();
              } else {
                // 토큰 갱신 실패
                console.log('❌ 토큰 갱신 실패, 로그아웃 처리');
                setAuthStatus('auto_login_failed');
              }
            } else {
              // 리프레시 토큰이 없으면 로그아웃
              console.log('❌ 리프레시 토큰 없음, 로그아웃 처리');
              setAuthStatus('auto_login_failed');
            }
          }
        } catch (sessionError) {
          console.error('❌ 세션 설정 실패:', sessionError);
          setAuthStatus('auto_login_failed');
        }
      } else {
        console.log('❌ 저장된 토큰 또는 사용자 정보 없음, 로그아웃 상태 유지');
        setAuthStatus('logged_out');
      }
    } catch (error) {
      console.error('❌ 자동 로그인 체크 실패:', error);
      setAuthStatus('auto_login_failed');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // 앱 시작 시 알림 설정 초기화 & 리스너
  useEffect(() => {
    (async () => {
      initializeNotificationSettings(); // TODO: 필요 시 호출 빈도 조정
      // 미션 알림 카테고리 등록 (한 번만)
      //await setupMissionNotificationCategory(); // 미션 알림 카테고리 설정 주석 처리

      // 콜드 스타트로 알림에서 진입한 경우 처리
      const last = await Notifications.getLastNotificationResponseAsync();
      if (last) {
        const { actionIdentifier, notification } = last;
        const { alarmId, missionType, missionData, missionPack } = notification.request.content.data as { alarmId: string, missionType?: string, missionData?: MathMission, missionPack?: MultiStepMission };

        if (!actionIdentifier || actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
          navigationRef.current?.navigate('alarm', {
            screen: 'AlarmDismissScreen',
            params: { alarmId, missionType, missionData, missionPack },
          });
        }
      }
    })();

    const sub = setupNotificationResponseListener();
    return () => {
      sub?.remove();
    };
  }, []);


  // 앱 시작 시 자동 로그인 체크 및 업적 시스템 초기화
  useEffect(() => {
    const initializeApp = async () => {
      // 1. 앱 버전 체크 (가장 먼저 실행)
      await checkAppVersionOnStart();
      
      // 2. 자동 로그인 체크
      await checkAutoLogin();
      
      // 3. 업적 시스템 초기화 (Mock 데이터 초기화 포함)
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
            // 앱 설치 후 첫 실행(온보딩을 한 번도 안 본 사람) → 온보딩 첫 스텝부터
            <OnboardingScreen
              onComplete={completeOnboarding}
            />
          ) : authStatus === 'logged_out' || authStatus === 'auto_login_failed' ? (
            // 온보딩을 본 적 있지만 로그아웃된 사람 → 로그인 스텝(15)
            <OnboardingScreen
              onComplete={completeOnboarding}
              initialStep={15}
            />
          ) : fontsLoaded ? (
            <>
              <AppNavigator ref={navigationRef} />
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