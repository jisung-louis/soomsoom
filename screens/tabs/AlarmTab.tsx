import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AlarmHeader from '../../components/tabs/alarm/AlarmHeader';
import { colors } from '../../constants/colors';
import { syongsyongTypography } from '../../constants/typography';
import AlarmListItem from '../../components/tabs/alarm/AlarmListItem';
import FloatingAddIcon from '../../assets/icons/alarm/floating_add_button.svg';
import { AlarmStackParamList } from '../../navigations/tabs/AlarmStackNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useAlarmStore, AlarmItem } from '../../stores/alarmStore';
import { calculateTimeUntilNextAlarm, getCurrentTime } from '../../utils/timeUtils';
import { 
  testBasicNotification,
  testScheduledNotification,
  testRepeatingNotification1Minute,
  testRepeatingNotification,
  checkScheduledNotifications,
  clearAllNotifications,
  checkPermissions
} from '../../utils/notificationUtils';
import NoAlarm from '../../components/tabs/alarm/NoAlarm';
import { useAppConfigStore } from '../../stores/appConfigStore';
import { useNotificationQueueProcessor } from '../../hooks/useNotificationQueueProcessor';

const AlarmTab = () => {
  // 알림 큐 처리 (탭 포커스 시 큐에 있는 알림을 순차적으로 표시)
  useNotificationQueueProcessor();
  
  const navigation = useNavigation<StackNavigationProp<AlarmStackParamList>>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  
  //test
  const [isTestMode, setIsTestMode] = useState(false);
  const { useMockApi } = useAppConfigStore.getState();
  // Zustand store 사용
  const { alarmList, toggleAlarm, deleteAlarm, updateAlarmList } = useAlarmStore();
  
  // 편집 모드에서 사용할 임시 데이터
  const [tempAlarmList, setTempAlarmList] = useState<AlarmItem[]>([]);

  // 시간 계산 함수
  const updateTimeUntilNextAlarm = () => {
    const currentTime = getCurrentTime();
    
    // 활성화된 알람들의 시간만 추출
    const activeAlarmTimes = alarmList
      .filter(alarm => alarm.isActive)
      .map(alarm => alarm.time);
    
    // 가장 가까운 미래 알람까지의 시간 계산
    const timeUntilNext = calculateTimeUntilNextAlarm(currentTime, activeAlarmTimes);
    
    if (timeUntilNext) {
      setHour(timeUntilNext.hours);
      setMinute(timeUntilNext.minutes);
    } else {
      // 활성화된 알람이 없으면 0으로 설정
      setHour(0);
      setMinute(0);
    }
  };

  // 컴포넌트 마운트 시와 1분마다 시간 업데이트
  useEffect(() => {
    updateTimeUntilNextAlarm(); // 즉시 실행 (초기 계산)
    
    // 다음 분의 시작점까지 대기 후 1분마다 실행
    const now = new Date();
    const delayToNextMinute = (60 - now.getSeconds()) * 1000;
    
    const timeout = setTimeout(() => {
      updateTimeUntilNextAlarm(); // 다음 분 시작점에 실행
      
      const interval = setInterval(updateTimeUntilNextAlarm, 60000);
      return () => clearInterval(interval);
    }, delayToNextMinute);
    
    return () => clearTimeout(timeout);
  }, [alarmList]); // alarmList가 변경될 때마다 재계산

  // 편집 모드 시작
  const handleEditModeStart = () => {
    setTempAlarmList([...alarmList]); // 현재 데이터를 임시 저장
    setIsEditMode(true);
  };

  // 편집 모드 취소 (변경사항 저장 안함)
  const handleEditModeCancel = () => {
    setIsEditMode(false);
    setTempAlarmList([]); // 임시 데이터 초기화
    //TODO: 저장을 안하고 돌아가겠냐는 경고 모달 띄우기
  };

  // 편집 모드 완료 (변경사항 저장)
  const handleEditModeSuccess = async () => {
    // 1. 먼저 삭제된 알람들 찾기 (tempAlarmList가 아직 유효할 때)
    const deletedAlarms = alarmList.filter(
      original => !tempAlarmList.find(temp => temp.id === original.id)
    );
    
    // 2. 삭제된 알람들의 알림 예약 취소
    for (const alarm of deletedAlarms) {
      await deleteAlarm(alarm.id);
    }
    
    // 3. tempAlarmList로 업데이트
    updateAlarmList(tempAlarmList);
    
    // 4. 마지막에 편집모드 종료 및 tempAlarmList 초기화
    setIsEditMode(false);
    setTempAlarmList([]); // 임시 데이터 초기화
    // 여기서 실제 저장 로직을 추가할 수 있습니다 (API 호출 등)
  };

  // 편집 모드에서 알람 삭제 (임시 리스트에서만 삭제)
  const handleEditModeDelete = (id: number) => {
    setTempAlarmList(prevList => prevList.filter((item) => item.id !== id));
  };

  // 알람 토글 처리
  const handleAlarmToggle = async (id: number) => {
    try {
      await toggleAlarm(id);
    } catch (error) {
      console.error('알람 토글 실패:', error);
    }
  };

  // 테스트 함수들
  const handleTestBasic = () => testBasicNotification();
  const handleTestScheduled = () => testScheduledNotification();
  const handleTestRepeating1Minute = () => testRepeatingNotification1Minute();
  const handleTestRepeating = () => testRepeatingNotification();
  const handleCheckScheduled = () => checkScheduledNotifications();
  const handleClearAll = () => clearAllNotifications();
  const handleCheckPermissions = () => checkPermissions();

  // 현재 표시할 알람 리스트 (편집 모드일 때는 임시 데이터, 아닐 때는 실제 데이터)
  const displayAlarmList = isEditMode ? tempAlarmList : alarmList;

  return (
  <SafeAreaView style={styles.container}>
    {useMockApi && (
      <>
      {isTestMode && (
        <View style={styles.testButtonContainer}>
          <TouchableOpacity style={styles.testButton} onPress={handleCheckPermissions}>
            <Text style={styles.testButtonText}>권한 확인</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.testButton} onPress={handleTestBasic}>
            <Text style={styles.testButtonText}>1초 후 알림</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.testButton} onPress={handleTestScheduled}>
            <Text style={styles.testButtonText}>10초 후 알림</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.testButton} onPress={handleTestRepeating1Minute}>
            <Text style={styles.testButtonText}>1분 마다 알림</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.testButton} onPress={handleTestRepeating}>
            <Text style={styles.testButtonText}>반복 알림</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.testButton} onPress={handleCheckScheduled}>
            <Text style={styles.testButtonText}>예약 확인</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.testButton} onPress={handleClearAll}>
            <Text style={styles.testButtonText}>모두 취소</Text>
          </TouchableOpacity>
        </View>
        )}
        <TouchableOpacity onPress={() => setIsTestMode(!isTestMode)} style={styles.testButton}>
          <Text style={{fontSize: 12}}>{isTestMode ? '테스트 모드 해제하기' : '테스트 모드 켜기'}</Text>
        </TouchableOpacity>
      </>
    )}
    {displayAlarmList.length === 0 && !isEditMode ? (
        <NoAlarm onAddAlarmPress={() => {navigation.navigate('AlarmAddScreen', { isCreateMode: true })}} />
      ) : (
        <>
          <AlarmHeader
            onBackPress={handleEditModeCancel}
            onEditAlarmPress={handleEditModeStart}
            onSuccessAlarmPress={handleEditModeSuccess}
            isEditMode={isEditMode}
          />
          <View style={styles.textContainer}>
            <Text style={{...syongsyongTypography.title4}}>{hour}시간 {minute}분 {"\n"}후에 깨워 드릴게요!</Text>
          </View>
          <View style={styles.alarmListContainer}>
              <FlatList
                data={displayAlarmList.sort((a, b) => a.time.localeCompare(b.time))}
                renderItem={({ item }) => (
                  <AlarmListItem item={item} 
                    toggleSwitch={handleAlarmToggle} 
                    isEditMode={isEditMode} 
                    onDeleteAlarm={handleEditModeDelete}
                    onEditAlarmPress={() => {navigation.navigate('AlarmAddScreen', { isCreateMode: false, alarmId: item.id })}}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
                ItemSeparatorComponent={() => <View style={{height: 1, backgroundColor: colors.grayScale100,}} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 150 }}
              />
          </View>
        </>
    )}
    <TouchableOpacity style={styles.floatingAddButtonContainer} onPress={() => {navigation.navigate('AlarmAddScreen', { isCreateMode: true })}}>
      <FloatingAddIcon width={64} height={64} />
    </TouchableOpacity>
    
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  testButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.grayScale50,
  },
  testButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.grayScale200,
  },
  testButtonText: {
    fontSize: 12,
    color: colors.black,
    fontWeight: '500',
  },
  textContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  alarmListContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  alarmItem: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alarmItemTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  alarmItemDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  floatingAddButtonContainer: {
    position: 'absolute',
    bottom: 140, // 하단 여백 (홈 인디케이터 고려해서 30~40 적당)
    right: 20,  // 오른쪽 여백
    zIndex: 1000,
    //그림자
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default AlarmTab;

