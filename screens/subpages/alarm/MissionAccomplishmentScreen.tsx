import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAlarmStore } from '../../../stores/alarmStore';
import { cancelAlarmNotifications } from '../../../services/alarmNotificationService';
import { Button } from '../../../components/common/buttons/Button';
import { ButtonSmall } from '../../../components/common/buttons/ButtonSmall';
import { typography } from '../../../constants/typography';
import { sy, ss, sv } from '../../../utils/scale';
import { MathMission, MultiStepMission, validateMathAnswer } from '../../../utils/mathMissionGenerator';
import { radius } from '../../../constants/radius';
import { colors } from '../../../constants/colors';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import CheckIcon from '../../../assets/icons/common/check.svg';
import BackIcon from '../../../assets/icons/common/back_icon.svg';
import AdBanner from '../../../components/common/ads/AdBanner';
import CustomAlert from '../../../components/common/alert/CustomAlert';
import { AD_SIZES } from '../../../constants/ads';
import { BannerAdSize } from 'react-native-google-mobile-ads';
import { useScreenAnalytics } from '../../../hooks/useScreenAnalytics';

interface MissionAccomplishmentScreenProps {
  route: {
    params: {
      alarmId: string;
      missionType: string;
      missionData: MathMission;
      missionPack?: MultiStepMission;
    };
  };
}

function MissionAccomplishmentScreen({ route }: MissionAccomplishmentScreenProps) {
  useScreenAnalytics('MissionAccomplishmentScreen');

  const { alarmId, missionType, missionData, missionPack } = route.params;
  const navigation = useNavigation();
  const { dismissAlarm, updateMissionProgress } = useAlarmStore();
  
  const [currentAnswer, setCurrentAnswer] = useState('');
  // 시도 횟수 제한 제거
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [wrongState, setWrongState] = useState(false);
  const [completeAlertVisible, setCompleteAlertVisible] = useState(false);
  const [skipConfirmVisible, setSkipConfirmVisible] = useState(false);

  const handleAnswer = (answer: string) => {
    if (isCompleted) return;
    
    const newAnswer = currentAnswer + answer;
    setCurrentAnswer(newAnswer);
    setWrongState(false);
  };
  
  const handleDelete = () => {
    setCurrentAnswer(currentAnswer.slice(0, -1));
    setWrongState(false);
  };

  const handleSubmit = () => {
    if (isCompleted) return;
    
    // 현재 미션 결정: 단일 또는 다회 중 현재 인덱스
    const activeMission: MathMission = missionPack ? missionPack.missions[currentIndex] : missionData;
    
    if (missionType === 'math' && activeMission) {
      const { isCorrect, shouldDismiss } = validateMathAnswer(activeMission, currentAnswer);
      
      if (isCorrect) {
        // 다회 미션이면 다음 문제로 진행, 마지막이면 완료 처리
        if (missionPack && currentIndex < missionPack.total - 1) {
          setCurrentIndex((idx) => idx + 1);
          setCurrentAnswer('');
          setWrongState(false);
        } else {
          setIsCompleted(true);
          setCompleteAlertVisible(true);
        }
      } else {
        setWrongState(true);
        setCurrentAnswer('');
      }
    }
  };

  const handleMissionComplete = async () => {
    try {
      // 알림 취소
      await cancelAlarmNotifications(alarmId);
      // 알람 상태 비활성화
      dismissAlarm(alarmId);
      console.log('[MissionAccomplishmentScreen] 알람 취소 및 알람 상태 비활성화 완료!');
      // 알람 탭 스택 초기화 후 홈 탭으로 이동
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
    } catch (error) {
      console.error('미션 완료 처리 실패:', error);
      setCompleteAlertVisible(false);
    }
  };

  const handleSkip = () => {
    setSkipConfirmVisible(true);
  };

  return (
    <>
    <SafeAreaView style={styles.container}>
        {/* <View style={styles.adContainer}>
            <AdBanner size={AD_SIZES.ANCHORED_ADAPTIVE_BANNER as BannerAdSize} />
        </View> */}
        <View style={styles.missionCountContainer}>
            <Text style={styles.missionCountText}>
              {missionPack ? `${currentIndex + 1}/${missionPack.total}` : '1/1'}
            </Text>
            {/* 미션 현재 횟수/총 횟수 */}
        </View>
        <View style={styles.questionContainer}>
            <Text style={styles.question}>
              {missionPack ? missionPack.missions[currentIndex].question : missionData.question}
            </Text>
        </View>
        <View style={[styles.answerContainer, { borderColor: wrongState ? 'red' : (currentAnswer ? colors.primary300 : colors.primary100) }]}>
            <Text style={styles.answer}>{currentAnswer || '?'}</Text>
        </View>

        <View style={styles.missionFooterContainer}>
            <View style={styles.numberPad}>
                <FlatList
                    data={[7, 8, 9, 4, 5, 6, 1, 2, 3, 'del', 0, 'submit']}
                    renderItem={({ item }) => (
                        item === 'del' ? (
                            <TouchableOpacity style={[styles.numberButton, { backgroundColor: colors.primary50 }]} onPress={handleDelete}>
                                <BackIcon width={48} height={48} />
                            </TouchableOpacity>
                        ) : item === 'submit' ? (
                            <TouchableOpacity style={[styles.numberButton, { backgroundColor: colors.primary300 }]} onPress={handleSubmit}>
                                <CheckIcon width={40} height={40} color={colors.white} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.numberButton} onPress={() => handleAnswer(item.toString())} disabled={isCompleted}>
                                <Text style={styles.numberText}>{item}</Text>
                            </TouchableOpacity>
                        )
                    )}
                    keyExtractor={(item) => item.toString()}
                    numColumns={3}
                    columnWrapperStyle={styles.numberPadRow}
                    contentContainerStyle={styles.numberPadContent}
                />
            </View>

            <View style={[styles.adContainer, { marginVertical: 25 }]}>
                {/* <Text>AD</Text> */}
                <AdBanner size={AD_SIZES.ANCHORED_ADAPTIVE_BANNER as BannerAdSize} />
            </View>
        </View>
    </SafeAreaView>
    
    <CustomAlert
      visible={completeAlertVisible}
      message="미션 클리어!"
      subMessage="알람을 종료할게요."
      buttons={[{ text: '확인', onPress: () => { setCompleteAlertVisible(false); handleMissionComplete(); } }]}
      closeButton={false}
    />

    <CustomAlert
      visible={skipConfirmVisible}
      message="미션 건너뛰기"
      subMessage="미션을 건너뛰고 알람을 해제하시겠습니까?"
      buttons={[
        { text: '취소', onPress: () => setSkipConfirmVisible(false) },
        { text: '해제', onPress: () => { setSkipConfirmVisible(false); handleMissionComplete(); } },
      ]}
      onClose={() => setSkipConfirmVisible(false)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  adContainer: {
    backgroundColor: colors.grayScale200,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionCountContainer: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionCountText: {
    ...typography.body1,
    color: colors.grayScale800,
  },
  questionContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  answerContainer: {
    alignSelf: 'center',
    width: ss(190),
    height: 80,
    borderRadius: radius.r8,
    borderWidth: 4,
    borderColor: colors.primary300,
    justifyContent: 'center',
    paddingHorizontal: ss(19),
  },
  missionFooterContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  question: {
    ...typography.heading1,
    color: colors.grayScale800,
    marginBottom: 20,
    textAlign: 'center',
  },
  answer: {
    ...typography.heading1,
    color: colors.grayScale800,
    textAlign: 'right',
  },
  numberPad: {
    width: '100%',
    paddingHorizontal: 20,
  },
  numberPadRow: {
    gap: 10,
  },
  numberPadContent: {
    gap: 10,
  },
  numberButton: {
    width: (WINDOW_WIDTH - 40 - (10 * (3 - 1))) / 3, // 40: paddingHorizontal, 10: gap, 3-1: numColumns-1
    height: sv(80),
    borderRadius: radius.r8,
    backgroundColor: colors.grayScale100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    ...typography.heading3,
    color: colors.grayScale800,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
});

export default MissionAccomplishmentScreen;