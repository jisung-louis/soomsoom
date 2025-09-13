/**
 * 배너 관련 타입 정의
 */

export interface Banner {
  bannerId: number;
  imageUrl: string | any; // string (URL) 또는 require() 결과
  activityType: 'MEDITATION' | 'BREATHING' | 'SLEEP' | 'FOCUS';
  description: string;
  buttonText: string;
  linkedActivityId: number;
  displayOrder: number;
}

export interface GetBannersResponse extends Array<Banner> {}
