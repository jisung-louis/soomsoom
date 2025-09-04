import { EmotionType } from '../types';
import { characterIconMap, characterTitleMap } from '../utils/iconMap';

/**
 * 감정 관련 유틸리티 서비스
 * 감정 타입 변환, 유효성 검사 등 헬퍼 함수들을 담당
 */

export const emotionService = {
  // 감정 타입을 한국어 제목으로 변환
  getEmotionTitle: (emotion: EmotionType): string => {
    return characterTitleMap.active[emotion];
  },

  // 감정 타입을 아이콘으로 변환
  getEmotionIcon: (emotion: EmotionType) => {
    return characterIconMap.active[emotion];
  },

  // 감정 타입 유효성 검사
  isValidEmotion: (emotion: string): emotion is EmotionType => {
    const validEmotions: EmotionType[] = ['happy', 'good', 'soso', 'depressed', 'sad', 'angry'];
    return validEmotions.includes(emotion as EmotionType);
  },

  // 감정 타입 배열 반환
  getAllEmotionTypes: (): EmotionType[] => {
    return ['happy', 'good', 'soso', 'depressed', 'sad', 'angry'];
  },

  // 감정 데이터 포맷팅 (필요시 확장)
  formatEmotionData: (emotion: EmotionType, count: number, total: number) => {
    const percentage = total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0;
    return {
      emotion,
      count,
      percentage,
      title: characterTitleMap.active[emotion],
      icon: characterIconMap.active[emotion],
    };
  },
};