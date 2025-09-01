import React, { useState, useCallback } from 'react';
import { StyleSheet, ImageBackground, LayoutRectangle, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import TopNavigation from '../../components/common/top-navigation/TopNavigation';
import LottieView from 'lottie-react-native';
import { HomeStackParamList } from '../../navigations/tabs/HomeStackNavigator';
import { Button } from '../../components/common/buttons/Button';
import { CustomAlert, AlertButton } from '../../components/common/alert';

import { useOnboarding } from '../../contexts/OnboardingContext';
import BubbleRecordIcon from '../../assets/icons/common/record_emotion.svg';
import BubblePlayIcon from '../../assets/icons/common/play.svg';
import { syongsyongTypography } from '../../constants/typography';
import { useCurrencyStore } from '../../stores/currencyStore';
import { useToast } from '../../contexts/ToastContext';

type HomeTabNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeTab'>;

const HomeTab = () => {
  const [catLayout, setCatLayout] = useState<LayoutRectangle>({x: 0, y: 0, width: 0, height: 0});
  const navigation = useNavigation<HomeTabNavigationProp>();
  const [showAlert1, setShowAlert1] = useState(false);
  const [showAlert2, setShowAlert2] = useState(false);
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
  };

  const handleStoragePress = () => {
    // 스토리지 버튼 기능 구현
    console.log('스토리지 버튼 클릭');
  };

  const handleShowOnboarding = async () => {
    await resetOnboarding();
    console.log('온보딩이 재시작됩니다!');
  };
  

  return (
      <ImageBackground 
        source={require('../../assets/images/background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <TopNavigation 
            shopButtonPress={handleShopPress}
            heartButtonPress={handleHeartPress}
            storageButtonPress={handleStoragePress}
            messageButtonPress={handleMessagePress}
          />
          {/* 여기에 고양이, 텍스트 등 추가 */}
          <LottieView
            key="head"
            source={require('../../assets/animations/sunglass_motion.json')}
            autoPlay
            loop
            style={[styles.sunglass, {
              top: catLayout.y + 17,
              left: catLayout.x + 29,
            }]}
          />
          <LottieView
            key="cat"
            source={require('../../assets/animations/cat.json')}
            autoPlay
            loop
            style={[styles.cat, {
            }]}
            onLayout={(event) => {
              setCatLayout(event.nativeEvent.layout);
            }}
          />
          <LottieView
            key={`bubbleTalk-${bubbleTalkKey}`}
            source={require('../../assets/animations/bubble_talk.json')}
            autoPlay
            loop = {false}
            style={[styles.bubbleTalk, {
              top: catLayout.y - 125,
              left: catLayout.x + 100,
            }]}
            onAnimationFinish={() => {
              setShowInnerContainer(true);
            }}
          />
          {showInnerContainer && (
            <TouchableOpacity style={[styles.bubbleTalkInnerContainer, {
            top: catLayout.y - 104,
            left: catLayout.x + 164,
          }]}
          onPress={() => {
            // TODO: 기록 화면으로 이동
          }}
          >
            <BubbleRecordIcon width={48} height={48} />
            <Text style={{...syongsyongTypography.title4}}>!</Text>
          </TouchableOpacity>
          )}
          <Button
            title="온보딩 show 버튼"
            onPress={() => handleShowOnboarding()}
            variant="active"
            size="medium"
          />
          <Button
            title="테스트 보상 주기"
            onPress={() => handleTestReward()}
            variant="active"
            size="medium"
          />
          <Button
            title="테스트 화면 이동"
            onPress={() => navigation.navigate('TestScreen')}
            variant="active"
            size="medium"
          />
        </SafeAreaView>
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  safeArea: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  moreMenu: {
    position: 'absolute',
    top: 120,
    right: 20,
    zIndex: 1000,
  },
  cat: {
    width: 200,
    height: 200,
    position: 'absolute',
    top: 349,
    left: 106,
    zIndex: 1000,
  },
  sunglass: {
    width: 80,
    height: 80,
    position: 'absolute',
    zIndex: 10000,
  },
  bubbleTalk: {
    width: 140,
    height: 120,
    position: 'absolute',
    zIndex: 10000,
  },
  bubbleTalkInnerContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100000,
  },
});

export default HomeTab; 