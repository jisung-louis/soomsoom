import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../../constants/colors';
import { syongsyongTypography } from '../../constants/typography';
import { Button } from '../common/buttons/Button';
import { CheckboxList } from '../common/checkbox';
import { focusOptions, timeOptions } from '../../data/onboardingData';
import { OnboardingCountdown } from './OnboardingCountdown';
import PlayResult from '../tabs/play/PlayResultScreen/PlayResult';
import Register from './Register';
import { ss, sv } from '../../utils/scale';
import LottieView from 'lottie-react-native';
import { itemStyles } from '../../constants/roomLayout';
import { LayoutChangeEvent } from 'react-native';
import BreathingGuide from './BreathingGuide';

interface OnboardingStepProps {
  stepId: string;
  title: any[][]; // 복잡한 타입 대신 any 사용 (기존 코드와 호환성 유지)
  selectedFocusIds: string[];
  selectedTimeIds: string[];
  onFocusSelectionChange: (ids: string[]) => void;
  onTimeSelectionChange: (ids: string[]) => void;
  onCountdownComplete: () => void;
  onNext: () => void;
  showNext?: boolean;
  specialButtonText?: '알림받기' | '마음운동 시작' | '확인'; 
  canProceed: boolean;
  submitOnboardingAnswers?: () => Promise<boolean>;
}

/**
 * 온보딩 단계별 컴포넌트
 * 
 * 🎯 왜 이렇게 하나요?
 * - 각 단계별로 다른 UI를 렌더링
 * - 재사용 가능한 단계 컴포넌트
 * - 깔끔한 조건부 렌더링
 */
export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  stepId,
  title,
  selectedFocusIds,
  selectedTimeIds,
  onFocusSelectionChange,
  onTimeSelectionChange,
  onCountdownComplete,
  onNext,
  showNext = false,
  specialButtonText,
  canProceed,
  submitOnboardingAnswers,
}) => {
  // 제목 렌더링 함수
  const renderTitle = () => {
    return title.map((line, lineIndex) => (
      <Text key={lineIndex} style={[syongsyongTypography.title5, styles.titleLine]}>
        {line.map((segment, segmentIndex) => {
          // segment가 배열인 경우 [text, style]
          if (Array.isArray(segment) && segment.length === 2) {
            const [text, style] = segment;
            return (
              <Text key={segmentIndex} style={style}>
                {text}
              </Text>
            );
          }
          // segment가 문자열인 경우
          if (typeof segment === 'string') {
            return (
              <Text key={segmentIndex} style={{ color: colors.white }}>
                {segment}
              </Text>
            );
          }
          // 기타 경우 (객체 등)는 무시
          return null;
        })}
      </Text>
    ));
  };

  // 단계별 콘텐츠 렌더링
  const renderStepContent = () => {
    switch (stepId) {
      case 'onboarding03'://focus_selection
        return (
            <>
                {renderTitle()}
                <CheckboxList
                    options={focusOptions}
                    selectedIds={selectedFocusIds}
                    onSelectionChange={onFocusSelectionChange}
                    style={styles.checkboxList}
                    multiple={false}
                />
            </>
        );

      case 'onboarding05'://time_selection
        return (
            <>
                {renderTitle()}
                <CheckboxList
                    options={timeOptions}
                    selectedIds={selectedTimeIds}
                    onSelectionChange={onTimeSelectionChange}
                    style={styles.checkboxList}
                    multiple={false}
                />
            </>
        );

      case 'onboarding06'://notification
        return (
            <>
                {renderTitle()}
                <Image source={require('../../assets/images/onboarding/AllowingNotificationsImage.png')} style={styles.notificationImage} />
                {/* TODO:사용자에게 알림 허용 여부 확인 */}
            </>
        );

      case 'onboarding10'://cat_lottie
      case 'onboarding14'://cat_lottie
      case 'onboarding15'://cat_lottie
        return (
            <>
                <LottieView 
                    source={require('../../assets/animations/cat_basic_motion.json')} 
                    autoPlay 
                    loop 
                    style={[itemStyles.cat, {
                        top: itemStyles.cat.top - contentContainerY,
                        left: itemStyles.cat.left - contentContainerX,
                    }]} 
                />
                <Image source={require('../../assets/icons/items/default-background/shadow_default.png')} style={[itemStyles.shadowStyle, itemStyles.shadowSize, {
                    top: itemStyles.shadowStyle.top - contentContainerY,
                    left: itemStyles.shadowStyle.left - contentContainerX,
                }]} />
            </>
        );

      case 'onboarding11'://countdown
        return (
          <OnboardingCountdown
            onComplete={onCountdownComplete}
            duration={5}
          />
        );

      case 'onboarding12'://breath
        return (
          <BreathingGuide onComplete={onNext} />
        );
        
      case 'onboarding13'://playresult
        return (
          <PlayResult isOnboarding/>
        );


      case 'register':
        return <Register onComplete={() => {onNext()}} submitOnboardingAnswers={submitOnboardingAnswers} />;

      default:
        return null;
    }
  };
  const [contentContainerX, setContentContainerX] = useState(0);
  const [contentContainerY, setContentContainerY] = useState(0);
  const onLayout = (thisXY: LayoutChangeEvent) => {
    setContentContainerX(thisXY.nativeEvent.layout.x);
    setContentContainerY(thisXY.nativeEvent.layout.y);
  };
  const NO_TITLE_STEP_ID = ['onboarding03', 'onboarding05', 'onboarding06', 'onboarding11', 'onboarding12', 'onboarding13', 'register'];
  return (
    <View style={styles.container}>
      {/* 제목 */}
      {NO_TITLE_STEP_ID.includes(stepId) ? null : (
        <View style={styles.titleContainer}>
          {renderTitle()}
        </View>
      )}

      {/* 콘텐츠 */}
      <View style={styles.contentContainer} onLayout={onLayout}>
        {renderStepContent()}
      </View>

      {/* 버튼 */}
      {showNext && (
        <View style={styles.buttonContainer}>
            <Button
                title={specialButtonText ?  specialButtonText : '다음'}
                onPress={onNext}
                disabled={!canProceed}
                variant={canProceed ? "active" : "default"}
                style={styles.nextButton}
            />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: sv(148),
    marginBottom: 40,
  },
  titleLine: {
    textAlign: 'center',
    lineHeight: 24 * 1.3,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  checkboxList: {
    marginTop: 30,
  },
  notificationImage: {
    width: ss(335),
    height: sv(344),
    marginTop: 30,
    // borderWidth: 0.3,
    // borderColor: '#292A2B',
    // borderRadius: radius.r8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 46,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  nextButton: {
    flex: 1,
    zIndex: 10000000,
  },
});
