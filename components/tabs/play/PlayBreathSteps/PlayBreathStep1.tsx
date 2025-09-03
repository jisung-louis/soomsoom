import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { syongsyongTypography } from '../../../../constants/typography';
import { colors } from '../../../../constants/colors';
import { PlayBreathStep0 } from './PlayBreathStep0';

interface PlayBreathStep1Props {
  windowHeight: number;
  safeAreaHeight: number;
  animatedStyle: any;
  onAnimationFinish: () => void;
}

/**
 * 호흡 운동 Step 1: 화면 터치 안내
 * 
 * 🎯 책임:
 * - Step0 컴포넌트 렌더링
 * - 화면 터치 안내 텍스트 표시 (애니메이션 포함)
 */
export const PlayBreathStep1: React.FC<PlayBreathStep1Props> = ({
  windowHeight,
  safeAreaHeight,
  animatedStyle,
  onAnimationFinish,
}) => {
  return (
    <View style={styles.container}>
      {/* Step 0 컴포넌트 재사용 */}
      <PlayBreathStep0
        windowHeight={windowHeight}
        safeAreaHeight={safeAreaHeight}
        onAnimationFinish={onAnimationFinish}
        isActive={false}//Step 1에서는 Step 0의 애니메이션이 재생되면 안됨
      />
      
      {/* 화면 터치 안내 텍스트 (애니메이션) */}
      <Animated.View style={[animatedStyle, styles.touchTextContainer]}>
        <Text style={styles.touchText}>
          화면을 터치해주세요!
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  touchTextContainer: {
    marginTop: 6,
  },
  touchText: {
    ...syongsyongTypography.title5,
    color: colors.primary300,
    textShadowColor: colors.primary300,
  },
});
