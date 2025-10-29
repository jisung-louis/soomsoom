import { apiClient } from './apiClient';
import { AppError, createNetworkError } from '../utils/errorHandler';
// 서버 응답을 그대로 사용합니다.
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

// 서버 응답 타입 정의 (그대로 노출)
export type ServerAchievementProgress = { currentValue: number; targetValue: number; unit?: string } | null;
export type ServerAchievementItem = {
  achievementId: number;
  name: string;
  description?: string;
  phrase?: string | null;
  grade: 'BRONZE' | 'SILVER' | 'GOLD' | 'SPECIAL';
  category: 'DIARY' | 'MEDITATION' | 'BREATHING' | 'HIDDEN';
  isAchieved: boolean;
  achievedAt?: string | null;
  progress: ServerAchievementProgress;
};
export type ServerPagedResponse = {
  content: ServerAchievementItem[];
  page: { size: number; number: number; totalElements: number; totalPages: number };
};

export const fetchMyAchievements = async (
  params: FetchMyAchievementsParams = {}
): Promise<ServerPagedResponse> => {
  try {
    // 디버깅: 토큰 및 role 확인
    const { useAuthStore } = await import('../stores/authStore');
    const { decodeJwt } = await import('../utils/jwt');
    const token = useAuthStore.getState().getAccessToken();
    const role = useAuthStore.getState().role;
    if (token) {
      const payload = decodeJwt(token);
      console.log('🔐 [업적 API] 요청 시 토큰 상태:', {
        hasToken: !!token,
        role: role || payload?.auth,
        userId: payload?.userId || payload?.sub,
        deviceId: payload?.deviceId,
      });
    } else {
      console.warn('⚠️ [업적 API] 요청 시 토큰 없음');
    }

    // apiClient 사용 (Authorization 자동 주입)
    const qp = new URLSearchParams();
    if (params.userId !== undefined) qp.set('userId', String(params.userId));
    qp.set('statusFilter', (params.statusFilter ?? 'ALL'));
    // 백엔드 page는 1-based. 서버에 그대로 전달
    qp.set('page', String(params.page ?? 1));
    qp.set('size', String(params.size ?? 12));
    if (params.sort) qp.set('sort', params.sort);
    if (params.deletionStatus) qp.set('deletionStatus', params.deletionStatus);

    const res = await apiClient.get<ServerPagedResponse>(`/users/me/achievements?${qp.toString()}`);
    console.log('🔍 내 업적 목록 조회 결과:', JSON.stringify(res, null, 2));
    return res;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw createNetworkError('내 업적 목록 조회에 실패했습니다.', error as Error);
  }
};
