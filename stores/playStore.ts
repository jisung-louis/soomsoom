import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteContentData } from '../data/playContentData';
import { INITIAL_PLAY_STATE } from '../constants/initialStates';
import { FollowedInstructorSummary } from '../services/instructorService';

interface PlayState {
  // 즐겨찾기 컨텐츠 관리
  favoriteContents: FavoriteContentData[];
  
  // 팔로우한 강사 관리
  followedInstructors: FollowedInstructorSummary[];
  
  // 액션들
  addToFavorites: (contentId: number) => void;
  removeFromFavorites: (contentId: number) => void;
  toggleFavorite: (contentId: number) => void;
  isFavorite: (contentId: number) => boolean;
  
  followInstructor: (instructorId: number) => void;
  unfollowInstructor: (instructorId: number) => void;
  
  // 초기화
  initializeFavorites: (favorites: FavoriteContentData[]) => void;
  setFollowedInstructors: (instructors: FollowedInstructorSummary[]) => void;
}

export const usePlayStore = create<PlayState>()(
  persist(
    (set, get) => ({
      // 초기 상태 (상수에서 가져옴)
      favoriteContents: INITIAL_PLAY_STATE.favoriteContents,
      followedInstructors: [],
  
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
  
  // 강사 팔로우 관련 액션
  followInstructor: (instructorId: number) => {
    set((state) => {
      if (state.followedInstructors.some(inst => inst.instructorId === instructorId)) return state;
      
      // 강사 정보를 찾아서 추가
      const { mockInstructorsData } = require('../data/playContentData');
      const instructor = mockInstructorsData.find((inst: any) => inst.id === instructorId);
      
      const newInstructor: FollowedInstructorSummary = {
        instructorId,
        name: instructor?.name || 'Unknown',
        profileImageUrl: instructor?.profileImage || null,
      };
      
      return {
        followedInstructors: [...state.followedInstructors, newInstructor],
      };
    });
  },
  
  unfollowInstructor: (instructorId: number) => {
    set((state) => ({
      followedInstructors: state.followedInstructors.filter(inst => inst.instructorId !== instructorId),
    }));
  },
  
  
  
  // 초기화 액션
  initializeFavorites: (favorites: FavoriteContentData[]) => {
    set({ favoriteContents: favorites });
  },
  
  setFollowedInstructors: (instructors: FollowedInstructorSummary[]) => {
    set({ followedInstructors: instructors });
  },
    }),
    {
      name: 'play-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);