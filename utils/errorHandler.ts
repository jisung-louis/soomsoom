/**
 * 환경별 에러 처리 유틸리티
 * 
 * 개발 환경에서는 상세한 에러 정보를,
 * 프로덕션 환경에서는 사용자 친화적인 메시지를 제공합니다.
 */

import { errorHandler as envErrorHandler, isDevelopment } from '../configs/environment';
import { logger } from './logger';

/**
 * 에러 타입 정의
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 커스텀 에러 클래스
 */
export class AppError extends Error {
  public type: ErrorType;
  public code?: string;
  public context?: string;
  public originalError?: Error;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code?: string,
    context?: string,
    originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.context = context;
    this.originalError = originalError;
  }
}

/**
 * 에러 처리 결과 타입
 */
export interface ErrorResult {
  message: string;
  details?: any;
  context?: string;
  shouldRetry?: boolean;
  userAction?: string;
}

/**
 * 에러 처리 클래스
 */
class ErrorHandler {
  /**
   * 에러를 처리하고 사용자에게 표시할 메시지를 반환
   */
  handle(error: Error | AppError, context?: string): ErrorResult {
    // 에러 로깅
    this.logError(error, context);

    // 개발 환경: 상세한 에러 정보
    if (isDevelopment) {
      return envErrorHandler.development(error, context);
    }

    // 프로덕션 환경: 사용자 친화적 메시지
    return this.getUserFriendlyMessage(error, context);
  }

  /**
   * 에러 로깅
   */
  private logError(error: Error | AppError, context?: string): void {
    if (error instanceof AppError) {
      logger.error(`[${error.type}] ${error.message}`, {
        code: error.code,
        context: error.context || context,
        originalError: error.originalError,
      });
    } else {
      logger.error(`[UNKNOWN] ${error.message}`, {
        context,
        stack: error.stack,
      });
    }
  }

  /**
   * 사용자 친화적 에러 메시지 생성
   */
  private getUserFriendlyMessage(error: Error | AppError, context?: string): ErrorResult {
    if (error instanceof AppError) {
      switch (error.type) {
        case ErrorType.NETWORK:
          return {
            message: '인터넷 연결을 확인해주세요.',
            shouldRetry: true,
            userAction: '네트워크 연결 확인 후 다시 시도해주세요.',
          };

        case ErrorType.API:
          return {
            message: '서버에 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
            shouldRetry: true,
            userAction: '잠시 후 다시 시도해주세요.',
          };

        case ErrorType.VALIDATION:
          return {
            message: '입력한 정보를 다시 확인해주세요.',
            shouldRetry: false,
            userAction: '입력 정보를 확인하고 다시 시도해주세요.',
          };

        case ErrorType.AUTHENTICATION:
          return {
            message: '로그인이 필요해요.',
            shouldRetry: false,
            userAction: '다시 로그인해주세요.',
          };

        case ErrorType.PERMISSION:
          return {
            message: '권한이 필요해요.',
            shouldRetry: false,
            userAction: '앱 설정에서 권한을 허용해주세요.',
          };

        default:
          return {
            message: '앗, 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
            shouldRetry: true,
            userAction: '잠시 후 다시 시도해주세요.',
          };
      }
    }

    // 일반 에러
    return {
      message: '앗, 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
      shouldRetry: true,
      userAction: '잠시 후 다시 시도해주세요.',
    };
  }

  /**
   * 네트워크 에러 생성
   */
  createNetworkError(message: string, originalError?: Error): AppError {
    return new AppError(message, ErrorType.NETWORK, 'NETWORK_ERROR', 'network', originalError);
  }

  /**
   * API 에러 생성
   */
  createApiError(message: string, code?: string, originalError?: Error): AppError {
    return new AppError(message, ErrorType.API, code, 'api', originalError);
  }

  /**
   * 검증 에러 생성
   */
  createValidationError(message: string, code?: string): AppError {
    return new AppError(message, ErrorType.VALIDATION, code, 'validation');
  }

  /**
   * 인증 에러 생성
   */
  createAuthenticationError(message: string, code?: string): AppError {
    return new AppError(message, ErrorType.AUTHENTICATION, code, 'authentication');
  }

  /**
   * 권한 에러 생성
   */
  createPermissionError(message: string, code?: string): AppError {
    return new AppError(message, ErrorType.PERMISSION, code, 'permission');
  }
}

// 싱글톤 인스턴스 생성
export const errorHandler = new ErrorHandler();

/**
 * 에러 처리를 위한 헬퍼 함수들
 */
export const handleError = (error: Error | AppError, context?: string): ErrorResult => {
  return errorHandler.handle(error, context);
};

export const createNetworkError = (message: string, originalError?: Error): AppError => {
  return errorHandler.createNetworkError(message, originalError);
};

export const createApiError = (message: string, code?: string, originalError?: Error): AppError => {
  return errorHandler.createApiError(message, code, originalError);
};

export const createValidationError = (message: string, code?: string): AppError => {
  return errorHandler.createValidationError(message, code);
};

export const createAuthenticationError = (message: string, code?: string): AppError => {
  return errorHandler.createAuthenticationError(message, code);
};

export const createPermissionError = (message: string, code?: string): AppError => {
  return errorHandler.createPermissionError(message, code);
};

/**
 * 에러 상세 정보 타입
 */
export interface ErrorDetails {
  title: string;
  message: string;
  type?: ErrorType;
  code?: string;
}

/**
 * 에러를 파싱하여 상세 정보를 반환
 */
export function parseError(error: any): ErrorDetails {
  // Error 객체인 경우
  if (error instanceof Error) {
    // 하트 포인트 부족 에러
    // 구매: 하트/포인트 부족 케이스 매칭 (서버 코드/원문 우선)

      // 다양한 래핑(AppError, AxiosError) 상황에서 서버 페이로드를 최대한 끌어옴
      const anyErr = error as any;
      const resp = anyErr?.response || anyErr?.originalError?.response || anyErr?.cause?.response;
      const data = resp?.data || anyErr?.response?.data || anyErr?.originalError?.response?.data;
      const serverCode = data?.errorCode;
      const serverMessage = (data?.message || anyErr?.serverMessage || anyErr?.message || '').toString();
      const isInsufficientPoints =
        serverCode === 'INSUFFICIENT_POINTS' ||
        /포인트.*부족/.test(serverMessage) ||
        /보유한\s*포인트가\s*부족/.test(serverMessage) ||
        /하트\s*포인트\s*부족/.test(serverMessage);

      if (isInsufficientPoints) {
        return {
          title: '하트 포인트가 부족해요',
          message: '',
          type: ErrorType.VALIDATION,
          code: 'INSUFFICIENT_POINTS',
        };
      }
    if (error.message.includes('포인트가 부족')) {
      // "하트 포인트 부족: 현재 100, 필요 300" 형태에서 부족한 포인트 추출
      const match = error.message.match(/현재 (\d+), 필요 (\d+)/);
      if (match) {
        const current = parseInt(match[1]);
        const needed = parseInt(match[2]);
        const shortage = needed - current;
        return {
          title: `하트 **${shortage}**개가 부족해요`,
          message: '', // 메시지는 없음
          type: ErrorType.VALIDATION,
          code: 'INSUFFICIENT_POINTS'
        };
      }
      
      // 매칭되지 않는 경우 기본 메시지
      return {
        title: '하트 포인트가 부족해요',
        message: '',
        type: ErrorType.VALIDATION,
        code: 'INSUFFICIENT_POINTS'
      };
    }
    
    // 가격 불일치 에러
    if (error.message.includes('가격 불일치')) {
      return {
        title: '가격 정보 오류',
        message: error.message,
        type: ErrorType.VALIDATION,
        code: 'PRICE_MISMATCH'
      };
    }
    
    // 일반 에러
    return {
      title: '구매 실패',
      message: error.message,
      type: ErrorType.UNKNOWN
    };
  }
  
  // 문자열 에러인 경우
  if (typeof error === 'string') {
    return {
      title: '구매 실패',
      message: error,
      type: ErrorType.UNKNOWN
    };
  }
  
  // 기타 에러
  return {
    title: '알 수 없는 오류',
    message: '구매 중 문제가 발생했어요.',
    type: ErrorType.UNKNOWN
  };
}