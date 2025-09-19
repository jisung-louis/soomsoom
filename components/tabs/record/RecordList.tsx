import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import { characterIconMap, characterTitleMap } from '../../../utils/iconMap';
import { syongsyongTypography, typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import EmptyMonth from '../../../assets/images/record/month_empty.svg';
import RecordEmptyStateWithButton from './RecordEmptyStateWithButton';
import CatQuietIcon from '../../../assets/icons/charactors/cat-variation/cat_quiet.svg';
import CatWriteIcon from '../../../assets/icons/charactors/cat-variation/cat_write.svg';
import { ButtonSmall } from '../../common/buttons/ButtonSmall';

type RecordedItem = {
  diaryId: number;
  date: string;
  character: string;
  content: string;
}
interface RecordListProps {
  date: dayjs.Dayjs;
  recordedItems: RecordedItem[];
  onStartRecordPress: () => void;
  onHasRecordsChange: (hasRecords: boolean) => void;
  onIsThisCurrentMonthChange: (isThisCurrentMonth: boolean) => void;
  onItemPress?: (diaryId: number) => void;
}
const RecordList: React.FC<RecordListProps> = ({ date, recordedItems, onStartRecordPress, onHasRecordsChange, onIsThisCurrentMonthChange, onItemPress}) => {
  const currentMonth = date.month(); // 커서가 위치한 달
  const nowMonth = dayjs().month(); // 현재 달
  const hasThisMonthRecords = recordedItems.some(
    item =>
      dayjs(item.date).month() === currentMonth &&
      dayjs(item.date).year() === date.year()
  );
  const isThisCurrentMonth = nowMonth === currentMonth && dayjs().year() === date.year();

  useEffect(() => {
    onHasRecordsChange(hasThisMonthRecords);
    onIsThisCurrentMonthChange(isThisCurrentMonth);
  }, [hasThisMonthRecords, isThisCurrentMonth]);
  return !hasThisMonthRecords ? (
        isThisCurrentMonth ? (
          <View style={styles.emptyIcon}>
            <CatWriteIcon width={100} height={100} />
            <Text style={styles.emptyText}>이 달의 첫 기록, 지금 남겨보세요!</Text>
            <ButtonSmall 
              title="기록 시작하기" 
              variant="active" 
              onPress={onStartRecordPress}
              style={{marginTop: 10}}
            />
          </View>
        ) : (
          <View style={styles.emptyIcon}>
            <CatQuietIcon width={100} height={100} />
            <Text style={styles.emptyText}>이 달엔 조용했네요!</Text>
          </View>
        )
      ) : (
        <View style={styles.container}>
          <Text style={{...syongsyongTypography.title5, ...styles.header}}>기록</Text>
          {recordedItems
            .filter(item =>
              dayjs(item.date).month() === currentMonth &&
              dayjs(item.date).year() === date.year()
            )
            .map((item) => {
              const recordDate = dayjs(item.date);
              const IconComponent = characterIconMap.active[item.character as keyof typeof characterIconMap.active];
              if (!IconComponent) return null;
              return (
                <TouchableOpacity key={`${item.diaryId}`} style={styles.recordItem} activeOpacity={0.7} onPress={() => onItemPress?.(item.diaryId)}>
                  <Text style={styles.date}>{recordDate.format('YY.MM.DD')}</Text>
                  <View style={styles.contentRow}>
                    <IconComponent width={48} height={48} style={styles.icon} />
                    <View style={styles.textContainer}>
                      <Text style={styles.title}>{characterTitleMap.active[item.character as keyof typeof characterTitleMap.active]}</Text>
                      <Text numberOfLines={2} style={styles.content}>{item.content}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>
      );
    };

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  emptyText: {
    ...syongsyongTypography.title6,
    color: colors.grayScale900,
  },
  header: {
    marginVertical: 30,
  },
  recordItem: {
    gap: 8,
    marginBottom: 16,
  },
  date: {
    ...typography.body5,
    color: colors.grayScale300,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  icon: {
    alignSelf: 'flex-start',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.body1,
    color: colors.grayScale900,
  },
  content: {
    ...typography.body5,
    color: colors.grayScale500,
  },

});

export default RecordList;