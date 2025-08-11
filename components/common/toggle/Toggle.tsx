import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import { typography } from '../../../constants/typography';

interface ToggleProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  style?: any;
}

export const Toggle: React.FC<ToggleProps> = ({ options, selected, onSelect, style }) => {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => {
        const isActive = selected === option;
        return (
          <Pressable
            key={option}
            style={[styles.button, isActive && styles.activeButton]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.text, isActive && styles.activeText]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.grayScale100,
    borderRadius: radius.max,
    padding: 2,
    height: 36,
    width: 140,
  },
  button: {
    paddingHorizontal: 16,
    flex: 1,
    paddingVertical: 6,
    borderRadius: radius.max,
    backgroundColor: 'transparent',
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: colors.white,
    shadowColor: colors.grayScale400,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  text: {
    color: colors.grayScale500,
    fontSize: typography.body5.fontSize,
    fontWeight: typography.body5.fontWeight,
  },
  activeText: {
    color: colors.grayScale900,
    fontWeight: typography.body5.fontWeight,
  },
}); 