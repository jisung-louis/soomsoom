import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import GoogleIcon from '../../assets/images/onboarding/google_icon.svg';
import AppleIcon from '../../assets/images/onboarding/apple_icon.svg';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/radius';
import { typography } from '../../constants/typography';

interface Props {
  onSuccess?: () => void;
}

export const SocialLoginButtons: React.FC<Props> = ({ onSuccess }) => {
  const { socialLogin, loading } = useAuth();

  const handleGoogle = async () => {
    const result = await socialLogin('GOOGLE');
    if (result.success) {
      onSuccess?.();
    }
  };

  const handleApple = async () => {
    const result = await socialLogin('APPLE');
    if (result.success) {
      onSuccess?.();
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.white }]} 
        onPress={handleGoogle} 
        disabled={loading === 'GOOGLE'} 
        activeOpacity={0.8}
      >
        <GoogleIcon width={24} height={24} />
        <Text style={[styles.buttonText, { color: colors.black }]}>
          {loading === 'GOOGLE' ? 'Google 로그인 중...' : 'Google로 계속하기'}
        </Text>
      </TouchableOpacity>
      
      {Platform.OS === 'ios' && (
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.black }]} 
        onPress={handleApple} 
        disabled={loading === 'APPLE'} 
        activeOpacity={0.8}
      >
        <AppleIcon width={24} height={24} />
        <Text style={[styles.buttonText, { color: colors.white }]}>
          {loading === 'APPLE' ? '애플 로그인 중...' : '애플로 계속하기'}
        </Text>
      </TouchableOpacity>
      )}

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
