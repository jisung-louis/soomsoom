import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthResponse, AuthPhase } from '../types/auth';
import { decodeJwt } from '../utils/jwt';

export interface AuthState {
  tokens: AuthResponse | null;
  isLoggedIn: boolean;
  phase: AuthPhase;
  role?: 'ROLE_USER' | 'ROLE_ANONYMOUS' | string;
  loginType?: 'social' | 'device';
  lastProviderToken?: string | null; // 소셜 로그인 시 최근 provider 토큰 보관 (일회성 디버그/지원용)
  hydrated?: boolean; // persist 하이드레이션 완료 여부
  setSession: (tokens: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  setPhase: (phase: AuthPhase) => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setLastProviderToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        tokens: null,
        isLoggedIn: false,
        phase: 'checking',
        role: undefined,
        loginType: undefined,
        lastProviderToken: null,
        hydrated: false,
        setSession: async (tokens: AuthResponse) => {
          console.log('🔐 Zustand에 로그인 정보(액세스 토큰, 리프레시 토큰) 저장 중...');
          console.log(tokens.accessToken);
          console.log(tokens.refreshToken);
          console.log(decodeJwt(tokens.accessToken));
          
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
          
          set({ tokens: null, isLoggedIn: false, role: undefined, loginType: undefined, lastProviderToken: null, phase: 'logged_out' });
          console.log('✅ 로그아웃 완료(액세스 토큰, 리프레시 토큰 초기화)!');
        },
        getAccessToken: () => {
          return get().tokens?.accessToken ?? null;
        },
        getRefreshToken: () => {
          const rt = get().tokens?.refreshToken;
          return rt ?? null;
        },
        setPhase: (phase: AuthPhase) => {
          set({ phase });
        },
        setLastProviderToken: (token: string | null) => {
          set({ lastProviderToken: token });
        },
      }),
      {
        name: 'auth',
        storage: createJSONStorage(() => require('@react-native-async-storage/async-storage').default),
        partialize: (state: AuthState) => ({
          tokens: state.tokens,
          isLoggedIn: state.isLoggedIn,
          phase: state.phase,
          role: state.role,
          loginType: state.loginType,
          lastProviderToken: state.lastProviderToken,
        }),
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.warn('auth rehydrate error', error);
          }
          // 하이드레이션 완료 플래그 세팅
          try {
            state?.setPhase?.(state.phase ?? 'checking');
          } catch {}
          try {
            // 상태 필드로 완료 표시
            (state as any)?.hydrated !== undefined && (state as any).hydrated === true;
          } catch {}
        },
        // 하이드레이션 완료 후 호출 (최신 zustand에서는 onRehydrateStorage의 반환 콜백이 완료 시점)
      }
    )
  )
);
