/**
 * 숨숨 디자인 시스템 기반 타이포그래피 스타일
 * Heading 1~10, Body 1~5, Caption 1~3
 */
import { TextStyle } from 'react-native';
import * as Font from 'expo-font';
import { fontFamily } from '../utils/fontLoader';
import { colors } from './colors';

export const typography: { [key: string]: TextStyle } = {
  // Heading
  heading1: { fontSize: 32, fontWeight: '700', lineHeight: 32 * 1.3 }, // Bold
  heading2: { fontSize: 32, fontWeight: '500', lineHeight: 32 * 1.3 }, // Medium
  heading3: { fontSize: 28, fontWeight: '700', lineHeight: 28 * 1.3 },
  heading4: { fontSize: 28, fontWeight: '500', lineHeight: 28 * 1.3 },
  heading5: { fontSize: 24, fontWeight: '700', lineHeight: 24 * 1.3 },
  heading6: { fontSize: 24, fontWeight: '500', lineHeight: 24 * 1.3 },
  heading7: { fontSize: 20, fontWeight: '700', lineHeight: 20 * 1.3 },
  heading8: { fontSize: 20, fontWeight: '500', lineHeight: 20 * 1.3 },
  heading9: { fontSize: 18, fontWeight: '700', lineHeight: 18 * 1.3 },
  heading10: { fontSize: 18, fontWeight: '500', lineHeight: 18 * 1.3 },

  // Body
  body1: { fontSize: 16, fontWeight: '700', lineHeight: 16 * 1.3 },
  body2: { fontSize: 16, fontWeight: '500', lineHeight: 16 * 1.3 },
  body3: { fontSize: 16, fontWeight: '400', lineHeight: 16 * 1.3 },
  body4: { fontSize: 14, fontWeight: '700', lineHeight: 14 * 1.3 },
  body5: { fontSize: 14, fontWeight: '500', lineHeight: 14 * 1.3 },
  body6: { fontSize: 14, fontWeight: '400', lineHeight: 14 * 1.3 },

  // Caption
  caption1: { fontSize: 12, fontWeight: '700', lineHeight: 12 * 1.3 },
  caption2: { fontSize: 12, fontWeight: '500', lineHeight: 12 * 1.3 },
  caption3: { fontSize: 12, fontWeight: '400', lineHeight: 12 * 1.3 },
  caption4: { fontSize: 10, fontWeight: '700', lineHeight: 10 * 1.3 },
  caption5: { fontSize: 10, fontWeight: '500', lineHeight: 10 * 1.3 },
  caption6: { fontSize: 10, fontWeight: '400', lineHeight: 10 * 1.3 },
} as const;

// Cafe24Syongsyong 폰트 전용 타이포그래피
export const syongsyongTypography: { [key: string]: TextStyle } = {
  // Title
  title1: { 
    fontSize: 64, 
    lineHeight: 64, 
    fontFamily: fontFamily.syongsyong,
    textShadowColor: colors.grayScale900,
    textShadowOffset: { width: 0.3, height: 0.3 },
    textShadowRadius: 0,
    color: colors.grayScale900,
  },
  title2: { 
    fontSize: 32, 
    lineHeight: 32, 
    fontFamily: fontFamily.syongsyong,
    textShadowColor: colors.grayScale900,
    textShadowOffset: { width: 0.3, height: 0.3 },
    textShadowRadius: 0,
    color: colors.grayScale900,
  },
  title3: { 
    fontSize: 30, 
    lineHeight: 30, 
    fontFamily: fontFamily.syongsyong,
    textShadowColor: colors.grayScale900,
    textShadowOffset: { width: 0.3, height: 0.3 },
    textShadowRadius: 0,
    color: colors.grayScale900,
  },
  title4: { 
    fontSize: 26, 
    lineHeight: 26 * 1.1, 
    fontFamily: fontFamily.syongsyong,
    textShadowColor: colors.grayScale900,
    textShadowOffset: { width: 0.3, height: 0.3 },
    textShadowRadius: 0,
    color: colors.grayScale900,
  },
  title5: { 
    fontSize: 24, 
    lineHeight: 24 * 1.1, 
    fontFamily: fontFamily.syongsyong,
    textShadowColor: colors.grayScale900,
    textShadowOffset: { width: 0.3, height: 0.3 },
    textShadowRadius: 0,
    color: colors.grayScale900,
  },
  title6: { 
    fontSize: 20, 
    lineHeight: 20 * 1.3, 
    fontFamily: fontFamily.syongsyong,
    textShadowColor: colors.grayScale900,
    textShadowOffset: { width: 0.3, height: 0.3 },
    textShadowRadius: 0,
    color: colors.grayScale900,
  },
} as const;

export type TypographyKey = keyof typeof typography;
export type SyongsyongTypographyKey = keyof typeof syongsyongTypography; 