import * as Notifications from 'expo-notifications';
import { parseAlarmTime } from '../utils/timeUtils';

// 알림 권한 요청
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('알림 권한 요청 실패:', error);
    return false;
  }
};

// 요일을 숫자로 변환 (iOS 표준: 1=일요일, 2=월요일, ..., 7=토요일)
const convertDayToNumber = (day: string): number => {
  const dayMap: { [key: string]: number } = {
    '일': 1,
    '월': 2,
    '화': 3,
    '수': 4,
    '목': 5,
    '금': 6,
    '토': 7,
  };
  const result = dayMap[day] || 1;
  console.log(`요일 변환: ${day} -> ${result}`);
  return result;
};

// 일회성 알람 예약
export const scheduleOneTimeAlarm = async (alarmData: {
  id: string;
  time: string;
  soundName: string;
  isVibrationOn: boolean;
  title?: string;
  body?: string;
}): Promise<boolean> => {
  try {
    const { hours, minutes } = parseAlarmTime(alarmData.time);
    
    // 다음 알람 시간 계산
    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(hours, minutes, 0, 0);
    
    // 오늘 알람 시간이 지났으면 내일로 설정
    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }
    
    console.log(`일회성 알람 설정: ${alarmData.time} -> ${alarmTime.toLocaleString()}`);
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: alarmData.title || "알람",
        body: alarmData.body || `알람 시간입니다 (${alarmData.time})`,
        sound: alarmData.soundName === '기본' ? 'default' : `${alarmData.soundName}.wav`,
        data: {
          alarmId: alarmData.id,
          time: alarmData.time,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: alarmTime,
      },
    });
    
    console.log(`일회성 알람 예약 완료 - ID: ${notificationId}`);
    return true;
  } catch (error) {
    console.error('일회성 알람 예약 실패:', error);
    return false;
  }
};

// 반복 알람 예약
export const scheduleWeeklyAlarm = async (alarmData: {
  id: string;
  time: string;
  repeatDays: string[];
  soundName: string;
  isVibrationOn: boolean;
  title?: string;
  body?: string;
}): Promise<boolean> => {
  try {
    const { hours, minutes } = parseAlarmTime(alarmData.time);
    const repeatDays = alarmData.repeatDays;

    console.log(`반복 알람 설정 시작: ${alarmData.time}, 요일: ${repeatDays.join(', ')}`);

    for (const day of repeatDays) {
      const weekday = convertDayToNumber(day);
      console.log(`요일 ${day} (${weekday}) 알림 예약 중...`);

      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: alarmData.title || "알람",
            body: alarmData.body || `알람 시간입니다 (${alarmData.time})`,
            sound: alarmData.soundName === '기본' ? 'default' : `${alarmData.soundName}.wav`,
            data: {
              alarmId: alarmData.id,
              time: alarmData.time,
              day: day,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: weekday,
            hour: hours,
            minute: minutes,
          },
        });
        console.log(`요일 ${day} 알림 예약 완료 - ID: ${notificationId}`);
      } catch (dayError) {
        console.error(`요일 ${day} 알림 예약 실패:`, dayError);
        throw dayError;
      }
    }
    
    console.log(`${repeatDays.join(', ')} ${alarmData.time} 반복 알람이 예약되었습니다`);
    return true;
  } catch (error) {
    console.error('반복 알람 예약 실패:', error);
    return false;
  }
};

// 알람 예약 메인 함수
export const scheduleAlarm = async (alarmData: {
  id: string;
  time: string;
  repeatDays: string[];
  soundName: string;
  isVibrationOn: boolean;
  title?: string;
  body?: string;
}): Promise<boolean> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      throw new Error('알림 권한이 필요합니다');
    }

    // 반복 설정에 따라 알림 예약
    if (alarmData.repeatDays.length > 0) {
      return await scheduleWeeklyAlarm(alarmData);
    } else {
      return await scheduleOneTimeAlarm(alarmData);
    }
  } catch (error) {
    console.error('알람 예약 실패:', error);
    return false;
  }
};

// 특정 알람의 알림 취소
export const cancelAlarmNotifications = async (alarmId: string): Promise<boolean> => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    const targetNotifications = notifications.filter(
      notification => notification.content.data?.alarmId === alarmId
    );
    
    for (const notification of targetNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      console.log(`알람 ${alarmId} 알림 취소: ${notification.identifier}`);
    }
    
    return true;
  } catch (error) {
    console.error('알람 알림 취소 실패:', error);
    return false;
  }
}; 