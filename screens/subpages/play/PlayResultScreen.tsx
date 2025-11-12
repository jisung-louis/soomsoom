import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, BackHandler, Platform } from 'react-native';
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
import { eventBus, APP_EVENTS } from '../../../utils/eventBus';
import { RewardableMission } from '../../../services/activityLogService';
import { claimMission } from '../../../services/missionService';
import { useScreenAnalytics } from '../../../hooks/useScreenAnalytics';
import { ss, sv } from '../../../utils/scale';
import { useToast } from '../../../hooks/useToast';
import { useCurrencyStore } from '../../../stores/currencyStore';
import { getUserPoints } from '../../../services/userService';

const MOCK_ACTIVITY_DESCRIPTION = [
        '뇌에 맑은 산소가 가득 차올랐고...',
        '마음은 하루를 준비할 평온함을 얻고...',
        '무엇인가 집중할 준비가 되었어요!',
    ]

const PlayResultScreen = ({route}: {route: RouteProp<PlayStackParamList, 'PlayResultScreen'>}) => {
  useScreenAnalytics('PlayResultScreen');

    const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
    const buttonRef = useRef<ButtonRef>(null);
    const { effectTexts, rewardableMission } = route.params;
    const handleBack = () => {
        navigation.goBack();
    };

    const { showToast } = useToast();
    const handleActivityEnd = async (rewardableMission?: RewardableMission | null) => {
        // TODO: 액티비티 종료 후 하트 보상 받기
        // TODO: 얼마의 하트를 줘야하는지 백엔드에서 조회 후 보상 받기
        // TODO: 하트 보상 받기 후 홈으로 이동
        if (rewardableMission) {
            try {
                const res = await claimMission(rewardableMission.missionId);
                console.log('res', JSON.stringify(res, null, 2));
                if (res.claimedReward.points > 0) {
                showToast({
                    amount: res.claimedReward.points,
                    message: '하트 획득했어요!',
                    theme: 'dark',
                    iconType: 'heart',
                    style: {
                        width: ss(280),
                        height: sv(48),
                    },
                    textStyle: {
                        ...typography.body1,
                        textAlign: 'center',
                    },
                    iconSize: ss(32),
                    hasAnimation: true,
                });
                const readHeartPoints = await getUserPoints();
                useCurrencyStore.getState().setHeartPoints(readHeartPoints.points);
                }
                if (res.claimedReward.itemId) {
                    showToast({
                        amount: res.claimedReward.itemId,
                        message: '아이템 획득했어요!',
                        theme: 'dark',
                    });
                    // TODO: 아이템 획득은 팝업으로 바꿔야함.
                }
            } catch (error) {
                console.error('하트 보상 받기 실패:', error);
                showToast({
                    message: '하트 보상 받기에 실패했어요.',
                    theme: 'dark',
                    iconType: 'brokenHeart',
                });
            }
        }
    // 요약 데이터 새로고침 트리거
    eventBus.emit(APP_EVENTS.REFRESH_SUMMARY);
    exit();
    };

    const exit = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'PlayTab' }],
        });
        navigation.getParent()?.navigate('home');
    };

  // Android 하드웨어 뒤로가기: 결과 화면에서 아무 동작도 하지 않음 (소비)
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBack = () => {
      return true; // consume: no-op
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);

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
                <PlayResult 
                    style={styles.playResult} 
                    activityDescription={effectTexts || MOCK_ACTIVITY_DESCRIPTION}
                    onAnimationsEnd={handleResultAnimationsEnd}
                />
                <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
                    {rewardableMission !== null ? (
                        <Button
                            ref={buttonRef}
                            icon="heart"
                            title="하트 보상받기"
                            size="large"
                            variant="active"
                            style={styles.button}
                            onPress={() => handleActivityEnd(rewardableMission)}
                        />
                    ) : (
                        <Button
                            ref={buttonRef}
                            title="확인"
                            size="large"
                            variant="active"
                            style={styles.button}
                            onPress={() => handleActivityEnd()}
                        />
                    )}
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