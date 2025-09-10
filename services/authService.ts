import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { environmentConfig } from '../configs/environment';

export type SocialProvider = 'google' | 'apple';

export interface AuthUser {
  id: number;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

// 환경별 API 베이스 URL 연결
const API_BASE_URL = environmentConfig.api.baseUrl;

// Google Sign-In 설정
const GOOGLE_CLIENT_ID = environmentConfig.auth.google.clientId;
const GOOGLE_IOS_CLIENT_ID = environmentConfig.auth.google.iosClientId;

// Google Sign-In 초기화
GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID, // Web Application Client ID
  iosClientId: GOOGLE_IOS_CLIENT_ID, // iOS Client ID
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});

console.log('🔧 Google Sign-In 설정:', {
  clientId: GOOGLE_CLIENT_ID,
  hasClientId: !!GOOGLE_CLIENT_ID,
  isDev: __DEV__
});

export async function getPushTokenAsync(): Promise<string | null> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return null;
    
    // EAS 빌드에서는 projectId 설정 필요
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: '7f902b97-4f3d-48af-9a0a-1a71a63f49d6' // app.json의 EAS projectId
    });
    
    return token.data ?? null;
  } catch (error) {
    console.error('❌ Push Token 획득 실패:', error);
    return null;
  }
}

// Google 로그인 구현 (Google Sign-In 라이브러리 사용)
export async function loginWithGoogle(): Promise<{ provider: SocialProvider; providerToken: string; profile?: any }> {
  try {
    console.log('🔍 Google 로그인 시작...');
    console.log('📱 Client ID:', GOOGLE_CLIENT_ID);
    
    // Google Sign-In 로그인 실행
    console.log(' Google Sign-In 로그인 실행 중...');
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    console.log('✅ Google Sign-In 성공:', {
      id: userInfo.data?.user?.id,
      name: userInfo.data?.user?.name,
      email: userInfo.data?.user?.email,
      hasPhoto: !!userInfo.data?.user?.photo
    });
    
    return {
      provider: 'google',
      providerToken: userInfo.data?.idToken!,
      profile: {
        id: userInfo.data?.user?.id,
        name: userInfo.data?.user?.name,
        email: userInfo.data?.user?.email,
        picture: userInfo.data?.user?.photo,
      }
    };
  } catch (error: any) {
    console.error('❌ Google 로그인 에러 상세:', error);
    console.error('❌ 에러 스택:', error.stack);
    
    if (error.code === 'SIGN_IN_CANCELLED') {
      throw new Error('Google 로그인이 취소되었습니다.');
    }
    throw new Error(`Google 로그인에 실패했습니다: ${error.message}`);
  }
}

// Apple 로그인 구현
export async function loginWithApple(): Promise<{ provider: SocialProvider; providerToken: string; profile?: any; authorizationCode?: string; nonce?: string }> {
  try {
    // Apple 로그인 가능 여부 확인
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Apple 로그인을 사용할 수 없습니다.');
    }

    // nonce 생성 (보안을 위해)
    const nonce = Math.random().toString(36).substring(2, 15);
    
    // Apple 로그인 요청
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce,
    });

    return {
      provider: 'apple',
      providerToken: credential.identityToken!,
      profile: {
        id: credential.user,
        name: credential.fullName ? 
          `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() : 
          null,
        email: credential.email,
      },
      authorizationCode: credential.authorizationCode!,
      nonce,
    };
  } catch (error: any) {
    console.error('Apple 로그인 에러:', error);
    if (error.code === 'ERR_REQUEST_CANCELED') {
      throw new Error('Apple 로그인이 취소되었습니다.');
    }
    throw new Error('Apple 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

export async function postSocialLogin(params: {
  provider: SocialProvider;
  providerToken: string;
  deviceToken: string | null;
  profile?: any;
  authorizationCode?: string;
  nonce?: string;
}): Promise<AuthResponse> {
  try {
    // 개발 환경에서는 모의 API 응답 사용 (실제 Google 로그인은 테스트하되 백엔드 API는 Mock 사용)
    if (environmentConfig.debug.enabled) {
      console.log('🔧 개발 모드: 실제 Google 로그인 + Mock 백엔드 API 응답 사용');
      console.log('📱 받은 Google 프로필 정보:', {
        provider: params.provider,
        name: params.profile?.name,
        email: params.profile?.email,
        picture: params.profile?.picture,
        hasToken: !!params.providerToken
      });
      
      // 실제 Google 프로필 정보를 사용한 Mock 응답 데이터
      const mockResponse: AuthResponse = {
        user: {
          id: Math.floor(Math.random() * 1000) + 1,
          name: params.profile?.name || 'Google 사용자',
          email: params.profile?.email || 'google@example.com',
          avatarUrl: params.profile?.picture || null,
        },
        tokens: {
          accessToken: 'mock_access_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
        }
      };
      
      // 실제 API 호출처럼 지연 시간 추가
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockResponse;
    }
    
    // 프로덕션 환경에서는 실제 API 호출
    const res = await axios.post(`${API_BASE_URL}/auth/social`, params, { timeout: 15000 });
    // expected: { user: {...}, tokens: { accessToken, refreshToken } }
    return res.data as AuthResponse;
  } catch (error: any) {
    console.error('소셜 로그인 API 에러:', error);
    
    // 네트워크 에러 처리
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new Error('네트워크 연결을 확인해주세요.');
    }
    
    // 서버 에러 처리
    const status = error.response?.status;
    const message = error?.response?.data?.message || '로그인에 실패했어요.';
    
    if (status === 401) {
      throw new Error('인증에 실패했습니다. 다시 로그인해주세요.');
    } else if (status === 500) {
      throw new Error('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    throw new Error(message);
  }
}

export async function persistTokens(tokens: AuthTokens): Promise<void> {
  console.log('💾 SecureStore에 토큰 저장 중...', { 
    hasAccessToken: !!tokens.accessToken,
    hasRefreshToken: !!tokens.refreshToken 
  });
  
  await SecureStore.setItemAsync('accessToken', tokens.accessToken);
  if (tokens.refreshToken) {
    await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
  }
  
  console.log('✅ SecureStore에 토큰 저장 완료!');
}

export async function persistUser(user: AuthUser): Promise<void> {
  console.log('💾 AsyncStorage에 사용자 정보 저장 중...', { 
    id: user.id,
    name: user.name,
    email: user.email
  });
  
  await AsyncStorage.setItem('userInfo', JSON.stringify(user));
  
  console.log('✅ AsyncStorage에 사용자 정보 저장 완료!');
}

export async function loadUser(): Promise<AuthUser | null> {
  try {
    const userData = await AsyncStorage.getItem('userInfo');
    if (userData) {
      const user = JSON.parse(userData) as AuthUser;
      console.log('✅ 저장된 사용자 정보 로드:', { 
        id: user.id,
        name: user.name,
        email: user.email
      });
      return user;
    }
    return null;
  } catch (error) {
    console.error('❌ 사용자 정보 로드 실패:', error);
    return null;
  }
}

export async function loadTokens(): Promise<AuthTokens | null> {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  if (!accessToken) return null;
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  return { accessToken, refreshToken: refreshToken ?? null };
}

export async function clearTokens(): Promise<void> {
  console.log('🗑️ SecureStore에서 토큰 삭제 중...');
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  console.log('✅ SecureStore에서 토큰 삭제 완료!');
}

// 개발용 모의 로그인 함수들
export async function mockLoginWithGoogle(): Promise<{ provider: SocialProvider; providerToken: string; profile?: any }> {
  // 개발 환경에서만 사용
  if (!environmentConfig.debug.enabled) {
    throw new Error('모의 로그인은 개발 환경에서만 사용할 수 있습니다.');
  }

  // 모의 Google 로그인 데이터
  return {
    provider: 'google',
    providerToken: 'mock_google_token_' + Date.now(),
    profile: {
      id: 'mock_google_user_123',
      name: '테스트 사용자',
      email: 'test@example.com',
      picture: 'https://via.placeholder.com/100',
    }
  };
}

export async function mockLoginWithApple(): Promise<{ provider: SocialProvider; providerToken: string; profile?: any; authorizationCode?: string; nonce?: string }> {
  // 개발 환경에서만 사용
  if (!environmentConfig.debug.enabled) {
    throw new Error('모의 로그인은 개발 환경에서만 사용할 수 있습니다.');
  }

  // 모의 Apple 로그인 데이터
  return {
    provider: 'apple',
    providerToken: 'mock_apple_token_' + Date.now(),
    profile: {
      id: 'mock_apple_user_456',
      name: '테스트 사용자',
      email: 'test@example.com',
    },
    authorizationCode: 'mock_authorization_code_' + Date.now(),
    nonce: 'mock_nonce_' + Date.now(),
  };
}
