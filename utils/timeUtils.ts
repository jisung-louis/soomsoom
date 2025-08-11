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