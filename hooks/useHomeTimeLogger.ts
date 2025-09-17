import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useHomeTimeLogStore } from '../stores/homeTimeLogStore';

/**
 * 홈 화면 체류 시간을 추적하고 서버에 로그하는 훅
 */
export const useHomeTimeLogger = () => {
  const startTimeRef = useRef<number | null>(null);
  const isActiveRef = useRef<boolean>(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { addDuration, flushToAPI, shouldFlush, reset } = useHomeTimeLogStore();

  // 1분마다 배치 전송하는 타이머 설정
  const startFlushTimer = useCallback(() => {
    if (flushTimerRef.current) return; // 이미 타이머가 실행 중이면 무시
    
    flushTimerRef.current = setInterval(async () => {
      if (shouldFlush()) {
        await flushToAPI();
      }
    }, 10000); // 10초마다 체크 (1분이 지났는지 확인)
    
    console.log('[HomeTimeLogger] 배치 전송 타이머 시작');
  }, [shouldFlush, flushToAPI]);

  // 배치 전송 타이머 중지
  const stopFlushTimer = useCallback(() => {
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
      console.log('[HomeTimeLogger] 배치 전송 타이머 중지');
    }
  }, []);

  // 홈 화면 진입 시 호출
  const startTracking = useCallback(() => {
    if (isActiveRef.current) return; // 이미 추적 중이면 무시
    
    startTimeRef.current = Date.now();
    isActiveRef.current = true;
    startFlushTimer(); // 배치 전송 타이머 시작
    console.log('[HomeTimeLogger] 홈 화면 체류 시간 추적 시작');
  }, [startFlushTimer]);

  // 홈 화면 이탈 시 호출
  const stopTracking = useCallback(() => {
    if (!isActiveRef.current || !startTimeRef.current) return; // 추적 중이 아니면 무시
    
    const durationInSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    isActiveRef.current = false;
    startTimeRef.current = null;
    
    // 모든 체류 시간을 store에 누적
    if (durationInSeconds > 0) {
      addDuration(durationInSeconds);
    }
    
    // 홈 화면 이탈 시 타이머 중지
    stopFlushTimer();
    
    console.log(`[HomeTimeLogger] 체류 시간 누적: ${durationInSeconds}초, 타이머 중지`);
  }, [addDuration, stopFlushTimer]);

  // 앱 상태 변경 감지 (백그라운드/포어그라운드)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const previousAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      // 앱이 백그라운드로 갈 때 체류 시간 로그 저장
      if (previousAppState === 'active' && nextAppState.match(/inactive|background/)) {
        stopTracking();
        stopFlushTimer();
      }
      // 앱이 포어그라운드로 올 때 추적 시작
      else if (previousAppState.match(/inactive|background/) && nextAppState === 'active') {
        startTracking();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // 컴포넌트 마운트 시 추적 시작
    startTracking();

    return () => {
      subscription?.remove();
      // 컴포넌트 언마운트 시 체류 시간 로그 저장 및 타이머 정리
      stopTracking();
      stopFlushTimer();
    };
  }, [startTracking, stopTracking, stopFlushTimer]);

  // 수동으로 배치 전송하는 함수 (필요한 경우)
  const flushNow = useCallback(async () => {
    await flushToAPI();
  }, [flushToAPI]);

  return {
    startTracking,
    stopTracking,
    flushNow, // 수동 배치 전송
  };
};
