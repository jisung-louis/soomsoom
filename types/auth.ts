// 우리 앱에서는 액세스 토큰과 리프레시 토큰만 사용하므로 이 타입만 사용
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string | null;
}

export type AuthPhase = 'checking' | 'logged_in' | 'logged_out';