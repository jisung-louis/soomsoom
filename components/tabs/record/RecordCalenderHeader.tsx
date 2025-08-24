import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';
import { syongsyongTypography } from '../../../constants/typography';
import { Toggle } from '../../common/toggle/Toggle';
import ArrowLeftIcon from '../../../assets/icons/common/arrow_back.svg';
import ArrowRightIcon from '../../../assets/icons/common/arrow_right.svg';

interface CalenderHeaderProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  viewType: 'week' | 'month';
  onChangeViewType: (type: 'week' | 'month') => void;
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
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        <Pressable onPress={onPrev} style={styles.arrowBtn} accessibilityLabel="이전 달">
          <ArrowLeftIcon width={24} height={24} color={colors.grayScale800} />
        </Pressable>
        <View style={styles.monthTextContainer}>
          <Text style={styles.monthNumberText}>{`${year}`}</Text>
          <Text style={styles.monthText}>년 </Text>
          <Text style={styles.monthNumberText}>{`${month}`}</Text>
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