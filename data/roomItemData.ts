// 방 꾸미기 아이템 데이터
export type RoomItem = {
  id: number;
  type: string;
  title: string;
  image: any;
  lottieJson: any;
  price?: number;
  positionType: 'face' | 'head' | 'picture' | 'furniture' | 'wall' | 'floor';
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
    case 'face':
      // 고양이 얼굴 주변에 배치
      return {
        x: catX + 29,
        y: catY + 17,
      };

    case 'head':
        return {
            x: catX + 29,
            y: catY - 17,
        };
    
    case 'picture':
      // 고양이 양옆에 액자 배치
      return {
        x: catX + 200,
        y: catY + 0,
      };
    
    case 'furniture':
      // 고양이 주변에 가구 배치
      return {
        x: catX + 100,
        y: catY + 60,
      };
    
    case 'wall':
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
    lottieJson: require('../assets/animations/sunglass_motion.json'),
    price: 900,
    positionType: 'face',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
    description: ['요즘 힙스터들 사이에서 유행이라던데...','어딘가 다소 힙해진 느낌이냥?'],
  },
  {
    id: 2,
    type: '가전 ・ 가구',
    title: '가전1',
    image: null,
    lottieJson: null,
    price: 300,
    positionType: 'furniture',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 3,
    type: '장식품',
    title: '장식품1',
    image: null,
    lottieJson: null,
    price: 300,
    positionType: 'picture',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 4,
    type: '벽지 ・ 바닥',
    title: '벽지1',
    image: null,
    lottieJson: null,
    price: 300,
    positionType: 'wall',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 5,
    type: '악세사리',
    title: '악세사리2',
    image: null,
    lottieJson: null,
    price: 300,
    positionType: 'face',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 6,
    type: '가전 ・ 가구',
    title: '가전2',
    image: null,
    lottieJson: null,
    price: 300,
    positionType: 'furniture',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 7,
    type: '장식품',
    title: '장식품2',
    image: null,
    lottieJson: null,
    positionType: 'picture',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 8,
    type: '벽지 ・ 바닥',
    title: '바닥1',
    image: null,
    lottieJson: null,
    positionType: 'floor',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 9,
    type: '악세사리',
    title: '악세사리3',
    image: null,
    lottieJson: null,
    price: 300,
    positionType: 'face',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 10,
    type: '악세사리',
    title: '모자1',
    image: null,
    lottieJson: null,
    price: 300,
    positionType: 'head',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
];

// positionType별 아이템 필터링 함수
export const getItemsByPositionType = (positionType: RoomItem['positionType']) => {
  return roomItemList.filter(item => item.positionType === positionType);
};

// 보유 중인 아이템 ID 리스트
export const IN_POSSESSION_ITEMS = [1, 7, 8];
