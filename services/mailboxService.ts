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
    
    const response = await apiClient.get<UserAnnouncement[]>(endpoint);
    return response;
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
