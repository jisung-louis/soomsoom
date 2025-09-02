import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteContentData } from '../data/playContentData';
import { INITIAL_PLAY_STATE } from '../constants/initialStates';

interface PlayState {
  // 즐겨찾기 컨텐츠 관리
  favoriteContents: FavoriteContentData[];
  
  // 팔로우한 선생님 관리 (단순화된 구조)
  followedTeacherIds: number[];
  
  // 액션들
  addToFavorites: (contentId: number) => void;
  removeFromFavorites: (contentId: number) => void;
  toggleFavorite: (contentId: number) => void;
  isFavorite: (contentId: number) => boolean;
  
  followTeacher: (teacherId: number) => void;
  unfollowTeacher: (teacherId: number) => void;
  toggleFollowTeacher: (teacherId: number) => void;
  isFollowingTeacher: (teacherId: number) => boolean;
  
  // 초기화
  initializeFavorites: (favorites: FavoriteContentData[]) => void;
  initializeFollowedTeachers: (teacherIds: number[]) => void;
}

export const usePlayStore = create<PlayState>()(
  persist(
    (set, get) => ({
      // 초기 상태 (상수에서 가져옴)
      favoriteContents: INITIAL_PLAY_STATE.favoriteContents,
      followedTeacherIds: [],
  
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
  
  // 선생님 팔로우 관련 액션 (단순화된 구조)
  followTeacher: (teacherId: number) => {
    set((state) => {
      if (state.followedTeacherIds.includes(teacherId)) return state;
      return {
        followedTeacherIds: [...state.followedTeacherIds, teacherId],
      };
    });
  },
  
  unfollowTeacher: (teacherId: number) => {
    set((state) => ({
      followedTeacherIds: state.followedTeacherIds.filter(id => id !== teacherId),
    }));
  },
  
  toggleFollowTeacher: (teacherId: number) => {
    const { isFollowingTeacher, followTeacher, unfollowTeacher } = get();
    
    if (isFollowingTeacher(teacherId)) {
      unfollowTeacher(teacherId);
    } else {
      followTeacher(teacherId);
    }
  },
  
  isFollowingTeacher: (teacherId: number) => {
    return get().followedTeacherIds.includes(teacherId);
  },
  
  // 초기화 액션
  initializeFavorites: (favorites: FavoriteContentData[]) => {
    set({ favoriteContents: favorites });
  },
  
  initializeFollowedTeachers: (teacherIds: number[]) => {
    set({ followedTeacherIds: teacherIds });
  },
    }),
    {
      name: 'play-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 