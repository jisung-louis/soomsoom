// 간단한 목 라우트 정의: method+match → handler

export type MockHandlerContext = {
  url: string;
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
};

export type MockRoute = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  match: (endpoint: string) => boolean;
  handler: (ctx: MockHandlerContext) => any | Promise<any>;
};
// 데이터 소스
import { serverItemList } from '../data/roomItemData';
import { bannerMockData } from '../data/bannerMockData';
import { mockCollectionData } from '../data/mockCollectionData';
import { mockContentData } from '../data/playContentData';
import type { PurchasedItem, ItemType, EquipSlot } from '../services/purchaseService';
import { mockInstructorsData } from '../data/playContentData';
import { usePlayStore } from '../stores/playStore';
import { toBackendEmotion } from '../utils/emotionMap';

// 간단 쿼리 파서
function parseQuery(endpoint: string): Record<string, string> {
  const i = endpoint.indexOf('?');
  if (i === -1) return {};
  return Object.fromEntries(new URLSearchParams(endpoint.slice(i + 1)) as any);
}

export const mockRoutes: MockRoute[] = [
  
  // 배너 목록
  // GET /banners
  {
    method: 'GET',
    match: (e) => e === '/banners',
    handler: () => bannerMockData,
  },

  // 오늘 미션 상태
  // GET /users/me/today-missions
  {
    method: 'GET',
    match: (e) => e === '/users/me/today-missions',
    handler: async () => {
      const { useTodayMissionStore } = await import('../stores/todayMissionStore');
      const store = useTodayMissionStore.getState();
      // 캐시에 값이 있으면 그대로 반환, 없으면 기본값 NEED_DIARY로 초기화
      const status = (store.status ?? 'NEED_DIARY') as 'NEED_DIARY' | 'NEED_ACTIVITY' | 'ALL_DONE';
      try {
        store.setFromServer({ status });
      } catch {}
      return { status };
    },
  },

  // 강사 목록
  // GET /instructors
  {
    method: 'GET',
    match: (e) => e.startsWith('/instructors') && !/^\/instructors\/(\d+)/.test(e.split('?')[0]),
    handler: ({ endpoint }) => {
      const q = parseQuery(endpoint);
      const page = Number(q.page ?? 1);
      const size = Number(q.size ?? 12);
      const start = (page - 1) * size;
      const end = start + size;
      const content = (mockInstructorsData as any[]).slice(start, end).map((inst: any) => ({
        instructorId: inst.instructorId,
        name: inst.name,
        bio: inst.bio,
        profileImageUrl: inst.profileImageUrl,
        isFollowing: false,
        createdAt: inst.createdAt,
        modifiedAt: inst.modifiedAt,
        deletedAt: inst.deletedAt,
      }));
      return {
        content,
        page: { size, number: page, totalElements: (mockInstructorsData as any[]).length, totalPages: Math.max(1, Math.ceil((mockInstructorsData as any[]).length / size)) },
      };
    },
  },

  // 강사 상세
  // GET /instructors/{id}
  {
    method: 'GET',
    match: (e) => /^\/instructors\/(\d+)$/.test(e.split('?')[0]),
    handler: ({ endpoint }) => {
      const path = endpoint.split('?')[0];
      const id = Number(path.split('/')[2]);
      const mock = (mockInstructorsData as any[]).find((i: any) => i.instructorId === id);
      if (!mock) throw new Error('Instructor not found');
      return {
        instructorId: mock.instructorId,
        name: mock.name,
        bio: mock.bio,
        profileImageUrl: mock.profileImageUrl,
        isFollowing: false,
        createdAt: mock.createdAt,
        modifiedAt: mock.modifiedAt,
        deletedAt: mock.deletedAt,
      };
    },
  },

  // 강사 대표 강의 목록
  // GET /instructors/{instructorId}/activities
  {
    method: 'GET',
    match: (e) => /^\/instructors\/(\d+)\/activities/.test(e.split('?')[0]),
    handler: ({ endpoint }) => {
      const path = endpoint.split('?')[0];
      const id = Number(path.split('/')[2]);
      const q = parseQuery(endpoint);
      const page = Number(q.page ?? 1);
      const size = Number(q.size ?? 10);
      // mockContentData에서 author.id가 instructorId인 항목 필터
      const all = (mockContentData as any[]).filter((c: any) => c.author?.id === id);
      const start = (page - 1) * size;
      const end = start + size;
      const sel = all.slice(start, end);
      const content = sel.map((c: any) => ({
        activityId: c.id,
        title: c.title,
        type: c.type,
        thumbnailImageUrl: c.thumbnailImageUrl ?? null,
        durationInSeconds: c.durationInSeconds ?? 0,
        isFavorited: false,
      }));
      return {
        content,
        page: { size, number: page, totalElements: all.length, totalPages: Math.max(1, Math.ceil(all.length / size)) },
      };
    },
  },

  // 팔로우한 강사 목록
  // GET /users/me/following
  {
    method: 'GET',
    match: (e) => e.startsWith('/users/me/following'),
    handler: (() => {
      const followingSet = new Set<number>();
      return ({ endpoint }) => {
        const q = parseQuery(endpoint);
        const page = Number(q.page ?? 1);
        const size = Number(q.size ?? 12);
        const ids = Array.from(followingSet);
        const start = (page - 1) * size;
        const end = start + size;
        const selected = ids.slice(start, end);
        const content = selected.map((id) => {
          const mock = (mockInstructorsData as any[]).find((i: any) => i.instructorId === id);
          return { instructorId: id, name: mock?.name ?? `Instructor ${id}`, profileImageUrl: mock?.profileImageUrl ?? null };
        });
        return { content, page: { size, number: page, totalElements: ids.length, totalPages: Math.max(1, Math.ceil(ids.length / size)) } };
      };
    })(),
  },

  // 강사 팔로우 토글
  // POST /instructors/{instructorId}/follow
  {
    method: 'POST',
    match: (e) => /^\/instructors\/(\d+)\/follow$/.test(e.split('?')[0]),
    handler: (() => {
      const followingSet = new Set<number>();
      return ({ endpoint }) => {
        const id = Number(endpoint.split('/')[2]);
        const nowFollowing = !followingSet.has(id);
        if (nowFollowing) followingSet.add(id); else followingSet.delete(id);
        return { followeeId: id, isFollowing: nowFollowing };
      };
    })(),
  },
  // 업적 정의 목록 (관리자)
  // GET /achievements
  {
    method: 'GET',
    match: (e) => e.startsWith('/achievements') && !/^\/achievements\/(\d+)/.test(e.split('?')[0]),
    handler: async ({ endpoint }) => {
      const { mockAchievementDefinitions } = await import('../data/achievementMockData');
      // 서버 페이지 포맷 흉내
      const q = parseQuery(endpoint);
      const size = Number(q.size ?? 12);
      const number = Number(q.page ?? 1);
      const start = (number - 1) * size;
      const end = start + size;
      const content = mockAchievementDefinitions.slice(start, end);
      return {
        content,
        page: {
          size,
          number,
          totalElements: mockAchievementDefinitions.length,
          totalPages: Math.max(1, Math.ceil(mockAchievementDefinitions.length / size)),
        },
      };
    },
  },

  // 업적 상세 (관리자)
  // GET /achievements/{id}
  {
    method: 'GET',
    match: (e) => /^\/achievements\/(\d+)/.test(e.split('?')[0]),
    handler: async ({ endpoint }) => {
      const { mockAchievementDefinitions } = await import('../data/achievementMockData');
      const path = endpoint.split('?')[0];
      const id = Number(path.split('/')[2]);
      const achievement = mockAchievementDefinitions.find((a: any) => a.id === id);
      if (!achievement) throw new Error('Achievement not found');
      return achievement;
    },
  },

  // 내 업적 목록
  // GET /users/me/achievements
  {
    method: 'GET',
    match: (e) => e.startsWith('/users/me/achievements'),
    handler: async ({ endpoint }) => {
      const { getDynamicMockAchievementData } = await import('../data/achievementMockData');
      const mock = getDynamicMockAchievementData();
      // 서버 포맷과 유사하게 반환
      return {
        content: mock.content.map((a: any) => ({
          achievementId: a.achievementId,
          name: a.name,
          description: a.description,
          phrase: a.phrase,
          grade: a.grade,
          category: a.category,
          isAchieved: a.isAchieved,
          achievedAt: a.achievedAt,
          progress: a.progress,
        })),
        page: {
          size: mock.size,
          number: mock.number + 1, // 내부 0-based였으면 1-based 유사 값 반환
          totalElements: mock.totalElements,
          totalPages: mock.totalPages,
        },
      };
    },
  },

  // 안 읽은 메일 개수 조회
  // GET /mailbox/announcements/unread-count
  {
    method: 'GET',
    match: (e) => e === '/mailbox/announcements/unread-count',
    handler: async ({ endpoint }) => {
      const { getDynamicMockMailData } = await import('../data/mailboxMockData');
      const mock = getDynamicMockMailData();
      
      // 읽지 않은 메일 개수 계산 (isRead가 false인 것들)
      const unreadCount = mock.filter((item: any) => !item.isRead).length;
      
      return {
        unreadCount: unreadCount,
      };
    },
  },

  // 우편함 공지사항 목록
  // GET /mailbox/announcements
  {
    method: 'GET',
    match: (e) => e.startsWith('/mailbox/announcements') && !/^\/mailbox\/announcements\/(\d+)$/.test(e.split('?')[0]) && e !== '/mailbox/announcements/unread-count',
    handler: async ({ endpoint }) => {
      const { getDynamicMockMailData } = await import('../data/mailboxMockData');
      const mock = getDynamicMockMailData();
      
      // 서버 포맷과 유사하게 반환
      return mock.map((item: any) => ({
        userAnnouncementId: item.id,
        announcementId: item.id,
        title: item.title,
        receivedAt: item.sentAt,
        isRead: item.isRead, // 실제 Mock 데이터의 isRead 상태 반영
      }));
    },
  },

  // 우편함 공지사항 상세 조회 및 읽음 처리
  // POST /mailbox/announcements/{userAnnouncementId}
  {
    method: 'POST',
    match: (e) => /^\/mailbox\/announcements\/(\d+)$/.test(e.split('?')[0]),
    handler: async ({ endpoint }) => {
      const { getDynamicMockMailData, updateMockMailReadStatus } = await import('../data/mailboxMockData');
      const mock = getDynamicMockMailData();
      
      // URL에서 userAnnouncementId 추출
      const match = endpoint.match(/^\/mailbox\/announcements\/(\d+)$/);
      const userAnnouncementId = match ? parseInt(match[1], 10) : 0;
      
      // 해당 ID의 메일 찾기
      const mailItem = mock.find((item: any) => item.id === userAnnouncementId);
      
      if (!mailItem) {
        throw new Error(`메일을 찾을 수 없습니다. ID: ${userAnnouncementId}`);
      }
      
      // 읽음 처리 (isRead를 true로 변경)
      updateMockMailReadStatus(userAnnouncementId, true);
      
      // 서버 포맷과 유사하게 반환 (읽음 처리 완료)
      return {
        id: mailItem.id,
        title: mailItem.title,
        content: mailItem.content,
        sentAt: mailItem.sentAt,
        createdAt: mailItem.createdAt,
        modifiedAt: mailItem.modifiedAt,
      };
    },
  },

  // 컬렉션 목록
  // GET /collections
  {
    method: 'GET',
    match: (e) => e.startsWith('/collections') && !/^\/collections\/(\d+)/.test(e.split('?')[0]),
    handler: ({ endpoint }) => {
      const q = parseQuery(endpoint);
      const sort = (q.sort as any) || 'CREATED';
      const excludeOwned = q.excludeOwned === 'true';
      const page = Number(q.page ?? 1);
      const size = Number(q.size ?? 12);
      const deletionStatus = q.deletionStatus || 'ACTIVE';

      let list = mockCollectionData.filter((c: any) => {
        if (deletionStatus === 'ACTIVE') return !c.deletedAt;
        if (deletionStatus === 'DELETED') return !!c.deletedAt;
        return true; // ALL
      });
      if (excludeOwned) list = list.filter((c: any) => !c.isOwned);

      // Summary 형태로 매핑 (items=null)
      let summaries = list.map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        phrase: d.phrase,
        imageUrl: d.imageUrl,
        lottieUrl: d.lottieUrl,
        basePrice: d.basePrice,
        purchasePrice: d.purchasePrice,
        ownedItemsCount: d.ownedItemsCount,
        totalItemsCount: d.totalItemsCount,
        isOwned: d.isOwned,
        isEquipped: d.isEquipped,
        items: null,
        createdAt: d.createdAt,
        modifiedAt: d.modifiedAt,
        deletedAt: d.deletedAt,
      }));

      if (sort === 'PRICE_ASC') summaries.sort((a: any, b: any) => a.basePrice - b.basePrice);
      else if (sort === 'PRICE_DESC') summaries.sort((a: any, b: any) => b.basePrice - a.basePrice);
      else if (sort === 'POPULARITY') summaries.sort((a: any, b: any) => b.basePrice - a.basePrice);
      else summaries.sort((a: any, b: any) => (a.createdAt < b.createdAt ? 1 : -1));

      const start = (page - 1) * size;
      const end = start + size;
      const content = summaries.slice(start, end);
      return {
        content,
        page: {
          size,
          number: page,
          totalElements: summaries.length,
          totalPages: Math.max(1, Math.ceil(summaries.length / size)),
        },
      };
    },
  },

  // 컬렉션 상세
  // GET /collections/{id}
  {
    method: 'GET',
    match: (e) => /^\/collections\/(\d+)/.test(e.split('?')[0]),
    handler: ({ endpoint }) => {
      const path = endpoint.split('?')[0];
      const id = Number(path.split('/')[2]);
      const found = (mockCollectionData as any[]).find((c: any) => c.id === id);
      if (!found) throw new Error('Collection not found');
      return found;
    },
  },

  // 내 컬렉션 목록
  // GET /users/me/owned-collections
  {
    method: 'GET',
    match: (e) => e.startsWith('/users/me/owned-collections'),
    handler: ({ endpoint }) => {
      const q = parseQuery(endpoint);
      const page = Number(q.page ?? 1);
      const size = Number(q.size ?? 12);
      const sort = q.sort || 'createdAt,desc';

      let list = mockCollectionData.filter((c: any) => c.isOwned);
      if (list.length === 0) list = mockCollectionData.map((c: any) => ({ ...c, isOwned: true }));

      // Summary 매핑
      let summaries = list.map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        phrase: d.phrase,
        imageUrl: d.imageUrl,
        lottieUrl: d.lottieUrl,
        basePrice: d.basePrice,
        purchasePrice: d.purchasePrice,
        ownedItemsCount: d.ownedItemsCount,
        totalItemsCount: d.totalItemsCount,
        isOwned: true,
        isEquipped: d.isEquipped,
        items: null,
        createdAt: d.createdAt,
        modifiedAt: d.modifiedAt,
        deletedAt: d.deletedAt,
      }));

      if (sort.includes('createdAt,desc')) summaries.sort((a: any, b: any) => (a.createdAt < b.createdAt ? 1 : -1));
      else if (sort.includes('createdAt,asc')) summaries.sort((a: any, b: any) => (a.createdAt > b.createdAt ? 1 : -1));

      const start = (page - 1) * size;
      const end = start + size;
      const content = summaries.slice(start, end);
      return {
        content,
        page: {
          size,
          number: page,
          totalElements: summaries.length,
          totalPages: Math.max(1, Math.ceil(summaries.length / size)),
        },
      };
    },
  },

  // 아이템 카탈로그 리스트
  // GET /items
  {
    method: 'GET',
    match: (e) => e.startsWith('/items') && !/^\/items\/(\d+)/.test(e.split('?')[0]),
    handler: ({ endpoint }) => {
      const q = parseQuery(endpoint);
      let list = serverItemList.slice();
      if (q.itemType) list = list.filter((it: any) => it.itemType === q.itemType);
      if (q.excludeOwned === 'true') list = list.filter((it: any) => !it.isOwned);
      const sort = (q.sort as any) || 'CREATED';
      if (sort === 'PRICE_ASC') list.sort((a: any, b: any) => a.price - b.price);
      else if (sort === 'PRICE_DESC') list.sort((a: any, b: any) => b.price - a.price);
      else if (sort === 'POPULARITY') list.sort((a: any, b: any) => a.id - b.id);
      else list.sort((a: any, b: any) => b.id - a.id);

      const page = Number(q.page ?? 1);
      const size = Number(q.size ?? 12);
      const start = (page - 1) * size;
      const end = start + size;
      const content = list.slice(start, end) as any[];
      return {
        content,
        page: {
          size,
          number: page,
          totalElements: list.length,
          totalPages: Math.max(1, Math.ceil(list.length / size)),
        },
      };
    },
  },

  // 액티비티 목록
  // GET /activities
  {
    method: 'GET',
    match: (e) => e.startsWith('/activities') && !/^\/activities\/(\d+)/.test(e.split('?')[0]),
    handler: ({ endpoint }) => {
      const q = parseQuery(endpoint);
      const page = Number(q.page ?? 1);
      const size = Number(q.size ?? 12);
      const sort = q.sort || 'createdAt,desc';
      let list = [...mockContentData];
      if (sort.includes('createdAt,desc')) list.sort((a: any, b: any) => b.id - a.id);
      else if (sort.includes('createdAt,asc')) list.sort((a: any, b: any) => a.id - b.id);
      const start = (page - 1) * size;
      const end = start + size;
      const content = list.slice(start, end);
      return {
        content,
        page: {
          size,
          number: page,
          totalElements: list.length,
          totalPages: Math.ceil(list.length / size),
        },
      };
    },
  },

  // 액티비티 상세
  // GET /activities/{activityId}
  {
    method: 'GET',
    match: (e) => /^\/activities\/(\d+)/.test(e.split('?')[0]),
    handler: ({ endpoint }) => {
      const path = endpoint.split('?')[0];
      const id = Number(path.split('/')[2]);
      const found = (mockContentData as any[]).find((a: any) => a.id === id);
      if (!found) throw new Error('Activity not found');
      return found;
    },
  },

  // 액티비티 즐겨찾기 토글
  // POST /activities/{activityId}/favorite
  {
    method: 'POST',
    match: (e) => /^\/activities\/(\d+)\/favorite$/.test(e.split('?')[0]),
    handler: ({ endpoint }) => {
      const path = endpoint.split('?')[0];
      const id = Number(path.split('/')[2]);
      // DEV: store의 즐겨찾기 상태를 실제로 토글하여 일관성 유지
      const { favoriteActivities, favoriteActivity, unfavoriteActivity } = usePlayStore.getState() as any;
      const isFav = (favoriteActivities || []).some((f: any) => f.activityId === id);
      if (isFav) {
        unfavoriteActivity(id);
      } else {
        favoriteActivity(id);
      }
      return { activityId: id, isFavorited: !isFav };
    },
  },

  // 내 즐겨찾기 액티비티 목록
  // GET /users/me/favorites
  {
    method: 'GET',
    match: (e) => e.startsWith('/users/me/favorites'),
    handler: ({ endpoint }) => {
      const q = parseQuery(endpoint);
      const page = Number(q.page ?? 1);
      const size = Number(q.size ?? 12);
      const favs = usePlayStore.getState().favoriteActivities || [];
      const ids = favs.map((f: any) => f.activityId);
      const all = (mockContentData as any[]).filter((c: any) => ids.includes(c.id));
      const start = (page - 1) * size;
      const end = start + size;
      const sel = all.slice(start, end);
      const content = sel.map((c: any) => ({
        activityId: c.id,
        type: c.type,
        title: c.title,
        thumbnailImageUrl: c.thumbnailImageUrl,
        durationInSeconds: c.durationInSeconds,
      }));
      return {
        content,
        page: { size, number: page, totalElements: all.length, totalPages: Math.max(1, Math.ceil(all.length / size)) },
      };
    },
  },

  // 감정일기 목록
  // GET /diaries
  {
    method: 'GET',
    match: (e) => e.startsWith('/diaries') && e.split('?')[0] === '/diaries',
    handler: async ({ endpoint }) => {
      const { getMockDiaryData } = await import('../data/emotionReportMockData');
      const q = parseQuery(endpoint);
      const from = q.from;
      const to = q.to;
      const size = Number(q.size ?? 20);
      const page = Number(q.page ?? 1);
      const mock = getMockDiaryData(from, to);
      const start = (page - 1) * size;
      const end = start + size;
      const content = mock.slice(start, end).map((d: any, idx: number) => ({
        diaryId: start + idx + 1,
        userId: 1,
        emotion: toBackendEmotion(d.character),
        memo: d.content || null,
        recordDate: d.date,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        deletedAt: null,
      }));
      return {
        content,
        page: {
          size,
          number: page,
          totalElements: mock.length,
          totalPages: Math.ceil(mock.length / size),
        },
      };
    },
  },

  // 감정일기 단건 조회
  // GET /diaries/{diaryId}
  {
    method: 'GET',
    match: (e) => /^\/diaries\/(\d+)$/.test(e.split('?')[0]),
    handler: async ({ endpoint }) => {
      const { getMockDiaryDataForAPI } = await import('../data/emotionReportMockData');
      const path = endpoint.split('?')[0];
      const id = Number(path.split('/')[2]);
      
      // 전체 기간의 데이터에서 해당 diaryId 찾기
      const allData = getMockDiaryDataForAPI('2025-01-01', '2025-12-31');
      const foundDiary = allData.find(diary => diary.diaryId === id);
      
      if (!foundDiary) {
        throw new Error(`Diary not found: ${id}`);
      }
      
      return foundDiary;
    },
  },

  // 감정일기 수정
  // PATCH /diaries/{diaryId}
  {
    method: 'PATCH',
    match: (e) => /^\/diaries\/(\d+)$/.test(e.split('?')[0]),
    handler: ({ endpoint, body }) => {
      const path = endpoint.split('?')[0];
      const id = Number(path.split('/')[2]);
      return {
        diaryId: id,
        userId: 1,
        emotion: body?.emotion ?? 'JOY',
        memo: body?.memo ?? null,
        recordDate: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        deletedAt: null,
      };
    },
  },

  // 감정일기 등록
  // POST /diaries
  {
    method: 'POST',
    match: (e) => e === '/diaries',
    handler: ({ body }) => {
      return {
        diaryId: 2,
        userId: 1,
        emotion: body?.emotion ?? 'JOY',
        memo: body?.memo ?? null,
        recordDate: body?.date ?? new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        deletedAt: null,
      };
    },
  },

  // 활동 완료 처리
  // POST /activities/{activityId}/history/complete
  {
    method: 'POST',
    match: (e) => /^\/activities\/(\d+)\/history\/complete$/.test(e.split('?')[0]),
    handler: async ({ endpoint }) => {
      const { useActivityHistoryStore } = await import('../stores/activityHistoryStore');
      const path = endpoint.split('?')[0];
      const id = Number(path.split('/')[2]);
      useActivityHistoryStore.getState().completeActivity(id);
      const MOCK_ACTIVITY_DESCRIPTION = [
        '뇌에 맑fdsafdsafds 차올랐고...',
        '마음은 하루를 준비할 평온함을 얻고...',
        '무엇인가 집중할 준비가 되었어요!',
    ]
      return {
        activityId: id,
        completionEffectTexts: MOCK_ACTIVITY_DESCRIPTION,
        rewardable: true,
      };
    },
  },

  // 활동 진행 상황 기록
  // PATCH /activities/{activityId}/history
  {
    method: 'PATCH',
    match: (e) => /^\/activities\/(\d+)\/history$/.test(e.split('?')[0]),
    handler: async ({ endpoint, body }) => {
      const { useActivityHistoryStore } = await import('../stores/activityHistoryStore');
      const path = endpoint.split('?')[0];
      const id = Number(path.split('/')[2]);
      const lastPlaybackPosition = Number(body?.lastPlaybackPosition ?? 0);
      const actualPlayTimeInSeconds = Number(body?.actualPlayTimeInSeconds ?? 0);
      useActivityHistoryStore.getState().updateActivityProgress(
        id,
        lastPlaybackPosition,
        actualPlayTimeInSeconds,
      );
      return undefined; // 204 No Content 의미
    },
  },

  // 활동 진행 상황 조회
  // GET /activities/{activityId}/history
  {
    method: 'GET',
    match: (e) => /^\/activities\/(\d+)\/history$/.test(e.split('?')[0]),
    handler: async ({ endpoint }) => {
      const { useActivityHistoryStore } = await import('../stores/activityHistoryStore');
      const path = endpoint.split('?')[0];
      const id = Number(path.split('/')[2]);
      const progress = useActivityHistoryStore.getState().getActivityProgress(id);
      if (!progress) return undefined; // 기록 없음 → 204
      return {
        activityId: progress.activityId,
        progressSeconds: progress.lastPlaybackPosition,
      };
    },
  },

  // 내 활동 요약 정보
  // GET /users/me/summary
  {
    method: 'GET',
    match: (e) => e.startsWith('/users/me/summary'),
    handler: () => ({
      diaryCount: 0,
      activityCount: 0,
      totalActivitySeconds: 0,
    }),
  },

  // 사용자 포인트 조회
  // GET /users/me/points
  {
    method: 'GET',
    match: (e) => e.startsWith('/users/me/points'),
    handler: async () => {
      const { useCurrencyStore } = await import('../stores/currencyStore');
      const currentPoints = useCurrencyStore.getState().heartPoints;
      return { points: currentPoints };
    },
  },

  // 장바구니 조회
  // GET /cart
  {
    method: 'GET',
    match: (e) => e === '/cart',
    handler: async () => {
      const { useCartStore } = await import('../stores/cartStore');
      const { items, totalPrice } = useCartStore.getState();
      return { items, totalPrice };
    },
  },

  // 장바구니 아이템 추가
  // POST /cart/items
  {
    method: 'POST',
    match: (e) => e === '/cart/items',
    handler: async ({ body }) => {
      const { useCartStore } = await import('../stores/cartStore');
      const { roomItemList } = await import('../data/roomItemData');
      const itemIds: number[] = body?.itemIds ?? [];
      const itemsToAdd = (roomItemList as any[]).filter((it: any) => itemIds.includes(it.id));
      const purchasedItems: PurchasedItem[] = itemsToAdd.map((item: any) => ({
        id: item.id,
        name: item.title,
        description: Array.isArray(item.description) ? item.description.join('\n') : (item.description || ''),
        phrase: null,
        itemType: (item.type === '악세사리' ? 'ACCESSORY' : item.type === '모자' ? 'HAT' : item.type === '배경' ? 'BACKGROUND' : item.type === '러그' ? 'FLOOR' : item.type === '선반' ? 'SHELF' : 'FRAME') as ItemType,
        equipSlot: (item.positionType === 'eyewear' ? 'EYEWEAR' : item.positionType === 'hat' ? 'HAT' : item.positionType === 'background' ? 'BACKGROUND' : item.positionType === 'frame' ? 'FRAME' : item.positionType === 'floor' ? 'FLOOR' : 'SHELF') as EquipSlot,
        acquisitionType: 'PURCHASE',
        price: item.price || 0,
        imageUrl: typeof item.image === 'string' ? item.image : null,
        lottieUrl: item.lottieJson || null,
        isSoldOut: false,
        isOwned: false,
        isEquipped: false,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        deletedAt: null,
      }));
      useCartStore.getState().addItems(purchasedItems);
      const { items, totalPrice } = useCartStore.getState();
      return { items, totalPrice };
    },
  },

  // 장바구니 아이템 제거
  // DELETE /cart/items/{itemId}
  {
    method: 'DELETE',
    match: (e) => /^\/cart\/items\/(\d+)$/.test(e.split('?')[0]),
    handler: async ({ endpoint }) => {
      const { useCartStore } = await import('../stores/cartStore');
      const id = Number(endpoint.split('/').pop());
      useCartStore.getState().removeItem(id);
      const { items, totalPrice } = useCartStore.getState();
      return { items, totalPrice };
    },
  },

  // 장바구니 전체 초기화
  // DELETE /cart (가정) 또는 일괄 제거 로직이 서비스에 맞춰 구현되어 있으므로 GET/DELETE 조합으로 처리됨
  // 여기서는 purchaseService의 clearAllCartItems 흐름을 그대로 반영하기 위해, 개별 삭제 모킹만 유지

  // 장바구니 구매
  // POST /purchase/cart
  {
    method: 'POST',
    match: (e) => e === '/purchase/cart',
    handler: async ({ body }) => {
      const { useCartStore } = await import('../stores/cartStore');
      const { useCurrencyStore } = await import('../stores/currencyStore');
      const expectedTotalPrice = Number(body?.expectedTotalPrice ?? 0);
      const currentHeartPoints = useCurrencyStore.getState().heartPoints;
      const { items: cartItems, totalPrice } = useCartStore.getState();
      if (totalPrice !== expectedTotalPrice) throw new Error(`가격 불일치: 예상 ${expectedTotalPrice}, 실제 ${totalPrice}`);
      if (currentHeartPoints < expectedTotalPrice) throw new Error(`하트 포인트 부족: 현재 ${currentHeartPoints}, 필요 ${expectedTotalPrice}`);
      const remainingPoints = currentHeartPoints - expectedTotalPrice;
      useCurrencyStore.setState({ heartPoints: remainingPoints });
      // 장바구니 비우기
      useCartStore.getState().clearCart();
      return { purchasedItems: cartItems, remainingPoints };
    },
  },

  // 아이템 다건 구매
  // POST /purchase/items
  {
    method: 'POST',
    match: (e) => e === '/purchase/items',
    handler: async ({ body }) => {
      // 서버 스펙과 동일한 데이터 소스를 사용하여 일관성 유지
      const { serverItemList } = await import('../data/roomItemData');
      const { useCurrencyStore } = await import('../stores/currencyStore');
      const { useRoomStore } = await import('../stores/roomStore');
      const itemIds: number[] = body?.itemIds ?? [];
      const expectedTotalPrice = Number(body?.expectedTotalPrice ?? 0);
      const currentHeartPoints = useCurrencyStore.getState().heartPoints;
      // 존재하는 아이템만 구매 대상으로 선정
      const itemsToPurchase = (serverItemList as any[]).filter((item: any) => itemIds.includes(item.id));
      if (itemsToPurchase.length !== itemIds.length) {
        const missing = itemIds.filter((id: number) => !(serverItemList as any[]).some((it: any) => it.id === id));
        console.warn('[MOCK]/purchase/items: 존재하지 않는 아이템 ID가 포함되어 무시됩니다:', missing);
      }
      const totalPrice = itemsToPurchase.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
      // 모킹에서는 총액 불일치 시에도 실패로 만들지 않고 경고만 출력해 개발 편의성 보장
      if (totalPrice !== expectedTotalPrice) {
        console.warn(`[MOCK]/purchase/items: 가격 불일치(예상 ${expectedTotalPrice}, 실제 ${totalPrice}) → 실제 합계로 처리합니다.`);
      }
      if (currentHeartPoints < totalPrice) throw new Error(`하트 포인트 부족: 현재 ${currentHeartPoints}, 필요 ${totalPrice}`);
      const remainingPoints = currentHeartPoints - totalPrice;
      useCurrencyStore.setState({ heartPoints: remainingPoints });
      const { addOwnedItem } = useRoomStore.getState();
      // 실제 존재하는 아이템만 소유 처리
      itemsToPurchase.forEach((item: any) => addOwnedItem(item.id));
      const purchasedItems: PurchasedItem[] = itemsToPurchase.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        phrase: null,
        itemType: item.itemType as ItemType,
        equipSlot: item.equipSlot as EquipSlot,
        acquisitionType: 'PURCHASE',
        price: item.price || 0,
        imageUrl: item.imageUrl || null,
        lottieUrl: item.lottieUrl || null,
        isSoldOut: false,
        isOwned: true,
        isEquipped: false,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        deletedAt: null,
      }));
      return { purchasedItems, remainingPoints };
    },
  },

  // 월별 감정 통계
  // GET /diaries/stats
  {
    method: 'GET',
    match: (e) => e.startsWith('/diaries/stats'),
    handler: async ({ endpoint }) => {
      const { getMockDiaryDataForAPI } = await import('../data/emotionReportMockData');
      const q = parseQuery(endpoint);
      const year = Number(q.year);
      const month = Number(q.month);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      const from = start.toISOString().slice(0, 10);
      const to = end.toISOString().slice(0, 10);
      const data = getMockDiaryDataForAPI(from, to);
      const counts: Record<string, number> = {};
      for (const d of data) counts[d.emotion] = (counts[d.emotion] ?? 0) + 1;
      const total = data.length;
      return {
        stats: Object.entries(counts).map(([frontendEmotion, count]) => ({
          emotion: toBackendEmotion(frontendEmotion as any),
          count,
          percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
        })),
      };
    },
  },

  // 요일별 감정 기록
  // GET /diaries/daily
  {
    method: 'GET',
    match: (e) => e.startsWith('/diaries/daily'),
    handler: async ({ endpoint }) => {
      const { getMockDiaryDataForAPI } = await import('../data/emotionReportMockData');
      const q = parseQuery(endpoint);
      const from = q.from;
      const to = q.to;
      const data = getMockDiaryDataForAPI(from, to);
      return data.map((item: any, idx: number) => ({
        diaryId: item.diaryId ?? idx + 1,
        emotion: toBackendEmotion(item.emotion as any),
        recordDate: item.recordDate,
      }));
    },
  },

  // 아이템 상세
  // GET /items/{id}
  {
    method: 'GET',
    match: (e) => /^\/items\/(\d+)/.test(e.split('?')[0]),
    handler: ({ endpoint }) => {
      const path = endpoint.split('?')[0];
      const id = Number(path.split('/')[2]);
      const found = (serverItemList as any[]).find((it: any) => it.id === id);
      if (!found) throw new Error('Item not found');
      return found;
    },
  },

  // 내 소유 아이템 목록 
  // GET /users/me/owned-items
  {
    method: 'GET',
    match: (e) => e.startsWith('/users/me/owned-items'),
    handler: ({ endpoint }) => {
      const q = parseQuery(endpoint);
      let list = serverItemList.filter((it: any) => it.isOwned);
      if (q.itemType) list = list.filter((it: any) => it.itemType === q.itemType);
      list.sort((a: any, b: any) => b.id - a.id);
      const page = Number(q.page ?? 1);
      const size = Number(q.size ?? 12);
      const start = (page - 1) * size;
      const end = start + size;
      const content = list.slice(start, end) as any[];
      return {
        content,
        page: {
          size,
          number: page,
          totalElements: list.length,
          totalPages: Math.max(1, Math.ceil(list.length / size)),
        },
      };
    },
  },

  // 현재 장착 아이템
  // GET /users/me/equipped-items
  {
    method: 'GET',
    match: (e) => e === '/users/me/equipped-items',
    handler: () => {
      const bySlot: any = { hat: null, eyewear: null, background: null, frame: null, floor: null, shelf: null };
      for (const it of serverItemList as any[]) {
        if (!it.isOwned) continue;
        const slot = (it.equipSlot || '').toLowerCase();
        if (slot && bySlot[slot] == null) bySlot[slot] = it;
      }
      return bySlot;
    },
  },

  // 장착 변경 (전체 교체)
  // PUT /users/me/equipped-items
  {
    method: 'PUT',
    match: (e) => e === '/users/me/equipped-items',
    handler: ({ body }) => {
      const bySlot: any = { hat: null, eyewear: null, background: null, frame: null, floor: null, shelf: null };
      const slotKeys = ['BACKGROUND','EYEWEAR','HAT','FRAME','FLOOR','SHELF'];
      for (const slot of slotKeys) {
        const newId = body?.itemsToEquip?.[slot];
        if (newId) {
          const mock = (serverItemList as any[]).find((it: any) => it.id === newId);
          if (mock) bySlot[slot.toLowerCase()] = mock;
        }
      }
      return bySlot;
    },
  },

  // 홈 화면 체류 시간 로그 저장
  // POST /user-activities/screen-time
  {
    method: 'POST',
    match: (e) => e === '/user-activities/screen-time',
    handler: ({ body }) => {
      console.log(`[MOCK] 홈 화면 체류 시간 로그 저장:`, {
        durationInSeconds: body?.durationInSeconds,
      });
      
      // 204 No Content 응답 (응답 없음)
      return undefined;
    },
  },

  // 온보딩 답변 저장
  // POST /users/me/onboarding-answers
  {
    method: 'POST',
    match: (e) => e === '/users/me/onboarding-answers',
    handler: ({ body }) => {
      console.log(`[MOCK] 온보딩 답변 저장:`, {
        focusGoal: body?.focusGoal,
        dailyDuration: body?.dailyDuration,
      });
      
      // 204 No Content 응답 (응답 없음)
      return undefined;
    },
  },

        // 보상형 광고 목록 조회
        // GET /rewarded-ads/me
        {
          method: 'GET',
          match: (e) => e === '/rewarded-ads/me',
          handler: () => {
            console.log(`[MOCK] 보상형 광고 목록 조회`);

            const mockRewardedAds = [
              {
                id: 1,
                title: '하트 포인트 받기',
                adUnitId: 'ca-app-pub-4758709448782249/5717753460',
                rewardAmount: 10,
                watchedToday: false,
              },
              {
                id: 2,
                title: '추가 하트 포인트',
                adUnitId: 'ca-app-pub-4758709448782249/9283934708',
                rewardAmount: 20,
                watchedToday: false,
              },
              {
                id: 3,
                title: '특별 보상',
                adUnitId: 'ca-app-pub-4758709448782249/4206373001',
                rewardAmount: 50,
                watchedToday: true,
              },
            ];

            return mockRewardedAds;
          },
        },
];


