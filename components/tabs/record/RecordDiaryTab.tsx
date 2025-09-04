import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
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
  navigation: RecordDiaryTabNavigationProp;
  styles: StyleSheet.NamedStyles<any>;
  containsToday?: boolean;
  todayYear?: number;
  todayMonth?: number;
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
  styles,
  containsToday,
  todayYear,
  todayMonth
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
      <RecordList date={currentDate} recordedItems={recordedItems} navigation={navigation} />
    </ScrollView>
  );
};

export default RecordDiaryTab;
