import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalProvider } from '@gorhom/portal';
import AppNavigator from '../navigations/AppNavigator';
import CustomToast from '../components/common/toast/CustomToast';
import AchievementUnlockedPopup from '../components/common/achievement/AchievementUnlockedPopup';
import * as Notifications from 'expo-notifications';
import { NavigationContainerRef } from '@react-navigation/native';
import AuthGate from '../components/auth/AuthGate';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useAppBootstrap } from '../hooks/useAppBootstrap';
import { enableScreens } from 'react-native-screens';
import { View, Text } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useOwnedItems } from '../hooks/useOwnedItems';
import { useNotificationSetup } from '../hooks/useNotificationSetup';
import { apiClient } from '../services/apiClient';
import { refreshTokens } from '../services/authService';
import { initInstallUuid } from '../utils/deviceId';
import { useAuth } from '../hooks/useAuth';

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
  const { setupResponseListener } = useNotificationSetup(navigationRef);
  const { phase } = useAuthStore();
  const { deviceLogin } = useAuth();

  useEffect(() => {
    (async () => {
      // 401 자동 리프레시 콜백 등록 (앱 시작 시 1회)
      apiClient.registerTokenRefresher(refreshTokens);

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
  }, []);


  useEffect(() => {
    (async () => {
      await run();
      // 알림 초기화/권한 요청은 온보딩 06단계에서 수행
      const sub = setupResponseListener();
      return () => sub?.remove();
    })();
  }, [run, setupResponseListener]);

  const completeOnboarding = async () => {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      // 게스트 경로: logged_out 상태에서 온보딩 완료를 누른 경우, 즉시 디바이스 로그인 수행
      if (phase === 'logged_out') {
        await deviceLogin();
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
          <AchievementUnlockedPopup />
        </AuthGate>
      </PortalProvider>
    </GestureHandlerRootView>
  );
};

export default AppContent;


