import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import ArrowRightIcon from '../../../../assets/icons/common/arrow_right.svg';
import { getDayDisplayText } from '../../../../utils/dayDisplayUtils';
import { MissionData } from '../../../../stores/alarmStore';

interface AlarmSettingProps {
  onRepeatPress: () => void;
  onMissionPress: () => void;
  onSoundPress: () => void;
  onVibrationToggle: () => void;

  repeatData: {
    repeatDays: string[];
    repeatType: string;
  };
  missionData: MissionData;
  soundData: {
    soundName: string;
  };
  isVibrationOn: boolean;
}

const AlarmSetting = ({ onRepeatPress, onMissionPress, onSoundPress, onVibrationToggle, repeatData, missionData, soundData, isVibrationOn }: AlarmSettingProps) => {
  const dayText = getDayDisplayText(repeatData.repeatDays);

  // missionType 텍스트 변환
  const missionTypeText = (missionType: string) => {
    switch (missionType) {
      case 'math':
        return '수학 문제';
      // case 'english':
      //   return '영어';
      // default:
      //   return '미션 없음';
    };
  };

  return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.settingItemContainer} onPress={() => {onRepeatPress()}}>
            <Text style={styles.title}>반복</Text>
            <View style={styles.settingItemRightContent}>
                <Text style={styles.settingItemRightContentText}>{dayText}</Text>
                <ArrowRightIcon width={24} height={24} color={colors.grayScale900} />
            </View>
        </TouchableOpacity>
        <View style={styles.itemSeparator}/>
        <TouchableOpacity style={styles.settingItemContainer} onPress={() => {onMissionPress()}}>
            <Text style={styles.title}>미션</Text>
            <View style={styles.settingItemRightContent}>
              {missionData.missionType !== 'none' ? (
                <Text style={styles.settingItemRightContentText}>{missionTypeText(missionData.missionType)} {missionData.missionCount}회</Text>
              ) : (
                <Text style={styles.settingItemRightContentText}>미션 없음</Text>
              )}
                <ArrowRightIcon width={24} height={24} color={colors.grayScale900} />
            </View>
        </TouchableOpacity>
        <View style={styles.itemSeparator}/>
        <TouchableOpacity style={styles.settingItemContainer} onPress={() => {onSoundPress()}}>
            <Text style={styles.title}>알람음</Text>
            <View style={styles.settingItemRightContent}>
                <Text style={styles.settingItemRightContentText}>{soundData.soundName}</Text>
                <ArrowRightIcon width={24} height={24} color={colors.grayScale900} />
            </View>
        </TouchableOpacity>
        <View style={styles.itemSeparator}/>
        <View style={styles.settingItemContainer}>
            <Text style={styles.title}>진동</Text>
            <Switch
                value={isVibrationOn}
                onValueChange={() => {onVibrationToggle()}}
                trackColor={{ true: colors.primary300, false: colors.primary200 }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.primary200}
                style={{
                    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
                }}
            />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    ...typography.body1,
    color: colors.grayScale900,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: colors.grayScale100,
  },
  settingItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingItemRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingItemRightContentText: {
    ...typography.body2,
    color: colors.grayScale500,
  },
});

export default AlarmSetting;