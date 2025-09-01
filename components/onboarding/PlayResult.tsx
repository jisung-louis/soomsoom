import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { syongsyongTypography } from '../../constants/typography';
import CheckIcon from '../../assets/icons/common/check_active.svg';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/radius';
import { typography } from '../../constants/typography';
import LottieView from 'lottie-react-native';

const PlayResult = () => {
  return (
    <View style={styles.resultContainer}>
            <LottieView
                source={require('../../assets/animations/cat_eatfish.json')}
                autoPlay
                loop
                style={styles.resultCharacter}
            />
            <View style={{marginTop: -100, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{...syongsyongTypography.title4, ...styles.title}}>좋아요! 지금 당신은</Text>
                <View style={styles.infoBoxContainer}>
                    <View style={styles.infoBox}>
                        <View style={styles.infoTextBoxContainer}>
                            <View style={styles.infoTextRow}>
                                <CheckIcon width={28} height={28} />
                                <Text style={styles.infoText}>뇌에 맑은 산소가 가득 차올랐고...</Text>
                            </View>
                            <View style={styles.infoTextRow}>
                                <CheckIcon width={28} height={28} />
                                <Text style={styles.infoText}>마음은 하루를 준비할 평온함을 얻고...</Text>
                            </View>
                            <View style={styles.infoTextRow}>
                                <CheckIcon width={28} height={28} />
                                <Text style={styles.infoText}>무엇인가 집중할 준비가 되었어요!</Text>
                            </View>
                        </View>
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
        justifyContent: 'center',
    },
    resultCharacterWrapper: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
    },
    resultCharacter: {
        width: 375,
        height: 375,
    },
    title: {
        marginTop: 30,
        marginBottom: 20,
    },
    infoBoxContainer: {
        width: '100%',
        paddingHorizontal: 20,
    },
    infoBox: {
        padding: 20,
        backgroundColor: colors.white,
        borderRadius: radius.r16,
    },
    infoTextBoxContainer: {
        gap: 16,
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