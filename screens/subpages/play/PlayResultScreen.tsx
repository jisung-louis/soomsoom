import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { syongsyongTypography, typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import { RouteProp, StackActions, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import TopNavigation from '../../../components/common/top-navigation/TopNavigation';
import { radius } from '../../../constants/radius';
import ShadowSVG from '../../../assets/icons/charactors/shadow.svg'
import DefaultCharacter from '../../../assets/icons/charactors/default_character.svg'
import CheckIcon from '../../../assets/icons/common/check_active.svg'
import { Button, ButtonRef } from '../../../components/common/buttons/Button';
import PlayResult from '../../../components/tabs/play/PlayResultScreen/PlayResult';
import Animated from 'react-native-reanimated';
import { useSpringUpAnimation } from '../../../hooks/useSpringUpAnimation';

const MOCK_ACTIVITY_DESCRIPTION = [
        '뇌에 맑은 산소가 가득 차올랐고...',
        '마음은 하루를 준비할 평온함을 얻고...',
        '무엇인가 집중할 준비가 되었어요!',
    ]

const PlayResultScreen = ({route}: {route: RouteProp<PlayStackParamList, 'PlayResultScreen'>}) => {
    const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
    const buttonRef = useRef<ButtonRef>(null);
    const { effectTexts } = route.params;
    const handleBack = () => {
        navigation.goBack();
    };
    const handleActivityEnd = () => {
        // TODO: 액티비티 종료 후 하트 보상 받기
        // TODO: 얼마의 하트를 줘야하는지 백엔드에서 조회 후 보상 받기
        // TODO: 하트 보상 받기 후 홈으로 이동
        exit();
    }
    const exit = () => {
        //navigation.dispatch(StackActions.pop(3));//바꿔야됨
        // navigation.reset({
        //     index: 0,
        //     routes: [{ name: 'PlayTab' }],
        // });
        // 홈 탭으로 이동
        navigation.reset({
            index: 0,
            routes: [{ name: 'PlayTab' }],
        });
        navigation.getParent()?.navigate('home');
        {/* TODO: 하트 보상 받기 후 홈으로 이동 */}
        // navigation.reset({
        //     index: 0,
        //     routes: [{ name: 'PlayTab' }],
        // });
    };

    // 슬라이드업 애니메이션 훅 사용
    const { animatedStyle: buttonAnimatedStyle, triggerAnimation } = useSpringUpAnimation({
        initialOffset: 200,
        springConfig: { damping: 10, stiffness: 250 }
    });
  
    const handleResultAnimationsEnd = useCallback(() => {
        setTimeout(() => {
            // 아래에서 올라오면서 튕기는 효과
            triggerAnimation();
            buttonRef.current?.triggerShake();
        }, 500);
    }, [triggerAnimation]);

    return (
        <View style={styles.background}>
            <SafeAreaView style={styles.container}>
                {/* <View style={styles.contentContainer}>
                    <View style={styles.characterWrapper}>
                        <ShadowSVG style={styles.shadow} />
                        <DefaultCharacter style={styles.character} />
                    </View>
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
                </View> */}{/* PlayResult.tsx 컴포넌트로 분리 및 공통관리 */}
                <PlayResult 
                    style={styles.playResult} 
                    activityDescription={effectTexts || MOCK_ACTIVITY_DESCRIPTION}
                    onAnimationsEnd={handleResultAnimationsEnd}
                />
                <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
                    <Button
                        ref={buttonRef}
                        icon="heart"
                        title="하트 보상받기"
                        size="large"
                        variant="active"
                        style={styles.button}
                        onPress={handleActivityEnd}
                    />
                </Animated.View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: colors.primary50,
    },
    container: {
        flex: 1,
    },
    playResult: {
        flex: 1,
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    characterContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    characterWrapper: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
    },
    shadow: {
        position: 'absolute',
        bottom: 0,
        zIndex: 1,
    },
    character: {
        position: 'absolute',
        bottom: 10,
        zIndex: 2,
        right: -9,
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
    buttonContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    button: {
        alignSelf: 'center',
    },
});

export default PlayResultScreen;