import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useTheme } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../../navigations/AppNavigator';
import { RecordStackParamList } from '../../navigations/tabs/RecordStackNavigator';
import { RecordCalenderHeader } from '../../components/tabs/record/RecordCalenderHeader';
import { SceneMap, TabView } from 'react-native-tab-view';
import { colors } from '../../constants/colors';
import { RecordWeekCalendar } from '../../components/tabs/record/RecordWeekCalender';
import { RecordMonthCalendar } from '../../components/tabs/record/RecordMonthCalendar';
import { RecordList } from '../../components/tabs/record/RecordList';
import { useToast } from '../../hooks/useToast';
import BrokenHeartIcon from '../../assets/icons/common/broken_Heart.svg';
import dayjs from 'dayjs';
import { TabMenu } from '../../components/common/tabmenu/TabMenu';
import { Surface } from '../../components/common/surface/Surface';

type RecordTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'record'>,
  StackNavigationProp<RecordStackParamList>
>;

const RecordTab = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewType, setViewType] = useState<'week' | 'month'>('week');
  const { showToast } = useToast();
  const navigation = useNavigation<RecordTabNavigationProp>();
  const layout = useWindowDimensions();
  const { colors: themeColors } = useTheme();

  const handlePrev = () => {
    setCurrentDate((prev) =>
      viewType === 'week' ? prev.subtract(1, 'week') : prev.subtract(1, 'month')
    );
  };
  const handleNext = () => {
    const nextDate = viewType === 'week'
      ? currentDate.add(1, 'week')
      : currentDate.add(1, 'month');

    if (nextDate.isAfter(dayjs(), 'day')) {
      showToast({
        message: '미래의 감정은 지금 기록할 수 없어요!',
        theme: 'dark',
        iconType: 'brokenHeart',
      });
      return;
    }

    setCurrentDate(nextDate);
  };

  const handleDayPress = (date: dayjs.Dayjs) => {
    // '기록하기' 스크린으로 이동하는 로직
    const dateString = date.format('YYYY-MM-DD'); //선택된 날짜 전달
    navigation.navigate('EmotionSelectScreen', { date: dateString });
  };

  type RecordedItem = {
    date: string;
    character: string;
    content: string;
  }
  const recordedItems: RecordedItem[] = [ //DUMMY DATA (추후에 데이터 받아오면 삭제)
    {
      date: '2025-06-24',
      character: 'happy',
      content: '오늘은 별일 없었는데, 괜히 기분이 좋았다. 햇살 좋고, 커피 맛있고, 웃을 일도 있었다. 작은 것들이...',
    },
    {
      date: '2025-06-25',
      character: 'good',
      content: '오늘은 별일 없었는데, 괜히 기분이 좋았다. 햇살 좋고, 커피 맛있고, 웃을 일도 있었다. 작은 것들이...',
    },
    {
      date: '2025-06-21',
      character: 'soso',
      content: '오늘은 별일 없었는데, 괜히 기분이 좋았다. 햇살 좋고, 커피 맛있고, 웃을 일도 있었다. 작은 것들이...',
    },
  ];

  const renderDiaryTab = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <RecordCalenderHeader
        year={currentDate.year()}
        month={currentDate.month() + 1}
        onPrev={handlePrev}
        onNext={handleNext}
        viewType={viewType}
        onChangeViewType={setViewType}
        style={styles.calenderHeader}
      />
      {viewType === 'week' && (
        <RecordWeekCalendar
          date={currentDate}
          recordedItems={recordedItems}
          onDayPress={handleDayPress}
        />
      )}
      {viewType === 'month' && (
        <RecordMonthCalendar date={currentDate} recordedItems={recordedItems} />
      )}
      <Surface/>
      <RecordList date={currentDate} recordedItems={recordedItems} navigation={navigation} />
    </ScrollView>
  );

  const renderReportTab = () => (
    <View style={styles.reportContainer}>
      <Text style={styles.reportMessage}>마음 리포트 화면 준비 중이에요 🛠️</Text>
    </View>
  );

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'diary', title: '마음 일기' },
    { key: 'report', title: '마음 리포트' },
  ]);

  const renderScene = SceneMap({
    diary: renderDiaryTab,
    report: renderReportTab,
  });

  return (
    <SafeAreaView style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={() => (
          <TabMenu
            tabs={['마음 일기', '마음 리포트']}
            selectedTab={routes[index].title as '마음 일기' | '마음 리포트'}
            onPress={(tab) => {
              const i = routes.findIndex(r => r.title === tab);
              if (i !== -1) setIndex(i);
            }}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  toggle: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  calenderHeader: {
    marginTop: 30,
  },
  reportContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  reportMessage: {
    fontSize: 18,
    color: colors.grayScale500,
    textAlign: 'center',
  },
});

export default RecordTab; 