import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { useToast } from '../../contexts/ToastContext';
import { useAuthStore } from '../../stores/authStore';
import { getPushTokenAsync, loginWithApple, loginWithGoogle, postSocialLogin, persistUser } from '../../services/authService';
import * as Device from 'expo-device';
import * as Localization from 'expo-localization';
import GoogleIcon from '../../assets/images/onboarding/google_icon.svg';
import AppleIcon from '../../assets/images/onboarding/apple_icon.svg';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/radius';
import { typography } from '../../constants/typography';

const { width } = Dimensions.get('window');

interface Props {
  onSuccess?: () => void;
}

export const SocialLoginButtons: React.FC<Props> = ({ onSuccess }) => {
  const { showToast } = useToast();
  const setSession = useAuthStore(s => s.setSession);
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);

  // 디바이스 정보 수집 함수
  const getDeviceInfo = () => {
    return {
      platform: Platform.OS as 'ios' | 'android',
      version: Platform.Version.toString(),
      model: Device.modelName || 'Unknown',
    };
  };

  // 앱 버전 정보 (package.json에서 가져오기)
  const getAppVersion = () => {
    try {
      const packageJson = require('../../package.json');
      return packageJson.version;
    } catch (error) {
      console.warn('package.json에서 버전 정보를 가져올 수 없습니다:', error);
      return '1.0.0'; // fallback
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading('google');
      const deviceToken = await getPushTokenAsync();
      
      // EAS 개발 빌드에서 실제 Google 로그인 테스트
      const { provider, providerToken, profile } = await loginWithGoogle();
      
      // 추가 정보 수집
      const deviceInfo = getDeviceInfo();
      const appVersion = getAppVersion();
      const timezone = Localization.getCalendars()[0]?.timeZone || 'UTC';
      const language = Localization.getLocales()[0]?.languageTag || 'ko-KR';
        
      const res = await postSocialLogin({ 
        provider, 
        providerToken, 
        deviceToken, 
        profile,
        deviceInfo,
        appVersion,
        timezone,
        language
      });
      await setSession(res);
      await persistUser(res.user); // 사용자 정보를 AsyncStorage에 저장
      onSuccess?.();
    } catch (e: any) {
      console.error('Google 로그인 에러 상세:', e);
      
      // 에러 타입별 구체적인 메시지 제공
      let errorMessage = '구글 로그인에 실패했어요.';
      
      if (e?.message?.includes('취소')) {
        errorMessage = '구글 로그인이 취소되었어요.';
      } else if (e?.message?.includes('네트워크')) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else if (e?.message?.includes('권한')) {
        errorMessage = '구글 로그인 권한이 필요해요.';
      } else if (e?.message?.includes('서버')) {
        errorMessage = '서버에 문제가 있어요. 잠시 후 다시 시도해주세요.';
      }
      
      showToast({ message: errorMessage });
    } finally {
      setLoading(null);
    }
  };

  const handleApple = async () => {
    try {
      setLoading('apple');
      const deviceToken = await getPushTokenAsync();
      
      // 실제 Apple 로그인 사용 (테스트용)
      const { provider, providerToken, profile, authorizationCode, nonce } = await loginWithApple();
      
      // 추가 정보 수집
      const deviceInfo = getDeviceInfo();
      const appVersion = getAppVersion();
      const timezone = Localization.getCalendars()[0]?.timeZone || 'UTC';
      const language = Localization.getLocales()[0]?.languageTag || 'ko-KR';
        
      const res = await postSocialLogin({ 
        provider, 
        providerToken, 
        deviceToken, 
        profile, 
        authorizationCode, 
        nonce,
        deviceInfo,
        appVersion,
        timezone,
        language
      });
      await setSession(res);
      await persistUser(res.user); // 사용자 정보를 AsyncStorage에 저장
      onSuccess?.();
    } catch (e: any) {
      console.error('Apple 로그인 에러 상세:', e);
      
      // 에러 타입별 구체적인 메시지 제공
      let errorMessage = '애플 로그인에 실패했어요.';
      
      if (e?.message?.includes('취소')) {
        errorMessage = '애플 로그인이 취소되었어요.';
      } else if (e?.message?.includes('네트워크')) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else if (e?.message?.includes('권한')) {
        errorMessage = '애플 로그인 권한이 필요해요.';
      } else if (e?.message?.includes('서버')) {
        errorMessage = '서버에 문제가 있어요. 잠시 후 다시 시도해주세요.';
      } else if (e?.message?.includes('사용할 수 없습니다')) {
        errorMessage = '이 기기에서는 애플 로그인을 사용할 수 없어요.';
      }
      
      showToast({ message: errorMessage });
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.white }]} onPress={handleGoogle} disabled={!!loading} activeOpacity={0.8} >
        <GoogleIcon width={24} height={24} />
        <Text style={[styles.buttonText, { color: colors.black }]}>{loading === 'google' ? 'Google 로그인 중...' : 'Google로 계속하기'}</Text>
      </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.black }]} onPress={handleApple} disabled={!!loading} activeOpacity={0.8} >
        <AppleIcon width={24} height={24} />
        <Text style={[styles.buttonText, { color: colors.white }]}>{loading === 'apple' ? '애플 로그인 중...' : '애플로 계속하기'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: radius.r8,
  },
  buttonText: {
    ...typography.body2,
  },
});

export default SocialLoginButtons;
