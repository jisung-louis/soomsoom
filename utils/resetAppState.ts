import { usePlayStore } from '../stores/playStore';
import { useRoomStore } from '../stores/roomStore';
import { INITIAL_ROOM_STATE } from '../constants/initialStates';
import { useAchievementStore } from '../stores/achievementStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 초기화가 필요한 persist 키 목록 (필요 시 확장)
const PERSIST_KEYS = ['app_config'];

export async function resetAppState(): Promise<void> {
  try {
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

    // 4) 필요한 persist 캐시 정리 (토글 자체는 app_config에 저장되므로 삭제하지 않음)
    for (const key of PERSIST_KEYS) {
      // app_config는 유지
      if (key === 'app_config') continue;
      try { await AsyncStorage.removeItem(key); } catch {}
    }
  } catch (e) {
    // noop
  }
}


