import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../../../constants/colors';

interface SurfaceProps {
  height?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const Surface = ({ height = 12, color = colors.grayScale50, style }: SurfaceProps) => {
  return <View style={[{ height, backgroundColor: color }, style]} />;
};