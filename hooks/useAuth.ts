import React, { useState } from 'react';
import { Platform } from 'react-native';
import { useToast } from '../contexts/ToastContext';
import { useAuthStore } from '../stores/authStore';
import { 
  loginWithGoogle, 
  loginWithApple, 
  postSocialLogin, 
  postDeviceLogin, 
  postLogout,
  SocialProvider,
  getFcmTokenAsync,
  onFcmTokenRefresh
} from '../services/authService';
import { registerDevice, unregisterDevice } from '../services/notificationService';
import { getCachedInstallUuid, rotateInstallUuid } from '../utils/deviceId';
import { resetAppState } from '../utils/resetAppState';
import { syncAllUserData } from '../hooks/useUserDataSync';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

import { ss, sv } from '../utils/scale';

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
   * FCM 토큰 등록
   * 로그인 성공 후 호출되는 헬퍼 함수
   */
  const registerFcmToken = async () => {
    try {
      const fcmToken = await getFcmTokenAsync();
      if (fcmToken) {
        const osType = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
        await registerDevice(fcmToken, osType);
        console.log('✅ FCM 토큰 등록 완료');
        
        // 토큰 갱신 구독 설정
        onFcmTokenRefresh(async (newToken) => {
          try {
            const osType = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
            await registerDevice(newToken, osType);
            console.log('✅ FCM 토큰 갱신 등록 완료');
          } catch (error) {
            console.error('❌ FCM 토큰 갱신 등록 실패:', error);
          }
        });
      }
    } catch (error) {
      console.error('❌ FCM 토큰 등록 실패:', error);
      // FCM 토큰 등록 실패해도 로그인은 계속 진행
    }
  };

  /**
   * FCM 토큰 해지
   * 로그아웃 시 호출되는 헬퍼 함수
   */
  const unregisterFcmToken = async () => {
    try {
      const fcmToken = await getFcmTokenAsync();
      if (fcmToken) {
        await unregisterDevice(fcmToken);
        console.log('✅ FCM 토큰 해지 완료');
      }
    } catch (error) {
      console.error('❌ FCM 토큰 해지 실패:', error);
      // FCM 토큰 해지 실패해도 로그아웃은 계속 진행
    }
  };

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

      // 2. 서버에서 토큰 교환 (deviceId 미존재 404 시, 선(先) 디바이스 로그인 후 재시도)
      console.log('🔄 서버에서 토큰 교환 중...');
      const deviceId = await getCachedInstallUuid();
      let tokens;
      try {
        tokens = await postSocialLogin({ provider, providerToken, deviceId });
      } catch (err: any) {
        const msg = String(err?.message ?? '');
        // 서버에서 "deviceId로 계정을 찾을 수 없습니다." 케이스 대응
        if (msg.includes('deviceId') && msg.includes('찾을 수 없습니다')) {
          console.warn('⚠️ deviceId 계정 미존재 → 디바이스 로그인 선행 후 소셜 재시도');
          try {
            const deviceTokens = await postDeviceLogin({ deviceId });
            // 임시 세션 세팅(소셜 성공 후 곧 교체됨)
            await setSession({ accessToken: deviceTokens.accessToken, refreshToken: deviceTokens.refreshToken });
          } catch (seedErr) {
            console.error('❌ 디바이스 로그인(시드) 실패:', seedErr);
            throw err; // 원본 에러 전파
          }
          // 재시도
          tokens = await postSocialLogin({ provider, providerToken, deviceId });
        } else {
          throw err;
        }
      }
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
      await setSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      setPhase('logged_in');

      // 5. FCM 토큰 등록 (소셜 로그인 시에는 즉시 등록)
      console.log('📱 FCM 토큰 등록 중...');
      await registerFcmToken();

      console.log(`✅ ${provider} 로그인 완료`);
      showToast({ 
        message: `${provider === 'GOOGLE' ? '구글' : '애플'} 로그인에 성공했어요!` ,
        textStyle: {
          ...typography.body5,
        },
        style: {
          width: 'auto',
          height: 'auto',
        },
      });
      
      // 6. 사용자 데이터 전체 동기화
      await syncAllUserData();
      
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
      console.log('🔐 이미 로그인된 상태입니다. 디바이스 로그인 스킵');
      return { success: true } as const;
    }
    
    // 로딩 중이면 대기
    if (loading === 'DEVICE') {
      console.log('🔐 디바이스 로그인 진행 중입니다. 중복 호출 방지');
      return { success: true } as const;
    }
    try {
      setLoading('DEVICE');
      console.log('🔐 디바이스 로그인 시작...');
      
      const deviceId = 
      await getCachedInstallUuid();
      //'device-id-1234567890';
      const tokens = await postDeviceLogin({ deviceId });
      
      // 세션 설정
      await setSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      
      // FCM 토큰 등록은 온보딩 06단계에서만 수행
      // console.log('📱 FCM 토큰 등록 중...');
      // await registerFcmToken();
      
      console.log('✅ 디바이스 로그인 완료');
      setPhase('logged_in');
      
      // 사용자 데이터 전체 동기화
      await syncAllUserData();
      
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
      
      // FCM 토큰 해지 (서버 로그아웃 전에 시도, 실패해도 계속 진행)
      console.log('📱 FCM 토큰 해지 중...');
      try {
        await unregisterFcmToken();
      } catch (fcmError) {
        console.warn('⚠️ FCM 토큰 해지 실패 (무시하고 계속):', fcmError);
      }
      
      // 현재 소셜 로그인 여부 캡처 (회전 조건 판단용)
      const wasSocial = useAuthStore.getState().role === 'ROLE_USER';

      const currentTokens = useAuthStore.getState().tokens;
      if (currentTokens?.refreshToken) {
        // 서버에서 토큰 무효화
        await postLogout(currentTokens.refreshToken);
      }
      
      // 로컬 상태 초기화
      useAuthStore.getState().logout();
      
      // 앱 상태 초기화 (캐시, 스토어 등) - 인증은 이미 초기화됨
      await resetAppState(false);

      // 소셜 로그아웃인 경우에만 deviceId 회전(새 UUID 발급)
      if (wasSocial) {
        try {
          await rotateInstallUuid();
          console.log('🔄 deviceId 회전 완료 (소셜 로그아웃)');
        } catch (e) {
          console.warn('⚠️ deviceId 회전 실패(무시):', e);
        }
      }
      
      console.log('✅ 로그아웃 완료');
      showToast({ message: '로그아웃되었어요.' });
      setPhase('logged_out');
      return { success: true };
    } catch (error: any) {
      console.error('로그아웃 에러:', error);
      setPhase('logged_out');
      
      // FCM 토큰 해지 (에러 상황에서도 시도)
      try {
        console.log('📱 FCM 토큰 해지 중...');
        await unregisterFcmToken();
      } catch (fcmError) {
        console.error('❌ FCM 토큰 해지 실패 (에러 상황):', fcmError);
      }
      
      // 서버 로그아웃 실패해도 로컬 상태는 초기화
      useAuthStore.getState().logout();
      
      // 앱 상태 초기화 (캐시, 스토어 등) - 인증은 이미 초기화됨
      await resetAppState(false);
      
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
    registerFcmToken, // FCM 토큰 등록 함수 노출
    
    // 상태
    loading,
    isLoading: loading !== null,
  };
};
