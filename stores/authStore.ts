import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AuthResponse, AuthPhase } from '../types/auth';
import { decodeJwt } from '../utils/jwt';
import { apiClient } from '../services/apiClient';

export interface AuthState {
  tokens: AuthResponse | null;
  isLoggedIn: boolean;
  phase: AuthPhase;
  role?: 'ROLE_USER' | 'ROLE_ANONYMOUS' | string;
  loginType?: 'social' | 'device';
  setSession: (tokens: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  setPhase: (phase: AuthPhase) => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  devtools((set, get) => ({
    tokens: null,
    isLoggedIn: false,
    phase: 'checking',
    role: undefined,
    loginType: undefined,
    setSession: async (tokens: AuthResponse) => {
      console.log('🔐 Zustand에 로그인 정보(액세스 토큰, 리프레시 토큰) 저장 중...');
      console.log(tokens.accessToken);
      console.log(tokens.refreshToken);
      console.log(decodeJwt(tokens.accessToken));
      // ApiClient에 토큰 설정
      apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
      
      // JWT 파싱하여 role 및 로그인 유형 추출
      const payload = decodeJwt(tokens.accessToken);
      const role = (payload?.auth as string) || undefined;
      const loginType = role === 'ROLE_USER' ? 'social' : 'device';

      set({ tokens, isLoggedIn: true, role, loginType });
      console.log('✅ Zustand에 로그인 정보(액세스 토큰, 리프레시 토큰) 저장 완료!', { 
        isLoggedIn: true,
        hasTokens: !!tokens 
      });
    },
    logout: async () => {
      console.log('🚪 로그아웃 시작(액세스 토큰, 리프레시 토큰 초기화)...');
      // ApiClient에서 토큰 초기화
      apiClient.clearTokens();
      
      set({ tokens: null, isLoggedIn: false, role: undefined, loginType: undefined, phase: 'logged_out' });
      console.log('✅ 로그아웃 완료(액세스 토큰, 리프레시 토큰 초기화)!');
    },
    getAccessToken: () => {
      return get().tokens?.accessToken;
    },
    getRefreshToken: () => {
      return get().tokens?.refreshToken;
    },
    setPhase: (phase: AuthPhase) => {
      set({ phase });
    },
  }))
);
