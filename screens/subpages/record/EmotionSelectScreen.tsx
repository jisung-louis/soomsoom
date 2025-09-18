import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../../../constants/colors';
import { RecordStackParamList } from '../../../navigations/tabs/RecordStackNavigator';
import { EmotionGrid, Emotion } from '../../../components/tabs/record/EmotionSelect';
import { Button } from '../../../components/common/buttons/Button';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { syongsyongTypography } from '../../../constants/typography';

type RecordScreenNavigationProp = StackNavigationProp<RecordStackParamList, 'EmotionSelectScreen'>;



const EmotionSelectScreen: React.FC = () => {
  const route = useRoute();
  const {date} = route.params as { date: string };
  const navigation = useNavigation<RecordScreenNavigationProp>();
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  
  const handleBack = () => {
    navigation.goBack();
  };

  const handleEmotionSelect = (emotion: Emotion) => {
    setSelectedEmotion(emotion);
  };

  const handleConfirmSelection = () => {
    if (selectedEmotion) {
      // console.log('확정된 감정:', selectedEmotion.name);
      navigation.navigate('EmotionRecordScreen', {
        date: date,
        emotion: selectedEmotion.id,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <SubpageHeader onBack={handleBack} />
      <View style={styles.contentContainer}>
        {/* 타이틀 */}
        <Text style={styles.title}>오늘, 어떤 감정이 가장 가까운가요?</Text>

        {/* 감정 선택 그리드 */}
        <EmotionGrid 
          onEmotionSelect={handleEmotionSelect} 
          selectedEmotionId={selectedEmotion?.id}
        />

        {/* 버튼 */}
        <Button 
          title="감정 선택하기" 
          variant={selectedEmotion ? "active" : "default"} 
          size="large"
          onPress={handleConfirmSelection} 
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  title: {
    alignSelf: 'center',
    ...syongsyongTypography.title5,
  },
  buttonContainer: {
  },
  button: {
    width: '100%',
  },
});

export default EmotionSelectScreen; 