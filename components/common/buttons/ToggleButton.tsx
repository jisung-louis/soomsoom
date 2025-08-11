import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, Text } from 'react-native';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import { typography } from '../../../constants/typography';
import CheckIcon from '../../../assets/icons/common/stroke_check.svg';

interface ToggleButtonProps extends TouchableOpacityProps {
  defaultTitle: string;
  activeTitle: string;
  isActive: boolean;
  checkIcon?: boolean;
  onPress: () => void;
  style?: any;
}

export const ToggleButton: React.FC<ToggleButtonProps> = (props) => {
  const { defaultTitle, activeTitle, isActive, checkIcon=false, onPress, style } = props;

  return (
    <TouchableOpacity style={[styles.button, styles[isActive ? 'active' : 'default'], style]} onPress={onPress}>
      {checkIcon && <CheckIcon width={16} height={16} />}
      <Text style={[styles.title, styles[isActive ? 'active' : 'default']]}>{isActive ? activeTitle : defaultTitle}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.r6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: 80,
    height: 32,
  },
  title: {
    ...typography.body5,
  },
  default: {
    backgroundColor: colors.primary300,
    color: colors.white,
  },
  active: {
    backgroundColor: colors.primary50,
    color: colors.primary400,
  },
});