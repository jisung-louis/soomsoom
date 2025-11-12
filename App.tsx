import React from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import mobileAds, { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';
import analytics from '@react-native-firebase/analytics';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { ToastProvider } from './contexts/ToastContext';
import { SocialLoginProvider } from './contexts/SocialLoginContext';
import AppContent from './app/AppContent';
import { useAppConfigStore } from './stores/appConfigStore';
import { setupTrackPlayer } from './services/trackPlayerService';
import { setupAlarmNotificationChannel } from './services/alarmNotificationService';

// 포어그라운드/백그라운드 알림 핸들러 설정 (앱 시작 시 1회)
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('📱 알림 핸들러 호출:', notification);
    
    // 백그라운드에서도 알림이 표시되도록 설정
    return {
      shouldShowAlert: true,   // 포어그라운드/백그라운드에서 알림 표시
      shouldPlaySound: true,   // 소리 재생
      shouldSetBadge: true,    // 배지 설정 (백그라운드에서 중요)
      shouldShowBanner: true,  // 배너 표시
      shouldShowList: true,    // 알림 목록에 표시
    };
  },
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
  
  // 앱 시작 시 ATT/UMP 동의 팝업 처리 및 Analytics 초기화
  React.useEffect(() => {
    const handlePermissions = async () => {
      try {
        // 0) Track Player 초기화
        await setupTrackPlayer();
        
        // 0.3) Android: 알람 알림 채널 생성 (앱 시작 시 한 번만)
        if (Platform.OS === 'android') {
          await setupAlarmNotificationChannel();
        }
        
        // 0.5) Analytics 초기화 및 앱 열림 이벤트 로깅
        try {
          // 개발 모드에서 DebugView 활성화
          if (__DEV__) {
            // iOS: 디버그 모드 활성화 (Xcode Scheme Arguments에 -FIRDebugEnabled 추가 필요)
            // Android: ADB 명령어로 활성화 필요 (아래 주석 참고)
            // adb shell setprop debug.firebase.analytics.app com.soomsoom.app
            await analytics().setAnalyticsCollectionEnabled(true);
            console.log('✅ Firebase Analytics 디버그 모드 활성화 (개발 모드)');
          }
          await analytics().logAppOpen();
          console.log('✅ Firebase Analytics 초기화 완료');
        } catch (analyticsError) {
          console.warn('⚠️ Analytics 초기화 실패:', analyticsError);
        }
        
        // 1) iOS: ATT 요청
        if (Platform.OS === 'ios') {
          try {
            const res = await requestTrackingPermissionsAsync();
            console.log('🧾 ATT 권한 결과(앱시작):', res?.status ?? 'unknown');
          } catch (err) {
            console.warn('⚠️ ATT 권한 요청 실패(앱시작):', err);
          }
        }

        // 2) UMP 동의 플로우
        try {
          console.log('🔄 [Ads] UMP consent info 업데이트 요청(앱시작)');
          const infoAfterUpdate = await AdsConsent.requestInfoUpdate({});
          console.log('✅ [Ads] UMP 업데이트 결과(앱시작):', {
            status: infoAfterUpdate.status,
            isConsentFormAvailable: infoAfterUpdate.isConsentFormAvailable,
            canRequestAds: infoAfterUpdate.canRequestAds,
          });

          if (
            infoAfterUpdate.isConsentFormAvailable &&
            (infoAfterUpdate.status === AdsConsentStatus.UNKNOWN || infoAfterUpdate.status === AdsConsentStatus.REQUIRED)
          ) {
            console.log('🧾 [Ads] 동의 폼 표시 시도(앱시작)');
            await AdsConsent.loadAndShowConsentFormIfRequired();
            console.log('✅ [Ads] 동의 폼 처리 완료(앱시작)');
          } else {
            console.log('ℹ️ [Ads] 동의 폼 표시 불필요(앱시작) (상태:', infoAfterUpdate.status, ')');
          }
        } catch (consentErr) {
          console.warn('⚠️ [Ads] UMP 동의 처리 실패(앱시작):', consentErr);
        }
      } catch (error) {
        console.warn('⚠️ 권한 요청 처리 실패(앱시작):', error);
      }
    };

    // 앱 시작 후 짧은 지연을 두고 권한 요청
    const timer = setTimeout(handlePermissions, 1000);
    return () => clearTimeout(timer);
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