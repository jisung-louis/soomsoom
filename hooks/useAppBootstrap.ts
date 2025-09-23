import React from 'react';
import mobileAds, { MaxAdContentRating, AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';
import { useAppConfigStore } from '../stores/appConfigStore';
import { checkAppVersionOnStart } from '../services/versionService';
import { useAchievementStore } from '../stores/achievementStore';
import { useAuthBootstrap } from './useAuthBootstrap';
import { AuthPhase } from '../types/auth';
import { Platform } from 'react-native';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

/**
 * 앱 전반 초기화(버전 점검, 인증 부트스트랩, 업적 초기화)를 오케스트레이션하는 훅
 */
export function useAppBootstrap() {
  const { initOnAppStart } = useAchievementStore();
  const { run: runAuth } = useAuthBootstrap();
  const [isBootstrapping, setIsBootstrapping] = React.useState(true);
  const { setCanRequestPersonalizedAds } = useAppConfigStore();

  const run = React.useCallback(async () => {
    setIsBootstrapping(true);
    // TODO: 서버 점검중인지 check하는 API 추가 (이게 가장 먼저 요청되는 API)
    // await checkAppVersionOnStart(); // 버전체크 API가 아직 없으므로 임시 비활성화
    // iOS: ATT 권한 요청 (IDFA 확보)
    if (Platform.OS === 'ios') {
      try {
        const res = await requestTrackingPermissionsAsync();
        console.log('🧾 ATT 권한 결과:', res?.status ?? 'unknown');
      } catch (err) {
        console.warn('⚠️ ATT 권한 요청 실패:', err);
      }
    }
    try {
      console.log('🛠️ [Ads] setRequestConfiguration 시작');
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.G,
        testDeviceIdentifiers: ['7B462722-9147-4DAE-BA98-DF8BBAA23887', 'SIMULATOR'],
      });
      console.log('✅ [Ads] setRequestConfiguration 완료');

      console.log('🔄 [Ads] UMP consent info 업데이트 요청');
      const infoAfterUpdate = await AdsConsent.requestInfoUpdate({});
      console.log('✅ [Ads] UMP 업데이트 결과:', {
        status: infoAfterUpdate.status,
        isConsentFormAvailable: infoAfterUpdate.isConsentFormAvailable,
        canRequestAds: infoAfterUpdate.canRequestAds,
      });

      if (
        infoAfterUpdate.isConsentFormAvailable &&
        (infoAfterUpdate.status === AdsConsentStatus.UNKNOWN ||
          infoAfterUpdate.status === AdsConsentStatus.REQUIRED)
      ) {
        console.log('🧾 [Ads] 동의 폼 표시 시도');
        await AdsConsent.loadAndShowConsentFormIfRequired();
        console.log('✅ [Ads] 동의 폼 처리 완료');
      } else {
        console.log('ℹ️ [Ads] 동의 폼 표시 불필요 (상태:', infoAfterUpdate.status, ')');
      }

      const consentInfo = await AdsConsent.getConsentInfo();
      console.log('📊 [Ads] 최종 동의 상태:', {
        status: consentInfo.status,
        canRequestAds: consentInfo.canRequestAds,
      });
      setCanRequestPersonalizedAds(consentInfo.canRequestAds);

      console.log('🚀 [Ads] mobileAds.initialize 시작');
      await mobileAds().initialize();
      console.log('✅ [Ads] mobileAds.initialize 완료');
    } catch (e) {
      console.error('❌ [Ads] 초기화 흐름 실패:', e);
      // 실패 시 광고는 계속 요청하되 NPA로 요청하도록 처리
      setCanRequestPersonalizedAds(false);
    }
    await runAuth();
    await initOnAppStart();
    setIsBootstrapping(false);
  }, [runAuth, 
    //checkAppVersionOnStart, 
    initOnAppStart, setCanRequestPersonalizedAds]);

  return { isBootstrapping, run } as { isBootstrapping: boolean; run: () => Promise<void> };
}


