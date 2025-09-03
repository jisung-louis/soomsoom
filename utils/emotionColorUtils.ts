import { EmotionType } from '../types';
import { colors } from '../constants/colors';

/**
 * 순위에 따른 색상을 반환하는 유틸리티 함수
 * @param rank 순위 (0부터 시작, 0이 1등)
 * @returns 해당 순위에 매핑된 색상
 */
export const getRankColor = (rank: number) => {
  const colorPalette = [
    colors.primary300,  // 1등 (0번째)
    '#FFBB5C',         // 2등 (1번째)
    '#FFD293',         // 3등 (2번째)
    colors.primary200,  // 4등 (3번째)
    colors.primary100,  // 5등 (4번째)
    colors.primary50,   // 6등 (5번째)
  ];
  
  return colorPalette[rank] || colors.primary50;
};

/**
 * 감정 타입에 따른 색상을 반환하는 유틸리티 함수 (기존 호환성 유지)
 * @param emotion 감정 타입
 * @returns 해당 감정에 매핑된 색상
 * @deprecated 순위 기반 색상 사용을 권장합니다
 */
export const getEmotionColor = (emotion: EmotionType) => {
  switch (emotion) {
    case 'happy':
      return colors.primary300;
    case 'good':
      return '#FFBB5C';
    case 'soso':
      return '#FFD293';
    case 'depressed':
      return colors.primary200;
    case 'sad':
      return colors.primary100;
    case 'angry':
    default:
      return colors.primary50;
  }
};
