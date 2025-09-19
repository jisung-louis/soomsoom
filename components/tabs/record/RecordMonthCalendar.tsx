import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { radius } from '../../../constants/radius';
import { characterIconMap } from '../../../utils/iconMap';
import { getLogicalNow as getLogicalNowUtil } from '../../../utils/timeUtils';

type RecordedItem = {
  date: string;
  character: string;
  content: string;
}
interface RecordMonthCalendarProps {
  date: dayjs.Dayjs;
  recordedItems?: RecordedItem[];
}

// 월 그리드 구성 함수
const getMonthGrid = (date: dayjs.Dayjs) => {
  const startOfMonth = date.startOf('month');
  const endOfMonth = date.endOf('month');
  const startDay = startOfMonth.day(); // 0 (일) ~ 6 (토)
  const daysInMonth = date.daysInMonth();
  const grid = [];
  let current = startOfMonth.subtract(startDay, 'day');
  for (let week = 0; week < 6; week++) {
    const weekRow = [];
    for (let day = 0; day < 7; day++) {
      if (current.month() === date.month()) {
        weekRow.push(current);
      } else {
        weekRow.push(null); // 이전/다음 달은 null
      }
      current = current.add(1, 'day');
    }
    grid.push(weekRow);
  }
  return grid;
};

const RecordMonthCalendar = ({ date, recordedItems }: RecordMonthCalendarProps) => {
  const grid = getMonthGrid(date);
  const logicalNow = getLogicalNowUtil();
  
  // 빈 row 필터링
  const filteredGrid = grid.filter(week => 
    week.some(day => day !== null)
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.weekHeader}>
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => {
          const isSunday = day === '일';
          return (
            <Text key={idx} style={[styles.weekdayText, isSunday && { color: colors.primary300 }]}>
            {day}
            </Text>
          );
        })}
      </View>
      <View style={styles.grid}>
        {filteredGrid.map((week, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {week.map((day, colIdx) => {
              const isSunday = day?.day() === 0;
              const isToday = day?.isSame(logicalNow, 'day');
              const isFuture = day?.isAfter(logicalNow, 'day');
              return (
              <View key={colIdx} style={styles.cell}>
                {day ? (
                  <>
                    {recordedItems?.some((item) => item.date === day.format('YYYY-MM-DD')) ? (
                      (() => {
                        const item = recordedItems.find((item) => item.date === day.format('YYYY-MM-DD'));
                        if (!item) return null;
                        const IconComponent = characterIconMap.active[item.character as keyof typeof characterIconMap.active];
                        return IconComponent ? (
                          <IconComponent
                            width={41}
                            height={41}
                            style={styles.recordIcon}
                          />
                        ) : null;
                      })()
                    ) : (
                      // 기록되지 않은 날짜: 기존 텍스트 표시
                      <View style={[
                        styles.dateCircle, 
                        isToday && { backgroundColor: colors.black }, 
                        isFuture && { opacity: 0.5 }
                      ]}>
                        <Text
                          style={[
                            styles.dateText,
                            isToday && {color: colors.white},
                            isSunday && styles.sundayText,
                          ]}
                        >
                          {day.date()}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                    <View style={styles.emptyCell} />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 30,
    marginBottom: 30,
  },
  grid: {
    flexDirection: 'column',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 41,
    height: 41,
  },
  dateCircle: {
    width: 29,
    height: 29,
    borderRadius: radius.max,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
  dateText: {
    ...typography.body2,
    color: colors.grayScale600,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    ...typography.body2,
    color: colors.grayScale500,
  },
  sundayText: {
    color: colors.primary300,
  },
  recordIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCell: {
    width: 41,
    height: 41,
  },
});

export default RecordMonthCalendar;