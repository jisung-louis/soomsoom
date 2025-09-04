import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, Animated } from 'react-native';
import { syongsyongTypography } from '../../../../constants/typography';
import CheckIcon from '../../../../assets/icons/common/check_active.svg';
import { colors } from '../../../../constants/colors';
import { radius } from '../../../../constants/radius';
import { typography } from '../../../../constants/typography';
import LottieView from 'lottie-react-native';
import { ss, sv, sx, sy } from '../../../../utils/scale';

interface PlayResultProps {
  style?: ViewStyle;
  isOnboarding?: boolean;
  activityDescription?: string[];
  onAnimationsEnd?: () => void; // 모든 행 페이드인 끝난 뒤 호출
}
const DEFAULT_ACTIVITY_DESCRIPTION = [
  '뇌에 맑은 산소가 가득 차올랐고...',
  '마음은 하루를 준비할 평온함을 얻고...',
  '무엇인가 집중할 준비가 되었어요!',
]

const PlayResult = ({style, isOnboarding = false, activityDescription = DEFAULT_ACTIVITY_DESCRIPTION, onAnimationsEnd}: PlayResultProps) => {
  const rowOpacities = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    
    // 첫 번째 텍스트 애니메이션 시작 전 1초 대기
    const initialDelay = setTimeout(() => {
      anim = Animated.stagger(1000,
        rowOpacities.map((opacity) =>
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          })
        )
      );
      anim.start(() => {
        // 모든 페이드인 완료 후 부모에게 알림
        onAnimationsEnd?.();
      });
    }, 500);

    return () => {
      // 컴포넌트 언마운트 시 타이머와 애니메이션 정리
      clearTimeout(initialDelay);
      if (anim) {
        anim.stop();
      }
    };
  }, [rowOpacities, onAnimationsEnd]);
  return (
    <View style={[styles.resultContainer, isOnboarding && {marginTop: sy(106)}, style]}>
        <LottieView
            source={require('../../../../assets/animations/cat_eatfish.json')}
            autoPlay
            loop
            style={styles.resultCharacter}
        />
        <View style={{marginTop: -100, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{...syongsyongTypography.title4, ...styles.title}}>좋아요! 지금 당신은</Text>
            <View style={styles.infoBox}>
                <Animated.View style={[styles.infoTextRow, { opacity: rowOpacities[0] }]}>
                    <CheckIcon width={28} height={28} />
                    <Text style={styles.infoText}>{activityDescription?.[0]}</Text>
                </Animated.View>
                <Animated.View style={[styles.infoTextRow, { opacity: rowOpacities[1] }]}>
                    <CheckIcon width={28} height={28} />
                    <Text style={styles.infoText}>{activityDescription?.[1]}</Text>
                </Animated.View>
                <Animated.View style={[styles.infoTextRow, { opacity: rowOpacities[2] }]}>
                    <CheckIcon width={28} height={28} />
                    <Text style={styles.infoText}>{activityDescription?.[2]}</Text>
                </Animated.View>
            </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    resultContainer: {
        flex: 1,
        alignItems: 'center',
    },
    resultCharacter: {
        width: ss(375),
        height: sv(375),
    },
    title: {
        marginTop: 30,
        marginBottom: 20,
    },
    infoBoxContainer: {
    },
    infoBox: {
        width: ss(335),
        height: 156,
        padding: 20,
        backgroundColor: colors.white,
        borderRadius: radius.r16,
        gap: 16,
    },
    infoTextBoxContainer: {
    },
    infoTextRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    infoText: {
        ...typography.body2,
        color: colors.grayScale900,
    },
});

export default PlayResult;