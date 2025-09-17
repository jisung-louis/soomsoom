import { apiClient } from './apiClient';
// 서비스 레이어는 모킹 여부를 알지 못하도록 유지
import { useCurrencyStore } from '../stores/currencyStore';
import { useRoomStore } from '../stores/roomStore';
import { useCartStore } from '../stores/cartStore';

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
  // 최소한의 정합성: 중복 제거만 수행
  const uniqueIds = Array.from(new Set(params.itemIds));
  const bodyToSend: PurchaseItemsRequest = { itemIds: uniqueIds, expectedTotalPrice: params.expectedTotalPrice };
  // 실제 서버 API 호출 (모킹은 apiClient에서 처리)
  const response = await apiClient.post<PurchaseItemsResponse>(`/purchase/items`, bodyToSend);
  return response;
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
  // 실제 서버 API 호출 (모킹은 apiClient에서 처리)
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
  // 실제 서버 API 호출 (모킹은 apiClient에서 처리)
  const res = await apiClient.post<CartResponse>('/cart/items', body);
  return res;
}

// =====================
// 장바구니 아이템 제거 (신규 명세)
// DELETE /cart/items/{itemId}
// =====================

export async function removeItemFromCart(itemId: number): Promise<CartResponse> {
  // 실제 서버 API 호출 (모킹은 apiClient에서 처리)
  const res = await apiClient.delete<CartResponse>(`/cart/items/${itemId}`);
  return res;
}

// =====================
// 장바구니 전체 초기화
// =====================

export async function clearAllCartItems(): Promise<CartResponse> {
  // 실제 서버 API 호출 (모킹은 apiClient에서 처리)
  const cartData = await getCart();
  await Promise.all(cartData.items.map(item => apiClient.delete<CartResponse>(`/cart/items/${item.id}`)));
  return { items: [], totalPrice: 0 };
}

// =====================
// 장바구니 일괄 구매 (신규 명세)
// POST /purchase/cart
// =====================

export interface PurchaseCartRequest {
  expectedTotalPrice: number;
}

export async function purchaseCart(body: PurchaseCartRequest): Promise<PurchaseItemsResponse> {
  // 실제 서버 API 호출 (모킹은 apiClient에서 처리)
  const res = await apiClient.post<PurchaseItemsResponse>('/purchase/cart', body);
  return res;
}
