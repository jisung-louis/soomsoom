import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { radius } from '../../../constants/radius';
import CheckIcon from '../../../assets/icons/common/check_active.svg';
import CheckIconInactive from '../../../assets/icons/common/check_disabled.svg';

interface CheckboxProps {
  label: string;
  subLabel?: string;
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
}

const Checkbox = ({ label, subLabel, checked, onPress, disabled = false, style }: CheckboxProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        checked && styles.containerChecked,
        disabled && styles.containerDisabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {/* 체크박스 아이콘 */}
      <View>
        {checked ? (
          <CheckIcon width={32} height={32} />
        ) : (
          <CheckIconInactive width={32} height={32} />
        )}
      </View>
      
      {/* 라벨 텍스트 */}
      <Text style={[
        styles.label,
      ]}>
        {label}
      </Text>
      <Text style={[
        styles.subLabel,checked && styles.subLabelChecked,
      ]}>
        {subLabel}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: radius.r8,
    marginBottom: 10,
    minHeight: 56,
    width: '100%',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.white,

    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  containerChecked: {
    backgroundColor: colors.primary50,
    borderColor: colors.primary100,
    borderWidth: 1,
  },
  containerDisabled: {
    backgroundColor: colors.white,
    borderColor: colors.grayScale200,
    opacity: 0.6,
  },
  checkmark: {
    width: 8,
    height: 8,
    borderRadius: radius.r2,
    backgroundColor: colors.primary300,
  },
  label: {
    ...typography.body1,
    flex: 1,
    padding: 4,
    borderRadius: 4,
    // 강제 텍스트 색상
    color: colors.grayScale900,
    fontWeight: 'bold',
  },
  subLabel: {
    ...typography.body1,
    color: colors.grayScale600,
  },
  subLabelChecked: {
    color: colors.primary400,
  },
});

export default Checkbox;
