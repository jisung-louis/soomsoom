import { parseError, ErrorDetails } from './errorHandler';

/**
 * 구매 관련 에러 처리 (기존 호환성 유지)
 * @deprecated 새로운 통합 에러 핸들러 사용을 권장합니다
 */
export interface PurchaseErrorState {
  title: string;
  subMessage?: string;
}

export function handlePurchaseError(error: any): PurchaseErrorState {
  const errorDetails: ErrorDetails = parseError(error);
  
  return {
    title: errorDetails.title,
    subMessage: errorDetails.message
  };
}
