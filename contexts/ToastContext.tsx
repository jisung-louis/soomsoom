import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastIconType } from '../components/common/toast/ToastView';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { ss } from '../utils/scale';

export type ToastTheme = 'light' | 'dark';

export interface ToastConfig {
  message: string;
  theme?: ToastTheme;
  iconType?: ToastIconType;
  hasAnimation?: boolean;
  duration?: number;
  amount?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconSize?: number;
}

interface ToastContextType {
  visible: boolean;
  message: string;
  iconType: ToastIconType;
  theme: ToastTheme;
  hasAnimation: boolean;
  iconSize?: number;
  amount?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
  hasBottomNavigation: boolean;
  setHasBottomNavigation: (hasBottomNav: boolean) => void;
  setAmount: (amount: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
  iconSize?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [iconType, setIconType] = useState<ToastIconType>('none');
  const [theme, setTheme] = useState<ToastTheme>('dark');
  const [hasAnimation, setHasAnimation] = useState(false);
  const [iconSize, setIconSize] = useState(0);
  const [amount, setAmount] = useState(0);
  const [style, setStyle] = useState<StyleProp<ViewStyle>>({});
  const [textStyle, setTextStyle] = useState<StyleProp<TextStyle>>({});
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [hasBottomNavigation, setHasBottomNavigation] = useState(true); // 기본값: 바텀 네비게이션 있음

  const showToast = useCallback((config: ToastConfig) => {
    // 기존 타이머가 있다면 클리어
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const selectedTheme = config.theme || 'dark';
    const selectedIconType = config.iconType || 'none';
    const selectedAmount = config.amount || 0;
    const selectedStyle = config.style || {};
    const selectedTextStyle = config.textStyle || {};
    const selectedIconSize = config.iconSize || ss(24);
    setMessage(config.message);
    setIconType(selectedIconType);
    setTheme(selectedTheme);
    setHasAnimation(config.hasAnimation || false);
    setAmount(selectedAmount);
    setStyle(selectedStyle);
    setTextStyle(selectedTextStyle);
    setIconSize(selectedIconSize);
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
    amount,
    style,
    textStyle,
    iconSize,
    setAmount,
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