/**
 * 스토어 간 통합 액션 정의
 * 
 * 🎯 왜 이렇게 하나요?
 * - 여러 스토어에 걸친 복잡한 비즈니스 로직을 한 곳에서 관리
 * - 스토어 간 의존성을 명확하게 표현
 * - 원자적(atomic) 작업 보장
 */

import { useCurrencyStore } from './currencyStore';
import { useRoomStore } from './roomStore';
import { usePlayStore } from './playStore';
import { INITIAL_CURRENCY_STATE, INITIAL_ROOM_STATE, INITIAL_PLAY_STATE } from '../constants/initialStates';

/**
 * 🚨 개발용 로컬 구매 시뮬레이터 (오프라인 전용)
 * 
 * ⚠️ 주의: 이 액션들은 서버 권위를 무시하고 로컬에서 바로 상태를 변경합니다.
 * 실제 서비스에서는 사용하지 마세요!
 * 
 * 실제 구매 플로우:
 * 1. services/purchaseService.ts 호출
 * 2. 서버 응답으로 zustand 스토어 동기화
 * 
 * @deprecated 실제 서비스에서는 사용 금지
 */
export const createLocalPurchaseSimulator = () => {
  const purchaseItem = (itemId: number, price: number, autoPlace?: { category: string; position?: any }) => {
    // 1. 화폐 차감 (getState()로 최신 상태 접근)
    const { spendHeartPoints } = useCurrencyStore.getState();
    const success = spendHeartPoints(price);
    if (!success) {
      throw new Error('INSUFFICIENT_HEARTS');
    }

    // 2. 아이템 소유권 추가
    const { addOwnedItem } = useRoomStore.getState();
    addOwnedItem(itemId);

    // 3. 자동 배치 (선택사항)
    if (autoPlace) {
      const { placeItem } = useRoomStore.getState();
      placeItem(itemId, autoPlace.category as any);
    }

    return true;
  };

  const purchaseMultipleItems = (items: Array<{ id: number; price: number }>, autoPlaceItems?: Array<{ id: number; category: string }>) => {
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    
    // 1. 총 가격 확인 및 차감
    const { spendHeartPoints } = useCurrencyStore.getState();
    const success = spendHeartPoints(totalPrice);
    if (!success) {
      throw new Error('INSUFFICIENT_HEARTS');
    }

    // 2. 모든 아이템 소유권 추가
    const { addOwnedItem, placeItem } = useRoomStore.getState();
    items.forEach(item => addOwnedItem(item.id));

    // 3. 자동 배치 (선택사항)
    if (autoPlaceItems) {
      autoPlaceItems.forEach(item => placeItem(item.id, item.category as any));
    }

    return true;
  };

  return {
    purchaseItem,
    purchaseMultipleItems,
  };
};

/**
 * ✅ 실제 서비스용 구매 액션 (서버 권위)
 * 
 * 이 액션들은 서버 응답을 받은 후에만 스토어를 업데이트합니다.
 * 실제 구매 플로우에서 사용하세요.
 */
export const createServerPurchaseActions = () => {
  /**
   * 서버 응답으로 화폐 상태 동기화
   */
  const syncCurrencyFromServer = (heartPoints: number) => {
    useCurrencyStore.setState({ heartPoints });
  };

  /**
   * 서버 응답으로 방 아이템 상태 동기화
   */
  const syncRoomItemsFromServer = (ownedItems: number[], placedItems: any) => {
    useRoomStore.setState({ ownedItems, placedItems });
  };

  /**
   * 서버 구매 응답 전체 동기화
   */
  const syncPurchaseResponseFromServer = (response: {
    heartPoints: number;
    ownedItems: number[];
    placedItems: any;
  }) => {
    syncCurrencyFromServer(response.heartPoints);
    syncRoomItemsFromServer(response.ownedItems, response.placedItems);
  };

  return {
    syncCurrencyFromServer,
    syncRoomItemsFromServer,
    syncPurchaseResponseFromServer,
  };
};

/**
 * 📝 실제 구매 플로우 사용 예시
 * 
 * // 올바른 구매 플로우 (서버 권위)
 * const { syncPurchaseResponseFromServer } = useServerPurchaseActions();
 * 
 * try {
 *   const response = await purchaseItemsApi([1, 2, 3]);
 *   syncPurchaseResponseFromServer(response); // 서버 응답으로 동기화
 * } catch (error) {
 *   // 에러 처리
 * }
 * 
 * // ❌ 잘못된 구매 플로우 (로컬 시뮬레이터)
 * const { purchaseItem } = useLocalPurchaseSimulator();
 * purchaseItem(1, 100); // 서버 권위 무시!
 */

/**
 * 보상 관련 통합 액션
 * - 감정 기록 보상
 * - 명상 완료 보상
 * - 연속 기록 보너스
 */
export const createRewardActions = () => {
  const giveEmotionReward = () => {
    const { giveEmotionRecordReward } = useCurrencyStore.getState();
    giveEmotionRecordReward();
  };

  const giveMeditationCompleteReward = () => {
    const { giveMeditationReward } = useCurrencyStore.getState();
    giveMeditationReward();
  };

  const giveStreakReward = (streakDays: number) => {
    const { giveStreakBonus } = useCurrencyStore.getState();
    giveStreakBonus(streakDays);
  };

  const giveDailyLoginReward = () => {
    const { giveDailyReward } = useCurrencyStore.getState();
    giveDailyReward();
  };

  return {
    giveEmotionReward,
    giveMeditationCompleteReward,
    giveStreakReward,
    giveDailyLoginReward,
  };
};

/**
 * 즐겨찾기 관련 통합 액션
 * - 컨텐츠 즐겨찾기 토글
 * - 강사 팔로우 토글
 */
export const createFavoriteActions = () => {
  const toggleContentFavorite = (contentId: number) => {
    const { toggleFavorite } = usePlayStore.getState();
    toggleFavorite(contentId);
  };

  const toggleInstructorFollow = (instructorId: number) => {
    const { toggleFollowInstructor } = usePlayStore.getState();
    toggleFollowInstructor(instructorId);
  };

  const isFavorite = (contentId: number) => {
    const { isFavorite: checkIsFavorite } = usePlayStore.getState();
    return checkIsFavorite(contentId);
  };

  const isFollowingInstructor = (instructorId: number) => {
    const { isFollowingInstructor: checkIsFollowingInstructor } = usePlayStore.getState();
    return checkIsFollowingInstructor(instructorId);
  };

  return {
    toggleContentFavorite,
    toggleInstructorFollow,
    isFavorite,
    isFollowingInstructor,
  };
};

/**
 * 스토어 초기화 통합 액션
 * - 모든 스토어 초기화
 * - 특정 스토어만 초기화
 */
export const createStoreResetActions = () => {
  const resetCurrencyStore = () => {
    useCurrencyStore.setState({
      heartPoints: INITIAL_CURRENCY_STATE.heartPoints,
    });
  };

  const resetRoomStore = () => {
    useRoomStore.setState({
      ownedItems: INITIAL_ROOM_STATE.ownedItems,
      placedItems: INITIAL_ROOM_STATE.placedItems,
      selectedItems: INITIAL_ROOM_STATE.selectedItems,
    });
  };

  const resetPlayStore = () => {
    usePlayStore.setState({
      favoriteContents: INITIAL_PLAY_STATE.favoriteContents,
      followedInstructorIds: INITIAL_PLAY_STATE.followedInstructorIds,
    });
  };

  const resetAllStores = () => {
    resetCurrencyStore();
    resetRoomStore();
    resetPlayStore();
  };

  return {
    resetCurrencyStore,
    resetRoomStore,
    resetPlayStore,
    resetAllStores,
  };
};
