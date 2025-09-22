import React, { useEffect, useState } from 'react';
import { MyAchievement, AchievementGrade } from '../../../types';
import { bindAchievementPopupHandler, navigateToAchievements } from '../../../stores/achievementStore';
import CustomAlert from '../alert/CustomAlert';

// 팝업 타입 정의
export type PopupType = 'achievement' | 'reward_heart' | 'reward_item' | 'mailbox' | 'alarm' | 'generic';

// 팝업 데이터 인터페이스
export interface PopupData {
  type: PopupType;
  title: string;
  message: string;
  subMessage?: string;
  image?: any; // Lottie 애니메이션 또는 이미지
  buttons?: Array<{
    text: string;
    onPress: () => void;
  }>;
  onClose?: () => void;
}

// 업적 팝업 데이터 인터페이스 (기존 호환성)
export interface AchievementPopupData extends PopupData {
  type: 'achievement';
  achievement: MyAchievement;
}

// 팝업 핸들러 타입
export type PopupHandler = (data: PopupData, onClose: () => void) => void;

// 업적 애니메이션 매핑
const animByGrade: Record<AchievementGrade, any> = {
  BRONZE: require('../../../assets/animations/badge/bronze_action.json'),
  SILVER: require('../../../assets/animations/badge/silver_action.json'),
  GOLD: require('../../../assets/animations/badge/gold_action.json'),
  SPECIAL: require('../../../assets/animations/badge/hidden_action.json'),
};

// 범용 팝업 컴포넌트
export default function UniversalPopup() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<PopupData | null>(null);
  const [onCloseCb, setOnCloseCb] = useState<(() => void) | null>(null);

  useEffect(() => {
    // 범용 팝업 핸들러 등록
    bindUniversalPopupHandler((popupData, onClose) => {
      console.log('🎭 범용 팝업 표시 요청:', popupData.type, popupData.title);
      setData(popupData);
      setOnCloseCb(() => onClose);
      setOpen(true);
    });

    // 업적 팝업 핸들러 (기존 호환성)
    bindAchievementPopupHandler((achievement, onClose) => {
      console.log('🎭 업적 팝업 표시 요청:', achievement.name);
      
      const popupData: AchievementPopupData = {
        type: 'achievement',
        title: '새로운 업적을 달성했어요!',
        message: '새로운 업적을 달성했어요!',
        subMessage: `'${achievement.name}' 업적 달성!`,
        image: animByGrade[achievement.grade],
        buttons: [
          {
            text: '닫기',
            onPress: () => {},
          },
          {
            text: '업적 확인하기',
            onPress: () => {
              navigateToAchievements();
            },
          }
        ],
        achievement,
      };
      
      setData(popupData);
      setOnCloseCb(() => onClose);
      setOpen(true);
    });
  }, []);

  const close = () => {
    console.log('🎭 팝업 닫기');
    setOpen(false);
    if (onCloseCb) {
      onCloseCb();
    }
    if (data?.onClose) {
      data.onClose();
    }
  };

  if (!data) return null;

  return (
    <CustomAlert
      visible={open}
      image={data.image}
      message={data.message}
      subMessage={data.subMessage}
      buttons={(data.buttons || [
        { text: '닫기', onPress: () => {} }
      ]).map((btn) => ({
        ...btn,
        onPress: () => {
          try { btn.onPress && btn.onPress(); } finally { close(); }
        }
      }))}
      onClose={close}
    />
  );
}


// 범용 팝업 핸들러 시스템
let _universalPopupHandler: PopupHandler | null = null;

export function bindUniversalPopupHandler(handler: PopupHandler) {
  _universalPopupHandler = handler;
  console.log('🔗 범용 팝업 핸들러 연결됨');
}

export function showUniversalPopup(data: PopupData, onClose?: () => void) {
  if (_universalPopupHandler) {
    _universalPopupHandler(data, onClose || (() => {}));
  } else {
    console.warn('⚠️ 범용 팝업 핸들러가 연결되지 않음 - UI 컴포넌트가 아직 마운트되지 않았을 수 있습니다');
    if (onClose) onClose();
  }
}

// Push notification type별 팝업 생성 헬퍼 함수들
export function createAchievementPopup(achievement: MyAchievement): PopupData {
  return {
    type: 'achievement',
    title: '새로운 업적을 달성했어요!',
    message: '새로운 업적을 달성했어요!',
    subMessage: `'${achievement.name}' 업적 달성!`,
    image: animByGrade[achievement.grade],
    buttons: [
      {
        text: '닫기',
        onPress: () => {},
      },
      {
        text: '업적 확인하기',
        onPress: () => navigateToAchievements(),
      }
    ],
  };
}

export function createHeartRewardPopup(amount: number): PopupData {
  return {
    type: 'reward_heart',
    title: '하트 포인트 획득!',
    message: `${amount}개의 하트 포인트를 획득했어요!`,
    subMessage: '계속해서 감정을 기록해보세요 💝',
    // TODO: 하트 포인트 애니메이션 추가
    buttons: [
      {
        text: '확인',
        onPress: () => {},
      }
    ],
  };
}

export function createItemRewardPopup(itemName: string): PopupData {
  return {
    type: 'reward_item',
    title: '새로운 아이템 획득!',
    message: `'${itemName}' 아이템을 획득했어요!`,
    subMessage: '내 방에서 확인해보세요 🎁',
    // TODO: 아이템 획득 애니메이션 추가
    buttons: [
      {
        text: '확인',
        onPress: () => {},
      },
      {
        text: '내 방 가기',
        onPress: () => {
          // TODO: 내 방으로 네비게이션
        },
      }
    ],
  };
}

export function createGenericPopup(title: string, message: string, subMessage?: string): PopupData {
  return {
    type: 'generic',
    title,
    message,
    subMessage,
    // 버튼을 지정하지 않으면 기본 닫기 버튼이 자동 주입됨
  };
}
