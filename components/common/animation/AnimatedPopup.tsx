import React, { useEffect, useRef, useState } from 'react';
import { Animated, ViewStyle, StyleSheet } from 'react-native';

interface AnimatedPopupProps {
  visible: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  duration?: {
    show?: number;
    hide?: number;
  };
  onAnimationComplete?: () => void;
}

const AnimatedPopup: React.FC<AnimatedPopupProps> = ({
  visible,
  children,
  style,
  duration = { show: 200, hide: 150 },
  onAnimationComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      // 나타나기 애니메이션
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: duration.show,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: duration.show,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onAnimationComplete?.();
      });
    } else {
      // 사라지기 애니메이션
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: duration.hide,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: duration.hide,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false);
        onAnimationComplete?.();
      });
    }
  }, [visible, scaleAnim, opacityAnim, duration, onAnimationComplete]);

  if (!shouldRender) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    // 기본 스타일은 비워두고 props로 받은 style 사용
  },
});

export default AnimatedPopup; 