import { API_CONFIG, ApiResponse, ApiError } from '../configs/api';
import { AppError, ErrorType, errorHandler } from '../utils/errorHandler';

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

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
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
    
    // 요청 취소를 위한 AbortController
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          // 나중에 인증 토큰 추가할 때 여기에 추가
          // 'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
        signal: controller.signal,
      });

      // 응답이 성공적이지 않으면 에러 처리
      if (!response.ok) {
        await this.handleErrorResponse(response, endpoint);
      }

      // 204 No Content 처리
      if (response.status === 204) {
        return undefined as unknown as T;
      }

      // JSON 응답 파싱
      const data = await response.json();
      return data;
    } catch (error: any) {
      // 에러 로깅
      errorHandler.handle(error, `API Request: ${endpoint}`);
      
      // 네트워크 에러나 타임아웃 에러 처리
      if (error.name === 'AbortError') {
        throw new AppError('요청 시간이 초과되었습니다', ErrorType.NETWORK, 'TIMEOUT', 'api-timeout');
      }
      
      // 이미 AppError인 경우 그대로 던지기
      if (error instanceof AppError) {
        throw error;
      }
      
      // 기타 에러는 네트워크 에러로 처리
      throw new AppError(error.message || '네트워크 오류가 발생했습니다', ErrorType.NETWORK, 'NETWORK_ERROR', 'api-network');
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
      // 서버에서 JSON 에러 응답을 보낸 경우
      const errorData = await response.json();
      
      if (errorData.message) {
        errorMessage = errorData.message;
      }
      if (errorData.code) {
        errorCode = errorData.code;
      }
    } catch {
      // JSON 파싱 실패 시 텍스트로 시도
      try {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      } catch {
        // 텍스트도 실패하면 기본 HTTP 에러 메시지 사용
      }
    }

    // HTTP 상태 코드에 따른 에러 타입 결정
    let errorType = ErrorType.API;
    if (response.status === 401) {
      errorType = ErrorType.AUTHENTICATION;
    } else if (response.status === 403) {
      errorType = ErrorType.PERMISSION;
    } else if (response.status >= 500) {
      errorType = ErrorType.API;
    }

    throw new AppError(errorMessage, errorType, errorCode, `api-response-${response.status}`);
  }
}

// 싱글톤 인스턴스 생성 (앱 전체에서 하나의 인스턴스만 사용)
export const apiClient = new ApiClient();
