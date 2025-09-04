import { apiClient } from './apiClient';
import { AppError, ErrorType, createNetworkError } from '../utils/errorHandler';

// 타입 정의
export interface Instructor {
  instructorId: number;
  name: string;
  bio: string;
  profileImageUrl: string | null;
  isFollowing: boolean;
  createdAt: string;
  modifiedAt: string;
  deletedAt: string | null;
}

export interface InstructorListResponse {
  content: Instructor[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface GetInstructorsParams {
  deletionStatus?: 'ACTIVE' | 'DELETED' | 'ALL';
  page?: number;
  size?: number;
  sort?: string;
}

export type DeletionStatus = 'ACTIVE' | 'DELETED' | 'ALL';

// 팔로우한 강사 목록 조회 응답 타입
export interface FollowedInstructorSummary {
  instructorId: number;
  name: string;
  profileImageUrl: string | null;
}

export interface FollowedInstructorsResponse {
  content: FollowedInstructorSummary[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface GetFollowedInstructorsParams {
  userId?: number; // ADMIN 전용 (없으면 본인)
  page?: number;
  size?: number;
  sort?: string; // 예: createdAt,desc
}

/**
 * 강사 목록 조회
 */
export const getInstructors = async (params?: GetInstructorsParams): Promise<InstructorListResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.deletionStatus) {
      queryParams.append('deletionStatus', params.deletionStatus);
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.size) {
      queryParams.append('size', params.size.toString());
    }
    if (params?.sort) {
      queryParams.append('sort', params.sort);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/instructors?${queryString}` : '/instructors';
    
    const response = await apiClient.get<InstructorListResponse>(url);
    return response;
  } catch (error) {
    throw createNetworkError(
      '강사 목록을 불러오는데 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};

/**
 * 강사 상세 조회 (단일 강사)
 */
export const getInstructorDetail = async (
  instructorId: number,
  options?: { deletionStatus?: DeletionStatus }
): Promise<Instructor> => {
  try {
    const query = options?.deletionStatus ? `?deletionStatus=${options.deletionStatus}` : '';
    const response = await apiClient.get<Instructor>(`/instructors/${instructorId}${query}`);
    return response;
  } catch (error) {
    throw createNetworkError(
      '강사 정보를 불러오는데 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};

/**
 * 팔로우한 강사 목록 조회 (본인 기준, ADMIN은 userId로 특정 사용자 조회 가능)
 * GET /users/me/following
 */
export const getFollowedInstructors = async (
  params?: GetFollowedInstructorsParams
): Promise<FollowedInstructorsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.userId !== undefined) queryParams.append('userId', String(params.userId));
    if (params?.page !== undefined) queryParams.append('page', String(params.page));
    if (params?.size !== undefined) queryParams.append('size', String(params.size));
    if (params?.sort) queryParams.append('sort', params.sort);

    const query = queryParams.toString();
    const url = query ? `/users/me/following?${query}` : '/users/me/following';

    const response = await apiClient.get<FollowedInstructorsResponse>(url);
    return response;
  } catch (error) {
    throw createNetworkError(
      '팔로우한 강사 목록을 불러오는데 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};
