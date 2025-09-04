import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface UseSpringUpAnimationOptions {
  initialOffset?: number;
  springConfig?: {
    damping: number;
    stiffness: number;
  };
}

/**
 * 아래에서 위로 올라오는 애니메이션을 위한 커스텀 훅
 * 버튼, 카드, 모달 등 어떤 뷰든 사용 가능
 * 
 * @param options 애니메이션 설정 옵션
 * @returns 애니메이션 스타일과 트리거 함수
 */
export const useSpringUpAnimation = (options: UseSpringUpAnimationOptions = {}) => {
  const {
    initialOffset = 200,
    springConfig = { damping: 10, stiffness: 250 }
  } = options;

  const offset = useSharedValue(initialOffset);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withSpring(offset.value, springConfig) }
    ],
  }));

  const triggerAnimation = () => {
    offset.value = 0;
  };

  const resetAnimation = () => {
    offset.value = initialOffset;
  };

  return {
    animatedStyle,
    triggerAnimation,
    resetAnimation,
  };
};
