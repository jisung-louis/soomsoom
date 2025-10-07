import { sx, sy, ss, sv } from '../utils/scale';

// Z-Index 레이어 정의
export const zIndex = {
  // 고양이 관련
  cat: 100,
  shadow: 10,
  bubbleTalk: 100000,
  bubbleTalkInnerContainer: 1000000,

  // 장식 관련
  eyewear: 10000,
  hat: 1000,
  floor: 1,
  shelf: 10,
  frame: 10,

  //하트
  heart: 10,
};

// 아이템 위치 정의 (Figma 375x812 기준)
export const objectPosition = {
  // 고양이 관련
  cat: { x: sx(106), y: sy(339) },
  shadow: { x: sx(122), y: sy(501) },
  bubbleTalk: { x: sx(185), y: sy(209) },

  // 아이템 관련
  floor: { x: sx(41), y: sy(460) },
  shelf: { x: sx(225), y: sy(314) },
  frame: { x: sx(248), y: sy(262) },
  //frame1: { x: sx(308), y: sy(264) },
  eyewear: { x: sx(135), y: sy(356) },
  hat: { x: sx(122), y: sy(339) },
};

// 아이템 스타일 정의
export const itemStyles = {
  cat: {
    width: ss(200),
    height: sv(200),
    position: 'absolute' as const,
    top: objectPosition.cat.y,
    left: objectPosition.cat.x,
    zIndex: zIndex.cat,
  },
  hat: {
    width: ss(114),
    height: sv(52),
    position: 'absolute' as const,
    zIndex: zIndex.hat,
  },
  eyewear: {
    width: ss(80),
    height: sv(80),
    position: 'absolute' as const,
    zIndex: zIndex.eyewear,
  },
  bubbleTalk: {
    width: ss(140),
    height: sv(120),
    position: 'absolute' as const,
    zIndex: zIndex.bubbleTalk,
  },
  bubbleTalkInnerContainer: {
    position: 'absolute' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: zIndex.bubbleTalkInnerContainer,
  },
  floorContainer: {
    position: 'absolute' as const,
    zIndex: zIndex.floor,
  },
  floor: { //이거
    width: ss(294),
    height: sv(116),
  },
  shadowStyle: {
    position: 'absolute' as const,
    zIndex: zIndex.shadow,
    top: objectPosition.shadow.y,
    left: objectPosition.shadow.x,
  },
  shadowSize: {
    width: ss(130),
    height: sv(30),
  },
  shadowOpacity: 0.5,
  shadowColor: 'black',
  shelfContainer: {
    position: 'absolute' as const,
    zIndex: zIndex.shelf,
  },
  shelf: {
    width: ss(150),
    height: sv(30),
  },
  frameContainer: {
    position: 'absolute' as const,
    zIndex: zIndex.frame,
  },
  frame: {
    width: ss(54+4+54),
    height: sv(64),
  },
};
