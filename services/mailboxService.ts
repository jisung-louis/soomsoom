import { apiClient } from './apiClient';
import { AppError, createNetworkError } from '../utils/errorHandler';

/**
 * 우편함 관련 API 서비스
 */

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface UserAnnouncement {
  userAnnouncementId: number;
  announcementId: number;
  title: string;
  receivedAt: string;
  isRead: boolean;
}

export interface AnnouncementDetail {
  id: number;
  title: string;
  content: string;
  sentAt: string;
  createdAt: string;
  modifiedAt: string;
}

export interface FetchAnnouncementsParams {
  page?: number;
  size?: number;
  sort?: string[];
}

/**
 * 안 읽은 메일 개수 조회
 * GET /mailbox/announcements/unread-count
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  try {
    const response = await apiClient.get<UnreadCountResponse>('/mailbox/announcements/unread-count');
    return response;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw createNetworkError('안 읽은 메일 개수 조회에 실패했습니다.', error as Error);
  }
};

/**
 * 우편함 공지사항 목록 조회
 * GET /mailbox/announcements
 */
export const getAnnouncements = async (params: FetchAnnouncementsParams = {}): Promise<UserAnnouncement[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.size !== undefined) {
      queryParams.append('size', params.size.toString());
    }
    if (params.sort && params.sort.length > 0) {
      params.sort.forEach(sortItem => {
        queryParams.append('sort', sortItem);
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/mailbox/announcements?${queryString}` : '/mailbox/announcements';
    
    const response = await apiClient.get<any>(endpoint);
    // 서버가 배열 또는 페이지네이션 객체({ content: [...] })를 반환할 수 있으므로 방어적으로 처리
    if (Array.isArray(response)) {
      return response as UserAnnouncement[];
    }
    if (response && Array.isArray(response.content)) {
      return response.content as UserAnnouncement[];
    }
    // 예외 케이스: 비정상 응답이면 빈 배열 반환(상층에서 빈 UI 처리)
    console.warn('📬 우편함 공지사항 예상치 못한 응답 형식, 빈 배열로 대체:', typeof response);
    return [] as UserAnnouncement[];
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw createNetworkError('우편함 공지사항 목록 조회에 실패했습니다.', error as Error);
  }
};

/**
 * 우편함 공지사항 상세 조회 및 읽음 처리
 * POST /mailbox/announcements/{userAnnouncementId}
 */
export const getAnnouncementDetail = async (userAnnouncementId: number): Promise<AnnouncementDetail> => {
  try {
    const response = await apiClient.post<AnnouncementDetail>(`/mailbox/announcements/${userAnnouncementId}`);
    return response;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw createNetworkError('우편함 공지사항 상세 조회에 실패했습니다.', error as Error);
  }
};
