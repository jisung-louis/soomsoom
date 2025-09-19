import { usePlayStore } from '../stores/playStore';
import { useRoomStore } from '../stores/roomStore';
import { INITIAL_ROOM_STATE } from '../constants/initialStates';
import { useAchievementStore } from '../stores/achievementStore';
import { useCurrencyStore } from '../stores/currencyStore';
import { useActivityHistoryStore } from '../stores/activityHistoryStore';
import { useCartStore } from '../stores/cartStore';
import { useAlarmStore } from '../stores/alarmStore';
import { useHomeTimeLogStore } from '../stores/homeTimeLogStore';
import { useTodayMissionStore } from '../stores/todayMissionStore';
import { useAuthStore } from '../stores/authStore';
import { INITIAL_CURRENCY_STATE } from '../constants/initialStates';
import { cancelAllScheduledNotifications } from '../services/alarmNotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 초기화가 필요한 persist 키 목록 (필요 시 확장)
const PERSIST_KEYS = [
  'app_config',           // 앱 설정 (유지)
  'auth',                 // 인증 토큰 (초기화)
  'currency-storage',     // 화폐 데이터 (초기화)
  'activity-history-storage', // 액티비티 기록 (초기화)
  'play-storage',         // 즐겨찾기/팔로우 (초기화)
];

export async function resetAppState(clearAuth: boolean = false): Promise<void> {
  try {
    // 0) 인증 상태 초기화 (선택적)
    if (clearAuth) {
      useAuthStore.getState().logout();
      console.log('🔐 인증 상태 초기화 완료');
    }

    // 1) 즐겨찾기/팔로우 등 플레이 상태 초기화
    usePlayStore.setState({ favoriteActivities: [], followedInstructors: [] } as any);

    // 2) 방 아이템 상태 초기화 (구조 유지)
    useRoomStore.setState({
      ownedItems: [],
      placedItems: INITIAL_ROOM_STATE.placedItems,
      selectedItems: INITIAL_ROOM_STATE.selectedItems,
      frameReplacementIndex: 0,
    } as any);

    // 3) 업적 팝업/캐시 초기화
    const ach = useAchievementStore.getState();
    try {
      await ach.resetShownAchievements();
    } catch {}
    useAchievementStore.setState({
      userAchievements: new Map(),
      cache: new Map(),
      popupQueue: [],
      isPopupOpen: false,
      _checkTimer: null,
    } as any);

    // 4) 화폐 상태 초기화
    useCurrencyStore.setState({
      heartPoints: INITIAL_CURRENCY_STATE.heartPoints,
    });

    // 5) 액티비티 기록 초기화
    useActivityHistoryStore.getState().clearHistory();

    // 6) 장바구니 초기화
    useCartStore.getState().clearCart();

    // 7) 알람 설정 초기화 (스케줄된 알림도 모두 취소)
    try {
      // 모든 스케줄된 알림 취소 (더 효율적)
      await cancelAllScheduledNotifications();
    } catch (error) {
      console.warn('⚠️ 모든 알림 취소 중 에러:', error);
    }
    // 알람 store 초기화
    useAlarmStore.setState({ alarmList: [] });

    // 8) 홈 체류시간 로그 초기화
    useHomeTimeLogStore.getState().reset();

    // 9) 오늘 미션 상태 초기화
    try {
      useTodayMissionStore.getState().clear();
    } catch {}

    // 10) 필요한 persist 캐시 정리
    for (const key of PERSIST_KEYS) {
      // app_config는 유지 (앱 전체 설정)
      if (key === 'app_config') continue;
      try { 
        await AsyncStorage.removeItem(key);
        console.log(`🗑️ Persist 캐시 삭제: ${key}`);
      } catch (e) {
        console.warn(`⚠️ Persist 캐시 삭제 실패: ${key}`, e);
      }
    }
  } catch (e) {
    // noop
  }
}


