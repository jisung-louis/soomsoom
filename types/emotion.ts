export type EmotionType = 'angry' | 'sad' | 'depressed' | 'soso' | 'good' | 'happy';

export interface EmotionRecord {
  id: string;
  userId: string;
  emotion: EmotionType;
  timestamp: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmotionRankingData {
  emotion: EmotionType;
  count: number;
  icon: React.ComponentType<any>;
  title: string;
  percentage: number;
}

export interface MonthlyEmotionStats {
  year: number;
  month: number;
  totalRecords: number;
  emotionDistribution: Record<EmotionType, number>;
  ranking: EmotionRankingData[];
}
