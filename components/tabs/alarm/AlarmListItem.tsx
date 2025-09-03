import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import DeleteIcon from '../../../assets/icons/common/delete.svg';
import RightArrowIcon from '../../../assets/icons/common/arrow_right.svg';
import { getDayDisplayText } from '../../../utils/dayDisplayUtils';
import { format24To12HourString } from '../../../utils/timeUtils';

interface AlarmItem {
  id: number;
  time: string;
  isActive?: boolean;
  day: string[];
}

// 24시간 형식을 12시간 형식으로 변환 (유틸리티 함수 사용)
const formatTimeTo12Hour = (time24: string) => {
  const formattedTime = format24To12HourString(time24);
  const [period, time] = formattedTime.split(' ');
  return {
    period,
    time
  };
};

const AlarmListItem = ({ item, toggleSwitch, isEditMode, onDeleteAlarm, onEditAlarmPress }: { item: AlarmItem, toggleSwitch: (id: number) => void, isEditMode: boolean, onDeleteAlarm: (id: number) => void, onEditAlarmPress: (id: number) => void }) => {
  const { period, time } = formatTimeTo12Hour(item.time);
  const dayText = getDayDisplayText(item.day);
  const isActive = item.isActive ?? true; // 기본값 true

  return (
    <View style={[styles.container, !isActive && styles.inactiveContainer]}>
      {isEditMode && (
        <TouchableOpacity 
          style={styles.deleteIconContainer} 
          onPress={() => {onDeleteAlarm(item.id)}}
        >
          <DeleteIcon width={32} height={32} color={colors.grayScale800} />
        </TouchableOpacity>
      )}
        <TouchableOpacity style={styles.alarmItemContainer} onPress={() => { onEditAlarmPress(item.id)}}>
            <View style={styles.timeInfoContainer}>
                <View style={styles.alarmItemTime}>
                    <Text style={[styles.alarmItemAMPMText, !isActive && styles.inactiveText]}>{period}</Text>
                    <Text style={[styles.alarmItemTimeText, !isActive && styles.inactiveText]}>{time}</Text>
                </View>
                <View style={styles.alarmItemDay}>
                    <Text style={[styles.alarmItemDayText, !isActive && styles.inactiveDayText]}>{dayText}</Text>
                </View>
            </View>
            <View style={styles.alarmItemSwitchOrRightArrowContainer}>
                {isEditMode ? (
                  <RightArrowIcon width={28} height={28} color={colors.grayScale800} />
                ) : (
                  <Switch
                    value={isActive}
                    onValueChange={() => {toggleSwitch(item.id)}}
                    trackColor={{ false: colors.primary200, true: colors.primary300 }}
                    ios_backgroundColor={colors.primary200}
                    style={styles.alarmItemSwitch}
                />  
                )}
            </View>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inactiveContainer: {
    opacity: 0.6,
  },
  deleteIconContainer: {
  },
  alarmItemContainer: {
    padding: 20,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  timeInfoContainer: {
  },
  alarmItemTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alarmItemAMPMText: {
    ...typography.heading7,
    color: colors.grayScale900,
    alignSelf: 'flex-end',
  },
  alarmItemTimeText: {
    ...typography.heading1,
    color: colors.grayScale900,
  },
  alarmItemDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  alarmItemSwitchOrRightArrowContainer: {
  },
  alarmItemDayText: {
    ...typography.body5,
    color: colors.grayScale600,
  },
  alarmItemSwitch: {
  },
  inactiveText: {
    color: colors.grayScale400,
  },
  inactiveDayText: {
    color: colors.grayScale300,
  },
});

export default AlarmListItem;





