import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { syongsyongTypography, typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import LottieView from 'lottie-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import Count5 from '../../../assets/icons/play/playBreath/count_5.svg';
import Count4 from '../../../assets/icons/play/playBreath/count_4.svg';
import Count3 from '../../../assets/icons/play/playBreath/count_3.svg';
import Count2 from '../../../assets/icons/play/playBreath/count_2.svg';
import Count1 from '../../../assets/icons/play/playBreath/count_1.svg';
import Count0 from '../../../assets/icons/play/playBreath/count_0.svg';

const PlayBreathScreen = ({route}: {route: RouteProp<PlayStackParamList, 'PlayBreathScreen'>}) => {
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  const {content} = route.params;
  const [step, setStep] = useState(0);
  const windowHeight = Dimensions.get('window').height;
  const insets = useSafeAreaInsets();
  const SAFE_AREA_HEIGHT_AND_SUBPAGE_HEADER_HEIGHT = insets.top + 68;
  const handleBack = () => {
    navigation.goBack();
  };

  const offset = useSharedValue(40); // 약간 더 튀어오르게
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withSpring(offset.value, { damping: 10, stiffness: 250 }) }
    ],
  }));
  
  useEffect(() => {
    if (step === 1) {
      console.log('bounce start');
      offset.value = 0; // 이제 이 시점에 애니메이션 실행
    }
  }, [step]);

  // Step components (can be moved to separate files later)
  const Step0 = () => (
    <View style={{alignItems: 'center',}}>
      {/* Step 0: 물고기 내려옴 */}
      <LottieView
        source={require('../../../assets/animations/fish_down.json')}
        autoPlay={step === 0}
        loop={false}
        style={[styles.fish, {
          width: '100%',
          height: windowHeight * 0.5,
          maxHeight: 400,
          top: -SAFE_AREA_HEIGHT_AND_SUBPAGE_HEADER_HEIGHT}
        ]}
        onAnimationFinish={() => {
          console.log('fish down animation finished');
          setStep(1);
        }}
      />
      <Text style={{...syongsyongTypography.title4, marginTop: (windowHeight * 0.55) - SAFE_AREA_HEIGHT_AND_SUBPAGE_HEADER_HEIGHT}}>가장 편안한 자세를 찾아보세요!</Text>
    </View>
  );
  const Step1 = () => (
    <View style={{alignItems: 'center'}}>
      {/* Step 1: 화면 터치 텍스트 용수철 등장 */}
      <Step0 />
      <Animated.View style={[animatedStyle, {marginTop: 6}]}>
        <Text style={{...syongsyongTypography.title5, color: colors.primary300, textShadowColor: colors.primary300}}>화면을 터치해주세요!</Text>
      </Animated.View>
    </View>
  );
  const Step2 = () => (
    <View style={{alignItems: 'center'}}>
      {/* Step 2: 물고기 올라감 */}
      <LottieView
        source={require('../../../assets/animations/fish_up.json')}
        autoPlay={step === 2}
        loop={false}
        style={[styles.fish, {
          width: '100%',
          height: windowHeight * 0.5,
          maxHeight: 400,
          top: -SAFE_AREA_HEIGHT_AND_SUBPAGE_HEADER_HEIGHT}
        ]}
        onAnimationFinish={() => {
          console.log('fish up animation finished');
          setStep(3);
        }}
      />
      <Text style={{...syongsyongTypography.title4, marginTop: (windowHeight * 0.55) - SAFE_AREA_HEIGHT_AND_SUBPAGE_HEADER_HEIGHT}}>가장 편안한 자세를 찾아보세요!</Text>
      <Text style={{...syongsyongTypography.title5, color: colors.primary300, textShadowColor: colors.primary300, marginTop: 6}}>화면을 터치해주세요!</Text>
    </View>
  );
  const Step3 = () => {
    {/* Step 3: 자 이제 준비하세요! 텍스트 */}
    // Step3Hold에서 2초 대기 후 자동으로 다음 단계로 넘어가기
    useEffect(() => {
      const timer = setTimeout(() => {
        setStep(4);
      }, 2000);
      return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
    }, []);
    return (
    <View style={{alignItems: 'center'}}>
      <Text style={{...syongsyongTypography.title4, marginTop: (windowHeight * 0.55) - SAFE_AREA_HEIGHT_AND_SUBPAGE_HEADER_HEIGHT}}>자 이제 준비하세요!</Text>
    </View>
  );};

  const Step4 = () => {
    const [count, setCount] = useState(5);
    useEffect(() => {
      const timer = setTimeout(() => {
        if (count > 0) {
          setCount(count - 1);
        } else {
          navigation.navigate('PlayResultScreen')
        }
      }, 1000);
      return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
    }, [count]);
    return (
    <View style={{alignItems: 'center', height: '90%', justifyContent: 'center'}}>
      {/* Step 4: 카운트다운 */}
      {count === 5 && <Count5 />}
      {count === 4 && <Count4 />}
      {count === 3 && <Count3 />}
      {count === 2 && <Count2 />}
      {count === 1 && <Count1 />}
      {count === 0 && <Count0 />}
    </View>
  );};

  // Render step component based on step state
  let StepComponent = null;
  switch (step) {
    case 0:
      StepComponent = <Step0 />;
      break;
    case 1:
      StepComponent = <Step1 />;
      break;
    case 2:
      StepComponent = <Step2 />;
      break;
    case 3:
      StepComponent = <Step3 />;
      break;
    case 4:
      StepComponent = <Step4 />;
      break;
    default:
      StepComponent = <Step0 />;
      break;
  }

  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader 
        onBack={handleBack}
        />
      <TouchableOpacity style={styles.contentContainer} 
        onPress={() => {
          if (step === 1){
            setStep(step + 1);
          }
        }}
        activeOpacity={step === 1 ? 0.8 : 1}
        >
        {/* <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>제목 : {content.title}</Text>
        </View> */}
        {/* Render step-specific component */}
        <View>
          {StepComponent}
          <Text style={{alignSelf: 'center', marginTop: 50}}>[DEBUG] step: {step}</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary50,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fish: {
    position: 'absolute', 
    pointerEvents: 'none',
  },
});

export default PlayBreathScreen;