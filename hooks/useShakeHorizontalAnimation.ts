import { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';

interface UseShakeHorizontalAnimationOptions {
  shakeDistance?: number;
  shakeDuration?: number;
  shakeCount?: number;
  friction?: number;
}

/**
 * 좌우로 흔들리는 애니메이션을 위한 커스텀 훅
 * 에러 상태, 경고, 주의사항 등을 강조할 때 사용
 * 
 * @param options 애니메이션 설정 옵션
 * @returns 애니메이션 스타일과 트리거 함수
 */
export const useShakeHorizontalAnimation = (options: UseShakeHorizontalAnimationOptions = {}) => {
  const {
    shakeDistance = 10,
    shakeDuration = 100,
    shakeCount = 3,
    friction = 3,
  } = options;

  const translateX = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value }
    ],
  }));

  const triggerShake = () => {
    // 흔들림 애니메이션 시퀀스 생성
    const shakeSequence = [];
    
    for (let i = 0; i < shakeCount; i++) {
      shakeSequence.push( // shakeCount마다 거리 절반으로 감소
        withTiming(-shakeDistance / (friction**i), { duration: i == 0 ? shakeDuration / 2 : shakeDuration }),
        withTiming(shakeDistance / (friction**i), { duration: shakeDuration }),
      );
    }
    
    // 마지막에 원래 위치로 돌아오기
    shakeSequence.push(withTiming(0, { duration: shakeDuration }));
    
    translateX.value = withSequence(...shakeSequence);
  };

  const resetAnimation = () => {
    translateX.value = 0;
  };

  return {
    animatedStyle,
    triggerShake,
    resetAnimation,
  };
};
