import React from 'react';
import { checkAppVersionOnStart } from '../services/versionService';
import { useAchievementStore } from '../stores/achievementStore';
import { useAuthBootstrap } from './useAuthBootstrap';
import { AuthPhase } from '../types/auth';

/**
 * 앱 전반 초기화(버전 점검, 인증 부트스트랩, 업적 초기화)를 오케스트레이션하는 훅
 */
export function useAppBootstrap() {
  const { initOnAppStart } = useAchievementStore();
  const { run: runAuth } = useAuthBootstrap();
  const [isBootstrapping, setIsBootstrapping] = React.useState(true);

  const run = React.useCallback(async () => {
    setIsBootstrapping(true);
    // TODO: 서버 점검중인지 check하는 API 추가 (이게 가장 먼저 요청되는 API)
    // await checkAppVersionOnStart(); // 버전체크 API가 아직 없으므로 임시 비활성화
    await runAuth();
    await initOnAppStart();
    setIsBootstrapping(false);
  }, [runAuth, 
    //checkAppVersionOnStart, 
    initOnAppStart]);

  return { isBootstrapping, run } as { isBootstrapping: boolean; run: () => Promise<void> };
}


