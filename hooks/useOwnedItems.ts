import { useCallback } from 'react';
import { useRoomStore } from '../stores/roomStore';
import { getOwnedItems } from '../services/itemService';

export const useOwnedItems = () => {
  const { ownedItems, setOwnedItems } = useRoomStore();
  
  const loadOwnedItems = useCallback(async () => {
    try {
      console.log('📦 소유 아이템 목록 로드 시작...');
      const res = await getOwnedItems({ page: 1, size: 1000 });
      const itemIds = res.content.map(item => item.id);
      setOwnedItems(itemIds);
      console.log('✅ 소유 아이템 목록 로드 완료:', itemIds.length, '개');
      return itemIds;
    } catch (error) {
      console.warn('⚠️ 소유 아이템 목록 로드 실패:', error);
      throw error;
    }
  }, [setOwnedItems]);
  
  return { 
    ownedItems, 
    loadOwnedItems 
  };
};
