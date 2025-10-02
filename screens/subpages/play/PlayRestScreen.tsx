import React, { useState } from 'react';
import { Text, View, StyleSheet, InteractionManager } from 'react-native';
import { Image } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import { normalizeImageSource } from '../../../utils/textUtils';
import { useAudioPlayer } from '../../../hooks/useAudioPlayer';
import BubbleTalk from '../../../components/common/bubbletalk/BubbleTalk';
import { TouchableOpacity } from 'react-native';
import { playIcons } from '../../../constants/icons';
import { colors } from '../../../constants/colors';
import LottieView from 'lottie-react-native';
import { ss, sv } from '../../../utils/scale';
import CatBasic from '../../../assets/images/play/playBreathing/basic.svg';


const PlayRestScreen = ({route}: {route: RouteProp<PlayStackParamList, 'PlayRestScreen'>}) => {
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  const handleBack = () => {
    // 오디오 인스턴스 해제
    if (hasAudio) {
      pauseAudio();
    }
    navigation.goBack();
  };
  const { activityId, content } = route.params;
  const hasAudio = !!content.audioUrl;
  const audioSource = React.useMemo(() => {
    if (!content.audioUrl) return undefined;
    return typeof content.audioUrl === 'string' ? { uri: content.audioUrl } : content.audioUrl;
  }, [content.audioUrl]);
  const { isLoading: audioLoading, play: playAudio, pause: pauseAudio } = useAudioPlayer({
    source: audioSource as any,
    autoPlay: false,
    repeat: true,
    onEnd: () => {
      console.log('🔁 오디오 1 사이클 종료');
    }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const insets = useSafeAreaInsets();

  // 두 가지 로띠를 2초 간격으로 번갈아 재생
  const animations = React.useMemo(() => [
    require('../../../assets/animations/breathing_motion.json'), // inhale
    require('../../../assets/animations/inhale_cat.json'), // exhale (파일 이름 반대로 썼음.)
  ], []);
  const [animIdx, setAnimIdx] = useState(0);
  const lottieRef = React.useRef<LottieView>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const INTERVAL_TIME = 2000; // 2초 간격으로 들이쉬고 내쉼
  const HOLD_MS = 1000; // 들이쉼과 내쉼 사이 일시 정지 1초

  // 가변 타이밍(hold 포함)을 위해 setTimeout 기반으로 루프 제어
  const clearTimers = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const scheduleNext = React.useCallback(() => {
    // 정지 상태면 아무 것도 하지 않음
    if (!isPlaying) 
        return;

    // 현재 애니메이션 재생 시작 보장
    try { lottieRef.current?.play?.(); } catch {}

    // inhale(0)일 때: 2초 재생 → 1초 hold → exhale(1)
    timeoutRef.current = setTimeout(() => {
        // 1) 일시 정지
        try { lottieRef.current?.pause?.(); } catch {}
        // 2) 1초 유지 후 exhale로 전환
        timeoutRef.current = setTimeout(() => {
          setAnimIdx(animIdx === 0 ? 1 : 0);
        }, animIdx === 0 ? HOLD_MS : 10);
      }, INTERVAL_TIME);
  }, [animIdx, isPlaying]);

  // 재생/정지 전환 처리
  React.useEffect(() => {
    clearTimers();
    if (!isPlaying) {
      try { lottieRef.current?.pause?.(); } catch {}
      return;
    }
    scheduleNext();
    return clearTimers;
  }, [isPlaying, scheduleNext]);

  // 소스가 바뀔 때 재생 상태 유지
  React.useEffect(() => {
    if (!isPlaying) return;
    // 소스 교체 후 다음 단계 스케줄링
    requestAnimationFrame(() => {
      try { lottieRef.current?.play?.(); } catch {}
      scheduleNext();
    });
    // animIdx 변경 시 이전 타임아웃은 자연히 clear되도록 별도 정리는 scheduleNext 루틴에 위임
  }, [animIdx, isPlaying, scheduleNext]);

  

  const [isLoading, setIsLoading] = useState(false);
  // 화면 진입 시, 모든 인터랙션/레이아웃이 끝난 다음 자동 재생 시작
  React.useEffect(() => {
    setIsLoading(false);
    const task = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        try {
          if (hasAudio) playAudio();
          setIsPlaying(true);
          setIsLoading(true);
        } catch {}
      });
    });
    return () => {
      // 정리: 자동 시작 예약 취소 및 타이머 해제는 상위 이펙트에서 처리
      // InteractionManager에는 취소 API가 없어 no-op
    };
  }, [hasAudio, playAudio]);

  React.useEffect(() => {
    console.log('🔁 isLoading', isLoading);
  }, [isLoading]);

  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader 
        onBack={handleBack} 
        title={content.title}
      />
      {isLoading ? (
        <LottieView
            ref={lottieRef}
            source={animations[animIdx]}
            autoPlay={false}
            loop
            speed={2/(INTERVAL_TIME/1000)}
            style={styles.lottie}
        />
      ):(
        <View style={styles.catSVGContainer}>
            <CatBasic width={ss(375)} height={sv(375)} />
        </View>
      )}
      {hasAudio && isLoading && (
        <View style={[styles.floatingContainer, {bottom: 20 + insets.bottom, right: 20}]}>
        {isPlaying ? (
            <>
                <BubbleTalk text="재생을 잠시 멈출까요?" trianglePosition="right"/>
                <TouchableOpacity onPress={() => {
                    setIsPlaying(false);
                    try { if (hasAudio) pauseAudio(); } catch {}
                }}>
                    <playIcons.circleed.pause width={64} height={64} />
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
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary50,
  },
  floatingContainer: {
    flexDirection: 'row',
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 1000,
  },
  lottie: {
    width: ss(375),
    height: sv(375),
    position: 'absolute',
    bottom: 0,
    zIndex: 999,
  },
  catSVGContainer: {
      width: ss(375),
      height: sv(375),
      position: 'absolute',
      bottom: 0,
      zIndex: 999,
  },
});

export default PlayRestScreen;