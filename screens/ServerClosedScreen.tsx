import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { syongsyongTypography, typography } from '../constants/typography';
import { colors } from '../constants/colors';
import CatConstructing from '../assets/icons/charactors/cat-variation/cat_constructing.svg';
import Logo from '../assets/icons/logo.svg';
import { ss, sv } from '../utils/scale';

const ServerClosedScreen = () => {
    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <CatConstructing width={ss(100)} height={sv(100)}/>
                <Text style={styles.title}>집 수리 안내</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.text}>
                    안녕하세요.{'\n'}
                    항상 숨숨을 사랑해주시는{'\n'}
                    집사님들께 감사드립니다!
                </Text>
                <Text style={styles.text}>
                    안정적인 서비스 제공을 위해{'\n'}
                    집 수리를 진행합니다.{'\n'}
                    서비스 이용이 일시 중단되오니{'\n'}
                    고객님의 많은 양해를 부탁드립니다.
                </Text>
                <Text style={styles.text}>
                    빠른 시간 내에 정상적인 집 수리가{'\n'}
                    가능하도록 최선을 다하겠습니다.
                </Text>
                <Text style={styles.text}>
                    감사합니다!
                </Text>
            </View>
            <View style={styles.logoContainer}>
                <Logo width={ss(71)} height={sv(64)}/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary100
    },
    titleContainer: {
        gap: sv(16),
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...syongsyongTypography.title2,
    },
    textContainer: {
        gap: sv(20),
        marginTop: sv(30),
    },
    text: {
        ...typography.body2,
        color: colors.grayScale800,
        textAlign: 'center',
    },
    logoContainer: {
        marginTop: sv(80),
    },
});

export default ServerClosedScreen;