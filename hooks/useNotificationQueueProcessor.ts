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
import { useToast } from '../contexts/ToastContext';

/**
 * 알림 큐 처리 커스텀 훅
 * 탭에 포커스할 때 큐에 있는 알림을 순차적으로 처리
 */
export const useNotificationQueueProcessor = () => {
  const { processNext, setProcessing, queue, isProcessing } = useNotificationQueueStore();
  const { showToast } = useToast();
  const processingRef = useRef(false);

  /**
   * 다음 알림을 처리하는 함수 (재귀 호출용)
   */
  const processNextNotification = useCallback(() => {
    if (processingRef.current || queue.length === 0) {
      console.log('🚫 다음 알림 처리 스킵:', { isProcessing: processingRef.current, queueLength: queue.length });
      return;
    }

    const notification = processNext();
    if (notification) {
      console.log('📤 다음 알림 처리 시작:', { id: notification.id, type: notification.type });
      processNotification(notification);
    }
  }, [queue.length, processNext]);

  /**
   * 큐에서 다음 알림을 처리하는 함수
   */
  const processNotification = useCallback(async (notification: any) => {
    if (processingRef.current) return;
    
    processingRef.current = true;
    setProcessing(true);

    try {
      const { type, payload } = notification;
      
      // 팝업이 닫힐 때 다음 알림을 처리하는 콜백
      const onPopupClose = () => {
        console.log('🎭 팝업 닫힘 - 다음 알림 처리 시작');
        processingRef.current = false;
        setProcessing(false);
        
        // 큐에 더 있는지 확인하고 다음 알림 처리
        if (queue.length > 0) {
          console.log('⏭️ 다음 알림 처리:', { remainingQueue: queue.length });
          setTimeout(() => {
            processNextNotification();
          }, 100); // 짧은 지연으로 다음 팝업 표시
        }
      };
      
      switch (type) {
        case 'ACHIEVEMENT_UNLOCKED':
          const badgeGrade = payload?.achievementGrade as AchievementGrade;
          const message = String(payload?.aps?.alert?.title || '새로운 업적을 달성했어요!');
          const subMessage = String(payload?.aps?.alert?.body || '새 업적을 달성했어요!');
          const points = Number(payload?.points);
          const popup = createAchievementPopup(badgeGrade, message, subMessage, points, showToast);
          showUniversalPopup(popup, onPopupClose);
          break;

        case 'MISSION_COMPLETED':
          if (payload?.imageUrl) { // 아이템 보상 푸시
            const image = { uri: payload?.imageUrl || '' };
            const message = String(payload?.aps?.alert?.title || '새로운 아이템!');
            const subMessage = String(payload?.aps?.alert?.body || '새 아이템을 받았어요!');
            const popup = createItemRewardPopup(image, message, subMessage);
            showUniversalPopup(popup, onPopupClose);
          } else if (payload?.points) { // 하트 보상 푸시
            const message = String(payload?.aps?.alert?.title || '하트 획득했어요!');
            const subMessage = String(payload?.aps?.alert?.body || '하트를 획득했어요!');
            const amount = payload?.points;
            const popup = createHeartRewardPopup(message, subMessage, amount);
            showUniversalPopup(popup, onPopupClose);
          }
          break;

        case 'REWARD_ACQUIRED':
          if (payload?.points) {
            const message = String(payload?.aps?.alert?.title || '하트 획득했어요!');
            const subMessage = String(payload?.aps?.alert?.body || '하트를 획득했어요!');
            const amount = Number(payload?.points); // 문자열을 숫자로 변환
            const popup = createHeartRewardPopup(message, subMessage, amount);
            console.log('amount 전달 확인:', amount, typeof amount);
            showUniversalPopup(popup, onPopupClose);
          }
          else if (payload?.imageUrl) {
            const image = { uri: payload?.imageUrl || '' };
            const message = String(payload?.aps?.alert?.title || '새로운 아이템!');
            const subMessage = String(payload?.aps?.alert?.body || '새 아이템을 받았어요!');
            const popup = createItemRewardPopup(image, message, subMessage);
            showUniversalPopup(popup, onPopupClose);
          }
          break;

        default:
          console.warn('알 수 없는 알림 타입:', type);
          processingRef.current = false;
          setProcessing(false);
          break;
      }
    } catch (error) {
      console.error('알림 처리 중 오류:', error);
      processingRef.current = false;
      setProcessing(false);
    }
  }, [setProcessing, queue.length, processNextNotification]);

  /**
   * 큐 처리 함수
   * 현재 처리 중이 아니고 큐에 알림이 있을 때만 처리
   */
  const processQueue = useCallback(async () => {
    if (processingRef.current || queue.length === 0) {
      console.log('🚫 큐 처리 스킵:', { isProcessing: processingRef.current, queueLength: queue.length });
      return;
    }

    const notification = processNext();
    if (notification) {
      console.log('📤 알림 처리 시작:', { id: notification.id, type: notification.type });
      // 팝업이 닫힐 때까지 대기 (onPopupClose 콜백에서 다음 알림 처리)
      await processNotification(notification);
    }
  }, [queue.length, processNext, processNotification]);

  /**
   * 탭에 포커스할 때 큐 처리
   */
  useFocusEffect(
    useCallback(() => {
      console.log('🎯 탭 포커스 - 알림 큐 처리 시작, 큐 길이:', queue.length, '처리 중:', processingRef.current);
      
      // 포커스 시 즉시 큐 처리 시작 (처리 중이 아닐 때만)
      if (queue.length > 0 && !processingRef.current) {
        console.log('🚀 큐 처리 시작');
        processNextNotification();
      } else {
        console.log('⏸️ 큐 처리 대기 중:', { queueLength: queue.length, isProcessing: processingRef.current });
      }
    }, [queue.length, processNextNotification])
  );

  return {
    processQueue,
    queueLength: queue.length,
    isProcessing,
  };
};
