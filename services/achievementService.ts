import { apiClient } from './apiClient';
import { AppError, createNetworkError } from '../utils/errorHandler';
import { MyAchievement, PagedResponse } from '../types';
// DEV 모킹은 apiClient + mockRoutes에서 일괄 처리합니다.

/**
 * 업적 관련 API 서비스 (사용자 전용)
 * - ADMIN 전용 엔드포인트는 제거되었습니다.
 */

type StatusFilter = 'ALL' | 'ACHIEVED' | 'NOT_ACHIEVED';
type DeletionStatus = 'ACTIVE' | 'DELETED' | 'ALL';

export interface FetchMyAchievementsParams {
  userId?: number; // ADMIN 전용이었으나, 현재 앱에서는 사용 안 함
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
    // apiClient 사용 (Authorization 자동 주입)
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

    return mapped;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw createNetworkError('내 업적 목록 조회에 실패했습니다.', error as Error);
  }
};
