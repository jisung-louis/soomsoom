import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import { typography } from '../../../constants/typography';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'default' | 'active';
}

export const ButtonSmall: React.FC<ButtonProps> = (props) => {
  const { title, variant = 'default', ...rest } = props;

  return (
    <TouchableOpacity style={[styles.button, styles[variant]]} {...rest}>
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
    width: 108,
    height: 42,
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
});