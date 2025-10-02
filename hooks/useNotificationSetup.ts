import React from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationType } from './usePushNotification';
import { trackNotificationClick } from '../services/notificationService';

/**
 * 알림 핸들러, 응답 리스너, 초기 스케줄 설정을 담당하는 훅
 * - 화면 외부(앱 스코프)에서 1회 등록되는 핸들러는 App.tsx에서 기존처럼 유지하고
 * - 나머지 설정/리스너는 이 훅으로 캡슐화합니다.
 */
export function useNotificationSetup(navigationRef: React.RefObject<any>) {
  // 온보딩 단계에서 호출: 권한 확인/요청 → 허용 시 기본 설정 보장 + 일기 알림 스케줄
  const requestAndInitializeNotifications = React.useCallback(async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      let final = status;
      if (status !== 'granted') {
        const req = await Notifications.requestPermissionsAsync();
        final = req.status;
      }
      if (final === 'granted') {
        // 로컬 스케줄링 제거: 서버가 FCM 발송을 담당
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // 앱 수신 응답 리스너만 등록
  const setupResponseListener = React.useCallback(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const { actionIdentifier, notification } = response;
      console.log('📱 앱 수신 응답 리스너:', JSON.stringify(response, null, 2));
      const { alarmId, missionType, missionData, missionPack } = notification.request.content.data as { 
        alarmId: string;
        missionType?: string;
        missionData?: any;
        missionPack?: any;
      };

      const n = response.notification;
      const dataForAlarm = n.request.content?.data?.notificationType as NotificationType; // 알람 관련 notification은 여기에 데이터 존재
      const payload = (response.notification.request.trigger as any)?.payload;
      const dataForOther = payload?.notificationType ?? {}; // 나머지 notification은 여기에 데이터 존재
      
      if (!actionIdentifier || actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {

      switch(dataForAlarm) {
        case 'ALARM':
          navigationRef.current?.navigate('alarm', {
            screen: 'AlarmDismissScreen',
            params: { 
              alarmId,
              missionType,
              missionData,
              missionPack
            },
          });
          break;
        default:
          break;
      }

      switch(dataForOther) {
        case 'DIARY_REMINDER':
        case 'RE_ENGAGEMENT':
        case 'ACHIEVEMENT_UNLOCKED':
        case 'NEWS_UPDATE':
        case 'MISSION_COMPLETED':
        case 'REWARD_ACQUIRED':
        default:
          if(payload?.historyId) {
            trackNotificationClick(payload.historyId);
            console.log('✅ 알림 클릭 추적 성공:', payload.historyId);
          }
          else {
            console.log('❌ 알림 클릭 추적 실패: historyId가 없습니다.');
          }
          break;
      }
        
    }
    });
    return () => sub.remove();
  }, [navigationRef]);

  return { setupResponseListener, requestAndInitializeNotifications };
}


