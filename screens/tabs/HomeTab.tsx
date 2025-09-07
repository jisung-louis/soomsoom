import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
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

type HomeTabNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeTab'>;


const HomeTab = () => {
  const navigation = useNavigation<HomeTabNavigationProp>();
  const [showInnerContainer, setShowInnerContainer] = useState(false);
  const [bubbleTalkKey, setBubbleTalkKey] = useState(0);

  const { resetOnboarding } = useOnboarding();
  const { giveTestReward } = useCurrencyStore();  
  const { showToast } = useToast();

  useFocusEffect(
    useCallback(() => {
      console.log('🏠 HomeTab 완전 재마운트!');
      setShowInnerContainer(false);
      setBubbleTalkKey(prev => prev + 1);
      // 애니메이션 재시작을 위한 지연
      setTimeout(() => {
      }, 100);
      
    }, [])
  );

  const handleTestReward = () => {
    
    giveTestReward();
    showToast({
      message: '+10 하트 획득했어요!',
      theme: 'dark',
      iconType: 'heart',
      hasAnimation: true,
      duration: 900,
    });
  };

  const handleShopPress = () => {
    navigation.navigate('ShopScreen');
  };

  const handleHeartPress = () => {
    // 하트 버튼 기능 구현
    console.log('하트 버튼 클릭');
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
  
  return (
    <UserRoom >
      <TopNavigation 
        shopButtonPress={handleShopPress}
        heartButtonPress={handleHeartPress}
        storageButtonPress={handleStoragePress}
        messageButtonPress={handleMessagePress}
      />

      {/* 버블톡 애니메이션 */}
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
            top: objectPosition.bubbleTalk.y + 20,
            left: objectPosition.bubbleTalk.x + 64,
          }]}
          onPress={() => {
            // TODO: 기록 화면으로 이동
          }}
        >
          <BubbleRecordIcon width={48} height={48} />
          <Text style={{...syongsyongTypography.title4}}>!</Text>
        </TouchableOpacity>
      )}

      {/* 개발자용 버튼 (추후 삭제) */}
      {__DEV__ && (
      <View style={styles.developerButtons}>
        <Text>개발자용 버튼</Text>
        <ButtonSmall
          title="온보딩 show"
          onPress={() => handleShowOnboarding()}
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
      )}
    </UserRoom>
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
});

export default HomeTab; 