# 스토어 액션 사용 가이드

## 🚨 중요: 서버 권위 vs 로컬 시뮬레이터

### ✅ 실제 서비스에서 사용할 것

```typescript
// 올바른 구매 플로우 (서버 권위)
import { createServerPurchaseActions } from './storeActions';
import { purchaseItemsApi } from '../services/purchaseService';

const { syncPurchaseResponseFromServer } = createServerPurchaseActions();

try {
  const response = await purchaseItemsApi([1, 2, 3]);
  syncPurchaseResponseFromServer(response); // 서버 응답으로 동기화
} catch (error) {
  // 에러 처리
}
```

### ❌ 실제 서비스에서 사용하지 말 것

```typescript
// 잘못된 구매 플로우 (로컬 시뮬레이터)
import { createLocalPurchaseSimulator } from './storeActions';

const { purchaseItem } = createLocalPurchaseSimulator();
purchaseItem(1, 100); // 서버 권위 무시! 개발용으로만 사용
```

## 📋 액션 분류

### 🔧 개발/테스트용 (오프라인 시뮬레이터)
- `createLocalPurchaseSimulator()` - 로컬에서 바로 상태 변경
- `createStoreResetActions()` - 스토어 초기화

### 🌐 실제 서비스용 (서버 권위)
- `createServerPurchaseActions()` - 서버 응답으로 상태 동기화
- `createRewardActions()` - 보상 시스템
- `createFavoriteActions()` - 즐겨찾기 관리

## 🎯 구매 플로우 가이드

### 1. 기존 usePurchase 훅 사용 (권장)
```typescript
import { usePurchase } from '../hooks/usePurchase';

const { purchaseItems, isPurchasing } = usePurchase({
  onSuccess: () => console.log('구매 성공'),
  onError: (error) => console.error('구매 실패', error)
});

// 사용
await purchaseItems([1, 2, 3]);
```

### 2. 직접 서비스 호출 + 동기화
```typescript
import { createServerPurchaseActions } from './storeActions';
import { purchaseItemsApi } from '../services/purchaseService';

const { syncPurchaseResponseFromServer } = createServerPurchaseActions();

const handlePurchase = async (itemIds: number[]) => {
  try {
    const response = await purchaseItemsApi(itemIds);
    syncPurchaseResponseFromServer(response);
  } catch (error) {
    // 에러 처리
  }
};
```

## ⚠️ 주의사항

1. **서버 권위 원칙**: 모든 구매/소유권 변경은 서버 응답을 통해서만
2. **로컬 시뮬레이터**: 개발/테스트용으로만 사용
3. **일관성**: 기존 `usePurchase` 훅이 올바른 패턴을 사용하고 있음
4. **에러 처리**: 모든 구매 액션에는 적절한 에러 처리 필요
5. **Zustand 사용법**: `getState()`로 최신 상태 접근, 초기 캡처 방지

## 🔧 Zustand 사용 패턴

### ✅ 올바른 패턴
```typescript
// 액션 내부에서 getState() 사용 (최신 상태 보장)
const purchaseItem = (itemId: number, price: number) => {
  const { spendHeartPoints } = useCurrencyStore.getState(); // ✅
  const success = spendHeartPoints(price);
  // ...
};
```

### ❌ 잘못된 패턴
```typescript
// 초기 캡처 (나중에 변경된 값 참조 불가)
const { spendHeartPoints } = useCurrencyStore(); // ❌
const purchaseItem = (itemId: number, price: number) => {
  const success = spendHeartPoints(price); // 오래된 참조 가능성
  // ...
};
```
