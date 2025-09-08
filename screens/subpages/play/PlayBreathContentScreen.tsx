import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import SubpageHeader, {SUBPAGE_HEADER_HEIGHT} from "../../../components/common/top-navigation/SubpageHeader";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { PlayStackParamList } from "../../../navigations/tabs/PlayStackNavigator";
import { colors } from "../../../constants/colors";
import { sx, sy, sv, ss } from "../../../utils/scale";
import { typography, syongsyongTypography } from "../../../constants/typography";
import LottieView from "lottie-react-native";
import { playIcons } from "../../../constants/icons";
import BubbleTalk from "../../../components/common/bubbletalk/BubbleTalk";
import { radius } from "../../../constants/radius";
import CatBasic from '../../../assets/images/play/playBreathing/basic.svg';
import { ButtonSmall } from "../../../components/common/buttons/ButtonSmall";
import { convertSecondsToMinutesAndSeconds } from "../../../utils/timeUtils";
import { BreathAction } from "../../../services/contentService";
import { WINDOW_WIDTH } from "@gorhom/bottom-sheet";

const PlayBreathContentScreen = ({route}: {route: RouteProp<PlayStackParamList, 'PlayBreathContentScreen'>}) => {
    const {content} = route.params;
    const [isPlaying, setIsPlaying] = useState(true);
    const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();       
    const insets = useSafeAreaInsets();
    const handleBack = () => {
        navigation.goBack();
    }   
    const goToResultScreen = () => {
        navigation.navigate('PlayResultScreen');
    }
    const [step, setStep] = useState(0);
    const [remainingTime, setRemainingTime] = useState(content.durationInSeconds);

    // 안전한 현재 스텝/타임라인 접근 및 파생 값
    const current = content.timeline?.[step];
    const action: BreathAction = current?.action ?? 'START';
    const text = current?.text ?? '';
    const duration = current?.duration ?? 1;

    const elapsed = content.durationInSeconds - remainingTime; // 전체 경과 시간
    const currentStepTargetTime = current?.time ?? 0; // 현재 스텝 목표 시간(초)
    const currentStepRemaining = Math.max(0, currentStepTargetTime - elapsed); // 현재 스텝 남은 시간 (음수 방지)

    // 이전 단계로 거슬러 올라가며 직전 호흡 액션(INHALE/EXHALE)을 재귀적으로 찾는다.
    const findPreviousBreathAction = (idx: number): 'INHALE' | 'EXHALE' | null => {
        if (!content.timeline || idx <= 0) return null; // 더 이상 뒤로 갈 수 없음
        const prevAction = content.timeline[idx - 1]?.action;
        if (prevAction === 'INHALE' || prevAction === 'EXHALE') return prevAction;
        return findPreviousBreathAction(idx - 1); // 재귀적으로 한 단계 더 뒤로
    };

    // 현재 액션에 맞는 애니메이션 소스를 1회 계산 (없으면 기본 SVG 사용)
    const animationSource = useMemo(() => {
        if (action === 'INHALE') {
            return require('../../../assets/animations/breathing_motion.json');
        }
        if (action === 'EXHALE') {
            return require('../../../assets/animations/inhale_cat.json');
        }
        // HOLD 또는 기타: 직전 호흡 액션을 재귀로 탐색
        if (step === 0) return null; // 처음이면 기본 SVG
        const lastBreath = findPreviousBreathAction(step);
        if (lastBreath === 'INHALE') {
            return require('../../../assets/animations/breathing_motion.json');
        }
        if (lastBreath === 'EXHALE') {
            return require('../../../assets/animations/inhale_cat.json');
        }
        return null; // 아무것도 못 찾으면 기본 SVG
    }, [action, step, content.timeline]);

    // 1초 타이머 (isPlaying일 때만 동작, 0 이하로 내려가지 않음)
    useEffect(() => {
        if (!isPlaying) return;
        if (remainingTime <= 0) return;
        const timer = setTimeout(() => {
            setRemainingTime((t) => Math.max(0, t - 1));
        }, 1000);
        return () => clearTimeout(timer);
    }, [isPlaying, remainingTime]);

    // 남은 시간이 0이 되면 종료 처리
    useEffect(() => {
        if (remainingTime <= 0) {
            setIsPlaying(false);
            goToResultScreen();
        }
    }, [remainingTime]);

    // 경과 시간이 현재 스텝 목표 시간을 지나면 다음 스텝으로
    useEffect(() => {
        if (!content.timeline?.length) return;
        if (step >= content.timeline.length - 1) return; // 마지막 스텝이면 진행 안함
        if (elapsed >= currentStepTargetTime) {
            setStep((s) => Math.min(s + 1, content.timeline!.length - 1));
        }
    }, [elapsed, step, currentStepTargetTime, content.timeline]);

    // Lottie 재생/일시정지 제어
    const lottieRef = useRef<any>(null);
    useEffect(() => {
        if (!lottieRef.current) return;
        if (isPlaying && (action === 'INHALE' || action === 'EXHALE') && animationSource) {
            lottieRef.current.play();
        } else {
            lottieRef.current.pause();
        }
    }, [isPlaying, action, animationSource]);

    return (
        <>
        {/* TODO: 중간에 사용자가 나갔을 때를 대비해서 액티비티 로그 저장을 위한 로직 추가 :  */}
            <SafeAreaView style={styles.container}>
                <SubpageHeader title={content.title} onBack={handleBack} />
                {/* TODO: 호흡 재생 및 텍스트 매핑 추가 */}
                <View style={[styles.contentContainer, {marginTop: Math.max(0, sy(277) - insets.top - SUBPAGE_HEADER_HEIGHT)}]}>
                    <Text style={styles.contentText}>{currentStepRemaining}</Text>
                    <Text style={styles.contentText}>{text}</Text>
                </View>

                {__DEV__ && (
                    <View style={styles.debugContainer}>
                        <View style={styles.debugButtonContainer}>
                            <ButtonSmall title="초기화" variant="active" style={styles.debugButton} onPress={() => { setStep(0); setRemainingTime(content.durationInSeconds); }} />
                            <ButtonSmall title="다음 스텝" variant="active" style={styles.debugButton} onPress={() => { setStep(step + 1); setRemainingTime(content.durationInSeconds - (content.timeline?.[step + 1]?.time ?? 0)); }} />
                            <ButtonSmall title="1분 넘기기" variant="active" style={styles.debugButton} onPress={() => { setRemainingTime(remainingTime - 60); }} />
                        </View>
                        <TouchableOpacity onPress={() => {goToResultScreen()}}>
                            {/* <Text>{JSON.stringify(content.timeline, ['id','time', 'action', 'text', 'duration',], 10)}</Text> */}
                            <Text>Step: {step} / {content.timeline?.length ? content.timeline.length - 1 : 0}</Text>
                            <Text>Total Remaining Time: {remainingTime} sec</Text>
                            <Text>Total Elapsed Time: {elapsed} sec</Text>
                            <Text>Action: {action}</Text>
                            <Text>Breathing is {isPlaying ? '\"PLAYING\"' : '\"PAUSED\"'} </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>

            {animationSource ? (
                <LottieView
                    ref={lottieRef}
                    source={animationSource}
                    autoPlay={action === 'INHALE' || action === 'EXHALE'}
                    loop={false}
                    speed={Math.min(3, Math.max(0.2, 2 / (duration || 1)))}
                    style={styles.breathingCatAnimation}
                />
            ) : (
                <View style={styles.catSVGContainer}>
                    <CatBasic width={ss(375)} height={sv(375)} />
                </View>
            )}




            <View style={[styles.floatingContainer, {bottom: 20 + insets.bottom, right: 20}]}>
                {isPlaying ? (
                    <>
                        <BubbleTalk text="호흡을 잠시 멈출까요?" trianglePosition="right"/>
                        <TouchableOpacity onPress={() => {
                            setIsPlaying(false);
                        }}>
                            <View style={styles.pauseButton}>
                                {(() => {
                                    const mmss = convertSecondsToMinutesAndSeconds(remainingTime);
                                    const mm = String(mmss.minutes).padStart(2, '0');
                                    const ss_ = String(mmss.seconds).padStart(2, '0');
                                    return <Text style={styles.TimeRemainingText}>{mm}:{ss_}</Text>;
                                })()}
                            </View>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <BubbleTalk text="다시 시작할까요?" trianglePosition="right"/>
                        <TouchableOpacity onPress={() => {
                            setIsPlaying(true);
                        }}>
                            <playIcons.circleed.play width={64} height={64} />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary50,
    },
    contentContainer: {
        paddingHorizontal: 20,
        alignItems: 'center',
        gap: 6,
        justifyContent: 'center',
    },
    contentText: {
        ...syongsyongTypography.title4,
    },
    breathingCatAnimation: {
        width: ss(375),
        height: sv(375),
        position: 'absolute',
        bottom: 0,
        zIndex: 999,
    },
    floatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        position: 'absolute',
        zIndex: 1000,
    },
    pauseButton: {
        width: 64,
        height: 64,
        backgroundColor: colors.primary300,
        borderRadius: radius.max,
        alignItems: 'center',
        justifyContent: 'center',
    },
    TimeRemainingText: {
        ...typography.body2,
        color: colors.white,
    },
    catSVGContainer: {
        width: ss(375),
        height: sv(375),
        position: 'absolute',
        bottom: 0,
        zIndex: 999,
    },
    debugContainer: {
        padding: 10,
        borderWidth: 0.5,
        alignSelf: 'flex-start',
        borderRadius: radius.r8,
        margin: 20,
        gap: 10,
        width: WINDOW_WIDTH - 100,
    },
    debugButtonContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    debugButton: {
        flex: 1,
    },
});

export default PlayBreathContentScreen;