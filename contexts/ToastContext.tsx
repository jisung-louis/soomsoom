import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastIconType } from '../components/common/toast/ToastView';

export type ToastTheme = 'light' | 'dark';

export interface ToastConfig {
  message: string;
  theme?: ToastTheme;
  iconType?: ToastIconType;
  hasAnimation?: boolean;
  duration?: number;
}

interface ToastContextType {
  visible: boolean;
  message: string;
  iconType: ToastIconType;
  theme: ToastTheme;
  hasAnimation: boolean;
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
  hasBottomNavigation: boolean;
  setHasBottomNavigation: (hasBottomNav: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [iconType, setIconType] = useState<ToastIconType>('none');
  const [theme, setTheme] = useState<ToastTheme>('dark');
  const [hasAnimation, setHasAnimation] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [hasBottomNavigation, setHasBottomNavigation] = useState(true); // 기본값: 바텀 네비게이션 있음

  const showToast = useCallback((config: ToastConfig) => {
    // 기존 타이머가 있다면 클리어
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const selectedTheme = config.theme || 'dark';
    const selectedIconType = config.iconType || 'none';

    setMessage(config.message);
    setIconType(selectedIconType);
    setTheme(selectedTheme);
    setHasAnimation(config.hasAnimation || false);
    // visible이 이미 true여도 강제로 업데이트하여 애니메이션 트리거
    setVisible(false);
    setTimeout(() => {
      setVisible(true);
    }, 10);

    // 자동 숨김 타이머 설정
    const duration = config.duration || 2500;
    const newTimeoutId = setTimeout(() => {
      setVisible(false);
    }, duration);
    setTimeoutId(newTimeoutId);
  }, [timeoutId]);

  const hideToast = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setVisible(false);
  }, [timeoutId]);

  const value: ToastContextType = {
    visible,
    message,
    iconType,
    theme,
    hasAnimation,
    showToast,
    hideToast,
    hasBottomNavigation,
    setHasBottomNavigation,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 