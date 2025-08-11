import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { radius } from '../../../../constants/radius';
import { Button } from '../../../common/buttons/Button';
import CheckIcon from '../../../../assets/icons/common/stroke_check.svg';

interface RepeatSelectorProps {
  onConfirm: (repeatDays: string[], repeatType: string) => void;
  onCancel: () => void;
  initialRepeatDays?: string[];
  initialRepeatType?: string;
}

const RepeatSelector: React.FC<RepeatSelectorProps> = ({
  onConfirm,
  onCancel,
  initialRepeatDays = [],
  initialRepeatType = 'daily',
}) => {
  const [selectedDays, setSelectedDays] = useState<string[]>(initialRepeatDays);

  const days = [
    { key: '일', label: '일요일' },
    { key: '월', label: '월요일' },
    { key: '화', label: '화요일' },
    { key: '수', label: '수요일' },
    { key: '목', label: '목요일' },
    { key: '금', label: '금요일' },
    { key: '토', label: '토요일' },
  ];

  const toggleDay = (dayKey: string) => {
    if (selectedDays.includes(dayKey)) {
      setSelectedDays(selectedDays.filter(d => d !== dayKey));
    } else {
      setSelectedDays([...selectedDays, dayKey]);
    }
  };

  const handleConfirm = () => {
    // 선택된 요일이 없으면 'custom', 있으면 'custom'으로 설정
    const repeatType = selectedDays.length === 0 ? 'none' : 'custom';
    onConfirm(selectedDays, repeatType);
  };

  return (
    <View style={styles.container}>
      <View style={styles.daysList}>
        {days.map((day, index) => (
          <View key={day.key}>
            <TouchableOpacity
              style={styles.dayItem}
              onPress={() => toggleDay(day.key)}
            >
              <Text style={styles.dayLabel}>{day.label}</Text>
              {selectedDays.includes(day.key) ? (
                <CheckIcon width={24} height={24} color={colors.primary500} />
              ) : (
                <View style={styles.emptyCheck} />
              )}
            </TouchableOpacity>
            {index < days.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="취소"
          onPress={onCancel}
          variant="default"
          style={{ flex: 1 }}
        />
        <Button
          title="저장"
          onPress={handleConfirm}
          variant="active"
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1 제거하여 내부 콘텐츠 크기에 맞춤
  },
  daysList: {
    // flex: 1 제거하여 내부 콘텐츠 크기에 맞춤
    gap: 16,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayLabel: {
    ...typography.body2,
    color: colors.grayScale800,
  },
  emptyCheck: {
    width: 24,
    height: 24,
  },
  divider: {
    height: 1,
    backgroundColor: colors.grayScale100,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
});

export default RepeatSelector; 