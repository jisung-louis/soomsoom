import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlacedItems, RoomItemPositionType } from '../types/room';

interface RoomState {
  // 소유 아이템 관리
  ownedItems: number[];
  
  // 홈화면 배치 아이템 관리 (카테고리별) - 각 카테고리마다 0~1개만 배치 가능
  placedItems: PlacedItems;
  
  // 현재 선택된 아이템들 (임시 선택용)
  selectedItems: number[];
  
  // 액션들
  // 소유 아이템 관리
  addOwnedItem: (itemId: number) => void;
  removeOwnedItem: (itemId: number) => void;
  
  // 배치 아이템 관리
  placeItem: (itemId: number, category: RoomItemPositionType) => void;
  removePlacedItem: (itemId: number, category: RoomItemPositionType) => void;
  clearPlacedItems: (category: RoomItemPositionType) => void;
  clearAllPlacedItems: () => void;

  // 부분 갱신/제거용 액션 추가
  removeItem: (category: RoomItemPositionType) => void;
  updatePlacedItems: (nextMap: Partial<PlacedItems>) => void;
  
  // 선택 관리
  setSelectedItems: (itemIds: number[]) => void;
  clearSelectedItems: () => void;
  
  // 유틸리티
  isOwned: (itemId: number) => boolean;
  isPlaced: (itemId: number, category: RoomItemPositionType) => boolean;
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      ownedItems: [1, 2, 3, 4, 5, 6, 12, 20], // 기존 IN_POSSESSION_ITEMS 데이터
      placedItems: {
        background: 6,
        eyewear: 12,
        hat: 20,
        frame1: 2,    // frame_1 → frame1
        frame2: 3,    // frame_2 → frame2
        floor: 4,
        shelf: 5,
      },
      selectedItems: [],
      
      // 소유 아이템 관리 액션
      addOwnedItem: (itemId: number) => {
        set((state) => ({
          ownedItems: state.ownedItems.includes(itemId) 
            ? state.ownedItems 
            : [...state.ownedItems, itemId]
        }));
      },
      
      removeOwnedItem: (itemId: number) => {
        set((state) => ({
          ownedItems: state.ownedItems.filter(id => id !== itemId)
        }));
      },
      
      // 배치 아이템 관리 액션
      placeItem: (itemId: number, category: string) => {
        set((state) => ({
          placedItems: {
            ...state.placedItems,
            [category]: state.placedItems[category as keyof typeof state.placedItems] === itemId
              ? null // 이미 배치된 아이템이면 제거
              : itemId // 새로운 아이템 배치
          }
        }));
      },
      
      removePlacedItem: (itemId: number, category: string) => {
        set((state) => ({
          placedItems: {
            ...state.placedItems,
            [category]: state.placedItems[category as keyof typeof state.placedItems] === itemId
              ? null // 해당 아이템이 배치되어 있으면 제거
              : state.placedItems[category as keyof typeof state.placedItems] // 아니면 그대로 유지
          }
        }));
      },

      clearAllPlacedItems: () => {
        set((state) => ({
          placedItems: {
            ...state.placedItems,
            background: null,
            eyewear: null,
            hat: null,
            frame_1: null,
            frame_2: null,
            floor: null,
            shelf: null,
          }
        }));
      },
      clearPlacedItems: (category: string) => {
        set((state) => ({
          placedItems: {
            ...state.placedItems,
            [category]: null
          }
        }));
      },

      removeItem: (category: string) => {
        set((state) => ({
          placedItems: {
            ...state.placedItems,
            [category]: null,
          },
        }));
      },

      updatePlacedItems: (nextMap: Partial<Record<keyof RoomState['placedItems'], number | null>>) => {
        set((state) => ({
          placedItems: {
            ...state.placedItems,
            ...nextMap,
          },
        }));
      },
      
      // 선택 관리 액션
      setSelectedItems: (itemIds: number[]) => {
        set({ selectedItems: itemIds });
      },
      
      clearSelectedItems: () => {
        set({ selectedItems: [] });
      },
      
      // 유틸리티 함수
      isOwned: (itemId: number) => {
        return get().ownedItems.includes(itemId);
      },
      
      isPlaced: (itemId: number, category: string) => {
        const state = get();
        return state.placedItems[category as keyof typeof state.placedItems] === itemId;
      },
    }),
    {
      name: 'room-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
