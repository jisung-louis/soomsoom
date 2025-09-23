import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { EmotionRankingData } from '../../../types';
import { getRankColor } from '../../../utils/emotionColorUtils';
import BubbleTalk from '../bubbletalk/BubbleTalk';
import { characterIconMap } from '../../../utils/iconMap';
import { ss, sv, sy } from '../../../utils/scale';
import { typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import LottieView from 'lottie-react-native';

interface DonutChartProps {
  data: EmotionRankingData[];
  size?: number;
  strokeWidth?: number; // 굵기
  onSegmentPress?: (item: EmotionRankingData, index: number) => void;
  showHint?: boolean; // 월별 첫 사용 힌트 표시 여부
  onSeenHint?: () => void; // 힌트 본 것으로 처리
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = ss(272),
  strokeWidth = ss(86),
  onSegmentPress,
  showHint = false,
  onSeenHint,
}) => {
  const hexToRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace('#', '');
    const bigint = parseInt(normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const pieData = useMemo(
    () =>
      data.map((d, idx) => {
        const baseColor = getRankColor(idx);
        const dimmed = selectedIdx != null && idx !== selectedIdx;
        const color = dimmed ? hexToRgba(baseColor, 0.4) : baseColor;
        return {
          value: d.count,
          color,
          text: `${Math.floor(d.percentage)}%`,
          onPress: onSegmentPress ? () => onSegmentPress(d, idx) : undefined,
        };
      }),
    [data, onSegmentPress, selectedIdx]
  );

  if (!data || data.length === 0) return null;

  const radius = size / 2;
  const innerRadius = Math.max(0, radius - strokeWidth);
  const [bubbleSize, setBubbleSize] = useState<{ width: number; height: number }>({ width: 120, height: 48 });
  const SelectedIcon = useMemo(() => {
    if (selectedIdx == null) return null;
    const emotionKey = data[selectedIdx]?.emotion as keyof typeof characterIconMap.active;
    const Comp = characterIconMap.active[emotionKey] || characterIconMap.active.happy;
    return Comp;
  }, [selectedIdx, data]);

  // 누적합 기반 각도 계산 (시작 각도 -90도 가정 → 위쪽부터 시작)
  const total = useMemo(() => data.reduce((s, d) => s + d.count, 0), [data]);
  const cumulativeFractions = useMemo(() => {
    let acc = 0;
    return data.map((d) => {
      const start = acc / (total || 1);
      acc += d.count;
      const end = acc / (total || 1);
      return { start, end };
    });
  }, [data, total]);

  const midPoint = useMemo(() => {
    if (selectedIdx == null) return null;
    const { start, end } = cumulativeFractions[selectedIdx];
    const midFraction = (start + end) / 2; // 0..1
    const angle = midFraction * Math.PI * 2 - Math.PI / 2; // -90deg offset
    const midR = (innerRadius + radius) / 2;
    const cx = radius;
    const cy = radius;
    const x = cx + midR * Math.cos(angle);
    const y = cy + midR * Math.sin(angle);
    return { x, y };
  }, [selectedIdx, cumulativeFractions, innerRadius, radius]);

  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(() => {
      lottieRef.current?.play();
    }, 1000);
    return () => clearTimeout(timer);
  }, [showHint]);

  return (
    <View style={styles.container}>
      <PieChart
        data={pieData}
        donut
        radius={radius}
        innerRadius={innerRadius}
        showText={false}
        showValuesAsLabels={false}
        //tiltAngle={0}
        onPress={(_item: any, index: number) => {
          if (showHint && onSeenHint) {
            onSeenHint();
          }
          setSelectedIdx((prev) => (prev === index ? null : index));
          // 사용자가 외부에서 필요 시 알림
          if (onSegmentPress && index != null && data[index]) {
            onSegmentPress(data[index], index);
          }
        }}
      />
      {selectedIdx != null && midPoint && (
        <>
          <TouchableWithoutFeedback onPress={() => setSelectedIdx(null)}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
          <View
            pointerEvents="box-none"
            style={[
              styles.bubbleContainer,
              {
                left: midPoint.x - bubbleSize.width / 2,
                top: midPoint.y - (bubbleSize.height + 8),
              },
            ]}
          >
            <View
              onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                if (width && height && (Math.abs(width - bubbleSize.width) > 1 || Math.abs(height - bubbleSize.height) > 1)) {
                  setBubbleSize({ width, height });
                }
              }}
            >
              <BubbleTalk
                icon={SelectedIcon ? <SelectedIcon width={32} height={32} /> : undefined}
                text={`${Math.floor(data[selectedIdx].percentage)}%`}
                textStyle={{...typography.body4}}
                trianglePosition="bottom"
              />
            </View>
          </View>
        </>
      )}
      {showHint && (
        <View pointerEvents="none" style={styles.focusAnimation}>
          <LottieView
            source={require('../../../assets/animations/icon-motion/hand_touch.json')}
            autoPlay={false}
            loop={false}
            style={{ width: '100%', height: '100%' }}
            ref={lottieRef}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  bubbleContainer: {
    position: 'absolute',
  },
  focusAnimation: {
    position: 'absolute',
    top: sy(20),
    right: 0,
    width: ss(120),
    height: sv(120),
  },
});

export default DonutChart;
