import React, { useRef, useState, useEffect } from 'react';
import { Text, StyleSheet, ScrollView, Image } from 'react-native';
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
import { useAuthStore } from '../../../stores/authStore';
import { useAchievementStore } from '../../../stores/achievementStore';
import { updateMockUserProgress, resetMockUserProgress, simulateUserAction } from '../../../data/achievementMockData';
import { getItems } from '../../../services/itemService';
import { mockContentData, mockInstructorsData } from '../../../data/playContentData';
import { Activity } from '../../../services/contentService';
import { Surface } from '../../../components/common/surface/Surface';
import LottieView from 'lottie-react-native';
import { Button, ButtonRef } from '../../../components/common/buttons/Button';
import { ButtonSmall } from '../../../components/common/buttons/ButtonSmall';
import { useToast } from '../../../contexts/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActivityHistoryStore } from '../../../stores/activityHistoryStore';
import { useTodayMissionStore } from '../../../stores/todayMissionStore';
import CatBasic from '../../../assets/images/play/playBreathing/basic.svg';
import CatHold from '../../../assets/images/play/playBreathing/hold.svg';
import { useCartStore } from '../../../stores/cartStore';
import { getCachedInstallUuid } from '../../../utils/deviceId';

const TestScreen = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const buttonRef = useRef<ButtonRef>(null);
  const { showToast } = useToast();
  
  // AuthStore 상태를 실시간으로 구독
  const { tokens, isLoggedIn, logout, getAccessToken, getRefreshToken, role, loginType } = useAuthStore();
  
  // AchievementStore 상태를 실시간으로 구독
  const { 
    userAchievements, 
    getAchievedCount, 
    getTotalCount,
    resetAllAchievements,
    scheduleCheck,
    resetShownAchievements
  } = useAchievementStore();
  
  const handleBack = () => {
    navigation.goBack();
  };

  // TestScreen 마운트 시 업적 체크 (Mock 데이터는 achievementStore에서 자동 초기화됨)
  useEffect(() => {
    scheduleCheck(500);
  }, [scheduleCheck]);
  
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
  const [idToNameMap, setIdToNameMap] = useState<Map<number, string>>(new Map());
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getItems({ sort: 'CREATED', page: 1, size: 200 });
        const map = new Map<number, string>();
        res.content.forEach(it => {
          map.set(it.id, it.name);
        });
        if (mounted) setIdToNameMap(map);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);
  const itemIdToName = (itemId: number|null) => {
    if (itemId === null) return '없음';
    return idToNameMap.get(itemId) ?? `아이템 ${itemId}`;
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
          <ButtonSmall
          title="자동로그인 실패 테스트"
          onPress={() => {
            console.log('🧪 자동로그인 실패 화면 테스트...');
            logout(); // 로그아웃하여 자동로그인 실패 상태로 이동
            showToast({ message: '자동로그인 실패 화면을 테스트합니다.' });
          }}
          variant="secondary"
          style={{width: 153}}
        />
        <Button
          title="장바구니 초기화"
          onPress={() => {
            useCartStore.getState().clearCart();
            showToast({ message: '장바구니 초기화되었습니다.' });
          }}
          variant="active"
          style={{width: 153}}
        />
        </View>

        <View style={[styles.infoCard, {gap:10}]}>
          <Text style={styles.sectionTitle}>🏆 업적 테스트</Text>
          <View style={styles.infoCardInnerCard}>
            <Text style={styles.infoLabel}>업적 달성 현황</Text>
            <Text style={styles.infoValue}>{getAchievedCount()} / {getTotalCount()} 달성</Text>
            <Text style={styles.infoValue}>캐시 크기: {useAchievementStore.getState().cache.size}</Text>
          </View>
          <View style={{flexDirection: 'row', gap: 10, width: '100%', flexWrap: 'wrap'}}>
          <ButtonSmall
            title="일기 작성 1회(테스트)"
            onPress={() => {
              console.log('🧪 TestScreen: 일기 작성 1회 시뮬레이션');
              simulateUserAction('DIARY_WRITE', 1);
              scheduleCheck(400);
              showToast({ message: '일기 작성 1회!', iconType: 'heart' });
            }}
            variant="active"
            style={{width: 153}}
          />
          <ButtonSmall
            title="일기 작성 5회(테스트)"
            onPress={() => {
              console.log('🧪 TestScreen: 일기 작성 5회 시뮬레이션');
              simulateUserAction('DIARY_WRITE', 5);
              scheduleCheck(400);
              showToast({ message: '일기 작성 5회!', iconType: 'heart' });
            }}
            variant="active"
            style={{width: 153}}
          />
          <ButtonSmall
            title="명상 완료 1회(테스트)"
            onPress={() => {
              console.log('🧪 TestScreen: 명상 완료 1회 시뮬레이션');
              simulateUserAction('MEDITATION_COMPLETE', 1);
              scheduleCheck(400);
              showToast({ message: '명상 완료 1회!', iconType: 'heart' });
            }}
            variant="active"
            style={{width: 153}}
          />
          <ButtonSmall
            title="명상 완료 10회(테스트)"
            onPress={() => {
              console.log('🧪 TestScreen: 명상 완료 10회 시뮬레이션');
              simulateUserAction('MEDITATION_COMPLETE', 10);
              scheduleCheck(400);
              showToast({ message: '명상 완료 10회!', iconType: 'heart' });
            }}
            variant="active"
            style={{width: 153}}
          />
          <ButtonSmall
            title="호흡 완료 1회(테스트)"
            onPress={() => {
              console.log('🧪 TestScreen: 호흡 완료 1회 시뮬레이션');
              simulateUserAction('BREATHING_COMPLETE', 1);
              scheduleCheck(400);
              showToast({ message: '호흡 완료 1회!', iconType: 'heart' });
            }}
            variant="active"
            style={{width: 153}}
          />
          <ButtonSmall
            title="앱 방문 5일(테스트)"
            onPress={() => {
              console.log('🧪 TestScreen: 앱 방문 5일 시뮬레이션');
              simulateUserAction('APP_VISIT', 5);
              scheduleCheck(400);
              showToast({ message: '앱 방문 5일!', iconType: 'heart' });
            }}
            variant="active"
            style={{width: 153}}
          />
          <ButtonSmall
            title="모든 업적 리셋"
            onPress={() => {
              resetAllAchievements(); // 정적 데이터 리셋
              resetMockUserProgress(); // Mock 데이터 리셋
              showToast({ message: '모든 업적이 리셋되었습니다!' });
            }}
            variant="secondary"
            style={{width: 153}}
          />
          <ButtonSmall
            title="팝업 기록 초기화"
            onPress={async () => {
              await resetShownAchievements();
              showToast({ message: '팝업 기록이 초기화되었습니다!' });
            }}
            variant="secondary"
            style={{width: 153}}
          />
          </View>
        </View>
        <View style={[styles.infoCard, {gap:10}]}>
          <Text style={styles.sectionTitle}>🔐 인증 상태 (AuthStore) - 실시간 업데이트</Text>
          <View style={styles.infoCardInnerCard}>
            <Text style={styles.infoLabel}>로그인 상태</Text>
            <Text style={styles.infoValue}>{isLoggedIn ? '✅ 로그인됨' : '❌ 로그아웃됨'}</Text>
          </View>
          <View style={styles.infoCardInnerCard}>
            <Text style={styles.infoLabel}>로그인 유형</Text>
            <Text style={styles.infoValue}>{loginType==='social' ? '소셜 로그인 상태' : '디바이스 로그인 상태'}</Text>
            <Text style={styles.infoValue}>{role}</Text>
          </View>
          <DeviceIdRow />
          <View style={styles.infoCardInnerCard}>
            <Text style={styles.infoLabel}>Access Token</Text>
            <Text style={styles.infoValue} selectable>{getAccessToken() ? '✅ 있음: ' + getAccessToken() : '❌ 없음'}</Text>
          </View>
          <View style={styles.infoCardInnerCard}>
            <Text style={styles.infoLabel}>Refresh Token</Text>
            <Text style={styles.infoValue}>{getRefreshToken() ? '✅ 있음: ' + getRefreshToken() : '❌ 없음'}</Text>
          </View>
        </View>

        <View style={[styles.infoCard, {gap:10}]}>
          <Text style={styles.sectionTitle}>💾 AsyncStorage 모든 상태</Text>
          {AsyncStorage.getAllKeys().then((keys) => {
            return keys.map((key) => {
              return AsyncStorage.getItem(key).then((value) => {
                return <Text key={key}>{key}: {value}</Text>
              });
            });
          })}
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>모든 Store 상태</Text>
          <View style={styles.infoCardInnerCard}>

            <Text style={styles.infoLabel}>하트포인트</Text>
            <Text style={styles.infoValue}>{JSON.stringify(useCurrencyStore.getState())}</Text>
            <Surface style={{marginVertical: 10, height: 1}} color={colors.grayScale300}/>
            
            <Text style={styles.infoLabel}>알람</Text>
            <Text style={styles.infoValue}>{JSON.stringify(useAlarmStore.getState())}</Text>
            <Surface style={{marginVertical: 10, height: 1}} color={colors.grayScale300}/>

            <Text style={styles.infoLabel}>업적</Text>
            <Text style={styles.infoValue}>{JSON.stringify(useAchievementStore.getState())}</Text>
            <Surface style={{marginVertical: 10, height: 1}} color={colors.grayScale300}/>

            <Text style={styles.infoLabel}>인증</Text>
            <Text style={styles.infoValue}>{JSON.stringify(useAuthStore.getState())}</Text>
            <Surface style={{marginVertical: 10, height: 1}} color={colors.grayScale300}/>

            <Text style={styles.infoLabel}>방</Text>
            <Text style={styles.infoValue}>{JSON.stringify(useRoomStore.getState())}</Text>
            <Surface style={{marginVertical: 10, height: 1}} color={colors.grayScale300}/>

            <Text style={styles.infoLabel}>즐겨찾기/팔로우</Text>
            <Text style={styles.infoValue}>{JSON.stringify(usePlayStore.getState())}</Text>
            <Surface style={{marginVertical: 10, height: 1}} color={colors.grayScale300}/>

            <Text style={styles.infoLabel}>장바구니</Text>
            <Text style={styles.infoValue}>{JSON.stringify(useCartStore.getState())}</Text>
            <Surface style={{marginVertical: 10, height: 1}} color={colors.grayScale300}/>

            <Text style={styles.infoLabel}>액티비티 기록</Text>
            <Text style={styles.infoValue}>{JSON.stringify(useActivityHistoryStore.getState())}</Text>
            <Surface style={{marginVertical: 10, height: 1}} color={colors.grayScale300}/>

            <Text style={styles.infoLabel}>오늘 미션</Text>
            <Text style={styles.infoValue}>{JSON.stringify(useTodayMissionStore.getState())}</Text>
            <Surface style={{marginVertical: 10, height: 1}} color={colors.grayScale300}/>
          </View>
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
  infoCardInnerCard: {
    backgroundColor: colors.grayScale100,
    borderRadius: radius.r8,
    borderWidth: 0.5,
    borderColor: colors.grayScale300,
    padding: 16,
    marginBottom: 8,
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

// 내부 컴포넌트: 설치 UUID 표시
const DeviceIdRow: React.FC = () => {
  const [uuid, setUuid] = React.useState<string>('');
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const id = await getCachedInstallUuid();
      if (mounted) setUuid(id);
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <View style={styles.infoCardInnerCard}>
      <Text style={styles.infoLabel}>Install UUID</Text>
      <Text style={styles.infoValue}>{uuid || '로드 중...'}</Text>
    </View>
  );
};