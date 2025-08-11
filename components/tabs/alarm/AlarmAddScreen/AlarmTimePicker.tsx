import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';

interface TimeData {
  period: string;
  hour: string;
  minute: string;
}

interface PickerItem {
  label: string;
  value: string;
}

interface AlarmTimePickerProps {
  onTimeChange?: (time: TimeData) => void;
  initialTime?: TimeData;
}

const AlarmTimePicker: React.FC<AlarmTimePickerProps> = ({
  onTimeChange,
  initialTime = { period: '오전', hour: '1', minute: '0' }
}) => {
  const [period, setPeriod] = useState(initialTime.period);
  const [hour, setHour] = useState(initialTime.hour);
  const [minute, setMinute] = useState(initialTime.minute);

  // initialTime이 변경될 때 내부 상태 업데이트
  useEffect(() => {
    setPeriod(initialTime.period);
    setHour(initialTime.hour);
    setMinute(initialTime.minute);
  }, [initialTime]);

  const periods: PickerItem[] = [
    { label: '오전', value: '오전' },
    { label: '오후', value: '오후' }
  ];

  const hours: PickerItem[] = Array.from({ length: 12 }, (_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString()
  }));
  
  const minutes: PickerItem[] = Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, '0'),
    value: i.toString()
  }));

  // 부모 컴포넌트에 시간 변경 알림
  useEffect(() => {
    if (onTimeChange) {
      onTimeChange({ period, hour, minute });
    }
  }, [period, hour, minute, onTimeChange]);

  return (
    <View style={styles.container}>
      <WheelPicker
        data={periods}
        value={period}
        onValueChanged={(event) => setPeriod(event.item.value)}
        style={styles.wheelContainer}
        itemTextStyle={styles.itemText}
        itemHeight={58}
        overlayItemStyle={{
          backgroundColor: colors.primary200,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 0,
          opacity: 0.4,
        }}
      />
      <WheelPicker
        data={hours}
        value={hour}
        onValueChanged={(event) => setHour(event.item.value)}
        style={styles.wheelContainer}
        itemTextStyle={styles.itemText}
        itemHeight={58}
        overlayItemStyle={{
          backgroundColor: colors.primary200,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          opacity: 0.4,
        }}
      />
      <WheelPicker
        data={minutes}
        value={minute}
        onValueChanged={(event) => setMinute(event.item.value)}
        style={styles.wheelContainer}
        itemTextStyle={styles.itemText}
        itemHeight={58}
        overlayItemStyle={{
          backgroundColor: colors.primary200,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 8,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 8,
          opacity: 0.4,
        }}
      />
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
  },
  itemText: {
    fontSize: typography.heading7.fontSize,
    fontWeight: typography.heading7.fontWeight,
    color: colors.primary400,
  },
});

export default AlarmTimePicker;