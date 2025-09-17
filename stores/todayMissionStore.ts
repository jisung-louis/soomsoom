import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TodayMissionResponse, TodayMissionStatus } from '../services/todayMissionService';
import { getTodayMissions } from '../services/todayMissionService';

export interface TodayMissionState {
  status: TodayMissionStatus | null;
  fetchedAt: number | null;     // epoch ms
  validUntil: number | null;     // epoch ms (다음날 06:00:00)

  // 동기 액션
  setFromServer: (res: TodayMissionResponse, nowMs?: number) => void;
  invalidateIfCrossedBoundary: (nowMs?: number) => void;
  shouldFetchNow: (opts?: { ttlMs?: number; nowMs?: number }) => boolean;
  clear: () => void;

  // 비동기 액션
  refresh: () => Promise<TodayMissionStatus | null>;
}

// 다음 일경계(06:00)를 epoch ms로 계산
export function getNextDayBoundaryMs(baseDate: Date = new Date()): number {
  const d = new Date(baseDate);
  const hour = d.getHours();
  // 비즈니스 데이: 06:00 ~ 익일 05:59:59
  // 현재 시간이 06:00 이전이면 오늘 06:00이 경계, 이후면 내일 06:00이 경계
  const boundary = new Date(d);
  if (hour < 6) {
    boundary.setHours(6, 0, 0, 0);
  } else {
    boundary.setDate(boundary.getDate() + 1);
    boundary.setHours(6, 0, 0, 0);
  }
  return boundary.getTime();
}

export const useTodayMissionStore = create<TodayMissionState>()(
  persist(
    (set, get) => ({
      status: null,
      fetchedAt: null,
      validUntil: null,

      setFromServer: (res, nowMs) => {
        const now = nowMs ?? Date.now();
        const validUntil = getNextDayBoundaryMs(new Date(now));
        set({ status: res.status, fetchedAt: now, validUntil });
      },

      invalidateIfCrossedBoundary: (nowMs) => {
        const now = nowMs ?? Date.now();
        const { validUntil } = get();
        if (validUntil && now >= validUntil) {
          set({ status: null, fetchedAt: null, validUntil: null });
        }
      },

      shouldFetchNow: (opts) => {
        const { fetchedAt, validUntil } = get();
        const now = opts?.nowMs ?? Date.now();
        const ttlMs = opts?.ttlMs ?? 10 * 60 * 1000; // 기본 TTL 10분

        // 일경계 지남 → 반드시 호출
        if (validUntil && now >= validUntil) return true;

        // 캐시 없음 → 호출
        if (!fetchedAt) return true;

        // TTL 초과 → 호출
        return now - fetchedAt >= ttlMs;
      },

      clear: () => set({ status: null, fetchedAt: null, validUntil: null }),

      refresh: async () => {
        try {
          const res = await getTodayMissions();
          get().setFromServer(res);
          return res.status;
        } catch (e) {
          // 실패 시 캐시는 유지
          return get().status;
        }
      },
    }),
    {
      name: 'today-mission-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        status: state.status,
        fetchedAt: state.fetchedAt,
        validUntil: state.validUntil,
      }),
    }
  )
);


