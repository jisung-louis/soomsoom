import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, DeviceEventEmitter } from "react-native";
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
import CatInhaling from '../../../assets/images/play/playBreathing/hold.svg';
import { ButtonSmall } from "../../../components/common/buttons/ButtonSmall";
import { convertSecondsToMinutesAndSeconds } from "../../../utils/timeUtils";
import { BreathAction } from "../../../services/contentService";
import { WINDOW_WIDTH } from "@gorhom/bottom-sheet";
import { 
  completeActivity, 
  updateActivityProgress, 
  getActivityProgress 
} from "../../../services/activityLogService";
import { useToast } from "../../../contexts/ToastContext";
import { useAppConfigStore } from "../../../stores/appConfigStore";
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useAudioPlayer } from "../../../hooks/useAudioPlayer";
import { cleanupTrackPlayer } from "../../../services/trackPlayerService";
import { RewardableMission } from "../../../services/activityLogService";

const PlayBreathContentScreen = ({route}: {route: RouteProp<PlayStackParamList, 'PlayBreathContentScreen'>}) => {
    const {content} = route.params;
    const hasAudio = !!content.audioUrl;
    const audioSource = React.useMemo(() => {
        if (!content.audioUrl) return undefined;
        // require(...) 결과(숫자)면 그대로 전달, 문자열 URL이면 { uri }로 래핑
        return typeof content.audioUrl === 'string' ? { uri: content.audioUrl } : content.audioUrl;
    }, [content.audioUrl]);
    const { 
        isLoading: audioLoading, 
        isPlaying: audioIsPlaying,
        play: playAudio, 
        pause: pauseAudio 
    } = useAudioPlayer({
        source: audioSource as any,
        autoPlay: true,
      enableBackgroundControls: false, // 백그라운드 컨트롤 비활성화
        content: content,
        onEnd: () => {
            console.log('🌀 호흡 오디오 종료');
            // 오디오가 끝나면 자동으로 결과 화면으로 이동
            goToResultScreen();
        }
    });
    const [isPlaying, setIsPlaying] = useState(false);
    const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();       
    const insets = useSafeAreaInsets();
    const { showToast } = useToast();
    const { useMockApi } = useAppConfigStore.getState();
    // 액티비티 진행상황 기록을 위한 상태
    const [lastPosition, setLastPosition] = useState<number>(0);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const progressUpdateInterval = useRef<NodeJS.Timeout | null>(null);
    const startTime = useRef<number>(Date.now());
    const pauseTime = useRef<number>(0); // 일시정지된 총 시간
    const lastPauseTime = useRef<number>(0); // 마지막 일시정지 시작 시간
    
    const handleBack = async () => {
        try {
            // 1. Track Player 완전 정리 (백그라운드 플레이바 제거)
            await cleanupTrackPlayer();
            
            // 2. 진행상황 추적 중지
            stopProgressTracking();
            
            // 3. 액티비티 진행 상황 기록 (실제 재생 시간 사용)
            const actualPlayTime = getActualPlayTime();
            await saveProgress(lastPosition, actualPlayTime);
            
            // 오디오 정지 (타임라인과 분리, 재생 중이었다면 일시정지)
            try { if (hasAudio) pauseAudio(); } catch {}

            // 4. 두 스택 뒤(PlayDetailScreen)로 이동
            navigation.pop(2);
        } catch (error) {
            console.error('뒤로가기 처리 중 오류:', error);
            navigation.pop(2);
        }
    }   
    
    const goToResultScreen = async () => {
        try {
            // 1. Track Player 완전 정리 (백그라운드 플레이바 제거)
            await cleanupTrackPlayer();
            
            // 2. 진행상황 추적 중지
            stopProgressTracking();
            
            // 3. 액티비티 완료 처리
            const res = await completeActivity(content.id);
            setIsCompleted(true);
            
            // 오디오 정지 (타임라인과 분리, 재생 중이었다면 일시정지)
            try { if (hasAudio) pauseAudio(); } catch {}

            console.log(`🎉 호흡 액티비티 완료 처리: ${content.id}`);
            console.log('🔍 호흡 액티비티 완료 처리 응답:', JSON.stringify(res, null, 2));
            navigation.navigate('PlayResultScreen', { effectTexts: res.completionEffectTexts || null , rewardableMission: res.rewardableMission as RewardableMission });
        } catch (error) {
            console.error('호흡 액티비티 완료 처리 실패:', error);
            showToast({
                message: '완료 처리에 실패했어요.',
                theme: 'dark',
                iconType: 'brokenHeart',
            });
        }
    }
    
    const [step, setStep] = useState(0);
    const [remainingTime, setRemainingTime] = useState(content.durationInSeconds);

    // 안전한 현재 스텝/타임라인 접근 및 파생 값
    const current = content.timeline?.[step];
    const next = content.timeline?.[step + 1];
    const action: BreathAction = current?.action ?? 'START';
    const text = current?.text ?? '';
    const duration = current?.duration ?? 1;

    const elapsed = content.durationInSeconds - remainingTime; // 전체 경과 시간
    const currentStepStartTime = current?.time ?? 0; // 현재 스텝 시작 시간
    const currentStepDuration = next ? next.time - currentStepStartTime : (content.durationInSeconds - currentStepStartTime); // 현재 스텝 지속 시간
    const currentStepElapsed = Math.max(0, elapsed - currentStepStartTime); // 현재 스텝에서 경과된 시간
    const currentStepRemaining = Math.max(0, currentStepDuration - currentStepElapsed); // 현재 스텝 남은 시간

    // 실제 재생 시간 계산 함수 (일시정지 시간 제외)
    const getActualPlayTime = () => {
        const currentTime = Date.now();
        const totalElapsed = Math.floor((currentTime - startTime.current) / 1000);
        const actualPlayTime = Math.max(0, totalElapsed - pauseTime.current);
        return actualPlayTime;
    };

    // 진행상황 기록 함수
    const saveProgress = async (position: number, playTime: number) => {
        try {
            await updateActivityProgress(content.id, {
                lastPlaybackPosition: position, //호흡에서는 lastPlaybackPosition이 의미 없음(이어듣기 기능이 없기 때문)
                actualPlayTimeInSeconds: playTime,
            });
            console.log(`💾 호흡 진행상황 저장: ${position}초, 재생시간: ${playTime}초`);
        } catch (error) {
            console.error('호흡 진행상황 저장 실패:', error);
        }
    };

    // 주기적으로 진행상황 저장 (30초마다)
    const startProgressTracking = () => {
        if (progressUpdateInterval.current) {
            clearInterval(progressUpdateInterval.current);
        }
        
        progressUpdateInterval.current = setInterval(() => {
            const actualPlayTime = getActualPlayTime();
            saveProgress(elapsed, actualPlayTime);
        }, 30000); // 30초마다 저장
    };

    // 진행상황 추적 중지
    const stopProgressTracking = () => {
        if (progressUpdateInterval.current) {
            clearInterval(progressUpdateInterval.current);
            progressUpdateInterval.current = null;
        }
    };

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
        if (step === 0) return 'basic'; // 처음이면 기본 SVG
        const lastBreath = findPreviousBreathAction(step);
        if (lastBreath === 'INHALE') {
            return 'inhaling';
        }
        if (lastBreath === 'EXHALE') {
            return 'basic';
        }
        return 'basic'; // 아무것도 못 찾으면 숨쉬는 SVG
    }, [action, step, content.timeline]);

    // 컴포넌트 마운트 시 이전 진행상황 조회
    useEffect(() => {
        const loadPreviousProgress = async () => {
            try {
                const progress = await getActivityProgress(content.id);
                if (progress) {
                    console.log(`📖 호흡 이전 진행상황 로드: ${progress.progressSeconds}초`);
                    setLastPosition(progress.progressSeconds);
                } else {
                    console.log(`📖 호흡 이전 진행상황 없음 - 처음부터 시작`);
                    setLastPosition(0);
                }
            } catch (error) {
                console.error('호흡 이전 진행상황 조회 실패:', error);
                setLastPosition(0);
            }
        };

        loadPreviousProgress();
    }, [content.id]);

    // 오디오가 없는 경우 즉시 타임라인 시작
    useEffect(() => {
        if (!hasAudio) {
            setIsPlaying(true);
        }
    }, [hasAudio]);

    // audioIsPlaying과 isPlaying 동기화
    useEffect(() => {
        if (hasAudio) {
            setIsPlaying(audioIsPlaying);
        }
    }, [audioIsPlaying, hasAudio]);

    // 재생 상태에 따른 진행상황 추적 시작/중지 및 화면 꺼짐 방지
    useEffect(() => {
        if (isPlaying) {
            const currentTime = Date.now();
            
            // 이전에 일시정지 상태였다면 일시정지 시간 누적
            if (lastPauseTime.current > 0) {
                pauseTime.current += Math.floor((currentTime - lastPauseTime.current) / 1000);
                lastPauseTime.current = 0;
            }
            
            startTime.current = currentTime;
            startProgressTracking();
            
            // 화면 꺼짐 방지 활성화
            activateKeepAwakeAsync('breathing-session');
            
            console.log(`▶️ 호흡 재생 시작 - 일시정지 시간: ${pauseTime.current}초`);
        } else {
            lastPauseTime.current = Date.now();
            stopProgressTracking();
            
            // 화면 꺼짐 방지 해제
            deactivateKeepAwake('breathing-session');
            
            console.log(`⏸️ 호흡 재생 일시정지 - 현재 일시정지 시간: ${pauseTime.current}초`);
        }
    }, [isPlaying]);

    // elapsed 값이 변경될 때마다 lastPosition 업데이트
    useEffect(() => {
        setLastPosition(elapsed);
    }, [elapsed]);

    // 백그라운드 점프 이벤트 수신
    useEffect(() => {
        const jumpForwardListener = DeviceEventEmitter.addListener('trackPlayerJumpForward', (data) => {
            console.log(`⏩ 호흡 점프 포워드: ${data.seconds}초`);
            setRemainingTime(prev => Math.max(0, prev - data.seconds));
        });

        const jumpBackwardListener = DeviceEventEmitter.addListener('trackPlayerJumpBackward', (data) => {
            console.log(`⏪ 호흡 점프 백워드: ${data.seconds}초`);
            setRemainingTime(prev => Math.min(content.durationInSeconds, prev + data.seconds));
        });

        return () => {
            jumpForwardListener.remove();
            jumpBackwardListener.remove();
        };
    }, [content.durationInSeconds]);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            // Track Player 정리 (백그라운드 플레이바 제거)
            cleanupTrackPlayer().catch(error => {
                console.error('컴포넌트 언마운트 시 Track Player 정리 실패:', error);
            });
            
            stopProgressTracking();
            // 화면 꺼짐 방지 해제
            deactivateKeepAwake('breathing-session');
        };
    }, []);

    // 1초 타이머 (오디오가 준비되어 재생 중일 때만 동작, 0 이하로 내려가지 않음)
    useEffect(() => {
        if (!isPlaying) return;
        if (hasAudio && audioLoading) return; // 오디오 로딩 중에는 타이머 정지
        if (remainingTime <= 0) return;
        const timer = setTimeout(() => {
            setRemainingTime((t) => Math.max(0, t - 1));

            console.log('currentStepStartTime', currentStepStartTime);
            console.log('currentStepDuration', currentStepDuration);
            console.log('currentStepElapsed', currentStepElapsed);
            console.log('currentStepRemaining', currentStepRemaining);
            console.log('elapsed', elapsed);
        }, 1000);
        return () => clearTimeout(timer);
    }, [isPlaying, hasAudio, audioLoading, remainingTime]);

    // 남은 시간이 0이 되면 종료 처리
    useEffect(() => {
        if (remainingTime <= 0) {
            setIsPlaying(false);
            goToResultScreen();
        }
    }, [remainingTime]);

    // 경과 시간이 현재 스텝을 완료하면 다음 스텝으로
    useEffect(() => {
        if (!content.timeline?.length) return;
        if (step >= content.timeline.length - 1) return; // 마지막 스텝이면 진행 안함
        if (next && elapsed > next.time) {
            setStep((s) => Math.min(s + 1, content.timeline!.length - 1));
        }
    }, [elapsed, step, next, content.timeline]);

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
            <SafeAreaView style={styles.container}>
                <SubpageHeader onBack={handleBack} />
                {/* TODO: 호흡 재생 및 텍스트 매핑 추가 */}
                <View style={[styles.contentContainer, {marginTop: Math.max(0, sy(277) - insets.top - SUBPAGE_HEADER_HEIGHT)}]}>
                    {/* <Text style={styles.contentText}>{currentStepRemaining}</Text> */}
                    <Text style={styles.contentText}>{text}</Text>
                </View>

                {/* {useMockApi && ( */}
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
                            <Text>Duration: {duration}</Text>
                            <Text>Breathing is {isPlaying ? '\"PLAYING\"' : '\"PAUSED\"'} </Text>
                        </TouchableOpacity>
                    </View>
                {/* )} */}
            </SafeAreaView>

            {animationSource === 'basic' ? (
                <View style={styles.catSVGContainer}>
                    <CatBasic width={ss(375)} height={sv(375)} />
                </View>
            ) : animationSource === 'inhaling' ? (
                <View style={styles.catSVGContainer}>
                    <CatInhaling width={ss(375)} height={sv(375)} />
                </View>
            ) : (
                <LottieView
                    ref={lottieRef}
                    source={animationSource}
                    autoPlay={action === 'INHALE' || action === 'EXHALE'}
                    loop={false}
                    speed={Math.min(3, Math.max(0.2, 2 / (duration || 1)))}
                    style={styles.breathingCatAnimation}
                />
            )}




            <View style={[styles.floatingContainer, {bottom: 20 + insets.bottom, right: 20}]}>
                {isPlaying ? (
                    <>
                        <BubbleTalk text="호흡을 잠시 멈출까요?" trianglePosition="right"/>
                        <TouchableOpacity onPress={() => {
                            setIsPlaying(false);
                            try { if (hasAudio) pauseAudio(); } catch {}
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
                            try { if (hasAudio) playAudio(); } catch {}
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