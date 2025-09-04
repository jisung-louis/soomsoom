import { EmotionType } from '../types';

// 백엔드 감정 enum (사양 기준)
export type BackendEmotion =
  | 'HAPPINESS'
  | 'JOY'
  | 'NEUTRAL'
  | 'DEPRESSION'
  | 'SADNESS'
  | 'ANGER';

export const frontendToBackendEmotion: Record<EmotionType, BackendEmotion> = {
  happy: 'HAPPINESS',
  good: 'JOY',
  soso: 'NEUTRAL',
  depressed: 'DEPRESSION',
  sad: 'SADNESS',
  angry: 'ANGER',
};

export const backendToFrontendEmotion: Record<BackendEmotion, EmotionType> = {
  HAPPINESS: 'happy',
  JOY: 'good',
  NEUTRAL: 'soso',
  DEPRESSION: 'depressed',
  SADNESS: 'sad',
  ANGER: 'angry',
};

export const toBackendEmotion = (emotion: EmotionType): BackendEmotion =>
  frontendToBackendEmotion[emotion];

export const toFrontendEmotion = (emotion: BackendEmotion): EmotionType =>
  backendToFrontendEmotion[emotion];


