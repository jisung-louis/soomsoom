import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../constants/colors';
import { syongsyongTypography, typography } from '../../../constants/typography';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RecordStackParamList } from '../../../navigations/tabs/RecordStackNavigator';
import { characterIconMap, characterTitleMap } from '../../../utils/iconMap';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import EditButton from '../../../assets/icons/common/edit.svg';
import { useEmotionRecord } from '../../../hooks/useEmotionRecord';
import { emotionDiaryService } from '../../../services/emotionDiaryService';
import { useToast } from '../../../hooks/useToast';
import HelpButton from '../../../assets/icons/common/help.svg';
import { KeyboardEvent, Dimensions } from 'react-native';
import { SUBPAGE_HEADER_HEIGHT } from '../../../components/common/top-navigation/SubpageHeader';
import dayjs from 'dayjs';
import { getLogicalNow } from '../../../utils/timeUtils';
import { eventBus, APP_EVENTS } from '../../../utils/eventBus';

type ScreenMode = 'create' | 'view' | 'edit';

const EmotionRecordScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<StackNavigationProp<RecordStackParamList>>();
  const { showToast } = useToast();
  const params = route.params as ({ date: string; emotion: string } | { diaryId: number });
  
  // 화면 모드 결정
  const isDetail = (params as any).diaryId !== undefined;
  const [screenMode, setScreenMode] = useState<ScreenMode>(isDetail ? 'view' : 'create');
  
  const [emotionKey, setEmotionKey] = useState<string | null>(isDetail ? null : (params as any).emotion);
  const [recordDate, setRecordDate] = useState<string | null>(isDetail ? null : (params as any).date);
  const IconComponent = emotionKey ? characterIconMap.active[emotionKey as keyof typeof characterIconMap.active] : characterIconMap.active.happy;
  const layout = Dimensions.get('window');
  const { top: safeAreaInsetsTop } = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const {
    content,
    isSaving,
    isValidContent,
    setContent,
    saveEmotionRecord,
    formattedDate,
  } = useEmotionRecord(recordDate || '', emotionKey || '');

  const [isTodayRecord, setIsTodayRecord] = useState(false);

  // 상세보기/수정 모드일 경우, 기존 데이터를 불러와서 프리필
  useEffect(() => {
    const loadDiaryIfNeeded = async () => {
      if (screenMode === 'create') return;
      try {
        const d = await emotionDiaryService.getEmotionDiaryById((params as any).diaryId);
        setEmotionKey(d.emotion);
        setRecordDate(d.recordDate);
        setContent(d.memo || '');
        const isToday = dayjs(d.recordDate).isSame(dayjs(), 'day');
        setIsTodayRecord(isToday);
        console.log('📅 기록 날짜:', d.recordDate, '오늘인가?', isToday);
      } catch (e) {
        showToast({ message: '기존 기록을 불러오지 못했어요.', theme: 'dark', iconType: 'brokenHeart' });
        navigation.goBack();
      }
    };
    loadDiaryIfNeeded();
  }, [screenMode, params]);

  // isTodayRecord 상태 변경 디버깅
  useEffect(() => {
    console.log('🔍 isTodayRecord 상태 변경:', isTodayRecord);
  }, [isTodayRecord]);

  // UI 처리 함수들
  const handleBack = () => {
    navigation.goBack();
  };

  const navigateToHelp = () => {
    navigation.navigate('EmotionRecordHelpScreen');
  };

  const handleSave = async () => {
    // 수정 모드 분기
    if (screenMode === 'edit') {
      try {
        if (!emotionKey || !recordDate) {
          showToast({ message: '수정할 데이터를 불러오지 못했어요.', theme: 'dark', iconType: 'brokenHeart' });
          return;
        }
        await emotionDiaryService.updateEmotionDiary((params as any).diaryId, {
          emotion: emotionKey as any,
          memo: content,
        });
        navigation.reset({ index: 0, routes: [{ name: 'RecordTab' }] });
      } catch (e) {
        showToast({ message: '수정에 실패했어요. 다시 시도해주세요.', theme: 'dark', iconType: 'brokenHeart' });
      }
      return;
    }

    // 새로 작성 모드
    if (screenMode === 'create') {
      const result = await saveEmotionRecord();
      if (result.success) {
        // 요약 데이터 새로고침 트리거
        eventBus.emit(APP_EVENTS.REFRESH_SUMMARY);
        // 정책상 토스트 메시지는 띄우지 않음 (주석 처리)
        // // 첫 기록이 아닌 경우에만 토스트 표시
        // if (!result.firstRecord) {
        //   showToast({
        //     message: result.message,
        //     theme: 'light',
        //     iconType: 'alarm',
        //   });
        // }

        // 홈으로 이동 (첫 기록 여부와 함께)
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'RecordTab', 
            params: { isFirstRecord: result.firstRecord } 
          }],
        });
      } else {
        showToast({ message: result.message, theme: 'dark', iconType: 'brokenHeart' });
      }
    }
  };



  const EMOTIONROW_HEIGHT = 48;
  const GAP_HEIGHT = 24;
  const QUESTION_GAP_HEIGHT = 16;
  const QUESTION_HEIGHT = 20*1.4*2;

  const HEADER_HEIGHT = safeAreaInsetsTop + SUBPAGE_HEADER_HEIGHT + (GAP_HEIGHT * 2) + EMOTIONROW_HEIGHT + QUESTION_HEIGHT + QUESTION_GAP_HEIGHT + 10;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        {/* 상단 네비게이션 */}
        <SubpageHeader 
          onBack={handleBack}
            right={
              <>
              {/* 삭제버튼 임시 비활성화 */}
              {/* <TouchableOpacity onPress={() => {
                emotionDiaryService.deleteEmotionDiary((params as any).diaryId);
                navigation.reset({ index: 0, routes: [{ name: 'RecordTab' }] });
              }}>
                <Text style={{marginRight: 20, ...typography.body2, color: 'red',}}>삭제</Text>
              </TouchableOpacity> */}
              {
              screenMode === 'view' ? (
                <TouchableOpacity 
                  onPress={() => {
                    setScreenMode('edit');
                    requestAnimationFrame(() => {
                      inputRef.current?.focus();
                    });
                  }}
                >
                  <EditButton width={36} height={36} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  onPress={navigateToHelp}
                  style={{ 
                    width: 36, 
                    height: 36, 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    opacity: isSaving ? 0.7 : 1 
                  }}
                >
                  <View style={styles.helpButtonContainer}>
                    <HelpButton width={36} height={36} />
                  </View>
                </TouchableOpacity>
              )
              }
              </>
            }
        />
        <View style={styles.contentContainer}>
          {/* 날짜/감정 */}
          <View style={styles.emotionRow}>
            <IconComponent width={48} height={48} />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.dateText}>{recordDate ? formattedDate : ''}</Text>
              <Text style={styles.emotionText}>{emotionKey ? characterTitleMap.active[emotionKey as keyof typeof characterTitleMap.active] : ''}</Text>
            </View>
          </View>
          
          <View style={styles.questionContainer}>
            {/* 질문 */}
            <Text style={{...syongsyongTypography.title5, height: QUESTION_HEIGHT}}>오늘 가장 기억에 남는 일이{"\n"}무엇인가요?</Text>

            {/* 입력창 */}
            <View style={{height: layout.height - HEADER_HEIGHT - keyboardHeight}}>
              <TextInput
                ref={inputRef}
                style={[styles.input, {height: layout.height - HEADER_HEIGHT - keyboardHeight}]}
                placeholder="오늘 가장 기억에 남는 일이 무엇인가요?"
                placeholderTextColor={colors.grayScale500}
                multiline
                value={content}
                onChangeText={setContent}
                cursorColor={colors.primary300}//안드로이드만 커서 컬러 변경 가능하다고 함
                scrollEnabled
                editable={screenMode === 'create' || screenMode === 'edit'}
                autoFocus
              />
            </View>
          </View>
        </View>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.floatingContainer}
        >
          <View style={styles.saveButtonContainer}>
            <TouchableOpacity 
            onPress={isValidContent ? handleSave : undefined} 
            disabled={isSaving}
            activeOpacity={isSaving ? 1 : 0.3}
            >
              {isSaving ? (
                <ActivityIndicator size={16} color={colors.primary300} />
              ) : (
                <Text style={styles.saveButtonText}>저장 {'>'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.white,
   },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    //backgroundColor: 'blue',
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
    //backgroundColor: 'red',
    //flex: 1,
  },
  contentContainer: {
    marginTop: 24,
    gap: 24,
    paddingHorizontal: 30,
    flex: 1,
  },
  questionContainer: {
    flex: 1,
    gap: 16,
    //backgroundColor: 'blue',
  },
  helpButtonContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.grayScale800,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonContainer: {
    height: 42,
    backgroundColor: colors.grayScale100,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  saveButtonText: {
    ...typography.body3,
    color: '#036EE1',
  },
  floatingContainer: {
    position: 'absolute',
    bottom: -10000,
    left: 0,
    right: 0,
  },
});

export default EmotionRecordScreen;