import { apiClient } from './apiClient';
import { roomItemList } from '../data/roomItemData';
import { useCurrencyStore } from '../stores/currencyStore';
import { useRoomStore } from '../stores/roomStore';

// 요청 타입 (신규 명세)
export type PurchaseItemsRequest = {
  itemIds: number[];
  expectedTotalPrice: number;
};

// 백엔드 명세 기반 타입들
export type ItemType =
  | 'ACCESSORY'
  | 'HAT'
  | 'BACKGROUND'
  | 'FURNITURE'
  | 'SHELF'
  | 'FLOOR'
  | 'FRAME';

export type EquipSlot =
  | 'BACKGROUND'
  | 'EYEWEAR'
  | 'HAT'
  | 'FRAME'
  | 'FLOOR'
  | 'SHELF';

export type AcquisitionType = 'PURCHASE' | 'DEFAULT' | 'REWARD';

// 응답 아이템 타입 (신규 명세)
export interface PurchasedItem {
  id: number;
  name: string;
  description: string;
  phrase: string | null;
  itemType: ItemType;
  equipSlot: EquipSlot;
  acquisitionType: AcquisitionType;
  price: number;
  imageUrl: string | null;
  lottieUrl: string | null;
  isSoldOut: boolean;
  isOwned: boolean;
  isEquipped: boolean;
  createdAt: string;
  modifiedAt: string;
  deletedAt: string | null;
}

// 응답 타입 (신규 명세)
export interface PurchaseItemsResponse {
  purchasedItems: PurchasedItem[];
  remainingPoints: number;
}

/**
 * 아이템 다건 구매
 * POST /purchase/items
 */
export async function purchaseItemsApi(params: PurchaseItemsRequest): Promise<PurchaseItemsResponse> {
  if (__DEV__) {
    // Dev 환경: Mock 데이터로 구매 시뮬레이션
    console.log('🛒 [DEV] 아이템 구매 시뮬레이션:', params);
    
    const { itemIds, expectedTotalPrice } = params;
    const currentHeartPoints = useCurrencyStore.getState().heartPoints;
    
    // 구매할 아이템들 찾기
    const itemsToPurchase = roomItemList.filter(item => itemIds.includes(item.id));
    const totalPrice = itemsToPurchase.reduce((sum, item) => sum + (item.price || 0), 0);
    
    // 가격 검증
    if (totalPrice !== expectedTotalPrice) {
      throw new Error(`가격 불일치: 예상 ${expectedTotalPrice}, 실제 ${totalPrice}`);
    }
    
    // 하트 포인트 부족 체크
    if (currentHeartPoints < totalPrice) {
      throw new Error(`하트 포인트 부족: 현재 ${currentHeartPoints}, 필요 ${totalPrice}`);
    }
    
    // 하트 포인트 차감
    const remainingPoints = currentHeartPoints - totalPrice;
    useCurrencyStore.setState({ heartPoints: remainingPoints });
    
    // 소유 아이템에 추가
    const { addOwnedItem } = useRoomStore.getState();
    itemIds.forEach(itemId => {
      addOwnedItem(itemId);
    });
    
    // Mock 응답 생성
    const purchasedItems: PurchasedItem[] = itemsToPurchase.map(item => ({
      id: item.id,
      name: item.title,
      description: Array.isArray(item.description) 
        ? item.description.join('\n') 
        : (item.description || ''),
      phrase: null,
      itemType: item.type === '악세사리' ? 'ACCESSORY' :
                item.type === '모자' ? 'HAT' :
                item.type === '배경' ? 'BACKGROUND' :
                item.type === '러그' ? 'FLOOR' :
                item.type === '선반' ? 'SHELF' :
                'FRAME',
      equipSlot: item.positionType === 'eyewear' ? 'EYEWEAR' :
                 item.positionType === 'hat' ? 'HAT' :
                 item.positionType === 'background' ? 'BACKGROUND' :
                 item.positionType === 'frame' ? 'FRAME' :
                 item.positionType === 'floor' ? 'FLOOR' :
                 'SHELF',
      acquisitionType: 'PURCHASE',
      price: item.price || 0,
      imageUrl: typeof item.image === 'string' ? item.image : null,
      lottieUrl: item.lottieJson || null,
      isSoldOut: false,
      isOwned: true,
      isEquipped: false,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      deletedAt: null,
    }));
    
    console.log('✅ [DEV] 구매 완료:', {
      purchasedItems: purchasedItems.length,
      totalPrice,
      remainingPoints
    });
    
    return {
      purchasedItems,
      remainingPoints
    };
  } else {
    // Prod 환경: 실제 서버 API 호출
    const response = await apiClient.post<PurchaseItemsResponse>(`/purchase/items`, params);
    return response;
  }
}

/**
 * 단일 아이템 구매 (헬퍼)
 */
export async function purchaseSingleItemApi(itemId: number, expectedTotalPrice: number): Promise<PurchaseItemsResponse> {
  return purchaseItemsApi({ itemIds: [itemId], expectedTotalPrice });
}

// =====================
// 구매 내역 조회 (신규 명세)
// GET /purchase/history
// =====================

export interface GetPurchaseHistoryParams {
  userId?: number; // ADMIN 전용
  page?: number;   // 1-based, 기본 1
  size?: number;   // 기본 12
  sort?: string;   // 예: createdAt,desc
}

export interface PurchaseHistoryItem {
  purchaseId: number;
  purchasedItem: PurchasedItem;
  price: number;
  purchasedAt: string;
}

export interface PurchaseHistoryResponse {
  content: PurchaseHistoryItem[];
  page: {
    size: number;
    number: number; // 1-based 그대로 유지
    totalElements: number;
    totalPages: number;
  };
}

export async function getPurchaseHistory(
  params: GetPurchaseHistoryParams = {}
): Promise<PurchaseHistoryResponse> {
  const qs = new URLSearchParams();
  if (params.userId !== undefined) qs.append('userId', String(params.userId));
  if (params.page !== undefined) qs.append('page', String(params.page));
  if (params.size !== undefined) qs.append('size', String(params.size));
  if (params.sort) qs.append('sort', params.sort);

  const url = qs.toString() ? `/purchase/history?${qs.toString()}` : '/purchase/history';
  const res = await apiClient.get<PurchaseHistoryResponse>(url);
  return res;
}

// =====================
// 장바구니 조회 (신규 명세)
// GET /cart
// =====================

export interface CartResponse {
  items: PurchasedItem[];
  totalPrice: number;
}

export async function getCart(): Promise<CartResponse> {
  const res = await apiClient.get<CartResponse>('/cart');
  return res;
}

// =====================
// 장바구니 아이템 추가 (신규 명세)
// POST /cart/items
// =====================

export interface AddCartItemsRequest {
  itemIds: number[];
}

export async function addItemsToCart(body: AddCartItemsRequest): Promise<CartResponse> {
  const res = await apiClient.post<CartResponse>('/cart/items', body);
  return res;
}

// =====================
// 장바구니 아이템 제거 (신규 명세)
// DELETE /cart/items/{itemId}
// =====================

export async function removeItemFromCart(itemId: number): Promise<CartResponse> {
  const res = await apiClient.delete<CartResponse>(`/cart/items/${itemId}`);
  return res;
}

// =====================
// 장바구니 일괄 구매 (신규 명세)
// POST /purchase/cart
// =====================

export interface PurchaseCartRequest {
  expectedTotalPrice: number;
}

export async function purchaseCart(body: PurchaseCartRequest): Promise<CartResponse> {
  const res = await apiClient.post<CartResponse>('/purchase/cart', body);
  return res;
}
