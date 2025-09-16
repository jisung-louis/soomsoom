import React from 'react';
import { useAuth } from './useAuth';
import { useOwnedItems } from './useOwnedItems';
import { getUserPoints } from '../services/userService';
import { useCurrencyStore } from '../stores/currencyStore';
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
  const { loadOwnedItems } = useOwnedItems();
  const { setHeartPoints } = useCurrencyStore();
  const ranOnceRef = React.useRef(false);

  const syncHeartPoints = React.useCallback(async () => {
    try {
      const response = await getUserPoints();
      setHeartPoints(response.points);
    } catch (error) {
      // 서버 미연결 등 에러는 앱 플로우에 치명적이지 않으므로 무시
    }
  }, [setHeartPoints]);

  const run = React.useCallback(async () => {
    if (ranOnceRef.current) return;
    ranOnceRef.current = true;

    // 이미 로그인 완료면 종료
    if (useAuthStore.getState().phase === 'logged_in') {
      await syncHeartPoints();
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
          apiClient.setTokens(savedTokens.accessToken, savedTokens.refreshToken);
          useAuthStore.getState().setSession({
            accessToken: savedTokens.accessToken,
            refreshToken: savedTokens.refreshToken || null,
          } as any);
          setPhase('logged_in');
          await syncHeartPoints();
          loadOwnedItems();
          return;
        }
      }
    } catch {}

    // 2) 최신 토큰 상태를 런타임에서 확인
    const a = useAuthStore.getState().getAccessToken();
    const r = useAuthStore.getState().getRefreshToken();
    if (a && r) {
      apiClient.setTokens(a, r);
      setPhase('logged_in');
      await syncHeartPoints();
      loadOwnedItems();
      return;
    }

    // 3) 디바이스 로그인 시도 (가드 내장)
    try {
      if (useAuthStore.getState().getAccessToken()) {
        setPhase('logged_in');
        await syncHeartPoints();
        return;
      }
      const result = await deviceLogin();
      if (result.success) {
        loadOwnedItems();
        await syncHeartPoints();
      } else {
        setPhase('logged_out');
      }
    } catch (error) {
      console.error('디바이스 로그인 에러:', error);
      setPhase('logged_out');
    }
  }, [loadOwnedItems, deviceLogin, syncHeartPoints, setPhase]);

  return { phase, run };
}


