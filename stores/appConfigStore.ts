// 내부 데이터 사용 여부 스토어
// 개발용이므로 프로덕션에서는 삭제되어야 함
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppConfigState {
  useMockApi: boolean;
  setUseMockApi: (value: boolean) => void;
}

export const useAppConfigStore = create<AppConfigState>()(
  devtools(
    persist(
      (set) => ({
        useMockApi: true,
        setUseMockApi: (value: boolean) => set({ useMockApi: value }),
      }),
      {
        name: 'app_config',
        version: 1,
        storage: createJSONStorage(() => AsyncStorage),
      },
    ),
  ),
);


