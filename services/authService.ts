import { apiClient } from './apiClient';
import * as Notifications from 'expo-notifications';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { environmentConfig } from '../configs/environment';

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
export async function refreshTokens(refreshToken: string): Promise<AuthTokens> { // 리프레시 토큰 사용하여 액세스 토큰 재발급
  return await apiClient.post<AuthTokens>('/auth/refresh', { refreshToken });
}

// Push Token 획득 (푸시 토큰 획득)
export async function getPushTokenAsync(): Promise<string | null> { // Push Token 획득
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return null;
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: '7f902b97-4f3d-48af-9a0a-1a71a63f49d6',
    });
    return token.data ?? null;
  } catch (error) {
    console.error('❌ Push Token 획득 실패:', error);
    return null;
  }
}

// 로그아웃
export async function postLogout(refreshToken: string): Promise<void> { // 리프레시 토큰 사용하여 로그아웃
  return await apiClient.post<void>('/auth/logout', { refreshToken });
}
