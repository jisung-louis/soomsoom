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
  const { phase, setPhase, getAccessToken, getRefreshToken } = useAuthStore();
  const { deviceLogin } = useAuth();
  const { loadOwnedItems } = useOwnedItems();
  const { setHeartPoints } = useCurrencyStore();

  const syncHeartPoints = React.useCallback(async () => {
    try {
      const response = await getUserPoints();
      setHeartPoints(response.points);
    } catch (error) {
      // 서버 미연결 등 에러는 앱 플로우에 치명적이지 않으므로 무시
    }
  }, [setHeartPoints]);

  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const hasTokens = !!accessToken && !!refreshToken;

  const run = React.useCallback(async () => {
    if (hasTokens) {
       apiClient.setTokens(accessToken!, refreshToken!);
       setPhase('logged_in'); 
       await syncHeartPoints();
       //loadOwnedItems(); // 소유 아이템 목록 동기화 url이 서버 권한설정 오류로 못불러오는 상태임. 임시 비활성화
       return; 
    }
    try {
      // 디바이스 로그인으로 시작
      const result = await deviceLogin();
      if (result.success) {
        //loadOwnedItems(); // 소유 아이템 목록 동기화 url이 서버 권한설정 오류로 못불러오는 상태임. 임시 비활성화
        await syncHeartPoints();
      } else {
        setPhase('logged_out');
      }
    } catch (error) {
      console.error('디바이스 로그인 에러:', error);
      setPhase('logged_out');
    }
  }, [ //loadOwnedItems, 
    hasTokens, accessToken, refreshToken, deviceLogin, syncHeartPoints, setPhase]);

  return { phase, run };
}


