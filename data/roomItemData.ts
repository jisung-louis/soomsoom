// 방 꾸미기 아이템 데이터
export type RoomItem = {
  id: number;
  type: string;
  title: string;
  image: any;
  lottieJson: any;
  price?: number | null;
  positionType: 'eyewear' | 'hat' | 'frame_1' | 'frame_2' | 'background' | 'floor' | 'shelf';
  position: {
    x: number;
    y: number;
  };
  description?: string[];
};

// 고양이 기준 배치 영역 정의 (상대 위치)
export const getItemPosition = (catX: number, catY: number, positionType: string, index: number = 0) => {
  const baseRadius = 80; // 기본 반지름
  
  switch (positionType) {
    case 'eyewear':
      // 고양이 얼굴 주변에 배치
      return {
        x: catX + 29,
        y: catY + 17,
      };

    case 'hat':
        return {
            x: catX + 29,
            y: catY - 17,
        };
    
    case 'frame_1':
      // 고양이 양옆에 액자 배치
      return {
        x: catX + 200,
        y: catY + 0,
      };
    
    case 'frame_2':
      // 고양이 주변에 가구 배치
      return {
        x: catX + 100,
        y: catY + 60,
      };
    
    case 'shelf':
      // 고양이 주변에 가구 배치
      return {
        x: catX + 100,
        y: catY + 60,
      };
    
    case 'background':
      // 고양이 뒤쪽 벽면
      return {
        x: catX,
        y: catY - 120,
      };
    case 'floor':
      // 고양이 아래쪽 바닥
      return {
        x: catX,
        y: catY + 120,
      };
    
    default:
      return { x: catX, y: catY };
  }
};

export const roomItemList: RoomItem[] = [
  {
    id: 1,
    type: '악세사리',
    title: '모스키토 선글라스',
    image: null,
    lottieJson: require('../assets/animations/item/eyewear/sunglass_motion.json'),
    price: 900,
    positionType: 'eyewear',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
    description: ['요즘 힙스터들 사이에서 유행이라던데...','어딘가 다소 힙해진 느낌이냥?'],
  },
  {
    id: 2,
    type: '가구 ・ 장식품',
    title: '풍경 액자(산)',
    image: require('../assets/icons/items/default-background/frame_default_1.png'),
    lottieJson: null,
    price: 300,
    positionType: 'frame_1',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 3,
    type: '가구 ・ 장식품',
    title: '장미 액자',
    image: require('../assets/icons/items/default-background/frame_default_2.png'),
    lottieJson: null,
    price: 300,
    positionType: 'frame_2',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 4,
    type: '가구 ・ 장식품',
    title: '원형 러그(레드)',
    image: require('../assets/icons/items/default-background/carpet_default.png'),
    lottieJson: null,
    price: 300,
    positionType: 'floor',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 5,
    type: '가구 ・ 장식품',
    title: '기본 선반',
    image: require('../assets/icons/items/default-background/shelf_default.png'),
    lottieJson: null,
    price: 300,
    positionType: 'shelf',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 6,
    type: '배경',
    title: '기본 방',
    image: require('../assets/images/backgrounds/default.png'),
    lottieJson: null,
    price: 0,
    positionType: 'background',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 7,
    type: '악세사리',
    title: '스카우터',
    image: null,
    lottieJson: require('../assets/animations/item/eyewear/scouter.json'),
    price: 0,
    positionType: 'eyewear',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 8,
    type: '악세사리',
    title: '코주부 안경',
    image: null,
    lottieJson: require('../assets/animations/item/eyewear/cojubu.json'),
    price: 0,
    positionType: 'eyewear',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 9,
    type: '악세사리',
    title: '스노클',
    image: null,
    lottieJson: require('../assets/animations/item/eyewear/snorkel.json'),
    price: 0,
    positionType: 'eyewear',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 10,
    type: '악세사리',
    title: '파티클 선글라스',
    image: null,
    lottieJson: require('../assets/animations/item/eyewear/partyglass.json'),
    price: 0,
    positionType: 'eyewear',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 11,
    type: '악세사리',
    title: '픽셀 선글라스',
    image: null,
    lottieJson: require('../assets/animations/item/eyewear/pixel_sunglass.json'),
    price: 0,
    positionType: 'eyewear',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 12,
    type: '악세사리',
    title: '산타 얼굴과 수염',
    image: null,
    lottieJson: require('../assets/animations/item/eyewear/santaface_beard.json'),
    price: 0,
    positionType: 'eyewear',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 13,
    type: '모자',
    title: '예술가 모자',
    image: null,
    lottieJson: require('../assets/animations/item/hat/artist_hat.json'),
    price: 0,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 14,
    type: '모자',
    title: '베레모',
    image: null,
    lottieJson: require('../assets/animations/item/hat/beret.json'),
    price: 0,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 15,
    type: '모자',
    title: '새',
    image: null,
    lottieJson: require('../assets/animations/item/hat/bird.json'),
    price: 300,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 16,
    type: '모자',
    title: '꽃 모자',
    image: null,
    lottieJson: require('../assets/animations/item/hat/flower_acc.json'),
    price: 0,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 17,
    type: '모자',
    title: '해적 모자',
    image: null,
    lottieJson: require('../assets/animations/item/hat/pirate_hat.json'),
    price: 0,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 18,
    type: '모자',
    title: '토끼 귀',
    image: null,
    lottieJson: require('../assets/animations/item/hat/rabbit.json'),
    price: 0,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 19,
    type: '모자',
    title: '리본',
    image: null,
    lottieJson: require('../assets/animations/item/hat/ribbon.json'),
    price: 0,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 20,
    type: '모자',
    title: '산타 모자',
    image: null,
    lottieJson: require('../assets/animations/item/hat/santa_hat.json'),
    price: 0,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 21,
    type: '모자',
    title: '여름 모자',
    image: null,
    lottieJson: require('../assets/animations/item/hat/summer_hat.json'),
    price: 0,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 22,
    type: '배경',
    title: '여름 바닷가',
    image: require('../assets/images/backgrounds/beach.png'),
    lottieJson: null,
    price: 0,
    positionType: 'background',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 23,
    type: '배경',
    title: '추석',
    image: require('../assets/images/backgrounds/chuseok.png'),
    lottieJson: null,
    price: 200,
    positionType: 'background',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 24,
    type: '배경',
    title: '가을',
    image: require('../assets/images/backgrounds/autumn.png'),
    lottieJson: null,
    price: 0,
    positionType: 'background',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
];

// positionType별 아이템 필터링 함수
export const getItemsByPositionType = (positionType: RoomItem['positionType']) => {
  return roomItemList.filter(item => item.positionType === positionType);
};

// 보유 중인 아이템 ID 리스트
export const IN_POSSESSION_ITEMS = [1, 7, 8];
