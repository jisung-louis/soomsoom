import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { radius } from '../../../../constants/radius';
import { characterIconMap, characterTitleMap } from '../../../../utils/iconMap';

const LAYOUT = Dimensions.get('window');
const BUTTON_WIDTH = (LAYOUT.width - (20 * 2) - 16) / 2;
const BUTTON_HEIGHT = BUTTON_WIDTH;

interface Emotion {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface EmotionGridProps {
  onEmotionSelect: (emotion: Emotion) => void;
  selectedEmotionId?: string;
}

// iconMap.ts의 데이터를 활용하여 감정 배열 생성
const emotions: Emotion[] = [
  {
    id: 'happy',
    name: characterTitleMap.default.happy,
    icon: <characterIconMap.default.happy width={100} height={100} />
  },
  {
    id: 'good',
    name: characterTitleMap.default.good,
    icon: <characterIconMap.default.good width={100} height={100} />
  },
  {
    id: 'soso',
    name: characterTitleMap.default.soso,
    icon: <characterIconMap.default.soso width={100} height={100} />
  },
  {
    id: 'depressed',
    name: characterTitleMap.default.depressed,
    icon: <characterIconMap.default.depressed width={100} height={100} />
  },
  {
    id: 'sad',
    name: characterTitleMap.default.sad,
    icon: <characterIconMap.default.sad width={100} height={100} />
  },
  {
    id: 'angry',
    name: characterTitleMap.default.angry,
    icon: <characterIconMap.default.angry width={100} height={100} />
  },
];

const EmotionGrid: React.FC<EmotionGridProps> = ({ onEmotionSelect, selectedEmotionId }) => {
  const getEmotionIcon = (emotionId: string, isSelected: boolean) => {
    const iconMap = isSelected ? characterIconMap.active : characterIconMap.default;
    const IconComponent = iconMap[emotionId as keyof typeof characterIconMap.default];
    return IconComponent ? <IconComponent width={100} height={100} /> : null;
  };

  return (
    <View style={styles.emotionGridContainer}>
      <FlatList
        data={emotions}
        numColumns={2}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const isSelected = selectedEmotionId === item.id;
          return (
            <TouchableOpacity
              style={[
                styles.emotionButton,
                isSelected && styles.emotionButtonSelected
              ]}
              activeOpacity={0.7}
              onPress={() => onEmotionSelect(item)}
            >
              <View style={styles.emotionIconContainer}>
                {getEmotionIcon(item.id, isSelected)}
              </View>
              <Text style={[
                styles.emotionText,
                isSelected && styles.emotionTextSelected
              ]}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.emotionGrid}
        columnWrapperStyle={styles.emotionGridColumn}
        style={{height: '100%'}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  emotionGridContainer: {
    height: BUTTON_HEIGHT * 3 + (16 * 2),
  },
  emotionButton: {
    //width: 152,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    backgroundColor: colors.grayScale50,
    borderRadius: radius.r20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionButtonSelected: {
    backgroundColor: colors.grayScale900,
  },
  emotionText: {
    ...typography.body4,
    color: colors.grayScale300,
    textAlign: 'center',
  },
  emotionTextSelected: {
    color: colors.white,
  },
  emotionGrid: {
    gap: 16,
  },
  emotionIconContainer: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionGridColumn: {
    gap: 16,
  },
});

export default EmotionGrid;
export type { Emotion }; 