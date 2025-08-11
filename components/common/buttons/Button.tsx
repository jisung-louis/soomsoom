import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import { typography } from '../../../constants/typography';
import CheckIcon from '../../../assets/icons/common/stroke_check.svg';
import HeartIcon from '../../../assets/icons/common/Heart.svg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  icon?: 'check' | 'heart';
  variant?: 'default' | 'active' | 'secondary' | 'white';
  size?: 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = (props) => {
  const { title, icon, variant = 'default', size = 'medium', style, ...rest } = props;

  return (
    <TouchableOpacity style={[styles.button, styles[variant], styles[size], style]} {...rest}>
      {icon === 'check' && <CheckIcon width={24} height={24} />}
      {icon === 'heart' && <HeartIcon width={24} height={24} />}
      <Text style={[styles.title, styles[variant]]}>{title}</Text>
    </TouchableOpacity>
  );
};

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
  
});