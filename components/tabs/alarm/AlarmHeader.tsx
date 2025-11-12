import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import BackIcon from '../../../assets/icons/common/arrow_back.svg';
import EditAlarmIcon from '../../../assets/icons/alarm/edit_alarm.svg';
import SuccessAlarmIcon from '../../../assets/icons/alarm/success_alarm.svg';
import { colors } from '../../../constants/colors';

type AlarmHeaderProps = {
  onBackPress: () => void;
  onEditAlarmPress: () => void;
  onSuccessAlarmPress: () => void;
  isEditMode: boolean;
};

const AlarmHeader: React.FC<AlarmHeaderProps> = ({ onBackPress, onEditAlarmPress, onSuccessAlarmPress, isEditMode }) => {
  return (
  <View style={styles.container}>
    <View style={styles.buttonContainer}>
        {isEditMode ? (
            <TouchableOpacity onPress={onBackPress}>
                <BackIcon width={36} height={36} color={colors.grayScale800} />
            </TouchableOpacity>
        ) : (
            <View style={styles.emptyButton} />
        )}
      
      {isEditMode ? (
        <TouchableOpacity onPress={onSuccessAlarmPress}>
          <SuccessAlarmIcon width={36} height={36} color={colors.grayScale800} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onEditAlarmPress}>
          <EditAlarmIcon width={36} height={36} color={colors.grayScale800} />
        </TouchableOpacity>
      )}
    </View>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    zIndex: 10000,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  emptyButton: {
    width: 36,
    height: 36,
  },
});

export default AlarmHeader;