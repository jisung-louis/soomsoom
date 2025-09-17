import { useCallback } from 'react';
import { useCurrencyStore } from '../stores/currencyStore';
import { useRoomStore } from '../stores/roomStore';
import { usePlayStore } from '../stores/playStore';
import { useAchievementStore } from '../stores/achievementStore';
import { getUserPoints } from '../services/userService';
import { getOwnedItems } from '../services/itemService';
import { getUserFavoriteActivities } from '../services/contentService';
import { getFollowedInstructors } from '../services/instructorService';
import { getUserActivitySummary } from '../services/activityLogService';
import { useTodayMissionStore } from '../stores/todayMissionStore';

/**
 * 사용자 데이터 동기화 훅
 * 로그인 후 모든 사용자 관련 데이터를 한 번에 로드
 */
export const useUserDataSync = () => {
  const { setHeartPoints } = useCurrencyStore();
  const { setOwnedItems } = useRoomStore();
  const { setFavoritedActivities, setFollowedInstructors } = usePlayStore();
  const { loadUserAchievements } = useAchievementStore();
  const { refresh: refreshTodayMission } = useTodayMissionStore();

  const syncAllUserData = useCallback(async () => {
    try {
      console.log('🔄 사용자 데이터 전체 동기화 시작...');
      
      // 병렬로 모든 데이터 로드
      const [
        pointsResponse,
        ownedItemsResponse,
        favoriteActivitiesResponse,
        followedInstructorsResponse,
        activitySummaryResponse,
        achievementsResponse,
        todayMissionResponse
      ] = await Promise.allSettled([
        getUserPoints(), // 하트포인트 동기화
        getOwnedItems({ page: 1, size: 1000 }),
        getUserFavoriteActivities({ page: 1, size: 12, sort: 'createdAt,desc' }), // 즐겨찾기 액티비티 동기화
        getFollowedInstructors({ page: 1, size: 12, sort: 'createdAt,desc' }), // 팔로우한 강사 동기화
        getUserActivitySummary(), // 사용자 활동 요약 동기화
        loadUserAchievements(), // 업적 데이터 병렬 처리
        refreshTodayMission(),  // 오늘 미션 상태 병렬 처리
      ]);

      // 각 결과 처리
      if (pointsResponse.status === 'fulfilled') {
        setHeartPoints(pointsResponse.value.points);
        console.log('✅✔✅ 하트포인트 동기화 완료:', pointsResponse.value.points);
      }

      if (ownedItemsResponse.status === 'fulfilled') {
        const itemIds = ownedItemsResponse.value.content.map(item => item.id);
        setOwnedItems(itemIds);
        console.log('✅✔✅ 소유 아이템 동기화 완료:', itemIds.length, '♥️');
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

      console.log('🎉✔🎉 사용자 데이터 전체 동기화 완료!');
      
    } catch (error) {
      console.error('❌❌❌ 사용자 데이터 동기화 실패:', error);
      throw error;
    }
  }, [
    setHeartPoints,
    setOwnedItems,
    setFavoritedActivities,
    setFollowedInstructors,
    loadUserAchievements,
    refreshTodayMission,
  ]);

  return {
    syncAllUserData
  };
};
