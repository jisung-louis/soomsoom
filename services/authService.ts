import { apiClient } from './apiClient';
import * as Notifications from 'expo-notifications';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { environmentConfig } from '../configs/environment';
import { Platform, PermissionsAndroid } from 'react-native';
import { getMessaging, getToken, onTokenRefresh as onTokenRefreshMod } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { requestNotificationPermissions } from './alarmNotificationService';

export type SocialProvider = 'GOOGLE' | 'APPLE';

// 인증 토큰
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string | null;
}
// API 기본 URL
const API_BASE_URL = environmentConfig.api.baseUrl;
// 구글 클라이언트 ID
const GOOGLE_CLIENT_ID = environmentConfig.auth.google.clientId;
// 구글 애플 클라이언트 ID
const GOOGLE_IOS_CLIENT_ID = environmentConfig.auth.google.iosClientId;
// 구글 오프라인 접근 설정
const GOOGLE_OFFLINE_ACCESS = true;
// 구글 호스팅 도메인
const GOOGLE_HOSTED_DOMAIN = '';
// 구글 강제 코드 리프레시 토큰 설정
const GOOGLE_FORCE_CODE_FOR_REFRESH_TOKEN = true;


// 구글 로그인 설정
GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  offlineAccess: GOOGLE_OFFLINE_ACCESS,
  hostedDomain: GOOGLE_HOSTED_DOMAIN,
  forceCodeForRefreshToken: GOOGLE_FORCE_CODE_FOR_REFRESH_TOKEN,
});

// 구글 로그인
export async function loginWithGoogle(): Promise<{ providerToken: string; profile?: any }> {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    if (!userInfo.data?.user || !userInfo.data?.idToken) {
      throw new Error('Google 로그인이 취소되었습니다.');
    }
    return {
      providerToken: userInfo.data?.idToken!,
      profile: { // 아직 providerToken 외의 정보는 사용하지 않음
        id: userInfo.data?.user?.id,
        name: userInfo.data?.user?.name,
        email: userInfo.data?.user?.email,
        picture: userInfo.data?.user?.photo,
      },
    };
  } catch (error: any) {
    if (error.code === 'SIGN_IN_CANCELLED' || error.message?.includes('취소')) {
      throw new Error('Google 로그인이 취소되었습니다.');
    }
    throw new Error(`Google 로그인에 실패했습니다: ${error.message}`);
  }
}

// 애플 로그인
export async function loginWithApple(): Promise<{ providerToken: string; profile?: any; authorizationCode?: string; nonce?: string }> {
  try {
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Apple 로그인을 사용할 수 없습니다.');
    }
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const fullName = credential.fullName;
    const displayName = fullName ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() : null;

    return {
      providerToken: credential.identityToken!,
      profile: { // 아직 providerToken 외의 정보는 사용하지 않음
        id: credential.user,
        name: displayName,
        email: credential.email || null,
      },
    };
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      throw new Error('Apple 로그인이 취소되었습니다.');
    }
    throw new Error('Apple 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

// 디바이스 로그인 요청 (디바이스 로그인)
export interface DeviceLoginRequest {
  deviceId: string;
}

// 디바이스 로그인 (디바이스 로그인)
export async function postDeviceLogin(params: DeviceLoginRequest): Promise<AuthTokens> {
  return await apiClient.post<AuthTokens>('/auth/device', params);
}

export interface SocialLoginRequest {
  provider: SocialProvider;
  providerToken: string;
  deviceId: string;
}

// 소셜 로그인 (소셜 로그인)
export async function postSocialLogin(
  payload: SocialLoginRequest,
): Promise<AuthTokens> {
  return await apiClient.post<AuthTokens>('/auth/social', payload);
}

// 리프레시 토큰 사용하여 액세스 토큰 재발급 (토큰 갱신)
export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  // 토큰 갱신 API 호출 시에는 액세스 토큰 헤더를 포함하지 않음
  // (만료된 토큰이 헤더에 포함되면 서버에서 401 에러 반환)
  const response = await fetch(`${environmentConfig.api.baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error(`토큰 갱신 실패: ${response.status}`);
  }

  return await response.json();
}

// ✅ FCM 토큰 획득 (직접 FCM 서버 사용 시)
export async function getFcmTokenAsync(): Promise<string | null> {
  try {
    const ok = await requestNotificationPermissions();
    if (!ok) {
      console.log('🚫 알림 권한 거부됨');
      return null;
    }
    
    // firebase.json에서 자동 등록이 활성화되어 있으므로 registerDeviceForRemoteMessages() 불필요
    // iOS에서도 자동으로 등록됨
    
    const app = getApp();
    const token = await getToken(getMessaging(app));
    console.log('✅ FCM Token:', token);
    return token || null;
  } catch (error) {
    console.error('❌ FCM Token 획득 실패:', error);
    return null;
  }
}

// (선택) 토큰 갱신 구독: 앱 실행 중 토큰 변경 시 서버에 업데이트
export function onFcmTokenRefresh(handler: (token: string) => void) {
  return onTokenRefreshMod(getMessaging(getApp()), (newToken) => {
    try {
      handler(newToken);
    } catch (e) {
      console.warn('[onFcmTokenRefresh] handler error:', e);
    }
  });
}

// ⚠️ (이전) Expo 토큰 함수: Expo 중계 사용 시에만 유효. 이제는 FCM 직접 사용을 권장.
// 기존 호출부 호환을 위해 남겨두고, 내부에서 FCM 토큰을 반환하도록 변경.
export async function getPushTokenAsync(): Promise<string | null> { // DEPRECATED: FCM 직접 사용 권장
  return await getFcmTokenAsync();
}

// 로그아웃
export async function postLogout(refreshToken: string): Promise<void> { // 리프레시 토큰 사용하여 로그아웃
  return await apiClient.post<void>('/auth/logout', { refreshToken });
}
