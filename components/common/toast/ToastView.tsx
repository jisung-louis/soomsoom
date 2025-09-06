// 토스트 메시지 UI모양의 고정된 컴포넌트

import React from 'react';
import { View, Text, StyleSheet, Dimensions, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import { typography } from '../../../constants/typography';
// 토스트에서 사용할 아이콘들
import HeartIcon from '../../../assets/icons/common/Heart.svg';
import BrokenHeartIcon from '../../../assets/icons/common/broken_Heart.svg';
import AlarmIcon from '../../../assets/icons/common/alarm.svg';
import HelpIcon from '../../../assets/icons/common/help.svg';
import CheckIcon from '../../../assets/icons/common/stroke_check.svg';

const { width: screenWidth } = Dimensions.get('window');

export type ToastTheme = 'light' | 'dark';

// 토스트에서 사용할 수 있는 아이콘 타입
export type ToastIconType = 
  | 'heart'
  | 'brokenHeart' 
  | 'alarm' 
  | 'help' 
  | 'check' 
  | 'none';

interface ToastViewProps {
  message: string;
  theme: ToastTheme;
  iconType?: ToastIconType;
  style?: StyleProp<ViewStyle>;
}

// 테마별 스타일 정의
const toastThemes = {
  light: {
    backgroundColor: colors.primary50,
    textColor: colors.primary400,
  },
  dark: {
    backgroundColor: colors.grayScale900,
    textColor: colors.white,
  },
};

// 아이콘 타입별 매핑
const getToastIcon = (iconType: ToastIconType) => {
  switch (iconType) {
    case 'heart':
      return <HeartIcon width={24} height={24} />;
    case 'brokenHeart':
      return <BrokenHeartIcon width={24} height={24} />;
    case 'alarm':
      return <AlarmIcon width={24} height={24} />;
    case 'help':
      return <HelpIcon width={24} height={24} />;
    case 'check':
      return <CheckIcon width={24} height={24} />;
    case 'none':
    default:
      return null;
  }
};

const ToastView: React.FC<ToastViewProps> = ({ message, theme, iconType = 'none', style }) => {
  const themeStyle = toastThemes[theme];
  const icon = getToastIcon(iconType);

  return (
    <View style={[styles.toast, { backgroundColor: themeStyle.backgroundColor }, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.message,
          { color: themeStyle.textColor },
        ]}
        numberOfLines={3}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radius.r8,
    maxWidth: screenWidth - 40,
    minWidth: 56,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
  message: {
    ...typography.body5,
    textAlign: 'center',
  },
});

export default ToastView; 