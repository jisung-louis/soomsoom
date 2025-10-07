// 토스트 메시지 UI모양의 고정된 컴포넌트

import LottieView from 'lottie-react-native';
import React from 'react';
import { View, Text, StyleSheet, Dimensions, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import { typography } from '../../../constants/typography';
// 토스트에서 사용할 아이콘들
import HeartIcon from '../../../assets/icons/common/Heart.svg';
import BrokenHeartIcon from '../../../assets/icons/common/broken_Heart.svg';
import AlarmIcon from '../../../assets/icons/common/alarm.svg';
import HelpIcon from '../../../assets/icons/common/help.svg';
import CheckIcon from '../../../assets/icons/common/stroke_check.svg';
import { ss, sv } from '../../../utils/scale';
import { zIndex } from '../../../constants/roomLayout';

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
  amount?: number;
  iconType?: ToastIconType;
  hasAnimation?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconSize?: number;
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
const getToastIcon = (iconType: ToastIconType, iconSize: number) => {
  switch (iconType) {
    case 'heart':
      return <HeartIcon width={iconSize} height={iconSize} />;
    case 'brokenHeart':
      return <BrokenHeartIcon width={iconSize} height={iconSize} />;
    case 'alarm':
      return <AlarmIcon width={iconSize} height={iconSize} />;
    case 'help':
      return <HelpIcon width={iconSize} height={iconSize} />;
    case 'check':
      return <CheckIcon width={iconSize} height={iconSize} />;
    case 'none':
    default:
      return null;
  }
};

const ToastView: React.FC<ToastViewProps> = ({ message, theme, amount, iconType = 'none', hasAnimation = false, style, textStyle, 
  //iconSize=ss(32) 
  iconSize=ss(24)

}) => {
  const themeStyle = toastThemes[theme];
  const icon = getToastIcon(iconType, iconSize);

  return (
    <>
    <View style={[styles.toast, { backgroundColor: themeStyle.backgroundColor }, style]}>
      {icon && 
      <View style={styles.iconContainer}>
        {/* {iconType === 'heart' && hasAnimation && 
        <LottieView
          source={require('../../../assets/animations/heart_up.json')}
          autoPlay
          loop
          onAnimationFinish={() => {
            console.log('Animation finished');
          }}
          style={styles.icon}
        />} */}
        {icon}
        {typeof amount === 'number' && amount > 0 && (
          <Text style={[styles.amount, { color: themeStyle.textColor }]}>+{amount}</Text>
        )}
      </View>}
      <Text
        style={[
          styles.message,
          { color: themeStyle.textColor },
          textStyle,
        ]}
        numberOfLines={3}
      >
        {message}
      </Text>
    </View>
    {iconType === 'heart' && hasAnimation && (
      <LottieView
        source={require('../../../assets/animations/heart_up.json')}
        autoPlay
        loop={false}
        onAnimationFinish={() => {
          console.log('Animation finished');
        }}
        style={styles.icon}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.r8,
    maxWidth: screenWidth - 40,
    minWidth: 56,
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 8,
    // width: ss(280),
    // height: sv(48),
    width: ss(335),
    height: sv(42),
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  icon: {
    position: 'absolute',
    left: -((ss(375)-ss(280))/2),
    top: -ss(589)+sv(48)+20,
    width: ss(375),
    height: sv(589),
    zIndex: zIndex.heart, //zIndex 설정이 의미가 없는것같다. 그래도 기획상 문제는 없으니 유지하지만, 나중에 수정해보자.
  },
  message: {
    //...typography.body1,
    ...typography.body5,
    textAlign: 'center',
  },
  amount: {
    ...typography.body1,
    textAlign: 'center',
  },
});

export default ToastView; 