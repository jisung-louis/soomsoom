import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMyAchievements, fetchAchievements, fetchAchievementDetail } from '../services/achievementService';
import { MyAchievement, Achievement } from '../types';
import { useAuthStore } from './authStore';
import { initializeMockUserProgress } from '../data/achievementMockData';

// 백엔드 API 응답 타입은 types/index.ts의 MyAchievement, PagedResponse 사용


export interface UserAchievement {
  id: number;
  completionRate: number;
  isAchieved: boolean;
  achievedAt?: string | null;
  lastUpdated: Date;
}

export interface AchievementState {
  // 업적 정의 데이터 (GET /achievements)
  achievementDefinitions: Map<number, Achievement>;
  
  // 사용자 업적 진행도 (GET /users/me/achievements)
  userAchievements: Map<number, UserAchievement>;
  
  // 팝업 시스템 관련
  cache: Map<number, MyAchievement>;
  shown: Set<number>;
  popupQueue: MyAchievement[];
  isPopupOpen: boolean;
  _checkTimer: any | null;
  
  // 액션들 (필요한 것만 유지)
  getAchievementById: (id: number) => Achievement | undefined;
  getUserAchievementById: (id: number) => UserAchievement | undefined;
  getAchievementsByCategory: (category: string) => Achievement[];
  getAchievedCount: () => number;
  getTotalCount: () => number;
  resetAllAchievements: () => void;
  
  // 팝업 시스템 액션들
  initOnAppStart: () => Promise<void>;
  loadAchievementDefinitions: () => Promise<void>;
  loadUserAchievements: (statusFilter?: 'ALL' | 'ACHIEVED' | 'NOT_ACHIEVED') => Promise<void>;
  loadAchievementDetail: (achievementId: number) => Promise<Achievement | null>;
  scheduleCheck: (delayMs?: number) => void;
  _checkNow: () => Promise<void>;
  _enqueue: (list: MyAchievement[]) => void;
  _showNext: () => Promise<void>;
  markShown: (id: number) => Promise<void>;
  enqueueFromServerDiff: (list: MyAchievement[]) => void;
  resetShownAchievements: () => Promise<void>; // 새로 추가
}

// API 호출 함수들은 services/achievementService.ts로 이동



const SHOWN_KEY = 'achievements_shown_ids';

export const useAchievementStore = create<AchievementState>()(
  devtools((set, get) => ({
    achievementDefinitions: new Map(),
    userAchievements: new Map(),
    
    // 팝업 시스템 초기 상태
    cache: new Map(),
    shown: new Set(),
    popupQueue: [],
    isPopupOpen: false,
    _checkTimer: null,

    // 불필요한 함수들 제거됨 - 팝업 시스템이 서버 데이터를 직접 사용

    getAchievementById: (id: number) => {
      const { achievementDefinitions } = get();
      return achievementDefinitions.get(id);
    },

    getUserAchievementById: (id: number) => {
      const { userAchievements } = get();
      return userAchievements.get(id);
    },

    getAchievementsByCategory: (category: string) => {
      const { achievementDefinitions } = get();
      return Array.from(achievementDefinitions.values()).filter(a => a.category === category);
    },

    getAchievedCount: () => {
      const { userAchievements, cache } = get();
      
      // cache에 데이터가 있으면 cache 기준으로 계산
      if (cache.size > 0) {
        return Array.from(cache.values()).filter(a => a.isAchieved).length;
      }
      
      // cache가 비어있으면 userAchievements 기준으로 계산
      return Array.from(userAchievements.values()).filter(ua => ua.isAchieved).length;
    },

    getTotalCount: () => {
      const { achievementDefinitions } = get();
      return achievementDefinitions.size;
    },

    resetAllAchievements: () => {
      console.log('🔄 모든 업적 초기화...');
      const { achievementDefinitions } = get();
      
      const resetUserAchievements: UserAchievement[] = Array.from(achievementDefinitions.values()).map(achievement => ({
        id: achievement.id,
        completionRate: 0,
        isAchieved: false,
        lastUpdated: new Date(),
      }));

      // cache도 함께 초기화 (팝업 시스템용)
      set({ 
        userAchievements: new Map(resetUserAchievements.map(ua => [ua.id, ua])),
        cache: new Map() // cache 초기화 추가
      });
      console.log('✅ 모든 업적 초기화 완료!');
    },

    // 팝업 시스템 액션들
    initOnAppStart: async () => {
      try {
        console.log('🚀 앱 시작 시 업적 시스템 초기화...');
        
        // 0. 개발 환경에서 Mock 데이터 초기화
        if (__DEV__) {
          initializeMockUserProgress();
        }
        
        // 1. 팝업 기록 로드
        const raw = await AsyncStorage.getItem(SHOWN_KEY);
        const ids = raw ? JSON.parse(raw) as number[] : [];
        set({ shown: new Set(ids) });

        // 2. 업적 정의 로드
        await get().loadAchievementDefinitions();

        // 3. 사용자 업적 상태 로드
        await get().loadUserAchievements();

        // 4. 첫 체크 실행 (1초 후)
        setTimeout(() => {
          get().scheduleCheck(400);
        }, 1000);
        
        console.log('✅ 앱 시작 시 업적 시스템 초기화 완료!');
      } catch (e) {
        console.error('❌ 앱 시작 시 업적 시스템 초기화 실패:', e);
        // 실패해도 치명적 아님
      }
    },

    loadAchievementDefinitions: async () => {
      try {
        const response = await fetchAchievements();
        const definitions = new Map<number, Achievement>();
        
        response.content.forEach(achievement => {
          definitions.set(achievement.id, achievement);
        });

        set({ achievementDefinitions: definitions });
        console.log('✅ 업적 정의 로드 완료:', definitions.size);
      } catch (error) {
        console.error('❌ 업적 정의 로드 실패:', error);
      }
    },

    loadUserAchievements: async (statusFilter: 'ALL' | 'ACHIEVED' | 'NOT_ACHIEVED' = 'ALL') => {
      try {
        const token = useAuthStore.getState().tokens?.accessToken;
        if (!token) {
          console.log('⚠️ 토큰이 없어서 사용자 업적을 로드할 수 없습니다.');
          return;
        }

        const response = await fetchMyAchievements(token, statusFilter);
        const userAchievements = new Map<number, UserAchievement>();
        
        response.content.forEach(achievement => {
          userAchievements.set(achievement.achievementId, {
            id: achievement.achievementId,
            completionRate: achievement.progress?.current || 0,
            isAchieved: achievement.isAchieved,
            achievedAt: achievement.achievedAt,
            lastUpdated: new Date(),
          });
        });

        set({ userAchievements });
        console.log('✅ 사용자 업적 로드 완료:', userAchievements.size);
      } catch (error) {
        console.error('❌ 사용자 업적 로드 실패:', error);
      }
    },

    loadAchievementDetail: async (achievementId: number) => {
      try {
        // 개발 환경에서는 관리자 토큰 없이도 조회 가능
        const adminToken = useAuthStore.getState().tokens?.accessToken || 'dev-token';
        
        const achievement = await fetchAchievementDetail(achievementId, adminToken);
        console.log('✅ 업적 상세 정보 로드 완료:', achievementId);
        return achievement;
      } catch (error) {
        console.error('❌ 업적 상세 정보 로드 실패:', error);
        return null;
      }
    },

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
        const { tokens } = useAuthStore.getState();
        if (!tokens?.accessToken) {
          console.log('❌ 토큰 없음, 업적 체크 스킵');
          return;
        }
        
        const { content } = await fetchMyAchievements(tokens.accessToken);
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
          // 달성된 업적을 팝업으로 표시 (이전 상태가 없거나 false → true 변화)
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
        // 네트워크 오류 등은 조용히 무시(다음 이벤트 때 다시 체크)
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

      // 팝업 표시
      showAchievementPopup(next, async () => {
        await get().markShown(next.achievementId);
        // 닫힌 뒤 다음
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
      // 서버가 활동/일기 응답에 방금 달성 업적들을 내려주는 경우 즉시 팝업
      if (!list || list.length === 0) return;
      console.log(`🎯 서버에서 즉시 알려준 업적 ${list.length}개 팝업 큐에 추가`);
      get()._enqueue(list);
    },

    resetShownAchievements: async () => {
      try {
        console.log('🔄 표시된 업적 기록 초기화 중...');
        
        // 메모리에서 초기화
        set({ shown: new Set() });
        
        // AsyncStorage에서 삭제
        await AsyncStorage.removeItem(SHOWN_KEY);
        
        console.log('✅ 표시된 업적 기록 초기화 완료!');
      } catch (e) {
        console.error('❌ 표시된 업적 기록 초기화 실패:', e);
      }
    },
  }))
);

/**
 * 팝업 띄우기 헬퍼: UI 레이어와 연결
 */
type PopupHandler = (a: MyAchievement, onClose: () => void) => void;
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
    // 핸들러가 없으면 잠시 후 재시도
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

function showAchievementPopup(a: MyAchievement, onClose: () => void) {
  if (_popupHandler) {
    _popupHandler(a, onClose);
  } else {
    console.warn('⚠️ 업적 팝업 핸들러가 연결되지 않음 - UI 컴포넌트가 아직 마운트되지 않았을 수 있습니다');
    // 핸들러가 없으면 바로 다음으로
    onClose();
  }
}
