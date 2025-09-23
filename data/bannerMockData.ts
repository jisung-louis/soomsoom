import { Banner } from '../types';

/**
 * 배너 Mock 데이터 (개발 환경용)
 */
export const bannerMockData: Banner[] = [
  {
    bannerId: 1,
    imageUrl: require('../assets/images/play/playBanner/default_banner_2.png'),
    activityType: 'MEDITATION',
    description: '깊은 잠을 위한\n이완명상',
    buttonText: '명상 하러가기',
    linkedActivityId: 1,
    displayOrder: 1,
  },
  {
    bannerId: 2,
    imageUrl: require('../assets/images/play/playBanner/background_image_default.png'),
    activityType: 'MEDITATION',
    description: '나를 돌아보는\n순간 건포도 명상',
    buttonText: '명상 하러가기',
    linkedActivityId: 2,
    displayOrder: 2,
  },
  {
    bannerId: 3,
    imageUrl: require('../assets/images/play/playBanner/background_image_default.png'),
    activityType: 'MEDITATION',
    description: '세번째 배너 설명',
    buttonText: '세번째 버튼',
    linkedActivityId: 3,
    displayOrder: 3,
  },
];
