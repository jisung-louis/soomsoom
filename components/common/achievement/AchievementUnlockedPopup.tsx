import React, { useEffect, useState } from 'react';
import { MyAchievement, AchievementGrade } from '../../../types';
import { bindAchievementPopupHandler, navigateToAchievements, useAchievementStore } from '../../../stores/achievementStore';
import CustomAlert from '../alert/CustomAlert';

const animByGrade: Record<AchievementGrade, any> = {
  BRONZE: require('../../../assets/animations/badge/bronze_action.json'),
  SILVER: require('../../../assets/animations/badge/silver_action.json'),
  GOLD: require('../../../assets/animations/badge/gold_action.json'),
  SPECIAL: require('../../../assets/animations/badge/hidden_action.json'),
};

export default function AchievementUnlockedPopup() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<MyAchievement | null>(null);
  const [onCloseCb, setOnCloseCb] = useState<(() => void) | null>(null);

  useEffect(() => {
    bindAchievementPopupHandler((a, onClose) => {
      console.log('🎭 팝업 표시 요청:', a.name);
      setData(a);
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
  };

  const goToAchievementScreen = () => {
    console.log('🎯 업적 화면으로 이동');
    close(); // 팝업 먼저 닫기
    navigateToAchievements(); // 전역 함수 사용
  };

  const getRewardText = (achievement: MyAchievement) => {
    const definitions = useAchievementStore.getState().achievementDefinitions;
    const definition = definitions.get(achievement.achievementId);
    
    if (!definition) return '';
    
    const rewards = [];
    if (definition.rewardPoints) {
      rewards.push(`${definition.rewardPoints} 포인트`);
    }
    if (definition.rewardItemId) {
      rewards.push('특별 아이템');
    }
    
    return rewards.length > 0 ? `보상: ${rewards.join(', ')}` : '';
  };

  if (!data) return null;

  // CustomAlert에 맞는 메시지 구성
  const message = '새로운 업적을 달성했어요!';
  const subMessage = `'${data.name}' 업적 달성!`;
  const rewardText = getRewardText(data);

  return (
    <CustomAlert
      visible={open}
      image={animByGrade[data.grade]}
      message={message}
      subMessage={subMessage}
      buttons={[
        {
          text: '닫기',
          onPress: close,
        },
        {
          text: '업적 확인하기',
          onPress: goToAchievementScreen,
        }
      ]}
      onClose={close}
    />
  );
}
