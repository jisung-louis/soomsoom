import { useCurrencyStore } from '../stores/currencyStore';
import { useRoomStore } from '../stores/roomStore';
import { usePlayStore } from '../stores/playStore';
import { useAchievementStore } from '../stores/achievementStore';
import { getUserPoints } from '../services/userService';
import { getOwnedItems, getEquippedItems } from '../services/itemService';
import { getUserFavoriteActivities } from '../services/contentService';
import { getFollowedInstructors } from '../services/instructorService';
import { getUserActivitySummary } from '../services/activityLogService';
import { useTodayMissionStore } from '../stores/todayMissionStore';
import { useMailboxStore } from '../stores/mailboxStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotificationSettings } from '../services/notificationService';
import { scheduleDiaryNotification, clearAllNotifications } from '../utils/notificationUtils';
import * as Notifications from 'expo-notifications';

/**
 * 사용자 데이터 동기화 함수
 * 로그인 후 모든 사용자 관련 데이터를 한 번에 로드
 * 일반 함수로 export하여 Hook 규칙 위반 없이 사용 가능
 */
export const syncAllUserData = async () => {
  const { setHeartPoints } = useCurrencyStore.getState();
  const { setOwnedItems, updatePlacedItems } = useRoomStore.getState();
  const { setFavoritedActivities, setFollowedInstructors } = usePlayStore.getState();
  const { loadUserAchievements } = useAchievementStore.getState();
  const { refresh: refreshTodayMission } = useTodayMissionStore.getState();
  const { loadUnreadCount } = useMailboxStore.getState();

  try {
    console.log('🔄 사용자 데이터 전체 동기화 시작...');
    
    // 병렬로 모든 데이터 로드
    const [
      pointsResponse,
      ownedItemsResponse,
      equippedItemsResponse,
      favoriteActivitiesResponse,
      followedInstructorsResponse,
      activitySummaryResponse,
      achievementsResponse,
      todayMissionResponse,
      mailboxResponse,
      notificationSettingsResponse
    ] = await Promise.allSettled([
      getUserPoints(), // 하트포인트 동기화
      getOwnedItems({ page: 1, size: 1000 }),
      getEquippedItems(), // 장착 아이템 동기화
      getUserFavoriteActivities({ page: 1, size: 12, sort: 'createdAt,desc' }), // 즐겨찾기 액티비티 동기화
      getFollowedInstructors({ page: 1, size: 12, sort: 'createdAt,desc' }), // 팔로우한 강사 동기화
      getUserActivitySummary(), // 사용자 활동 요약 동기화
      loadUserAchievements(), // 업적 데이터 병렬 처리
      refreshTodayMission(),  // 오늘 미션 상태 병렬 처리
      loadUnreadCount(), // 안 읽은 메일 개수 동기화
      getNotificationSettings(), // 내 알림 설정 동기화
    ]);

    // 각 결과 처리
    if (pointsResponse.status === 'fulfilled') {
      setHeartPoints(pointsResponse.value.points);
      console.log('✅✔✅ 하트포인트 동기화 완료:', pointsResponse.value.points, '♥️');
    }

    if (ownedItemsResponse.status === 'fulfilled') {
      const itemIds = ownedItemsResponse.value.content.map(item => item.id);
      setOwnedItems(itemIds);
      console.log('✅✔✅ 소유 아이템 동기화 완료:', itemIds.length);
    }

    if (equippedItemsResponse.status === 'fulfilled') {
      const equippedItems = equippedItemsResponse.value;
      const placedItems = {
        background: equippedItems.background?.id || null,
        floor: equippedItems.floor?.id || null,
        frame: equippedItems.frame?.id || null,
        shelf: equippedItems.shelf?.id || null,
        hat: equippedItems.hat?.id || null,
        eyewear: equippedItems.eyewear?.id || null,
      };
      updatePlacedItems(placedItems);
      console.log('✅✔✅ 장착 아이템 동기화 완료:', placedItems);
    }

    if (favoriteActivitiesResponse.status === 'fulfilled') {
      const favoriteActivities = favoriteActivitiesResponse.value.content.map(fav => ({ activityId: fav.activityId }));
      setFavoritedActivities(favoriteActivities);
      console.log('✅✔✅ 즐겨찾기 액티비티 동기화 완료:', favoriteActivities.length, '개');
    }

    if (followedInstructorsResponse.status === 'fulfilled') {
      const followedInstructors = followedInstructorsResponse.value.content.map(inst => ({ instructorId: inst.instructorId }));
      setFollowedInstructors(followedInstructors);
      console.log('✅✔✅ 팔로우한 강사 동기화 완료:', followedInstructors.length, '개');
    }

    if (activitySummaryResponse.status === 'fulfilled') {
      console.log('✅✔✅ 사용자 활동 요약 동기화 완료:', activitySummaryResponse.value);
    }

    if (achievementsResponse.status === 'fulfilled') {
      console.log('✅✔✅ 업적 데이터 동기화 완료');
    } else if (achievementsResponse.status === 'rejected') {
      console.warn('⚠️ 업적 데이터 동기화 실패:', achievementsResponse.reason);
    }

    if (todayMissionResponse.status === 'fulfilled') {
      console.log('✅✔✅ 오늘 미션 상태 동기화 완료');
    } else if (todayMissionResponse.status === 'rejected') {
      console.warn('⚠️ 오늘 미션 상태 동기화 실패:', todayMissionResponse.reason);
    }

    if (mailboxResponse.status === 'fulfilled') {
      console.log('✅✔✅ 안 읽은 메일 개수 동기화 완료');
    } else if (mailboxResponse.status === 'rejected') {
      console.warn('⚠️ 안 읽은 메일 개수 동기화 실패:', mailboxResponse.reason);
    }

    // 알림 설정 반영
    if (notificationSettingsResponse.status === 'fulfilled') {
      const s = notificationSettingsResponse.value;
      await AsyncStorage.setItem('diaryNotificationEnabled', String(!!s.diaryNotificationEnabled));
      await AsyncStorage.setItem('greetingNotificationEnabled', String(!!s.reEngagementNotificationEnabled));
      await AsyncStorage.setItem('newsNotificationEnabled', String(!!s.soomsoomNewsNotificationEnabled));
      // 서버 시간이 존재하면 스케줄 반영
      if (s.diaryNotificationEnabled && s.diaryNotificationTime) {
        // 서버 시간(HH:mm:ss) → 표시 문자열(오전/오후 h:mm)
        const [HH, mm] = s.diaryNotificationTime.split(':');
        const hourNum = Number(HH);
        const period = hourNum >= 12 ? '오후' : '오전';
        const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
        const display = `${period} ${hour12}:${mm}`;
        await AsyncStorage.setItem('diaryNotificationTime', display);
        // 앱 부팅 시에는 권한이 이미 허용된 경우에만 스케줄링 (권한 요청 금지)
        try {
          const { status } = await Notifications.getPermissionsAsync();
          if (status === 'granted') {
            await scheduleDiaryNotification(display);
          } else {
            console.log('🔕 알림 권한 비허용 상태 - 부팅 동기화에서는 스케줄링 생략');
          }
        } catch (permError) {
          console.warn('알림 권한 확인 실패(무시):', permError);
        }
      }
    }

    console.log('🎉✔🎉 사용자 데이터 전체 동기화 완료!');
  } catch (error) {
    console.error('❌ 사용자 데이터 동기화 실패:', error);
  }
};

