import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { colors } from '../../constants/colors';
import { syongsyongTypography, typography } from '../../constants/typography';
import { radius } from '../../constants/radius';
import { Button } from '../common/buttons/Button';
import { characterIconMap } from '../../utils/iconMap';
import { CheckboxList } from '../common/checkbox';
import LottieView from 'lottie-react-native';
import Count5 from '../../assets/icons/play/playBreath/count_5.svg';
import Count4 from '../../assets/icons/play/playBreath/count_4.svg';
import Count3 from '../../assets/icons/play/playBreath/count_3.svg';
import Count2 from '../../assets/icons/play/playBreath/count_2.svg';
import Count1 from '../../assets/icons/play/playBreath/count_1.svg';
import Count0 from '../../assets/icons/play/playBreath/count_0.svg';
import PlayResult from './PlayResult';
import Register from './Register';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const StepCountDown = ({onComplete}: {onComplete: () => void}) => {
    const [count, setCount] = useState(5);
    useEffect(() => {
      const timer = setTimeout(() => {
        if (count > 0) {
          setCount(count - 1);
        } else {
            onComplete();
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

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFocusIds, setSelectedFocusIds] = useState<string[]>([]);
  const [selectedTimeIds, setSelectedTimeIds] = useState<string[]>([]);
  
  const highlightText = {color: colors.primary300, textShadowColor: colors.primary300};

  // 체크박스 옵션 정의
  const focusOptions = [
    { id: 'sleep', label: '수면의 질 높이기' },
    { id: 'peace', label: '평온한 마음 가지기' },
    { id: 'anxiety', label: '불안 다스리기' },
    { id: 'stress', label: '스트레스 해소하기' },
    { id: 'focus', label: '현재에 집중해보기' },
    { id: 'other', label: '그 외에 다른 이유' },
  ];

  const timeOptions = [
    { id: '3', label: '하루 3분', subLabel: '가볍게' },
    { id: '10', label: '하루 10분', subLabel: '보통' },
    { id: '20', label: '하루 20분', subLabel: '열심히' },
    { id: '30', label: '하루 30분', subLabel: '진지하게' },
  ];

  const handleNext = () => {
    // 3단계에서 체크박스 선택 확인
    if (currentStep === 2) {
      if (selectedFocusIds.length === 0) {
        // 선택된 항목이 없으면 다음으로 진행하지 않음
        console.log('하나 이상 선택해주세요!');
        return;
      }
      console.log(selectedFocusIds);
    }

    if (currentStep === 4) {
      if (selectedTimeIds.length === 0) {
        console.log('하나 이상 선택해주세요!');
        return;
      }
      console.log(selectedTimeIds);
    }

    if (currentStep === 5) {
      // TODO: 사용자에게 앱 알림 허용 요청 보내기
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const steps = [
    {
      title:[
        [["안녕하세요! "], highlightText], 
        [["같이 가볍게 "], ["마음운동, ", highlightText], ["해보실래요?"]]],
      backgroundImage: require('../../assets/images/onboarding/bg1.png'),
    },
    {
      title:[
        [["마음운동 시작하기 전에"]], 
        [["간단한 질문 "], ["3가지만 ", highlightText], ["여쭤볼게요!"]]],
      backgroundImage: require('../../assets/images/onboarding/bg2.png'),
    },
    {
      title: null,
      backgroundImage: null,
      subView: (
        <View style={styles.subViewContainer}>
          <Text style={styles.subViewTitle}>어디에 집중해볼까요?</Text>
          <CheckboxList
            options={focusOptions}
            selectedIds={selectedFocusIds}
            onSelectionChange={setSelectedFocusIds}
            multiple={false}
            style={styles.checkboxList}
          />
        </View>
      ),
    },
    {
        title:[
            [["걱정마세요!"]], 
            [["마음운동을 ", highlightText], ["통해 이룰 수 있게"]],
            [["숨숨이 도와드릴게요!",highlightText]]],
        backgroundImage: require('../../assets/images/onboarding/bg3.png'),
    },
    {
        title: null,
        backgroundImage: null,
        subView: (
            <View style={styles.subViewContainer}>
                <View style={styles.subViewTitleContainer}>
                    <Text style={[styles.subViewTitle, highlightText]}>하루에 </Text>
                    <Text style={styles.subViewTitle}>얼마나 시간 낼 수 있나요?</Text>
                </View>
                <CheckboxList
                    options={timeOptions}
                    selectedIds={selectedTimeIds}
                    onSelectionChange={setSelectedTimeIds}
                    multiple={false}
                    style={styles.checkboxList}
                />
            </View>
        ),
    },
    {
      title:[
        [["마음운동은 꾸준함이 ", highlightText], ["핵심이에요!"]], 
        [["저희가 도와드릴게요!"]]],
        backgroundImage: null,
        subView: (
            <View style={{width: 335, height: 344}}>
                <Image source={require('../../assets/images/onboarding/AllowingNotificationsImage.png')} style={{width: 335, height: 344}} />
            </View>
        ),
    },
    {
      title:[
        [["본격적인 시작 전에"]], 
        [["간단한 호흡을 해봐요!", highlightText]]],
      backgroundImage: require('../../assets/images/onboarding/bg4.png'),
      subView: null,
    },
    {
      title:[
        [["그거 아시나요?"]], 
        [["고양이가 "],["숨숨집을 좋아하는 이유를..", highlightText]]],
      backgroundImage: require('../../assets/images/onboarding/bg5.png'),
      subView: null,
    },
    {
      title:[
        [["꽉 맞는 숨숨집이"]], 
        [["포근함을 준다고 해요!", highlightText]]],
      backgroundImage: require('../../assets/images/onboarding/bg6.png'),
      subView: null,
    },
    {
      title:[
        [["마음이라는 장소에"]], 
        [["고양이를 들여놓아보세요!", highlightText]]],
      backgroundImage: require('../../assets/images/onboarding/bg6.png'),
      subView: null,
    },
    {
      title: null,
      backgroundImage: null,
      subView: <StepCountDown onComplete={handleNext} />,
    },
    {
      title: [
        [["호흡 (미구현)"]],
      ],
      backgroundImage: null,
      subView: null,
    },
    {
      title: null,
      backgroundImage: null,
      subView: (
        <PlayResult />
      ),
    },
    {
        title:[
          [["잊지 마세요."]], 
          [["고양이는 따뜻하고 귀엽습니다!", highlightText]]],
      backgroundImage: require('../../assets/images/onboarding/bg6.png'),
      subView: null,
    },
    {
        title:[
          [["프로필을 입력하고"]], 
          [["우리의 마음에 고양이를 들여봐요!", highlightText]]],
      backgroundImage: require('../../assets/images/onboarding/bg6.png'),
      subView: null,
    },
    {
      title: null,
      backgroundImage: null,
      subView: <Register onComplete={handleNext} />,
    },
  ];
  


  const currentStepData = steps[currentStep];

  const renderTitle = (titleData: any) => {
    if (titleData === null) {
      return null;
    }
    // title이 문자열인 경우 (단순한 경우)
    if (typeof titleData === 'string') {
      return (
        <Text style={styles.title}>
          {titleData}
        </Text>
      );
    }

    // title이 배열인 경우 (복잡한 경우)
    return titleData.map((line: any[], lineIndex: number) => {
      // 빈 줄이나 null인 경우 건너뛰기
      if (!line || line.length === 0 || (line.length === 1 && line[0] === "")) {
        return null;
      }

      return (
        <Text key={lineIndex} style={styles.title}>
          {line.map((part: any, partIndex: number) => {
            // part가 문자열인 경우
            if (typeof part === 'string') {
              return (
                <Text key={partIndex} style={{ color: colors.white }}>
                  {part}
                </Text>
              );
            }
            
            // part가 배열인 경우 [text, style]
            if (Array.isArray(part) && part.length === 2) {
              const [text, style] = part;
              return (
                <Text key={partIndex} style={[styles.title, style]}>
                  {text}
                </Text>
              );
            }
            
            // part가 배열이지만 style이 없는 경우
            if (Array.isArray(part) && part.length === 1) {
              return (
                <Text key={partIndex} style={{ color: colors.grayScale900 }}>
                  {part[0]}
                </Text>
              );
            }
            
            return null;
          })}
        </Text>
      );
    }).filter(Boolean); // null인 요소 제거
  };

  return (
    <ImageBackground source={currentStepData.backgroundImage} style={[styles.container, {backgroundColor: currentStep >= 10 ? (currentStep === 15 ? colors.primary300 : colors.primary50) : colors.white}]} resizeMode="cover">

      {/* 메인 콘텐츠 */}
      <View style={[styles.contentContainer,(currentStep === 12 || currentStep === 10) && {paddingTop: 0}]}>
        
        <View style={styles.textContainer}>
          {renderTitle(currentStepData.title)}
        </View>

        {currentStepData.subView}
      </View>
      <Text>{currentStep}</Text>
      {(currentStep === 9 || currentStep === 13 || currentStep === 14) && (
      <View style={styles.catAnimationContainer}>
        <LottieView
          source={require('../../assets/animations/cat_basic_motion.json')}
          autoPlay
          loop
          style={styles.catLottie}
        />
      </View>
      )}
    {/* 다음/시작하기 버튼 */}
    {currentStep !== 10 && currentStep !== 15 && (
      <View style={styles.buttonContainer}>
        <Button
          title={currentStep === 9 ? "마음운동 시작" : (currentStep === 5 ? "알림받기" : (currentStep === 12 ? "확인" : "다음"))}
          onPress={handleNext}
          style={styles.nextButton}
          variant="active"
          size="large"
        />
      </View>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 40,
    paddingTop: 150,
  },
  backgroundImage: {
  },
  textContainer: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    ...syongsyongTypography.title5,
  },
  buttonContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  pageIndicatorActive: {
    opacity: 1,
  },
  nextButton: {
    minWidth: 200,
  },
  subViewContainer: {
    alignItems: 'center',
    gap: 30,
    paddingHorizontal: 20,
  },
  subViewTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subViewTitle: {
    ...syongsyongTypography.title5,
    color: colors.grayScale900,
    textAlign: 'center',
  },
  checkboxList: {
    width: '100%',
  },
  catLottie: {
    width: 200,
    height: 200,
  },
  catAnimationContainer: {
    position: 'absolute',
    top: screenHeight * 0.43,
    left: screenWidth * 0.28,
  },
});

export default OnboardingScreen;