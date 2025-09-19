/**
 * 방 관련 공용 타입 정의
 * 
 * 🎯 왜 이렇게 하나요?
 * - 서비스, 스토어, 화면에서 모두 사용하는 타입을 한 곳에서 관리
 * - 타입 변경 시 한 곳만 수정하면 됨
 * - 네이밍 일관성 유지
 */

// 방 아이템 위치 타입
export type RoomItemPositionType = 
  | 'eyewear'    // 선글라스
  | 'hat'        // 모자
  | 'frame'      // 액자
  // | 'frame1'     // 액자1 (frame_1 → frame1)
  // | 'frame2'     // 액자2 (frame_2 → frame2)
  | 'background' // 배경
  | 'floor'      // 바닥
  | 'shelf';     // 선반

// 방 아이템 위치 정보
export interface Position {
  x: number;
  y: number;
}

// 배치된 아이템 정보
export interface PlacedItems {
  background: number | null;
  eyewear: number | null;
  hat: number | null;
  frame: number | null;
  // frame1: number | null;    // frame_1 → frame1
  // frame2: number | null;    // frame_2 → frame2
  floor: number | null;
  shelf: number | null;
}

//아이템 카테고리(type)
export type RoomItemCategory = '보유중' | '컬렉션' | '악세사리' | '모자' | '배경' | '러그' | '선반' | '장식품';

// 방 아이템 기본 정보
export interface RoomItem {
  id: number;
  type: RoomItemCategory;
  title: string;
  image: any;
  lottieJson: any;
  price?: number | null;
  positionType: RoomItemPositionType;
  position: Position;
  description?: string[];
}