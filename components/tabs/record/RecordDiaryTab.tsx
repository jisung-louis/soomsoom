import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../../../navigations/AppNavigator';
import { RecordStackParamList } from '../../../navigations/tabs/RecordStackNavigator';
import dayjs from 'dayjs';
import RecordCalenderHeader from './RecordCalenderHeader';
import RecordWeekCalendar from './RecordWeekCalendar';
import RecordMonthCalendar from './RecordMonthCalendar';
import { Surface } from '../../common/surface/Surface';
import RecordList from './RecordList';

type RecordDiaryTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'record'>,
  StackNavigationProp<RecordStackParamList>
>;

type RecordedItem = {
  diaryId: number;
  date: string;
  character: string;
  content: string;
};

type RecordDiaryTabProps = {
  currentDate: dayjs.Dayjs;
  viewType: 'week' | 'month';
  recordedItems: RecordedItem[];
  onPrev: () => void;
  onNext: () => void;
  onViewTypeChange: (type: 'week' | 'month') => void;
  onDayPress: (date: dayjs.Dayjs) => void;
  onStartRecordPress: () => void;
  styles: StyleSheet.NamedStyles<any>;
  containsToday?: boolean;
  todayYear?: number;
  todayMonth?: number;
  onItemPress?: (diaryId: number) => void;
};



const RecordDiaryTab = ({
  currentDate,
  viewType,
  recordedItems,
  onPrev,
  onNext,
  onViewTypeChange,
  onDayPress,
  onStartRecordPress,
  styles,
  containsToday,
  todayYear,
  todayMonth,
  onItemPress,
}: RecordDiaryTabProps) => {

  const [hasThisMonthRecords, setHasThisMonthRecords] = useState(false);
  const [isThisCurrentMonth, setIsThisCurrentMonth] = useState(false);
  const handleHasRecordsChange = (hasRecords: boolean) => {
    setHasThisMonthRecords(hasRecords);
  };
  const handleIsThisCurrentMonthChange = (isThisCurrentMonth: boolean) => {
    setIsThisCurrentMonth(isThisCurrentMonth);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }} scrollEnabled={hasThisMonthRecords || viewType === 'month'}>
      <RecordCalenderHeader
        year={currentDate.year()}
        month={currentDate.month() + 1}
        onPrev={onPrev}
        onNext={onNext}
        viewType={viewType}
        onChangeViewType={onViewTypeChange}
        style={styles.calenderHeader}
        containsToday={containsToday}
        todayYear={todayYear}
        todayMonth={todayMonth}
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
      <View style={[ 
        !hasThisMonthRecords && { justifyContent: 'center'}, 
        !hasThisMonthRecords && (viewType === 'week') && { height: '100%'},
        !hasThisMonthRecords && (viewType === 'week') && { transform: isThisCurrentMonth ? [{translateY: -60}] : [{translateY: -30}]},
        !hasThisMonthRecords && (viewType === 'month') && isThisCurrentMonth && { marginTop: 25 },
        ]}>
        <RecordList 
          date={currentDate} 
          recordedItems={recordedItems} 
          onStartRecordPress={onStartRecordPress} 
          onHasRecordsChange={handleHasRecordsChange} 
          onIsThisCurrentMonthChange={handleIsThisCurrentMonthChange}
          onItemPress={onItemPress}
        />
      </View>
    </ScrollView>
  );
};

export default RecordDiaryTab;
