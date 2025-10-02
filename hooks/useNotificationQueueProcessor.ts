import { useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useNotificationQueueStore } from '../stores/notificationQueueStore';
import { 
  showUniversalPopup, 
  createAchievementPopup,
  createItemRewardPopup,
  createHeartRewardPopup,
} from '../components/common/popup/UniversalPopup';
import { AchievementGrade } from '../types';

/**
 * 알림 큐 처리 커스텀 훅
 * 탭에 포커스할 때 큐에 있는 알림을 순차적으로 처리
 */
export const useNotificationQueueProcessor = () => {
  const { processNext, setProcessing, queue, isProcessing } = useNotificationQueueStore();
  const processingRef = useRef(false);

  /**
   * 큐에서 다음 알림을 처리하는 함수
   */
  const processNotification = useCallback(async (notification: any) => {
    if (processingRef.current) return;
    
    processingRef.current = true;
    setProcessing(true);

    try {
      const { type, payload } = notification;
      
      switch (type) {
        case 'ACHIEVEMENT_UNLOCKED':
          const badgeGrade = payload?.achievementGrade as AchievementGrade;
          const message = String(payload?.aps?.alert?.title || '새로운 업적을 달성했어요!');
          const subMessage = String(payload?.aps?.alert?.body || '새 업적을 달성했어요!');
          const popup = createAchievementPopup(badgeGrade, message, subMessage);
          showUniversalPopup(popup);
          break;

        case 'MISSION_COMPLETED':
          if (payload?.imageUrl) { // 아이템 보상 푸시
            const image = { uri: payload?.imageUrl || '' };
            const message = String(payload?.aps?.alert?.title || '새로운 아이템!');
            const subMessage = String(payload?.aps?.alert?.body || '새 아이템을 받았어요!');
            const popup = createItemRewardPopup(image, message, subMessage);
            showUniversalPopup(popup);
          } else if (payload?.points) { // 하트 보상 푸시
            const message = String(payload?.aps?.alert?.title || '하트 획득했어요!');
            const subMessage = String(payload?.aps?.alert?.body || '하트를 획득했어요!');
            const amount = payload?.points;
            const popup = createHeartRewardPopup(message, subMessage, amount);
            showUniversalPopup(popup);
          }
          break;

        default:
          console.warn('알 수 없는 알림 타입:', type);
          break;
      }
    } catch (error) {
      console.error('알림 처리 중 오류:', error);
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  }, [setProcessing]);

  /**
   * 큐 처리 함수
   * 현재 처리 중이 아니고 큐에 알림이 있을 때만 처리
   */
  const processQueue = useCallback(async () => {
    if (processingRef.current || queue.length === 0) return;

    const notification = processNext();
    if (notification) {
      // 팝업이 완전히 표시된 후 다음 알림 처리 (2초 지연)
      await processNotification(notification);
      
      // 다음 알림이 있으면 2초 후에 처리
      if (queue.length > 0) {
        setTimeout(() => {
          processQueue();
        }, 2000);
      }
    }
  }, [queue.length, processNext, processNotification]);

  /**
   * 탭에 포커스할 때 큐 처리
   */
  useFocusEffect(
    useCallback(() => {
      console.log('🎯 탭 포커스 - 알림 큐 처리 시작, 큐 길이:', queue.length);
      
      // 포커스 시 즉시 큐 처리 시작
      if (queue.length > 0 && !processingRef.current) {
        processQueue();
      }
    }, [queue.length, processQueue])
  );

  return {
    processQueue,
    queueLength: queue.length,
    isProcessing,
  };
};
