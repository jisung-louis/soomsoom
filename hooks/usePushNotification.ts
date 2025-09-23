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
  const { loadUnreadCount, unreadCount } = useMailboxStore();
  
  /**
   * 푸시 알림 처리 함수
   * 업적 달성, 알람 등 다양한 타입의 푸시를 처리
   */
  const handlePushNotification = (notification: any) => {
    const { request } = notification;
    const payload = request.trigger.payload;
    console.log('📱 포그라운드 푸시 받음 - 전체 객체 (JSON):', JSON.stringify(notification, null, 2));

    type NotificationType =
      | 'DIARY_REMINDER'
      | 'RE_ENGAGEMENT'
      | 'ACHIEVEMENT_UNLOCKED'
      | 'NEWS_UPDATE'
      | 'REWARD_ACQUIRED'
      | 'HEART_REWARD'; // 아직 이건 명세상 미정

    const data = payload?.notificationType as NotificationType;

    switch (data) {
      case 'DIARY_REMINDER': // 일기 화면 유도, historyId 사용 가능
      case 'RE_ENGAGEMENT': // 홈 진입/혜택 배너 보여주기 등
        break; //위 두 개는 포그라운드에서 상호작용하지 않음

      case 'ACHIEVEMENT_UNLOCKED':
        // 업적 팝업: achievementId, achievementGrade 사용
        const badgeGrade = payload?.achievementGrade as AchievementGrade;
        const message = String(payload?.aps.alert.title || '새로운 업적을 달성했어요!');
        const subMessage = String(payload?.aps.alert.body || '새 업적을 달성했어요!');
        const popup = createAchievementPopup(badgeGrade, message, subMessage);
        showUniversalPopup(popup);
        break;

      case 'NEWS_UPDATE':
        showToast({
          message: '새로운 뉴스가 있어요!',
          theme: 'dark',
          iconType: 'alarm',
        });
        // 이걸 받으면 홈화면의 우편함 뱃지 숫자를 업데이트해야 해
        try { loadUnreadCount(); } catch {}
        break;

      case 'REWARD_ACQUIRED':
        // 보상 팝업: rewardType 보고 분기(POINT/ITEM)
        // imageUrl은 ITEM일 때만
        const rewardType = payload?.rewardType as 'POINT' | 'ITEM';
        if (rewardType === 'POINT') {
          // 서버 SSV로 지급 완료되면 이 푸시가 옴 → 서버 잔액을 즉시 동기화
          (async () => {
            try {
              const res = await getUserPoints();
              const amount = res.points - useCurrencyStore.getState().heartPoints; // 증가한 하트 포인트 개수
              useCurrencyStore.getState().setHeartPoints(res.points);
              showToast({
                amount: amount,
                message: '하트 획득했어요!',
                theme: 'dark',
                iconType: 'heart',
                hasAnimation: true,
              });
            } catch (e) {
              console.warn('하트 동기화 실패:', e);
            }
          })();
        } else if (rewardType === 'ITEM') {
          const image = {uri: payload?.imageUrl || ''};
          const message = String(payload?.aps.alert.title || '새로운 아이템!');
          const subMessage = String(payload?.aps.alert.body || '새 아이템을 받았어요!');
          const popup = createItemRewardPopup(image, message, subMessage);
          showUniversalPopup(popup);
        }
        break;
        
      case 'HEART_REWARD': // 아직 이건 명세상 미정 ('일주일간의 출석을 완료했어요' 리시버)
        const title = String(payload?.aps.alert.title || '하트 획득했어요!');
        const second = String(payload?.aps.alert.body || '하트를 획득했어요!');
        const popup2 = createHeartRewardPopup(title, second);
        showUniversalPopup(popup2);
        
        break;

      default:
        // 나머지는 무시
        break;
    }
    
    // // 업적 달성 푸시 처리
    // if (data?.notificationType === 'achievement') {
    //   console.log('🏆 업적 달성 푸시 처리:', data);
    //   // TODO: 실제 업적 데이터를 받아서 팝업 생성
    //   // 현재는 임시 데이터로 팝업 생성
    //   const tempAchievement = {
    //     achievementId: Number(data.achievementId) || 0,
    //     name: String(data.achievementName || '새로운 업적'),
    //     grade: String(data.grade || 'BRONZE') as 'BRONZE' | 'SILVER' | 'GOLD' | 'SPECIAL',
    //     description: String(data.description || ''),
    //     category: String(data.category || 'DIARY') as 'DIARY' | 'MEDITATION' | 'BREATHING' | 'HIDDEN',
    //     isAchieved: Boolean(data.isAchieved || true),
    //     achievedAt: new Date().toISOString(),
    //   };
      
    //   console.log('🏆 생성된 업적 데이터:', tempAchievement);
    //   const popup = createAchievementPopup(tempAchievement);
    //   showUniversalPopup(popup);
    // }
    // // 하트 보상 처리
    // else if (data?.notificationType === 'reward_heart') {
    //   console.log('💖 하트 보상 푸시 처리:', data);
    //   const amount = Number(data.amount) || 1;
    //   console.log('💖 하트 보상 금액:', amount);
    //   const popup = createHeartRewardPopup(amount);
    //   showUniversalPopup(popup);
    // }
    // // 아이템 보상 처리
    // else if (data?.notificationType === 'reward_item') {
    //   console.log('🎁 아이템 보상 푸시 처리:', data);
    //   const itemName = String(data.itemName || '새로운 아이템');
    //   console.log('🎁 아이템 이름:', itemName);
    //   const popup = createItemRewardPopup(itemName);
    //   showUniversalPopup(popup);
    // }
    // else if (data?.notificationType === 'reward_heart') {
    //   console.log('💖 하트 보상 푸시 처리:', data);
    //   const amount = Number(data.amount) || 1;
    //   console.log('💖 하트 보상 금액:', amount);
    //   const popup = createHeartRewardPopup(amount);
    //   showUniversalPopup(popup);
    // }
    // // 기타 푸시 처리
    // else {
    //   console.log('📱 기타 푸시 처리:', data);
    //   const title = String(data?.title || '알림');
    //   const message = String(data?.message || notification.request.content.body || '새로운 알림이 있어요!');
    //   console.log('📱 제목:', title, '메시지:', message);
    //   const popup = createGenericPopup(title, message);
    //   showUniversalPopup(popup);
    // }
  };

  // /**
  //  * 푸시 알림 탭 처리 함수
  // * 이 부분은 현재 사용하지 않고, useNotificationSetup에서 처리하고 있음
  //  * 사용자가 푸시를 탭했을 때 실행
  //  */
  // const handlePushNotificationTap = (response: Notifications.NotificationResponse) => {
  //   const { data } = response.notification.request.content;
  //   console.log('📱 푸시 탭함:', {json: JSON.stringify(response, null, 2)});
    
  //   // 업적 달성 푸시 탭 시
  //   if (data?.type === 'achievement') {
  //     // TODO: 업적 화면으로 네비게이션
  //     // navigation.navigate('AchievementScreen');
  //   }
  //   // 알람 푸시 탭 시
  //   else if (data?.type === 'alarm') {
  //     // TODO: 알람 화면으로 네비게이션
  //     // navigation.navigate('AlarmTab');
  //   }
  //   // 우편함 푸시 탭 시
  //   else if (data?.type === 'mailbox') {
  //     // TODO: 우편함 화면으로 네비게이션
  //     // navigation.navigate('MailboxScreen');
  //   }
  // };


  /**
   * 백그라운드에서 받은 푸시 처리
   * 앱이 포그라운드로 돌아올 때 실행
   * 
   * ⚠️ 제한사항: getLastNotificationResponseAsync()는 마지막 푸시만 반환
   * 여러 푸시를 모두 처리하려면 서버에서 푸시 히스토리를 제공해야 함
   * 아직 사용하지 않음
   */
  const handleBackgroundPush = async () => {
    try {
      // 마지막으로 받은 푸시 알림 가져오기
      const lastNotification = await Notifications.getLastNotificationResponseAsync();
      
      if (lastNotification && lastNotification.notification) {
        const { data } = lastNotification.notification.request.content;
        console.log('📱 백그라운드에서 받은 푸시 처리:', {
          actionIdentifier: lastNotification.actionIdentifier,
          userText: lastNotification.userText,
          notification: {
            id: lastNotification.notification.request.identifier,
            title: lastNotification.notification.request.content.title,
            body: lastNotification.notification.request.content.body,
            data: data,
            date: lastNotification.notification.date,
          }
        });
        
        // 팝업이 필요한 타입들만 처리
        if (data?.type && ['achievement', 'reward_heart', 'reward_item', 'mailbox'].includes(String(data.type))) {
          // 1초 후 팝업 표시 (앱이 완전히 로드된 후)
          setTimeout(() => {
            handlePushNotification(lastNotification.notification);
          }, 1000);
        }
      }

      // TODO: 서버에서 푸시 히스토리를 가져와서 여러 푸시 처리
      // 예: GET /notifications/history?since=lastAppOpenTime
      // 이렇게 하면 백그라운드에서 받은 모든 푸시를 처리할 수 있음
      
    } catch (error) {
      console.error('❌ 백그라운드 푸시 처리 실패:', error);
    }
  };

  /**
   * 푸시 알림 리스너 설정
   * 앱이 포그라운드에 있을 때와 백그라운드에서 푸시를 탭했을 때 처리
   */
  useEffect(() => {
    // 포그라운드에서 푸시 받을 때
    const foregroundSubscription = Notifications.addNotificationReceivedListener(handlePushNotification);

    // // 푸시를 탭했을 때
    // const responseSubscription = Notifications.addNotificationResponseReceivedListener(handlePushNotificationTap);

    // 앱 상태 변경 리스너 (백그라운드 → 포그라운드)
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('📱 앱이 포그라운드로 돌아옴 - 백그라운드 푸시 확인');
        handleBackgroundPush();
      }
    });

    return () => {
      foregroundSubscription.remove();
      //responseSubscription.remove();
      appStateSubscription?.remove();
    };
  }, []);

  return {
    handlePushNotification,
    //handlePushNotificationTap,
  };
};
