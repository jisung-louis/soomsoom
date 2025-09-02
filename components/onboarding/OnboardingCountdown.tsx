import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import Count5 from '../../assets/icons/play/playBreath/count_5.svg';
import Count4 from '../../assets/icons/play/playBreath/count_4.svg';
import Count3 from '../../assets/icons/play/playBreath/count_3.svg';
import Count2 from '../../assets/icons/play/playBreath/count_2.svg';
import Count1 from '../../assets/icons/play/playBreath/count_1.svg';
import Count0 from '../../assets/icons/play/playBreath/count_0.svg';

interface OnboardingCountdownProps {
  onComplete: () => void;
  duration?: number; // 카운트다운 시간 (기본 5초)
}

/**
 * 온보딩 카운트다운 컴포넌트
 * 
 * 🎯 왜 이렇게 하나요?
 * - 재사용 가능한 카운트다운 컴포넌트
 * - 온보딩뿐만 아니라 다른 곳에서도 사용 가능
 * - 깔끔한 UI와 애니메이션
 */
export const OnboardingCountdown: React.FC<OnboardingCountdownProps> = ({ 
  onComplete, 
  duration = 5 
}) => {
  const [count, setCount] = useState(duration);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (count > 0) {
        setCount(count - 1);
      } else {
        onComplete();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  const renderCountIcon = () => {
    switch (count) {
      case 5: return <Count5 />;
      case 4: return <Count4 />;
      case 3: return <Count3 />;
      case 2: return <Count2 />;
      case 1: return <Count1 />;
      case 0: return <Count0 />;
      default: return <Count5 />;
    }
  };

  return (
    <View style={{
      alignItems: 'center',
      height: '90%',
      justifyContent: 'center',
    }}>
      {renderCountIcon()}
    </View>
  );
};
