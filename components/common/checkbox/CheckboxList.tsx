import React from 'react';
import { View, StyleSheet } from 'react-native';
import Checkbox from './Checkbox';

interface CheckboxOption {
  id: string;
  label: string;
  subLabel?: string;
  disabled?: boolean;
}

interface CheckboxListProps {
  options: CheckboxOption[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  multiple?: boolean; // true: 다중 선택, false: 단일 선택
  style?: any;
}

const CheckboxList = ({ 
  options, 
  selectedIds, 
  onSelectionChange, 
  multiple = true,
  style 
}: CheckboxListProps) => {
  
  const handleCheckboxPress = (optionId: string) => {
    if (multiple) {
      // 다중 선택
      const newSelectedIds = selectedIds.includes(optionId)
        ? selectedIds.filter(id => id !== optionId)
        : [...selectedIds, optionId];
      onSelectionChange(newSelectedIds);
    } else {
      // 단일 선택
      const newSelectedIds = selectedIds.includes(optionId)
        ? []
        : [optionId];
      onSelectionChange(newSelectedIds);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {options.map((option) => (
        <Checkbox
          key={option.id}
          label={option.label}
          subLabel={option.subLabel || ''}
          checked={selectedIds.includes(option.id)}
          onPress={() => handleCheckboxPress(option.id)}
          disabled={option.disabled}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default CheckboxList;
