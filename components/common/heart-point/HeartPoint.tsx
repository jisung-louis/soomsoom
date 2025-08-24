import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import HeartIcon from '../../../assets/icons/common/Heart.svg';
import { typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';

interface HeartPointProps {
  money: string;
  onPress: () => void;
}

const HeartPoint = ({ money, onPress }: HeartPointProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <HeartIcon width={40} height={40} />
      <Text style={styles.text}>{money}</Text>
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
    color: colors.grayScale900,
  },
});

export default HeartPoint;