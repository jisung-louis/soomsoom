import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import HeartIcon from '../../../assets/icons/common/Heart.svg';
import { typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';

interface HeartPointProps {
  money: string;
  onPress: () => void;
  isBGColorDark?: boolean;
}

const HeartPoint = ({ money, onPress, isBGColorDark = false }: HeartPointProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <HeartIcon width={40} height={40} />
      <Text style={[styles.text, {color: isBGColorDark ? colors.grayScale100 : colors.grayScale800}]}>{money}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  text: {
    ...typography.body1,
  },
});

export default HeartPoint;