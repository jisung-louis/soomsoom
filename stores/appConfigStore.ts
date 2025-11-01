// 내부 데이터 사용 여부 스토어
// 개발용이므로 프로덕션에서는 삭제되어야 함
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppConfigState {
  useMockApi: boolean;
  setUseMockApi: (value: boolean) => void;
  // Ads consent / NPA flags
  canRequestPersonalizedAds: boolean | null; // null: unknown
  setCanRequestPersonalizedAds: (value: boolean) => void;
  // Server availability
  serverClosed: boolean;
  setServerClosed: (value: boolean) => void;
  // Force update blocking
  forceUpdateBlocked: boolean;
  setForceUpdateBlocked: (value: boolean) => void;
}

export const useAppConfigStore = create<AppConfigState>()(
  devtools(
    persist(
      (set) => ({
        useMockApi: false,
        setUseMockApi: (value: boolean) => set({ useMockApi: value }),
        canRequestPersonalizedAds: null,
        setCanRequestPersonalizedAds: (value: boolean) => set({ canRequestPersonalizedAds: value }),
        serverClosed: false,
        setServerClosed: (value: boolean) => set({ serverClosed: value }),
        forceUpdateBlocked: false,
        setForceUpdateBlocked: (value: boolean) => set({ forceUpdateBlocked: value }),
      }),
      {
        name: 'app_config',
        version: 4,
        storage: createJSONStorage(() => AsyncStorage),
        migrate: async (persistedState: any, version: number) => {
          // 초기 설치 또는 저장값 없음
          if (!persistedState) {
            return {
              useMockApi: false,
              canRequestPersonalizedAds: null,
              serverClosed: false,
              forceUpdateBlocked: false,
            } as AppConfigState;
          }
          // v1 -> v2: 새 필드 추가
          if (version < 2) {
            return {
              ...persistedState,
              canRequestPersonalizedAds: null,
            } as AppConfigState;
          }
          // v2 -> v3: serverClosed 추가
          if (version < 3) {
            return {
              ...persistedState,
              serverClosed: false,
            } as AppConfigState;
          }
          // v3 -> v4: forceUpdateBlocked 추가
          if (version < 4) {
            return {
              ...persistedState,
              forceUpdateBlocked: false,
            } as AppConfigState;
          }
          return persistedState as AppConfigState;
        },
      },
    ),
  ),
);


