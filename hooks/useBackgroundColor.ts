import { useEffect, useState } from 'react';
import { getColors } from 'react-native-image-colors';
import { Image, Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { colors } from '../constants/colors';


// 우측 상단 대표 컬러를 추출해 반환하는 훅
export function useTopRightColor(imageUri: string | null) {
  const [color, setColor] = useState<string>(colors.grayScale200);

  useEffect(() => {
    let cancelled = false;
    if (!imageUri) {
      setColor(colors.grayScale200);
      return;
    }
    (async () => {
      try {
        // ANDROID: 파일 크롭 → getColors 실패 이슈 우회. 원본 URL에서 팔레트만 추출
        let result: any;
        if (Platform.OS === 'android') {
          result = await getColors(imageUri, { fallback: colors.grayScale200, cache: true, key: `${imageUri}-android-palette` });
        } else {
          // iOS: 우측 상단 10% 영역을 크롭 후 색 추출
          const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            Image.getSize(imageUri, (w, h) => resolve({ width: w, height: h }), (err) => reject(err));
          });
          const cropW = Math.max(1, Math.floor(width * 0.1));
          const cropH = Math.max(1, Math.floor(height * 0.1));
          const cropRect = { originX: Math.max(0, width - cropW), originY: 0, width: cropW, height: cropH } as const;
          const cropResult = await ImageManipulator.manipulateAsync(
            imageUri,
            [{ crop: cropRect }],
            { compress: 1, format: ImageManipulator.SaveFormat.PNG }
          );
          const targetUri = cropResult.uri || imageUri;
          result = await getColors(targetUri, { fallback: colors.grayScale200, cache: true, key: `${imageUri}-topright` });
        }
        if (cancelled) return;

        let picked: string | undefined;
        if ((result as any).platform === 'ios') {
          // iOS: 배경 영역 판단 목적이므로 background 우선
          picked = (result as any).background || (result as any).primary || (result as any).secondary || (result as any).detail;
        } else if ((result as any).platform === 'android') {
          picked = (result as any).dominant || (result as any).vibrant || (result as any).average || (result as any).lightVibrant || (result as any).muted;
        } else {
          picked = (result as any).dominant || (result as any).background || (result as any).vibrant || (result as any).average;
        }
        setColor(picked || colors.grayScale200);
      } catch (e) {
        if (!cancelled) setColor(colors.grayScale200);
      }
    })();
    return () => { cancelled = true; };
  }, [imageUri]);

  return color;
}

// 우측 상단 대표 컬러의 명도를 판단하여 어두운지 여부를 반환하는 훅
export function useBgTopColor(imageUri: string | null) {
  const color = useTopRightColor(imageUri);
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    // YIQ 밝기 공식 기반 판단 (0~255 범위 사용)
    const hex = color.replace('#', '');
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2, 4), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4, 6), 16);
    // Y = 0.299R + 0.587G + 0.114B (≈ (299R + 587G + 114B)/1000)
    const yiq = (299 * r + 587 * g + 114 * b) / 1000;
    const nextIsDark = yiq < 128; // 임계값 128: 낮을수록 어두움 → true
    setIsDark(nextIsDark);
    // console.log('🌟 useBgTopColor', { color, yiq, isDark: nextIsDark });
  }, [color]);

  return isDark;
}


