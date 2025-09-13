import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlacedItems, RoomItemPositionType } from '../types/room';
import { INITIAL_ROOM_STATE } from '../constants/initialStates';

interface RoomState {
  // 소유 아이템 관리
  ownedItems: number[];
  
  // 홈화면 배치 아이템 관리 (카테고리별) - 각 카테고리마다 0~1개만 배치 가능 (frame은 2개 배치 가능)
  placedItems: PlacedItems;
  
  // 현재 선택된 아이템들 (임시 선택용)
  selectedItems: number[];
  
  // frame 교체 대상 인덱스 (0 또는 1)
  frameReplacementIndex: number;
  
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
      frameReplacementIndex: 0,
      
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
        if (category === 'frame') {
          // frame의 경우 배열 처리
          const currentFrames = get().placedItems.frame;
          const [slot0, slot1] = currentFrames;
          const currentReplacementIndex = get().frameReplacementIndex;
          
          // 이미 배치된 아이템이면 제거
          if (slot0 === itemId) {
            set((state) => ({
              placedItems: {
                ...state.placedItems,
                frame: [null, slot1]
              }
            }));
            return;
          }
          if (slot1 === itemId) {
            set((state) => ({
              placedItems: {
                ...state.placedItems,
                frame: [slot0, null]
              }
            }));
            return;
          }
          
          // 새로운 아이템 배치
          if (slot0 === null) {
            // slot0이 비어있으면 slot0에 배치
            set((state) => ({
              placedItems: {
                ...state.placedItems,
                frame: [itemId, slot1]
              }
            }));
          } else if (slot1 === null) {
            // slot1이 비어있으면 slot1에 배치
            set((state) => ({
              placedItems: {
                ...state.placedItems,
                frame: [slot0, itemId]
              }
            }));
          } else {
            // 둘 다 차있으면 교체 로직 (0->1->0->1 순환)
            const newFrames = [...currentFrames];
            newFrames[currentReplacementIndex] = itemId;
            
            set((state) => ({
              placedItems: {
                ...state.placedItems,
                frame: newFrames as [number | null, number | null]
              },
              frameReplacementIndex: currentReplacementIndex === 0 ? 1 : 0 // 다음 교체 대상 변경
            }));
          }
        } else {
          // 다른 카테고리는 기존 로직
          set((state) => ({
            placedItems: {
              ...state.placedItems,
              [category]: state.placedItems[category] === itemId
                ? null // 이미 배치된 아이템이면 제거
                : itemId // 새로운 아이템 배치
            }
          }));
        }
      },
      
      removePlacedItem: (itemId: number, category: RoomItemPositionType) => {
        if (category === 'frame') {
          // frame의 경우 배열에서 해당 아이템 제거
          const currentFrames = get().placedItems.frame;
          const [slot0, slot1] = currentFrames;
          
          set((state) => ({
            placedItems: {
              ...state.placedItems,
              frame: [
                slot0 === itemId ? null : slot0,
                slot1 === itemId ? null : slot1
              ]
            }
          }));
        } else {
          // 다른 카테고리는 기존 로직
          set((state) => ({
            placedItems: {
              ...state.placedItems,
              [category]: state.placedItems[category] === itemId ? null : state.placedItems[category]
            }
          }));
        }
      },

      clearAllPlacedItems: () => {
        set((state) => ({
          placedItems: {
            ...state.placedItems,
            background: null,
            eyewear: null,
            hat: null,
            frame: [null, null],  // frame 배열 초기화
            floor: null,
            shelf: null,
          },
          frameReplacementIndex: 0, // 교체 인덱스도 초기화
        }));
      },
      clearPlacedItems: (category: RoomItemPositionType) => {
        if (category === 'frame') {
          // frame의 경우 배열 초기화
          set((state) => ({
            placedItems: {
              ...state.placedItems,
              frame: [null, null]
            },
            frameReplacementIndex: 0, // 교체 인덱스도 초기화
          }));
        } else {
          // 다른 카테고리는 기존 로직
          set((state) => ({
            placedItems: {
              ...state.placedItems,
              [category]: null
            }
          }));
        }
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
        if (category === 'frame') {
          // frame의 경우 배열에서 확인
          return state.placedItems.frame.includes(itemId);
        } else {
          // 다른 카테고리는 기존 로직
          return state.placedItems[category] === itemId;
        }
      },
    }),
    {
      name: 'room-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
