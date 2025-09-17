import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VisitedActivity {
  activityId: number;
  visitedAt: string; // ISO string
}

interface VisitedActivityState {
  visits: VisitedActivity[];
  addVisited: (activityId: number) => void;
  clear: () => void;
  getVisitedIds: () => number[];
}

export const useVisitedActivityStore = create<VisitedActivityState>()(
  persist(
    (set, get) => ({
      visits: [],
      addVisited: (activityId: number) => {
        const now = new Date().toISOString();
        set((state) => {
          // 1) 기존 리스트에서 동일 ID 모두 제거
          const filtered = state.visits.filter(v => v.activityId !== activityId);
          // 2) rear(끝)에 새 방문 추가
          const next = [...filtered, { activityId, visitedAt: now }];
          // 3) 10개 초과 시 front(앞)에서 제거
          while (next.length > 10) next.shift();
          return { visits: next };
        });
      },
      clear: () => set({ visits: [] }),
      getVisitedIds: () => get().visits.map((v) => v.activityId),
    }),
    {
      name: 'visited-activity-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);


