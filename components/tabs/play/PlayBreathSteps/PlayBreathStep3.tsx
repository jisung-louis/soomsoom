import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { syongsyongTypography } from '../../../../constants/typography';

interface PlayBreathStep3Props {
  windowHeight: number;
  safeAreaHeight: number;
  onNext: () => void;
}

/**
 * 호흡 운동 Step 3: 준비 안내
 * 
 * 🎯 책임:
 * - 준비 안내 텍스트 표시
 * - 2초 후 자동으로 다음 단계로 이동
 */
export const PlayBreathStep3: React.FC<PlayBreathStep3Props> = ({
  windowHeight,
  safeAreaHeight,
  onNext,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onNext();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <View style={styles.container}>
      <Text style={[
        syongsyongTypography.title4,
        {
          marginTop: (windowHeight * 0.55) - safeAreaHeight
        }
      ]}>
        자 이제 준비하세요!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
