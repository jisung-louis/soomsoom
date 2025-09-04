import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';
import { syongsyongTypography } from '../../../constants/typography';
import { Toggle } from '../../common/toggle/Toggle';
import ArrowLeftIcon from '../../../assets/icons/common/arrow_back.svg';
import ArrowRightIcon from '../../../assets/icons/common/arrow_right.svg';

interface CalenderHeaderProps {
  year: number;            // 기본 표시는 주의 시작일(일요일) 기준 연도
  month: number;           // 기본 표시는 주의 시작일(일요일) 기준 월
  onPrev: () => void;
  onNext: () => void;
  viewType: 'week' | 'month';
  onChangeViewType: (type: 'week' | 'month') => void;
  /**
   * 해당 주에 '오늘'이 포함되어 있다면 true.
   * true이고 todayYear/todayMonth가 넘어오면, 표시를 '오늘' 기준으로 교체한다.
   */
  containsToday?: boolean;
  /** 오늘 기준 연/월 (containsToday===true 일 때 사용할 값) */
  todayYear?: number;
  todayMonth?: number;
  style?: any;
}

const RecordCalenderHeader: React.FC<CalenderHeaderProps> = ({
  year,
  month,
  onPrev,
  onNext,
  viewType,
  onChangeViewType,
  style,
  containsToday,
  todayYear,
  todayMonth,
}) => {
  const displayYear = containsToday && typeof todayYear === 'number' ? todayYear : year;
  const displayMonth = containsToday && typeof todayMonth === 'number' ? todayMonth : month;
  return (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        <Pressable onPress={onPrev} style={styles.arrowBtn} accessibilityLabel="이전 달">
          <ArrowLeftIcon width={24} height={24} color={colors.grayScale800} />
        </Pressable>
        <View style={styles.monthTextContainer}>
          <Text style={styles.monthNumberText}>{`${displayYear}`}</Text>
          <Text style={styles.monthText}>년 </Text>
          <Text style={styles.monthNumberText}>{`${displayMonth}`}</Text>
          <Text style={styles.monthText}>월</Text>
        </View>
        <Pressable onPress={onNext} style={styles.arrowBtn} accessibilityLabel="다음 달">
          <ArrowRightIcon width={24} height={24} color={colors.grayScale800} />
        </Pressable>
      </View>
      <Toggle
        options={['주간', '월간']}
        selected={viewType === 'week' ? '주간' : '월간'}
        onSelect={(option) => onChangeViewType(option === '주간' ? 'week' : 'month')}
        style={styles.toggle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowBtn: {
    padding: 0,
  },
  monthTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthNumberText: {
    ...syongsyongTypography.title3,
  },
  monthText: {
    ...syongsyongTypography.title4,
  },
  toggle: {
  },
}); 

export default RecordCalenderHeader;