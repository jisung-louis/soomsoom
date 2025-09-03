import { EmotionRankingData, MonthlyEmotionStats, EmotionType } from '../types';
import { characterIconMap, characterTitleMap } from '../utils/iconMap';
import { apiClient } from './apiClient';
import { API_CONFIG } from '../configs/api';
import { AppError, ErrorType } from '../utils/errorHandler';

/**
 * 감정 기록 서비스 타입 정의
 */
export interface SaveEmotionRecordRequest {
  date: string;
  emotion: string;
  content: string;
  timestamp: string;
}

export interface SaveEmotionRecordResponse {
  success: boolean;
  recordId: string;
  message: string;
}

export interface FirstRecordCheckResponse {
  isFirstRecord: boolean;
  totalRecords: number;
}

export interface UserRecordCountResponse {
  count: number;
  lastRecordDate?: string;
}

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
    // TODO: 백엔드 연동 시 실제 API 호출로 변경 (docs/TODO.md 참조)
    const key = `${year}-${month}`;
    
    // 임시로 지연 시간 추가 (실제 API 호출 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 0));
    
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

  // 감정 기록 저장
  saveEmotionRecord: async (emotionRecordData: SaveEmotionRecordRequest): Promise<SaveEmotionRecordResponse> => {
    try {
      // TODO: 백엔드 연동 시 실제 API 호출로 변경 (docs/TODO.md 참조)
      // const response = await apiClient.post<SaveEmotionRecordResponse>(API_CONFIG.ENDPOINTS.EMOTION_RECORD, emotionRecordData);
      // return response;
      
      // 임시로 로컬 저장 (실제 서비스에서는 제거)
      console.log('[감정 기록 저장]', emotionRecordData);
      await new Promise(resolve => setTimeout(resolve, 500)); // API 호출 시뮬레이션
      
      // 임시 응답 반환
      return {
        success: true,
        recordId: `temp_${Date.now()}`,
        message: '기록이 저장되었습니다.'
      };
      
    } catch (error) {
      console.error('[감정 기록 저장 실패]', error);
      
      // 에러 타입별 처리
      if (error instanceof AppError) {
        throw error;
      }
      
      // 네트워크 에러나 기타 에러
      throw new AppError(
        '감정 기록 저장에 실패했습니다.',
        ErrorType.NETWORK,
        'SAVE_EMOTION_RECORD_FAILED',
        'emotion-service'
      );
    }
  },

  // 첫 기록일 체크 (서버 기준)
  isFirstRecord: async (date: string): Promise<boolean> => {
    try {
      // TODO: 백엔드 연동 시 실제 API 호출로 변경 (docs/TODO.md 참조)
      // const response = await apiClient.get<FirstRecordCheckResponse>(`${API_CONFIG.ENDPOINTS.EMOTION_FIRST_CHECK}/${date}`);
      // return response.isFirstRecord;
      
      // 임시 구현: 사용자의 전체 기록 개수를 확인하여 첫 기록일 판단
      // 실제로는 서버에서 해당 사용자의 기록 개수를 조회해야 함
      const userRecordCount = await emotionService.getUserRecordCount();
      const isFirstRecord = userRecordCount === 0;
      
      console.log(`[첫 기록일 체크] 사용자 기록 개수: ${userRecordCount}, 첫 기록일: ${isFirstRecord}`);
      return isFirstRecord;
      
    } catch (error) {
      console.error('[첫 기록일 체크 실패]', error);
      
      // 에러 타입별 처리
      if (error instanceof AppError) {
        throw error;
      }
      
      // 네트워크 에러나 기타 에러 - 첫 기록일이 아닌 것으로 처리
      throw new AppError(
        '첫 기록일 체크에 실패했습니다.',
        ErrorType.NETWORK,
        'FIRST_RECORD_CHECK_FAILED',
        'emotion-service'
      );
    }
  },

  // 사용자 기록 개수 조회 (임시 구현)
  getUserRecordCount: async (): Promise<number> => {
    try {
      // TODO: 백엔드 연동 시 실제 API 호출로 변경 (docs/TODO.md 참조)
      // const response = await apiClient.get<UserRecordCountResponse>(API_CONFIG.ENDPOINTS.EMOTION_COUNT);
      // return response.count;
      
      // 임시 구현: 로컬 저장소에서 기록 개수 시뮬레이션
      // 실제로는 서버에서 사용자의 전체 기록 개수를 조회해야 함
      const mockRecordCount = Math.floor(Math.random() * 10); // 0~9개 기록
      console.log(`[사용자 기록 개수 조회] 임시 개수: ${mockRecordCount}`);
      return mockRecordCount;
      
    } catch (error) {
      console.error('[사용자 기록 개수 조회 실패]', error);
      
      // 에러 타입별 처리
      if (error instanceof AppError) {
        throw error;
      }
      
      // 네트워크 에러나 기타 에러 - 0개로 처리
      throw new AppError(
        '사용자 기록 개수 조회에 실패했습니다.',
        ErrorType.NETWORK,
        'GET_USER_RECORD_COUNT_FAILED',
        'emotion-service'
      );
    }
  },

  // 실제 백엔드 연동 시 사용할 함수들
  // getMonthlyEmotionStatsFromAPI: async (year: number, month: number) => {
  //   try {
  //     const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.EMOTIONS}/stats/${year}/${month}`);
  //     return response.data;
  //   } catch (error) {
  //     throw new Error('감정 통계 조회 실패');
  //   }
  // },
};
