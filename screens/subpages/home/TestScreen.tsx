import React, { useRef } from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../../navigations/tabs/HomeStackNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { radius } from '../../../constants/radius';
import { useCurrencyStore } from '../../../stores/currencyStore';
import { usePlayStore } from '../../../stores/playStore';
import { useAlarmStore } from '../../../stores/alarmStore';
import { useRoomStore } from '../../../stores/roomStore';
import { roomItemList } from '../../../data/roomItemData';
import { mockContentData, mockInstructorsData } from '../../../data/playContentData';
import { Activity } from '../../../services/contentService';
import { Surface } from '../../../components/common/surface/Surface';
import LottieView from 'lottie-react-native';
import { Button, ButtonRef } from '../../../components/common/buttons/Button';
import { ButtonSmall } from '../../../components/common/buttons/ButtonSmall';
import { useToast } from '../../../contexts/ToastContext';

const TestScreen = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const buttonRef = useRef<ButtonRef>(null);
  const { showToast } = useToast();
  const handleBack = () => {
    navigation.goBack();
  };
  
  const lottieData = [
    {
      name: 'cat_basic_motion',
      lottieJson: require('../../../assets/animations/cat_basic_motion.json'),
    },
    {
      name: 'cat_eatfish',
      lottieJson: require('../../../assets/animations/cat_eatfish.json'),
    },
    {
      name: 'breathing_motion',
      lottieJson: require('../../../assets/animations/breathing_motion.json'),
    },
    {
      name: 'inhale_cat',
      lottieJson: require('../../../assets/animations/inhale_cat.json'),
    },
    {
      name: 'bubble_talk',
      lottieJson: require('../../../assets/animations/bubble_talk.json'),
    },
    {
      name: 'fish_down',
      lottieJson: require('../../../assets/animations/fish_down.json'),
    },
    {
      name: 'fish_up',
      lottieJson: require('../../../assets/animations/fish_up.json'),
    },
    {
      name: 'cat',
      lottieJson: require('../../../assets/animations/cat.json'),
    },
    {
      name: 'danpoong',
      lottieJson: require('../../../assets/animations/danpoong.json'),
    },
    {
      name: 'heart_up',
      lottieJson: require('../../../assets/animations/heart_up.json'),
    },
    {
      name: 'popup_particle',
      lottieJson: require('../../../assets/animations/popup_particle.json'),
    },
    {
      name: 'particle',
      lottieJson: require('../../../assets/animations/particle.json'),
    },
    {
      name: 'bronze_action',
      lottieJson: require('../../../assets/animations/badge/bronze_action.json'),
    },
    {
      name: 'silver_action',
      lottieJson: require('../../../assets/animations/badge/silver_action.json'),
    },
    {
      name: 'gold_action',
      lottieJson: require('../../../assets/animations/badge/gold_action.json'),
    },
    {
      name: 'hidden_action',
      lottieJson: require('../../../assets/animations/badge/hidden_action.json'),
    },
    {
      name: 'check',
      lottieJson: require('../../../assets/animations/icon-motion/check.json'),
    },
    {
      name: 'hand_touch',
      lottieJson: require('../../../assets/animations/icon-motion/hand_touch.json'),
    },
    {
      name: 'up_star',
      lottieJson: require('../../../assets/animations/icon-motion/up_star.json'),
    },
  ];
  
  {/* 아이템 아이디 -> 아이템 이름 */}
  const itemIdToName = (itemId: number|null) => {
    if (itemId === null) return '없음';
    return roomItemList.find((item) => item.id === itemId)?.title;
  };

  {/* 액티비티 아이디 -> 액티비티 이름 */}
  const activityIdToName = (activityId: number) => {
    const activity = mockContentData.find((item) => item.id === activityId);
    return activity ? activity.title : `액티비티 ${activityId}`;
  };

  {/* 강사 아이디 -> 강사 이름 */}
  const instructorIdToName = (instructorId: number) => {
    const instructor = mockInstructorsData.find((item) => item.instructorId === instructorId);
    return instructor ? `${instructor.name}` : `강사 ${instructorId}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        {/* Zustand 상태 테스트 */}
        <Text style={styles.testTitle}>ZUSTAND STATE TEST</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰(하트포인트) 돈 상태</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>하트포인트</Text>
            <Text style={styles.infoValue}>{useCurrencyStore.getState().heartPoints}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎵(즐겨찾기, 팔로우) 유저 상태</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>즐겨찾기 액티비티</Text>
            <Text style={styles.infoValue}>
              {usePlayStore.getState().favoriteActivities.length > 0 
                ? usePlayStore.getState().favoriteActivities.map((activity) => activityIdToName(activity.activityId)).join(', ')
                : '없음'
              }
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>팔로우한 선생님</Text>
            <Text style={styles.infoValue}>
              {usePlayStore.getState().followedInstructors.length > 0 
                ? usePlayStore.getState().followedInstructors.map((instructor) => instructorIdToName(instructor.instructorId)).join(', ')
                : '없음'
              }
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ 알람 상태</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>알람 목록</Text>
            <Text style={styles.infoValue}>{useAlarmStore.getState().alarmList.map((alarm) => alarm.id).join(', ')||'없음'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 룸 상태</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>보유 아이템</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().ownedItems.map((item) => itemIdToName(item)).join(', ')||'없음'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 홈 배치 아이템</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>안경 아이템</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().placedItems.eyewear ? itemIdToName(useRoomStore.getState().placedItems.eyewear) : '없음'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>모자 아이템</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().placedItems.hat ? itemIdToName(useRoomStore.getState().placedItems.hat) : '없음'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>프레임 아이템</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().placedItems.frame ? itemIdToName(useRoomStore.getState().placedItems.frame[0]) : '없음'}</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().placedItems.frame ? itemIdToName(useRoomStore.getState().placedItems.frame[1]) : '없음'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>배경 아이템</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().placedItems.background ? itemIdToName(useRoomStore.getState().placedItems.background) : '없음'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>바닥 아이템</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().placedItems.floor ? itemIdToName(useRoomStore.getState().placedItems.floor) : '없음'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>선반 아이템</Text>
            <Text style={styles.infoValue}>{useRoomStore.getState().placedItems.shelf ? itemIdToName(useRoomStore.getState().placedItems.shelf) : '없음'}</Text>
          </View>
        </View>
        <Surface style={{marginHorizontal: -20}}/>
        <View style={styles.lottieTestContainer}>
          <Text style={styles.testTitle}>LOTTIE MOTION ANIMATIONS</Text>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center'}}>
            {lottieData.map((data) => (
              <View 
                key={data.name} 
                style={styles.lottieContainer}
              >
                <LottieView
                  source={data.lottieJson}
                  autoPlay
                  loop
                  style={styles.lottie}
                />
                <Text style={styles.lottieName}>{data.name}</Text>
              </View>
            ))}
          </View>
        </View>
        <Surface style={{marginHorizontal: -20}}/>
        <View style={styles.buttonTestContainer}>
          <Text style={styles.testTitle}>BUTTON TEST</Text>
          <Button
            ref={buttonRef}
            title="테스트 버튼"
            icon="check"
            showIconMotion
            onPress={() => {}}
            variant="secondary"
            size="large"
            style={{width: '100%'}}
          />
          <ButtonSmall
            title="아이콘 움직이기"
            onPress={() => {buttonRef.current?.triggerShake()}}
            variant="active"
          />
          <Button
            title="어두운 토스트 메시지"
            onPress={() => {showToast({ message: '토스트 메시지', theme: 'dark', iconType: 'check', duration: 2500 })}}
            variant="secondary"
          />
          <Button
            title="밝은 토스트 메시지"
            onPress={() => {showToast({ message: '토스트 메시지', theme: 'light', iconType: 'heart', hasAnimation: true })}}
            variant="active"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.title4,
    color: colors.grayScale900,
    marginBottom: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.grayScale50,
    borderRadius: radius.r8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary300,
  },
  infoLabel: {
    ...typography.body4,
    color: colors.grayScale600,
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    ...typography.body3,
    color: colors.grayScale900,
    lineHeight: 20,
  },
  lottieTestContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  testTitle: {
    ...typography.heading7,
    color: colors.grayScale900,
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: colors.grayScale300,
    borderRadius: radius.r8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  lottieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
  },
  lottie: {
    width: 100, 
    height: 100, 
    borderWidth: 1, 
    borderColor: colors.grayScale300,
    borderRadius: radius.r8,
    backgroundColor: colors.grayScale50,
  },
  lottieName: {
    ...typography.caption4,
    color: colors.grayScale900,
    marginTop: 4,
  },
  buttonTestContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    gap: 20,
  },
});

export default TestScreen;