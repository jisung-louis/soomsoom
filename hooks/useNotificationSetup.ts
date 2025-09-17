import React from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleDiaryNotification } from '../utils/notificationUtils';

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
        const diaryNotification = await AsyncStorage.getItem('diaryNotificationEnabled');
        let diaryNotificationTime = await AsyncStorage.getItem('diaryNotificationTime');
        if (diaryNotification === null) await AsyncStorage.setItem('diaryNotificationEnabled', 'true');
        if (diaryNotificationTime === null) {
          await AsyncStorage.setItem('diaryNotificationTime', '오후 8:30');
          diaryNotificationTime = '오후 8:30';
        }
        const isEnabled = diaryNotification === 'true' || diaryNotification === null;
        if (isEnabled) {
          const timeString = diaryNotificationTime || '오후 8:30';
          await scheduleDiaryNotification(timeString);
        }
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
      const { alarmId, missionType, missionData, missionPack } = notification.request.content.data as { 
        alarmId: string;
        missionType?: string;
        missionData?: any;
        missionPack?: any;
      };
      if (!actionIdentifier || actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        navigationRef.current?.navigate('alarm', {
          screen: 'AlarmDismissScreen',
          params: { 
            alarmId,
            missionType,
            missionData,
            missionPack
          },
        });
      }
    });
    return sub;
  }, [navigationRef]);

  return { setupResponseListener, requestAndInitializeNotifications };
}


