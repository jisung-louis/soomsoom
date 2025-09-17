import React from 'react';
import { useAuth } from './useAuth';
import { useUserDataSync } from './useUserDataSync';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../services/apiClient';


/**
 * 앱 시작 시 인증 부트스트랩 로직을 담당하는 훅
 * - 저장된 토큰/사용자 로드 → 토큰 검증/갱신 → 실패 시 디바이스 로그인 수행
 * - 성공 시 apiClient에 토큰 주입 후, 소유 아이템/하트포인트 동기화
 */
export function useAuthBootstrap() {
  const { phase, setPhase } = useAuthStore();
  const { deviceLogin } = useAuth();
  const { syncAllUserData } = useUserDataSync();
  const ranOnceRef = React.useRef(false);

  const run = React.useCallback(async () => {
    if (ranOnceRef.current) return;
    ranOnceRef.current = true;

    // 이미 로그인 완료면 토큰 확인 후 데이터 동기화 (재실행 시 - 최신 데이터 보장)
    if (useAuthStore.getState().phase === 'logged_in') {
      const token = useAuthStore.getState().getAccessToken();
      if (token) {
        console.log('🔄 앱 재실행: 토큰 확인 완료, 최신 데이터 동기화');
        await syncAllUserData();
      } else {
        console.log('⚠️ 앱 재실행: 토큰 없음, 로그아웃 상태로 전환');
        setPhase('logged_out');
      }
      return;
    }

    // 1) 영속 저장소에서 토큰 먼저 조회 (하이드레이션 레이스 방지)
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const raw = await AsyncStorage.getItem('auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        const savedTokens = parsed?.state?.tokens as { accessToken: string; refreshToken?: string | null } | null;
        if (savedTokens?.accessToken && savedTokens?.refreshToken) {
          // apiClient는 이제 authStore를 직접 참조하므로 setTokens 불필요
          useAuthStore.getState().setSession({
            accessToken: savedTokens.accessToken,
            refreshToken: savedTokens.refreshToken || null,
          } as any);
          setPhase('logged_in');
          await syncAllUserData();
          return;
        }
      }
    } catch {}

    // 2) 최신 토큰 상태를 런타임에서 확인
    const a = useAuthStore.getState().getAccessToken();
    const r = useAuthStore.getState().getRefreshToken();
    if (a && r) {
      // apiClient는 이제 authStore를 직접 참조하므로 setTokens 불필요
      setPhase('logged_in');
      await syncAllUserData();
      return;
    }

    // 3) 디바이스 로그인 시도 (가드 내장)
    try {
      if (useAuthStore.getState().getAccessToken()) {
        setPhase('logged_in');
        await syncAllUserData();
        return;
      }
      const result = await deviceLogin();
      if (result.success) {
        await syncAllUserData();
      } else {
        setPhase('logged_out');
      }
    } catch (error) {
      console.error('디바이스 로그인 에러:', error);
      setPhase('logged_out');
    }
  }, [deviceLogin, syncAllUserData, setPhase]);

  return { phase, run };
}


