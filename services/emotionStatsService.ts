import { EmotionRankingData, MonthlyEmotionStats, EmotionType } from '../types';
import { AppError, createNetworkError } from '../utils/errorHandler';
import { ErrorType } from '../utils/errorHandler';
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
    } catch (error) {
      if (error instanceof AppError) {
        // 권한 없음(ROLE_ANONYMOUS)일 때는 조용히 빈 결과 반환
        if (error.type === ErrorType.PERMISSION) return [];
        throw error;
      }
      throw createNetworkError('월별 감정 통계 조회에 실패했습니다.', error as Error);
    }
  },

  // 요일별 감정 기록 조회 (RecordReport용)
  getDailyEmotionDiaries: async (
    params: GetDailyDiariesParams
  ): Promise<DailyDiaryItem[]> => {
    try {
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
      if (error instanceof AppError) {
        if (error.type === ErrorType.PERMISSION) return [];
        throw error;
      }
      throw createNetworkError('요일별 감정 기록 조회에 실패했습니다.', error as Error);
    }
  },

};
