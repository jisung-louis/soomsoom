import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { ToastProvider } from './contexts/ToastContext';
import { SocialLoginProvider } from './contexts/SocialLoginContext';
import AppContent from './app/AppContent';
import { useAppConfigStore } from './stores/appConfigStore';

import DeviceInfo from 'react-native-device-info';

// 포어그라운드 알림 핸들러 설정 (앱 시작 시 1회)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,   // 포어그라운드에서 알림 표시
    shouldPlaySound: true,   // 소리 재생
    shouldSetBadge: false,   // 배지 설정 안함
    shouldShowBanner: true,  // 배너 표시
    shouldShowList: true,    // 알림 목록에 표시
  }),
});



// // 개발용 임시 콘솔 필터: ERROR만 보이게
// if (__DEV__) {
//   // eslint-disable-next-line no-console
//   console.log = () => {};
//   // eslint-disable-next-line no-console
//   console.info = () => {};
//   // eslint-disable-next-line no-console
//   console.debug = () => {};
//   // eslint-disable-next-line no-console
//   console.warn = () => {};
// }

export default function App() {
  const { useMockApi } = useAppConfigStore();
  
  useEffect(() => {
    const getDeviceId = async () => {
      try {
        const deviceId = await DeviceInfo.getUniqueId();
        console.log('📱 기기 ID:', deviceId);
      } catch (error) {
        console.error('❌ 기기 ID 가져오기 실패:', error);
      }
    };
    
    getDeviceId();
  }, []);
  
  return (
    <OnboardingProvider>
      <ToastProvider>
        <SocialLoginProvider>
          <AppContent key={`app-${useMockApi ? 'mock' : 'live'}`} />
        </SocialLoginProvider>
      </ToastProvider>
    </OnboardingProvider>
  );
}