import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useTheme } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../../navigations/AppNavigator';
import { RecordStackParamList } from '../../navigations/tabs/RecordStackNavigator';
import { SceneMap, TabView } from 'react-native-tab-view';
import { colors } from '../../constants/colors';
import { useToast } from '../../hooks/useToast';
import dayjs from 'dayjs';
import { TabMenu } from '../../components/common/tabmenu/TabMenu';
import RecordDiaryTab from '../../components/tabs/record/RecordDiaryTab';
import RecordReportTab from '../../components/tabs/record/RecordReportTab';

type RecordTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'record'>,
  StackNavigationProp<RecordStackParamList>
>;

const RecordTab = () => {
  const [current, setCurrent] = useState({
    week: dayjs().startOf('week'),
    month: dayjs().startOf('month')
  });
  const [viewType, setViewType] = useState<'week' | 'month'>('week');
  const { showToast } = useToast();
  const navigation = useNavigation<RecordTabNavigationProp>();
  const layout = useWindowDimensions();
  const { colors: themeColors } = useTheme();

  // 현재 선택된 날짜 범위 계산
  const currentDate = viewType === 'week' ? current.week : current.month;

  // 컴포넌트 마운트 시 로그
  useEffect(() => {
    console.log('=== RecordTab 마운트 ===');
    console.log('초기 current.week:', current.week.format('YYYY-MM-DD'));
    console.log('초기 current.month:', current.month.format('YYYY-MM-DD'));
    console.log('초기 viewType:', viewType);
    console.log('현재 시간:', dayjs().format('YYYY-MM-DD HH:mm:ss'));
  }, []);

  // current 변경 시 로그
  useEffect(() => {
    console.log('🔄 current 변경됨');
    console.log('current.week:', current.week.format('YYYY-MM-DD'));
    console.log('current.month:', current.month.format('YYYY-MM-DD'));
  }, [current]);

  // viewType 변경 시 로그
  useEffect(() => {
    console.log('🔄 viewType 변경됨:', viewType);
    console.log('현재 선택된 날짜:', currentDate.format('YYYY-MM-DD'));
  }, [viewType, currentDate]);

  // viewType 변경 핸들러
  const handleViewTypeChange = (newViewType: 'week' | 'month') => {
    console.log('=== viewType 변경 요청 ===');
    console.log('이전 viewType:', viewType);
    console.log('새로운 viewType:', newViewType);
    console.log('현재 currentDate:', currentDate.format('YYYY-MM-DD'));
    
    setViewType(newViewType);
    
    console.log('✅ viewType 변경 완료');
  };

  const handlePrev = () => {
    console.log('=== handlePrev 디버그 시작 ===');
    console.log('현재 viewType:', viewType);
    console.log('현재 currentDate:', currentDate.format('YYYY-MM-DD'));
    
    if (viewType === 'week') {
      const prevWeek = current.week.subtract(1, 'week');
      console.log('계산된 prevWeek:', prevWeek.format('YYYY-MM-DD'));
      
      setCurrent(prev => ({ ...prev, week: prevWeek }));
      setCurrent(prev => ({ ...prev, month: prevWeek.startOf('month') }));
      console.log('✅ prevWeek로 current.week, current.month 업데이트 완료');
    } else {
      const prevMonth = current.month.subtract(1, 'month');
      console.log('계산된 prevMonth:', prevMonth.format('YYYY-MM-DD'));
      
      setCurrent(prev => ({ ...prev, month: prevMonth }));
      setCurrent(prev => ({ ...prev, week: prevMonth.startOf('month') }));
      console.log('✅ prevMonth로 current.month, current.week 업데이트 완료');
    }
    
    console.log('=== handlePrev 디버그 완료 ===');
  };

  const handleNext = () => {
    console.log('=== handleNext 디버그 시작 ===');
    console.log('현재 viewType:', viewType);
    console.log('현재 currentDate:', currentDate.format('YYYY-MM-DD'));
    
    if (viewType === 'week') {
      const nextWeek = current.week.add(1, 'week');
      console.log('계산된 nextWeek:', nextWeek.format('YYYY-MM-DD'));
      
      const today = dayjs();
      console.log('오늘 날짜:', today.format('YYYY-MM-DD'));
      
      // 주간 단위로 미래시점 체크
      const isNextWeekAfterToday = nextWeek.isAfter(today, 'week');
      console.log('nextWeek가 오늘보다 이후인가? (주간 단위):', isNextWeekAfterToday);
      
      if (isNextWeekAfterToday) {
        console.log('🚨 미래 주간 감지됨 - 토스트 메시지 표시');
        showToast({
          message: '미래의 감정은 지금 기록할 수 없어요!',
          theme: 'dark',
          iconType: 'brokenHeart',
        });
        return;
      }
      
      console.log('✅ 미래 주간이 아님 - current.week 업데이트');
      setCurrent(prev => ({ ...prev, week: nextWeek }));
    } else {
      const nextMonth = current.month.add(1, 'month');
      console.log('계산된 nextMonth:', nextMonth.format('YYYY-MM-DD'));
      
      const today = dayjs();
      console.log('오늘 날짜:', today.format('YYYY-MM-DD'));
      
      // 월간 단위로 미래시점 체크
      const isNextMonthAfterToday = nextMonth.isAfter(today, 'month');
      console.log('nextMonth가 오늘보다 이후인가? (월간 단위):', isNextMonthAfterToday);
      
      if (isNextMonthAfterToday) {
        console.log('🚨 미래 월간 감지됨 - 토스트 메시지 표시');
        showToast({
          message: '미래의 감정은 지금 기록할 수 없어요!',
          theme: 'dark',
          iconType: 'brokenHeart',
        });
        return;
      }
      
      console.log('✅ 미래 월간이 아님 - current.month 업데이트');
      setCurrent(prev => ({ ...prev, month: nextMonth }));
    }
    
    console.log('=== handleNext 디버그 완료 ===');
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
    <RecordDiaryTab
      currentDate={currentDate}
      viewType={viewType}
      recordedItems={recordedItems}
      onPrev={handlePrev}
      onNext={handleNext}
      onViewTypeChange={handleViewTypeChange}
      onDayPress={handleDayPress}
      navigation={navigation}
      styles={styles}
    />
  );

  const renderReportTab = () => <RecordReportTab />;

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
});

export default RecordTab; 