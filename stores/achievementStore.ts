import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMyAchievements } from '../services/achievementService';
import { MyAchievement } from '../types';
import { initializeMockUserProgress } from '../data/achievementMockData';
import { useAppConfigStore } from './appConfigStore';
import { apiClient } from '../services/apiClient';
import { useAuthStore } from './authStore';

// 백엔드 API 응답 타입은 types/index.ts의 MyAchievement, PagedResponse 사용

export interface UserAchievement {
  id: number;
  completionRate: number;
  isAchieved: boolean;
  achievedAt?: string | null;
  lastUpdated: Date;
}

export interface AchievementState {
  // 사용자 업적 진행도 (GET /users/me/achievements)
  userAchievements: Map<number, UserAchievement>;
  // 팝업 시스템 관련
  cache: Map<number, MyAchievement>;
  shown: Set<number>;
  popupQueue: MyAchievement[];
  isPopupOpen: boolean;
  _checkTimer: any | null;

  // 액션들
  getUserAchievementById: (id: number) => UserAchievement | undefined;
  getAchievementsByCategory: (category: string) => MyAchievement[];
  getAchievedCount: () => number;
  getTotalCount: () => number;
  resetAllAchievements: () => void;

  // 팝업 시스템 액션들
  initOnAppStart: () => Promise<void>;
  loadUserAchievements: (statusFilter?: 'ALL' | 'ACHIEVED' | 'NOT_ACHIEVED') => Promise<void>;
  loadAchievementDetail?: never; // ADMIN 제거로 미사용
  scheduleCheck: (delayMs?: number) => void;
  _checkNow: () => Promise<void>;
  _enqueue: (list: MyAchievement[]) => void;
  _showNext: () => Promise<void>;
  markShown: (id: number) => Promise<void>;
  enqueueFromServerDiff: (list: MyAchievement[]) => void;
  resetShownAchievements: () => Promise<void>;
}

const SHOWN_KEY = 'achievements_shown_ids';

export const useAchievementStore = create<AchievementState>()(
  devtools((set, get) => ({
    userAchievements: new Map(),

    // 팝업 시스템 초기 상태
    cache: new Map(),
    shown: new Set(),
    popupQueue: [],
    isPopupOpen: false,
    _checkTimer: null,

    getUserAchievementById: (id: number) => {
      const { userAchievements } = get();
      return userAchievements.get(id);
    },

    // 카테고리 목록: cache(서버 응답의 MyAchievement)를 기준으로 필터링 반환
    getAchievementsByCategory: (category: string) => {
      const { cache } = get();
      return Array.from(cache.values()).filter(a => a.category === category);
    },

    getAchievedCount: () => {
      const { cache } = get();
      return Array.from(cache.values()).filter(a => a.isAchieved).length;
    },

    getTotalCount: () => {
      // 사용자에게 노출되는 업적 총 수 = cache 크기
      const { cache } = get();
      return cache.size;
    },

    resetAllAchievements: () => {
      console.log('🔄 모든 업적 초기화...');
      set({ userAchievements: new Map(), cache: new Map() });
      console.log('✅ 모든 업적 초기화 완료!');
    },

    // 팝업 시스템 액션들
    initOnAppStart: async () => {
      try {
        console.log('🚀 앱 시작 시 업적 시스템 초기화...');

        // 0. 모킹 활성 시 1회만 Mock 데이터 초기화
        const { useMockApi } = useAppConfigStore.getState();
        if (useMockApi) {
          const already = (get() as any)._mockInitialized as boolean | undefined;
          if (!already) {
            initializeMockUserProgress();
            (get() as any)._mockInitialized = true;
          }
        }

        // 1. 팝업 기록 로드
        const raw = await AsyncStorage.getItem(SHOWN_KEY);
        const ids = raw ? (JSON.parse(raw) as number[]) : [];
        set({ shown: new Set(ids) });

        // 2. 사용자 업적 상태 로드 (정의 로드는 제거)
        await get().loadUserAchievements();

        // 3. 첫 체크 실행 (1초 후)
        setTimeout(() => {
          get().scheduleCheck(400);
        }, 1000);

        console.log('✅ 앱 시작 시 업적 시스템 초기화 완료!');
      } catch (e) {
        console.error('❌ 앱 시작 시 업적 시스템 초기화 실패:', e);
      }
    },

    loadUserAchievements: async (statusFilter: 'ALL' | 'ACHIEVED' | 'NOT_ACHIEVED' = 'ALL') => {
      try {
        const response = await fetchMyAchievements({ statusFilter, page: 1, size: 50 });

        // 정책: 진행 중(progress.current > 0) 또는 달성(isAchieved)만 노출
        const cache = new Map<number, MyAchievement>();
        const userAchievements = new Map<number, UserAchievement>();

        for (const a of response.content) {
          const isInProgress = (a.progress?.current ?? 0) > 0;
          if (a.isAchieved || isInProgress) {
            cache.set(a.achievementId, a);
            userAchievements.set(a.achievementId, {
              id: a.achievementId,
              completionRate: a.progress?.current || 0,
              isAchieved: a.isAchieved,
              achievedAt: a.achievedAt,
              lastUpdated: new Date(),
            });
          }
        }

        set({ userAchievements, cache });
        console.log('✅ 사용자 업적 로드 완료(필터 적용):', cache.size);
      } catch (error) {
        console.error('❌ 사용자 업적 로드 실패:', error);
      }
    },

    // 이하 팝업/체크 로직은 기존 유지
    scheduleCheck: (delayMs = 400) => {
      console.log(`⏰ 업적 체크 스케줄링: ${delayMs}ms 후`);
      const t = get()._checkTimer;
      if (t) clearTimeout(t);
      const timer = setTimeout(() => get()._checkNow(), delayMs);
      set({ _checkTimer: timer });
    },

    _checkNow: async () => {
      try {
        console.log('🔍 업적 체크 시작...');
        
        const { content } = await fetchMyAchievements({ statusFilter: 'ALL', page: 1, size: 50 });
        const byId = get().cache;
        const newly: MyAchievement[] = [];
        const { shown } = get();

        console.log('🔍 현재 상태:', {
          cacheSize: byId.size,
          shownSize: shown.size,
          shownIds: Array.from(shown),
          responseCount: content.length
        });

        for (const a of content) {
          const prev = byId.get(a.achievementId);
          const turnedTrue = !prev ? a.isAchieved : (!prev.isAchieved && a.isAchieved);
          const notShown = !shown.has(a.achievementId);

          console.log(`🔍 업적 ${a.achievementId} (${a.name}):`, {
            prev: prev ? { isAchieved: prev.isAchieved } : '없음',
            current: { isAchieved: a.isAchieved },
            turnedTrue,
            notShown,
            willAdd: turnedTrue && notShown
          });

          if (turnedTrue && notShown) {
            newly.push(a);
            console.log(`🎉 새로 달성한 업적 발견: ${a.name} (${a.grade})`);
          }
          // 캐시는 정책과 관계없이 최신 상태로 유지하되, 노출 정책 필터는 load시 반영
          byId.set(a.achievementId, a);
        }

        set({ cache: new Map(byId) });
        if (newly.length > 0) {
          console.log(`📋 ${newly.length}개 업적을 팝업 큐에 추가`);
          get()._enqueue(newly);
        } else {
          console.log('📭 새로 달성한 업적 없음');
        }
      } catch (e) {
        console.error('❌ 업적 체크 실패:', e);
      }
    },

    _enqueue: (list) => {
      const q = [...get().popupQueue, ...list];
      set({ popupQueue: q });
      console.log(`📋 팝업 큐에 ${list.length}개 업적 추가, 총 ${q.length}개`);

      const { isPopupOpen } = get();
      console.log(`🔍 팝업 상태: isPopupOpen=${isPopupOpen}`);

      if (!isPopupOpen) {
        console.log('🎬 팝업 표시 시작...');
        get()._showNext();
      } else {
        console.log('⏸️ 이미 팝업이 열려있어서 대기 중...');
      }
    },

    _showNext: async () => {
      const q = get().popupQueue;
      if (q.length === 0) {
        set({ isPopupOpen: false });
        return;
      }

      const next = q[0];
      set({ isPopupOpen: true, popupQueue: q.slice(1) });
      console.log(`🎭 팝업 표시: ${next.name}`);

      showAchievementPopup(next, async () => {
        await get().markShown(next.achievementId);
        get()._showNext();
      });
    },

    markShown: async (id) => {
      const shown = new Set(get().shown);
      shown.add(id);
      set({ shown });
      console.log(`✅ 업적 ${id} 표시 완료 처리`);

      try {
        await AsyncStorage.setItem(SHOWN_KEY, JSON.stringify(Array.from(shown)));
        console.log('💾 표시된 업적 ID 저장 완료');
      } catch (e) {
        console.error('❌ 표시된 업적 ID 저장 실패:', e);
      }
    },

    enqueueFromServerDiff: (list) => {
      if (!list || list.length === 0) return;
      console.log(`🎯 서버에서 즉시 알려준 업적 ${list.length}개 팝업 큐에 추가`);
      get()._enqueue(list);
    },

    resetShownAchievements: async () => {
      try {
        console.log('🔄 표시된 업적 기록 초기화 중...');
        set({ shown: new Set() });
        await AsyncStorage.removeItem(SHOWN_KEY);
        console.log('✅ 표시된 업적 기록 초기화 완료!');
      } catch (e) {
        console.error('❌ 표시된 업적 기록 초기화 실패:', e);
      }
    },
  }))
);

// 팝업 띄우기 헬퍼: UI 레이어와 연결
import type { MyAchievement as _MyAchievement } from '../types';
type PopupHandler = (a: _MyAchievement, onClose: () => void) => void;
type NavigationHandler = () => void;

let _popupHandler: PopupHandler | null = null;
let _navigationHandler: NavigationHandler | null = null;

export function bindAchievementPopupHandler(handler: PopupHandler) {
  _popupHandler = handler;
  console.log('🔗 업적 팝업 핸들러 연결됨');
}

export function bindAchievementNavigationHandler(handler: NavigationHandler) {
  _navigationHandler = handler;
  console.log('🔗 업적 네비게이션 핸들러 연결됨');
}

export function navigateToAchievements() {
  if (_navigationHandler) {
    _navigationHandler();
  } else {
    console.warn('⚠️ 업적 네비게이션 핸들러가 연결되지 않음 - MyTab이 아직 마운트되지 않았을 수 있습니다');
    setTimeout(() => {
      if (_navigationHandler) {
        console.log('🔄 네비게이션 핸들러 재시도...');
        _navigationHandler();
      } else {
        console.warn('⚠️ 네비게이션 핸들러 재시도 실패');
      }
    }, 1000);
  }
}

function showAchievementPopup(a: _MyAchievement, onClose: () => void) {
  if (_popupHandler) {
    _popupHandler(a, onClose);
  } else {
    console.warn('⚠️ 업적 팝업 핸들러가 연결되지 않음 - UI 컴포넌트가 아직 마운트되지 않았을 수 있습니다');
    onClose();
  }
}
