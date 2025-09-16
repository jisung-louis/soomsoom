import { useEffect, useState } from 'react';
import { getColors } from 'react-native-image-colors';
import { Image, Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { colors } from '../constants/colors';

export function useBackgroundColor(imageUri: string | null) {
  const [backgroundColor, setBackgroundColor] = useState<string>(colors.grayScale200);

  useEffect(() => {
    let cancelled = false;
    if (!imageUri) {
      console.log('[useBackgroundColor] no imageUri, fallback grayScale200');
      setBackgroundColor(colors.grayScale200);
      return;
    }
    // start color extraction
    (async () => {
      try {
        // 1) 원본 이미지 크기 조회
        const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          Image.getSize(
            imageUri,
            (w, h) => resolve({ width: w, height: h }),
            (err) => reject(err)
          );
        });

        // 2) 하단 5% 영역 crop
        const cropHeight = Math.max(1, Math.floor(height * 0.05));
        const cropRect = { originX: 0, originY: Math.max(0, height - cropHeight), width, height: cropHeight } as const;
        const cropResult = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ crop: cropRect }],
          { compress: 1, format: ImageManipulator.SaveFormat.PNG }
        );

        const targetUri = cropResult.uri || imageUri;

        // 3) 색 추출 실행 (플랫폼별 키 처리)
        const result = await getColors(targetUri, { fallback: colors.grayScale200, cache: true, key: `${imageUri}-bottom5` });
        if (cancelled) return;
        let picked: string | undefined;
        if ((result as any).platform === 'ios') {
          // iOS: background/primary/secondary/detail 제공
          picked = (result as any).background || (result as any).primary || (result as any).secondary || (result as any).detail;
        } else if ((result as any).platform === 'android') {
          // Android: dominant/vibrant/average 등 제공
          picked = (result as any).dominant || (result as any).vibrant || (result as any).average || (result as any).lightVibrant || (result as any).muted;
        } else {
          // Web/기타
          picked = (result as any).dominant || (result as any).background || (result as any).vibrant || (result as any).average;
        }
        if (!picked) picked = colors.grayScale200;
        // done color extraction
        setBackgroundColor(picked);
      } catch (e) {
        // swallow errors and fallback
        if (!cancelled) setBackgroundColor(colors.grayScale200);
      }
    })();
    return () => { cancelled = true; };
  }, [imageUri]);

  return backgroundColor;
}


