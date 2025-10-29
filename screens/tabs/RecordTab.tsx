import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, useWindowDimensions, Image, InteractionManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useTheme, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
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
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import CustomBottomSheet from '../../components/common/bottomsheet/CustomBottomSheet';
import { Button } from '../../components/common/buttons/Button';
import { syongsyongTypography, typography } from '../../constants/typography';
import { getLogicalNow as getLogicalNowUtil } from '../../utils/timeUtils';
import { radius } from '../../constants/radius';
import { ss, sv } from '../../utils/scale';
import { useNotificationQueueProcessor } from '../../hooks/useNotificationQueueProcessor';
import { logScreenView } from '../../utils/analytics';

type RecordTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'record'>,
  StackNavigationProp<RecordStackParamList>
>;

const RecordTab = () => {
  // 알림 큐 처리 (탭 포커스 시 큐에 있는 알림을 순차적으로 표시)
  useNotificationQueueProcessor();

  // 탭을 벗어날 때 바텀시트 닫기
  useFocusEffect(
    useCallback(() => {
      // Analytics: 화면 조회 추적
      logScreenView('RecordTab');
      
      return () => {
        // 탭을 벗어날 때 바텀시트가 열려있으면 닫기
        activityInducingSheetRef.current?.close();
      };
    }, [])
  );
  
  // 논리적 오늘(now) 유틸 사용: utils에서 설정한 기본 boundaryHour 사용
  const getLogicalNow = useCallback(() => getLogicalNowUtil(), []);

  const [current, setCurrent] = useState({
    week: getLogicalNow().startOf('week'),
    month: getLogicalNow().startOf('month')
  });
  const [viewType, setViewType] = useState<'week' | 'month'>('week');
  const { showToast } = useToast();
  const navigation = useNavigation<RecordTabNavigationProp>();
  const route = useRoute<RouteProp<RecordStackParamList, 'RecordTab'>>();
  const layout = useWindowDimensions();
  const [isCelebrationParticle, setIsCelebrationParticle] = useState(false);

  const celebrationSheetRef = useRef<BottomSheetModal>(null);
  const activityInducingSheetRef = useRef<BottomSheetModal>(null);
  const hasOpenedInitialSheetRef = useRef(false);

  
  const presentSheetSafely = useCallback((ref: React.RefObject<BottomSheetModal | null>, withCelebration?: boolean) => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        if (withCelebration) setIsCelebrationParticle(true);
        ref.current?.expand();
      });
    });
  }, []);

  useEffect(() => {
    if (hasOpenedInitialSheetRef.current) return;
    if (route.params?.isFirstRecord === true) {
      hasOpenedInitialSheetRef.current = true;
      presentSheetSafely(activityInducingSheetRef, false);
    } else if (route.params?.isFirstRecord === false) {
      hasOpenedInitialSheetRef.current = true;
      presentSheetSafely(activityInducingSheetRef);
    }
  }, [route.params?.isFirstRecord, presentSheetSafely]);

  // 축하 바텀시트 닫기
  const handleCelebrationClose = () => {
    setIsCelebrationParticle(false);
    celebrationSheetRef.current?.close();
  };

  // 활동 유도 바텀시트 닫기
  const handleActivityInducingClose = () => {
    activityInducingSheetRef.current?.close();
  };

  // 현재 선택된 날짜 범위 계산
  const currentDate = useMemo(() => (viewType === 'week' ? current.week : current.month), [viewType, current.week, current.month]);

  const weekIncludesToday = useMemo(() => {
    if (viewType !== 'week') return false;
    const start = current.week.startOf('week');
    const end = current.week.endOf('week');
    const logicalNow = getLogicalNow();
    return logicalNow.isBetween(start, end, 'day', '[]');
  }, [viewType, current.week, getLogicalNow]);

  // 일기 데이터 상태
  const [recordedItems, setRecordedItems] = useState<{
    diaryId: number;
    date: string;
    character: string;
    content: string;
  }[]>([]);

  // 리포트 데이터 상태
  const [monthlyStatsData, setMonthlyStatsData] = useState<MonthlyStatsItem[]>([]);
  const [reportCurrentYear, setReportCurrentYear] = useState(dayjs().year());
  const [reportCurrentMonth, setReportCurrentMonth] = useState(dayjs().month() + 1);




  // viewType 변경 핸들러
  const handleViewTypeChange = useCallback((newViewType: 'week' | 'month') => {
    setViewType(newViewType);
  }, [viewType, currentDate]);

  const handlePrev = useCallback(() => {
    if (viewType === 'week') {
      const prevWeek = current.week.subtract(1, 'week');
      setCurrent(prev => ({
        ...prev,
        week: prevWeek,
        month: prevWeek.startOf('month'),
      }));
    } else {
      const prevMonth = current.month.subtract(1, 'month');
      setCurrent(prev => ({
        ...prev,
        month: prevMonth,
        week: prevMonth.startOf('month'),
      }));
    }
  }, [viewType, currentDate, current.week, current.month]);

  const handleNext = useCallback(() => {
    const today = getLogicalNow();

    if (viewType === 'week') {
      const nextWeek = current.week.add(1, 'week');

      // 주간 단위 미래 체크
      if (nextWeek.isAfter(today, 'week')) {
        showToast({ 
          message: '미래의 감정은 지금 기록할 수 없어요!', 
          theme: 'dark', 
          iconType: 'brokenHeart',
          style: {
            width: ss(335),
            height: sv(42),
          },
          textStyle: {
            ...typography.body5,
            textAlign: 'center',
          },
          iconSize: ss(24),
        });
        return;
      }

      setCurrent(prev => ({
        ...prev,
        week: nextWeek,
        month: nextWeek.startOf('month'), // ✅ 주 이동 시 월도 동기화
      }));
    } else {
      const nextMonth = current.month.add(1, 'month');

      // 월간 단위 미래 체크
      if (nextMonth.isAfter(today, 'month')) {
        showToast({ message: '미래의 감정은 지금 기록할 수 없어요!', theme: 'dark', iconType: 'brokenHeart',
          style: {
            width: ss(335),
            height: sv(42),
          },
          textStyle: {
            ...typography.body5,
            textAlign: 'center',
          },
          iconSize: ss(24),
        });
        return;
      }

      setCurrent(prev => ({
        ...prev,
        month: nextMonth,
        week: nextMonth.startOf('month'),
      }));
    }
  }, [viewType, currentDate, current.week, current.month, showToast, getLogicalNow]);

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
            diaryId: d.diaryId,
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

  const onToActivityPress = useCallback(() => {
    // 하단 탭 네비게이터로 올라가 Play 탭으로 전환
    handleActivityInducingClose();
    setTimeout(() => (navigation.getParent() as any)?.navigate('play', { screen: 'PlayActivityListScreen', params: { title: '호흡', content: [] } }), 120);
  }, [navigation, handleActivityInducingClose]);

  const handlePastDayPress = useCallback((date: dayjs.Dayjs) => {
    showToast({ message: '지난 날짜는 기록할 수 없어요!', theme: 'dark', iconType: 'brokenHeart' });
  }, []);

  const onStartRecordPress = useCallback(() => {
    navigation.navigate('EmotionSelectScreen', { date: getLogicalNow().format('YYYY-MM-DD') });
  }, [navigation, getLogicalNow]);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'diary', title: '마음 일기' },
    { key: 'report', title: '마음 리포트' },
  ]);

  // 탭 포커스 시 항상: 일기 탭, 주간 보기, 이번 주(오늘 포함 주)로 초기화
  useFocusEffect(
    useCallback(() => {
      const now = getLogicalNow();
      setIndex(0);
      setViewType('week');
      setCurrent(prev => ({
        ...prev,
        week: now.startOf('week'),
        month: now.startOf('month'),
      }));
    }, [getLogicalNow])
  );

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
            onPastDayPress={handlePastDayPress}
            onStartRecordPress={onStartRecordPress}
            styles={styles}
            containsToday={weekIncludesToday}
            todayYear={getLogicalNow().year()}
            todayMonth={getLogicalNow().month() + 1}
            onItemPress={(diaryId) => {
              navigation.navigate('EmotionRecordScreen', { diaryId });
            }}
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
            onGoToDiary={() => setIndex(0)}
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
        <CustomBottomSheet
          children={
            <View style={styles.celebrationContainer}>
              <View style={styles.bottomSheetTextContainer}>
                <Text style={styles.bottomSheetTitle}>첫 기록을 남겼어요!</Text>
                <Text style={styles.bottomSheetMessage}>마음도, 꾸준히 움직이면 달라져요!</Text>
              </View>
              <View style={styles.bottomSheetImageContainer}>
                <Image source={require('../../assets/images/common/cat_writing.png')} style={styles.bottomSheetImage} />
              </View>
              <Button
                title="확인"
                variant="active"
                size="large"
                onPress={handleCelebrationClose}
                style={styles.celebrationButton}
              />
            </View>
          }
          bottomSheetModalRef={celebrationSheetRef}
          hasBackDrop={true}
          enablePanDownToClose={false}
          hasXButton
          enableOverDrag={false}
          hasTopButton={false}
          onClose={handleCelebrationClose}
          hasCelebrationParticle={isCelebrationParticle}
        />
      <CustomBottomSheet
        children={
          <View style={styles.activityInducingContainer}>
            <View style={styles.bottomSheetTextContainer}>
              <Text style={styles.bottomSheetTitle}>마음을 풀어주는 시간,{'\n'}함께 해볼까요?</Text>
              <Text style={styles.bottomSheetMessage}>마음도, 꾸준히 움직이면 달라져요!</Text>
            </View>
            <View style={styles.bottomSheetImageContainer}>
              <Image source={require('../../assets/images/common/cat_meditating.png')} style={styles.bottomSheetImage} />
            </View>
            <View style={styles.bottomSheetButtonContainer}>
              <Button
                title="다음에 하기"
                variant="default"
                size="medium"
                onPress={handleActivityInducingClose}
                style={{flexShrink: 1}}
              />
              <Button
                title="마음 운동 하러가기"
                variant="active"
                size="medium"
                onPress={onToActivityPress}
                style={{flexShrink: 1}}
              />
            </View>
          </View>
        }
        
        bottomSheetModalRef={activityInducingSheetRef}
        hasBackDrop={true}
        enablePanDownToClose={false}
        hasXButton
        enableOverDrag={false}
        hasTopButton={false}
        hasCelebrationParticle={false}
        onClose={handleActivityInducingClose}
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
  // 축하 바텀시트 스타일
  celebrationContainer: {
    paddingBottom: 50,
    paddingHorizontal: 20,
    marginTop: -10
  },
  celebrationContent: {
    gap: 20,
  },
  bottomSheetTextContainer: {
    gap: 12,
  },
  bottomSheetTitle: {
    ...syongsyongTypography.title4,
    lineHeight: 26*1.3,
  },
  bottomSheetMessage: {
    ...typography.body2,
    color: colors.grayScale500,
  },
  bottomSheetImageContainer: {
    width: ss(335),
    height: sv(191),
    backgroundColor: colors.grayScale100,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderRadius: radius.r12,
    overflow: 'hidden',
  },
  bottomSheetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  celebrationButton: {
    width: '100%',
    marginTop: 30,
  },
  activityInducingContainer: {
    paddingBottom: 50,
    paddingHorizontal: 20,
    marginTop: -10,
  },
  activityInducingTitle: {
    ...syongsyongTypography.title4,
    
  },
  bottomSheetButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 30,
  },
});

export default RecordTab; 