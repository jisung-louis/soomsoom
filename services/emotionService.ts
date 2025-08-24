import { EmotionRankingData, MonthlyEmotionStats, EmotionType } from '../types/emotion';
import { characterIconMap, characterTitleMap } from '../utils/iconMap';

// 임시 데이터 (백엔드 연동 전까지 사용)
const mockEmotionData: Record<string, MonthlyEmotionStats> = {
  '2025-6': {
    year: 2025,
    month: 6,
    totalRecords: 30,
    emotionDistribution: {
      angry: 2,
      sad: 2,
      depressed: 4,
      soso: 7,
      good: 5,
      happy: 10,
    },
    ranking: [
      {
        emotion: 'happy',
        count: 10,
        icon: characterIconMap.active.happy,
        title: characterTitleMap.active.happy,
        percentage: 33.3,
      },
      {
        emotion: 'soso',
        count: 7,
        icon: characterIconMap.active.soso,
        title: characterTitleMap.active.soso,
        percentage: 23.3,
      },
      {
        emotion: 'good',
        count: 5,
        icon: characterIconMap.active.good,
        title: characterTitleMap.active.good,
        percentage: 16.7,
      },
      {
        emotion: 'depressed',
        count: 4,
        icon: characterIconMap.active.depressed,
        title: characterTitleMap.active.depressed,
        percentage: 13.3,
      },
      {
        emotion: 'angry',
        count: 2,
        icon: characterIconMap.active.angry,
        title: characterTitleMap.active.angry,
        percentage: 6.7,
      },
      {
        emotion: 'sad',
        count: 2,
        icon: characterIconMap.active.sad,
        title: characterTitleMap.active.sad,
        percentage: 6.7,
      },
    ],
  },
  '2025-5': {
    year: 2025,
    month: 5,
    totalRecords: 28,
    emotionDistribution: {
      angry: 1,
      sad: 3,
      depressed: 2,
      soso: 8,
      good: 6,
      happy: 8,
    },
    ranking: [
      {
        emotion: 'soso',
        count: 8,
        icon: characterIconMap.active.soso,
        title: characterTitleMap.active.soso,
        percentage: 28.6,
      },
      {
        emotion: 'happy',
        count: 8,
        icon: characterIconMap.active.happy,
        title: characterTitleMap.active.happy,
        percentage: 28.6,
      },
      {
        emotion: 'good',
        count: 6,
        icon: characterIconMap.active.good,
        title: characterTitleMap.active.good,
        percentage: 21.4,
      },
      {
        emotion: 'sad',
        count: 3,
        icon: characterIconMap.active.sad,
        title: characterTitleMap.active.sad,
        percentage: 10.7,
      },
      {
        emotion: 'depressed',
        count: 2,
        icon: characterIconMap.active.depressed,
        title: characterTitleMap.active.depressed,
        percentage: 7.1,
      },
      {
        emotion: 'angry',
        count: 1,
        icon: characterIconMap.active.angry,
        title: characterTitleMap.active.angry,
        percentage: 3.6,
      },
    ],
  },
};

export const emotionService = {
  // 월별 감정 통계 조회
  getMonthlyEmotionStats: async (year: number, month: number): Promise<MonthlyEmotionStats> => {
    // TODO: 백엔드 연동 시 실제 API 호출로 변경
    const key = `${year}-${month}`;
    
    // 임시로 지연 시간 추가 (실제 API 호출 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (mockEmotionData[key]) {
      return mockEmotionData[key];
    }
    
    // 데이터가 없는 경우 빈 데이터 반환
    return {
      year,
      month,
      totalRecords: 0,
      emotionDistribution: {
        angry: 0,
        sad: 0,
        depressed: 0,
        soso: 0,
        good: 0,
        happy: 0,
      },
      ranking: [],
    };
  },

  // 월별 감정 순위 조회
  getMonthlyEmotionRanking: async (year: number, month: number): Promise<EmotionRankingData[]> => {
    const stats = await emotionService.getMonthlyEmotionStats(year, month);
    return stats.ranking;
  },

  // 실제 백엔드 연동 시 사용할 함수들
  // getMonthlyEmotionStatsFromAPI: async (year: number, month: number) => {
  //   try {
  //     const response = await api.get(`/emotions/stats/${year}/${month}`);
  //     return response.data;
  //   } catch (error) {
  //     throw new Error('감정 통계 조회 실패');
  //   }
  // },
};
