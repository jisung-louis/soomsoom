// 요일을 숫자로 변환 (iOS 표준: 1=일요일, 2=월요일, ..., 7=토요일)
const convertDayToNumber = (day: string): number => {
  const dayOrder = ['일', '월', '화', '수', '목', '금', '토'];
  return dayOrder.indexOf(day);
};

// 요일 정렬 함수
export const sortDays = (days: string[]): string[] => {
  return days.sort((a, b) => {
    const indexA = convertDayToNumber(a);
    const indexB = convertDayToNumber(b);
    return indexA - indexB;
  });
};

// 요일 표시 텍스트 생성
export const getDayDisplayText = (days: string[]): string => {
  if (!days || days.length === 0) {
    return '반복 없음';
  }

  const sortedDays = sortDays(days);
  
  // 평일 체크 (월,화,수,목,금)
  const weekdays = ['월', '화', '수', '목', '금'];
  const isWeekdays = weekdays.every(day => sortedDays.includes(day)) && 
                     sortedDays.length === 5;
  
  if (isWeekdays) {
    return '평일';
  }
  
  // 주말 체크 (토,일)
  const weekends = ['토', '일'];
  const isWeekends = weekends.every(day => sortedDays.includes(day)) && 
                     sortedDays.length === 2;
  
  if (isWeekends) {
    return '주말';
  }
  
  // 3개 이상 요일인 경우 "x, y 및 z" 형식
  if (sortedDays.length >= 3) {
    const allButLast = sortedDays.slice(0, -1);
    const last = sortedDays[sortedDays.length - 1];
    return `${allButLast.join(', ')} 및 ${last}`;
  }
  
  // 2개 이하 요일인 경우 그대로 표시
  return sortedDays.join(', ');
}; 