import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { radius } from '../../../../constants/radius';
import { Button } from '../../../common/buttons/Button';
import CheckActiveIcon from '../../../../assets/icons/common/check_active.svg';
import CheckDisabledIcon from '../../../../assets/icons/common/check_disabled.svg';
import { sv } from '../../../../utils/scale';
import NumberPicker from '../../../common/picker/NumberPicker';

interface MissionSelectorProps {
  onConfirm: (missionName: number) => void;
  onCancel: () => void;
}

const MissionSelector: React.FC<MissionSelectorProps> = ({
  onConfirm,
  onCancel,
}) => {
  const [selectedTime, setSelectedTime] = useState(1);

  const handleConfirm = () => {
    onConfirm(selectedTime);
  };

  return (
    <View style={styles.container}>
      <View style={styles.missionExampleContainer}>
        <Text style={styles.missionExampleText}>3 + 4 = ?</Text>
      </View>
      <View style={styles.numberPickerContainer}>
        <NumberPicker
          onValueChange={setSelectedTime}
          initialValue={selectedTime}
          max={10}
          min={1}
          suffix="회"
        />
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
  missionExampleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: sv(126),
    backgroundColor: colors.grayScale50,
    borderRadius: radius.r12,
  },
  missionExampleText: {
    ...typography.heading1,
    color: colors.grayScale800,
  },
  numberPickerContainer: {
    marginTop: -30,
    marginBottom: -30,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default MissionSelector; 