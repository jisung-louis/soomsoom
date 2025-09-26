import * as Notifications from 'expo-notifications';

// 1. 기본 알림 테스트 (1초 후)
export const testBasicNotification = async () => {
  try {
    console.log('=== 기본 알림 테스트 시작 ===');
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "기본 테스트",
        body: "1초 후 알림이 옵니다!",
        sound: 'default_alarm_audio.wav',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(Date.now() + 1000 * 1),
      },
    });
    
    console.log('알림 예약 성공 - ID:', notificationId);
    return true;
  } catch (error) {
    console.error('기본 알림 테스트 실패:', error);
    return false;
  }
};

// 2. 특정 시간 알림 테스트 (10초 후)
export const testScheduledNotification = async () => {
  try {
    console.log('=== 특정 시간 알림 테스트 시작 ===');
    
    const futureTime = new Date();
    futureTime.setSeconds(futureTime.getSeconds() + 10); // 10초 후
    
    console.log('예약 시간:', futureTime.toLocaleString());
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "예약 테스트",
        body: "10초 후 알림이 옵니다!",
        sound: 'default_alarm_audio.wav',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        //date: futureTime,
        date: new Date(Date.now() + 1000 * 10),
      },
    });
    
    console.log('알림 예약 성공 - ID:', notificationId);
    return true;
  } catch (error) {
    console.error('10초 후 알림 테스트 실패:', error);
    return false;
  }
};

// 3. 반복 알림 테스트 (1분 마다)
export const testRepeatingNotification1Minute = async () => {
  try {
    console.log('=== 반복 알림 테스트 시작 ===');
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "반복 테스트",
        body: "1분 마다 알림이 옵니다!",
        sound: 'default_alarm_audio.wav',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60,
        repeats: true,
      },
    });

    console.log('반복 알림 예약 성공 - ID:', notificationId);
    return true;
  } catch (error) {
    console.error('반복 알림 테스트 실패:', error);
    return false;
  }
};

// 4. 반복 알림 테스트 (매일 특정 시간)
export const testRepeatingNotification = async () => {
  try {
    console.log('=== 반복 알림 테스트 시작 ===');
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "반복 테스트",
        body: "매일 이 시간에 알림이 옵니다!",
        sound: 'default_alarm_audio.wav',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        hour: 15, // 오후 2시
        minute: 48,
        weekday: 3,
      },
    });
    
    console.log('반복 알림 예약 성공 - ID:', notificationId);
    return true;
  } catch (error) {
    console.error('반복 알림 테스트 실패:', error);
    return false;
  }
};

// 4. 현재 예약된 알림 확인
export const checkScheduledNotifications = async () => {
  try {
    console.log('=== 예약된 알림 확인 ===');
    
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('예약된 알림 개수:', notifications.length);
    
    notifications.forEach((notification, index) => {
      console.log(`알림 ${index + 1}:`);
      console.log(`  - ID: ${notification.identifier}`);
      console.log(`  - 제목: ${notification.content.title}`);
      console.log(`  - 내용: ${notification.content.body}`);
      console.log(`  - 트리거:`, notification.trigger);
    });
    
    return notifications;
  } catch (error) {
    console.error('예약된 알림 확인 실패:', error);
    return [];
  }
};

// 5. 모든 알림 취소
export const clearAllNotifications = async () => {
  try {
    console.log('=== 모든 알림 취소 ===');
    
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('모든 알림이 취소되었습니다.');
    
    return true;
  } catch (error) {
    console.error('알림 취소 실패:', error);
    return false;
  }
};

// 6. 권한 확인
export const checkPermissions = async () => {
  try {
    console.log('=== 권한 확인 ===');
    console.log(Notifications.SchedulableTriggerInputTypes);
    
    const { status } = await Notifications.getPermissionsAsync();
    console.log('알림 권한 상태:', status);
    
    return status;
  } catch (error) {
    console.error('권한 확인 실패:', error);
    return 'unknown';
  }
}; 

// 마음일기 알림 스케줄링 함수 //// 로컬 다이어리 스케줄 제거 (서버 FCM 전환)
// export const scheduleDiaryNotification = async (timeString: string) => {
//   try {
//     const { convert12To24Hour } = await import('./timeUtils');
//     const time24Format = convert12To24Hour(timeString);
//     console.log('마음일기 알림 스케줄링:', `${timeString} -> ${time24Format}`);
    
//     const { scheduleAlarm, cancelAlarmNotifications } = await import('../services/alarmNotificationService');
    
//     // 기존 알림 취소
//     await cancelAlarmNotifications('diary_notification');
    
//     // 새로운 알림 스케줄링
//     const success = await scheduleAlarm({
//       id: 'diary_notification',
//       time: time24Format,
//       repeatDays: ['일', '월', '화', '수', '목', '금', '토'],
//       soundName: '기본',
//       isVibrationOn: true,
//       title: '마음일기 작성 시간입니다',
//       body: '오늘 하루는 어떠셨나요? 마음일기를 작성해보세요.',
//       isBurstMode: false, // 🔥 단일 모드
//     });
    
//     if (success) {
//       console.log('마음일기 알림 스케줄링 완료:', time24Format);
//       return true;
//     } else {
//       console.error('마음일기 알림 스케줄링 실패');
//       return false;
//     }
//   } catch (error) {
//     console.error('마음일기 알림 스케줄링 실패:', error);
//     return false;
//   }
// }; 