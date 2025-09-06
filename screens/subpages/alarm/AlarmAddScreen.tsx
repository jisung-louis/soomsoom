import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
import { CustomAlert, AlertButton } from '../../../components/common/alert';
import { convert24To12Hour, convert12To24Hour } from '../../../utils/timeUtils';

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
  
  // CustomAlert 상태들 추가
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [showChangesAlert, setShowChangesAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const [showDeleteErrorAlert, setShowDeleteErrorAlert] = useState(false);
  
  // 기존 알람 데이터 로드 (수정 모드일 때)
  const existingAlarm = alarmId ? getAlarmById(alarmId) : null;
  
  // 24시간 형식을 12시간 형식으로 변환하는 함수
  const convertTo12HourFormat = (time24: string) => {
    const { hour12, minute, period } = convert24To12Hour(time24);
    
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
  // const [initialMissionData, setMissionData] = useState({
  //   missionName: '미션 없음',
  // });
  const [initialSoundData, setSoundData] = useState({
    soundName: existingAlarm?.soundName || '기본 벨소리',
  });
  const [isVibrationOn, setIsVibrationOn] = useState(existingAlarm?.isVibrationOn ?? true);

  // 12→24 변환은 공통 유틸 사용 (중복 제거)

  // Alert 버튼들 설정
  const validationAlertButtons: AlertButton[] = [
    { text: '확인', onPress: () => setShowValidationAlert(false) }
  ];

  const changesAlertButtons: AlertButton[] = [
    { text: '취소', onPress: () => setShowChangesAlert(false) },
    { text: '나가기', onPress: () => {
      setShowChangesAlert(false);
      navigation.goBack();
    } }
  ];

  const successAlertButtons: AlertButton[] = [
    { text: '확인', onPress: () => {
      setShowSuccessAlert(false);
      navigation.goBack();
    } }
  ];

  const errorAlertButtons: AlertButton[] = [
    { text: '확인', onPress: () => setShowErrorAlert(false) }
  ];

  const deleteAlertButtons: AlertButton[] = [
    { text: '취소', onPress: () => setShowDeleteAlert(false) },
    { text: '삭제', onPress: async () => {
      if (!alarmId) return;
      
      setIsLoading(true);
      try {
        await deleteAlarm(alarmId);
        setShowDeleteSuccessAlert(true);
      } catch (error) {
        console.error('알람 삭제 실패:', error);
        setShowDeleteErrorAlert(true);
      } finally {
        setIsLoading(false);
      }
    }}
  ];

  const deleteSuccessAlertButtons: AlertButton[] = [
    { text: '확인', onPress: () => {
      setShowDeleteSuccessAlert(false);
      navigation.goBack();
    } }
  ];

  const deleteErrorAlertButtons: AlertButton[] = [
    { text: '확인', onPress: () => setShowDeleteErrorAlert(false) }
  ];

  // 유효성 검사 함수
  const validateAlarmData = (): boolean => {
    const hour = parseInt(selectedTime.hour);
    const minute = parseInt(selectedTime.minute);
    
    if (hour < 1 || hour > 12) {
      setShowValidationAlert(true);
      return false;
    }
    
    if (minute < 0 || minute > 59) {
      setShowValidationAlert(true);
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
      setShowChangesAlert(true);
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
      const timeString = convert12To24Hour(`${selectedTime.period} ${selectedTime.hour}:${selectedTime.minute}`);
      
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
        setShowSuccessAlert(true);
      } else {
        // 기존 알람 수정
        if (!alarmId) {
          throw new Error('알람 ID가 없습니다.');
        }
        await updateAlarm(alarmId, alarmData);
        console.log('알람 수정 완료 - ID:', alarmId);
        setShowSuccessAlert(true);
      }
      
    } catch (error) {
      console.error(isCreateMode ? '알람 추가 실패:' : '알람 수정 실패:', error);
      setShowErrorAlert(true);
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

  const handleMissionConfirm = (missionName: number) => {
    //setMissionData({ missionName });
    {/* TODO: 미션 횟수 저장 필요 */}
    console.log('미션 횟수:', missionName,'회');
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
                //missionData={initialMissionData}
                soundData={initialSoundData}
                isVibrationOn={isVibrationOn}
            />
        </View>
        {!isCreateMode && (
            <View style={styles.buttonContainer}>
                <Button 
                  title="알람 삭제" 
                  variant="secondary"  
                  onPress={() => {
                    if (isLoading) return;
                    setShowDeleteAlert(true);
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

        {/* CustomAlert들 */}
        <CustomAlert
          visible={showValidationAlert}
          message="시간을 올바르게 설정해주세요."
          buttons={validationAlertButtons}
          onClose={() => setShowValidationAlert(false)}
        />

        <CustomAlert
          visible={showChangesAlert}
          message="변경사항이 있어요!"
          subMessage="저장하지 않고 나가시겠어요?"
          buttons={changesAlertButtons}
          onClose={() => setShowChangesAlert(false)}
        />

        <CustomAlert
          visible={showSuccessAlert}
          message={isCreateMode ? "알람이 성공적으로 추가되었어요!" : "알람이 성공적으로 수정되었어요!"}
          buttons={successAlertButtons}
          onClose={() => setShowSuccessAlert(false)}
        />

        <CustomAlert
          visible={showErrorAlert}
          message={isCreateMode ? "알람 추가에 실패했어요." : "알람 수정에 실패했어요."}
          subMessage="다시 시도해주세요."
          buttons={errorAlertButtons}
          onClose={() => setShowErrorAlert(false)}
        />

        <CustomAlert
          visible={showDeleteAlert}
          message="정말로 이 알람을 삭제하시겠어요?"
          buttons={deleteAlertButtons}
          onClose={() => setShowDeleteAlert(false)}
        />

        <CustomAlert
          visible={showDeleteSuccessAlert}
          message="알람이 삭제되었어요."
          buttons={deleteSuccessAlertButtons}
          onClose={() => setShowDeleteSuccessAlert(false)}
        />

        <CustomAlert
          visible={showDeleteErrorAlert}
          message="알람 삭제에 실패했어요."
          buttons={deleteErrorAlertButtons}
          onClose={() => setShowDeleteErrorAlert(false)}
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