import React, { useState } from 'react';
import { View } from 'react-native';
import { ButtonSmall } from '../common/buttons/ButtonSmall';
import { useToast } from '../../contexts/ToastContext';
import { useAuthStore } from '../../stores/authStore';
import { getPushTokenAsync, loginWithApple, loginWithGoogle, postSocialLogin, mockLoginWithGoogle, mockLoginWithApple, persistUser } from '../../services/authService';
import { environmentConfig } from '../../configs/environment';

interface Props {
  onSuccess?: () => void;
}

export const SocialLoginButtons: React.FC<Props> = ({ onSuccess }) => {
  const { showToast } = useToast();
  const setSession = useAuthStore(s => s.setSession);
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);

  const handleGoogle = async () => {
    try {
      setLoading('google');
      const deviceToken = await getPushTokenAsync();
      
      // EAS 개발 빌드에서 실제 Google 로그인 테스트
      const { provider, providerToken, profile } = await loginWithGoogle();
        
      const res = await postSocialLogin({ provider, providerToken, deviceToken, profile });
      await setSession(res);
      await persistUser(res.user); // 사용자 정보를 AsyncStorage에 저장
      onSuccess?.();
    } catch (e: any) {
      showToast(e?.message || '구글 로그인에 실패했어요.');
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
        
      const res = await postSocialLogin({ provider, providerToken, deviceToken, profile, authorizationCode, nonce });
      await setSession(res);
      await persistUser(res.user); // 사용자 정보를 AsyncStorage에 저장
      onSuccess?.();
    } catch (e: any) {
      showToast(e?.message || '애플 로그인에 실패했어요.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <ButtonSmall title={loading === 'google' ? '구글 로그인 중...' : 'Google로 계속하기'} onPress={handleGoogle} disabled={!!loading} />
      <ButtonSmall title={loading === 'apple' ? '애플 로그인 중...' : '애플로 계속하기'} onPress={handleApple} disabled={!!loading} />
    </View>
  );
};

export default SocialLoginButtons;
