export * from './emotion';
export * from './room';
// svg.d.ts는 타입 선언 병합 파일로, 재수출 대상이 아닙니다.

// 업적 관련 타입
export type AchievementGrade = 'BRONZE' | 'SILVER' | 'GOLD' | 'SPECIAL';
export type AchievementCategory = 'DIARY' | 'MEDITATION' | 'BREATHING' | 'HIDDEN';

export type MyAchievement = {
  achievementId: number;
  name: string;
  description?: string;
  phrase?: string | null;
  grade: AchievementGrade;
  category: AchievementCategory;
  isAchieved: boolean;
  achievedAt?: string | null;
  progress?: { current: number; target: number } | null;
};

export type PagedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type Achievement = {
  id: number;
  name: string;
  description: string;
  phrase?: string | null;
  grade: AchievementGrade;
  category: AchievementCategory;
  rewardPoints?: number | null;
  rewardItemId?: number | null;
  conditions: AchievementCondition[];
};

export type AchievementCondition = {
  id: number;
  type: string;
  targetValue: number;
};

