import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { logScreenView } from '../utils/analytics';

/**
 * 화면 포커스 시 Firebase Analytics에 screen_view 이벤트를 기록하는 공용 훅
 */
export const useScreenAnalytics = (screenName: string) => {
  useFocusEffect(
    useCallback(() => {
      logScreenView(screenName).catch((error) => {
        console.warn('⚠️ Analytics 화면 조회 이벤트 로깅 실패:', error);
      });
    }, [screenName])
  );
};

