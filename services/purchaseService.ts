import { apiClient } from './apiClient';
import { API_CONFIG } from '../configs/api';
import { ApiPlacedItems, PlacedItems, mapPlacedItemsFromApi } from '../types/room';

type PurchaseRequestBody = {
  itemIds: number[];
};

// 서버에서 오는 응답 타입 (스네이크 케이스)
export interface ApiPurchaseResponse {
  heartPoints: number;
  ownedItems: number[];
  placedItems: ApiPlacedItems;
}

// 프론트엔드에서 사용하는 응답 타입 (camelCase)
export interface PurchaseResponse {
  heartPoints: number;
  ownedItems: number[];
  placedItems: PlacedItems;
}

export async function purchaseItemsApi(itemIds: number[]): Promise<PurchaseResponse> {
  const body: PurchaseRequestBody = { itemIds };
  
  // 서버에서 스네이크 케이스로 응답이 옴
  const apiResponse = await apiClient.post<ApiPurchaseResponse>(API_CONFIG.ENDPOINTS.PURCHASE, body);
  
  // 프론트엔드용 camelCase로 변환
  return {
    heartPoints: apiResponse.heartPoints,
    ownedItems: apiResponse.ownedItems,
    placedItems: mapPlacedItemsFromApi(apiResponse.placedItems)
  };
}

// 단일 아이템 구매용 헬퍼 함수
export async function purchaseSingleItemApi(itemId: number): Promise<PurchaseResponse> {
  return purchaseItemsApi([itemId]);
}
