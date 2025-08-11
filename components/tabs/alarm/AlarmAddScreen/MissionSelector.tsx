import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { radius } from '../../../../constants/radius';
import { Button } from '../../../common/buttons/Button';
import CheckActiveIcon from '../../../../assets/icons/common/check_active.svg';
import CheckDisabledIcon from '../../../../assets/icons/common/check_disabled.svg';

interface MissionSelectorProps {
  onConfirm: (missionName: string) => void;
  onCancel: () => void;
  initialMissionName?: string;
}

const MissionSelector: React.FC<MissionSelectorProps> = ({
  onConfirm,
  onCancel,
  initialMissionName = '',
}) => {
  const [selectedMission, setSelectedMission] = useState<string>(initialMissionName);

  const missions = [
    { name: '기본 벨소리'},
    { name: '목탁 소리'},
    { name: '자연 소리'},
    { name: '고양이 소리'},
    { name: '강아지 소리'},
  ];

  const handleConfirm = () => {
    onConfirm(selectedMission);
  };

  return (
    <View style={styles.container}>
      <View style={styles.soundList}>
        {missions.map((mission, index) => (
          <View key={mission.name}>
            <TouchableOpacity
              style={styles.soundItem}
              onPress={() => setSelectedMission(mission.name)}
            >
              {selectedMission === mission.name ? (
                <CheckActiveIcon width={24} height={24} color={colors.primary500} />
              ) : (
                <CheckDisabledIcon width={24} height={24} color={colors.grayScale400} />
              )}
              <Text style={styles.soundName}>{mission.name}</Text>
            </TouchableOpacity>
            {index < missions.length - 1 && <View style={styles.divider} />}
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
  soundList: {
    // flex: 1 제거하여 내부 콘텐츠 크기에 맞춤
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  soundName: {
    ...typography.body2,
    color: colors.grayScale900,
    marginLeft: 16,
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

export default MissionSelector; 