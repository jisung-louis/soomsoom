import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TouchableWithoutFeedback, Animated, Easing } from 'react-native';
import { colors } from '../../../constants/colors';
import { syongsyongTypography, typography } from '../../../constants/typography';
import ArrowLeftIcon from '../../../assets/icons/common/arrow_back.svg';
import ArrowRightIcon from '../../../assets/icons/common/arrow_right.svg';
import { Surface } from '../../common/surface/Surface';
import InfoIcon from '../../../assets/icons/common/info.svg';
import { radius } from '../../../constants/radius';
import { emotionStatsService, MonthlyStatsItem, DailyDiaryItem } from '../../../services/emotionStatsService';
import { EmotionRankingData, EmotionType } from '../../../types';
import LoadingSpinner from '../../common/loading/LoadingSpinner';
import ErrorMessage from '../../common/error/ErrorMessage';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);
import KingIcon from '../../../assets/icons/record/report/king.svg';
import DonutChart from '../../common/charts/DonutChart';
import { getRankColor } from '../../../utils/emotionColorUtils';
import { characterIconMap } from '../../../utils/iconMap';
import { getEmotionTitle, sortEmotionsByCountAndPriority } from '../../../utils/emotionConstants';
import { Button } from '../../common/buttons/Button';
import BubbleTalk from '../../common/bubbletalk/BubbleTalk';
import BarChart from '../../common/charts/BarChart';
import EmptyCatIcon from '../../../assets/icons/record/report/cat_write2.svg';
import EmptyMonthIcon from '../../../assets/icons/record/report/cat_quiet.svg';
import { ButtonSmall } from '../../common/buttons/ButtonSmall';
import LottieView from 'lottie-react-native';
import { ss, sv } from '../../../utils/scale';

const windowWidth = Dimensions.get('window').width;

const barWidth =  (windowWidth - 40 - 8) / 3 ;
const barHeight = {
  first: 140,
  second: 120,
  third: 100,
};

const maxBarHeight = barHeight.first;

// const PodiumBar = ({ height, backgroundColor, delayMs = 0, children }: { height: number; backgroundColor: string; delayMs?: number; children?: React.ReactNode }) => {
//   const animatedHeight = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     animatedHeight.setValue(0);
//     Animated.timing(animatedHeight, {
//       toValue: height,
//       duration: 700,
//       delay: delayMs,
//       easing: Easing.out(Easing.cubic),
//       useNativeDriver: false,
//     }).start();
//   }, [height, delayMs]);

//   return (
//     <View style={[styles.barWrapper, { height: maxBarHeight }] }>
//       <Animated.View style={[styles.barCommonStyle, { height: animatedHeight, backgroundColor }]}>
//         {children}
//       </Animated.View>
//     </View>
//   );
// };

interface RecordReportTabProps {
  onStartRecordPress: () => void;
  monthlyStatsData: MonthlyStatsItem[];
  reportCurrentYear: number;
  reportCurrentMonth: number;
  onReportMonthChange: (direction: 'prev' | 'next') => void;
}

const RecordReportTab = ({
  onStartRecordPress,
  monthlyStatsData,
  reportCurrentYear,
  reportCurrentMonth,
  onReportMonthChange
}: RecordReportTabProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<{
    item: EmotionRankingData;
    index: number;
    position: { x: number; y: number };
  } | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);  // 스크롤 오프셋 추가
  const [showParticle, setShowParticle] = useState(true);
  
  // 주차 관련 상태 (내부에서 관리)
  const [currentWeek, setCurrentWeek] = useState(dayjs().week());
  const [monthlyDataCache, setMonthlyDataCache] = useState<Record<string, DailyDiaryItem[]>>({});
  
  // 파티클 애니메이션 표시
  useEffect(() => {
    setShowParticle(true);
  }, [monthlyStatsData]);

  // 주차 변경 핸들러 (내부에서 처리)
  const handleWeekChange = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const firstWeekOfMonth = dayjs().year(reportCurrentYear).month(reportCurrentMonth - 1).startOf('month').week();
      if (currentWeek > firstWeekOfMonth) {
        setCurrentWeek(currentWeek - 1);
      }
    } else {
      const lastWeekOfMonth = dayjs().year(reportCurrentYear).month(reportCurrentMonth - 1).endOf('month').week();
      if (currentWeek < lastWeekOfMonth) {
        setCurrentWeek(currentWeek + 1);
      }
    }
  }, [reportCurrentYear, reportCurrentMonth, currentWeek]);

  // 월별 모든 주차 데이터 미리 로딩
  const loadMonthlyData = useCallback(async () => {
    try {
      const monthKey = `${reportCurrentYear}-${reportCurrentMonth}`;
      
      // 이미 캐시된 데이터가 있으면 스킵
      if (monthlyDataCache[monthKey]) {
        return;
      }

      const startOfMonth = dayjs().year(reportCurrentYear).month(reportCurrentMonth - 1).startOf('month');
      const endOfMonth = dayjs().year(reportCurrentYear).month(reportCurrentMonth - 1).endOf('month');
      const dailyData = await emotionStatsService.getDailyEmotionDiaries({
        from: startOfMonth.format('YYYY-MM-DD'),
        to: endOfMonth.format('YYYY-MM-DD'),
      });
      
      setMonthlyDataCache(prev => ({
        ...prev,
        [monthKey]: dailyData
      }));
    } catch (error) {
      console.error('월별 감정 기록 로드 실패:', error);
    }
  }, [reportCurrentYear, reportCurrentMonth, monthlyDataCache]);

  // 현재 주차의 데이터를 캐시에서 가져오기
  const getCurrentWeekData = useCallback((): DailyDiaryItem[] => {
    const monthKey = `${reportCurrentYear}-${reportCurrentMonth}`;
    const monthData = monthlyDataCache[monthKey] || [];
    
    // 현재 주차의 시작일과 종료일 계산 (연말/연초 경계 안전하게 처리)
    const startOfWeek = dayjs().year(reportCurrentYear).week(currentWeek).startOf('week');
    const endOfWeek = dayjs().year(reportCurrentYear).week(currentWeek).endOf('week');
    
    // 연말/연초 경계 체크: 주차가 다른 해에 속하는 경우 올바른 해로 조정
    const adjustedStartOfWeek = startOfWeek.year() !== reportCurrentYear ? 
      dayjs().year(reportCurrentYear).month(reportCurrentMonth - 1).startOf('month') : startOfWeek;
    const adjustedEndOfWeek = endOfWeek.year() !== reportCurrentYear ? 
      dayjs().year(reportCurrentYear).month(reportCurrentMonth - 1).endOf('month') : endOfWeek;
    
    // 해당 주차에 속하는 데이터만 필터링
    return monthData.filter(item => {
      const itemDate = dayjs(item.recordDate);
      return (itemDate.isSame(adjustedStartOfWeek, 'day') || itemDate.isAfter(adjustedStartOfWeek, 'day')) && 
             (itemDate.isSame(adjustedEndOfWeek, 'day') || itemDate.isBefore(adjustedEndOfWeek, 'day'));
    });
  }, [reportCurrentYear, reportCurrentMonth, currentWeek, monthlyDataCache]);

  // 월 변경 시 주차를 해당 월의 첫째 주로 리셋
  const resetWeekToFirstWeekOfMonth = useCallback(() => {
    const firstWeekOfMonth = dayjs().year(reportCurrentYear).month(reportCurrentMonth - 1).startOf('month').week();
    setCurrentWeek(firstWeekOfMonth);
  }, [reportCurrentYear, reportCurrentMonth]);

  // 월이 변경될 때 주차를 첫째 주로 리셋하고 월별 데이터 로딩
  useEffect(() => {
    resetWeekToFirstWeekOfMonth();
    loadMonthlyData();
  }, [reportCurrentYear, reportCurrentMonth, resetWeekToFirstWeekOfMonth, loadMonthlyData]);


  // monthlyStatsData를 ranking 형식으로 변환
  const emotionRankingData = useMemo(() => {
    // monthlyStatsData가 비어있거나 유효하지 않으면 빈 배열 반환
    if (!monthlyStatsData || !Array.isArray(monthlyStatsData) || monthlyStatsData.length === 0) {
      return [];
    }

    // 안전한 아이콘 가져오기 함수
    const getSafeIcon = (emotion: EmotionType) => {
      try {
        const icon = characterIconMap.active[emotion as keyof typeof characterIconMap.active];
        if (icon && typeof icon === 'function') {
          return icon;
        }
        // 아이콘이 없거나 유효하지 않으면 happy 아이콘 사용
        return characterIconMap.active.happy;
      } catch (error) {
        console.warn('Error getting icon for emotion:', emotion, error);
        return characterIconMap.active.happy;
      }
    };

    return monthlyStatsData
      .map(stat => ({
        emotion: stat.emotion,
        title: getEmotionTitle(stat.emotion),
        count: stat.count,
        percentage: stat.percentage,
        icon: getSafeIcon(stat.emotion),
      }))
      .sort(sortEmotionsByCountAndPriority);
  }, [monthlyStatsData]);

  // API 데이터를 BarChart 형식으로 변환하는 함수
  const convertDailyDataToBarChartFormat = (dailyData: DailyDiaryItem[]): Record<string, Record<string, string>> => {
    const result: Record<string, Record<string, string>> = {};
    
    dailyData.forEach(item => {
      const date = dayjs(item.recordDate);
      const yearMonth = date.format('YYYY-MM');
      const day = date.format('D');
      
      if (!result[yearMonth]) {
        result[yearMonth] = {};
      }
      
      result[yearMonth][day] = item.emotion;
    });
    
    return result;
  };

  // 현재 월이 미래인지 확인
  const isCurrentMonthFuture = dayjs().year(reportCurrentYear).month(reportCurrentMonth).isAfter(dayjs(), 'month');

  // 상위 3개 감정을 시상대 순서로 정렬 (2등, 1등, 3등)
  const podiumEmotions = [
    emotionRankingData[1], // 2등
    emotionRankingData[0], // 1등
    emotionRankingData[2], // 3등
  ].filter(Boolean); // undefined 제거

  // 로딩 중
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 에러 발생
  if (error) {
    return <ErrorMessage message={error} onRetry={() => {}} />;
  }

  const handleSegmentPress = (item: EmotionRankingData, index: number, meta: { 
    midAngle: number; 
    svg: { x: number; y: number }; 
    screen: { x: number; y: number };
    centerSvg: { x: number; y: number };
    centerScreen: { x: number; y: number };
    touchPosition?: { x: number; y: number };
  }) => {
    console.log(item, index, meta);
    
    // 사용자가 터치한 정확한 위치에 BubbleTalk 표시
    setSelectedSegment({
      item,
      index,
      position: {
        x: meta.touchPosition?.x || meta.centerScreen.x,  // 터치 좌표 우선, 없으면 중심 좌표
        y: meta.touchPosition?.y || meta.centerScreen.y   // 터치 좌표 우선, 없으면 중심 좌표
      }
    });
  };

  // BubbleTalk 닫기
  const closeBubbleTalk = () => {
    setSelectedSegment(null);
  };


  return emotionRankingData.length > 0 ? (
    <ScrollView style={styles.container}>
      {/* 월 단위 이동 컴포넌트 */}
      <View style={styles.yearMonthContainer}>
        <TouchableOpacity 
          onPress={() => onReportMonthChange('prev')}
          style={styles.arrowButton}
        >
          <ArrowLeftIcon width={24} height={24} color={colors.grayScale800} />
        </TouchableOpacity>
        
        <View style={styles.yearMonthTextContainer}>
          <View style={styles.yearAndMonthTextContainer}>
            <Text style={styles.dateNumber}>{reportCurrentYear}</Text>
            <Text style={styles.dateText}>년</Text>
          </View>
          <View style={styles.yearAndMonthTextContainer}>
            <Text style={styles.dateNumber}>{reportCurrentMonth}</Text>
            <Text style={styles.dateText}>월</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={() => onReportMonthChange('next')}
          style={[styles.arrowButton, isCurrentMonthFuture && styles.disabledArrow]}
          disabled={isCurrentMonthFuture}
        >
          <ArrowRightIcon 
            width={24} 
            height={24} 
            color={isCurrentMonthFuture ? colors.grayScale300 : colors.grayScale800} 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.RecordReportContentContainer}>
      {showParticle && (
        <LottieView
          source={require('../../../assets/animations/particle.json')}
          autoPlay
          loop={false}
          style={styles.particle}
          onAnimationFinish={() => {
            setShowParticle(false);
          }}
        />
        )}
        {/* 월별 감정 순위 컴포넌트 */}
        <View style={styles.emotionRankContainer}>
          <View style={styles.emotionReportTitleAndInfoContainer}>
            <View>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <Text style={styles.emotionReportTitle}>{reportCurrentMonth}</Text>
                <Text style={styles.emotionReportTitle}>월달의</Text>
              </View>
              <Text style={styles.emotionReportTitle}>감정 순위에요!</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <InfoIcon width={24} height={24} color={colors.grayScale800} />
              <Text style={styles.emotionReportInfoText}>기록한 감정이 많은 순으로 보여줘요!</Text>
            </View>
          </View>

          <View style={styles.emotionRankContentContainer}>
              <View style={styles.emotionRankContentContainer}>
                <View style={styles.barGraphContainer}>
                  {/* {podiumEmotions.map((emotion, index) => {
                    // 시상대 순서: index 0=2등, 1=1등, 2=3등
                    const actualRank = index === 0 ? 2 : index === 1 ? 1 : 3;
                    const barStyle = actualRank === 1 ? styles.bar1st : 
                                  actualRank === 2 ? styles.bar2nd : styles.bar3rd;
                    
                    return (
                      <View key={emotion.emotion} style={[styles.rankContainer, index === 1 && {gap: 20}]}>
                        <View style={styles.emotionContainer}>
                          <View style={styles.emotionIconAndTitleContainer}>
                            {index === 1 && (
                              <KingIcon width={40} height={40} style={{marginBottom: 2}} />
                            )}
                            <emotion.icon width={64} height={64} />
                            <Text style={styles.emotionTitle}>{emotion.title}</Text>
                          </View>
                          <Text style={styles.countText}>{emotion.count}번</Text>
                        </View>
                        <PodiumBar
                          height={actualRank === 1 ? barHeight.first : actualRank === 2 ? barHeight.second : barHeight.third}
                          backgroundColor={actualRank === 1 ? colors.primary300 : actualRank === 2 ? colors.primary200 : colors.primary50}
                        >
                          <Text style={[styles.rankText, actualRank === 1 && { color: colors.white }]}>{actualRank}</Text>
                        </PodiumBar>
                      </View>
                    );
                  })} */}
                  {podiumEmotions.map((emotion, index) => {
                    const actualRank = index === 0 ? 2 : index === 1 ? 1 : 3;
                    const barStyle = actualRank === 1 ? styles.bar1st : 
                                  actualRank === 2 ? styles.bar2nd : styles.bar3rd;
                    return (
                      <View key={emotion.emotion} style={{alignItems: 'center'}}>
                        {actualRank === 1 && (
                          <KingIcon width={40} height={40} style={{marginBottom: 2}} />
                        )}
                        <emotion.icon width={64} height={64} />
                        <Text style={styles.emotionTitle}>{emotion.title}</Text>
                        <Text style={styles.countText}>{emotion.count}번</Text>
                        <View style={[barStyle, styles.barCommonStyle]}>
                          <Text style={[styles.rankText, actualRank === 1 && { color: colors.white }]}>{actualRank}</Text>
                        </View>
                      </View>

                    );
                  })}
                </View>
                
                <View style={styles.emotionRestListContainer}>
                  {emotionRankingData.map((emotion, index) => {
                    if (index === 0 || index === 1 || index === 2) {
                      return null;
                    }
                    return (
                    <View key={emotion.emotion} style={styles.emotionListItem}>
                      <View style={styles.emotionItemContainer}>
                        <View style={styles.emotionItemLeft}>
                          <emotion.icon width={40} height={40} />
                          <Text style={styles.emotionItemTitle}>{emotion.title}</Text>
                        </View>
                        <View style={styles.emotionItemRight}>
                          <Text style={styles.emotionCount}>{emotion.count}번</Text>
                        </View>
                      </View>
                    </View>
                  )})}
                </View>
              </View>
            
          </View>
        </View>

        <Surface/>

        {/* 월별 감정 분포 컴포넌트 */}
        <View style={styles.emotionDistributionContainer}>
          <View style={[styles.emotionReportTitleAndInfoContainer, {gap: 4}]}>
            <Text style={styles.emotionReportTitle}>감정분포</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <InfoIcon width={24} height={24} color={colors.grayScale800} />
              <Text style={styles.emotionReportInfoText}>차트 클릭 시 자세히 확인할 수 있어요!(미구현)</Text>
            </View>
          </View>
          <View style={styles.emotionDistributionContentContainer}>
            <View style={styles.donutChartWrapper}>
              {emotionRankingData.length > 0 ? (
                <>
                <DonutChart data={emotionRankingData} onSegmentPress={handleSegmentPress} />
                
                {/* 선택된 세그먼트에 BubbleTalk 표시 */}
                {/* {selectedSegment && (
                  <BubbleTalk
                    text={`${selectedSegment.item.title}: ${selectedSegment.item.count}회 (${selectedSegment.item.percentage}%)`}
                    trianglePosition="bottom"
                    style={{
                      position: 'absolute',
                      // 스크롤 오프셋을 고려한 정확한 위치 계산
                      top: selectedSegment.position.y - scrollOffset,  // 스크롤 오프셋 제거
                      left: selectedSegment.position.x - 90, // 터치 위치 왼쪽으로 (BubbleTalk 너비의 절반)
                      zIndex: 1000,
                    }}
                  />
                )} */}
                
                {/* 터치 외부 클릭 감지를 위한 투명 오버레이 */}
                {selectedSegment && (
                  <TouchableWithoutFeedback onPress={closeBubbleTalk}>
                    <View style={styles.overlay} />
                  </TouchableWithoutFeedback>
                )}
                
                <View style={styles.percentageContainer}>
                  <View style={styles.barPercentageContainer}>
                    {emotionRankingData.map((item, index) => (
                      <View 
                        key={item.emotion} 
                        style={[styles.barPercentage, {backgroundColor: getRankColor(index), 
                        width: (item.percentage / 100) * (windowWidth - 40)} ]} 
                      />
                    ))}
                  </View>
                  <View style={styles.ratioPercentageContainer}>
                    {emotionRankingData.map((item, index) => {
                      const IconStroke = characterIconMap.stroke[item.emotion as keyof typeof characterIconMap.stroke];
                      return (
                        <View key={item.emotion} style={styles.ratioPercentage}>
                          <View style={[styles.ratioEmotionBlock, {backgroundColor: getRankColor(index)}]}>
                             <IconStroke width={40} height={40}/>
                          </View>
                          <View style={styles.ratioEmotionBlockTextContainer}>
                            <Text style={styles.ratioEmotionBlockText}>{item.percentage}%</Text>
                          </View>
                        </View>
                      );
                    })}
                    {/* 데이터가 6개 미만일 때 placeholder 추가 */}
                    {Array.from({ length: Math.max(0, 6 - emotionRankingData.length) }).map((_, index) => (
                      <View key={`placeholder-${index}`} style={styles.ratioPercentage}>
                        <View style={styles.ratioEmotionBlock}>
                          {/* 빈 placeholder */}
                        </View>
                        {/* <View style={styles.ratioEmotionBlockTextContainer}>
                          <Text style={[styles.ratioEmotionBlockText, styles.ratioEmotionBlockTextPlaceholder]}>-</Text>
                        </View> */}
                      </View>
                    ))}
                  </View>
                </View>
                </>
              ) : (
                <Text style={styles.emptyStateText}>표시할 데이터가 없어요</Text>
              )}
            </View>
          </View>
        </View>

        <Surface height={1} style={{marginHorizontal: 20}}/>

        {/* 요일별 감정 기록 컴포넌트 */}
        <View style={styles.emotionRecordContainer}>
          <View style={styles.emotionRecordHeaderContainer}>
            <View style={styles.emotionRecordHeaderTitleContainer}>
              <Text style={styles.emotionRecordTitle}>요일별 감정기록</Text>
              <Text style={styles.emotionRecordWeeklyDate}>
                {(() => {
                  // 현재 주차의 시작일과 종료일 계산
                  const startOfWeek = dayjs().year(reportCurrentYear).week(currentWeek).startOf('week');
                  const endOfWeek = dayjs().year(reportCurrentYear).week(currentWeek).endOf('week');
                  
                  // 월이 바뀌는 경우 현재 월에 해당하는 날짜만 표시
                  const startDate = startOfWeek.month() === reportCurrentMonth - 1 ? startOfWeek.date() : 1;
                  const endDate = endOfWeek.month() === reportCurrentMonth - 1 ? endOfWeek.date() : endOfWeek.daysInMonth();
                  
                  return `${startDate}일 - ${endDate}일 ${reportCurrentYear}.${reportCurrentMonth.toString().padStart(2, '0')}`;
                })()}
              </Text>
            </View>
            <View style={styles.emotionRecordWeeklyMoveContainer}>
              <TouchableOpacity style={styles.emotionRecordWeeklyMoveButton} onPress={() => handleWeekChange('prev')}>
                <ArrowLeftIcon width={24} height={24} color={colors.grayScale800} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.emotionRecordWeeklyMoveButton} onPress={() => handleWeekChange('next')}>
                <ArrowRightIcon width={24} height={24} color={colors.grayScale800} />
              </TouchableOpacity>
            </View>
          </View>
          {/* 요일별 감정 기록 차트 */}
          <View style={styles.emotionRecordChartContainer}>
            <BarChart 
              currentYear={reportCurrentYear} 
              currentMonth={reportCurrentMonth} 
              currentWeek={currentWeek} 
              emotionReportData={convertDailyDataToBarChartFormat(getCurrentWeekData())} 
            />
          </View>
        </View>
      </View>
    </ScrollView>
  ) : (
    <View style={styles.container}>
      {/* 월 단위 이동 컴포넌트 */}
      <View style={styles.yearMonthContainer}>
        <TouchableOpacity 
          onPress={() => onReportMonthChange('prev')}
          style={styles.arrowButton}
        >
          <ArrowLeftIcon width={24} height={24} color={colors.grayScale800} />
        </TouchableOpacity>
        
        <View style={styles.yearMonthTextContainer}>
          <View style={styles.yearAndMonthTextContainer}>
            <Text style={styles.dateNumber}>{reportCurrentYear}</Text>
            <Text style={styles.dateText}>년</Text>
          </View>
          <View style={styles.yearAndMonthTextContainer}>
            <Text style={styles.dateNumber}>{reportCurrentMonth}</Text>
            <Text style={styles.dateText}>월</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={() => onReportMonthChange('next')}
          style={[styles.arrowButton, isCurrentMonthFuture && styles.disabledArrow]}
          disabled={isCurrentMonthFuture}
        >
          <ArrowRightIcon 
            width={24} 
            height={24} 
            color={isCurrentMonthFuture ? colors.grayScale300 : colors.grayScale800} 
          />
        </TouchableOpacity>
      </View>
      {isCurrentMonthFuture ? (
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyStateContentContainer}>
          <EmptyCatIcon width={100} height={100} />
          <Text style={styles.emptyStateText}>이 달의 첫 기록, 지금 남겨보세요!</Text>
        </View>
        <ButtonSmall
          title="기록 시작하기"
          onPress={() => {onStartRecordPress();}}
          variant="active"
        />
      </View>
      ) : (
        <View style={styles.emptyStateContainer}>
        <View style={styles.emptyStateContentContainer}>
          <EmptyMonthIcon width={100} height={100} />
          <Text style={styles.emptyStateText}>이 달엔 조용했네요!</Text>
        </View>
      </View>
      )}
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 100,
  },
  RecordReportContentContainer: {
    position: 'relative',
  },
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -10,
    width: '100%',
    height:418,
  },
  yearMonthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    gap: 8,
  },
  yearMonthTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  yearAndMonthTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dateNumber: {
    ...syongsyongTypography.title3,
    color: colors.grayScale800,
  },
  dateText: {
    ...syongsyongTypography.title4,
    color: colors.grayScale800,
  },
  emotionRankContainer: {
    marginVertical: 30,
    paddingHorizontal: 20,
    gap: 50,
  },
  emotionReportTitleAndInfoContainer: {
    justifyContent: 'center',
    gap: 8,
  },
  emotionReportTitle: {
    ...syongsyongTypography.title5,
  },
  emotionReportInfoText: {
    ...typography.body5,
    color: colors.grayScale400,
  },
  emotionRankContentContainer: {
    gap: 20,
  },
  barGraphContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'flex-end',
  },
  emotionRestListContainer: {
    gap: 10,
  },
  bar2nd: {
    height: barHeight.second,
    backgroundColor: colors.primary200,
    marginTop: 16,
  },
  bar1st: {
    height: barHeight.first,
    backgroundColor: colors.primary300,
    marginTop: 20,
  },
  bar3rd: {
    height: barHeight.third,
    backgroundColor: colors.primary50,
    marginTop: 16,
  },
  barCommonStyle: {
    width: barWidth,
    borderRadius: radius.r8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: barWidth,
    justifyContent: 'flex-end',
  },
  arrowButton: {
    padding: 5,
  },
  disabledArrow: {
    opacity: 0.5,
  },
  rankContainer: {
    alignItems: 'center',
    gap: 16,
  },
  emotionContainer: {
    alignItems: 'center',
    gap: 4,
  },
  emotionIconAndTitleContainer: {
    alignItems: 'center',
  },
  emotionTitle: {
    ...typography.body4,
    color: colors.grayScale900,
    marginTop: 6,
  },
  rankText: {
    ...typography.heading9,
    color: colors.primary300,
  },
  countText: {
    ...typography.body5,
    color: colors.grayScale600,
    marginTop: 4,
  },
  emotionListItem: {
    padding: 16,
    backgroundColor: colors.grayScale50,
    borderRadius: radius.r6,
    height: 72,
  },
  emotionItemContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emotionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emotionItemRight: {
    alignItems: 'flex-end',
  },
  emotionItemTitle: {
    ...typography.body4,
    color: colors.grayScale800,
  },
  emotionCount: {
    ...typography.body5,
    color: colors.grayScale500,
  },
  emotionPercentage: {
    ...typography.body5,
    color: colors.grayScale400,
  },
  emotionDistributionContainer: {
    marginVertical: 30,
    paddingHorizontal: 20,
    gap: 30,
  },
  emotionDistributionContentContainer: {
    gap: 40,
  },
  donutChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  legendTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  legendTitle: {
    ...typography.body4,
    color: colors.grayScale800,
  },
  legendMeta: {
    ...typography.body6,
    color: colors.grayScale500,
  },
  emotionRecordContainer: {
    marginVertical: 30,
    paddingHorizontal: 20,
    gap: 30,
  },
  emotionRecordHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  emotionRecordHeaderTitleContainer: {
    gap: 8,
  },
  emotionRecordTitle: {
    ...syongsyongTypography.title5,
    color: colors.grayScale900,
  },
  emotionRecordWeeklyDate: {
    ...typography.body5,
    color: colors.grayScale400,
  },
  emotionRecordWeeklyMoveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -6,
  },
  emotionRecordWeeklyMoveButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageContainer: {  
    gap: 20,
    marginTop: 40,
  },
  barPercentageContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  barPercentage: {
    height: 16,
    borderRadius: radius.max,
  },
  ratioPercentageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratioPercentage: {
    gap: 8,
  },
  ratioEmotionBlock: {
    width: 50,
    height: 50,
    borderRadius: radius.r6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratioEmotionBlockTextContainer: {
    alignItems: 'center',
  },
  ratioEmotionBlockText: {
    ...typography.body4,
    color: colors.grayScale900,
  },
  bubbleTalkContainer: {
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  emotionRecordChartContainer: {
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    flex: 1,
  },
  emptyStateContentContainer: {
    alignItems: 'center',
    gap: 20,
  },
  emptyStateText: {
    ...syongsyongTypography.title6,
    color: colors.grayScale900,
  },
});

export default RecordReportTab;
