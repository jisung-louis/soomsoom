import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { typography, syongsyongTypography } from '../../constants/typography';
import LottieView from 'lottie-react-native';
import { ss, sv, sy } from '../../utils/scale';
import { ActivityTimeline } from '../../services/contentService';
import { BreathAction } from '../../services/contentService';
import { radius } from '../../constants/radius';
import CatBasic from '../../assets/images/play/playBreathing/basic.svg';
import { ButtonSmall } from '../common/buttons/ButtonSmall';
import { useAppConfigStore } from '../../stores/appConfigStore';


const breathContentTimeline:ActivityTimeline[] = [ //3회 호흡 컨텐츠 타임라인
  {
    id: 1,
    time: 0.0,
    action: 'INHALE',
    text: '깊게 숨을 들이키세요!',
    duration: 3.0,
  },
  {
    id: 2,
    time: 3.0,
    action: 'HOLD',
    text: '잠시 숨을 멈추세요!',
    duration: 3.0,
  },
  {
    id: 3,
    time: 6.0,
    action: 'EXHALE',
    text: '길게 숨을 내쉬세요!',
    duration: 3.0,
  },
];

 const lastTimelineItem = breathContentTimeline[breathContentTimeline.length - 1];
 const TOTAL_DURATION = (lastTimelineItem?.time ?? 0) + (lastTimelineItem?.duration ?? 0);
export default function BreathingGuide({ onComplete }: { onComplete?: () => void }) {
  const { useMockApi } = useAppConfigStore.getState();
  const [step, setStep] = useState(0);
  const current = breathContentTimeline[step];
  const action: BreathAction = current?.action ?? 'START';
  const text = current?.text ?? '';
  const duration = current?.duration ?? 1;
    
  const [remainingTime, setRemainingTime] = useState(TOTAL_DURATION);
  const elapsed = TOTAL_DURATION - remainingTime;
  const currentStepTargetTime = current?.time ?? 0;
  const currentStepRemaining = Math.max(0, currentStepTargetTime - elapsed);

// 이전 단계로 거슬러 올라가며 직전 호흡 액션(INHALE/EXHALE)을 재귀적으로 찾는다.
    const findPreviousBreathAction = (idx: number): 'INHALE' | 'EXHALE' | null => {
        if (!breathContentTimeline || idx <= 0) return null; // 더 이상 뒤로 갈 수 없음
        const prevAction = breathContentTimeline[idx - 1]?.action;
        if (prevAction === 'INHALE' || prevAction === 'EXHALE') return prevAction;
        return findPreviousBreathAction(idx - 1); // 재귀적으로 한 단계 더 뒤로
    };

    // 현재 액션에 맞는 애니메이션 소스를 1회 계산 (없으면 기본 SVG 사용)
    const animationSource = useMemo(() => {
        if (breathContentTimeline[step]?.action === 'INHALE') {
            console.log('INHALE');
            return require('../../assets/animations/breathing_motion.json');
        }
        if (breathContentTimeline[step]?.action === 'EXHALE') {
            console.log('EXHALE');
            return require('../../assets/animations/inhale_cat.json');
        }
        // HOLD 또는 기타: 직전 호흡 액션을 재귀로 탐색
        if (step === 0) return null; // 처음이면 기본 SVG
        const lastBreath = findPreviousBreathAction(step);
        if (lastBreath === 'INHALE') {
            console.log('INHALE');
            return require('../../assets/animations/breathing_motion.json');
        }
        if (lastBreath === 'EXHALE') {
            console.log('EXHALE');
            return require('../../assets/animations/inhale_cat.json');
        }
        return null; // 아무것도 못 찾으면 기본 SVG
    }, [action, step, breathContentTimeline]);

  // 1초 타이머: 0에서 멈춤, 함수형 업데이트로 안전하게 감소
  useEffect(() => {
    if (remainingTime <= 0) return;
    const timer = setTimeout(() => {
      setRemainingTime((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [remainingTime]);

  // 타임라인 진행: 다음 스텝의 목표 시간을 기준으로 전환 (초기 time=0 스킵 방지)
  useEffect(() => {
    if (remainingTime <= 0) return;
    const nextTarget = breathContentTimeline[step + 1]?.time;
    if (typeof nextTarget === 'number' && elapsed >= nextTarget) {
      setStep((s) => Math.min(s + 1, breathContentTimeline.length - 1));
    }
  }, [elapsed, remainingTime, step]);


  // 완료 콜백
  useEffect(() => {
    if (remainingTime <= 0) {
      onComplete?.();
    }
  }, [remainingTime, onComplete]);

  const handleInit = () =>{
    setStep(0); 
    setRemainingTime(TOTAL_DURATION);
  };

  // Lottie 재생 제어
  const lottieRef = useRef<any>(null);
  useEffect(() => {
    if (!lottieRef.current) return;
    if (action === 'INHALE' || action === 'EXHALE') {
      console.log('play');
      lottieRef.current.play?.();
    } else {
      console.log('pause');
      lottieRef.current.pause?.();
    }
  }, [action]);

  return (
    <View style={styles.container}>
        <View style={[styles.contentContainer, {marginTop: Math.max(0, sy(277))}]}>
            {/* <Text style={styles.contentText}>{currentStepRemaining}</Text> */}
            <Text style={styles.contentText}>{text}</Text>
        </View>

        {useMockApi && (
        <View style={styles.debugContainer}>
            <TouchableOpacity onPress={handleInit}>
                <Text>초기화</Text>
            </TouchableOpacity>
            <Text>Step: {step}</Text>
            <Text>Elapsed Time: {elapsed}</Text>
        </View>
        )}

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

        {/* <View style={styles.skipButton}>
            <ButtonSmall title="건너뛰기" variant="active" onPress={() => {
                onComplete?.();
            }} />
        </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  contentText: {
    ...syongsyongTypography.title4,
  },
  breathingCatAnimation: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
    zIndex: 999,
    width: ss(375),
    height: sv(375),
  },
  debugContainer: {
    gap: 10,
    padding: 10,
    borderWidth: 0.5,
    borderRadius: radius.r8,
    margin: 20,
  },
  catSVGContainer: {
    width: ss(375),
    height: sv(375),
    position: 'absolute',
    bottom: 0,
    zIndex: 999,
  },
  skipButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    zIndex: 1000,
  },
});

