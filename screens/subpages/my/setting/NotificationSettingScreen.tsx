import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SubpageHeader from '../../../../components/common/top-navigation/SubpageHeader';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import ArrowRightIcon from '../../../../assets/icons/common/arrow_right.svg';
import BottomSheet from '@gorhom/bottom-sheet';
import CustomBottomSheet from '../../../../components/common/bottomsheet/CustomBottomSheet';
import NotificationTimePicker from '../../../../components/tabs/my/setting/NotificationTimePicker';
import { Button } from '../../../../components/common/buttons/Button';
import { cancelAlarmNotifications, requestNotificationPermissions } from '../../../../services/alarmNotificationService';
import { scheduleDiaryNotification } from '../../../../utils/notificationUtils';
import { parseNotificationTime } from '../../../../utils/timeUtils';
import { useToast } from '../../../../hooks/useToast';
import { useAppConfigStore } from '../../../../stores/appConfigStore';

interface TimeData {
  period: string;
  hour: string;
  minute: string;
}

const NotificationSettingScreen = () => {
    const navigation = useNavigation();
    const [notificationTime, setNotificationTime] = useState<TimeData>({ 
      period: '오후', 
      hour: '8', 
      minute: '30' 
    });

    const { showToast } = useToast();
    const { useMockApi } = useAppConfigStore.getState();
    // 마음일기 알림 상태 관리
    const [isDiaryNotificationEnabled, setIsDiaryNotificationEnabled] = useState(false);
    const [isGreetingNotificationEnabled, setIsGreetingNotificationEnabled] = useState(false);
    const [isNewsNotificationEnabled, setIsNewsNotificationEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const bottomSheetRef = useRef<BottomSheet>(null);

    // 알림 권한 확인 함수
    const checkNotificationPermission = async () => {
        const hasPermission = await requestNotificationPermissions();
        
        if (!hasPermission) {
            Alert.alert(
                '알림 권한 필요',
                '마음일기 알림을 받으려면 알림 권한이 필요합니다.',
                [{ text: '확인' }]
            );
            return false;
        }
        
        return true;
    };

    // 알림 스케줄링 함수
    const scheduleDiaryNotificationLocal = async () => {
        try {
            const timeString = `${notificationTime.period} ${notificationTime.hour}:${notificationTime.minute.padStart(2, '0')}`;
            console.log('스케줄링할 시간 문자열:', timeString);
            
            const success = await scheduleDiaryNotification(timeString);
            
            if (success) {
                console.log('마음일기 알림 스케줄링 완료');
            } else {
                console.error('마음일기 알림 스케줄링 실패');
            }
        } catch (error) {
            console.error('알림 스케줄링 실패:', error);
        }
    };

    // 특정 시간으로 알림 스케줄링하는 함수
    const scheduleDiaryNotificationWithTime = async (time: TimeData) => {
        try {
            const timeString = `${time.period} ${time.hour}:${time.minute.padStart(2, '0')}`;
            console.log('새로운 시간으로 스케줄링:', timeString);
            
            const success = await scheduleDiaryNotification(timeString);
            
            if (success) {
                console.log('마음일기 알림 스케줄링 완료');
            } else {
                console.error('마음일기 알림 스케줄링 실패');
            }
        } catch (error) {
            console.error('알림 스케줄링 실패:', error);
        }
    };

    // 알림 취소 함수
    const cancelDiaryNotification = async () => {
        try {
            await cancelAlarmNotifications('diary_notification');
            console.log('마음일기 알림 취소 완료');
        } catch (error) {
            console.error('알림 취소 실패:', error);
        }
    };

    // 앱 시작 시 저장된 알림 설정 불러오기
    useEffect(() => {
        loadNotificationSettings();
    }, []);

    const loadNotificationSettings = async () => {
        try {
            const diaryNotification = await AsyncStorage.getItem('diaryNotificationEnabled');
            const greetingNotification = await AsyncStorage.getItem('greetingNotificationEnabled');
            const newsNotification = await AsyncStorage.getItem('newsNotificationEnabled');
            const diaryNotificationTime = await AsyncStorage.getItem('diaryNotificationTime');

            const { period, hour, minute } = parseNotificationTime(diaryNotificationTime || '오후 8:30');

            // null인 경우 AsyncStorage에 false로 저장
            if (greetingNotification === null) {
                await AsyncStorage.setItem('greetingNotificationEnabled', 'false');
            }
            if (newsNotification === null) {
                await AsyncStorage.setItem('newsNotificationEnabled', 'false');
            }
            
            // AsyncStorage에서 읽어온 값으로 state 설정
            setIsDiaryNotificationEnabled(diaryNotification === 'true');
            setIsGreetingNotificationEnabled(greetingNotification === 'true');
            setIsNewsNotificationEnabled(newsNotification === 'true');
            setNotificationTime({period, hour: hour.toString(), minute: minute.toString()});
            
        } catch (error) {
            console.error('알림 설정 불러오기 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDiaryNotificationToggle = async (value: boolean) => {
        try {
            setIsDiaryNotificationEnabled(value);
            await AsyncStorage.setItem('diaryNotificationEnabled', value.toString());
            
            if (value) {
                // 1. 알림 권한 확인
                const hasPermission = await checkNotificationPermission();
                if (!hasPermission) {
                    // 권한이 없으면 상태를 되돌리기
                    setIsDiaryNotificationEnabled(false);
                    await AsyncStorage.setItem('diaryNotificationEnabled', 'false');
                    return;
                }
                
                // 2. 현재 설정된 시간으로 알림 스케줄링
                await scheduleDiaryNotificationLocal();
                
                // 3. 알림 활성화 되었다는 토스트 메시지
                //Alert.alert('알림 활성화', '마음일기 알림이 활성화되었습니다.');
                showToast({
                    message: '마음일기 알람이 설정되었어요!',
                    theme: 'dark',
                    iconType: 'alarm',
                    duration: 2500,
                });
                
            } else {
                // 1. 기존 알림 스케줄 취소
                await cancelDiaryNotification();
                
                // 2. 알림 비활성화 되었다는 토스트 메시지
                //Alert.alert('알림 비활성화', '마음일기 알림이 비활성화되었습니다.');
                showToast({
                    message: '마음일기 알람이 해제되었어요!',
                    theme: 'dark',
                    iconType: 'brokenHeart',
                    duration: 2500,
                });
            }
        } catch (error) {
            console.error('알림 설정 저장 실패:', error);
            // 실패 시 원래 상태로 되돌리기
            setIsDiaryNotificationEnabled(!value);
        }
    };

    const handleGreetingNotificationToggle = async (value: boolean) => {
        try {
            setIsGreetingNotificationEnabled(value);
            await AsyncStorage.setItem('greetingNotificationEnabled', value.toString());
            
            if (value) {
                console.log('숨숨 인사 알림 활성화');
                // TODO: 백엔드 API 호출 (docs/TODO.md 참조)
                // await updateNotificationSettings({ greeting: true });
            } else {
                console.log('숨숨 인사 알림 비활성화');
                // TODO: 백엔드 API 호출 (docs/TODO.md 참조)
                // await updateNotificationSettings({ greeting: false });
            }
        } catch (error) {
            console.error('알림 설정 저장 실패:', error);
            setIsGreetingNotificationEnabled(!value);
        }
    };

    const handleNewsNotificationToggle = async (value: boolean) => {
        try {
            setIsNewsNotificationEnabled(value);
            await AsyncStorage.setItem('newsNotificationEnabled', value.toString());
            
            if (value) {
                console.log('숨숨 소식 알림 활성화');
                // TODO: 백엔드 API 호출 (docs/TODO.md 참조)
                // await updateNotificationSettings({ news: true });
            } else {
                console.log('숨숨 소식 알림 비활성화');
                // TODO: 백엔드 API 호출 (docs/TODO.md 참조)
                // await updateNotificationSettings({ news: false });
            }
        } catch (error) {
            console.error('알림 설정 저장 실패:', error);
            setIsNewsNotificationEnabled(!value);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleTimePress = () => {
        bottomSheetRef.current?.expand();
    };

    const handleTimeConfirm = async (time: TimeData) => {
        try {
            console.log('시간 변경 요청:', time);
            setNotificationTime(time);
            
            // AsyncStorage에 시간 저장
            const timeString = `${time.period} ${time.hour}:${time.minute.padStart(2, '0')}`;
            await AsyncStorage.setItem('diaryNotificationTime', timeString);
            
            console.log('마음일기 알림 시간 저장:', timeString);
            console.log('현재 알림 활성화 상태:', isDiaryNotificationEnabled);
            
            // 알림이 활성화되어 있다면 새로운 시간으로 스케줄링 업데이트
            if (isDiaryNotificationEnabled) {
                console.log('알림이 활성화되어 있으므로 새로운 시간으로 스케줄링 업데이트');
                await scheduleDiaryNotificationWithTime(time); // 새로운 시간을 직접 전달
                //Alert.alert('알림 시간 변경', '마음일기 알림 시간이 변경되었습니다.');
                showToast({
                    message: '마음일기 알람 시간이 변경되었어요!',
                    theme: 'dark',
                    iconType: 'alarm',
                    duration: 2500,
                });
            } else {
                console.log('알림이 비활성화되어 있으므로 스케줄링하지 않음');
            }
            
        } catch (error) {
            console.error('알림 시간 저장 실패:', error);
        }
        
        bottomSheetRef.current?.close();
    };

    const handleTimeCancel = () => {
        bottomSheetRef.current?.close();
    };

    const formatTimeDisplay = (time: TimeData) => {
        return `${time.period} ${time.hour}:${time.minute.padStart(2, '0')}`;
    };

  return (
    <SafeAreaView style={styles.container}>
        <SubpageHeader onBack={handleBack} />
        <View style={styles.contentContainer}>
            <View style={styles.settingItem}>
                <Text style={styles.settingItemText}>마음일기 알림</Text>
                <Switch
                    value={isDiaryNotificationEnabled}
                    onValueChange={handleDiaryNotificationToggle}
                    trackColor={{ false: colors.primary200, true: colors.primary300 }}
                    ios_backgroundColor={colors.primary200}
                    style={{transform: [{scaleX: 0.9}, {scaleY: 0.9}]}}
                />
            </View>
            <TouchableOpacity style={styles.settingItem} onPress={handleTimePress}>
                <Text style={styles.settingItemText}>마음일기 알림 시간</Text>
                <View style={styles.settingItemRightContainer}>
                    <Text style={styles.notificationTimeText}>{formatTimeDisplay(notificationTime)}</Text>
                    <ArrowRightIcon width={24} height={24} />
                </View>
            </TouchableOpacity>
            <View style={styles.settingItem}>
                <Text style={styles.settingItemText}>숨숨 인사 알림</Text>
                <Switch
                    value={isGreetingNotificationEnabled}
                    onValueChange={handleGreetingNotificationToggle}
                    trackColor={{ false: colors.primary200, true: colors.primary300 }}
                    ios_backgroundColor={colors.primary200}
                    style={{transform: [{scaleX: 0.9}, {scaleY: 0.9}]}}
                />
            </View>
            <View style={styles.settingItem}>
                <Text style={styles.settingItemText}>숨숨 소식 알림</Text>
                <Switch
                    value={isNewsNotificationEnabled}
                    onValueChange={handleNewsNotificationToggle}
                    trackColor={{ false: colors.primary200, true: colors.primary300 }}
                    ios_backgroundColor={colors.primary200}
                    style={{transform: [{scaleX: 0.9}, {scaleY: 0.9}]}}
                />
            </View>

            {/* 개발자 옵션(추후 삭제 예정) */}
            {useMockApi && (
            <View style={
                {
                    marginTop: 20,
                    gap: 16,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 16,
                }
            }>
                <Text style={styles.settingItemText}>개발자 옵션{`\n`}(위험! 건들면 앱 크래시 날 수 있음)</Text>
                <View style={styles.settingItem}>
                    <Button title="AsyncStorage 내역 로그로 보기" onPress={() => {
                        AsyncStorage.getAllKeys().then((keys) => {
                            keys.forEach((key) => {
                                AsyncStorage.getItem(key).then((value) => {
                                    console.log(`${key}: ${value}`);
                                });
                            });
                        });
                    }} />
                </View>
                <View style={styles.settingItem}>
                    <Button title="AsyncStorage 모두 삭제" onPress={() => {
                        AsyncStorage.clear();
                        loadNotificationSettings();
                    }} />
                    </View>
                </View>
            )}
        </View>
        {/** 알림 시간 선택 바텀시트 */}    
        <CustomBottomSheet
            children=
            {
                <NotificationTimePicker
                    onClose={handleTimeCancel}
                    onConfirm={handleTimeConfirm}
                    initialTime={notificationTime}
                />
            }
            bottomSheetModalRef={bottomSheetRef}
        />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contentContainer: {
        paddingHorizontal: 20,
        gap: 16,
        marginTop: 30,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingItemText: {
        ...typography.body1,
        color: colors.grayScale900,
        textAlign: 'center',
    },
    notificationTimeText: {
        ...typography.body1,
        color: colors.primary300,
    },
    settingItemRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});

export default NotificationSettingScreen;