import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { radius } from '../../../constants/radius';
import { useCurrencyStore } from '../../../stores/currencyStore';
import HeartIcon from '../../../assets/icons/common/Heart.svg';

interface CurrencyDisplayProps {
  onPress?: () => void;
  style?: any;
}

const CurrencyDisplay = ({ onPress, style }: CurrencyDisplayProps) => {
  const { heartPoints } = useCurrencyStore();

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.currencyItem}>
        <HeartIcon width={16} height={16} color={colors.primary300} />
        <Text style={styles.currencyText}>{heartPoints.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderRadius: radius.r8,
    borderWidth: 1,
    borderColor: colors.grayScale200,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currencyText: {
    ...typography.body4,
    color: colors.grayScale800,
    fontWeight: '600',
  },
});

export default CurrencyDisplay;
