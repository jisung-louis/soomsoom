import { apiClient } from './apiClient';
import { AppError, createNetworkError } from '../utils/errorHandler';
import { MyAchievement, PagedResponse, Achievement } from '../types';
import { 
  getDynamicMockAchievementData,
  mockAchievementDefinitions
} from '../data/achievementMockData';

/**
 * 업적 관련 API 서비스
 * 
 * 🎯 왜 이렇게 하나요?
 * - API 로직을 한 곳에서 관리
 * - 스토어는 상태 관리만 담당
 * - 다른 컴포넌트에서도 재사용 가능
 * - 테스트하기 쉬움
 */

/**
 * 업적 정의 조회 (관리자 API)
 * - 앱 시작 시 업적 정의 로드
 * - rewardPoints, rewardItemId, conditions 포함
 */
type AdminDeletionStatus = 'ACTIVE' | 'DELETED' | 'ALL';

export interface FetchAchievementsParams {
  deletionStatus?: AdminDeletionStatus; // 기본 ACTIVE
  page?: number; // 1-based (백엔드 기준). 기본 1
  size?: number; // 기본 12
  sort?: string; // 예: createdAt,desc (선택)
}

export const fetchAchievements = async (
  params: FetchAchievementsParams = {}
): Promise<PagedResponse<Achievement>> => {
  try {
    // if (__DEV__) {
    //   console.log('🔧 개발 모드: Mock 업적 정의 데이터 사용');
    //   await new Promise(resolve => setTimeout(resolve, 300));

    //   const mockResponse: PagedResponse<Achievement> = {
    //     content: mockAchievementDefinitions,
    //     totalElements: mockAchievementDefinitions.length,
    //     totalPages: 1,
    //     size: params.size ?? 12,
    //     number: (params.page ?? 1) - 1,
    //     first: true,
    //     last: true,
    //     empty: false
    //   };

    //   console.log('✅ Mock 업적 정의 데이터 로드 완료!', {
    //     totalElements: mockResponse.totalElements
    //   });
    //   return mockResponse;
    // } 
      // 프로덕션: apiClient 사용, 서버의 page 객체를 PagedResponse로 매핑
      const qp = new URLSearchParams();
      qp.set('deletionStatus', (params.deletionStatus ?? 'ACTIVE'));
      qp.set('page', String(params.page ?? 1)); // 서버는 1-based
      qp.set('size', String(params.size ?? 12));
      if (params.sort) qp.set('sort', params.sort);

      type ServerResponse = {
        content: Achievement[];
        page: { size: number; number: number; totalElements: number; totalPages: number };
      };

      const res = await apiClient.get<ServerResponse>(`/achievements?${qp.toString()}`);

      const mapped: PagedResponse<Achievement> = {
        content: res.content,
        totalElements: res.page.totalElements,
        totalPages: res.page.totalPages,
        size: res.page.size,
        number: Math.max(0, (res.page.number ?? 1) - 1),
        first: (res.page.number ?? 1) <= 1,
        last: (res.page.number ?? 1) >= res.page.totalPages,
        empty: res.page.totalElements === 0,
      };

      return mapped;
  } catch (error) {
    console.error('❌ 업적 정의 조회 실패:', error);
    throw createNetworkError('업적 정의를 불러오는데 실패했습니다.');
  }
};

/**
 * 업적 상세 조회 (관리자 API)
 * - 특정 업적의 상세 정보 조회
 * - rewardPoints, rewardItemId, conditions 포함
 */
export const fetchAchievementDetail = async (
  achievementId: number
): Promise<Achievement> => {
  try {
    if (__DEV__) {
      console.log('🔧 개발 모드: Mock 업적 상세 데이터 사용');
      await new Promise(resolve => setTimeout(resolve, 200));

      const achievement = mockAchievementDefinitions.find(a => a.id === achievementId);
      if (!achievement) {
        throw new Error(`업적을 찾을 수 없습니다: ${achievementId}`);
      }

      console.log('✅ Mock 업적 상세 데이터 로드 완료!', { achievementId });
      return achievement;
    } else {
      // ADMIN 전용 API, Authorization은 apiClient가 자동 처리
      const res = await apiClient.get<Achievement>(`/achievements/${achievementId}`);
      return res;
    }
  } catch (error) {
    console.error('❌ 업적 상세 조회 실패:', error);
    throw createNetworkError('업적 상세 정보를 불러오는데 실패했습니다.');
  }
};

/**
 * 내 업적 조회 (사용자 API)
 * - 팝업 시스템에서 사용
 * - MyAchievementScreen에서 사용
 * - 동적 Mock 데이터 사용 (개발 환경)
 */
type StatusFilter = 'ALL' | 'ACHIEVED' | 'NOT_ACHIEVED';
type DeletionStatus = 'ACTIVE' | 'DELETED' | 'ALL';

export interface FetchMyAchievementsParams {
  userId?: number; // ADMIN 전용
  statusFilter?: StatusFilter; // 기본 ALL
  page?: number; // 1-based (백엔드 기준). 기본 1
  size?: number; // 기본 12
  sort?: string; // 예: createdAt,desc
  deletionStatus?: DeletionStatus; // 기본 ACTIVE (ADMIN만 DELETED/ALL 가능)
}

export const fetchMyAchievements = async (
  params: FetchMyAchievementsParams = {}
): Promise<PagedResponse<MyAchievement>> => {
  try {
    if (__DEV__) {
      // 개발 환경에서는 mock 데이터 사용
      console.log('🔧 개발 모드: Mock 내 업적 데이터 사용');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // mock 데이터를 PagedResponse 형식으로 변환
      // 동적 Mock 데이터 사용
      const dynamicMockData = getDynamicMockAchievementData();
      const mockResponse: PagedResponse<MyAchievement> = {
        content: dynamicMockData.content.map(achievement => ({
          achievementId: achievement.achievementId,
          name: achievement.name,
          description: achievement.description,
          phrase: achievement.phrase,
          grade: achievement.grade as 'BRONZE' | 'SILVER' | 'GOLD' | 'SPECIAL',
          category: achievement.category as 'DIARY' | 'MEDITATION' | 'BREATHING' | 'HIDDEN',
          isAchieved: achievement.isAchieved,
          achievedAt: achievement.achievedAt,
          progress: achievement.progress
        })),
        totalElements: dynamicMockData.totalElements,
        totalPages: dynamicMockData.totalPages,
        size: dynamicMockData.size,
        number: dynamicMockData.number,
        first: dynamicMockData.first,
        last: dynamicMockData.last,
        empty: dynamicMockData.empty
      };
      
      console.log('✅ Mock 내 업적 데이터 로드 완료!', { 
        totalElements: mockResponse.totalElements,
        achievedCount: mockResponse.content.filter(a => a.isAchieved).length 
      });
      return mockResponse;
    } else {
      // 프로덕션에서는 apiClient 사용 (Authorization 자동 주입)
      console.log('🌐 내 업적 목록 조회 중...');

      const qp = new URLSearchParams();
      if (params.userId !== undefined) qp.set('userId', String(params.userId));
      qp.set('statusFilter', (params.statusFilter ?? 'ALL'));
      // 백엔드 page는 1-based. 서버에 그대로 전달
      qp.set('page', String(params.page ?? 1));
      qp.set('size', String(params.size ?? 12));
      if (params.sort) qp.set('sort', params.sort);
      if (params.deletionStatus) qp.set('deletionStatus', params.deletionStatus);

      type ServerProgress = { currentValue: number; targetValue: number } | null;
      type ServerItem = Omit<MyAchievement, 'progress'> & { progress: ServerProgress };
      type ServerResponse = {
        content: ServerItem[];
        page: { size: number; number: number; totalElements: number; totalPages: number };
      };

      const res = await apiClient.get<ServerResponse>(`/users/me/achievements?${qp.toString()}`);

      // 서버 응답 → 클라이언트 표준 타입으로 매핑
      const mapped: PagedResponse<MyAchievement> = {
        content: res.content.map((a) => ({
          achievementId: a.achievementId,
          name: a.name,
          description: a.description,
          phrase: a.phrase,
          grade: a.grade,
          category: a.category,
          isAchieved: a.isAchieved,
          achievedAt: a.achievedAt,
          progress: a.progress
            ? { current: a.progress.currentValue, target: a.progress.targetValue }
            : null,
        })),
        totalElements: res.page.totalElements,
        totalPages: res.page.totalPages,
        size: res.page.size,
        // 내부적으로는 0-based를 사용해왔으므로 호환성 위해 1→0 보정
        number: Math.max(0, (res.page.number ?? 1) - 1),
        first: (res.page.number ?? 1) <= 1,
        last: (res.page.number ?? 1) >= res.page.totalPages,
        empty: res.page.totalElements === 0,
      };

      console.log('✅ 내 업적 목록 조회 완료!', {
        totalElements: mapped.totalElements,
        achievedCount: mapped.content.filter(a => a.isAchieved).length,
      });
      return mapped;
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw createNetworkError('내 업적 목록 조회에 실패했습니다.', error as Error);
  }
};


// 불필요한 함수들 제거됨 - 현재는 팝업 시스템만 사용
