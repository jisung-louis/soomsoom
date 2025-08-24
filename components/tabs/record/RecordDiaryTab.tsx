import React from 'react';
import { ScrollView } from 'react-native';
import RecordCalenderHeader from './RecordCalenderHeader';
import RecordWeekCalendar from './RecordWeekCalendar';
import RecordMonthCalendar from './RecordMonthCalendar';
import { Surface } from '../../common/surface/Surface';
import RecordList from './RecordList';

type RecordDiaryTabProps = {
  currentDate: any;
  viewType: 'week' | 'month';
  recordedItems: any[];
  onPrev: () => void;
  onNext: () => void;
  onViewTypeChange: (type: 'week' | 'month') => void;
  onDayPress: (date: any) => void;
  navigation: any;
  styles: any;
};

const RecordDiaryTab = ({
  currentDate,
  viewType,
  recordedItems,
  onPrev,
  onNext,
  onViewTypeChange,
  onDayPress,
  navigation,
  styles
}: RecordDiaryTabProps) => {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <RecordCalenderHeader
        year={currentDate.year()}
        month={currentDate.month() + 1}
        onPrev={onPrev}
        onNext={onNext}
        viewType={viewType}
        onChangeViewType={onViewTypeChange}
        style={styles.calenderHeader}
      />
      {viewType === 'week' && (
        <RecordWeekCalendar
          date={currentDate}
          recordedItems={recordedItems}
          onDayPress={onDayPress}
        />
      )}
      {viewType === 'month' && (
        <RecordMonthCalendar date={currentDate} recordedItems={recordedItems} />
      )}
      <Surface/>
      <RecordList date={currentDate} recordedItems={recordedItems} navigation={navigation} />
    </ScrollView>
  );
};

export default RecordDiaryTab;
