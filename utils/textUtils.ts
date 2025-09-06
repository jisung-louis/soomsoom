/**
 * 텍스트 관련 유틸리티 함수들
 */

/**
 * 제목에서 특정 구분자를 찾아서 자동 줄바꿈을 해주는 함수
 * @param title - 줄바꿈을 적용할 제목 문자열
 * @returns 줄바꿈이 적용된 제목 문자열
 */
export const titleLineBreaker = (title: string): string => {
  // ', '와 '! '를 찾아서 줄바꿈으로 변경
  return title
    .replace(/, /g, ',\n')
    .replace(/! /g, '!\n');
};

/**
 * 이미지 소스를 정규화하는 함수
 * @param imageSource - 정규화할 이미지 소스
 * @returns 정규화된 이미지 소스
 */
export const normalizeImageSource = (imageSource?: any) => {
  if (!imageSource) {
    return 'http://placehold.co/105x105';
  }
  
  if (typeof imageSource === 'number') {
    // require()로 가져온 로컬 이미지
    return imageSource;
  }
  
  if (typeof imageSource === 'string') {
    // URL 문자열
    return { uri: imageSource };
  }
  
  if (imageSource && typeof imageSource === 'object' && imageSource.uri) {
    // 이미 { uri: string } 형태
    return imageSource;
  }
  
  // 기본 이미지 반환
  return 'http://placehold.co/105x105';
};
