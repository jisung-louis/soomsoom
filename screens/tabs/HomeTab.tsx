import React, { useState } from 'react';
import { StyleSheet, ImageBackground, LayoutRectangle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import TopNavigation from '../../components/common/top-navigation/TopNavigation';
import LottieView from 'lottie-react-native';
import { HomeStackParamList } from '../../navigations/tabs/HomeStackNavigator';
import { Button } from '../../components/common/buttons/Button';
import { CustomAlert, AlertButton } from '../../components/common/alert';

type HomeTabNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeTab'>;

const HomeTab = () => {
  const [catLayout, setCatLayout] = useState<LayoutRectangle>({x: 0, y: 0, width: 0, height: 0});
  const navigation = useNavigation<HomeTabNavigationProp>();
  const [showAlert1, setShowAlert1] = useState(false);
  const [showAlert2, setShowAlert2] = useState(false);

  const alert1Buttons: AlertButton[] = [
    { text: '확인', onPress: () => setShowAlert1(false) },
  ];

  const alert2Buttons: AlertButton[] = [
    { text: '나갈게요!', onPress: () => setShowAlert2(false) },
    { text: '머물게요!', onPress: () => setShowAlert2(false) },
  ];

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

          <Button
            title="ALERT (only yes) 버튼"
            onPress={() => setShowAlert1(true)}
            variant="active"
            size="medium"
          />
          <Button
            title="ALERT (yes or no) 버튼"
            onPress={() => setShowAlert2(true)}
            variant="active"
            size="medium"
          />
        </SafeAreaView>
        
        <CustomAlert
          visible={showAlert1}
          message="구매가 완료되었어요!"
          buttons={alert1Buttons}
          onClose={() => setShowAlert1(false)}
        />
        <CustomAlert
          visible={showAlert2}
          message="다음에 아이템을 구매할까요?"
          subMessage="보유하지 않은 아이템은 저장할 수 없어요!"
          buttons={alert2Buttons}
          onClose={() => setShowAlert2(false)}
        />
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
});

export default HomeTab; 