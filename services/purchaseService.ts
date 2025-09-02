import { Platform } from 'react-native';

type PurchaseRequestBody = {
  itemIds: number[];
};

// TODO: 환경에 맞는 API 베이스 URL로 교체하세요.
//  - Android 에뮬레이터: 10.0.2.2
//  - iOS 시뮬레이터: localhost 가능
//  - iOS 실기기: Mac의 로컬 IP 사용 필요
const API_BASE_URL = Platform.select({ ios: 'http://localhost:3000', android: 'http://10.0.2.2:3000', default: 'http://localhost:3000' });

export type PurchaseResponse = {
  heartPoints: number;
  ownedItems: number[];
  placedItems: {
    background: number | null;
    eyewear: number | null;
    hat: number | null;
    frame_1: number | null;
    frame_2: number | null;
    floor: number | null;
    shelf: number | null;
  };
};

export async function purchaseItemsApi(itemIds: number[], timeoutMs = 10000): Promise<PurchaseResponse> {
  const url = `${API_BASE_URL}/api/room/purchase`;
  const body: PurchaseRequestBody = { itemIds };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `HTTP ${res.status}`);
    }

    const data = (await res.json()) as PurchaseResponse;
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// 단일 아이템 구매용 헬퍼 함수
export async function purchaseSingleItemApi(itemId: number, timeoutMs = 10000): Promise<PurchaseResponse> {
  return purchaseItemsApi([itemId], timeoutMs);
}
