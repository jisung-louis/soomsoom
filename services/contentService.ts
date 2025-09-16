import { apiClient } from './apiClient';
import { createNetworkError } from '../utils/errorHandler';
// DEV 모킹은 apiClient + mockRoutes에서 일괄 처리합니다.

/* API 응답 타입 정의 (실제 API 명세에 맞춤) */
// 액티비티 저자 타입
export interface ActivityAuthor {
  id: number;
  name: string;
  bio: string;
  profileImageUrl: string | null;
}

// 액티비티 안내자 타입
export interface ActivityNarrator {
  id: number;
  name: string;
  bio: string;
  profileImageUrl: string | null;
}

export type BreathAction = 'START' | 'INHALE' | 'EXHALE' | 'HOLD' | 'END';

// 액티비티 타임라인(only for BREATHING)
export interface ActivityTimeline {
  id: number;
  time: number;
  action: BreathAction;
  text: string;
  duration: number | null;
}

// 액티비티 단 건 조회 응답 타입
export interface Activity {
  id: number;
  title: string;
  type: 'BREATHING' | 'MEDITATION' | 'SLEEP' | 'REST' ;
  thumbnailImageUrl: string | null;
  descriptions: string[];
  author: ActivityAuthor;
  narrator: ActivityNarrator;
  durationInSeconds: number;
  audioUrl: string | null;
  timeline: ActivityTimeline[] | null;
  isFavorited: boolean;
}

// 액티비티 다건 조회 응답 타입
export interface ActivitiesResponse {
  content: Activity[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

// 액티비티 단 건 조회 요청 타입
export interface GetActivityDetailParams {
  deletionStatus?: 'ACTIVE' | 'DELETED' | 'ALL'; // 기본값: ACTIVE
  userId?: number; //(ADMIN용) 특정 사용자가 해당 activity 좋아요 눌렀는지 확인 용도. 없을 시 로그인한 유저 본인
}

// 액티비티 다건 조회 요청 타입
export interface GetActivitiesParams {
  deletionStatus?: 'ACTIVE' | 'DELETED' | 'ALL'; // 조회할 데이터 상태. DELETED, ALL은 관리자(ADMIN) 권한 필요. 기본값: ACTIVE
  page?: number; //페이지 번호 (1부터 시작)
  size?: number; //페이지 당 데이터 수. 기본값 12
  sort?: string; //정렬 기준 (예: createdAt,desc). 기본값 createdAt,desc
  userId?: number; //(ADMIN용) 특정 사용자가 해당 activity 좋아요 눌렀는지 확인 용도. 없을 시 로그인한 유저 본인
}

// 사용자 즐겨찾기 액티비티 목록 조회 요청 타입
export interface GetUserFavoritesParams {
  userId?: number; //(ADMIN용) 특정 사용자의 즐겨찾기를 조회할 때 사용. 없으면 본인 기록 조회.
  page?: number; //페이지 번호 (1부터 시작)
  size?: number; //페이지 당 데이터 수. 기본값 12
  sort?: string; //정렬 기준 (예: createdAt,desc). 기본값 createdAt,desc
}

// 액티비티 즐겨찾기 상태 전환 응답 타입
export interface ActivityFavoriteResponse {
  activityId: number;
  isFavorited: boolean;
}



// 즐겨찾기 액티비티 상세 정보 (백엔드 API 명세에 맞춤)
export type FavoriteActivity = {
  activityId: number;
  type: 'BREATHING' | 'MEDITATION' | 'SLEEP' | 'REST';
  title: string;
  thumbnailImageUrl: string | null;
  durationInSeconds: number;
};

export interface FavoriteActivitiesResponse {
  content: FavoriteActivity[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}



/**
 * 액티비티 다건 조회 (실제 API 명세)
 * GET /activities
 */
export const getActivities = async (
  params?: GetActivitiesParams
): Promise<ActivitiesResponse> => {
  try {
    {
      // 실제 API 호출 (모킹은 apiClient에서 처리)
      const queryParams = new URLSearchParams();
      if (params?.deletionStatus) queryParams.append('deletionStatus', params.deletionStatus);
      if (params?.page !== undefined) queryParams.append('page', String(params.page));
      if (params?.size !== undefined) queryParams.append('size', String(params.size));
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.userId !== undefined) queryParams.append('userId', String(params.userId));

      const query = queryParams.toString();
      const url = query 
        ? `/activities?${query}` 
        : '/activities';

      const response = await apiClient.get<ActivitiesResponse>(url);
      return response;
    }
  } catch (error) {
    throw createNetworkError(
      '액티비티 목록을 불러오는데 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};

/**
 * 액티비티 단건 조회 (실제 API 명세)
 * GET /activities/{activityId}
 */
export const getActivityDetail = async (
  activityId: number,
  params?: GetActivityDetailParams
): Promise<Activity> => {
  try {
    {
      // 실제 API 호출 (모킹은 apiClient에서 처리)
      const queryParams = new URLSearchParams();
      if (params?.deletionStatus) queryParams.append('deletionStatus', params.deletionStatus);
      if (params?.userId !== undefined) queryParams.append('userId', String(params.userId));

      const query = queryParams.toString();
      const url = query 
        ? `/activities/${activityId}?${query}` 
        : `/activities/${activityId}`;

      const response = await apiClient.get<Activity>(url);
      return response;
    }
  } catch (error) {
    throw createNetworkError(
      '액티비티 상세 정보를 불러오는데 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};



/**
 * 타입별 액티비티 조회
 */
export const getActivitiesByType = async (
  type: 'BREATHING' | 'MEDITATION' | 'SLEEP' | 'REST' ,
  params?: Omit<GetActivitiesParams, 'type'>
): Promise<ActivitiesResponse> => {
  // 실제 API에서는 type 필터링이 지원되지 않을 수 있으므로
  // 클라이언트 사이드에서 필터링
  const response = await getActivities(params);
  const filteredActivities = response.content.filter(activity => activity.type === type);
  
  return {
    content: filteredActivities,
    page: {
      ...response.page,
      totalElements: filteredActivities.length,
    },
  };
};

/**
 * 액티비티 즐겨찾기 토글 (실제 API 명세)
 * POST /activities/{activityId}/favorite
 */
export const toggleFavoriteActivity = async (
  activityId: number,
  storeActions: {
    favoriteActivity: (activityId: number) => void;
    unfavoriteActivity: (activityId: number) => void;
    isFavorite: (activityId: number) => boolean;
  }
): Promise<ActivityFavoriteResponse> => {
  try {
    {
      // 실제 API 호출 후 store 업데이트 (모킹은 apiClient에서 처리)
      const response = await apiClient.post<ActivityFavoriteResponse>(`/activities/${activityId}/favorite`);
      
      // API 응답에 따라 store 업데이트
      if (response.isFavorited) {
        storeActions.favoriteActivity(activityId);
      } else {
        storeActions.unfavoriteActivity(activityId);
      }
      
      return response;
    }
  } catch (error) {
    throw createNetworkError(
      '즐겨찾기 상태 변경에 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};

/**
 * 사용자 즐겨찾기 액티비티 목록 조회 (실제 API 명세)
 * GET /users/me/favorites
 */
export const getUserFavoriteActivities = async (
  params?: GetUserFavoritesParams
): Promise<FavoriteActivitiesResponse> => {
  try {
    {
      // 실제 API 호출 (모킹은 apiClient에서 처리)
      const queryParams = new URLSearchParams();
      if (params?.userId !== undefined) queryParams.append('userId', String(params.userId));
      if (params?.page !== undefined) queryParams.append('page', String(params.page));
      if (params?.size !== undefined) queryParams.append('size', String(params.size));
      if (params?.sort) queryParams.append('sort', params.sort);

      const query = queryParams.toString();
      const url = query 
        ? `/users/me/favorites?${query}` 
        : '/users/me/favorites';

      const response = await apiClient.get<FavoriteActivitiesResponse>(url);
      return response;
    }
  } catch (error) {
    throw createNetworkError(
      '즐겨찾기 목록을 불러오는데 실패했습니다.',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};