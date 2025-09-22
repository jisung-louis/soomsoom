import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getRewardedAds, RewardedAd } from '../services/rewardedAdService';

interface RewardedAdState {
  ads: RewardedAd[];
  isLoading: boolean;
  lastUpdated: Date | null;
  
  // Actions
  setAds: (ads: RewardedAd[]) => void;
  loadAds: () => Promise<void>;
  clearAds: () => void;
  markAsWatched: (adId: number) => void;
}

export const useRewardedAdStore = create<RewardedAdState>()(
  devtools(
    (set, get) => ({
      ads: [],
      isLoading: false,
      lastUpdated: null,
      
      setAds: (ads) => {
        set({ ads, lastUpdated: new Date() });
        console.log('📺 보상형 광고 목록 설정:', ads.length, '개');
      },
      
      loadAds: async () => {
        const { isLoading } = get();
        if (isLoading) return;
        
        try {
          set({ isLoading: true });
          console.log('📺 보상형 광고 목록 로드 시작...');
          
          const ads = await getRewardedAds();
          
          set({ 
            ads, 
            isLoading: false, 
            lastUpdated: new Date() 
          });
          
          console.log('✅ 보상형 광고 목록 로드 완료:', ads.length, '개');
        } catch (error) {
          console.error('❌ 보상형 광고 목록 로드 실패:', error);
          set({ isLoading: false });
        }
      },
      
      clearAds: () => {
        set({ ads: [], lastUpdated: null });
        console.log('📺 보상형 광고 목록 초기화');
      },
      
      markAsWatched: (adId) => {
        const { ads } = get();
        const updatedAds = ads.map(ad => 
          ad.id === adId ? { ...ad, watchedToday: true } : ad
        );
        set({ ads: updatedAds });
        console.log('📺 광고 시청 완료 처리:', adId);
      },
    }),
    {
      name: 'rewarded-ad-store',
    }
  )
);

