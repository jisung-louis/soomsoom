import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingContextType {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
  resetOnboarding: () => Promise<void>;
  checkOnboardingStatus: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const checkOnboardingStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(status === 'true');
    } catch (error) {
      console.error('온보딩 상태 확인 실패:', error);
      setHasSeenOnboarding(false);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('hasSeenOnboarding');
      setHasSeenOnboarding(false);
      console.log('온보딩 상태가 리셋되었습니다.');
    } catch (error) {
      console.error('온보딩 상태 리셋 실패:', error);
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const value = {
    hasSeenOnboarding,
    setHasSeenOnboarding,
    resetOnboarding,
    checkOnboardingStatus,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
