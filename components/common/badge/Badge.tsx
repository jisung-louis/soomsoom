import React from 'react';
import { StyleSheet, Text, View, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import { typography } from '../../../constants/typography';

interface BadgeProps extends ViewProps {
  title: string;
  variant?: 'default' | 'secondary' | 'small';
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = (props) => {
  const { title, variant = 'default', style, ...rest } = props;

  const textVariant = `${variant}Text` as const;

  return (
    <View style={[styles.badge, styles[variant], style]} {...rest}>
      <Text style={[styles.title, styles[textVariant]]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.max,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },

  title: {
    ...typography.body5,
  },

  default: {
    backgroundColor: colors.primary300,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  secondary: {
    backgroundColor: colors.primary50,
    borderWidth: 1,
    borderColor: colors.primary100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  small: {
    backgroundColor: colors.primary300,
    ...typography.caption2,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  defaultText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.primary400,
  },
  smallText: {
    color: colors.white,
  },
});

export default Badge;