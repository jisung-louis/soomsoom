import React, { forwardRef, useImperativeHandle } from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, Text, View, StyleProp, ViewStyle, ActivityIndicator, TextStyle } from 'react-native';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import { typography } from '../../../constants/typography';
import CheckIcon from '../../../assets/icons/common/stroke_check.svg';
import HeartIcon from '../../../assets/icons/common/Heart.svg';
import { useShakeHorizontalAnimation } from '../../../hooks/useShakeHorizontalAnimation';
import Animated from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  icon?: 'check' | 'heart';
  price?: string;
  variant?: 'default' | 'active' | 'secondary' | 'white';
  size?: 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loading?: boolean;
  showIconMotion?: boolean;
}

export interface ButtonRef {
  triggerShake: () => void;
}

export const Button = forwardRef<ButtonRef, ButtonProps>((props, ref) => {
  const { title, icon, variant = 'default',price, size = 'medium', style, loading = false, disabled, showIconMotion = false, textStyle, ...rest } = props;

  // Spinner color follows text color per variant
  const spinnerColor = variant === 'active'
    ? colors.white
    : variant === 'white'
    ? colors.grayScale900
    : variant === 'secondary'
    ? colors.primary400
    : colors.grayScale400;
    
  const {animatedStyle, triggerShake, resetAnimation} = useShakeHorizontalAnimation({
    shakeDistance: 15, 
    shakeDuration: 150, 
    shakeCount: 3,
    friction: 4,
  });

  // 부모에서 triggerShake를 호출할 수 있도록 ref 노출
  useImperativeHandle(ref, () => ({
    triggerShake: () => {
      if (icon && !loading && !disabled) {
        triggerShake();
      }
    }
  }));

  const isDisabled = !!disabled || loading;

  const renderLeft = () => {
    if (loading) return <ActivityIndicator size="small" color={spinnerColor} style={{ marginRight: 8 }} />;
    
    if (icon === 'check') {
      return showIconMotion ? (
        <Animated.View style={[{width: 28, height: 28, zIndex: 100}, animatedStyle]}>
          <LottieView
            source={require('../../../assets/animations/icon-motion/check.json')}
            autoPlay
            loop={false}
            style={[{width: 28, height: 28}]}
            />
        </Animated.View>
      ) : (
        <Animated.View style={[{width: 28, height: 28, zIndex: 100}, animatedStyle]}>
          <CheckIcon width={28} height={28} />
        </Animated.View>
      );
    }

    if (icon === 'heart') {
      return (
        <Animated.View style={[{flexDirection: 'row', alignItems: 'center', gap: 2, zIndex: 100}, animatedStyle]}>
          <HeartIcon width={28} height={28} />
          {price && <Text style={[styles.price, styles[variant]]}>{price}</Text>}
        </Animated.View>
      );
    }
    
    return null;
  };

  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], styles[size], style, isDisabled && { opacity: 0.8 }]}
      disabled={isDisabled}
      {...rest}
    >
      {renderLeft()}
      <Text style={[
        styles.title,
        price && price ? {...typography.heading9} : {...typography.body1},
        styles[variant], 
        icon || loading ? { marginLeft: 4 } : null, 
        textStyle
        ]}>
          {title}
          </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: { 
    borderRadius: radius.r12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  title: {
    ...typography.body1,
  },

  default: {
    backgroundColor: colors.grayScale100,
    color: colors.grayScale400,
  },
  active: {
    backgroundColor: colors.primary300,
    color: colors.white,
  },
  secondary: {
    backgroundColor: colors.primary50,
    color: colors.primary400,
  },
  white: {
    backgroundColor: colors.white,
    color: colors.grayScale900,
  },

  medium: {
    width: 295,
    height: 54,
  },
  large: {
    width: 335,
    height: 62,
  },
  price: {
    ...typography.body1,
    color: colors.white,
  },
});