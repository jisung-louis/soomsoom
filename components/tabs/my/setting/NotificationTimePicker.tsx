import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { radius } from '../../../../constants/radius';
import { Button } from '../../../../components/common/buttons/Button';
import AlarmTimePicker from '../../alarm/AlarmAddScreen/AlarmTimePicker';

interface TimeData {
  period: string;
  hour: string;
  minute: string;
}

interface NotificationTimePickerProps {
  onClose: () => void;
  onConfirm: (time: TimeData) => void;
  initialTime?: TimeData;
}

const NotificationTimePicker: React.FC<NotificationTimePickerProps> = ({
  onClose,
  onConfirm,
  initialTime = { period: '오후', hour: '8', minute: '30' }
}) => {
  const [selectedTime, setSelectedTime] = useState<TimeData>(initialTime);

  useEffect(() => {
    setSelectedTime(initialTime);
  }, [initialTime]);

  const handleConfirm = () => {
    onConfirm(selectedTime);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.timePickerContainer}>
        <AlarmTimePicker 
          onTimeChange={setSelectedTime}
          initialTime={selectedTime}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <Button 
            title="취소" 
            variant="default"
            onPress={handleCancel}
            style={styles.cancelButton}
          />
          <Button 
            title="저장" 
            variant="active"
            onPress={handleConfirm}
            style={styles.saveButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    ...typography.heading6,
    color: colors.grayScale900,
  },
  timePickerContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default NotificationTimePicker;
