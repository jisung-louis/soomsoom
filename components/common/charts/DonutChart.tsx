import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle, Path } from 'react-native-svg';
import { colors } from '../../../constants/colors';
import { typography, syongsyongTypography } from '../../../constants/typography';
import { EmotionRankingData } from '../../../types';
import { getRankColor } from '../../../utils/emotionColorUtils';

interface DonutChartProps {
  data: EmotionRankingData[];
  size?: number;
  strokeWidth?: number;
  onSegmentPress?: (item: EmotionRankingData, index: number, meta: { 
    midAngle: number; 
    svg: { x: number; y: number }; 
    screen: { x: number; y: number };
    centerSvg: { x: number; y: number };
    centerScreen: { x: number; y: number };
    touchPosition?: { x: number; y: number }; // 추가: 사용자 터치 좌표
  }) => void;
  hitSlopStrokeWidth?: number; // extra invisible stroke width for easier touch
}

// Convert polar coordinates to cartesian
const polarToCartesian = (cx: number, cy: number, r: number, angleRad: number) => ({
  x: cx + r * Math.cos(angleRad),
  y: cy + r * Math.sin(angleRad),
});

// Describe an SVG arc path for a donut segment
const describeArcPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  // Ensure positive sweep and handle full circle edge cases by clamping
  const EPS = 1e-6;
  const clampedEnd = Math.max(startAngle + EPS, endAngle);
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, clampedEnd);
  const delta = clampedEnd - startAngle;
  const largeArcFlag = delta % (Math.PI * 2) > Math.PI ? 1 : 0;
  const sweepFlag = 1; // clockwise
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
};

// 간단한 SVG 도넛 차트 (성능 우선, 비애니메이션)
const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 272,
  strokeWidth = 86,
  onSegmentPress,
  hitSlopStrokeWidth = 70,
}) => {
  const center = size / 2;
  const radius = center - strokeWidth / 2;

  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (!total) return null;

  let accAngle = 0;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G rotation={-90} originX={center} originY={center}>
          {/* 배경 트랙 */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.grayScale100}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {data.map((item, index) => {
            if (item.count <= 0) return null;
            const angle = (item.count / total) * Math.PI * 2;
            const startAngle = accAngle;
            const endAngle = accAngle + angle;
            accAngle = endAngle;

            const midAngle = (startAngle + endAngle) / 2;
            const midSvg = polarToCartesian(center, center, radius, midAngle);
            // Because the entire group is rotated -90deg, compute visual(screen) coords by rotating the point -90deg around center
            const midScreen = polarToCartesian(center, center, radius, midAngle - Math.PI / 2);
            
            // 세그먼트 면적의 중심점 계산 (내부 반지름 사용)
            const innerRadius = radius - strokeWidth / 2;  // 내부 반지름
            const centerSvg = polarToCartesian(center, center, innerRadius, midAngle);
            const centerScreen = polarToCartesian(center, center, innerRadius, midAngle - Math.PI / 2);

            const visiblePath = describeArcPath(center, center, radius, startAngle, endAngle);
            const handlePress = (event: any) => {
              // 사용자가 터치한 정확한 좌표 추출
              const touchX = event.nativeEvent.pageX;
              const touchY = event.nativeEvent.pageY;
              
              onSegmentPress?.(item, index, { 
                midAngle, 
                svg: midSvg, 
                screen: midScreen,
                centerSvg,      // 세그먼트 내부 중심 (SVG 좌표)
                centerScreen,   // 세그먼트 내부 중심 (화면 좌표)
                touchPosition: { x: touchX, y: touchY }  // 사용자 터치 좌표
              });
            };
            return (
              <G key={item.emotion}>
                <Path
                  d={visiblePath}
                  stroke={getRankColor(index)}
                  strokeWidth={strokeWidth}
                  strokeLinecap="butt"
                  fill="transparent"
                  onPress={handlePress}
                  accessible
                  accessibilityLabel={`${item.emotion} ${item.count}`}
                />
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerTitle: {
    ...syongsyongTypography.body1,
    color: colors.grayScale900,
    marginBottom: 4,
  },
  centerCount: {
    ...syongsyongTypography.h2,
    color: colors.grayScale900,
  },
});

export default DonutChart;
