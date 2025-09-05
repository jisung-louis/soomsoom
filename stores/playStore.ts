import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_PLAY_STATE } from '../constants/initialStates';

// 팔로우한 강사 상태 관리용 간단한 타입
export type FollowedInstructorState = {
  instructorId: number;
};
// 즐겨찾기 상태 관리용 간단한 액티비티 타입
export type FavoriteActivityState = {
  activityId: number;
};
interface PlayState {
  // 즐겨찾기 액티비티 관리
  favoriteActivities: FavoriteActivityState[];
  
  // 팔로우한 강사 관리
  followedInstructors: FollowedInstructorState[];
  
  // 즐겨찾기 액션들 (서비스 레이어에서 호출)
  favoriteActivity: (activityId: number) => void;
  unfavoriteActivity: (activityId: number) => void;
  setFavoritedActivities: (activities: FavoriteActivityState[]) => void;
  
  // 팔로우 액션들 (서비스 레이어에서 호출)
  followInstructor: (instructorId: number) => void;
  unfollowInstructor: (instructorId: number) => void;
  setFollowedInstructors: (instructors: FollowedInstructorState[]) => void;
}

export const usePlayStore = create<PlayState>()(
  persist(
    (set, get) => ({
      // 초기 상태 (상수에서 가져옴)
      favoriteActivities: INITIAL_PLAY_STATE.favoriteActivities,
      followedInstructors: [],
  
  // 즐겨찾기 관련 액션 (서비스 레이어에서 호출)
  favoriteActivity: (activityId: number) => {
    set((state) => {
      const exists = state.favoriteActivities.some(fav => fav.activityId === activityId);
      if (exists) return state;
      
      const newFavorite: FavoriteActivityState = {
        activityId,
      };
      
      return {
        favoriteActivities: [...state.favoriteActivities, newFavorite],
      };
    });
  },
  
  unfavoriteActivity: (activityId: number) => {
    set((state) => ({
      favoriteActivities: state.favoriteActivities.filter(fav => fav.activityId !== activityId),
    }));
  },
  
  setFavoritedActivities: (activities: FavoriteActivityState[]) => {
    set({ favoriteActivities: activities });
  },
  
  // 강사 팔로우 관련 액션
  followInstructor: (instructorId: number) => {
    set((state) => {
      if (state.followedInstructors.some(inst => inst.instructorId === instructorId)) return state;
      
      const newInstructor: FollowedInstructorState = {
        instructorId: instructorId,
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
  
  // 동기화 액션
  setFollowedInstructors: (instructors: FollowedInstructorState[]) => {
    set({ followedInstructors: instructors });
  },


    }),
    {
      name: 'play-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);