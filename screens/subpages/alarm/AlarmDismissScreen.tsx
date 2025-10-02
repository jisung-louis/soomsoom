import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { REPEAT_WINDOW_MINUTES } from '../../../services/alarmNotificationService';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAlarmStore } from '../../../stores/alarmStore';
import { cancelAlarmNotifications } from '../../../services/alarmNotificationService';
import { ButtonSmall } from '../../../components/common/buttons/ButtonSmall';
import { Button } from '../../../components/common/buttons/Button';
import { radius } from '../../../constants/radius';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { sy } from '../../../utils/scale';
import { AlarmStackParamList } from '../../../navigations/tabs/AlarmStackNavigator';
import { MultiStepMission } from '../../../utils/mathMissionGenerator';
import { AD_SIZES } from '../../../constants/ads';
import { BannerAdSize } from 'react-native-google-mobile-ads';
import AdBanner from '../../../components/common/ads/AdBanner';
import CustomAlert from '../../../components/common/alert/CustomAlert';

interface AlarmDismissScreenProps {
  route: {
    params: {
      alarmId: string;
      missionType?: string;
      missionData?: any;
      missionPack?: MultiStepMission;
      soundName?: string;
    };
  };
}

type AlarmDismissScreenNavigationProp = StackNavigationProp<AlarmStackParamList, 'AlarmDismissScreen'>;

export default function AlarmDismissScreen({ route }: AlarmDismissScreenProps) {
  const navigation = useNavigation<AlarmDismissScreenNavigationProp>();
  const { dismissAlarm } = useAlarmStore();
  const { alarmId, missionType, missionData, missionPack, soundName } = route.params;

  // 랜덤 배경 이미지 선택
  const backgroundImages = [
    require('../../../assets/images/backgrounds/AlarmDismiss/Alarm_BG1.png'),
    require('../../../assets/images/backgrounds/AlarmDismiss/Alarm_BG2.png'),
    require('../../../assets/images/backgrounds/AlarmDismiss/Alarm_BG3.png'),
  ];
  
  const [selectedBackground] = useState(() => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    return backgroundImages[randomIndex];
  });

  const [dismissAlertVisible, setDismissAlertVisible] = useState(false);

  const handleDismiss = async () => {
    try {
      // 알림 취소
      await cancelAlarmNotifications(alarmId);
      // 알람 상태 비활성화
      dismissAlarm(alarmId);
      
      setDismissAlertVisible(true);
      // 알람 탭 스택 초기화 후 홈 탭으로 이동
      
    } catch (error) {
      console.error('알림 해제 실패:', error);
      Alert.alert('오류', '알림 해제에 실패했습니다.');

    }
  };

  const handleDismissAlertClose = () => {
    setDismissAlertVisible(false);
    navigation.getParent()?.reset({
      index: 0,
      routes: [
        { name: 'home' },
        { name: 'record' },
        { name: 'play' },
        { name: 'alarm' },
        { name: 'my' },
      ],
    });
  };
  
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const week = ['일', '월', '화', '수', '목', '금', '토'];
  const timeText = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  const dateText = `${now.getMonth() + 1}월 ${now.getDate()}일 ${week[now.getDay()]}요일`;
  const handleSnooze = async () => {
    try {
      // 기존 예약 알림들 제거(중복 방지)
      await cancelAlarmNotifications(alarmId);

      const startAt = new Date(Date.now() + 5 * 60 * 1000); // 5분 후
      const baseContent: Notifications.NotificationContentInput = {
        title: '기상 리마인더',
        body: '이제 진짜 일어날 시간이에요!!',
        data: { alarmId, missionType, missionData, missionPack ,notificationType: 'ALARM'},
        ...(missionType ? { categoryIdentifier: 'MISSION_ALARM' } : {}),
        sound: soundName ? soundName : 'default',
      };

      // REPEAT_WINDOW_MINUTES 동안 1분 간격으로 벌크 예약
      for (let i = 0; i < REPEAT_WINDOW_MINUTES; i++) {
        const fireAt = new Date(startAt.getTime() + i * 60_000);
        await Notifications.scheduleNotificationAsync({
          content: {
            ...baseContent,
            data: { ...baseContent.data, burstIndex: i, notificationType: 'ALARM' },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
        });
      }

      Alert.alert('스누즈', '5분 후부터 다시 1분 간격으로 울립니다.');
    } catch (e) {
      console.error('스누즈 예약 실패:', e);
      Alert.alert('오류', '스누즈 예약에 실패했습니다.');
    }
  };

  const handleMissionStart = () => {
    if (missionType) {
      navigation.navigate('MissionAccomplishmentScreen', { 
        alarmId, 
        missionType, 
        missionData,
        missionPack
      });
    }
  };

  return (
    <>
      <ImageBackground
        source={selectedBackground}
        style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.date}>{dateText}</Text>
            <Text style={styles.time}>{timeText}</Text>
            <ButtonSmall title="5분 후 다시 알림" variant="active" style={styles.againButton} onPress={handleSnooze} />
          </View>
          <View style={styles.footer}>
              {missionType ? (
                  <Button title="미션 시작" variant="active" style={styles.button} textStyle={{...typography.heading9}} onPress={()=>{handleMissionStart()}} />
              ) : (
                  <Button title="알람 해제" size="large" variant="active" style={styles.button} textStyle={{...typography.heading9}} onPress={handleDismiss} />
              )}
          </View>
      </ImageBackground>
      <View style={styles.adContainer}>
        <AdBanner size={AD_SIZES.ANCHORED_ADAPTIVE_BANNER as BannerAdSize} />
      </View>
      <CustomAlert
        visible={dismissAlertVisible}
        message="알람이 해제되었어요!"
        buttons={[{ text: '확인', onPress: () => { handleDismissAlertClose(); } }]}
        closeButton={false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    alignItems: 'center',
    marginTop: sy(86),
  },
  date: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.black,
  },
  time: {
    fontSize: 100,
    fontWeight: 'bold',
    color: colors.black,
  },
  button: {
    width: '100%',
  },
  againButton: {
    borderRadius: radius.max,
    width: 120,
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 25, //하단 안전영역 고려
    left: 20,
    right: 20,
    gap: 30,
  },
  adContainer: {
    backgroundColor: colors.grayScale400,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
});