import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import { typography } from '../../../constants/typography';
import Svg, { G, Rect } from 'react-native-svg';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekday from 'dayjs/plugin/weekday';
import { characterIconMap } from '../../../utils/iconMap';

dayjs.extend(weekOfYear);
dayjs.extend(weekday);

const windowWidth = Dimensions.get('window').width;

interface BarChartProps {
  currentYear: number;
  currentMonth: number;
  currentWeek: number;
  emotionReportData: Record<string, Record<string, string>>;
}

const barConfigByEmotion = {
  happy: {
    height: 100,
    marginTop: 0,
  },
  good: {
    height: 70,
    marginTop: 30,
  },
  soso: {
    height: 30,
    marginTop: 70,
  },
  depressed: {
    height: 30,
    marginTop: 80,
  },
  sad: {
    height: 70,
    marginTop: 80,
  },
  angry: {
    height: 100,
    marginTop: 80,
  },
}

const BarChart = ({ currentYear, currentMonth, currentWeek, emotionReportData }: BarChartProps) => {
  // 현재 주차의 날짜 범위 계산
  const getCurrentWeekDates = () => {
    // 일요일부터 시작하도록 수정
    const startOfWeek = dayjs().year(currentYear).week(currentWeek).startOf('week');
    const endOfWeek = dayjs().year(currentYear).week(currentWeek).endOf('week');
    
    const dates: dayjs.Dayjs[] = [];
    let currentDate = startOfWeek;
    
    // 일요일부터 토요일까지 7일 처리
    for (let i = 0; i < 7; i++) {
      dates.push(currentDate);
      currentDate = currentDate.add(1, 'day');
    }
    
    return dates;
  };

  // 현재 주차가 해당 월에 속하는지 확인
  const isCurrentWeekInMonth = () => {
    const weekDates = getCurrentWeekDates();
    const monthStart = dayjs().year(currentYear).month(currentMonth - 1).startOf('month');
    const monthEnd = dayjs().year(currentYear).month(currentMonth - 1).endOf('month');
    
    // 주의 모든 날짜가 해당 월에 속하는지 확인
    return weekDates.every(date => 
      date.isSame(monthStart, 'month') || date.isSame(monthEnd, 'month')
    );
  };

  // 부모 뷰 너비에 맞춰 점선 개수 계산
  const calculateDotsCount = () => {
    const dotWidth = 7;        // 각 점의 너비
    const gap = 7;             // 점 사이 간격
    const containerPadding = 40; // 좌우 패딩 (20 + 20)
    const availableWidth = windowWidth - containerPadding;
    const totalDotWidth = dotWidth + gap;
    
    return Math.floor(availableWidth / totalDotWidth);
  };

  const daysInWeek = (week: number) => {
    const date = dayjs().year(currentYear).week(week);
    return date.weekday(); // isoWeekday 대신 weekday 사용
  };

  const dotsCount = calculateDotsCount();

  // 현재 주차의 감정 데이터 추출
  const getCurrentWeekEmotions = (): (string | null)[] => {
    const weekDates = getCurrentWeekDates();
    const emotions: (string | null)[] = [];
    
    weekDates.forEach((date, index) => {
      // 월 키 생성 수정: date.month()는 0부터 시작하므로 +1 필요
      const monthKey = `${currentYear}-${(date.month() + 1).toString().padStart(2, '0')}`;
      const dayKey = date.date().toString();
      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][index];
      
      // 현재 선택된 월과 비교하여 투명도 결정
      const isCurrentMonth = date.month() === currentMonth - 1; // date.month()는 0부터, currentMonth는 1부터
      
      if (emotionReportData[monthKey] && emotionReportData[monthKey][dayKey]) {
        emotions.push(emotionReportData[monthKey][dayKey]);
      } else {
        emotions.push(null); // 데이터가 없는 경우
      }
    });
    
    return emotions;
  };

  // 현재 주차의 날짜별 투명도 계산
  const getCurrentWeekOpacities = (): number[] => {
    const weekDates = getCurrentWeekDates();
    const opacities: number[] = [];
    
    weekDates.forEach(date => {
      // 오늘 이후 날짜면 무조건 희미하게 (0.4)
      const isFuture = date.isAfter(dayjs(), 'day');
      if (isFuture) {
        opacities.push(0.4);
        return;
      }

      // 현재 선택된 월과 비교하여 투명도 결정
      const isCurrentMonth = date.month() === currentMonth - 1;
      opacities.push(isCurrentMonth ? 1.0 : 0.4); // 현재 월: 100%, 다른 월: 40%
    });
    
    return opacities;
  };

  const currentWeekEmotions = getCurrentWeekEmotions();
  const currentWeekOpacities = getCurrentWeekOpacities();

  // 디버깅: 투명도 정보 출력
  // console.log('Current week opacities:', currentWeekOpacities);
  // console.log('Current month:', currentMonth);
  // console.log('Week dates with icon types:', getCurrentWeekDates().map((date, index) => ({
  //   date: date.format('MM/DD'),
  //   month: date.month() + 1,
  //   isCurrentMonth: date.month() === currentMonth - 1,
  //   iconType: date.month() === currentMonth - 1 ? 'active' : 'default',
  //   emotion: currentWeekEmotions[index]
  // })));

  return (
    <View style={styles.container}>
        <View style={styles.barContainer}>
            {currentWeekEmotions.map((emotion, index) => {
              if (!emotion) return <View key={index} style={styles.emptyBar} />;
              
              const config = barConfigByEmotion[emotion as keyof typeof barConfigByEmotion];
              if (!config) return <View key={index} style={styles.emptyBar} />;
              
              const isToday = getCurrentWeekDates()[index].isSame(dayjs(), 'day');

              // 오늘 막대는 그라디언트, 그 외는 기본 막대
              if (isToday) {
                return (
                  <LinearGradient
                    key={index}
                    colors={[colors.primary300, colors.primary100]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={[
                      styles.bar,
                      {
                        height: config.height,
                        marginTop: config.marginTop,
                        opacity: currentWeekOpacities[index],
                      },
                    ]}
                  />
                );
              }

              return (
                <View
                  key={index}
                  style={[
                    styles.bar,
                    {
                      height: config.height,
                      marginTop: config.marginTop,
                      opacity: currentWeekOpacities[index],
                    },
                  ]}
                />
              );
            })}
        </View>
      <View style={styles.barChartBaseLineContainer}>
        {Array.from({ length: dotsCount }, (_, index) => (
          <View key={index} style={styles.barChartBaseLine}/>
        ))}
      </View>
      <View style={styles.weekdayContainer}>
        <View style={styles.emotionIconContainer}>
            {currentWeekEmotions.map((emotion, index) => {
              if (!emotion) {
                return <View key={index} style={[styles.emptyIconPlaceholder, { opacity: currentWeekOpacities[index] }]} />;
              }
              
              // 현재 월인지 확인하여 아이콘 타입 결정
              const weekDates = getCurrentWeekDates();
              const currentDate = weekDates[index];
              const isCurrentMonth = currentDate.month() === currentMonth - 1;
              
              // 현재 월: active 아이콘, 다른 월: default 아이콘
              const iconType = isCurrentMonth ? 'active' : 'default';
              const IconComponent = characterIconMap[iconType][emotion as keyof typeof characterIconMap.active];
              
              if (!IconComponent) {
                console.warn(`Icon not found for emotion: ${emotion} in ${iconType}`);
                return <View key={index} style={[styles.emptyIconPlaceholder, { opacity: currentWeekOpacities[index] }]} />;
              }
              
              return (
                <IconComponent 
                  key={index} 
                  width={32} 
                  height={32} 
                  style={{ opacity: currentWeekOpacities[index] }} // 투명도 적용
                />
              );
            })}
        </View>
        <View style={styles.weekdayTextContainer}>
            {getCurrentWeekDates().map((date, index) => {
              const isToday = date.isSame(dayjs(), 'day');
              return (
                <View key={index} style={styles.weekdayTextItem}>
                  <Text style={[styles.weekdayText, { opacity: currentWeekOpacities[index] }, isToday && { color: colors.grayScale900 }]}>
                    {['일', '월', '화', '수', '목', '금', '토'][index]}
                  </Text>
                  <View style={[styles.weekdayNumberTextCircle, isToday && { backgroundColor: colors.grayScale900 }]}>
                    <Text style={[styles.weekdayNumberText, { opacity: currentWeekOpacities[index] }, isToday && { color: colors.white }]}>
                      {date.date()}
                    </Text>
                  </View>
                </View>
              );
            })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 180,
  },
  bar: {
    backgroundColor: colors.grayScale100,
    width: 30,
    height: 180,
    borderRadius: radius.r8,
  },
  barChartBaseLineContainer: {
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'space-between',  // 점선들을 균등하게 분배
    position: 'absolute',
    top: 90,
    width: '100%',
  },
  barChartBaseLine: {
    width: 7,
    height: 2,
    backgroundColor: colors.grayScale900,    // 테두리 두께 명시
    borderColor: colors.grayScale900, // 테두리 색상 명시
    borderRadius: radius.max,
  },
  emptyBar: {
    width: 30,
    height: 0,
    backgroundColor: colors.grayScale100,
    borderRadius: radius.r8,
  },
  weekdayContainer: {
    paddingHorizontal: 10,
    marginTop: 20,
    gap: 10,
  },
  emotionIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

  },
  weekdayTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekdayTextItem: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  weekdayText: {
    ...typography.caption2,
    color: colors.grayScale500,
  },
  weekdayNumberTextCircle: {
    width: '100%',
    borderRadius: radius.max,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdayNumberText: {
    ...typography.body5,
    color: colors.grayScale600,
  },
  emptyIconPlaceholder: {
    width: 32,
    height: 32,
    //backgroundColor: colors.grayScale100,
    borderRadius: radius.r8,
  },
});

export default BarChart;