import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { useToast } from './ToastContext';
import GoogleIcon from '../assets/images/onboarding/google_icon.svg';
import AppleIcon from '../assets/images/onboarding/apple_icon.svg';
import { syongsyongTypography } from '../constants/typography';

interface SocialLoginContextType {
  showSocialLoginModal: () => void;
  hideSocialLoginModal: () => void;
  isVisible: boolean;
}

const SocialLoginContext = createContext<SocialLoginContextType | undefined>(undefined);

interface SocialLoginProviderProps {
  children: ReactNode;
}

export const SocialLoginProvider: React.FC<SocialLoginProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { socialLogin } = useAuth();
  const { showToast } = useToast();

  const showSocialLoginModal = () => {
    setIsVisible(true);
  };

  const hideSocialLoginModal = () => {
    setIsVisible(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await socialLogin('GOOGLE');
      if (result.success) {
        hideSocialLoginModal();
      }
    } catch (error) {
      console.error('구글 로그인 실패:', error);
    }
  };

  const handleAppleLogin = async () => {
    try {
      const result = await socialLogin('APPLE');
      if (result.success) {
        hideSocialLoginModal();
      }
    } catch (error) {
      console.error('애플 로그인 실패:', error);
    }
  };

  const handleCancel = () => {
    hideSocialLoginModal();
  };

  return (
    <SocialLoginContext.Provider value={{ showSocialLoginModal, hideSocialLoginModal, isVisible }}>
      {children}
      
      {/* 소셜 로그인 모달 */}
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>로그인</Text>
            <Text style={styles.subtitle}>소셜 계정으로 로그인해주세요</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                <GoogleIcon width={24} height={24} />
                <Text style={styles.googleButtonText}>Google로 로그인</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.appleButton} onPress={handleAppleLogin}>
                <AppleIcon width={24} height={24} />
                <Text style={styles.appleButtonText}>애플로 로그인</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SocialLoginContext.Provider>
  );
};

export const useSocialLogin = () => {
  const context = useContext(SocialLoginContext);
  if (context === undefined) {
    throw new Error('useSocialLogin must be used within a SocialLoginProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
  },
  title: {
    ...syongsyongTypography.title3,
    color: colors.grayScale900,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body5,
    color: colors.grayScale600,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.grayScale200,
  },
  googleButtonText: {
    ...typography.body2,
    color: colors.black,
    fontWeight: '600',
  },
  appleButton: {
    flexDirection: 'row',
    backgroundColor: colors.black,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  appleButtonText: {
    ...typography.body2,
    color: colors.white,
  },
  cancelButton: {
    backgroundColor: colors.grayScale100,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  cancelButtonText: {
    ...typography.body2,
    color: colors.grayScale600,
  },
});
