import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { radius } from '../../../constants/radius';
import DayUncheckedIcon from '../../../assets/icons/record/day_unchecked.svg';
import DayCheckedIcon from '../../../assets/icons/record/day_checked.svg';
import DayPlusIcon from '../../../assets/icons/record/day_plus.svg';
import { getLogicalNow as getLogicalNowUtil } from '../../../utils/timeUtils';
dayjs.extend(isoWeek);
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

type RecordedItem = {
  date: string;
  character: string;
  content: string;
}
interface RecordWeekCalendarProps {
  date: dayjs.Dayjs;
  recordedItems?: RecordedItem[];
  onDayPress?: (date: dayjs.Dayjs) => void;
  onWeekSwipe?: (direction: 'prev' | 'next') => void;
}

const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

const RecordWeekCalendar: React.FC<RecordWeekCalendarProps> = ({ date, recordedItems, onDayPress, onWeekSwipe }) => {
  const startOfWeek = date.startOf('week');
  const weekDates = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
  const logicalNow = getLogicalNowUtil(); // utils의 기본 boundaryHour 사용

  // --- Swipe gesture to change week (left/right) ---
  const SWIPE_THRESHOLD = 60; // px
  const swipeX = useSharedValue(0);

  const pan = useMemo(() =>
    Gesture.Pan()
      .onUpdate((e) => {
        swipeX.value = e.translationX;
      })
      .onEnd(() => {
        const dx = swipeX.value;
        if (Math.abs(dx) > SWIPE_THRESHOLD) {
          if (onWeekSwipe) {
            // Left swipe => next week, Right swipe => prev week
            runOnJS(onWeekSwipe)(dx < 0 ? 'next' : 'prev');
          }
        }
        swipeX.value = withTiming(0, { duration: 180 });
      })
  , [onWeekSwipe]);

  const swipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swipeX.value * 0.15 }], // subtle follow effect
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.container, swipeStyle]}>
      <View style={styles.row}>
        {daysOfWeek.map((day, index) => {
          const isToday = weekDates[index].isSame(logicalNow, 'day');
          const isSunday = day === '일';
          return (
            <Text
              key={day}
              style={[
                styles.dayLabel,
                isSunday && { color: colors.primary300 },
                isToday && { color: colors.grayScale900 }
              ]}
            >
              {day}
            </Text>
          );
        })}
      </View>

      <View style={styles.row}>
        {weekDates.map((date) => {
          const isToday = date.isSame(logicalNow, 'day');
          const isSunday = date.day() === 0;
          const isRecord = recordedItems?.some((item) => item.date === date.format('YYYY-MM-DD'));

          return (
            <View key={date.format('YYYY-MM-DD')} style={styles.dayBox}>
              <View
                style={[
                  styles.dateCircle,
                  isToday && { backgroundColor: colors.black }
                ]}
              >
                <Text
                  style={[
                    styles.dateText,
                    isSunday && { color: colors.primary300 },
                    isToday && { color: colors.white }
                  ]}
                >
                  {date.format('D')}
                </Text>
              </View>
              {isRecord ? (
                <DayCheckedIcon style={styles.icon} />
              ) : isToday ? (
                <TouchableOpacity
                  onPress={() => onDayPress?.(date)}
                  activeOpacity={0.7}
                >
                <DayPlusIcon style={styles.icon} color={colors.grayScale800}/>
                </TouchableOpacity>
              ) : (
                <DayUncheckedIcon style={styles.icon}/>
              )}
            </View>
          );
        })}
      </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    color: colors.grayScale500,
    fontSize: typography.caption2.fontSize,
    fontWeight: typography.caption2.fontWeight,
    lineHeight: typography.caption2.lineHeight,
  },
  dayBox: {
    flex: 1,
    alignItems: 'center',
  },
  dateCircle: {
    width: 30,
    borderRadius: radius.max,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
    marginBottom: 8,
  },
  dateText: {
    color: colors.grayScale600,
    fontSize: typography.body5.fontSize,
    fontWeight: typography.body5.fontWeight,
    lineHeight: typography.body5.lineHeight,
  },
  icon: {
    width: 41,
    height: 41,
  },
});

export default RecordWeekCalendar;