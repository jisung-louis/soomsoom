import { apiClient } from './apiClient';
import { API_CONFIG } from '../configs/api';
import { PlacedItems } from '../types/room';

type PurchaseRequestBody = {
  itemIds: number[];
};

// 응답 타입
export interface PurchaseResponse {
  heartPoints: number;
  ownedItems: number[];
  placedItems: PlacedItems;
}

export async function purchaseItemsApi(itemIds: number[]): Promise<PurchaseResponse> {
  const body: PurchaseRequestBody = { itemIds };
  
  // 서버에서 응답이 옴
  const apiResponse = await apiClient.post<PurchaseResponse>(API_CONFIG.ENDPOINTS.PURCHASE, body);
  
  // 프론트엔드
  return {
    heartPoints: apiResponse.heartPoints,
    ownedItems: apiResponse.ownedItems,
    placedItems: apiResponse.placedItems
  };
}

// 단일 아이템 구매용 헬퍼 함수
export async function purchaseSingleItemApi(itemId: number): Promise<PurchaseResponse> {
  return purchaseItemsApi([itemId]);
}
