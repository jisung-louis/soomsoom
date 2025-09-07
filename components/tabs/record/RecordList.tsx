import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { characterIconMap, characterTitleMap } from '../../../utils/iconMap';
import { syongsyongTypography, typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import EmptyMonth from '../../../assets/images/record/month_empty.svg';
import RecordEmptyStateWithButton from './RecordEmptyStateWithButton';

type RecordedItem = {
  date: string;
  character: string;
  content: string;
}
interface RecordListProps {
  date: dayjs.Dayjs;
  recordedItems: RecordedItem[];
  onStartRecordPress: () => void;
}
const RecordList: React.FC<RecordListProps> = ({ date, recordedItems, onStartRecordPress }) => {
  const currentMonth = date.month(); // 커서가 위치한 달
  const nowMonth = dayjs().month(); // 현재 달
  const hasThisMonthRecords = recordedItems.some(
    item =>
      dayjs(item.date).month() === currentMonth &&
      dayjs(item.date).year() === date.year()
  );
  return (
    <View style={styles.container}>
      {!hasThisMonthRecords ? (
        nowMonth === currentMonth && dayjs().year() === date.year() ? (
          <RecordEmptyStateWithButton
            onButtonPress={onStartRecordPress}
          />
        ) : (
            <EmptyMonth style={{ alignSelf: 'center', marginTop: 30 }}/>
        )
      ) : (
        <>
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
                <View key={`${item.date}-${item.character}`} style={styles.recordItem}>
                  <Text style={styles.date}>{recordDate.format('YY.MM.DD')}</Text>
                  <View style={styles.contentRow}>
                    <IconComponent width={48} height={48} style={styles.icon} />
                    <View style={styles.textContainer}>
                      <Text style={styles.title}>{characterTitleMap.active[item.character as keyof typeof characterTitleMap.active]}</Text>
                      <Text numberOfLines={2} style={styles.content}>{item.content}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
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