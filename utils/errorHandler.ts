/**
 * 통합 에러 처리 시스템
 * 
 * 🎯 왜 이렇게 하나요?
 * - 모든 에러를 한 곳에서 처리해서 일관성 있게 관리
 * - 사용자에게 보여주는 에러 메시지를 통일
 * - 개발자가 에러를 쉽게 디버깅할 수 있게 로깅
 */

export interface ErrorDetails {
  title: string;
  message: string;
  subMessage?: string;
  code?: string;
  shouldRetry?: boolean;
}

export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API', 
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  UNKNOWN = 'UNKNOWN'
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly shouldRetry: boolean;

  constructor(
    message: string, 
    type: ErrorType = ErrorType.UNKNOWN, 
    code?: string,
    shouldRetry: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.shouldRetry = shouldRetry;
  }
}

/**
 * 에러를 분석해서 사용자 친화적인 메시지로 변환
 */
export function parseError(error: any): ErrorDetails {
  // 이미 AppError인 경우
  if (error instanceof AppError) {
    return {
      title: getErrorTitle(error.type),
      message: error.message,
      shouldRetry: error.shouldRetry,
      code: error.code
    };
  }

  // 네트워크 에러
  if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
    return {
      title: '연결이 지연되고 있어요',
      message: '네트워크 상태를 확인하고 잠시 후 다시 시도해 주세요.',
      shouldRetry: true,
      code: 'NETWORK_TIMEOUT'
    };
  }

  // HTTP 에러
  if (error?.message?.startsWith('HTTP')) {
    const statusCode = error.message.match(/HTTP (\d+)/)?.[1];
    return getHttpErrorDetails(parseInt(statusCode || '0'), error.message);
  }

  // API 에러 (서버에서 보낸 에러 메시지)
  if (error?.message) {
    return parseApiErrorMessage(error.message);
  }

  // 알 수 없는 에러
  return {
    title: '알 수 없는 오류가 발생했어요',
    message: '잠시 후 다시 시도해 주세요.',
    shouldRetry: true,
    code: 'UNKNOWN'
  };
}

/**
 * HTTP 상태 코드에 따른 에러 메시지
 */
function getHttpErrorDetails(statusCode: number, originalMessage: string): ErrorDetails {
  switch (statusCode) {
    case 400:
      return {
        title: '잘못된 요청이에요',
        message: '입력한 정보를 다시 확인해 주세요.',
        code: 'BAD_REQUEST'
      };
    case 401:
      return {
        title: '로그인이 필요해요',
        message: '다시 로그인해 주세요.',
        code: 'UNAUTHORIZED'
      };
    case 403:
      return {
        title: '권한이 없어요',
        message: '이 작업을 수행할 권한이 없습니다.',
        code: 'FORBIDDEN'
      };
    case 404:
      return {
        title: '찾을 수 없어요',
        message: '요청한 정보를 찾을 수 없습니다.',
        code: 'NOT_FOUND'
      };
    case 500:
    case 502:
    case 503:
      return {
        title: '서버에 문제가 있어요',
        message: '잠시 후 다시 시도해 주세요.',
        shouldRetry: true,
        code: 'SERVER_ERROR'
      };
    default:
      return {
        title: '요청을 처리할 수 없어요',
        message: originalMessage || '앱을 최신으로 유지하거나 다시 시도해 주세요.',
        shouldRetry: true,
        code: 'HTTP_ERROR'
      };
  }
}

/**
 * API 에러 메시지 파싱 (기존 purchaseErrorHandler 로직 통합)
 */
function parseApiErrorMessage(message: string): ErrorDetails {
  if (message.includes('INSUFFICIENT_HEARTS')) {
    return {
      title: '하트가 부족해요',
      message: '하트를 충전한 뒤 다시 구매해 주세요.',
      code: 'INSUFFICIENT_HEARTS'
    };
  }
  
  if (message.includes('INVALID_ITEM')) {
    return {
      title: '유효하지 않은 아이템',
      message: '목록을 새로고침하고 다시 시도해 주세요.',
      code: 'INVALID_ITEM'
    };
  }
  
  if (message.includes('ALREADY_OWNED')) {
    return {
      title: '이미 보유한 아이템이에요',
      message: '보유목록을 확인해 주세요.',
      code: 'ALREADY_OWNED'
    };
  }

  // 기본 API 에러
  return {
    title: '요청 처리 중 오류가 발생했어요',
    message: message,
    shouldRetry: true,
    code: 'API_ERROR'
  };
}

/**
 * 에러 타입에 따른 제목 반환
 */
function getErrorTitle(type: ErrorType): string {
  switch (type) {
    case ErrorType.NETWORK:
      return '네트워크 연결 문제';
    case ErrorType.API:
      return '서버 오류';
    case ErrorType.VALIDATION:
      return '입력 정보 오류';
    case ErrorType.AUTHENTICATION:
      return '인증 오류';
    case ErrorType.PERMISSION:
      return '권한 오류';
    default:
      return '알 수 없는 오류';
  }
}

/**
 * 에러 로깅 (개발 환경에서만)
 */
export function logError(error: any, context?: string): void {
  if (__DEV__) {
    console.group(`🚨 Error${context ? ` in ${context}` : ''}`);
    console.error('Error:', error);
    console.error('Stack:', error?.stack);
    console.groupEnd();
  }
}
