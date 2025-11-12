import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, AppState, AppStateStatus } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import TopNavigation from '../../components/common/top-navigation/TopNavigation';
import LottieView from 'lottie-react-native';
import { HomeStackParamList } from '../../navigations/tabs/HomeStackNavigator';
import { CustomAlert, AlertButton } from '../../components/common/alert';

import { useOnboarding } from '../../contexts/OnboardingContext';
import BubbleRecordIcon from '../../assets/icons/common/record_emotion.svg';
import BubblePlayIcon from '../../assets/icons/common/play.svg';
import { syongsyongTypography } from '../../constants/typography';
import { useCurrencyStore } from '../../stores/currencyStore';
import { useToast } from '../../contexts/ToastContext';
import { sx, sy, ss, sv } from '../../utils/scale';
import { ButtonSmall } from '../../components/common/buttons/ButtonSmall';
import UserRoom from '../../components/common/userroom/UserRoom';
import { objectPosition, itemStyles } from '../../constants/roomLayout';
import { useRoomStore } from '../../stores/roomStore';
import AdBanner from '../../components/common/ads/AdBanner';
import { useAuthStore } from '../../stores/authStore';
import { useAppConfigStore } from '../../stores/appConfigStore';
import { useAuth } from '../../hooks/useAuth';
import { resetAppState } from '../../utils/resetAppState';
import { useHomeTimeLogger } from '../../hooks/useHomeTimeLogger';
import { useTodayMissionStore } from '../../stores/todayMissionStore';
import { useBgTopColor } from '../../hooks/useBackgroundColor';
import { useMailboxStore } from '../../stores/mailboxStore';
import { getLogicalNow } from '../../utils/timeUtils';
import { getActivitiesByType, getActivityDetail } from '../../services/contentService';
import { typography } from '../../constants/typography';
import { useNotificationQueueProcessor } from '../../hooks/useNotificationQueueProcessor';
import { showUniversalPopup, createAchievementPopup, createHeartRewardPopup, createItemRewardPopup } from '../../components/common/popup/UniversalPopup';
import { useScreenAnalytics } from '../../hooks/useScreenAnalytics';
import { logHomeBubbleButtonClick } from '../../utils/analytics';

type HomeTabNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeTab'>;


const HomeTab = () => {
  useScreenAnalytics('HomeTab');

  const navigation = useNavigation<HomeTabNavigationProp>();
  const [showInnerContainer, setShowInnerContainer] = useState(false);
  const [bubbleTalkKey, setBubbleTalkKey] = useState(0);

  const { resetOnboarding } = useOnboarding();
  const { giveTestReward } = useCurrencyStore();  
  const { showToast } = useToast();
  const { setPhase, loginType } = useAuthStore();
  const useMockApiMode = useAppConfigStore(s => s.useMockApi);
  const setUseMockApiMode = useAppConfigStore(s => s.setUseMockApi);
  const { logout, deviceLogin } = useAuth();
  
  // 홈 화면 체류 시간 추적 (1분마다 배치 전송)
  const { startTracking, stopTracking, flushNow } = useHomeTimeLogger();
  
  // 오늘 미션 상태 (캐시 + 조건부 갱신)
  const {
    status: todayStatus,
    shouldFetchNow,
    refresh: refreshTodayMission,
    invalidateIfCrossedBoundary,
  } = useTodayMissionStore();
  
  // 우편함 안 읽은 메일 개수 (캐시된 값 사용)
  const { unreadCount } = useMailboxStore();
  
  // 알림 큐 처리 (탭 포커스 시 큐에 있는 알림을 순차적으로 표시)
  useNotificationQueueProcessor();
  
  // 포커스될 때마다 캐시된 값을 UI에 반영하기 위해 사용
  // (TopNavigation에서도 동일한 store를 구독하므로 자동으로 업데이트됨)
  console.log('📬 HomeTab 포커스 - 현재 안 읽은 메일 개수:', unreadCount);
  useFocusEffect(
    useCallback(() => {
      console.log('🏠 HomeTab 완전 재마운트!');
      setShowInnerContainer(false);
      setBubbleTalkKey(prev => prev + 1);
      
      // 홈 화면 진입 시 체류 시간 추적 시작
      startTracking();
      
      // 오늘 미션 상태: 일경계 체크 및 필요 시 갱신
      try {
        invalidateIfCrossedBoundary();
        if (shouldFetchNow({ ttlMs: 10 * 60 * 1000 })) {
          refreshTodayMission();
        }
      } catch {}
      
      // 안 읽은 메일 개수는 캐시된 값 사용 (API 호출하지 않음)
      console.log('📬 포커스 시 안 읽은 메일 개수:', unreadCount);
      
      // 애니메이션 재시작을 위한 지연
      setTimeout(() => {
      }, 100);
      
      // 홈 화면 이탈 시 체류 시간 추적 중지
      return () => {
        stopTracking();
      };
    }, [startTracking, stopTracking, unreadCount])
  );

  // 앱이 포어그라운드로 돌아올 때 일경계 교차 감지 및 조건부 갱신
  useEffect(() => {
    const handler = (state: AppStateStatus) => {
      if (state === 'active') {
        try {
          invalidateIfCrossedBoundary();
          if (shouldFetchNow({ ttlMs: 10 * 60 * 1000 })) {
            refreshTodayMission();
          }
        } catch {}
      }
    };
    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();
  }, [invalidateIfCrossedBoundary, shouldFetchNow, refreshTodayMission]);

  const handleTestReward = () => {
    
    giveTestReward();
    showToast({
      message: '하트 획득했어요!',
      theme: 'dark',
      iconType: 'heart',
      hasAnimation: true,
      //duration: 900,
      amount: 10,
      style: {
        width: ss(335),
        height: sv(42),
      },
      textStyle: {
        ...typography.body5,
        textAlign: 'center',
      },
      iconSize: ss(24),
    });
  };

  const handleShopPress = () => {
    navigation.navigate('ShopScreen', { initialTab: 'item' });
  };



  const handleSocialLogin = async () => {
    try {
      await logout();
    } catch {}
  };

  const handleHeartPress = () => {
    // 하트 버튼 기능 구현
    console.log('하트 버튼 클릭');
    // ShopScreen의 ChargeTab으로 이동
    navigation.navigate('ShopScreen', { initialTab: 'charge' });
  };

  const handleMessagePress = () => {
    // 메시지 버튼 기능 구현
    console.log('메시지 버튼 클릭');
    navigation.navigate('MailboxScreen');
  };

  const handleStoragePress = () => {
    // 스토리지 버튼 기능 구현 - My 탭으로 이동하고 편집 모드 시작
    console.log('스토리지 버튼 클릭 - My 탭으로 이동하고 편집 모드 시작');
    // 상위 탭 네비게이터를 통해 My 탭으로 이동 (편집 모드 파라미터와 함께)
    navigation.getParent()?.navigate('my', { 
      screen: 'MyTab', 
      params: { autoEnterEditMode: true } 
    });
  };

  const handleShowOnboarding = async () => {
    await resetOnboarding();
    console.log('온보딩이 재시작됩니다!');
  };

  const onModeToggle = async () => {
    if (useMockApiMode) {
      Alert.alert('실제 API 연결', '서버 비용이 발생할 수 있으니 조심해주세요!!', [
        { text: '취소', style: 'cancel' },
        { text: '연결하기', style: 'destructive', onPress: async () => {
          try {
            await resetAppState(true); // 인증 상태도 초기화
            setUseMockApiMode(!useMockApiMode);
            
            // 실제 API 모드로 전환 시 재로그인 시도
            console.log('🔄 실제 API 모드로 전환 중... 재로그인 시도');
            
            // 상태 초기화 후 약간의 지연을 두고 로그인 시도
            setTimeout(async () => {
              try {
                await deviceLogin();
              } catch (loginError) {
                console.error('재로그인 실패:', loginError);
                showToast({
                  message: '재로그인에 실패했습니다.',
                  theme: 'dark',
                  iconType: 'brokenHeart',
                });
              }
            }, 100);
          } catch (error) {
            console.error('모드 전환 중 오류:', error);
            showToast({
              message: '모드 전환 중 오류가 발생했습니다.',
              theme: 'dark',
              iconType: 'brokenHeart',
            });
          }
        } },
      ]);
    } else {
      Alert.alert('내부 데이터 사용', '내부 데이터 사용 모드로 변경하시겠습니까?', [
      { text: '아니요', style: 'cancel' },
      { text: '고고', style: 'destructive', onPress: async () => {
        try {
          await resetAppState(true); // 인증 상태도 초기화
          setUseMockApiMode(!useMockApiMode);
          console.log('🔄 Mock API 모드로 전환 완료');
        } catch (error) {
          console.error('모드 전환 중 오류:', error);
          showToast({
            message: '모드 전환 중 오류가 발생했습니다.',
            theme: 'dark',
            iconType: 'brokenHeart',
          });
        }
      } },
    ]);
    }
  };

  const onBubbleTalkPress = async () => {
    if (todayStatus === 'NEED_DIARY') {
      // Analytics: 말풍선 버튼 (기록) 클릭 이벤트
      try {
        await logHomeBubbleButtonClick('record');
      } catch (analyticsError) {
        console.warn('⚠️ Analytics 말풍선 버튼 클릭 이벤트 로깅 실패:', analyticsError);
      }
      
      // 논리적 오늘 날짜 계산 (06:00 ~ 다음날 05:59 기준)
      const logicalToday = getLogicalNow();
      const todayDateString = logicalToday.format('YYYY-MM-DD');
      
      // Record 탭의 EmotionSelectScreen으로 이동
      navigation.getParent()?.navigate('record', { 
        screen: 'EmotionSelectScreen', 
        params: { date: todayDateString } 
      });
      return;
    }
    if (todayStatus === 'NEED_ACTIVITY') {
      // Analytics: 말풍선 버튼 (놀기) 클릭 이벤트
      try {
        await logHomeBubbleButtonClick('play');
      } catch (analyticsError) {
        console.warn('⚠️ Analytics 말풍선 버튼 클릭 이벤트 로깅 실패:', analyticsError);
      }
      
      try {
        // BREATHING 타입의 액티비티 목록 가져오기 (짧은 활동용)
        const breathingActivities = await getActivitiesByType('BREATHING');
        
        // Play 탭의 PlayActivityListScreen으로 이동
        navigation.getParent()?.navigate('play', { 
          screen: 'PlayActivityListScreen', 
          params: { 
            title: 'SHORT', 
            content: breathingActivities.content 
          } 
        });
      } catch (error) {
        console.error('BREATHING 액티비티 목록 조회 실패:', error);
        // 에러 발생 시 Play 탭으로 이동
        navigation.getParent()?.navigate('play', { screen: 'PlayTab' });
      }
      return;
    }
  };

  const [roomBgUri, setRoomBgUri] = useState<string | null>(null);

  const isBGColorDark = useBgTopColor(roomBgUri);

  return (
    <>
    <UserRoom onBackgroundImageUri={setRoomBgUri}>
      <TopNavigation 
        shopButtonPress={handleShopPress}
        heartButtonPress={handleHeartPress}
        storageButtonPress={handleStoragePress}
        messageButtonPress={handleMessagePress}
        isBGColorDark={isBGColorDark}
      />
      {/* <ButtonSmall
        title="팝업(즉시)"
        onPress={() => showUniversalPopup(createItemRewardPopup(
          { uri: 'https://soomsoom-prod-bucket.s3.ap-northeast-2.amazonaws.com/items/6/image/8475fad1-6416-4243-9f23-2c8d0026b5d4.png' }, 
          '아이템왕 획득했어요!', 
          '아이템왕을 획득했어요!'
        ))}
      /> */}

      {/* 버블톡: 오늘 미션 상태에 따른 조건부 표시 */}
      {(todayStatus === 'NEED_DIARY' || todayStatus === 'NEED_ACTIVITY') && (
        <>
          <LottieView
            key={`bubbleTalk-${bubbleTalkKey}`}
            source={require('../../assets/animations/bubble_talk.json')}
            autoPlay
            loop={false}
            style={[itemStyles.bubbleTalk, {
              top: objectPosition.bubbleTalk.y,
              left: objectPosition.bubbleTalk.x,
            }]}
            onAnimationFinish={() => {
              setShowInnerContainer(true);
            }}
          />

          {showInnerContainer && (
            <TouchableOpacity 
              style={[itemStyles.bubbleTalkInnerContainer, {
                top: objectPosition.bubbleTalk.y + sx(20),
                left: objectPosition.bubbleTalk.x + sy(64),
              }]}
              onPress={onBubbleTalkPress}
            >
              {todayStatus === 'NEED_DIARY' ? (
                <BubbleRecordIcon width={ss(48)} height={sv(48)} />
              ) : (
                <BubblePlayIcon width={ss(48)} height={sv(48)} />
              )}
              <Text style={{...syongsyongTypography.title4}}>!</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* <View style={[styles.developerButtons,{marginBottom: 10}]}> 
        <ButtonSmall
          title={useMockApiMode ? '실제 서버 연결' : '내부 데이터 사용'}
          onPress={onModeToggle}
          variant="active"
          style={{width: '100%'}}
        />
      </View> */}
      {/* 개발자용 버튼 (추후 삭제) */}
      {/* {useMockApiMode && (
      <View style={styles.developerButtons}>
        <Text>개발자용 버튼</Text>
        <ButtonSmall
          title="온보딩 show"
          onPress={() => handleShowOnboarding()}
          variant="active"
          style={{width: '100%'}}
        />
        <ButtonSmall
          title={loginType === 'social' ? '소셜로그아웃' : '소셜로그인'}
          onPress={() => handleSocialLogin()}
          variant="active"
          style={{width: '100%'}}
        />
        <ButtonSmall
          title={"테스트 보상"}
          onPress={() => handleTestReward()}
          variant="active"
          style={{width: '100%'}}
        />
        <ButtonSmall
          title={"테스트 화면"}
          onPress={() => navigation.navigate('TestScreen')}
          variant="active"
          style={{width: '100%'}}
        />
        <ButtonSmall
          title={"배치 상태 초기화"}
          onPress={() => {
            useRoomStore.getState().clearAllPlacedItems();
          }}
          variant="active"
          style={{width: '100%'}}
          />
        </View>
      )} */}

      
    </UserRoom>
    {/* 광고 배너 */}
    {/* <View style={styles.adContainer}>
      <AdBanner />
    </View> */}
  </>
  );
};

const styles = StyleSheet.create({
  developerButtons: {
    gap: 10,
    marginLeft: 20,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    width: 150,
    alignItems: 'center',
    borderRadius: 10,
  },
  adContainer: {
    position: 'absolute',
    bottom: 150,
    left: 0,
    right: 0,
    zIndex: 9999, 
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeTab; 