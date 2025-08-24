import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../../constants/colors';
import { syongsyongTypography, typography } from '../../../constants/typography';
import ArrowLeftIcon from '../../../assets/icons/common/arrow_back.svg';
import ArrowRightIcon from '../../../assets/icons/common/arrow_right.svg';
import { Surface } from '../../common/surface/Surface';
import InfoIcon from '../../../assets/icons/common/info.svg';
import { radius } from '../../../constants/radius';
import { emotionService } from '../../../services/emotionService';
import { EmotionRankingData } from '../../../types/emotion';
import LoadingSpinner from '../../common/loading/LoadingSpinner';
import ErrorMessage from '../../common/error/ErrorMessage';
import dayjs from 'dayjs';
import KingIcon from '../../../assets/icons/record/report/king.svg';

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

  // 페이지 진입 시 및 월 변경 시 데이터 로드
  useEffect(() => {
    loadEmotionData();
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
    } else {
      const nextMonth = dayjs().year(currentYear).month(currentMonth);
      setCurrentYear(nextMonth.year());
      setCurrentMonth(nextMonth.month() + 1);
    }
  };

  // 현재 월이 미래인지 확인
  const isCurrentMonthFuture = dayjs().year(currentYear).month(currentMonth - 1).isAfter(dayjs(), 'month');

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

  return (
    <ScrollView style={styles.container}>
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

      {/* 폭죽 이펙트 컴포넌트 */}
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
            <Text style={styles.emotionReportInfoText}>감정 순위가 궁금한가요?</Text>
          </View>
        </View>

        <View style={styles.emotionRankContentContainer}>
          {emotionRankingData.length > 0 ? (
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
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                {isCurrentMonthFuture ? '아직 기록이 없어요' : '이번 달 기록이 없어요'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Surface/>

      {/* 월별 감정 분포 컴포넌트 */}
      <View style={styles.emotionDistributionContainer}>
        <View style={[styles.emotionReportTitleAndInfoContainer, {gap: 4}]}>
          <Text style={styles.emotionReportTitle}>감정분포</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
            <InfoIcon width={24} height={24} color={colors.grayScale800} />
            <Text style={styles.emotionReportInfoText}>그래프 클릭 시 자세히 확인할 수 있어요!</Text>
          </View>
        </View>
        {/* TODO: 파이 차트 또는 도넛 차트 추가 */}
        <View style={styles.emotionDistributionContentContainer}>
          <Text>파이차트</Text>
          <Text>감정 표</Text>
        </View>
      </View>

      <Surface/>

      {/* 요일별 감정 기록 컴포넌트 */}
      <View style={styles.emotionRecordContainer}>
        <Text style={styles.emotionRecordTitle}>감정 기록</Text>
        {/* TODO: 요일별 감정 기록 차트 추가 */}
      </View>

    </ScrollView>
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
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    ...typography.body2,
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
  emotionRecordContainer: {
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  emotionRecordTitle: {
    ...typography.body2,
    color: colors.grayScale800,
  },
});

export default RecordReportTab;
