import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';

export interface PickerItem {
  label: string;
  value: string | number;
}

export interface WheelConfig {
  id: string;
  data: PickerItem[];
  initialValue?: string | number;
  width?: number;
  overlayStyle?: {
    backgroundColor?: string;
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
    opacity?: number;
  };
}

export interface WheelPickerProps {
  wheels: WheelConfig[];
  onValueChange?: (values: Record<string, string | number>) => void;
  initialValues?: Record<string, string | number>;
  itemHeight?: number;
  itemTextStyle?: any;
  containerStyle?: any;
}

const CustomWheelPicker: React.FC<WheelPickerProps> = ({
  wheels,
  onValueChange,
  initialValues = {},
  itemHeight = 58,
  itemTextStyle,
  containerStyle
}) => {
  // 각 휠의 현재 값들을 관리하는 상태
  const [values, setValues] = useState<Record<string, string | number>>(() => {
    const initial: Record<string, string | number> = {};
    wheels.forEach(wheel => {
      initial[wheel.id] = initialValues[wheel.id] || wheel.initialValue || wheel.data[0]?.value || '';
    });
    return initial;
  });

  // initialValues가 변경될 때 내부 상태 업데이트
  useEffect(() => {
    const newValues: Record<string, string | number> = {};
    wheels.forEach(wheel => {
      newValues[wheel.id] = initialValues[wheel.id] || wheel.initialValue || wheel.data[0]?.value || '';
    });
    setValues(newValues);
  }, [initialValues]); // wheels 의존성 제거

  const handleValueChange = (wheelId: string, value: string | number) => {
    setValues(prev => {
      const newValues = {
        ...prev,
        [wheelId]: value
      };
      
      // 값이 변경될 때 부모 컴포넌트에 알림
      if (onValueChange) {
        onValueChange(newValues);
      }
      
      return newValues;
    });
  };

  const getDefaultOverlayStyle = (index: number, total: number) => {
    const baseStyle = {
      backgroundColor: colors.primary200,
      opacity: 0.4,
    };

    if (total === 1) {
      return {
        ...baseStyle,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
      };
    }

    if (index === 0) {
      return {
        ...baseStyle,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 0,
      };
    }

    if (index === total - 1) {
      return {
        ...baseStyle,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 8,
      };
    }

    return {
      ...baseStyle,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    };
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {wheels.map((wheel, index) => (
        <WheelPicker
          key={wheel.id}
          data={wheel.data}
          value={values[wheel.id]}
          onValueChanged={(event) => handleValueChange(wheel.id, event.item.value)}
          style={[
            styles.wheelContainer,
            wheel.width ? { flex: 0, width: wheel.width } : undefined
          ]}
          itemTextStyle={itemTextStyle || styles.itemText}
          itemHeight={itemHeight}
          overlayItemStyle={{
            ...getDefaultOverlayStyle(index, wheels.length),
            ...wheel.overlayStyle
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelContainer: {
    flex: 1,
    height: 50,
  },
  itemText: {
    fontSize: typography.heading7.fontSize,
    fontWeight: typography.heading7.fontWeight,
    color: colors.primary400,
  },
});

export default CustomWheelPicker;
