import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useToast } from '../contexts/ToastContext';
import { useMailboxStore } from '../stores/mailboxStore';
import { useCurrencyStore } from '../stores/currencyStore';
import { getUserPoints } from '../services/userService';
import { 
  showUniversalPopup, 
  createAchievementPopup,
  createItemRewardPopup,
  createHeartRewardPopup,
  createGenericPopup 
} from '../components/common/popup/UniversalPopup';
import { AchievementGrade } from '../types';
import { ss, sv } from '../utils/scale';
import { typography } from '../constants/typography';
import { useAchievementStore } from '../stores/achievementStore';
import { useNotificationQueueStore } from '../stores/notificationQueueStore';

/**
 * 푸시 알림 처리 커스텀 훅
 * 
 * 주요 기능:
 * - 포그라운드/백그라운드 푸시 알림 리스너 설정
 * - 업적 달성, 알람 등 타입별 푸시 처리
 * - 푸시 탭 시 네비게이션 처리
 */


export type NotificationType =
| 'DIARY_REMINDER'
| 'RE_ENGAGEMENT'
| 'ACHIEVEMENT_UNLOCKED'
| 'NEWS_UPDATE'
| 'MISSION_COMPLETED'
| 'ALARM'
| 'REWARD_ACQUIRED';

export const usePushNotification = () => {
  const { showToast } = useToast();
  const { loadUnreadCount, unreadCount } = useMailboxStore();
  const { addToQueue } = useNotificationQueueStore();

  /**
   * 푸시 알림 처리 함수
   * 업적 달성, 알람 등 다양한 타입의 푸시를 처리
   * 이제 큐에 저장하여 탭 포커스 시에만 표시
   */
  const handlePushNotification = (notification: any) => {
    const { request } = notification;
    const payload = request.trigger.payload;
    console.log('📱 포그라운드 푸시 받음 - 전체 객체 (JSON):', JSON.stringify(notification, null, 2));

    const data = payload?.notificationType as NotificationType;

    // 큐에 저장할 알림 타입들만 처리
    switch (data) {
      case 'DIARY_REMINDER': 
      case 'RE_ENGAGEMENT': 
        break; //위 두 개는 포그라운드에서 상호작용하지 않음

      case 'ACHIEVEMENT_UNLOCKED':
        // 업적 팝업을 큐에 저장
        try {
          // 백그라운드 동기화 (UI 블로킹 X)
          useAchievementStore.getState().loadUserAchievements('ALL')
            .catch((e) => console.warn('업적 동기화 실패:', e));
        } catch {}
        addToQueue({
          type: 'ACHIEVEMENT_UNLOCKED',
          payload: payload,
        });
        break;

      case 'NEWS_UPDATE':
        // 뉴스 업데이트는 즉시 토스트 표시 (큐에 저장하지 않음)
        showToast({
          message: '새로운 뉴스가 있어요!',
          theme: 'dark',
          iconType: 'alarm',
        });
        // 이걸 받으면 홈화면의 우편함 뱃지 숫자를 업데이트해야 해
        try { loadUnreadCount(); } catch {}
        break;

      case 'MISSION_COMPLETED':
        // 미션 완료 팝업을 큐에 저장
        addToQueue({
          type: 'MISSION_COMPLETED',
          payload: payload,
        });
        break;

      case 'ALARM':
        // AlarmDismissScreen으로 이동 (큐에 저장하지 않음)
        break;

      case 'REWARD_ACQUIRED':
        addToQueue({
          type: 'REWARD_ACQUIRED',
          payload: payload,
        });
        break;

      default:
        // 나머지는 무시
        break;
    }
  };



  /**
   * 푸시 알림 리스너 설정
   * 앱이 포그라운드에 있을 때와 백그라운드에서 푸시를 탭했을 때 처리
   */
  useEffect(() => {
    // 포그라운드에서 푸시 받을 때
    const foregroundSubscription = Notifications.addNotificationReceivedListener(handlePushNotification);

    // 앱 상태 변경 리스너 (백그라운드 → 포그라운드)
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('📱 앱이 백그라운드에서 포그라운드로 돌아옴');
      }
    });

    return () => {
      foregroundSubscription.remove();
      appStateSubscription?.remove();
    };
  }, []);

  return {
    handlePushNotification,
  };
};
