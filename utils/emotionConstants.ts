import { EmotionType } from '../types';

/**
 * 감정 관련 상수들
 * - 감정 제목
 * - 감정 우선순위 (동률 정렬용)
 * - 기타 감정 관련 상수
 */

// 감정 제목 (이미 iconMap.ts에 있지만 일관성을 위해 여기서도 관리)
export const emotionTitles: Record<EmotionType, string> = {
  happy: '행복해요!',
  good: '좋아요!',
  soso: '그냥 그래요!',
  depressed: '우울해요!',
  sad: '슬퍼요!',
  angry: '화나요!',
};

// 감정 우선순위 (동률일 경우의 정렬 순서)
// 낮은 숫자가 높은 우선순위
export const emotionPriority: Record<EmotionType, number> = {
  happy: 1,      // 가장 긍정적
  good: 2,
  soso: 3,       // 중립
  depressed: 4,
  sad: 5,
  angry: 6,      // 가장 부정적
};

// 감정을 제목으로 변환하는 헬퍼 함수
export const getEmotionTitle = (emotion: EmotionType): string => {
  return emotionTitles[emotion];
};

// 감정 우선순위로 정렬하는 헬퍼 함수
export const sortEmotionsByPriority = (a: EmotionType, b: EmotionType): number => {
  return emotionPriority[a] - emotionPriority[b];
};

// count와 우선순위를 모두 고려한 정렬 함수
export const sortEmotionsByCountAndPriority = <T extends { emotion: EmotionType; count: number }>(
  a: T,
  b: T
): number => {
  // 1순위: count 기준 내림차순
  if (b.count !== a.count) {
    return b.count - a.count;
  }
  // 2순위: count가 동일할 경우 감정 우선순위 순서
  return emotionPriority[a.emotion] - emotionPriority[b.emotion];
};
