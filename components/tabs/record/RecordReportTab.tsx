import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { colors } from '../../../constants/colors';
import { syongsyongTypography, typography } from '../../../constants/typography';
import ArrowLeftIcon from '../../../assets/icons/common/arrow_back.svg';
import ArrowRightIcon from '../../../assets/icons/common/arrow_right.svg';
import { Surface } from '../../common/surface/Surface';
import InfoIcon from '../../../assets/icons/common/info.svg';
import { radius } from '../../../constants/radius';
import { emotionService } from '../../../services/emotionService';
import { EmotionRankingData, EmotionType } from '../../../types/emotion';
import LoadingSpinner from '../../common/loading/LoadingSpinner';
import ErrorMessage from '../../common/error/ErrorMessage';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);
import KingIcon from '../../../assets/icons/record/report/king.svg';
import DonutChart from '../../common/charts/DonutChart';
import { getRankColor } from '../../../utils/emotionColorUtils';
import { characterIconMap } from '../../../utils/iconMap';
import { Button } from '../../common/buttons/Button';
import BubbleTalk from '../../common/bubbletalk/BubbleTalk';
import BarChart from '../../common/charts/BarChart';
import { emotionReportMockData } from '../../../data/emotionReportMockData';
import EmptyCatIcon from '../../../assets/icons/record/report/cat_write2.svg';
import EmptyMonthIcon from '../../../assets/icons/record/report/cat_quiet.svg';
import { ButtonSmall } from '../../common/buttons/ButtonSmall';

const windowWidth = Dimensions.get('window').width;

const barWidth = 109;
const barHeight = {
  first: 140,
  second: 120,
  third: 100,
};

const RecordReportTab = () => {
  const [emotionRankingData, setEmotionRankingData] = useState<EmotionRankingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [currentMonth, setCurrentMonth] = useState(dayjs().month() + 1);
  const [currentWeek, setCurrentWeek] = useState(dayjs().week());
  const [selectedSegment, setSelectedSegment] = useState<{
    item: EmotionRankingData;
    index: number;
    position: { x: number; y: number };
  } | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);  // 스크롤 오프셋 추가

  // 페이지 진입 시 및 월 변경 시 데이터 로드
  useEffect(() => {
    loadEmotionData();
    // 월 변경 시 주차를 해당 월의 첫째 주로 리셋
    resetWeekToFirstWeekOfMonth();
  }, [currentYear, currentMonth]);

  const loadEmotionData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await emotionService.getMonthlyEmotionRanking(currentYear, currentMonth);
      setEmotionRankingData(data);
    } catch (error) {
      console.error('감정 데이터 로드 실패:', error);
      setError('감정 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 월 변경 핸들러
  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const prevMonth = dayjs().year(currentYear).month(currentMonth - 2);
      setCurrentYear(prevMonth.year());
      setCurrentMonth(prevMonth.month() + 1);
      
      // 해당 월의 첫째 주로 currentWeek 변경
      const firstWeekOfMonth = prevMonth.startOf('month').week();
      setCurrentWeek(firstWeekOfMonth);
    } else {
      const nextMonth = dayjs().year(currentYear).month(currentMonth);
      setCurrentYear(nextMonth.year());
      setCurrentMonth(nextMonth.month() + 1);
      
      // 해당 월의 첫째 주로 currentWeek 변경
      const firstWeekOfMonth = nextMonth.startOf('month').week();
      setCurrentWeek(firstWeekOfMonth);
    }
  };

  // 현재 월이 미래인지 확인
  const isCurrentMonthFuture = dayjs().year(currentYear).month(currentMonth).isAfter(dayjs(), 'month');

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
    return <ErrorMessage message={error} onRetry={loadEmotionData} />;
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

  const handleWeekChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      // 이전 주가 현재 월의 첫 주보다 작아지지 않도록 제한
      const firstWeekOfMonth = dayjs().year(currentYear).month(currentMonth - 1).startOf('month').week();
      if (currentWeek > firstWeekOfMonth) {
        setCurrentWeek(currentWeek - 1);
      }
    } else {
      // 다음 주가 현재 월의 마지막 주보다 커지지 않도록 제한
      const lastWeekOfMonth = dayjs().year(currentYear).month(currentMonth - 1).endOf('month').week();
      if (currentWeek < lastWeekOfMonth) {
        setCurrentWeek(currentWeek + 1);
      }
    }
  };

  // 월 변경 시 주차를 해당 월의 첫째 주로 리셋
  const resetWeekToFirstWeekOfMonth = () => {
    const firstWeekOfMonth = dayjs().year(currentYear).month(currentMonth - 1).startOf('month').week();
    setCurrentWeek(firstWeekOfMonth);
  };

  return emotionRankingData.length > 0 ? (
    <ScrollView 
      style={styles.container}
      onScroll={(event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setScrollOffset(offsetY);
      }}
      scrollEventThrottle={16}  // 60fps로 스크롤 이벤트 제한
    >
      {/* 월 단위 이동 컴포넌트 */}
      <View style={styles.yearMonthContainer}>
        <TouchableOpacity 
          onPress={() => handleMonthChange('prev')}
          style={styles.arrowButton}
        >
          <ArrowLeftIcon width={24} height={24} color={colors.grayScale800} />
        </TouchableOpacity>
        
        <View style={styles.yearMonthTextContainer}>
          <View style={styles.yearAndMonthTextContainer}>
            <Text style={styles.dateNumber}>{currentYear}</Text>
            <Text style={styles.dateText}>년</Text>
          </View>
          <View style={styles.yearAndMonthTextContainer}>
            <Text style={styles.dateNumber}>{currentMonth}</Text>
            <Text style={styles.dateText}>월</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={() => handleMonthChange('next')}
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
      {/* TODO: 폭죽 이펙트 추가 */}

      {/* 월별 감정 순위 컴포넌트 */}
      <View style={styles.emotionRankContainer}>
        <View style={styles.emotionReportTitleAndInfoContainer}>
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Text style={styles.emotionReportTitle}>{currentMonth}</Text>
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
                {podiumEmotions.map((emotion, index) => {
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
                  <View style={[styles.ratioPercentageContainer, {gap: Math.max(7,((windowWidth - 40) - (emotionRankingData.length * 50)) / (emotionRankingData.length - 1))}]}>
                  {emotionRankingData.map((item, index) => {
                    const IconStroke = characterIconMap.stroke[item.emotion];
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
                const startOfWeek = dayjs().year(currentYear).week(currentWeek).startOf('week');
                const endOfWeek = dayjs().year(currentYear).week(currentWeek).endOf('week');
                
                // 월이 바뀌는 경우 현재 월에 해당하는 날짜만 표시
                const startDate = startOfWeek.month() === currentMonth - 1 ? startOfWeek.date() : 1;
                const endDate = endOfWeek.month() === currentMonth - 1 ? endOfWeek.date() : endOfWeek.daysInMonth();
                
                return `${startDate}일 - ${endDate}일 ${currentYear}.${currentMonth.toString().padStart(2, '0')}`;
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
        {/* TODO: 요일별 감정 기록 차트 추가 */}
        <View style={styles.emotionRecordChartContainer}>
          <BarChart currentYear={currentYear} currentMonth={currentMonth} currentWeek={currentWeek} emotionReportData={emotionReportMockData} />
        </View>
      </View>
    </ScrollView>
  ) : (
    <View style={styles.container}>
      {/* 월 단위 이동 컴포넌트 */}
      <View style={styles.yearMonthContainer}>
        <TouchableOpacity 
          onPress={() => handleMonthChange('prev')}
          style={styles.arrowButton}
        >
          <ArrowLeftIcon width={24} height={24} color={colors.grayScale800} />
        </TouchableOpacity>
        
        <View style={styles.yearMonthTextContainer}>
          <View style={styles.yearAndMonthTextContainer}>
            <Text style={styles.dateNumber}>{currentYear}</Text>
            <Text style={styles.dateText}>년</Text>
          </View>
          <View style={styles.yearAndMonthTextContainer}>
            <Text style={styles.dateNumber}>{currentMonth}</Text>
            <Text style={styles.dateText}>월</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={() => handleMonthChange('next')}
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
          onPress={() => {}}
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
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  emotionRestListContainer: {
    gap: 10,
  },
  bar2nd: {
    height: barHeight.second,
    backgroundColor: colors.primary200,
  },
  bar1st: {
    height: barHeight.first,
    backgroundColor: colors.primary300,
  },
  bar3rd: {
    height: barHeight.third,
    backgroundColor: colors.primary50,
  },
  barCommonStyle: {
    width: barWidth,
    borderRadius: radius.r8,
    padding: 16,
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratioPercentage: {
    alignItems: 'center',
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
