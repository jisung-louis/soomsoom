import { Platform } from 'react-native';

// AdMob 광고 상수
export const AD_UNIT_IDS = {
  // iOS 광고 단위 ID (프로덕션용)
  iOS: {
    BANNER: 'ca-app-pub-4758709448782249/2360661061',
    REWARD_5_HEART: 'ca-app-pub-4758709448782249/5717753460',
    REWARD_10_HEART: 'ca-app-pub-4758709448782249/9283934708',
    REWARD_15_HEART: 'ca-app-pub-4758709448782249/4206373001',
    APP_ID: 'ca-app-pub-4758709448782249~5612676219',
  },
  // Android 광고 단위 ID (프로덕션용)
  Android: {
    BANNER: 'ca-app-pub-4758709448782249/8119566151',
    REWARD_5_HEART: 'ca-app-pub-4758709448782249/6806484489',
    REWARD_10_HEART: 'ca-app-pub-4758709448782249/1554157802',
    REWARD_15_HEART: 'ca-app-pub-4758709448782249/5024954366',
    APP_ID: 'ca-app-pub-4758709448782249~5979653821',
  },
  // 플랫폼별 자동 선택 (하위 호환성을 위한 헬퍼)
  get BANNER() {
    return Platform.OS === 'ios' ? this.iOS.BANNER : this.Android.BANNER;
  },
  get REWARD_5_HEART() {
    return Platform.OS === 'ios' ? this.iOS.REWARD_5_HEART : this.Android.REWARD_5_HEART;
  },
  get REWARD_10_HEART() {
    return Platform.OS === 'ios' ? this.iOS.REWARD_10_HEART : this.Android.REWARD_10_HEART;
  },
  get REWARD_15_HEART() {
    return Platform.OS === 'ios' ? this.iOS.REWARD_15_HEART : this.Android.REWARD_15_HEART;
  },
  get APP_ID() {
    return Platform.OS === 'ios' ? this.iOS.APP_ID : this.Android.APP_ID;
  },
} as const;

// 광고 크기 옵션
export const AD_SIZES = {
  BANNER: 'BANNER', // 320x50
  FULL_BANNER: 'FULL_BANNER', // 468x60
  LARGE_BANNER: 'LARGE_BANNER', // 320x100
  LEADERBOARD: 'LEADERBOARD', // 728x90
  MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE', // 300x250
  ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER', // dynamic (for full-width content) //이걸 사용하면 될듯?
  INLINE_ADAPTIVE_BANNER: 'INLINE_ADAPTIVE_BANNER', // dynamic (for scrolling content)
} as const;
