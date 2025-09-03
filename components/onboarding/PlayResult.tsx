import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { syongsyongTypography } from '../../constants/typography';
import CheckIcon from '../../assets/icons/common/check_active.svg';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/radius';
import { typography } from '../../constants/typography';
import LottieView from 'lottie-react-native';
import { ss, sv, sx, sy } from '../../utils/scale';

interface PlayResultProps {
  style?: ViewStyle;
  isOnboarding?: boolean;
  activityDescription?: string[];
}

const PlayResult = ({style, isOnboarding = false, activityDescription = []}: PlayResultProps) => {
  return (
    <View style={[styles.resultContainer, isOnboarding && {marginTop: sy(106)}, style]}>
        <LottieView
            source={require('../../assets/animations/cat_eatfish.json')}
            autoPlay
            loop
            style={styles.resultCharacter}
        />
        <View style={{marginTop: -100, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{...syongsyongTypography.title4, ...styles.title}}>좋아요! 지금 당신은</Text>
            <View style={styles.infoBox}>
                {/* TODO: 아래 3개의 infoTextRow를 fadein 애니메이션으로 나타나게 수정  (TODO.md 참고)*/}
                {/* TODO: 아래 3개의 infoText에 백엔드 Activity ResultDecription 데이터 매핑하기 (백엔드 Activity ResultDecription 데이터 확인 필요) (TODO.md 참고)*/}
                <View style={styles.infoTextRow}>
                    <CheckIcon width={28} height={28} />
                    <Text style={styles.infoText}>{activityDescription[0]}</Text>
                </View>
                <View style={styles.infoTextRow}>
                    <CheckIcon width={28} height={28} />
                    <Text style={styles.infoText}>{activityDescription[1]}</Text>
                </View>
                <View style={styles.infoTextRow}>
                    <CheckIcon width={28} height={28} />
                    <Text style={styles.infoText}>{activityDescription[2]}</Text>
                </View>
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