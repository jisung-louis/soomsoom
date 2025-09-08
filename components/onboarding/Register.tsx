import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Linking, Alert } from 'react-native';
import Logo from '../../assets/icons/logo.svg';
import { syongsyongTypography, typography } from '../../constants/typography';
import { colors } from '../../constants/colors';
import GoogleIcon from '../../assets/images/onboarding/google_icon.svg';
import AppleIcon from '../../assets/images/onboarding/apple_icon.svg';
import { radius } from '../../constants/radius';
import { sv } from '../../utils/scale';
import SocialLoginButtons from './SocialLoginButtons';

const { width } = Dimensions.get('window');
const TERMS_URL = 'https://www.notion.so/habjungdriking/2378c8e0513580758730fade7689a04a';
const PRIVACY_URL = 'https://example.com/privacy';

const Register = ({onComplete}: {onComplete: () => void}) => {
  const onGoogleLogin = () => {
    console.log('Google로 계속하기');
  }
  const onAppleLogin = () => {
    console.log('애플로 계속하기');
    onComplete();//임시로 완료처리
  }
  const openExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('링크를 열 수 없어요', '지원되지 않는 URL 형식입니다.');
      }
    } catch (error) {
      Alert.alert('오류가 발생했어요', '잠시 후 다시 시도해주세요.');
    }
  }
  return (
    <View style={styles.container}>
        <View style={styles.titleContainer}>
            <Logo width={160} height={160} />
            <Text style={styles.subtitle}>숨숨</Text>
        </View>
        <View style={styles.socialLoginContainer}>
            <SocialLoginButtons onSuccess={onComplete} />
        </View>
        <TouchableOpacity style={styles.termContainer} onPress={() => { openExternalLink(TERMS_URL); }}>
            <Text style={styles.termText}>숨숨에 가입함으로써 이용약관 및</Text>
            <Text style={styles.termText}>개인정보처리방침에 동의하게 됩니다.</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 100,
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  socialLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    width: width * 0.85,
    borderRadius: radius.r8,
  },
  googleLoginButton: {
    backgroundColor: colors.white,
  },
  appleLoginButton: {
    backgroundColor: colors.black,
  },
  socialLoginText: {
    ...typography.body2,
  },
  googleLoginText: {
    color: colors.black,
  },
  appleLoginText: {
    color: colors.white,
  },
  termContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  termText: {
    ...typography.body5,
    color: colors.primary100,
    lineHeight: 15,
  },
});

export default Register;