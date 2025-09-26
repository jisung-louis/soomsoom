import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalProvider } from '@gorhom/portal';
import AppNavigator from '../navigations/AppNavigator';
import CustomToast from '../components/common/toast/CustomToast';
import UniversalPopup from '../components/common/popup/UniversalPopup';
import { NavigationContainerRef } from '@react-navigation/native';
import AuthGate from '../components/auth/AuthGate';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useAppBootstrap } from '../hooks/useAppBootstrap';
import { enableScreens } from 'react-native-screens';
import { useAuthStore } from '../stores/authStore';
import { useNotificationSetup } from '../hooks/useNotificationSetup';
import { apiClient } from '../services/apiClient';
import { refreshTokens } from '../services/authService';
import { initInstallUuid } from '../utils/deviceId';
import { useAuth } from '../hooks/useAuth';
import { useAppConfigStore } from '../stores/appConfigStore';
import ServerClosedScreen from '../screens/ServerClosedScreen';
import { usePushNotification } from '../hooks/usePushNotification';
import { registerDevice } from '../services/notificationService';
import { getFcmTokenAsync } from '../services/authService';
import { Platform } from 'react-native';

enableScreens(true);

/**
 * 앱의 실제 컨텐츠를 렌더링하는 컴포넌트
 * - 부트스트랩 훅들을 호출하고, AuthGate로 화면을 스위칭합니다.
 */
const AppContent = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { hasSeenOnboarding, setHasSeenOnboarding } = useOnboarding();
  const navigationRef = React.useRef<NavigationContainerRef<any>>(null);

  const { isBootstrapping, run } = useAppBootstrap();
  const { serverClosed } = useAppConfigStore();
  const { setupResponseListener } = useNotificationSetup(navigationRef);
  const { phase } = useAuthStore();
  const { deviceLogin } = useAuth();
  
  // 푸시 알림 리스너 설정
  usePushNotification();

  useEffect(() => {
    // 401 자동 리프레시 콜백 등록 (앱 시작 시 1회)
    apiClient.registerTokenRefresher(refreshTokens);
    // 토큰 갱신 시 스토어에도 반영 (client→store)
    apiClient.registerOnTokensUpdated(async (t) => {
      await useAuthStore.getState().setSession({
        accessToken: t.accessToken,
        refreshToken: t.refreshToken ?? null,
      } as any);
    });

    // 토큰 동기화 로직 제거 - apiClient가 authStore를 직접 참조하므로 불필요

    (async () => {
      // 폰트 로딩 유틸은 기존 파일에 있으므로 그대로 사용
      try {
        // 1) 앱 시작 시 디바이스 ID 초기화 (최초 1회 생성/캐시)
        await initInstallUuid();
        const { loadFonts } = await import('../utils/fontLoader');
        await loadFonts();
        setFontsLoaded(true);
      } catch {
        setFontsLoaded(true);
      }
    })();

    // unsub 제거 - 동기화 로직이 없으므로 불필요
  }, []);


  useEffect(() => {
    let mounted = true;
    (async () => {
      await run();
      if (!mounted) return;
    })();
    const cleanup = setupResponseListener();
    return () => {
      mounted = false;
      cleanup?.();
    };
  }, [run, setupResponseListener]);

  const completeOnboarding = async () => {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      // 게스트 경로: logged_out 상태에서 온보딩 완료를 누른 경우, 즉시 디바이스 로그인 수행
      if (phase === 'logged_out') {
        await deviceLogin();
      }
      
      // 온보딩 완료 후 FCM 토큰 등록 (재로그인 시에만 실행됨)
      console.log('📱 온보딩 완료 - FCM 토큰 등록 중...');
      try {
        const fcmToken = await getFcmTokenAsync();
        if (fcmToken) {
          const osType = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
          await registerDevice(fcmToken, osType);
          console.log('✅ FCM 토큰 등록 완료');
        }
      } catch (error) {
        console.error('❌ FCM 토큰 등록 실패:', error);
        // FCM 등록 실패해도 온보딩은 계속 진행
      }
      
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setHasSeenOnboarding(true);
    } catch {
      setHasSeenOnboarding(true);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PortalProvider>
        {serverClosed ? (
          <ServerClosedScreen />
        ) : (
        <AuthGate
          showSplash={showSplash}
          onCompleteSplash={() => setShowSplash(false)}
          isBootstrapping={isBootstrapping}
          hasSeenOnboarding={hasSeenOnboarding}
          onCompleteOnboarding={completeOnboarding}
          fontsLoaded={fontsLoaded}
        >
          <AppNavigator ref={navigationRef} />
          <StatusBar style="auto" />
          <CustomToast />
          <UniversalPopup />
        </AuthGate>
        )}
      </PortalProvider>
    </GestureHandlerRootView>
  );
};

export default AppContent;


