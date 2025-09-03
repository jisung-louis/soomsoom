import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { syongsyongTypography } from '../../../../constants/typography';
import { colors } from '../../../../constants/colors';

interface PlayBreathStep0Props {
  windowHeight: number;
  safeAreaHeight: number;
  onAnimationFinish: () => void;
  isActive?: boolean;
}

/**
 * 호흡 운동 Step 0: 물고기 내려오는 애니메이션
 * 
 * 🎯 책임:
 * - 물고기 내려오는 Lottie 애니메이션 재생
 * - 애니메이션 완료 시 다음 단계로 이동
 * - 안내 텍스트 표시
 */
export const PlayBreathStep0: React.FC<PlayBreathStep0Props> = ({
  windowHeight,
  safeAreaHeight,
  onAnimationFinish,
  isActive=true,
}) => {
  return (
    <View style={styles.container}>
      {/* 물고기 내려오는 애니메이션 */}
      <LottieView
        source={require('../../../../assets/animations/fish_down.json')}
        autoPlay={isActive}
        loop={false}
        style={[
          styles.fish,
          {
            width: '100%',
            height: windowHeight * 0.5,
            maxHeight: 400,
            top: -safeAreaHeight,
          }
        ]}
        onAnimationFinish={onAnimationFinish}
      />
      
      {/* 안내 텍스트 */}
      <Text style={[
        syongsyongTypography.title4,
        {
          marginTop: (windowHeight * 0.55) - safeAreaHeight
        }
      ]}>
        가장 편안한 자세를 찾아보세요!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  fish: {
    position: 'absolute',
  },
});
