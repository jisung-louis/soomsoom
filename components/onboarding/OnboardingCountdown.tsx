import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../constants/colors';
import { sv } from '../../utils/scale';
import { syongsyongTypography } from '../../constants/typography';
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
  duration = 2,
}) => {
  const size = sv(200); // 게이지 크기
  const strokeWidth = sv(16); // 두께
  const trackColor = colors.primary200; // 연한 주황
  const progressColor = colors.primary300; // 주황
  const textColor = colors.primary300;

  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

  // 진행값 0→1
  const progress = useRef(new Animated.Value(0)).current;
  const [remaining, setRemaining] = useState(duration);

  const AnimatedCircle = useMemo(() => Animated.createAnimatedComponent(Circle), []);

  useEffect(() => {
    // 진행 애니메이션 시작
    Animated.timing(progress, {
      toValue: 1,
      duration: duration * 1000,
      useNativeDriver: false, // strokeDashoffset은 네이티브 미지원
    }).start(({ finished }) => {
      if (finished) onComplete();
    });

    // 남은 시간 텍스트 갱신
    setRemaining(duration);
    const interval = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    const timeout = setTimeout(() => clearInterval(interval), duration * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [duration, onComplete, progress]);

  // strokeDashoffset = 원주 * (1 - progress)
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={{
      alignItems: 'center',
      height: '90%',
      justifyContent: 'center',
    }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset as unknown as number}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{...syongsyongTypography.title1, color: textColor, textShadowColor: textColor}}>{remaining-1}</Text>
      </View>
    </View>
  );
};
