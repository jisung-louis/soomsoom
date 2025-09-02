export interface PurchaseErrorState {
  title: string;
  subMessage?: string;
}

export function handlePurchaseError(error: any): PurchaseErrorState {
  const name = error?.name || '';
  const msg: string = String(error?.message || '');

  if (name === 'AbortError') {
    return {
      title: '연결이 지연되고 있어요',
      subMessage: '네트워크 상태를 확인하고 잠시 후 다시 시도해 주세요.'
    };
  } else if (msg.includes('INSUFFICIENT_HEARTS')) {
    return {
      title: '하트가 부족해요',
      subMessage: '하트를 충전한 뒤 다시 구매해 주세요.'
    };
  } else if (msg.includes('INVALID_ITEM')) {
    return {
      title: '유효하지 않은 아이템',
      subMessage: '목록을 새로고침하고 다시 시도해 주세요.'
    };
  } else if (msg.includes('ALREADY_OWNED')) {
    return {
      title: '이미 보유한 아이템이에요',
      subMessage: '보유목록을 확인해 주세요.'
    };
  } else if (msg.startsWith('HTTP 5')) {
    return {
      title: '서버에 문제가 있어요',
      subMessage: '잠시 후 다시 시도해 주세요.'
    };
  } else if (msg.startsWith('HTTP 4')) {
    return {
      title: '요청을 처리할 수 없어요',
      subMessage: '앱을 최신으로 유지하거나 다시 시도해 주세요.'
    };
  } else {
    return {
      title: '구매에 실패했어요',
      subMessage: '잠시 후 다시 시도해 주세요.'
    };
  }
}
