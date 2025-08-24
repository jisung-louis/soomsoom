import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../constants/colors';
import { syongsyongTypography, typography } from '../../../constants/typography';
import { RecordStackParamList } from '../../../navigations/tabs/RecordStackNavigator';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { characterIconMap, characterTitleMap } from '../../../utils/iconMap';
import { useToast } from '../../../hooks/useToast';
import dayjs from 'dayjs';
import HelpIcon from '../../../assets/icons/common/help.svg';
import BrokenHeartIcon from '../../../assets/icons/common/broken_Heart.svg';
import HeartIcon from '../../../assets/icons/common/Heart.svg';
import ToastView from '../../../components/common/toast/ToastView';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import SaveButton from '../../../assets/icons/common/edit.svg';

type RecordScreenNavigationProp = StackNavigationProp<RecordStackParamList, 'EmotionRecordScreen'>;

const EmotionRecordScreen = () => {
  const route = useRoute();
  const {date, emotion} = route.params as { date: string, emotion: string };
  const IconComponent = characterIconMap.active[emotion as keyof typeof characterIconMap.active];

  const navigation = useNavigation<RecordScreenNavigationProp>();
  const [content, setContent] = useState('');
  const { showToast } = useToast();
  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    console.log('[저장됨]');
    console.log('| date:', dayjs(date).format('MM.DD'),'| emotion:', emotion,'| content:', content,'|');
    // TODO: 백엔드에 저장 요청
    // TODO: 첫 기록일 시 체크하여 레이어팝업 띄우기
   if (content.length < 1) {
    showToast({
      message: '내용을 입력해주세요 !',
      theme: 'dark',
      iconType: 'brokenHeart',
    });
    } else {
        navigation.reset({
            index: 0,
            routes: [{ name: 'RecordTab' }],
        });
        showToast({
          message: '기록이 저장되었어요(아직 백엔드 연결 안됨) !',
          theme: 'light',
          iconType: 'alarm',
        });
    }
   }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        {/* 상단 네비게이션 */}
        <SubpageHeader 
          onBack={handleBack}
          right={<TouchableOpacity onPress={handleSave}><SaveButton width={36} height={36} /></TouchableOpacity>}
        />
        <View style={styles.contentContainer}>
          {/* 날짜/감정 */}
          <View style={styles.emotionRow}>
            <IconComponent width={48} height={48} />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.dateText}>{dayjs(date).format('MM.DD')}</Text>
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
        {/* 플로팅 도움말 버튼 */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}
          style={styles.floatingContainer}
          pointerEvents="box-none"
        >
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('EmotionRecordHelpScreen')}>
            <ToastView
              message="도움말을 보고 시작해볼까요?"
              theme="light"
              iconType="help"
              style={{ alignSelf: 'center' }}
            />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  saveText: {
    color: colors.primary300,
    ...typography.body1,
  },
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
  questionTitle: {
  },
  helpBox: {
    marginHorizontal: 20,
    marginBottom: 12,
    zIndex: 1000,
  },
  helpText: {
    color: colors.grayScale400,
    ...typography.body5,
  },
  input: {
    //backgroundColor: colors.grayScale50, //임시
    textAlignVertical: 'top',
    ...typography.body2,
    color: colors.grayScale800,
  },
  contentContainer: {
    marginTop: 24,
    gap:24,
    paddingHorizontal: 30,
  },
  questionContainer: {
    gap:16,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,    
    right: 0,
    alignItems: 'center',
    zIndex: 100000,
  },
});

export default EmotionRecordScreen;