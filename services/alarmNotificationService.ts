import * as Notifications from 'expo-notifications';
import { parseAlarmTime } from '../utils/timeUtils';
import { MathMission, MultiStepMission } from '../utils/mathMissionGenerator';
import { buildAlarmNotificationContent } from '../utils/notificationContentBuilder';

// iOS/alarm 사운드 정규화 (확장자 중복 방지 및 기본음 처리)
const normalizeIosSoundName = (soundName: string): 'default' | string => {
  if (!soundName) return 'default';
  const raw = String(soundName).trim();
  if (raw === '기본' || raw.toLowerCase() === 'default') return 'default';

  const m = raw.toLowerCase().match(/^(.*?)(\.(wav|mp3|caf))?$/i);
  const base = m?.[1] ?? raw.toLowerCase();
  const ext = (m?.[3] ?? '').toLowerCase();

  if (ext === 'wav' || ext === 'mp3' || ext === 'caf') return `${base}.${ext}`;
  return `${base}.wav`; // 확장자 없으면 기본 wav
};

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

// 미션 기반 알림 카테고리 설정
export const setupMissionNotificationCategory = async () => {
  try {
    console.log('🔧 미션 알림 카테고리 설정 시작...');
    
    const actions = [];
    
    // 0~9 숫자 버튼
    for (let i = 0; i <= 9; i++) {
      actions.push({
        identifier: `answer_${i}`,
        buttonTitle: String(i)
      });
    }
    
    console.log('🔧 액션 목록:', actions);
    
    await Notifications.setNotificationCategoryAsync('MISSION_ALARM', actions);
    console.log('✅ 미션 알림 카테고리 설정 완료');
  } catch (error) {
    console.error('❌ 미션 알림 카테고리 설정 실패:', error);
  }
};

export const REPEAT_WINDOW_MINUTES = 5;

// 특정 시작 시각부터 N분 동안 1분 간격으로 알림 예약
const scheduleBurstPerMinute = async (params: {
  alarmId: string;
  startDate: Date;
  minutesWindow: number;
  title: string;
  body: string;
  soundName: string;
  data: object;
  categoryIdentifier?: string;
}): Promise<boolean> => {
  try {
    const { alarmId, startDate, minutesWindow, title, body, soundName, data, categoryIdentifier } = params;
    const notificationIds: string[] = [];

    for (let i = 0; i < minutesWindow; i++) {
      const triggerDate = new Date(startDate.getTime());
      triggerDate.setMinutes(triggerDate.getMinutes() + i);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: normalizeIosSoundName(soundName),
          data: { alarmId, soundName, notificationType: 'ALARM', ...data },
          ...(categoryIdentifier ? { categoryIdentifier } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
      notificationIds.push(notificationId);
    }

    console.log(`버스트 알림 예약 완료 - IDs: ${notificationIds.join(', ')}`);
    return true;
  } catch (error) {
    console.error('버스트 알림 예약 실패:', error);
    return false;
  }
};

// 일회성 일반 알람 예약
const scheduleOneTimeRegularAlarm = async (alarmData: {
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

    console.log(`일회성 일반 알람 설정: ${alarmData.time} -> ${alarmTime.toLocaleString()}`);

    const { title, body } = buildAlarmNotificationContent({ alarmData });

    return await scheduleBurstPerMinute({
      alarmId: alarmData.id,
      startDate: alarmTime,
      minutesWindow: REPEAT_WINDOW_MINUTES,
      title,
      body,
      soundName: alarmData.soundName,
      data: { time: alarmData.time, notificationType: 'ALARM' },
    });
  } catch (error) {
    console.error('일회성 일반 알람 예약 실패:', error);
    return false;
  }
};

// 일회성 미션 알람 예약
const scheduleOneTimeMissionAlarm = async (alarmData: {
  id: string;
  time: string;
  soundName: string;
  isVibrationOn: boolean;
  title?: string;
  body?: string;
  mission: MultiStepMission | MathMission;
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

    console.log(`일회성 미션 알람 설정: ${alarmData.time} -> ${alarmTime.toLocaleString()}`);

    // 미션 알림 카테고리 설정
    //await setupMissionNotificationCategory(); // 미션 알림 카테고리 설정 주석 처리

    const isMulti = (alarmData.mission as MultiStepMission).missions !== undefined;
    const currentMission: MathMission = isMulti
      ? (alarmData.mission as MultiStepMission).missions[(alarmData.mission as MultiStepMission).currentIndex]
      : (alarmData.mission as MathMission);

    const { title, body } = buildAlarmNotificationContent({ alarmData, currentMission });

    return await scheduleBurstPerMinute({
      alarmId: alarmData.id,
      startDate: alarmTime,
      minutesWindow: REPEAT_WINDOW_MINUTES,
      title,
      body,
      soundName: alarmData.soundName,
      data: {
        notificationType: 'ALARM',
        alarmId: alarmData.id,
        time: alarmData.time,
        missionType: 'math',
        missionData: currentMission,
        missionPack: isMulti ? alarmData.mission : undefined
      },
      //categoryIdentifier: 'MISSION_ALARM',
    });
  } catch (error) {
    console.error('일회성 미션 알람 예약 실패:', error);
    return false;
  }
};

// 반복 일반 알람 예약
const scheduleWeeklyRegularAlarm = async (alarmData: {
  id: string;
  time: string;
  repeatDays: string[];
  soundName: string;
  isVibrationOn: boolean;
  title?: string;
  body?: string;
  isBurstMode?: boolean;
  burstWindowMinutes?: number;
}): Promise<boolean> => {
  try {
    const { hours, minutes } = parseAlarmTime(alarmData.time);
    const repeatDays = alarmData.repeatDays;

    console.log(`반복 일반 알람 설정 시작: ${alarmData.time}, 요일: ${repeatDays.join(', ')}`);

    for (const day of repeatDays) {
      const weekday = convertDayToNumber(day);
      console.log(`요일 ${day} (${weekday}) 알림 예약 중...`);

      try {
        // 이번 주 해당 요일 날짜 계산
        const now = new Date();
        const currentWeekday = now.getDay() === 0 ? 7 : now.getDay(); // 일요일은 0이므로 7로 변환
        let daysUntilTarget = weekday - currentWeekday;
        if (daysUntilTarget < 0) {
          daysUntilTarget += 7;
        }
        const firstTriggerDate = new Date(now);
        firstTriggerDate.setDate(now.getDate() + daysUntilTarget);
        firstTriggerDate.setHours(hours, minutes, 0, 0);

        // 만약 첫 알림 시간이 이미 지났으면 다음 주로
        if (firstTriggerDate <= now) {
          firstTriggerDate.setDate(firstTriggerDate.getDate() + 7);
        }

        const { title, body } = buildAlarmNotificationContent({ alarmData });

        // 버스트 모드 여부에 따라 분기
        if (alarmData.isBurstMode !== false) {
          // 버스트 모드 (기본값)
          await scheduleBurstPerMinute({
            alarmId: alarmData.id,
            startDate: firstTriggerDate,
            minutesWindow: alarmData.burstWindowMinutes || REPEAT_WINDOW_MINUTES,
            title,
            body,
            soundName: alarmData.soundName,
            data: { time: alarmData.time, day: day, notificationType: 'ALARM' },
          });
          console.log(`요일 ${day} 일반 알림 버스트 예약 완료`);
        } else {
          // 단일 모드 (마음일기 알림용)
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              sound: normalizeIosSoundName(alarmData.soundName),
              data: { alarmId: alarmData.id, time: alarmData.time, day: day, soundName: alarmData.soundName, notificationType: 'ALARM' },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday: weekday,
              hour: hours,
              minute: minutes,
            },
          });
          console.log(`요일 ${day} 일반 알림 단일 예약 완료: ${notificationId}`);
        }
      } catch (dayError) {
        console.error(`요일 ${day} 일반 알림 예약 실패:`, dayError);
        throw dayError;
      }
    }

    console.log(`${repeatDays.join(', ')} ${alarmData.time} 반복 일반 알람이 예약되었습니다`);
    return true;
  } catch (error) {
    console.error('반복 일반 알람 예약 실패:', error);
    return false;
  }
};

// 반복 미션 알람 예약
const scheduleWeeklyMissionAlarm = async (alarmData: {
  id: string;
  time: string;
  repeatDays: string[];
  soundName: string;
  isVibrationOn: boolean;
  title?: string;
  body?: string;
  mission: MultiStepMission | MathMission;
}): Promise<boolean> => {
  try {
    const { hours, minutes } = parseAlarmTime(alarmData.time);
    const repeatDays = alarmData.repeatDays;

    console.log(`반복 미션 알람 설정 시작: ${alarmData.time}, 요일: ${repeatDays.join(', ')}`);

    // 미션 알림 카테고리 설정
    //await setupMissionNotificationCategory(); // 미션 알림 카테고리 설정 주석 처리

    for (const day of repeatDays) {
      const weekday = convertDayToNumber(day);
      console.log(`요일 ${day} (${weekday}) 미션 알림 예약 중...`);

      try {
        // 이번 주 해당 요일 날짜 계산
        const now = new Date();
        const currentWeekday = now.getDay() === 0 ? 7 : now.getDay(); // 일요일은 0이므로 7로 변환
        let daysUntilTarget = weekday - currentWeekday;
        if (daysUntilTarget < 0) {
          daysUntilTarget += 7;
        }
        const firstTriggerDate = new Date(now);
        firstTriggerDate.setDate(now.getDate() + daysUntilTarget);
        firstTriggerDate.setHours(hours, minutes, 0, 0);

        // 만약 첫 알림 시간이 이미 지났으면 다음 주로
        if (firstTriggerDate <= now) {
          firstTriggerDate.setDate(firstTriggerDate.getDate() + 7);
        }

        const isMulti = (alarmData.mission as MultiStepMission).missions !== undefined;
        const currentMission: MathMission = isMulti
          ? (alarmData.mission as MultiStepMission).missions[(alarmData.mission as MultiStepMission).currentIndex]
          : (alarmData.mission as MathMission);

        const { title, body } = buildAlarmNotificationContent({ alarmData, currentMission });

        await scheduleBurstPerMinute({
          alarmId: alarmData.id,
          startDate: firstTriggerDate,
          minutesWindow: REPEAT_WINDOW_MINUTES,
          title,
          body,
          soundName: alarmData.soundName,
          data: {
            notificationType: 'ALARM',
            alarmId: alarmData.id,
            time: alarmData.time,
            day: day,
            missionType: 'math',
            missionData: currentMission,
            missionPack: isMulti ? alarmData.mission : undefined
          },
          //categoryIdentifier: 'MISSION_ALARM',
        });

        console.log(`요일 ${day} 미션 알림 버스트 예약 완료`);
      } catch (dayError) {
        console.error(`요일 ${day} 미션 알림 예약 실패:`, dayError);
        throw dayError;
      }
    }

    console.log(`${repeatDays.join(', ')} ${alarmData.time} 반복 미션 알람이 예약되었습니다`);
    return true;
  } catch (error) {
    console.error('반복 미션 알람 예약 실패:', error);
    return false;
  }
};

// 일회성 알람 예약 (미션 유무에 따라 분기)
export const scheduleOneTimeAlarm = async (alarmData: {
  id: string;
  time: string;
  soundName: string;
  isVibrationOn: boolean;
  title?: string;
  body?: string;
  mission?: MultiStepMission | MathMission | null;
}): Promise<boolean> => {
  try {
    if (alarmData.mission) {
      return await scheduleOneTimeMissionAlarm(alarmData as any);
    } else {
      return await scheduleOneTimeRegularAlarm(alarmData);
    }
  } catch (error) {
    console.error('일회성 알람 예약 실패:', error);
    return false;
  }
};

// 반복 알람 예약 (미션 유무에 따라 분기)
export const scheduleWeeklyAlarm = async (alarmData: {
  id: string;
  time: string;
  repeatDays: string[];
  soundName: string;
  isVibrationOn: boolean;
  title?: string;
  body?: string;
  mission?: MultiStepMission | MathMission | null;
  isBurstMode?: boolean;
  burstWindowMinutes?: number;
}): Promise<boolean> => {
  try {
    if (alarmData.mission) {
      return await scheduleWeeklyMissionAlarm(alarmData as any);
    } else {
      return await scheduleWeeklyRegularAlarm(alarmData);
    }
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
  mission?: MultiStepMission | MathMission | null;
  isBurstMode?: boolean;
  burstWindowMinutes?: number;
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

// 모든 스케줄된 알림 취소 (로그아웃 시 사용)
export const cancelAllScheduledNotifications = async (): Promise<boolean> => {
  try {
    console.log('🔕 모든 스케줄된 알림 취소 시작...');
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ 모든 스케줄된 알림 취소 완료');
    return true;
  } catch (error) {
    console.error('❌ 모든 알림 취소 실패:', error);
    return false;
  }
};