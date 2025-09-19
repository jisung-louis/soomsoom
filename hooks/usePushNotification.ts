import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useToast } from '../contexts/ToastContext';
import { useMailboxStore } from '../stores/mailboxStore';

/**
 * 푸시 알림 처리 커스텀 훅
 * 
 * 주요 기능:
 * - 포그라운드/백그라운드 푸시 알림 리스너 설정
 * - 업적 달성, 알람 등 타입별 푸시 처리
 * - 푸시 탭 시 네비게이션 처리
 */
export const usePushNotification = () => {
  const { showToast } = useToast();
  const { loadUnreadCount } = useMailboxStore();

  /**
   * 푸시 알림 처리 함수
   * 업적 달성, 알람 등 다양한 타입의 푸시를 처리
   */
  const handlePushNotification = (notification: Notifications.Notification) => {
    const { data } = notification.request.content;
    console.log('📱 포그라운드 푸시 받음:', notification);
    
    // 업적 달성 푸시 처리
    if (data?.type === 'achievement') {
      showToast({ 
        message: `🎉 ${data.achievementName || '업적'}을 달성했어요!`,
        iconType: 'check',
        hasAnimation: true
      });
      // TODO: 업적 데이터 새로고침 로직 추가
    }
    // 하트 보상 처리
    else if (data?.type === 'reward_heart') {
      showToast({ 
        message: typeof data.message === 'string' ? data.message : '하트를 받았어요!',
        iconType: 'heart'
      });
    }
    // 아이템 보상 처리
    else if (data?.type === 'reward_item') {
        showToast({ 
          message: typeof data.message === 'string' ? data.message : '아이템을 받았어요!',
          iconType: 'heart'
        });
      }
    // 우편함 알림 처리
    else if (data?.type === 'mailbox') {
      showToast({ 
        message: typeof data.message === 'string' ? data.message : '우편함에 새로운 메일이 있어요!',
        iconType: 'heart'
      });
      // 안 읽은 메일 개수 새로고침
      loadUnreadCount();
    }
    // 기타 푸시 처리
    else {
      showToast({ 
        message: notification.request.content.body || '새로운 알림이 있어요!',
        iconType: 'none'
      });
    }
  };

  /**
   * 푸시 알림 탭 처리 함수
   * 사용자가 푸시를 탭했을 때 실행
   */
  const handlePushNotificationTap = (response: Notifications.NotificationResponse) => {
    const { data } = response.notification.request.content;
    console.log('📱 푸시 탭함:', response);
    
    // 업적 달성 푸시 탭 시
    if (data?.type === 'achievement') {
      // TODO: 업적 화면으로 네비게이션
      // navigation.navigate('AchievementScreen');
    }
    // 알람 푸시 탭 시
    else if (data?.type === 'alarm') {
      // TODO: 알람 화면으로 네비게이션
      // navigation.navigate('AlarmTab');
    }
    // 우편함 푸시 탭 시
    else if (data?.type === 'mailbox') {
      // TODO: 우편함 화면으로 네비게이션
      // navigation.navigate('MailboxScreen');
    }
  };

  /**
   * 푸시 알림 리스너 설정
   * 앱이 포그라운드에 있을 때와 백그라운드에서 푸시를 탭했을 때 처리
   */
  useEffect(() => {
    // 포그라운드에서 푸시 받을 때
    const foregroundSubscription = Notifications.addNotificationReceivedListener(handlePushNotification);

    // 푸시를 탭했을 때
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(handlePushNotificationTap);

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return {
    handlePushNotification,
    handlePushNotificationTap,
  };
};
