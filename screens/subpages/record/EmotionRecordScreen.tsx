import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../constants/colors';
import { syongsyongTypography, typography } from '../../../constants/typography';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RecordStackParamList } from '../../../navigations/tabs/RecordStackNavigator';
import { characterIconMap, characterTitleMap } from '../../../utils/iconMap';
import ToastView from '../../../components/common/toast/ToastView';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import SaveButton from '../../../assets/icons/common/edit.svg';
import { useEmotionRecord } from '../../../hooks/useEmotionRecord';
import { useToast } from '../../../hooks/useToast';

const EmotionRecordScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<StackNavigationProp<RecordStackParamList>>();
  const { showToast } = useToast();
  const { date, emotion } = route.params as { date: string, emotion: string };
  const IconComponent = characterIconMap.active[emotion as keyof typeof characterIconMap.active];

  const {
    content,
    isSaving,
    isValidContent,
    setContent,
    saveEmotionRecord,
    formattedDate,
  } = useEmotionRecord(date, emotion);

  // UI 처리 함수들
  const handleBack = () => {
    navigation.goBack();
  };

  const navigateToHelp = () => {
    navigation.navigate('EmotionRecordHelpScreen');
  };

  const showFirstRecordCelebration = () => {
    // TODO: 첫 기록일 축하 팝업 구현 (docs/TODO.md 참조)
    console.log('🎉 첫 감정 기록을 축하합니다!');
  };

  const handleSave = async () => {
    const result = await saveEmotionRecord();
    
    if (result.success) {
      // 성공 토스트
      showToast({
        message: result.message,
        theme: 'light',
        iconType: 'alarm',
      });

      // 첫 기록일 축하
      if (result.firstRecord) {
        showFirstRecordCelebration();
      }

      // 홈으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: 'RecordTab' }],
      });
    } else {
      // 에러 토스트
      showToast({
        message: result.message,
        theme: 'dark',
        iconType: 'brokenHeart',
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        {/* 상단 네비게이션 */}
        <SubpageHeader 
          onBack={handleBack}
          right={
            <TouchableOpacity 
              onPress={handleSave}
              disabled={isSaving || !isValidContent}
              style={{ 
                width: 36, 
                height: 36, 
                alignItems: 'center', 
                justifyContent: 'center',
                opacity: (isSaving || !isValidContent) ? 0.7 : 1 
              }}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.primary300} />
              ) : (
                <SaveButton width={36} height={36} />
              )}
            </TouchableOpacity>
          }
        />
        <View style={styles.contentContainer}>
          {/* 날짜/감정 */}
          <View style={styles.emotionRow}>
            <IconComponent width={48} height={48} />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.dateText}>{formattedDate}</Text>
              <Text style={styles.emotionText}>{characterTitleMap.active[emotion as keyof typeof characterTitleMap.active]}</Text>
            </View>
          </View>
          
          <View style={styles.questionContainer}>
            {/* 질문 */}
            <Text style={{...syongsyongTypography.title5}}>오늘 가장 기억에 남는 일이{"\n"}무엇인가요?</Text>

            {/* 입력창 */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <TextInput
                style={[styles.input, {minHeight: 250}]}
                placeholder="오늘 가장 기억에 남는 일이 무엇인가요?"
                placeholderTextColor={colors.grayScale500}
                multiline
                value={content}
                onChangeText={setContent}
              />
            </KeyboardAvoidingView>
          </View>
        </View>
        {/* 플로팅 도움말 버튼 */}{/* 기획에서 제외됨 */}
        {/* <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}
          style={styles.floatingContainer}
          pointerEvents="box-none"
        >
          <TouchableOpacity activeOpacity={0.8} onPress={navigateToHelp}>
            <ToastView
              message="도움말을 보고 시작해볼까요?"
              theme="light"
              iconType="help"
              style={{ alignSelf: 'center' }}
            />
          </TouchableOpacity>
        </KeyboardAvoidingView> */}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...typography.body5,
    color: colors.grayScale300,
  },
  emotionText: {
    ...typography.body1,
    color: colors.primary300,
  },
  input: {
    textAlignVertical: 'top',
    ...typography.body2,
    color: colors.grayScale800,
  },
  contentContainer: {
    marginTop: 24,
    gap: 24,
    paddingHorizontal: 30,
  },
  questionContainer: {
    gap: 16,
  },
  // 주석 처리된 플로팅 도움말 관련 스타일 (향후 사용 가능)
  // floatingContainer: {
  //   position: 'absolute',
  //   bottom: 50,
  //   left: 0,    
  //   right: 0,
  //   alignItems: 'center',
  //   zIndex: 100000,
  // },
});

export default EmotionRecordScreen;