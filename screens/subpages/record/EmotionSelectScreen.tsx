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
      {/* 타이틀 */}
      <Text style={{...syongsyongTypography.title5, ...styles.title}}>오늘, 어떤 감정이 가장 가까운가요?</Text>

      {/* 감정 선택 그리드 */}
      <EmotionGrid 
        onEmotionSelect={handleEmotionSelect} 
        selectedEmotionId={selectedEmotion?.id}
      />

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <Button 
          title="감정 선택하기" 
          variant={selectedEmotion ? "active" : "default"} 
          size="medium"
          onPress={handleConfirmSelection} 
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    alignSelf: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
});

export default EmotionSelectScreen; 