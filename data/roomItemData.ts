// 개발용 임시 데이터
// 방 꾸미기 아이템 데이터
import { RoomItem, RoomItemPositionType } from '../types/room';

// 기존 RoomItem 타입을 재export (호환성 유지)
export type { RoomItem, RoomItemPositionType };


export const roomItemList: RoomItem[] = [
  {
    id: 1,
    type: '악세사리',
    title: '모스키토 선글라스',
    image: undefined,
    lottieJson: require('../assets/animations/item/eyewear/sunglass_motion.json'),
    price: 900,
    positionType: 'eyewear',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
    description: ['요즘 힙스터들 사이에서 유행이라던데...','어딘가 다소 힙해진 느낌이냥?'],
  },
  {
    id: 2,
    type: '장식품',
    title: '풍경 액자(산과 꽃)',
    image: require('../assets/icons/items/default-background/frame_default.png'),
    lottieJson: null,
    price: 300,
    positionType: 'frame',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
    description: ['처음 숨숨에 오신 것을 환영하는 의미로 드리는 기본 액자입니다.','이곳에서 좋은 추억을 많이 만드세요.'],
  },
  {
    id: 3,
    type: '장식품',
    title: '테스트 액자1',
    image: require('../assets/icons/items/default-background/frame_second.png'),
    lottieJson: null,
    price: 300,
    positionType: 'frame',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 4,
    type: '러그',
    title: '원형 러그(레드)',
    image: require('../assets/icons/items/default-background/carpet_default.png'),
    lottieJson: null,
    price: 300,
    positionType: 'floor',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
    description: ['따뜻하고, 부드럽다냥','엉덩이 놓이고 싶어지는.'],
  },
  {
    id: 5,
    type: '선반',
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
    price: 100,
    positionType: 'background',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
    description: ["따뜻하고 아늑한 기본 방", "편안한 휴식을 위한 공간"],
  },
  {
    id: 7,
    type: '악세사리',
    title: '스카우터',
    image: undefined,
    lottieJson: require('../assets/animations/item/eyewear/scouter.json'),
    price: 0,
    positionType: 'eyewear',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 8,
    type: '악세사리',
    title: '코주부 안경',
    image: undefined,
    lottieJson: require('../assets/animations/item/eyewear/cojubu.json'),
    price: 0,
    positionType: 'eyewear',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 9,
    type: '악세사리',
    title: '스노클',
    image: undefined,
    lottieJson: require('../assets/animations/item/eyewear/snorkel.json'),
    price: 0,
    positionType: 'eyewear',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 10,
    type: '악세사리',
    title: '파티클 선글라스',
    image: undefined,
    lottieJson: require('../assets/animations/item/eyewear/partyglass.json'),
    price: 0,
    positionType: 'eyewear',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 11,
    type: '악세사리',
    title: '픽셀 선글라스',
    image: undefined,
    lottieJson: require('../assets/animations/item/eyewear/pixel_sunglass.json'),
    price: 0,
    positionType: 'eyewear',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 12,
    type: '악세사리',
    title: '산타 얼굴과 수염',
    image: undefined,
    lottieJson: require('../assets/animations/item/eyewear/santaface_beard.json'),
    price: 200,
    positionType: 'eyewear',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 13,
    type: '모자',
    title: '예술가 모자',
    image: undefined,
    lottieJson: require('../assets/animations/item/hat/artist_hat.json'),
    price: 100,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
    description: ['창의적인 영감을 주는 모자','예술가의 감성을 담아보세요'],
  },
  {
    id: 14,
    type: '모자',
    title: '베레모',
    image: undefined,
    lottieJson: require('../assets/animations/item/hat/beret.json'),
    price: 300,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
    description: ['우아하고 세련된 베레모','프랑스의 로맨틱한 매력을 느껴보세요'],
  },
  {
    id: 15,
    type: '모자',
    title: '새',
    image: undefined,
    lottieJson: require('../assets/animations/item/hat/bird.json'),
    price: 300,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
    description: ['자유로운 새의 모자','하늘을 날아다니는 듯한 기분을 느껴보세요'],
  },
  {
    id: 16,
    type: '모자',
    title: '꽃 모자',
    image: undefined,
    lottieJson: require('../assets/animations/item/hat/flower_acc.json'),
    price: 0,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 17,
    type: '모자',
    title: '해적 모자',
    image: undefined,
    lottieJson: require('../assets/animations/item/hat/pirate_hat.json'),
    price: 0,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 18,
    type: '모자',
    title: '토끼 귀',
    image: undefined,
    lottieJson: require('../assets/animations/item/hat/rabbit.json'),
    price: 0,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 19,
    type: '모자',
    title: '리본',
    image: undefined,
    lottieJson: require('../assets/animations/item/hat/ribbon.json'),
    price: 100,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 20,
    type: '모자',
    title: '산타 모자',
    image: undefined,
    lottieJson: require('../assets/animations/item/hat/santa_hat.json'),
    price: 0,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 21,
    type: '모자',
    title: '여름 모자',
    image: undefined,
    lottieJson: require('../assets/animations/item/hat/summer_hat.json'),
    price: 0,
    positionType: 'hat',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
  {
    id: 22,
    type: '배경',
    title: '여름 바다 피크닉',
    image: require('../assets/images/backgrounds/beach.png'),
    lottieJson: null,
    price: 100,
    positionType: 'background',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
    description: ['냥냥 해변에 귀를 기울이면','거품 부서지는 소리가 들린다.'],
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
    description: ["가족이 모이는 따뜻한 추석", "전통의 아름다움을 느껴보세요"],
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
  {
    id: 25,
    type: '장식품',
    title: '테스트 액자2',
    image: require('../assets/images/backgrounds/default.png'),
    lottieJson: null,
    price: 0,
    positionType: 'frame',
    position: { x: 0, y: 0 }, // 동적으로 계산됨
  },
];

// positionType별 아이템 필터링 함수
export const getItemsByPositionType = (positionType: RoomItem['positionType']) => {
  return roomItemList.filter(item => item.positionType === positionType);
};

// 보유 중인 아이템 ID 리스트
export const IN_POSSESSION_ITEMS = [6];

// =============================
// 서버 스펙과 동일한 Item 타입 Mock
// =============================

// 서버 스펙 타입 정의(서비스와 동일하게 유지)
export type ItemType =
  | 'ACCESSORY'
  | 'HAT'
  | 'BACKGROUND'
  | 'FURNITURE'
  | 'SHELF'
  | 'FLOOR'
  | 'FRAME';

export type EquipSlot =
  | 'BACKGROUND'
  | 'EYEWEAR'
  | 'HAT'
  | 'FRAME'
  | 'FLOOR'
  | 'SHELF';

export type AcquisitionType = 'PURCHASE' | 'DEFAULT' | 'REWARD';

export interface ServerItem {
  id: number;
  name: string;
  description: string;
  phrase: string | null;
  itemType: ItemType;
  equipSlot: EquipSlot;
  acquisitionType: AcquisitionType;
  price: number;
  imageUrl: string | null;
  lottieUrl: string | null;
  isSoldOut: boolean;
  isOwned: boolean;
  isEquipped: boolean;
  createdAt: string;
  modifiedAt: string;
  deletedAt: string | null;
}

const equipSlotMap: Record<string, EquipSlot> = {
  eyewear: 'EYEWEAR',
  hat: 'HAT',
  background: 'BACKGROUND',
  frame: 'FRAME',
  floor: 'FLOOR',
  shelf: 'SHELF',
};
const itemTypeFromPosition: Record<string, ItemType> = {
  eyewear: 'ACCESSORY',
  hat: 'HAT',
  background: 'BACKGROUND',
  frame: 'FRAME',
  floor: 'FLOOR',
  shelf: 'SHELF',
};

function toServerItem(mock: RoomItem): ServerItem {
  const name = mock.title;
  const description = Array.isArray(mock.description)
    ? mock.description.join('\n')
    : (typeof (mock as any).description === 'string' ? (mock as any).description : '');
  return {
    id: mock.id,
    name,
    description,
    phrase: null,
    itemType: itemTypeFromPosition[mock.positionType] ?? 'FRAME',
    equipSlot: equipSlotMap[mock.positionType] ?? 'FRAME',
    acquisitionType: 'DEFAULT',
    price: mock.price ?? 0,
    imageUrl: mock.image ?? null,
    lottieUrl: mock.lottieJson ?? null,
    isSoldOut: false,
    isOwned: IN_POSSESSION_ITEMS.includes(mock.id),
    isEquipped: false,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    deletedAt: null,
  };
}

export const serverItemList: ServerItem[] = roomItemList.map(toServerItem);
