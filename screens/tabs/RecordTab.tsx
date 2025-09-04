import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import { TabMenu } from '../../components/common/tabmenu/TabMenu';
import RecordDiaryTab from '../../components/tabs/record/RecordDiaryTab';
import RecordReportTab from '../../components/tabs/record/RecordReportTab';
import RecordReportTabNotOpened from '../../components/tabs/record/RecordReportTabNotOpened';
import { emotionDiaryService } from '../../services/emotionDiaryService';
import { emotionStatsService, MonthlyStatsItem, DailyDiaryItem } from '../../services/emotionStatsService';
import { EmotionType } from '../../types';
import { getMockDiaryDataForAPI } from '../../data/emotionReportMockData';

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
  const currentDate = useMemo(() => (viewType === 'week' ? current.week : current.month), [viewType, current.week, current.month]);

  const weekIncludesToday = useMemo(() => {
    if (viewType !== 'week') return false;
    const start = current.week.startOf('week');
    const end = current.week.endOf('week');
    return dayjs().isBetween(start, end, 'day', '[]');
  }, [viewType, current.week]);

  // 일기 데이터 상태
  const [recordedItems, setRecordedItems] = useState<{
    date: string;
    character: string;
    content: string;
  }[]>([]);

  // 리포트 데이터 상태
  const [monthlyStatsData, setMonthlyStatsData] = useState<MonthlyStatsItem[]>([]);
  const [reportCurrentYear, setReportCurrentYear] = useState(dayjs().year());
  const [reportCurrentMonth, setReportCurrentMonth] = useState(dayjs().month() + 1);

  // 컴포넌트 마운트 시 로그
  useEffect(() => {
    if (__DEV__) {
      console.log('=== RecordTab 마운트 ===');
      console.log('초기 current.week:', current.week.format('YYYY-MM-DD'));
      console.log('초기 current.month:', current.month.format('YYYY-MM-DD'));
      console.log('초기 viewType:', viewType);
      console.log('현재 시간:', dayjs().format('YYYY-MM-DD HH:mm:ss'));
    }
  }, []);

  // current 변경 시 로그
  useEffect(() => {
    if (__DEV__) {
      console.log('🔄 current 변경됨');
      console.log('current.week:', current.week.format('YYYY-MM-DD'));
      console.log('current.month:', current.month.format('YYYY-MM-DD'));
    }
  }, [current]);

  // viewType 변경 시 로그
  useEffect(() => {
    if (__DEV__) {
      console.log('🔄 viewType 변경됨:', viewType);
      console.log('현재 선택된 날짜:', currentDate.format('YYYY-MM-DD'));
    }
  }, [viewType, currentDate]);

  // viewType 변경 핸들러
  const handleViewTypeChange = useCallback((newViewType: 'week' | 'month') => {
    if (__DEV__) {
      console.log('=== viewType 변경 요청 ===');
      console.log('이전 viewType:', viewType);
      console.log('새로운 viewType:', newViewType);
      console.log('현재 currentDate:', currentDate.format('YYYY-MM-DD'));
    }
    setViewType(newViewType);
    if (__DEV__) {
      console.log('✅ viewType 변경 완료');
    }
  }, [viewType, currentDate]);

  const handlePrev = useCallback(() => {
    if (__DEV__) {
      console.log('=== handlePrev 디버그 시작 ===');
      console.log('현재 viewType:', viewType);
      console.log('현재 currentDate:', currentDate.format('YYYY-MM-DD'));
    }

    if (viewType === 'week') {
      const prevWeek = current.week.subtract(1, 'week');
      if (__DEV__) console.log('계산된 prevWeek:', prevWeek.format('YYYY-MM-DD'));
      setCurrent(prev => ({
        ...prev,
        week: prevWeek,
        month: prevWeek.startOf('month'),
      }));
      if (__DEV__) console.log('✅ prevWeek로 current.week, current.month 업데이트 완료');
    } else {
      const prevMonth = current.month.subtract(1, 'month');
      if (__DEV__) console.log('계산된 prevMonth:', prevMonth.format('YYYY-MM-DD'));
      setCurrent(prev => ({
        ...prev,
        month: prevMonth,
        week: prevMonth.startOf('month'),
      }));
      if (__DEV__) console.log('✅ prevMonth로 current.month, current.week 업데이트 완료');
    }

    if (__DEV__) console.log('=== handlePrev 디버그 완료 ===');
  }, [viewType, currentDate, current.week, current.month]);

  const handleNext = useCallback(() => {
    if (__DEV__) {
      console.log('=== handleNext 디버그 시작 ===');
      console.log('현재 viewType:', viewType);
      console.log('현재 currentDate:', currentDate.format('YYYY-MM-DD'));
    }

    const today = dayjs();

    if (viewType === 'week') {
      const nextWeek = current.week.add(1, 'week');
      if (__DEV__) console.log('계산된 nextWeek:', nextWeek.format('YYYY-MM-DD'));

      // 주간 단위 미래 체크
      if (nextWeek.isAfter(today, 'week')) {
        if (__DEV__) console.log('🚨 미래 주간 감지됨 - 토스트 메시지 표시');
        showToast({ message: '미래의 감정은 지금 기록할 수 없어요!', theme: 'dark', iconType: 'brokenHeart' });
        return;
      }

      setCurrent(prev => ({
        ...prev,
        week: nextWeek,
        month: nextWeek.startOf('month'), // ✅ 주 이동 시 월도 동기화
      }));
      if (__DEV__) console.log('✅ 미래 주간이 아님 - current.week/month 업데이트');
    } else {
      const nextMonth = current.month.add(1, 'month');
      if (__DEV__) console.log('계산된 nextMonth:', nextMonth.format('YYYY-MM-DD'));

      // 월간 단위 미래 체크
      if (nextMonth.isAfter(today, 'month')) {
        if (__DEV__) console.log('🚨 미래 월간 감지됨 - 토스트 메시지 표시');
        showToast({ message: '미래의 감정은 지금 기록할 수 없어요!', theme: 'dark', iconType: 'brokenHeart' });
        return;
      }

      setCurrent(prev => ({
        ...prev,
        month: nextMonth,
        week: nextMonth.startOf('month'),
      }));
      if (__DEV__) console.log('✅ 미래 월간이 아님 - current.month/week 업데이트');
    }

    if (__DEV__) console.log('=== handleNext 디버그 완료 ===');
  }, [viewType, currentDate, current.week, current.month, showToast]);

  const handleDayPress = useCallback((date: dayjs.Dayjs) => {
    const dateString = date.format('YYYY-MM-DD');
    navigation.navigate('EmotionSelectScreen', { date: dateString });
  }, [navigation]);

  // 일기 데이터 조회
  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        const from = (viewType === 'week' ? current.week.startOf('week') : current.month.startOf('month')).format('YYYY-MM-DD');
        const to = (viewType === 'week' ? current.week.endOf('week') : current.month.endOf('month')).format('YYYY-MM-DD');
        
        const response = await emotionDiaryService.getEmotionDiaries({ 
          from, 
          to, 
          deletionStatus: 'ACTIVE',
          page: 1,
          size: 100 // 충분한 크기로 설정
        });
        setRecordedItems(
          response.content.map(d => ({
            date: d.recordDate,
            character: d.emotion, // 프론트 키로 변환됨
            content: d.memo || '', // 실제 일기 내용 (null인 경우 빈 문자열)
          }))
        );
      } catch (e) {
        showToast({ message: '일기 데이터를 불러오지 못했어요.', theme: 'dark', iconType: 'brokenHeart' });
      }
    };
    fetchDiaries();
  }, [viewType, current.week, current.month]);

  // 리포트 월별 데이터 조회
  const fetchMonthlyStats = useCallback(async () => {
    try {
      const monthlyStats = await emotionStatsService.getMonthlyEmotionStats({
        year: reportCurrentYear,
        month: reportCurrentMonth,
      });
      setMonthlyStatsData(monthlyStats);
    } catch (error) {
      console.error('월별 감정 통계 로드 실패:', error);
      showToast({
        message: '감정 데이터를 불러오지 못했어요.',
        theme: 'dark',
        iconType: 'brokenHeart',
      });
    }
  }, [reportCurrentYear, reportCurrentMonth, showToast]);


  // 리포트 데이터 로드
  useEffect(() => {
    fetchMonthlyStats();
  }, [fetchMonthlyStats]);

  // 리포트 월 변경 핸들러
  const handleReportMonthChange = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const prevMonth = dayjs().year(reportCurrentYear).month(reportCurrentMonth - 2);
      setReportCurrentYear(prevMonth.year());
      setReportCurrentMonth(prevMonth.month() + 1);
    } else {
      const nextMonth = dayjs().year(reportCurrentYear).month(reportCurrentMonth);
      setReportCurrentYear(nextMonth.year());
      setReportCurrentMonth(nextMonth.month() + 1);
    }
  }, [reportCurrentYear, reportCurrentMonth]);

  const onStartRecordPress = useCallback(() => {
    navigation.navigate('EmotionSelectScreen', { date: dayjs().format('YYYY-MM-DD') });
  }, [navigation]);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'diary', title: '마음 일기' },
    { key: 'report', title: '마음 리포트' },
  ]);

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'diary':
        return (
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
            containsToday={weekIncludesToday}
            todayYear={dayjs().year()}
            todayMonth={dayjs().month() + 1}
          />
        );
      case 'report':
        return (
          <RecordReportTab
            onStartRecordPress={onStartRecordPress}
            monthlyStatsData={monthlyStatsData}
            reportCurrentYear={reportCurrentYear}
            reportCurrentMonth={reportCurrentMonth}
            onReportMonthChange={handleReportMonthChange}
          />
        );
      default:
        return null;
    }
  };

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