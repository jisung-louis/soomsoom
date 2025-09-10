import { API_CONFIG, ApiResponse, ApiError } from '../configs/api';
import { AppError, ErrorType, errorHandler } from '../utils/errorHandler';
import { refreshAccessToken, clearTokens } from './authService';
import type { AuthTokens } from './authService';

/**
 * API 요청을 통합 관리하는 클라이언트
 * 
 * 🎯 왜 이렇게 하나요?
 * - 모든 API 요청이 같은 방식으로 처리돼요
 * - 에러 처리, 타임아웃, 헤더 설정 등을 한 곳에서 관리
 * - 나중에 인증 토큰이나 로깅을 추가하기 쉬워요
 */

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshInFlight: Promise<AuthTokens | null> | null = null;
  private onTokensUpdated: ((tokens: AuthTokens) => Promise<void> | void) | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * 토큰 설정 (로그인 시 호출)
   */
  setTokens(accessToken: string, refreshToken?: string | null) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken ?? null;
    console.log('🔐 ApiClient에 토큰 설정 완료');
  }

  /**
   * 토큰 초기화 (로그아웃 시 호출)
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    console.log('🗑️ ApiClient에서 토큰 초기화 완료');
  }

  /**
   * 토큰 갱신 시 호출될 콜백 등록 (스토어/영속화 동기화 용도)
   */
  registerOnTokensUpdated(callback: (tokens: AuthTokens) => Promise<void> | void) {
    this.onTokensUpdated = callback;
  }

  /**
   * 현재 액세스 토큰 가져오기
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * GET 요청 - 서버 응답을 직접 반환 (ApiResponse 래퍼 없음)
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST 요청 - 서버 응답을 직접 반환 (ApiResponse 래퍼 없음)
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 요청 - 서버 응답을 직접 반환 (ApiResponse 래퍼 없음)
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 요청 - 서버 응답을 직접 반환 (ApiResponse 래퍼 없음)
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * 실제 API 요청을 처리하는 메인 함수
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const makeController = () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeout);
      return { controller, timer };
    };
    let { controller, timer } = makeController();

    try {
      // 인증 헤더 준비
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      // 액세스 토큰이 있으면 Authorization 헤더 추가
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        console.log('🔐 API 요청에 인증 토큰 포함:', endpoint);
      }

      let response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      // 응답이 성공적이지 않으면 에러 처리
      if (!response.ok) {
        // 401 Unauthorized 에러이고 리프레시 토큰이 있으면 토큰 갱신 시도
        if (response.status === 401 && this.refreshToken) {
          console.log('🔄 401 에러 발생, 토큰 갱신 시도...');
          
          try {
            // 동시성 제어: 갱신 중이면 기존 Promise 대기
            if (!this.refreshInFlight) {
              this.refreshInFlight = refreshAccessToken(this.refreshToken);
            }
            const newTokens = await this.refreshInFlight;
            this.refreshInFlight = null;
            
            if (newTokens) {
              // 토큰 갱신 성공, 새로운 토큰으로 재요청
              this.setTokens(newTokens.accessToken, newTokens.refreshToken);
              // 스토어/영속화 동기화 콜백 호출 (있으면)
              if (this.onTokensUpdated) {
                try { await this.onTokensUpdated(newTokens); } catch (e) { console.warn('onTokensUpdated 실패:', e); }
              }
              
              // 원래 요청을 새로운 토큰으로 재시도 (새 컨트롤러/타이머 생성)
              clearTimeout(timer);
              ({ controller, timer } = makeController());
              const retryHeaders = {
                ...headers,
                'Authorization': `Bearer ${newTokens.accessToken}`,
              };
              
              const retryResponse = await fetch(url, {
                ...options,
                headers: retryHeaders,
                signal: controller.signal,
              });
              
              if (retryResponse.ok) {
                console.log('✅ 토큰 갱신 후 재요청 성공');
                if (retryResponse.status === 204) {
                  return undefined as unknown as T;
                }
                const contentType = retryResponse.headers.get('content-type') || '';
                const retryData = contentType.includes('application/json') ? await retryResponse.json() : (undefined as unknown as T);
                return retryData as T;
              } else {
                // 재요청도 실패하면 에러 처리
                await this.handleErrorResponse(retryResponse, endpoint);
              }
            } else {
              // 토큰 갱신 실패, 로그아웃 처리
              console.log('❌ 토큰 갱신 실패, 로그아웃 처리');
              this.clearTokens();
              await clearTokens(); // SecureStore에서도 삭제
              throw new AppError('인증이 만료되었습니다. 다시 로그인해주세요.', ErrorType.AUTHENTICATION, 'TOKEN_REFRESH_FAILED', 'api-token-refresh');
            }
          } catch (refreshError) {
            console.error('❌ 토큰 갱신 중 에러:', refreshError);
            this.clearTokens();
            await clearTokens();
            throw new AppError('인증이 만료되었습니다. 다시 로그인해주세요.', ErrorType.AUTHENTICATION, 'TOKEN_REFRESH_ERROR', 'api-token-refresh-error');
          }
        } else {
          // 401이 아니거나 리프레시 토큰이 없으면 일반 에러 처리
          await this.handleErrorResponse(response, endpoint);
        }
      }

      // 204 No Content 처리
      if (response.status === 204) {
        return undefined as unknown as T;
      }

      // JSON 응답 파싱 (content-type 확인)
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : (undefined as unknown as T);
      return data as T;
    } catch (error: any) {
      // 에러 로깅
      errorHandler.handle(error, `API Request: ${endpoint}`);
      
      // 이미 AppError인 경우 그대로 던지기
      if (error instanceof AppError) {
        throw error;
      }
      
      // 네트워크 에러나 타임아웃 에러 처리
      if (error.name === 'AbortError') {
        throw new AppError('요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.', ErrorType.NETWORK, 'TIMEOUT', 'api-timeout');
      }
      
      // 네트워크 연결 에러
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        throw new AppError('네트워크 연결을 확인해주세요.', ErrorType.NETWORK, 'NETWORK_CONNECTION', 'api-network-connection');
      }
      
      // DNS 에러
      if (error.message?.includes('getaddrinfo ENOTFOUND')) {
        throw new AppError('서버에 연결할 수 없습니다. 네트워크 설정을 확인해주세요.', ErrorType.NETWORK, 'DNS_ERROR', 'api-dns-error');
      }
      
      // 기타 에러는 네트워크 에러로 처리
      throw new AppError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', ErrorType.NETWORK, 'NETWORK_ERROR', 'api-network');
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * HTTP 에러 응답 처리
   */
  private async handleErrorResponse(response: Response, endpoint: string): Promise<never> {
    let errorMessage = `HTTP ${response.status}`;
    let errorCode: string | undefined;
    
    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
        if (errorData?.code) errorCode = errorData.code;
      } else {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      }
    } catch {
      // 파싱 실패 시 기본 메시지 유지
    }

    // HTTP 상태 코드에 따른 에러 타입과 사용자 친화적 메시지 결정
    let errorType = ErrorType.API;
    let userFriendlyMessage = errorMessage;
    
    switch (response.status) {
      case 400:
        errorType = ErrorType.VALIDATION;
        userFriendlyMessage = '잘못된 요청입니다. 입력 정보를 확인해주세요.';
        break;
      case 401:
        errorType = ErrorType.AUTHENTICATION;
        userFriendlyMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
        break;
      case 403:
        errorType = ErrorType.PERMISSION;
        userFriendlyMessage = '접근 권한이 없습니다.';
        break;
      case 404:
        errorType = ErrorType.API;
        userFriendlyMessage = '요청한 정보를 찾을 수 없습니다.';
        break;
      case 409:
        errorType = ErrorType.VALIDATION;
        userFriendlyMessage = '이미 존재하는 정보입니다.';
        break;
      case 422:
        errorType = ErrorType.VALIDATION;
        userFriendlyMessage = '입력한 정보가 올바르지 않습니다.';
        break;
      case 429:
        errorType = ErrorType.API;
        userFriendlyMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
        break;
      case 500:
        errorType = ErrorType.API;
        userFriendlyMessage = '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        break;
      case 502:
      case 503:
      case 504:
        errorType = ErrorType.API;
        userFriendlyMessage = '서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
        break;
      default:
        if (response.status >= 500) {
          errorType = ErrorType.API;
          userFriendlyMessage = '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (response.status >= 400) {
          errorType = ErrorType.VALIDATION;
          userFriendlyMessage = '요청을 처리할 수 없습니다.';
        }
    }

    console.error(`API 에러 [${response.status}]:`, {
      endpoint,
      message: errorMessage,
      userFriendlyMessage,
      errorCode
    });

    throw new AppError(userFriendlyMessage, errorType, errorCode, `api-response-${response.status}`);
  }
}

// 싱글톤 인스턴스 생성 (앱 전체에서 하나의 인스턴스만 사용)
export const apiClient = new ApiClient();
