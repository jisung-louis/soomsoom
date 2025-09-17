import { create } from 'zustand';
import { homeTimeLogService } from '../services/homeTimeLogService';

interface HomeTimeLogStore {
  accumulatedDuration: number; // 누적된 체류 시간 (초)
  logCount: number; // 체류 횟수
  lastFlushTime: number; // 마지막 배치 전송 시간
  
  // 체류 시간 추가
  addDuration: (seconds: number) => void;
  
  // API로 배치 전송
  flushToAPI: () => Promise<void>;
  
  // 스토어 초기화
  reset: () => void;
  
  // 1분이 지났는지 확인
  shouldFlush: () => boolean;
}

export const useHomeTimeLogStore = create<HomeTimeLogStore>((set, get) => ({
  accumulatedDuration: 0,
  logCount: 0,
  lastFlushTime: Date.now(),
  
  addDuration: (seconds: number) => {
    set((state) => ({
      accumulatedDuration: state.accumulatedDuration + seconds,
      logCount: state.logCount + 1,
    }));
    
    console.log(`[HomeTimeLogStore] 체류 시간 누적: +${seconds}초 (총 ${get().accumulatedDuration}초, ${get().logCount}회)`);
  },
  
  flushToAPI: async () => {
    const { accumulatedDuration, logCount } = get();
    
    if (accumulatedDuration === 0) {
      console.log('[HomeTimeLogStore] 전송할 데이터가 없음');
      return;
    }
    
    try {
      console.log(`[HomeTimeLogStore] 배치 전송 시작: ${accumulatedDuration}초, ${logCount}회`);
      
      await homeTimeLogService.logHomeTime({
        durationInSeconds: accumulatedDuration,
      });
      
      // 전송 성공 후 초기화
      set({
        accumulatedDuration: 0,
        logCount: 0,
        lastFlushTime: Date.now(),
      });
      
      console.log('[HomeTimeLogStore] 배치 전송 완료');
    } catch (error) {
      console.error('[HomeTimeLogStore] 배치 전송 실패:', error);
      // 실패해도 계속 누적하도록 함
    }
  },
  
  reset: () => {
    set({
      accumulatedDuration: 0,
      logCount: 0,
      lastFlushTime: Date.now(),
    });
    console.log('[HomeTimeLogStore] 스토어 초기화');
  },
  
  shouldFlush: () => {
    const { lastFlushTime } = get();
    const now = Date.now();
    const oneMinute = 60 * 1000; // 1분
    
    return (now - lastFlushTime) >= oneMinute;
  },
}));
