import { apiClient } from './apiClient';
import { createNetworkError } from '../utils/errorHandler';
// DEV 모킹은 apiClient + mockRoutes에서 일괄 처리합니다.

// 타입 정의 (실제 API 명세에 맞춤)
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

// 팔로우한 강사 목록 조회 응답 타입 (API 응답용)
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

// 강사 대표 강의 관련 타입
export interface InstructorActivity {
  activityId: number;
  title: string;
  type: 'BREATHING' | 'MEDITATION' | 'SLEEP' | 'REST'; // 실제 타입에 맞게 조정
  thumbnailImageUrl: string | null;
  durationInSeconds: number;
  isFavorited: boolean;
}

export interface InstructorActivitiesResponse {
  content: InstructorActivity[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface GetInstructorActivitiesParams {
  userId?: number; // ADMIN 전용 (없으면 본인)
  page?: number;
  size?: number;
  sort?: string; // 예: createdAt,desc
}

// 강사 팔로우 관련 타입
export interface FollowInstructorResponse {
  followeeId: number;
  isFollowing: boolean;
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
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.size !== undefined) {
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
    // 실제 API 호출 (모킹은 apiClient에서 처리)
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
    // 실제 API 호출 (모킹은 apiClient에서 처리)
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

/**
 * 강사 대표 강의 조회
 * GET /instructors/{instructorId}/activities
 */
export const getInstructorActivities = async (
  instructorId: number,
  params?: GetInstructorActivitiesParams
): Promise<InstructorActivitiesResponse> => {
  try {
    // 실제 API 호출 (모킹은 apiClient에서 처리)
    const queryParams = new URLSearchParams();
    if (params?.userId !== undefined) queryParams.append('userId', String(params.userId));
    if (params?.page !== undefined) queryParams.append('page', String(params.page));
    if (params?.size !== undefined) queryParams.append('size', String(params.size));
    if (params?.sort) queryParams.append('sort', params.sort);

    const query = queryParams.toString();
    const url = query 
      ? `/instructors/${instructorId}/activities?${query}` 
      : `/instructors/${instructorId}/activities`;

    const response = await apiClient.get<InstructorActivitiesResponse>(url);
    return response;
  } catch (error) {
    throw createNetworkError(
      '강사 대표 강의를 불러오는데 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};

/**
 * 강사 팔로우 상태 전환 (추가 또는 제거)
 * POST /instructors/{instructorId}/follow
 * 서비스 레이어에서 API 호출과 store 동기화를 모두 처리
 **/
export const toggleFollowInstructor = async (
  instructorId: number,
  storeActions: {
    followInstructor: (instructorId: number) => void;
    unfollowInstructor: (instructorId: number) => void;
    isFollowingInstructor: (instructorId: number) => boolean;
  }
): Promise<FollowInstructorResponse> => {
  try {
    // 실제 API 호출 후 Store 동기화 (모킹은 apiClient에서 처리)
    const response = await apiClient.post<FollowInstructorResponse>(
      `/instructors/${instructorId}/follow`
    );
    const wasFollowing = storeActions.isFollowingInstructor(instructorId);
    if (wasFollowing !== response.isFollowing) {
      if (response.isFollowing) {
        storeActions.followInstructor(instructorId);
      } else {
        storeActions.unfollowInstructor(instructorId);
      }
    }
    return response;
  } catch (error) {
    throw createNetworkError(
      '강사 팔로우 상태 변경에 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};
