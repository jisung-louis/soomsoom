import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteContentData } from '../data/playContentData';
import { INITIAL_PLAY_STATE } from '../constants/initialStates';

interface PlayState {
  // 즐겨찾기 컨텐츠 관리
  favoriteContents: FavoriteContentData[];
  
  // 팔로우한 강사 관리 (단순화된 구조)
  followedInstructorIds: number[];
  
  // 액션들
  addToFavorites: (contentId: number) => void;
  removeFromFavorites: (contentId: number) => void;
  toggleFavorite: (contentId: number) => void;
  isFavorite: (contentId: number) => boolean;
  
  followInstructor: (instructorId: number) => void;
  unfollowInstructor: (instructorId: number) => void;
  toggleFollowInstructor: (instructorId: number) => void;
  isFollowingInstructor: (instructorId: number) => boolean;
  
  // 초기화
  initializeFavorites: (favorites: FavoriteContentData[]) => void;
  initializeFollowedInstructors: (instructorIds: number[]) => void;
}

export const usePlayStore = create<PlayState>()(
  persist(
    (set, get) => ({
      // 초기 상태 (상수에서 가져옴)
      favoriteContents: INITIAL_PLAY_STATE.favoriteContents,
      followedInstructorIds: [],
  
  // 즐겨찾기 관련 액션
  addToFavorites: (contentId: number) => {
    set((state) => {
      const exists = state.favoriteContents.some(fav => fav.contentId === contentId);
      if (exists) return state;
      
      const newFavorite: FavoriteContentData = {
        id: Date.now(), // 임시 ID 생성
        contentId,
      };
      
      return {
        favoriteContents: [...state.favoriteContents, newFavorite],
      };
    });
  },
  
  removeFromFavorites: (contentId: number) => {
    set((state) => ({
      favoriteContents: state.favoriteContents.filter(fav => fav.contentId !== contentId),
    }));
  },
  
  toggleFavorite: (contentId: number) => {
    const { isFavorite, addToFavorites, removeFromFavorites } = get();
    
    if (isFavorite(contentId)) {
      removeFromFavorites(contentId);
    } else {
      addToFavorites(contentId);
    }
  },
  
  isFavorite: (contentId: number) => {
    return get().favoriteContents.some(fav => fav.contentId === contentId);
  },
  
  // 강사 팔로우 관련 액션 (단순화된 구조)
  followInstructor: (instructorId: number) => {
    set((state) => {
      if (state.followedInstructorIds.includes(instructorId)) return state;
      return {
        followedInstructorIds: [...state.followedInstructorIds, instructorId],
      };
    });
  },
  
  unfollowInstructor: (instructorId: number) => {
    set((state) => ({
      followedInstructorIds: state.followedInstructorIds.filter(id => id !== instructorId),
    }));
  },
  
  toggleFollowInstructor: (instructorId: number) => {
    const { isFollowingInstructor, followInstructor, unfollowInstructor } = get();
    
    if (isFollowingInstructor(instructorId)) {
      unfollowInstructor(instructorId);
    } else {
      followInstructor(instructorId);
    }
  },
  
  isFollowingInstructor: (instructorId: number) => {
    return get().followedInstructorIds.includes(instructorId);
  },
  
  // 초기화 액션
  initializeFavorites: (favorites: FavoriteContentData[]) => {
    set({ favoriteContents: favorites });
  },
  
  initializeFollowedInstructors: (instructorIds: number[]) => {
    set({ followedInstructorIds: instructorIds });
  },
    }),
    {
      name: 'play-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 