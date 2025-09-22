import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { radius } from '../../../../constants/radius';
import { Button } from '../../../common/buttons/Button';
import CheckActiveIcon from '../../../../assets/icons/common/check_active.svg';
import CheckDisabledIcon from '../../../../assets/icons/common/check_disabled.svg';

interface SoundSelectorProps {
  onConfirm: (soundName: string) => void;
  onCancel: () => void;
  initialSoundName?: string;
}

const SoundSelector: React.FC<SoundSelectorProps> = ({
  onConfirm,
  onCancel,
  initialSoundName = '',
}) => {
  const [selectedSound, setSelectedSound] = useState(initialSoundName);

  const sounds = [
    { name: '신나는 소리'}, // exciting.caf
    { name: '아침 기상 소리'}, // morning_rise.caf
    { name: '하와이풍 소리'}, // hawaii.caf
    { name: '고양이 소리'}, // cat.caf
    { name: '강아지 소리'}, // dog.caf
  ];

  const handleConfirm = () => {
    onConfirm(selectedSound);
  };

  return (
    <View style={styles.container}>
      <View style={styles.soundList}>
        {sounds.map((sound, index) => (
          <View key={sound.name}>
            <TouchableOpacity
              style={styles.soundItem}
              onPress={() => setSelectedSound(sound.name)}
            >
              {selectedSound === sound.name ? (
                <CheckActiveIcon width={24} height={24} color={colors.primary500} />
              ) : (
                <CheckDisabledIcon width={24} height={24} color={colors.grayScale400} />
              )}
              <Text style={styles.soundName}>{sound.name}</Text>
            </TouchableOpacity>
            {index < sounds.length - 1 && <View style={styles.divider} />}
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

export default SoundSelector; 