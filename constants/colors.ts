/**
 * Figma 색상 시스템을 기반으로 한 색상 상수
 * Primary: 100-600
 * GrayScale: 50-900
 * Basic: white, black
 */

export const colors = {
  // GrayScale Colors
  grayScale50: '#F8F9F9',
  grayScale100: '#F0F2F4',
  grayScale200: '#CED4DA',
  grayScale300: '#B9BFC4',
  grayScale400: '#A5AAAE',
  grayScale500: '#9B9FA4',
  grayScale600: '#7C7F83',
  grayScale700: '#5D5F62',
  grayScale800: '#484A4C',
  grayScale900: '#242526',

  // Basic Colors
  white: '#FFFFFF',
  black: '#000000',
  backgroundFill: '#E8C295',

  // Primary Colors
  primary50: '#FFF7EB',
  primary100: '#FFF2E0',
  primary200: '#FFE5C0',
  primary300: '#FFAA33',
  primary400: '#E6992E',
  primary500: '#CC8829',
  primary600: '#BF8026',
  primary700: '#99661F',
  primary800: '#734C17',
  primary900: '#593B12'
} as const;

// 타입 정의
export type ColorKey = keyof typeof colors; 