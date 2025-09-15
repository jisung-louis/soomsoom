import dayjs from 'dayjs';
// 초를 분과 초로 변환하는 함수
export const convertSecondsToMinutesAndSeconds = (seconds: number): { minutes: number; seconds: number } => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return { minutes, seconds: remainingSeconds };
};

// 시간을 분으로 변환하는 함수
export const convertTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// 분을 시간과 분으로 변환하는 함수
export const convertMinutesToTime = (totalMinutes: number): { hours: number; minutes: number } => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
};

// 현재 시간으로부터 가장 가까운 미래 알람까지의 시간을 계산하는 함수
export const calculateTimeUntilNextAlarm = (
  currentTime: string,
  alarmTimes: string[]
): { hours: number; minutes: number } | null => {
  if (alarmTimes.length === 0) {
    return null;
  }

  const currentMinutes = convertTimeToMinutes(currentTime);
  let minDiff = Infinity;
  let nextAlarmTime = '';

  // 가장 가까운 미래 알람 찾기
  for (const alarmTime of alarmTimes) {
    const alarmMinutes = convertTimeToMinutes(alarmTime);
    let diff = alarmMinutes - currentMinutes;

    // 자정을 넘어가는 경우 (음수 차이)
    if (diff <= 0) {
      diff += 24 * 60; // 24시간(1440분) 추가
    }

    // 더 가까운 알람이면 업데이트
    if (diff < minDiff) {
      minDiff = diff;
      nextAlarmTime = alarmTime;
    }
  }

  // 미래 알람이 없으면 null 반환
  if (minDiff === Infinity) {
    return null;
  }

  return convertMinutesToTime(minDiff);
};

// 현재 시간을 "HH:MM" 형식으로 반환하는 함수
export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 12시간 형식을 24시간 형식으로 변환
export const convert12To24Hour = (timeString: string): string => {
  const [period, time] = timeString.split(' ');
  const [hour, minute] = time.split(':').map(Number);
  
  let hour24 = hour;
  if (period === '오후' && hour !== 12) {
    hour24 = hour + 12;
  } else if (period === '오전' && hour === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

/**
 * 통합된 시간 파싱 함수들
 * 
 * 🎯 목적:
 * - 여러 파일에 중복된 시간 파싱 로직을 통합
 * - 일관된 시간 처리 방식 제공
 * - 타입 안전성 보장
 */

// 시간 문자열을 시와 분으로 파싱하는 기본 함수
export const parseTimeString = (timeString: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
};

// 24시간 형식을 12시간 형식으로 변환 (오전/오후 포함)
export const convert24To12Hour = (time24: string): { hour12: number; minute: number; period: string } => {
  const { hours, minutes } = parseTimeString(time24);
  const period = hours >= 12 ? '오후' : '오전';
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return { hour12, minute: minutes, period };
};

// 24시간 형식을 12시간 형식 문자열로 변환
export const format24To12HourString = (time24: string): string => {
  const { hour12, minute, period } = convert24To12Hour(time24);
  return `${period} ${hour12}:${minute.toString().padStart(2, '0')}`;
};

// 12시간 형식 문자열을 파싱 (예: "오후 2:30")
export const parse12HourString = (time12String: string): { hour: number; minute: number; period: string } => {
  const [period, time] = time12String.split(' ');
  const [hour, minute] = time.split(':').map(Number);
  
  return { hour, minute, period };
};

// 알람 데이터에서 시간을 파싱하는 함수
export const parseAlarmTime = (alarmTime: string): { hours: number; minutes: number } => {
  return parseTimeString(alarmTime);
};

// 알림 설정에서 시간 데이터를 파싱하는 함수
export const parseNotificationTime = (notificationTime: string): { period: string; hour: number; minute: number } => {
  try {
    const normalized = (notificationTime || '').trim().replace(/\s+/g, ' ');
    const parts = normalized.split(' ');
    const periodRaw = parts[0];
    const timeRaw = parts[1];

    const period = periodRaw === '오전' || periodRaw === '오후' ? periodRaw : '오전';

    if (!timeRaw || !/^\d{1,2}:\d{2}$/.test(timeRaw)) {
      // 기본 안전값 08:30
      return { period, hour: 8, minute: 30 };
    }

    const [h, m] = timeRaw.split(':').map((v) => Number(v));
    const hour = isNaN(h) ? 8 : Math.min(Math.max(h, 1), 12);
    const minute = isNaN(m) ? 30 : Math.min(Math.max(m, 0), 59);

    return { period, hour, minute };
  } catch {
    return { period: '오전', hour: 8, minute: 30 };
  }
};

/**
 * 타임존 관련 유틸리티 함수들
 * 
 * 🎯 목적:
 * - 서버와 클라이언트 간 타임존 일관성 보장
 * - Asia/Seoul 타임존 기준으로 날짜 처리
 */

// 현재 날짜를 Asia/Seoul 타임존 기준으로 반환
export const getCurrentDateInSeoul = (): string => {
  const now = new Date();
  // Asia/Seoul은 UTC+9
  const seoulTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return seoulTime.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};

// 날짜 문자열을 Asia/Seoul 타임존 기준으로 검증
export const validateDateInSeoul = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    const seoulDate = getCurrentDateInSeoul();
    return dateString === seoulDate;
  } catch {
    return false;
  }
};

// 서버에 전송할 날짜 형식으로 변환 (Asia/Seoul 기준)
export const formatDateForServer = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    // Asia/Seoul 타임존으로 변환
    const seoulTime = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    return seoulTime.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  } catch {
    return dateString; // 변환 실패 시 원본 반환
  }
}; 

/**
 * 논리적 "오늘"을 반환하는 함수
 * - 기본 기준 시각: 06시 (06:00~다음날 05:59)
 * - boundaryHour를 바꾸면 기준 시각을 손쉽게 변경 가능 (예: 2시 기준 -> 2)
 */
export const getLogicalNow = (boundaryHour: number = 6) => {
  return dayjs().subtract(boundaryHour, 'hour');
};