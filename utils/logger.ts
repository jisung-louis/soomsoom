/**
 * 환경별 로깅 유틸리티
 * 
 * 개발 환경에서는 상세한 로그를,
 * 프로덕션 환경에서는 최소한의 로그만 출력합니다.
 */

import { logger as envLogger, isDevelopment } from '../configs/environment';

/**
 * 로그 레벨 정의
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 로거 클래스
 */
class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;
  }

  /**
   * 디버그 로그 (개발 환경에서만)
   */
  debug(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      envLogger.debug(message, ...args);
    }
  }

  /**
   * 정보 로그 (개발 환경에서만)
   */
  info(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.INFO) {
      envLogger.info(message, ...args);
    }
  }

  /**
   * 경고 로그 (개발 환경에서만)
   */
  warn(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.WARN) {
      envLogger.warn(message, ...args);
    }
  }

  /**
   * 에러 로그 (모든 환경에서)
   */
  error(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.ERROR) {
      envLogger.error(message, ...args);
    }
  }

  /**
   * 성능 측정 로그 (개발 환경에서만)
   */
  performance(label: string, startTime: number): void {
    if (isDevelopment) {
      const duration = Date.now() - startTime;
      this.debug(`⏱️ [PERFORMANCE] ${label}: ${duration}ms`);
    }
  }

  /**
   * API 요청 로그 (개발 환경에서만)
   */
  apiRequest(method: string, url: string, data?: any): void {
    if (isDevelopment) {
      this.debug(`🌐 [API REQUEST] ${method} ${url}`, data);
    }
  }

  /**
   * API 응답 로그 (개발 환경에서만)
   */
  apiResponse(method: string, url: string, status: number, data?: any): void {
    if (isDevelopment) {
      const statusEmoji = status >= 200 && status < 300 ? '✅' : '❌';
      this.debug(`${statusEmoji} [API RESPONSE] ${method} ${url} - ${status}`, data);
    }
  }

  /**
   * 상태 변경 로그 (개발 환경에서만)
   */
  stateChange(storeName: string, action: string, prevState: any, nextState: any): void {
    if (isDevelopment) {
      this.debug(`🔄 [STATE CHANGE] ${storeName}.${action}`, {
        prev: prevState,
        next: nextState,
      });
    }
  }

  /**
   * 사용자 액션 로그 (개발 환경에서만)
   */
  userAction(action: string, data?: any): void {
    if (isDevelopment) {
      this.debug(`👤 [USER ACTION] ${action}`, data);
    }
  }
}

// 싱글톤 인스턴스 생성
export const logger = new Logger();

/**
 * 성능 측정을 위한 헬퍼 함수
 */
export const measurePerformance = <T>(label: string, fn: () => T): T => {
  const startTime = Date.now();
  const result = fn();
  logger.performance(label, startTime);
  return result;
};

/**
 * 비동기 성능 측정을 위한 헬퍼 함수
 */
export const measureAsyncPerformance = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
  const startTime = Date.now();
  const result = await fn();
  logger.performance(label, startTime);
  return result;
};

/**
 * 개발 환경에서만 실행되는 함수
 */
export const devOnly = (fn: () => void): void => {
  if (isDevelopment) {
    fn();
  }
};

/**
 * 프로덕션 환경에서만 실행되는 함수
 */
export const prodOnly = (fn: () => void): void => {
  if (!isDevelopment) {
    fn();
  }
};
