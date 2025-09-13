import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import Animated from 'react-native-reanimated';
import { useSpringUpAnimation } from '../../../hooks/useSpringUpAnimation';
import { colors } from '../../../constants/colors';
import {
  PlayBreathStep0,
  PlayBreathStep1,
  PlayBreathStep2,
  PlayBreathStep3,
  PlayBreathStep4,
} from '../../../components/tabs/play/PlayBreathSteps';

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

  // 스프링업 애니메이션 훅 사용
  const { animatedStyle, triggerAnimation } = useSpringUpAnimation({
    initialOffset: 40,
    springConfig: { damping: 10, stiffness: 250 }
  });
  
  useEffect(() => {
    if (step === 1) {
      triggerAnimation(); // 이제 이 시점에 애니메이션 실행
    }
  }, [step, triggerAnimation]);

  // Step 컴포넌트 핸들러들
  const handleStep0Finish = () => {
    setStep(1);
  };

  const handleStep2Finish = () => {
    setStep(3);
  };

  const handleStep3Next = () => {
    //setStep(4); //카운트다운은 기획에서 제외됨
    navigation.navigate('PlayBreathContentScreen', { content: content }, );
  };

  // Render step component based on step state
  const renderStepComponent = () => {
    const commonProps = {
      windowHeight,
      safeAreaHeight: SAFE_AREA_HEIGHT_AND_SUBPAGE_HEADER_HEIGHT,
    };

    switch (step) {
      case 0:
        return (
          <PlayBreathStep0
            {...commonProps}
            onAnimationFinish={handleStep0Finish}
            isActive={step === 0}
          />
        );
      case 1:
        return (
          <PlayBreathStep1
            {...commonProps}
            animatedStyle={animatedStyle}
            onAnimationFinish={handleStep0Finish}
          />
        );
      case 2:
        return (
          <PlayBreathStep2
            {...commonProps}
            onAnimationFinish={handleStep2Finish}
            isActive={step === 2}
          />
        );
      case 3:
        return (
          <PlayBreathStep3
            {...commonProps}
            onNext={handleStep3Next}
          />
        );
      // case 4:
      //   return <PlayBreathStep4 navigation={navigation} />;
      default:
        return (
          <PlayBreathStep0
            {...commonProps}
            onAnimationFinish={handleStep0Finish}
            isActive={step === 0}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader 
        onBack={handleBack}
        style={{zIndex: 1000}}
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
          {renderStepComponent()}
          {__DEV__ && (
            <Text style={{alignSelf: 'center', marginTop: 50}}>[DEBUG] step: {step}</Text>
          )}
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
});

export default PlayBreathScreen;