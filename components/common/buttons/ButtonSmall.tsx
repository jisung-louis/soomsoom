import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import { typography } from '../../../constants/typography';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'default' | 'active' | 'secondary';
  style?: StyleProp<ViewStyle>;
}

export const BUTTON_SIZE = {
  width: 108,
  height: 42,
}

export const ButtonSmall: React.FC<ButtonProps> = (props) => {
  const { title, variant = 'default', style, ...rest } = props;

  return (
    <TouchableOpacity style={[styles.button, styles[variant], style]} {...rest}>
      <Text style={[styles.title, styles[variant]]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.r8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 12,
    width: BUTTON_SIZE.width, // 이걸 주석화하면 버튼 크기는 글자 크기에 따라 자동으로 조정됨
    height: BUTTON_SIZE.height,
  },
  title: {
    fontSize: typography.body4.fontSize,
    fontWeight: typography.body4.fontWeight,
    lineHeight: typography.body4.lineHeight,
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
});