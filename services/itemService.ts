import { apiClient } from './apiClient';
import { serverItemList } from '../data/roomItemData';

// 공통 아이템 관련 타입 (명세 기반)
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

export type ItemSort = 'POPULARITY' | 'PRICE_ASC' | 'PRICE_DESC' | 'CREATED';

export interface Item {
  id: number;
  name: string;
  description: string[];
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

export interface ItemsResponse {
  content: Item[];
  page: {
    size: number;
    number: number; // 1-based
    totalElements: number;
    totalPages: number;
  };
}

export interface GetItemsParams {
  itemType?: ItemType;
  sort?: ItemSort; // 기본 CREATED
  excludeOwned?: boolean; // 기본 false
  page?: number; // 1-based, 기본 1
  size?: number; // 기본 12
  deletionStatus?: 'ACTIVE' | 'DELETED' | 'ALL'; // 기본 ACTIVE (ADMIN만 DELETED/ALL)
}

/**
 * 아이템 목록 조회
 * GET /items
 */
export async function getItems(params: GetItemsParams): Promise<ItemsResponse> {
  // ===== PROD =====
  const qs = new URLSearchParams();
  if (params.itemType) qs.append('itemType', params.itemType);
  if (params.sort) qs.append('sort', params.sort);
  if (typeof params.excludeOwned === 'boolean') qs.append('excludeOwned', String(params.excludeOwned));
  if (params.page !== undefined) qs.append('page', String(params.page));
  if (params.size !== undefined) qs.append('size', String(params.size));
  if (params.deletionStatus) qs.append('deletionStatus', params.deletionStatus);

  const url = qs.toString() ? `/items?${qs.toString()}` : '/items';
  return apiClient.get<ItemsResponse>(url);
}

/**
 * 아이템 단건 상세 조회
 * GET /items/{itemId}
 */
export async function getItemDetail(
  itemId: number,
  options?: { deletionStatus?: 'ACTIVE' | 'DELETED' | 'ALL' }
): Promise<Item> {
  const qs = new URLSearchParams();
  if (options?.deletionStatus) qs.append('deletionStatus', options.deletionStatus);
  const url = qs.toString() ? `/items/${itemId}?${qs.toString()}` : `/items/${itemId}`;
  return apiClient.get<Item>(url);
}

/**
 * 내가 소유한 아이템 목록 조회 (본인 또는 ADMIN이 특정 userId 지정)
 * GET /users/me/owned-items
 */
export interface GetOwnedItemsParams {
  userId?: number; // ADMIN 전용
  itemType?: ItemType;
  page?: number; // 1-based, 기본 1
  size?: number; // 기본 12
  sort?: string; // 예: createdAt,desc
  deletionStatus?: 'ACTIVE' | 'DELETED' | 'ALL'; // 기본 ACTIVE
}

export async function getOwnedItems(params: GetOwnedItemsParams = {}): Promise<ItemsResponse> {
  const qs = new URLSearchParams();
  if (params.userId !== undefined) qs.append('userId', String(params.userId));
  if (params.itemType) qs.append('itemType', params.itemType);
  if (params.page !== undefined) qs.append('page', String(params.page));
  if (params.size !== undefined) qs.append('size', String(params.size));
  if (params.sort) qs.append('sort', params.sort);
  if (params.deletionStatus) qs.append('deletionStatus', params.deletionStatus);
  const url = qs.toString() ? `/users/me/owned-items?${qs.toString()}` : '/users/me/owned-items';
  return apiClient.get<ItemsResponse>(url);
}

/**
 * 현재 장착 중인 아이템 목록 조회
 * GET /users/me/equipped-items
 */
export interface EquippedItemsResponse {
  hat: Item | null;
  eyewear: Item | null;
  background: Item | null;
  frame: Item | null;
  floor: Item | null;
  shelf: Item | null;
}

export async function getEquippedItems(): Promise<EquippedItemsResponse> {
  return apiClient.get<EquippedItemsResponse>('/users/me/equipped-items');
}

/**
 * 현재 장착 아이템 목록 수정(전체 교체)
 * PUT /users/me/equipped-items
 */
export type EquipItemsRequest = {
  itemsToEquip: Partial<Record<EquipSlot, number>>; // 슬롯별 itemId 매핑
};

export async function updateEquippedItems(body: EquipItemsRequest): Promise<EquippedItemsResponse> {
  return apiClient.put<EquippedItemsResponse>('/users/me/equipped-items', body);
}


