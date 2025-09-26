import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMyAchievements } from '../services/achievementService';
import { MyAchievement } from '../types';
// mock 업적 데이터 제거됨
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

        // mock 초기화 제거: 서버 푸시/조회 기반으로 전환

        // 1. 팝업 기록 로드
        const raw = await AsyncStorage.getItem(SHOWN_KEY);
        const ids = raw ? (JSON.parse(raw) as number[]) : [];
        set({ shown: new Set(ids) });

        // 2. 사용자 업적 상태 로드 (정의 로드는 제거)
        await get().loadUserAchievements();

        // 폴링/스케줄 제거: 푸시 기반 동기화로 전환

        console.log('✅ 앱 시작 시 업적 시스템 초기화 완료!');
      } catch (e) {
        console.error('❌ 앱 시작 시 업적 시스템 초기화 실패:', e);
      }
    },

    loadUserAchievements: async (statusFilter: 'ALL' | 'ACHIEVED' | 'NOT_ACHIEVED' = 'ALL') => {
      try {
        const response = await fetchMyAchievements({ statusFilter, page: 1, size: 50 });

        // 서버 응답을 내부 타입(MyAchievement)으로 그대로 저장 (progress 필드 원형 유지)
        const normalizedList: MyAchievement[] = response.content as any;

        // 정책: 진행 중(progress.current > 0) 또는 달성(isAchieved)만 노출
        const cache = new Map<number, MyAchievement>();
        const userAchievements = new Map<number, UserAchievement>();

        // currentValue <= 0인 데이터를 조회에서 제거하는 로직이 백엔드에 있는지 확인하고, 있다면 이 로직을 제거해야 함
        for (const a of normalizedList) {
          const isInProgress = (a.progress?.currentValue ?? 0) > 0;
          if (a.isAchieved || isInProgress) {
            cache.set(a.achievementId, a);
            userAchievements.set(a.achievementId, {
              id: a.achievementId,
              completionRate: a.progress?.currentValue || 0,
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

    // 이하 팝업 로직 유지 (푸시 기반으로 enqueue)

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
type GoToMyDecorationHandler = (params?: { autoEnterEditMode?: boolean }) => void;

let _popupHandler: PopupHandler | null = null;
let _navigationHandler: NavigationHandler | null = null;
let _goToMyDecorationHandler: GoToMyDecorationHandler | null = null;

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

export function bindMyDecorationNavigationHandler(handler: GoToMyDecorationHandler) {
  _goToMyDecorationHandler = handler;
  console.log('🔗 My 꾸미기 네비게이션 핸들러 연결됨');
}

export function navigateToMyDecoration(params?: { autoEnterEditMode?: boolean }) {
  if (_goToMyDecorationHandler) {
    _goToMyDecorationHandler(params);
  } else {
    console.warn('⚠️ My 꾸미기 네비게이션 핸들러가 연결되지 않음 - MyTab이 아직 마운트되지 않았을 수 있습니다');
    setTimeout(() => {
      if (_goToMyDecorationHandler) {
        console.log('🔄 My 꾸미기 네비게이션 핸들러 재시도...');
        _goToMyDecorationHandler(params);
      } else {
        console.warn('⚠️ My 꾸미기 네비게이션 핸들러 재시도 실패');
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
