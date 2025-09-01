import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../constants/colors';
import { syongsyongTypography, typography } from '../../constants/typography';
import { radius } from '../../constants/radius';
import Logo from '../../assets/icons/logo.svg';

interface SplashScreenProps {
  onComplete: () => void;
}

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    // 3초 후 자동으로 다음 화면으로 이동
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.container}>
      {/* 앱 로고/이름 */}
      <View style={styles.logoContainer}>
        <Logo width={120} height={120} />
      </View>
      
      {/* 로딩 인디케이터 */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SplashScreen;