import { useState, useCallback } from 'react';
import { useCurrencyStore } from '../stores/currencyStore';
import { purchaseItemsApi, purchaseSingleItemApi } from '../services/purchaseService';
import { useOwnedItems } from './useOwnedItems';
import { handlePurchaseError } from '../utils/purchaseErrorHandler';

export interface UsePurchaseOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export interface UsePurchaseReturn {
  // 상태
  isPurchasing: boolean;
  isSuccessAlertVisible: boolean;
  isErrorAlertVisible: boolean;
  errorTitle: string;
  errorSubMessage?: string;
  
  // 액션
  purchaseItems: (itemIds: number[], expectedTotalPrice: number) => Promise<void>;
  purchaseSingleItem: (itemId: number, expectedTotalPrice: number) => Promise<void>;
  showSuccessAlert: () => void;
  hideSuccessAlert: () => void;
  showErrorAlert: (title: string, subMessage?: string) => void;
  hideErrorAlert: () => void;
  resetState: () => void;
}

export function usePurchase(options: UsePurchaseOptions = {}): UsePurchaseReturn {
  const { onSuccess, onError } = options;
  const { loadOwnedItems } = useOwnedItems();
  
  // 상태
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isSuccessAlertVisible, setIsSuccessAlertVisible] = useState(false);
  const [isErrorAlertVisible, setIsErrorAlertVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorSubMessage, setErrorSubMessage] = useState<string | undefined>(undefined);

  // 공통 구매 로직
  const executePurchase = useCallback(async (purchaseFn: () => Promise<any>) => {
    if (isPurchasing) return;
    
    try {
      setIsPurchasing(true);
      const res = await purchaseFn();

      // 스토어 동기화
      // 구매 후 보유 포인트 반영 (신규 명세: remainingPoints)
      if (typeof res?.remainingPoints === 'number') {
        useCurrencyStore.setState({ heartPoints: res.remainingPoints });
      }
      
      // 구매 후 소유 아이템 목록 동기화 (prod 환경에서만)
      if (!__DEV__) {
        try {
          await loadOwnedItems();
        } catch (error) {
          console.warn('⚠️ 소유 아이템 목록 동기화 실패:', error);
        }
      }

      setIsSuccessAlertVisible(true);
      onSuccess?.();
    } catch (error) {
      const errorState = handlePurchaseError(error);
      setErrorTitle(errorState.title);
      setErrorSubMessage(errorState.subMessage);
      setIsErrorAlertVisible(true);
      onError?.(error);
    } finally {
      setIsPurchasing(false);
    }
  }, [isPurchasing, onSuccess, onError]);

  // 다중 아이템 구매
  const purchaseItems = useCallback(async (itemIds: number[], expectedTotalPrice: number) => {
    if (!itemIds.length) {
      setErrorTitle('선택된 아이템이 없어요');
      setErrorSubMessage('구매할 아이템을 먼저 선택해 주세요.');
      setIsErrorAlertVisible(true);
      return;
    }

    await executePurchase(() => purchaseItemsApi({ itemIds, expectedTotalPrice }));
  }, [executePurchase]);

  // 단일 아이템 구매
  const purchaseSingleItem = useCallback(async (itemId: number, expectedTotalPrice: number) => {
    await executePurchase(() => purchaseSingleItemApi(itemId, expectedTotalPrice));
  }, [executePurchase]);

  // Alert 관리
  const showSuccessAlert = useCallback(() => {
    setIsSuccessAlertVisible(true);
  }, []);

  const hideSuccessAlert = useCallback(() => {
    setIsSuccessAlertVisible(false);
  }, []);

  const showErrorAlert = useCallback((title: string, subMessage?: string) => {
    setErrorTitle(title);
    setErrorSubMessage(subMessage);
    setIsErrorAlertVisible(true);
  }, []);

  const hideErrorAlert = useCallback(() => {
    setIsErrorAlertVisible(false);
  }, []);

  const resetState = useCallback(() => {
    setIsPurchasing(false);
    setIsSuccessAlertVisible(false);
    setIsErrorAlertVisible(false);
    setErrorTitle('');
    setErrorSubMessage(undefined);
  }, []);

  return {
    // 상태
    isPurchasing,
    isSuccessAlertVisible,
    isErrorAlertVisible,
    errorTitle,
    errorSubMessage,
    
    // 액션
    purchaseItems,
    purchaseSingleItem,
    showSuccessAlert,
    hideSuccessAlert,
    showErrorAlert,
    hideErrorAlert,
    resetState,
  };
}
