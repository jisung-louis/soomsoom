import { useState, useCallback } from 'react';
import { useCurrencyStore } from '../stores/currencyStore';
import { useCartStore } from '../stores/cartStore';
import { 
  purchaseItemsApi, 
  purchaseSingleItemApi, 
  addItemsToCart, 
  getCart, 
  removeItemFromCart,
  clearAllCartItems as clearAllCartItemsService,
  purchaseCart 
} from '../services/purchaseService';
import { useOwnedItems } from './useOwnedItems';
import { handlePurchaseError } from '../utils/purchaseErrorHandler';
import { useAppConfigStore } from '../stores/appConfigStore';

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
  
  // 장바구니 관련
  addToCart: (itemIds: number[]) => Promise<void>;
  getCartItems: () => Promise<any>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearAllCartItems: () => Promise<void>;
  purchaseCartItems: (expectedTotalPrice: number) => Promise<void>;
  
  // 장바구니 상태 (Dev 환경에서만 사용)
  cartItems: any[];
  cartTotalPrice: number;
  clearCart: () => void;
}

export function usePurchase(options: UsePurchaseOptions = {}): UsePurchaseReturn {
  const { onSuccess, onError } = options;
  const { loadOwnedItems } = useOwnedItems();
  const { useMockApi } = useAppConfigStore.getState();
  
  // 장바구니 상태 (Dev 환경에서만 사용)
  const cartItems = useCartStore(state => state.items);
  const cartTotalPrice = useCartStore(state => state.totalPrice);
  const clearCart = useCartStore(state => state.clearCart);
  
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
      
      // 구매 후 소유 아이템 목록 동기화 (모킹이 아닐 때만)
      if (!useMockApi) {
        try {
          await loadOwnedItems();
        } catch (error) {
          console.warn('⚠️ 소유 아이템 목록 동기화 실패:', error);
        }
      }

      setIsSuccessAlertVisible(true);
      onSuccess?.();
    } catch (error) {
      console.log('❌ 구매 에러 발생:', error);
      const errorState = handlePurchaseError(error);
      console.log('🔍 파싱된 에러 상태:', errorState);
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

  // 장바구니 관련 함수들
  const addToCart = useCallback(async (itemIds: number[]) => {
    if (!itemIds.length) {
      setErrorTitle('선택된 아이템이 없어요');
      setErrorSubMessage('장바구니에 담을 아이템을 먼저 선택해 주세요.');
      setIsErrorAlertVisible(true);
      return;
    }

    try {
      setIsPurchasing(true);
      const response = await addItemsToCart({ itemIds });
      console.log('🛒 장바구니에 추가됨:', response);
      onSuccess?.();
    } catch (error) {
      console.log('❌ 장바구니 추가 에러:', error);
      const errorState = handlePurchaseError(error);
      setErrorTitle(errorState.title);
      setErrorSubMessage(errorState.subMessage);
      setIsErrorAlertVisible(true);
      onError?.(error);
    } finally {
      setIsPurchasing(false);
    }
  }, [onSuccess, onError]);

  const getCartItems = useCallback(async () => {
    try {
      const response = await getCart();
      console.log('🛒 장바구니 조회:', response);
      return response;
    } catch (error) {
      console.log('❌ 장바구니 조회 에러:', error);
      throw error;
    }
  }, []);

  const removeFromCart = useCallback(async (itemId: number) => {
    try {
      setIsPurchasing(true);
      const response = await removeItemFromCart(itemId);
      console.log('🛒 장바구니에서 제거됨:', response);
      onSuccess?.();
    } catch (error) {
      console.log('❌ 장바구니 제거 에러:', error);
      const errorState = handlePurchaseError(error);
      setErrorTitle(errorState.title);
      setErrorSubMessage(errorState.subMessage);
      setIsErrorAlertVisible(true);
      onError?.(error);
    } finally {
      setIsPurchasing(false);
    }
  }, [onSuccess, onError]);

  const purchaseCartItems = useCallback(async (expectedTotalPrice: number) => {
    try {
      setIsPurchasing(true);
      const response = await purchaseCart({ expectedTotalPrice });
      
      // 구매 후 보유 포인트 반영
      if (typeof response?.remainingPoints === 'number') {
        useCurrencyStore.setState({ heartPoints: response.remainingPoints });
      }
      
      // 구매 후 소유 아이템 목록 동기화 (모킹이 아닐 때만)
      if (!useMockApi) {
        try {
          await loadOwnedItems();
        } catch (error) {
          console.warn('⚠️ 소유 아이템 목록 동기화 실패:', error);
        }
      }

      console.log('✅ 장바구니 구매 완료:', response);
      setIsSuccessAlertVisible(true);
      onSuccess?.();
    } catch (error) {
      console.log('❌ 장바구니 구매 에러:', error);
      const errorState = handlePurchaseError(error);
      setErrorTitle(errorState.title);
      setErrorSubMessage(errorState.subMessage);
      setIsErrorAlertVisible(true);
      onError?.(error);
    } finally {
      setIsPurchasing(false);
    }
  }, [onSuccess, onError, loadOwnedItems]);

  const clearAllCartItems = useCallback(async () => {
    try {
      console.log('🛒 장바구니 전체 초기화 시작');
      await clearAllCartItemsService();
      console.log('✅ 장바구니 전체 초기화 완료');
    } catch (error) {
      console.warn('⚠️ 장바구니 전체 초기화 실패:', error);
      throw error;
    }
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
    
    // 장바구니 관련
    addToCart,
    getCartItems,
    removeFromCart,
    clearAllCartItems,
    purchaseCartItems,
    
    // 장바구니 상태 (Dev 환경에서만 사용)
    cartItems,
    cartTotalPrice,
    clearCart,
  };
}
