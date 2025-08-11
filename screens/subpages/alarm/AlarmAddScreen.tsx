import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../constants/colors';
import AlarmHeader from '../../../components/tabs/alarm/AlarmHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AlarmStackParamList } from '../../../navigations/tabs/AlarmStackNavigator';
import { Button } from '../../../components/common/buttons/Button';
import AlarmSetting from '../../../components/tabs/alarm/AlarmAddScreen/AlarmSetting';
import AlarmTimePicker from '../../../components/tabs/alarm/AlarmAddScreen/AlarmTimePicker';
import RepeatSelector from '../../../components/tabs/alarm/AlarmAddScreen/RepeatSelector';
import MissionSelector from '../../../components/tabs/alarm/AlarmAddScreen/MissionSelector';
import SoundSelector from '../../../components/tabs/alarm/AlarmAddScreen/SoundSelector';
import { useAlarmStore } from '../../../stores/alarmStore';
import BottomSheet from '@gorhom/bottom-sheet';
import CustomBottomSheet from '../../../components/common/bottomsheet/CustomBottomSheet';

type BottomSheetType = 'repeat' | 'mission' | 'sound' | null;

const AlarmAddScreen = () => {
  const route = useRoute<RouteProp<AlarmStackParamList, 'AlarmAddScreen'>>();
  const { isCreateMode, alarmId = null } = route.params;
  const navigation = useNavigation<StackNavigationProp<AlarmStackParamList>>();
  const { addAlarm, getAlarmById, updateAlarm, deleteAlarm } = useAlarmStore();
  const [bottomSheetType, setBottomSheetType] = useState<BottomSheetType>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 바텀시트 ref 추가
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  // 기존 알람 데이터 로드 (수정 모드일 때)
  const existingAlarm = alarmId ? getAlarmById(alarmId) : null;
  
  // 24시간 형식을 12시간 형식으로 변환하는 함수
  const convertTo12HourFormat = (time24: string) => {
    const [hour24, minute] = time24.split(':').map(Number);
    const period = hour24 >= 12 ? '오후' : '오전';
    const hour12 = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
    
    return {
      period,
      hour: String(hour12),
      minute: String(minute).padStart(2, '0'),
    };
  };
  
  // 시간 데이터 상태 - 기존 알람이 있으면 그 시간으로, 없으면 현재 시간으로 초기화
  const now = new Date();
  const initialTime = existingAlarm 
    ? convertTo12HourFormat(existingAlarm.time)
    : {
        period: now.getHours() >= 12 ? '오후' : '오전',
        hour: String(now.getHours() > 12 ? now.getHours() - 12 : now.getHours() === 0 ? 12 : now.getHours()),
        minute: String(now.getMinutes()).padStart(2, '0'),
      };
  
  const [selectedTime, setSelectedTime] = useState(initialTime);
  
  // 알람 설정 데이터 상태 - 기존 알람이 있으면 그 설정으로, 없으면 기본값으로 초기화
  const [initialRepeatData, setRepeatData] = useState({
    repeatDays: existingAlarm?.day || [] as string[],
    repeatType: existingAlarm?.repeatType || 'daily',
  });
  const [initialMissionData, setMissionData] = useState({
    missionName: '미션 없음',
  });
  const [initialSoundData, setSoundData] = useState({
    soundName: existingAlarm?.soundName || '기본 벨소리',
  });
  const [isVibrationOn, setIsVibrationOn] = useState(existingAlarm?.isVibrationOn ?? true);

  // 12시간 형식을 24시간 형식으로 변환하는 함수
  const convertTo24HourFormat = (time12: { period: string; hour: string; minute: string }): string => {
    let hour24 = parseInt(time12.hour);
    
    if (time12.period === '오후' && hour24 !== 12) {
      hour24 += 12;
    } else if (time12.period === '오전' && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${time12.minute.padStart(2, '0')}`;
  };

  // 유효성 검사 함수
  const validateAlarmData = (): boolean => {
    const hour = parseInt(selectedTime.hour);
    const minute = parseInt(selectedTime.minute);
    
    if (hour < 1 || hour > 12) {
      Alert.alert('오류', '시간을 올바르게 설정해주세요.');
      return false;
    }
    
    if (minute < 0 || minute > 59) {
      Alert.alert('오류', '분을 올바르게 설정해주세요.');
      return false;
    }
    
    return true;
  };

  const handleBack = () => {
    if (isLoading) return; // 로딩 중에는 뒤로가기 방지
    
    // 변경사항이 있는지 확인 (간단한 체크)
    const hasChanges = initialRepeatData.repeatDays.length > 0 || 
                      initialSoundData.soundName !== '기본 벨소리' ||
                      !isVibrationOn;
    
    if (hasChanges) {
      Alert.alert(
        '변경사항 저장',
        '변경사항이 있습니다. \n저장하지 않고 나가시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '나가기', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
    navigation.goBack();
    }
  };
  
  const handleSuccess = async () => {
    if (isLoading) return;
    
    // 유효성 검사
    if (!validateAlarmData()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 시간 형식 변환
      const timeString = convertTo24HourFormat(selectedTime);
      
      const alarmData = {
        time: timeString,
        repeatDays: initialRepeatData.repeatDays,
        repeatType: initialRepeatData.repeatType,
        soundName: initialSoundData.soundName,
        isVibrationOn: isVibrationOn,
        title: '알람 제목',
        body: `알람 내용 (시간 : ${timeString})`,
      };
      
      if (isCreateMode) {
        // 새 알람 추가
        const newAlarmId = await addAlarm(alarmData);
        console.log('알람 추가 완료 - ID:', newAlarmId);
        Alert.alert('성공', '알람이 성공적으로 추가되었습니다.', [
          { text: '확인', onPress: () => navigation.goBack() }
        ]);
      } else {
        // 기존 알람 수정
        if (!alarmId) {
          throw new Error('알람 ID가 없습니다.');
        }
        await updateAlarm(alarmId, alarmData);
        console.log('알람 수정 완료 - ID:', alarmId);
        Alert.alert('성공', '알람이 성공적으로 수정되었습니다.', [
          { text: '확인', onPress: () => navigation.goBack() }
        ]);
      }
      
    } catch (error) {
      console.error(isCreateMode ? '알람 추가 실패:' : '알람 수정 실패:', error);
      Alert.alert('오류', isCreateMode ? '알람 추가에 실패했습니다.' : '알람 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepeatPress = () => {
    if (isLoading) return;
    setBottomSheetType('repeat');
    bottomSheetRef.current?.expand();
  };
  
  const handleMissionPress = () => {
    if (isLoading) return;
    setBottomSheetType('mission');
    bottomSheetRef.current?.expand();
  };
  
  const handleSoundPress = () => {
    if (isLoading) return;
    setBottomSheetType('sound');
    bottomSheetRef.current?.expand();
  };
  
  const handleVibrationToggle = () => {
    if (isLoading) return;
    setIsVibrationOn(!isVibrationOn);
  };

  const handleCloseBottomSheet = () => {
    setBottomSheetType(null);
    bottomSheetRef.current?.close();
  };

  const handleRepeatConfirm = (repeatDays: string[], repeatType: string) => {
    setRepeatData({ repeatDays, repeatType });
    handleCloseBottomSheet();
  };

  const handleMissionConfirm = (missionName: string) => {
    setMissionData({ missionName });
    handleCloseBottomSheet();
  };

  const handleSoundConfirm = (soundName: string) => {
    setSoundData({ soundName });
    handleCloseBottomSheet();
  };

  const renderBottomSheet = () => {
    switch (bottomSheetType) {
      case 'repeat':
        return (
          <RepeatSelector
            onConfirm={handleRepeatConfirm}
            onCancel={handleCloseBottomSheet}
            initialRepeatDays={initialRepeatData.repeatDays}
            initialRepeatType={initialRepeatData.repeatType}
          />
        );
      case 'mission':
        return (
          <MissionSelector
            onConfirm={handleMissionConfirm}
            onCancel={handleCloseBottomSheet}
            initialMissionName={initialMissionData.missionName}
          />
        );
      case 'sound':
        return (
          <SoundSelector
            onConfirm={handleSoundConfirm}
            onCancel={handleCloseBottomSheet}
            initialSoundName={initialSoundData.soundName}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <AlarmHeader
            onBackPress={() => {handleBack()}}
            onEditAlarmPress={() => {}}
            onSuccessAlarmPress={() => {handleSuccess()}}
            isEditMode={true}
        />
        <View style={styles.timePickerContainer}>
            <AlarmTimePicker 
              onTimeChange={setSelectedTime}
              initialTime={selectedTime}
            />
        </View>
        <View style={styles.alarmSettingContainer}>
            <AlarmSetting 
                onRepeatPress={() => {handleRepeatPress()}}
                onMissionPress={() => {handleMissionPress()}}
                onSoundPress={() => {handleSoundPress()}}
                onVibrationToggle={() => {handleVibrationToggle()}}
                repeatData={initialRepeatData}
                missionData={initialMissionData}
                soundData={initialSoundData}
                isVibrationOn={isVibrationOn}
            />
        </View>
        {!isCreateMode && (
            <View style={styles.buttonContainer}>
                <Button 
                  title="알람 삭제" 
                  variant="secondary"  
                  onPress={async () => {
                    if (isLoading) return;
                    
                    Alert.alert(
                      '알람 삭제',
                      '정말로 이 알람을 삭제하시겠습니까?',
                      [
                        { text: '취소', style: 'cancel' },
                        { 
                          text: '삭제', 
                          style: 'destructive',
                          onPress: async () => {
                            if (!alarmId) return;
                            
                            setIsLoading(true);
                            try {
                              await deleteAlarm(alarmId);
                              Alert.alert('성공', '알람이 삭제되었습니다.', [
                                { text: '확인', onPress: () => navigation.goBack() }
                              ]);
                            } catch (error) {
                              console.error('알람 삭제 실패:', error);
                              Alert.alert('오류', '알람 삭제에 실패했습니다.');
                            } finally {
                              setIsLoading(false);
                            }
                          }
                        }
                      ]
                    );
                  }} 
                />
            </View>
        )}

        <CustomBottomSheet
          children=
          {
            <View style={styles.bottomSheetContainer}>
              {renderBottomSheet()}
            </View>
          }
          bottomSheetModalRef={bottomSheetRef}
        />
    </SafeAreaView>
  );
}; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  timePickerContainer: {
    paddingHorizontal: 20,
    height: 274,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarmSettingContainer: {
    padding: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    alignItems: 'center',
  },
  bottomSheetContainer: {
    padding: 20,
    paddingBottom: 40,
  },
});

export default AlarmAddScreen;