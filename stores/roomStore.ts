import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlacedItems, RoomItemPositionType } from '../types/room';
import { INITIAL_ROOM_STATE } from '../constants/initialStates';

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
  setOwnedItems: (itemIds: number[]) => void;
  
  // 배치 아이템 관리
  placeItem: (itemId: number, category: RoomItemPositionType) => void;
  removePlacedItem: (itemId: number, category: RoomItemPositionType) => void;
  clearPlacedItems: (category: RoomItemPositionType) => void;
  clearAllPlacedItems: () => void;
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
      // 초기 상태 (상수에서 가져옴)
      ownedItems: INITIAL_ROOM_STATE.ownedItems,
      placedItems: INITIAL_ROOM_STATE.placedItems,
      selectedItems: INITIAL_ROOM_STATE.selectedItems,
      
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
      
      setOwnedItems: (itemIds: number[]) => {
        set({ ownedItems: itemIds });
      },
      
      // 배치 아이템 관리 액션
      placeItem: (itemId: number, category: RoomItemPositionType) => {
        set((state) => ({
          placedItems: {
            ...state.placedItems,
            [category]: state.placedItems[category] === itemId ? null : itemId,
          },
        }));
      },
      
      removePlacedItem: (itemId: number, category: RoomItemPositionType) => {
        set((state) => ({
          placedItems: {
            ...state.placedItems,
            [category]: state.placedItems[category] === itemId ? null : state.placedItems[category],
          },
        }));
      },

      clearAllPlacedItems: () => {
        set((state) => ({
          placedItems: {
            ...state.placedItems,
            background: null,
            eyewear: null,
            hat: null,
            frame: null,
            floor: null,
            shelf: null,
          },
        }));
      },
      clearPlacedItems: (category: RoomItemPositionType) => {
        set((state) => ({
          placedItems: {
            ...state.placedItems,
            [category]: null,
          },
        }));
      },

      updatePlacedItems: (nextMap: Partial<PlacedItems>) => {
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
      
      isPlaced: (itemId: number, category: RoomItemPositionType) => {
        const state = get();
        return state.placedItems[category] === itemId;
      },
    }),
    {
      name: 'room-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
