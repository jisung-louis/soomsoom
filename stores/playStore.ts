import { create } from 'zustand';
import { FavoriteContentData, FollowedTeacherData } from '../data/playContentData';

interface PlayState {
  // 즐겨찾기 컨텐츠 관리
  favoriteContents: FavoriteContentData[];
  
  // 팔로우한 선생님 관리
  followedTeachers: FollowedTeacherData[];
  
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
  initializeFollowedTeachers: (followed: FollowedTeacherData[]) => void;
}

export const usePlayStore = create<PlayState>((set, get) => ({
  // 초기 상태
  favoriteContents: [],
  followedTeachers: [],
  
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
  
  // 선생님 팔로우 관련 액션
  followTeacher: (teacherId: number) => {
    set((state) => {
      const exists = state.followedTeachers.some(followed => 
        followed.teacherId.includes(teacherId)
      );
      
      if (exists) return state;
      
      // 기존 유저 데이터가 있으면 추가, 없으면 새로 생성
      const existingUser = state.followedTeachers.find(followed => followed.id === 1);
      
      if (existingUser) {
        return {
          followedTeachers: state.followedTeachers.map(followed =>
            followed.id === 1
              ? { ...followed, teacherId: [...followed.teacherId, teacherId] }
              : followed
          ),
        };
      } else {
        const newFollowed: FollowedTeacherData = {
          id: 1,
          teacherId: [teacherId],
        };
        
        return {
          followedTeachers: [...state.followedTeachers, newFollowed],
        };
      }
    });
  },
  
  unfollowTeacher: (teacherId: number) => {
    set((state) => ({
      followedTeachers: state.followedTeachers.map(followed =>
        followed.id === 1
          ? { ...followed, teacherId: followed.teacherId.filter(id => id !== teacherId) }
          : followed
      ),
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
    return get().followedTeachers.some(followed => 
      followed.teacherId.includes(teacherId)
    );
  },
  
  // 초기화 액션
  initializeFavorites: (favorites: FavoriteContentData[]) => {
    set({ favoriteContents: favorites });
  },
  
  initializeFollowedTeachers: (followed: FollowedTeacherData[]) => {
    set({ followedTeachers: followed });
  },
})); 