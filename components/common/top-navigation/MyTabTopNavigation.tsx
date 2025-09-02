import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import ArrowLeft from '../../../assets/icons/common/arrow_back.svg';
import SettingIcon from '../../../assets/icons/common/setting.svg';
import HeartIcon from '../../../assets/icons/common/Heart.svg';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { useCurrencyStore } from '../../../stores/currencyStore';

interface MyTabTopNavigationProps {
  isEditMode: boolean;
  onEditModeToggle: () => void;
  onSettingPress: () => void;
  onHeartPress: () => void;
  style?: ViewStyle;
}

const MyTabTopNavigation = ({isEditMode, onEditModeToggle, onSettingPress, onHeartPress, style}: MyTabTopNavigationProps) => {
  return (
    isEditMode ? (
      <View style={[styles.container, style]}>
        <TouchableOpacity style={styles.leftButton} onPress={() => {onEditModeToggle()}}>
          <ArrowLeft width={40} height={40} fill={colors.grayScale800} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.rightButton} onPress={() => {onHeartPress()}}>
          <HeartIcon width={40} height={40} />
          <Text style={styles.moneyText}>{useCurrencyStore.getState().heartPoints}</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View style={[styles.container, style]}>
        <View style={styles.leftButton}/>
        <TouchableOpacity style={styles.rightButton} onPress={() => {onSettingPress()}}>
          <SettingIcon width={40} height={40} />
        </TouchableOpacity>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  leftButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  moneyText: {
    ...typography.body1,
    color: colors.grayScale900,
  },
});

export default MyTabTopNavigation;