import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AuthResponse, AuthTokens, AuthUser } from '../services/authService';
import { clearTokens, persistTokens } from '../services/authService';

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoggedIn: boolean;
  setSession: (payload: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools((set, get) => ({
    user: null,
    tokens: null,
    isLoggedIn: false,
    setSession: async (payload: AuthResponse) => {
      console.log('🔐 Zustand에 로그인 정보 저장 중...', payload);
      await persistTokens(payload.tokens);
      set({ user: payload.user, tokens: payload.tokens, isLoggedIn: true });
      console.log('✅ Zustand에 로그인 정보 저장 완료!', { 
        user: payload.user, 
        isLoggedIn: true,
        hasTokens: !!payload.tokens 
      });
    },
    logout: async () => {
      console.log('🚪 로그아웃 시작...');
      await clearTokens();
      set({ user: null, tokens: null, isLoggedIn: false });
      console.log('✅ 로그아웃 완료!');
    },
  }))
);
