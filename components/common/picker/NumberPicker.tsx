import React from 'react';
import CustomWheelPicker, { WheelConfig } from './WheelPicker';

interface NumberPickerProps {
  min?: number;
  max?: number;
  initialValue?: number;
  onValueChange?: (value: number) => void;
  label?: string;
  suffix?: string;
}

const NumberPicker: React.FC<NumberPickerProps> = ({
  min = 1,
  max = 100,
  initialValue = 1,
  onValueChange,
  label = '개수',
  suffix = '개'
}) => {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => ({
    label: `${i + min}${suffix}`,
    value: i + min
  }));

  const wheels: WheelConfig[] = [
    {
      id: 'number',
      data: numbers,
      initialValue: initialValue
    }
  ];

  const handleValueChange = (values: Record<string, string | number>) => {
    if (onValueChange) {
      onValueChange(values.number as number);
    }
  };

  return (
    <CustomWheelPicker
      wheels={wheels}
      onValueChange={handleValueChange}
      initialValues={{ number: initialValue }}
    />
  );
};

export default NumberPicker;
