import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useAuthStore } from '../stores/authStore';
import { 
  loginWithGoogle, 
  loginWithApple, 
  postSocialLogin, 
  postDeviceLogin, 
  postLogout,
  SocialProvider 
} from '../services/authService';
import { apiClient } from '../services/apiClient';
import { getCachedInstallUuid } from '../utils/deviceId';

/**
 * 인증 관련 로직을 중앙화한 커스텀 훅
 * 
 * 주요 기능:
 * - 소셜 로그인 (구글, 애플)
 * - 디바이스 로그인
 * - 로그아웃
 * - 소셜 로그인 시 기존 디바이스 세션 자동 로그아웃
 */
export const useAuth = () => {
  const { showToast } = useToast();
  const setSession = useAuthStore(s => s.setSession);
  const [loading, setLoading] = useState<'GOOGLE' | 'APPLE' | 'DEVICE' | 'LOGOUT' | null>(null);
  const { setPhase } = useAuthStore();

  /**
   * 소셜 로그인 (구글 또는 애플)
   * 
   * 플로우:
   * 1. 소셜 로그인 수행 (구글/애플)
   * 2. 서버에서 토큰 교환 (postSocialLogin)
   * 3. postSocialLogin 성공 후 기존 디바이스 세션 로그아웃
   * 4. 새 세션 설정
   * 
   * 안전성: postSocialLogin이 성공한 후에만 디바이스 로그아웃을 수행하여
   * 실패 시에도 기존 디바이스 세션을 유지할 수 있도록 함
   */
  const socialLogin = async (provider: SocialProvider) => {
    try {
      setLoading(provider);
      
      // 1. 소셜 로그인 수행
      console.log(`🔐 ${provider} 로그인 시작...`);
      const { providerToken } = provider === 'GOOGLE' 
        ? await loginWithGoogle() 
        : await loginWithApple();

      // 2. 서버에서 토큰 교환
      console.log('🔄 서버에서 토큰 교환 중...');
      const deviceId = await getCachedInstallUuid();
      const tokens = await postSocialLogin({ 
        provider, 
        providerToken, 
        deviceId 
      });
      console.log('===============================================');
      console.log('|전달된 provider:', provider);
      console.log('|전달된 providerToken:', providerToken);
      console.log('|전달된 deviceId:', deviceId);
      console.log('===============================================');


      // 2.5 providerToken 보관 (디버그/추적 또는 추가 연동 용도)
      try {
        useAuthStore.getState().setLastProviderToken(providerToken);
      } catch {}

      // 3. postSocialLogin 성공 후 기존 디바이스 세션 로그아웃
      const currentTokens = useAuthStore.getState().tokens;
      if (currentTokens?.refreshToken) {
        console.log('🔄 기존 디바이스 세션 로그아웃 중...');
        try {
          await postLogout(currentTokens.refreshToken);
          console.log('✅ 디바이스 세션 로그아웃 완료');
        } catch (error) {
          console.warn('⚠️ 디바이스 로그아웃 실패 (무시하고 계속):', error);
          // (이 경우에는 서버에 디바이스세션 RefreshToken도 있고 소셜 로그인 RefreshToken도 있는 상태임.)
        }
      }

      // 4. 새 세션 설정
      console.log('🔐 새 세션 설정 중...');
      apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
      await setSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      setPhase('logged_in');

      console.log(`✅ ${provider} 로그인 완료`);
      showToast({ message: `${provider === 'GOOGLE' ? '구글' : '애플'} 로그인에 성공했어요!` });
      
      return { success: true };
    } catch (error: any) {
      console.error(`${provider} 로그인 에러:`, error);
      
      // 에러 타입별 구체적인 메시지 제공
      let errorMessage = `${provider === 'GOOGLE' ? '구글' : '애플'} 로그인에 실패했어요.`;
      
      if (error?.message?.includes('취소')) {
        errorMessage = `${provider === 'GOOGLE' ? '구글' : '애플'} 로그인이 취소되었어요.`;
      } else if (error?.message?.includes('네트워크')) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else if (error?.message?.includes('권한')) {
        errorMessage = `${provider === 'GOOGLE' ? '구글' : '애플'} 로그인 권한이 필요해요.`;
      } else if (error?.message?.includes('서버')) {
        errorMessage = '서버에 문제가 있어요. 잠시 후 다시 시도해주세요.';
      } else if (error?.message?.includes('사용할 수 없습니다')) {
        errorMessage = '이 기기에서는 애플 로그인을 사용할 수 없어요.';
      }
      
      showToast({ message: errorMessage });
      return { success: false, error };
    } finally {
      setLoading(null);
    }
  };

  /**
   * 디바이스 로그인
   * 앱 시작 시 자동으로 호출되는 로그인 방식
   */
  const deviceLogin = React.useCallback(async () => {
    // 가드: 이미 로그인 상태거나 토큰이 존재하면 디바이스 로그인 시도하지 않음
    const state = useAuthStore.getState();
    if (state.phase === 'logged_in' || state.tokens?.accessToken) {
      return { success: true } as const;
    }
    try {
      setLoading('DEVICE');
      console.log('🔐 디바이스 로그인 시작...');
      
      const deviceId = await getCachedInstallUuid();
      const tokens = await postDeviceLogin({ deviceId });
      
      // 세션 설정
      apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
      await setSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      
      console.log('✅ 디바이스 로그인 완료');
      setPhase('logged_in');
      return { success: true };
    } catch (error: any) {
      console.error('디바이스 로그인 에러:', error);
      setPhase('logged_out');
      return { success: false, error };
    } finally {
      setLoading(null);
    }
  }, [setSession, setPhase]);

  /**
   * 로그아웃
   * 현재 세션을 서버에서 무효화하고 로컬 상태를 초기화
   */
  const logout = async () => {
    try {
      setLoading('LOGOUT');
      console.log('🔐 로그아웃 시작...');
      
      const currentTokens = useAuthStore.getState().tokens;
      if (currentTokens?.refreshToken) {
        // 서버에서 토큰 무효화
        await postLogout(currentTokens.refreshToken);
      }
      
      // 로컬 상태 초기화
      apiClient.clearTokens();
      useAuthStore.getState().logout();
      
      console.log('✅ 로그아웃 완료');
      showToast({ message: '로그아웃되었어요.' });
      setPhase('logged_out');
      return { success: true };
    } catch (error: any) {
      console.error('로그아웃 에러:', error);
      setPhase('logged_out');
      // 서버 로그아웃 실패해도 로컬 상태는 초기화
      apiClient.clearTokens();
      useAuthStore.getState().logout();
      
      showToast({ message: '로그아웃되었어요.' });
      return { success: true }; // 로컬 초기화는 성공으로 처리
    } finally {
      setLoading(null);
    }
  };

  return {
    // 함수들
    socialLogin,
    deviceLogin,
    logout,
    
    // 상태
    loading,
    isLoading: loading !== null,
  };
};
