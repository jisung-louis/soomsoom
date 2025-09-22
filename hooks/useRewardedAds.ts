import { useEffect } from 'react';
import { useRewardedAdStore } from '../stores/rewardedAdStore';

/**
 * 보상형 광고 관련 커스텀 훅
 */
export const useRewardedAds = () => {
  const { ads, isLoading, lastUpdated, loadAds, markAsWatched } = useRewardedAdStore();
  
  // 컴포넌트 마운트 시 광고 목록 로드
  useEffect(() => {
    loadAds();
  }, [loadAds]);
  
  // 오늘 시청 가능한 광고 필터링
  const availableAds = ads.filter(ad => !ad.watchedToday);
  const watchedAds = ads.filter(ad => ad.watchedToday);
  
  return {
    ads,
    availableAds,
    watchedAds,
    isLoading,
    lastUpdated,
    loadAds,
    markAsWatched,
  };
};

