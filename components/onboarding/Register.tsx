import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Logo from '../../assets/icons/logo.svg';
import { syongsyongTypography, typography } from '../../constants/typography';
import { colors } from '../../constants/colors';
import GoogleIcon from '../../assets/images/onboarding/google_icon.svg';
import AppleIcon from '../../assets/images/onboarding/apple_icon.svg';
import { radius } from '../../constants/radius';
import { sv } from '../../utils/scale';

const { width } = Dimensions.get('window');

const Register = ({onComplete}: {onComplete: () => void}) => {
  const onGoogleLogin = () => {
    console.log('Google로 계속하기');
  }
  const onAppleLogin = () => {
    console.log('애플로 계속하기');
    onComplete();//임시로 완료처리
  }
  return (
    <View style={styles.container}>
        <View style={styles.titleContainer}>
            <Logo width={160} height={160} />
            <Text style={styles.subtitle}>숨숨</Text>
        </View>
        <View style={styles.socialLoginContainer}>
            <TouchableOpacity 
            style={[styles.socialLoginButton, styles.googleLoginButton]}
            onPress={() => {onGoogleLogin()}}
            activeOpacity={0.6}
            >
                <GoogleIcon width={24} height={24} />
                <Text style={[styles.socialLoginText, styles.googleLoginText]}>Google로 계속하기</Text>
            </TouchableOpacity>
            <TouchableOpacity 
            style={[styles.socialLoginButton, styles.appleLoginButton]}
            onPress={() => {onAppleLogin()}}
            activeOpacity={0.6}
            >
                <AppleIcon width={24} height={24} />
                <Text style={[styles.socialLoginText, styles.appleLoginText]}>애플로 계속하기</Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.termContainer} onPress={() => {{/* TODO:하이퍼링크 이동 */}}}>
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