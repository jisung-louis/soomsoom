import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getUnreadCount, getAnnouncements, UserAnnouncement, FetchAnnouncementsParams } from '../services/mailboxService';

interface MailboxState {
  unreadCount: number;
  isLoading: boolean;
  lastUpdated: Date | null;
  
  // 공지사항 목록
  announcements: UserAnnouncement[];
  announcementsLoading: boolean;
  announcementsLastUpdated: Date | null;
  
  // Actions
  setUnreadCount: (count: number) => void;
  loadUnreadCount: () => Promise<void>;
  clearUnreadCount: () => void;
  
  // 공지사항 Actions
  setAnnouncements: (announcements: UserAnnouncement[]) => void;
  loadAnnouncements: (params?: FetchAnnouncementsParams) => Promise<void>;
  clearAnnouncements: () => void;
}

export const useMailboxStore = create<MailboxState>()(
  devtools(
    (set, get) => ({
      unreadCount: 0,
      isLoading: false,
      lastUpdated: null,
      
      // 공지사항 목록 초기값
      announcements: [],
      announcementsLoading: false,
      announcementsLastUpdated: null,

      setUnreadCount: (count: number) => {
        set({ 
          unreadCount: count,
          lastUpdated: new Date()
        });
        console.log(`📬 안 읽은 메일 개수 업데이트: ${count}개`);
      },

      loadUnreadCount: async () => {
        try {
          set({ isLoading: true });
          const response = await getUnreadCount();
          get().setUnreadCount(response.unreadCount);
        } catch (error) {
          console.error('❌ 안 읽은 메일 개수 조회 실패:', error);
          // 에러 시에도 로딩 상태는 해제
        } finally {
          set({ isLoading: false });
        }
      },

      clearUnreadCount: () => {
        set({ 
          unreadCount: 0,
          lastUpdated: new Date()
        });
        console.log('📬 안 읽은 메일 개수 초기화');
      },

      // 공지사항 Actions
      setAnnouncements: (announcements: UserAnnouncement[]) => {
        set({ 
          announcements,
          announcementsLastUpdated: new Date()
        });
        console.log(`📬 공지사항 목록 업데이트: ${announcements.length}개`);
      },

      loadAnnouncements: async (params: FetchAnnouncementsParams = {}) => {
        try {
          set({ announcementsLoading: true });
          const response = await getAnnouncements(params);
          get().setAnnouncements(response);
          
          // 읽음 상태가 변경되었을 수 있으므로 unread count도 업데이트
          await get().loadUnreadCount();
        } catch (error) {
          console.error('❌ 공지사항 목록 조회 실패:', error);
          // 에러 시에도 로딩 상태는 해제
        } finally {
          set({ announcementsLoading: false });
        }
      },

      clearAnnouncements: () => {
        set({ 
          announcements: [],
          announcementsLastUpdated: new Date()
        });
        console.log('📬 공지사항 목록 초기화');
      },
    }),
    {
      name: 'mailbox-storage',
    }
  )
);
