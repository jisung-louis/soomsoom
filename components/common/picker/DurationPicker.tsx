import React from 'react';
import CustomWheelPicker, { WheelConfig } from './WheelPicker';

interface DurationPickerProps {
  initialHours?: number;
  initialMinutes?: number;
  onValueChange?: (hours: number, minutes: number) => void;
  maxHours?: number;
}

const DurationPicker: React.FC<DurationPickerProps> = ({
  initialHours = 0,
  initialMinutes = 0,
  onValueChange,
  maxHours = 24
}) => {
  const hours = Array.from({ length: maxHours + 1 }, (_, i) => ({
    label: `${i}시간`,
    value: i
  }));

  const minutes = Array.from({ length: 60 }, (_, i) => ({
    label: `${i}분`,
    value: i
  }));

  const wheels: WheelConfig[] = [
    {
      id: 'hours',
      data: hours,
      initialValue: initialHours
    },
    {
      id: 'minutes',
      data: minutes,
      initialValue: initialMinutes
    }
  ];

  const handleValueChange = (values: Record<string, string | number>) => {
    if (onValueChange) {
      onValueChange(values.hours as number, values.minutes as number);
    }
  };

  return (
    <CustomWheelPicker
      wheels={wheels}
      onValueChange={handleValueChange}
      initialValues={{
        hours: initialHours,
        minutes: initialMinutes
      }}
    />
  );
};

export default DurationPicker;
