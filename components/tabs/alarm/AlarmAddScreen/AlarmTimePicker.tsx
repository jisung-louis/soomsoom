import React, { useCallback, useMemo } from 'react';
import CustomWheelPicker, { WheelConfig } from '../../../common/picker/WheelPicker';

interface TimeData {
  period: string;
  hour: string;
  minute: string;
}

interface AlarmTimePickerProps {
  onTimeChange?: (time: TimeData) => void;
  initialTime?: TimeData;
}

const AlarmTimePicker: React.FC<AlarmTimePickerProps> = ({
  onTimeChange,
  initialTime = { period: '오전', hour: '1', minute: '0' }
}) => {
  const wheels: WheelConfig[] = useMemo(() => [
    {
      id: 'period',
      data: [
        { label: '오전', value: '오전' },
        { label: '오후', value: '오후' }
      ],
      initialValue: initialTime.period
    },
    {
      id: 'hour',
      data: Array.from({ length: 12 }, (_, i) => ({
        label: (i + 1).toString(),
        value: (i + 1).toString()
      })),
      initialValue: initialTime.hour
    },
    {
      id: 'minute',
      data: Array.from({ length: 60 }, (_, i) => ({
        label: i.toString().padStart(2, '0'),
        value: i.toString()
      })),
      initialValue: initialTime.minute
    }
  ], [initialTime.period, initialTime.hour, initialTime.minute]);

  const handleValueChange = useCallback((values: Record<string, string | number>) => {
    if (onTimeChange) {
      onTimeChange({
        period: values.period as string,
        hour: values.hour as string,
        minute: values.minute as string
      });
    }
  }, [onTimeChange]);

  return (
    <CustomWheelPicker
      wheels={wheels}
      onValueChange={handleValueChange}
      initialValues={{
        period: initialTime.period,
        hour: initialTime.hour,
        minute: initialTime.minute
      }}
    />
  );
};

export default AlarmTimePicker;