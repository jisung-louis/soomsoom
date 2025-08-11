import * as Font from 'expo-font';

export const loadFonts = async () => {
  await Font.loadAsync({
    'Cafe24Syongsyong': require('../assets/fonts/Cafe24Syongsyong-v2.0.ttf'),
  });
};

export const fontFamily = {
  syongsyong: 'Cafe24Syongsyong',
} as const;
