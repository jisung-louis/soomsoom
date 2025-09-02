import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_CURRENCY_STATE } from '../constants/initialStates';

interface CurrencyState {
  // 하트 포인트 (기본 화폐)
  heartPoints: number;
  
  // 액션들
  addHeartPoints: (amount: number) => void;
  spendHeartPoints: (amount: number) => boolean;
  
  // 보상 시스템
  giveDailyReward: () => void;
  giveEmotionRecordReward: () => void;
  giveMeditationReward: () => void;
  giveStreakBonus: (streakDays: number) => void;
  giveTestReward: () => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      // 초기 상태 (상수에서 가져옴)
      heartPoints: INITIAL_CURRENCY_STATE.heartPoints,
      
      // 하트 포인트 관리
      addHeartPoints: (amount: number) => {
        set((state) => ({
          heartPoints: state.heartPoints + amount
        }));
      },
      
      spendHeartPoints: (amount: number) => {
        const { heartPoints } = get();
        if (heartPoints >= amount) {
          set((state) => ({
            heartPoints: state.heartPoints - amount
          }));
          return true;
        }
        return false;
      },
      
      // 보상 시스템
      giveTestReward: () => {
        const { addHeartPoints } = get();
        addHeartPoints(10); // 테스트 보상 10포인트
      },
      giveDailyReward: () => {
        const { addHeartPoints } = get();
        addHeartPoints(50); // 일일 보상 50포인트
      },
      
      giveEmotionRecordReward: () => {
        const { addHeartPoints } = get();
        addHeartPoints(10); // 감정 기록 보상 10포인트
      },
      
      giveMeditationReward: () => {
        const { addHeartPoints } = get();
        addHeartPoints(20); // 명상 완료 보상 20포인트
      },
      
      giveStreakBonus: (streakDays: number) => {
        const { addHeartPoints } = get();
        const bonus = Math.min(streakDays * 5, 50); // 연속 기록 보너스 (최대 50)
        addHeartPoints(bonus);
      },
    }),
    {
      name: 'currency-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
