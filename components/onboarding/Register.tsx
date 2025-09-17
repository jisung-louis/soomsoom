import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Logo from '../../assets/icons/logo.svg';
import { syongsyongTypography, typography } from '../../constants/typography';
import { colors } from '../../constants/colors';
import { sv } from '../../utils/scale';
import SocialLoginButtons from './SocialLoginButtons';
import { useOpenExternalLink } from '../../hooks/useOpenExternalLink';

const TERMS_URL = 'https://habjungdriking.notion.site/Terms-of-Service-2368c8e0513580f9999ccb7bb901a0d5';
const PRIVACY_URL = 'https://habjungdriking.notion.site/2378c8e0513580758730fade7689a04a';

interface RegisterProps {
  onComplete: () => void;
  submitOnboardingAnswers?: () => Promise<boolean>;
}

const Register = ({onComplete, submitOnboardingAnswers}: RegisterProps) => {
  const openExternalLink = useOpenExternalLink();
  
  const handleLoginSuccess = async () => {
    // 온보딩 답변 전송
    if (submitOnboardingAnswers) {
      const success = await submitOnboardingAnswers();
      if (success) {
        console.log('✅ 온보딩 답변 전송 완료');
      } else {
        console.warn('⚠️ 온보딩 답변 전송 실패 (계속 진행)');
      }
    }
    onComplete();
  };
  return (
    <View style={styles.container}>
        <View style={styles.titleContainer}>
            <Logo width={160} height={160} />
            <Text style={styles.subtitle}>숨숨</Text>
        </View>
        <View style={styles.socialLoginContainer}>
          <SocialLoginButtons onSuccess={handleLoginSuccess} />
        </View>
        <TouchableOpacity style={styles.noLoginContainer} onPress={handleLoginSuccess}>
          <Text style={styles.noLoginText}>비회원으로 계속하기</Text>
        </TouchableOpacity>
        <View style={styles.termContainer}>
          <View style={styles.termTextContainer}>
            <Text style={styles.termText}>숨숨에 가입함으로써 </Text>
            <Text style={styles.TouchableTermText} onPress={() => { openExternalLink(TERMS_URL); }}>이용약관 </Text>
            <Text style={styles.termText}>및</Text>
          </View>
          <View style={styles.termTextContainer}>
            <Text style={styles.TouchableTermText} onPress={() => { openExternalLink(PRIVACY_URL); }}>개인정보처리방침</Text>
            <Text style={styles.termText}>에 동의하게 됩니다.</Text>
          </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    marginTop: sv(153),
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  subtitle: {
    ...syongsyongTypography.title1,
    color: colors.white,
    textShadowColor: colors.white,
    fontSize: 48,
    lineHeight: 48,
  },
  socialLoginContainer: {
    width: '100%',
    marginTop: sv(83),
  },
  noLoginContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: sv(30),
  },
  noLoginText: {
    ...syongsyongTypography.title6,
    color: colors.white,
    textDecorationLine: 'underline',
    textShadowColor: colors.white,
    fontSize: 18,
  },
  termContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: sv(100),
  },
  termTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  termText: {
    ...typography.body5,
    color: colors.primary100,
  },
  TouchableTermText: {
    ...typography.body5,
    color: colors.primary100,
    textDecorationLine: 'underline',
    textDecorationColor: colors.primary100,
    textDecorationStyle: 'solid',
    fontWeight: 'bold',
  },
});

export default Register;