import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { useToast } from '../../../contexts/ToastContext';
import ToastView from './ToastView';

const CustomToast: React.FC = () => {
  const {
    visible,
    message,
    iconType,
    theme,
    hideToast,
  } = useToast();

  const [isAnimating, setIsAnimating] = useState(false);
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsAnimating(true);
      // 토스트 나타나기 애니메이션
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isAnimating) {
      // 토스트 사라지기 애니메이션
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
      });
    }
  }, [visible, translateY, opacity, isAnimating]);

  if (!visible && !isAnimating) return null;

  return (
    <TouchableWithoutFeedback onPress={hideToast}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              transform: [{ translateY }],
              opacity,
            },
          ]}
        >
          <ToastView
            message={message}
            theme={theme}
            iconType={iconType}
          />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 140, // 하단 네비게이션 바 고려
    zIndex: 9999,
  },
  animatedContainer: {
    // 애니메이션을 위한 컨테이너
  },
});

export default CustomToast; 