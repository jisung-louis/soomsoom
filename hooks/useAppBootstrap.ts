import React from 'react';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { useAppConfigStore } from '../stores/appConfigStore';
import { checkAppVersionOnStart } from '../services/versionService';
import { useAchievementStore } from '../stores/achievementStore';
import { useAuthBootstrap } from './useAuthBootstrap';
import { AuthPhase } from '../types/auth';
import { Platform } from 'react-native';

/**
 * 앱 전반 초기화(버전 점검, 인증 부트스트랩, 업적 초기화)를 오케스트레이션하는 훅
 */
export function useAppBootstrap() {
  const { initOnAppStart } = useAchievementStore();
  const { run: runAuth } = useAuthBootstrap();
  const [isBootstrapping, setIsBootstrapping] = React.useState(true);
  const { setCanRequestPersonalizedAds, setServerClosed, setForceUpdateBlocked } = useAppConfigStore();

  const run = React.useCallback(async () => {
    setIsBootstrapping(true);
    // TODO: 서버 점검중인지 check하는 API 추가 (이게 가장 먼저 요청되는 API)
    const versionCheck = await checkAppVersionOnStart(); // 버전체크
    if (!versionCheck.serverAvailable) {
      // 서버 닫힘/점검 상태 → 앱을 막고 전용 화면으로
      setServerClosed(true);
      setIsBootstrapping(false);
      console.log('🔍 서버 닫힘/점검 상태 → 앱을 막고 전용 화면으로');
      return;
    }
    // 강제 업데이트 필요 시 앱 실행 차단
    if (versionCheck.shouldBlockApp) {
      setForceUpdateBlocked(true);
      // isBootstrapping은 true로 유지하여 AuthGate가 로딩 화면을 계속 표시하도록 함
      console.log('🚫 강제 업데이트 필요 → 앱 실행 차단');
      return;
    }
    // 서버 사용 가능 시, 과거에 true였던 값을 확실히 해제
    setServerClosed(false);
    setForceUpdateBlocked(false);
    try {
      console.log('🛠️ [Ads] setRequestConfiguration 시작');
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.G,
        testDeviceIdentifiers: ['7B462722-9147-4DAE-BA98-DF8BBAA23887', 'SIMULATOR'],
      });
      console.log('✅ [Ads] setRequestConfiguration 완료');
      // 기본값: 온보딩 06에서 동의 처리 전까지는 개인화 광고 요청 불가로 가정
      setCanRequestPersonalizedAds(false);

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
    initOnAppStart, setCanRequestPersonalizedAds, setServerClosed, setForceUpdateBlocked]);

  return { isBootstrapping, run } as { isBootstrapping: boolean; run: () => Promise<void> };
}


