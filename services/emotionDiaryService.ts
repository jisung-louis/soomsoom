import { apiClient } from './apiClient';
import { AppError, createNetworkError, ErrorType } from '../utils/errorHandler';
import { EmotionType } from '../types';
import { BackendEmotion, toBackendEmotion, toFrontendEmotion } from '../utils/emotionMap';
import { getMockDiaryData } from '../data/emotionReportMockData';

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
      const body: BackendCreateDiaryRequest = {
        emotion: toBackendEmotion(req.emotion),
        memo: req.memo,
        date: req.date,
      };

      const res = await apiClient.post<BackendDiaryResponse>('/diaries', body);

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
      if (__DEV__) {
        // 개발 환경에서는 mock 데이터 사용
        const mockDiaries = getMockDiaryData(params.from, params.to);
        return {
          content: mockDiaries.map(d => ({
            diaryId: Math.floor(Math.random() * 1000), // 임시 ID
            userId: 1, // 임시 사용자 ID
            emotion: d.character as EmotionType,
            memo: d.content || null,
            recordDate: d.date,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            deletedAt: null,
          })),
          page: {
            size: params.size || 20,
            number: params.page || 1,
            totalElements: mockDiaries.length,
            totalPages: Math.ceil(mockDiaries.length / (params.size || 20)),
          },
        };
      } else {
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

  // 첫 기록일 체크 (서버 기준)
  isFirstRecord: async (date: string): Promise<boolean> => {
    try {
      // getEmotionDiaries API를 사용하여 사용자의 전체 기록 개수 조회
      // from을 과거 날짜로, to를 현재 날짜로 설정하여 전체 기록 조회
      const pastDate = '2020-01-01'; // 충분히 과거 날짜
      const currentDate = new Date().toISOString().split('T')[0]; // 오늘 날짜
      
      const response = await emotionDiaryService.getEmotionDiaries({
        from: pastDate,
        to: currentDate,
        deletionStatus: 'ACTIVE',
        page: 1,
        size: 1, // 개수만 확인하면 되므로 최소 크기
      });
      
      const totalRecords = response.page.totalElements;
      const isFirstRecord = totalRecords === 0;
      
      console.log(`[첫 기록일 체크] 사용자 기록 개수: ${totalRecords}, 첫 기록일: ${isFirstRecord}`);
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
        'emotion-diary-service'
      );
    }
  },
};


