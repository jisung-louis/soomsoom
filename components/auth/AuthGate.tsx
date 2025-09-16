import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SplashScreen, OnboardingScreen } from '../onboarding';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../constants/colors';
import { syongsyongTypography } from '../../constants/typography';
import CatConstructing from '../../assets/icons/charactors/cat-variation/cat_constructing.svg';

interface AuthGateProps {
  showSplash: boolean;
  onCompleteSplash: () => void;
  isBootstrapping: boolean;
  hasSeenOnboarding: boolean | null;
  onCompleteOnboarding: () => Promise<void> | void;
  fontsLoaded: boolean;
  children: React.ReactNode;
}

/**
 * 인증/온보딩/스플래시 단계에 따라 적절한 화면을 스위칭하는 컴포넌트
 * - 앱 전역의 초기 상태(스플래시/온보딩/인증)를 한 곳에서 제어합니다.
 */
const AuthGate: React.FC<AuthGateProps> = ({
  showSplash,
  onCompleteSplash,
  isBootstrapping,
  hasSeenOnboarding,
  onCompleteOnboarding,
  fontsLoaded,
  children,
}) => {
  const { phase } = useAuthStore();
  if (showSplash) {
    return <SplashScreen onComplete={onCompleteSplash} />;
  }

  if (hasSeenOnboarding === null || isBootstrapping || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <CatConstructing width={100} height={100} />
        <Text style={styles.loadingText}>{isBootstrapping ? '로딩 중...' : fontsLoaded ? '폰트 로딩 중...' : '온보딩 중...'}</Text>
        <ActivityIndicator size="large" color={colors.primary300} />
      </View>
    );
  }

  if (!hasSeenOnboarding) {
    return <OnboardingScreen onComplete={onCompleteOnboarding} />;
  }

  if (phase === 'logged_out') {
    return <OnboardingScreen onComplete={onCompleteOnboarding} initialStep={15} />;
  }



  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary100,
    gap: 20,
  },
  loadingText: {
    ...syongsyongTypography.title4,
    color: colors.grayScale900,
    textAlign: 'center',
  },
});

export default AuthGate;


