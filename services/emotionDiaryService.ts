import { apiClient } from './apiClient';
import { AppError, createNetworkError } from '../utils/errorHandler';
import { EmotionType } from '../types';
import { BackendEmotion, toBackendEmotion, toFrontendEmotion } from '../utils/emotionMap';
import { getMockDiaryData } from '../data/emotionReportMockData';
import { useAchievementStore } from '../stores/achievementStore';
import { useTodayMissionStore } from '../stores/todayMissionStore';

// Request/Response 타입
export interface CreateEmotionDiaryRequest {
  emotion: EmotionType; // 프론트 기준 감정 키
  memo?: string;
  date: string; // yyyy-MM-dd
}

interface BackendCreateDiaryRequest {
  emotion: BackendEmotion;
  memo?: string;
  date: string; // yyyy-MM-dd
}

export interface EmotionDiary {
  diaryId: number;
  userId: number;
  emotion: EmotionType; // 프론트 기준으로 변환
  memo: string | null;
  recordDate: string; // yyyy-MM-dd
  createdAt: string;
  modifiedAt: string;
  deletedAt: string | null;
}

interface BackendDiaryResponse {
  diaryId: number;
  userId: number;
  emotion: BackendEmotion;
  memo: string | null;
  recordDate: string;
  createdAt: string;
  modifiedAt: string;
  deletedAt: string | null;
}

export interface DiaryListPageMeta {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface EmotionDiaryListResponse {
  content: EmotionDiary[];
  page: DiaryListPageMeta;
}

interface BackendDiaryListResponse {
  content: BackendDiaryResponse[];
  page: DiaryListPageMeta;
}

export interface GetEmotionDiariesParams {
  from: string; // yyyy-MM-dd
  to: string;   // yyyy-MM-dd
  userId?: number; // ADMIN 전용
  deletionStatus?: 'ACTIVE' | 'DELETED' | 'ALL';
  page?: number; // 1-base
  size?: number;
  sort?: string; // e.g., recordDate,desc
}


// 감정일기 수정
export interface UpdateEmotionDiaryRequest {
  emotion: EmotionType; // 프론트 기준
  memo?: string;
}

interface BackendUpdateEmotionDiaryRequest {
  emotion: BackendEmotion;
  memo?: string;
}

export const emotionDiaryService = {
  // 감정일기 등록
  createEmotionDiary: async (req: CreateEmotionDiaryRequest): Promise<EmotionDiary> => {
    try {
      {
        const body: BackendCreateDiaryRequest = {
          emotion: toBackendEmotion(req.emotion),
          memo: req.memo,
          date: req.date,
        };

        const res = await apiClient.post<BackendDiaryResponse>('/diaries', body);

        const result = {
          diaryId: res.diaryId,
          userId: res.userId,
          emotion: toFrontendEmotion(res.emotion),
          memo: res.memo,
          recordDate: res.recordDate,
          createdAt: res.createdAt,
          modifiedAt: res.modifiedAt,
          deletedAt: res.deletedAt,
        } as EmotionDiary;

        // 감정일기 등록 성공 후 업적 체크
        useAchievementStore.getState().scheduleCheck(400);
        console.log('📝 감정일기 등록 성공, 업적 체크 스케줄링');

        // 오늘 미션 상태 갱신 (NEED_DIARY → NEED_ACTIVITY/ALL_DONE 등)
        try {
          await useTodayMissionStore.getState().refresh();
        } catch {}

        return result;
      }
    } catch (error) {
      // 네트워크/기타 에러
      if (error instanceof AppError) {
        throw error;
      }
      throw createNetworkError('감정일기 등록에 실패했습니다.', error as Error);
    }
  },

  // 감정일기 단건 조회
  getEmotionDiaryById: async (
    diaryId: number,
    options?: { deletionStatus?: 'ACTIVE' | 'DELETED' | 'ALL' }
  ): Promise<EmotionDiary> => {
    try {
      const query = options?.deletionStatus ? `?deletionStatus=${options.deletionStatus}` : '';
      const res = await apiClient.get<BackendDiaryResponse>(`/diaries/${diaryId}${query}`);
      return {
        diaryId: res.diaryId,
        userId: res.userId,
        emotion: toFrontendEmotion(res.emotion),
        memo: res.memo,
        recordDate: res.recordDate,
        createdAt: res.createdAt,
        modifiedAt: res.modifiedAt,
        deletedAt: res.deletedAt,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw createNetworkError('감정일기 조회에 실패했습니다.', error as Error);
    }
  },

  // 감정일기 다건 조회 (페이징)
  getEmotionDiaries: async (
    params: GetEmotionDiariesParams
  ): Promise<EmotionDiaryListResponse> => {
    try {
      {
        // 프로덕션에서는 실제 API 호출
        const qs = new URLSearchParams();
        qs.append('from', params.from);
        qs.append('to', params.to);
        if (params.userId !== undefined) qs.append('userId', String(params.userId));
        if (params.deletionStatus) qs.append('deletionStatus', params.deletionStatus);
        if (params.page !== undefined) qs.append('page', String(params.page));
        if (params.size !== undefined) qs.append('size', String(params.size));
        if (params.sort) qs.append('sort', params.sort);

        const res = await apiClient.get<BackendDiaryListResponse>(`/diaries?${qs.toString()}`);
        return {
          content: res.content.map(d => ({
            diaryId: d.diaryId,
            userId: d.userId,
            emotion: toFrontendEmotion(d.emotion),
            memo: d.memo,
            recordDate: d.recordDate,
            createdAt: d.createdAt,
            modifiedAt: d.modifiedAt,
            deletedAt: d.deletedAt,
          })),
          page: res.page,
        };
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw createNetworkError('감정일기 목록 조회에 실패했습니다.', error as Error);
    }
  },


  // 감정일기 수정
  updateEmotionDiary: async (
    diaryId: number,
    req: UpdateEmotionDiaryRequest
  ): Promise<EmotionDiary> => {
    try {
      const body: BackendUpdateEmotionDiaryRequest = {
        emotion: toBackendEmotion(req.emotion),
        memo: req.memo,
      };
      const res = await apiClient.put<BackendDiaryResponse>(`/diaries/${diaryId}`, body);
      return {
        diaryId: res.diaryId,
        userId: res.userId,
        emotion: toFrontendEmotion(res.emotion),
        memo: res.memo,
        recordDate: res.recordDate,
        createdAt: res.createdAt,
        modifiedAt: res.modifiedAt,
        deletedAt: res.deletedAt,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw createNetworkError('감정일기 수정에 실패했습니다.', error as Error);
    }
  },

  // 감정일기 삭제
  deleteEmotionDiary: async (diaryId: number): Promise<void> => {
    try {
      await apiClient.delete<void>(`/diaries/${diaryId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw createNetworkError('감정일기 삭제에 실패했습니다.', error as Error);
    }
  },
};


