import { EmotionRankingData, MonthlyEmotionStats, EmotionType } from '../types';
import { characterIconMap, characterTitleMap } from '../utils/iconMap';
import { AppError, ErrorType, createNetworkError } from '../utils/errorHandler';
import { apiClient } from './apiClient';
import { BackendEmotion, toFrontendEmotion } from '../utils/emotionMap';
import dayjs from 'dayjs';

/**
 * 감정 통계 서비스
 * RecordReport 관련 통계 데이터를 담당
 */

// RecordReport 관련 타입들
export interface MonthlyStatsItem {
  emotion: EmotionType;
  count: number;
  percentage: number;
}

export interface DailyDiaryItem {
  diaryId: number;
  emotion: EmotionType;
  recordDate: string;
}

export interface GetMonthlyStatsParams {
  year: number;
  month: number;
  userId?: number;
  deletionStatus?: 'ACTIVE' | 'DELETED' | 'ALL';
}

export interface GetDailyDiariesParams {
  from: string; // yyyy-MM-dd
  to: string;   // yyyy-MM-dd
  userId?: number;
  deletionStatus?: 'ACTIVE' | 'DELETED' | 'ALL';
}

// 백엔드 응답 타입들
interface BackendMonthlyStatsItem {
  emotion: BackendEmotion;
  count: number;
  percentage: number;
}

interface BackendMonthlyStatsResponse {
  stats: BackendMonthlyStatsItem[];
}

interface BackendDailyDiaryItem {
  diaryId: number;
  emotion: BackendEmotion;
  recordDate: string;
}

export const emotionStatsService = {
  // 월별 감정 통계 조회 (RecordReport용)
  getMonthlyEmotionStats: async (
    params: GetMonthlyStatsParams
  ): Promise<MonthlyStatsItem[]> => {
    try {
      if (__DEV__) {
        // 개발 환경에서는 mock 일기 데이터에서 통계 계산
        const { getMockDiaryDataForAPI } = await import('../data/emotionReportMockData');
        
        // 해당 월의 시작일과 종료일 계산
        const startDate = dayjs().year(params.year).month(params.month - 1).startOf('month');
        const endDate = dayjs().year(params.year).month(params.month - 1).endOf('month');
        
        // 해당 월의 일기 데이터 가져오기
        const monthDiaries = getMockDiaryDataForAPI(
          startDate.format('YYYY-MM-DD'),
          endDate.format('YYYY-MM-DD')
        );
        
        // 감정별 카운트 계산
        const emotionCounts = monthDiaries.reduce((acc, diary) => {
          acc[diary.emotion] = (acc[diary.emotion] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const totalRecords = monthDiaries.length;
        
        // MonthlyStatsItem[] 형식으로 변환
        return Object.entries(emotionCounts)
          .map(([emotion, count]) => ({
            emotion: emotion as EmotionType,
            count,
            percentage: totalRecords > 0 ? Math.round((count / totalRecords) * 100 * 10) / 10 : 0,
          }))
          .sort((a, b) => b.count - a.count);
      } else {
        // 프로덕션에서는 실제 API 호출
        const qs = new URLSearchParams();
        qs.append('year', String(params.year));
        qs.append('month', String(params.month));
        if (params.userId !== undefined) qs.append('userId', String(params.userId));
        if (params.deletionStatus) qs.append('deletionStatus', params.deletionStatus);

        const res = await apiClient.get<BackendMonthlyStatsResponse>(`/diaries/stats?${qs.toString()}`);
        return res.stats.map(s => ({
          emotion: toFrontendEmotion(s.emotion),
          count: s.count,
          percentage: s.percentage,
        }));
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw createNetworkError('월별 감정 통계 조회에 실패했습니다.', error as Error);
    }
  },


  // 요일별 감정 기록 조회 (RecordReport용)
  getDailyEmotionDiaries: async (
    params: GetDailyDiariesParams
  ): Promise<DailyDiaryItem[]> => {
    try {
      if (__DEV__) {
        // 개발 환경에서는 mock 데이터 사용
        const { getMockDiaryDataForAPI } = await import('../data/emotionReportMockData');
        const mockData = getMockDiaryDataForAPI(params.from, params.to);
        return mockData.map(item => ({
          diaryId: item.diaryId,
          emotion: item.emotion,
          recordDate: item.recordDate,
        }));
      }

      const qs = new URLSearchParams();
      qs.append('from', params.from);
      qs.append('to', params.to);
      if (params.userId !== undefined) qs.append('userId', String(params.userId));
      if (params.deletionStatus) qs.append('deletionStatus', params.deletionStatus);

      const res = await apiClient.get<BackendDailyDiaryItem[]>(`/diaries/daily?${qs.toString()}`);
      return res.map(item => ({
        diaryId: item.diaryId,
        emotion: toFrontendEmotion(item.emotion),
        recordDate: item.recordDate,
      }));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw createNetworkError('요일별 감정 기록 조회에 실패했습니다.', error as Error);
    }
  },

};
