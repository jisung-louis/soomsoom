/**
 * 방 관련 공용 타입 정의
 * 
 * 🎯 왜 이렇게 하나요?
 * - 서비스, 스토어, 화면에서 모두 사용하는 타입을 한 곳에서 관리
 * - 타입 변경 시 한 곳만 수정하면 됨
 * - 네이밍 일관성 유지 (camelCase 통일)
 */

// 방 아이템 위치 타입 (camelCase로 통일)
export type RoomItemPositionType = 
  | 'eyewear'    // 선글라스
  | 'hat'        // 모자
  | 'frame1'     // 액자1 (frame_1 → frame1)
  | 'frame2'     // 액자2 (frame_2 → frame2)
  | 'background' // 배경
  | 'floor'      // 바닥
  | 'shelf';     // 선반

// 방 아이템 위치 정보
export interface Position {
  x: number;
  y: number;
}

// 배치된 아이템 정보 (camelCase로 통일)
export interface PlacedItems {
  background: number | null;
  eyewear: number | null;
  hat: number | null;
  frame1: number | null;    // frame_1 → frame1
  frame2: number | null;    // frame_2 → frame2
  floor: number | null;
  shelf: number | null;
}

// 방 아이템 기본 정보
export interface RoomItem {
  id: number;
  type: string;
  title: string;
  image: any;
  lottieJson: any;
  price?: number | null;
  positionType: RoomItemPositionType;
  position: Position;
  description?: string[];
}

// API 응답용 배치 아이템 (서버에서 오는 스네이크 케이스)
export interface ApiPlacedItems {
  background: number | null;
  eyewear: number | null;
  hat: number | null;
  frame_1: number | null;   // 서버는 스네이크 케이스 사용
  frame_2: number | null;   // 서버는 스네이크 케이스 사용
  floor: number | null;
  shelf: number | null;
}

/**
 * API 응답을 프론트엔드 타입으로 변환하는 유틸리티 함수
 */
export function mapPlacedItemsFromApi(apiItems: ApiPlacedItems): PlacedItems {
  return {
    background: apiItems.background,
    eyewear: apiItems.eyewear,
    hat: apiItems.hat,
    frame1: apiItems.frame_1,    // frame_1 → frame1
    frame2: apiItems.frame_2,    // frame_2 → frame2
    floor: apiItems.floor,
    shelf: apiItems.shelf,
  };
}

/**
 * 프론트엔드 타입을 API 요청용으로 변환하는 유틸리티 함수
 */
export function mapPlacedItemsToApi(items: PlacedItems): ApiPlacedItems {
  return {
    background: items.background,
    eyewear: items.eyewear,
    hat: items.hat,
    frame_1: items.frame1,    // frame1 → frame_1
    frame_2: items.frame2,    // frame2 → frame_2
    floor: items.floor,
    shelf: items.shelf,
  };
}
