import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../../../../constants/colors';
import { radius } from '../../../../constants/radius';
import { typography } from '../../../../constants/typography';
import { Activity } from '../../../../services/contentService';
import FavoriteIcon from '../../../../assets/icons/common/star.svg';
import AuthorInfo from '../common/AuthorInfo';
import { useAudioPlayer } from '../../../../hooks/useAudioPlayer';
import { playIcons, PlayIcon } from '../../../../constants/icons';
import { useNavigation } from '@react-navigation/native';
import FavoriteButton from '../../../../components/common/buttons/FavoriteButton';
import AdBanner from '../../../../components/common/ads/AdBanner';
import { AD_SIZES } from '../../../../constants/ads';
import { BannerAdSize } from 'react-native-google-mobile-ads';

// type 정의는 그대로 유지

type PlayBarProps = {
  style: ViewStyle[] | ViewStyle;
  content: Activity;
  handleToggleFavorite: () => void;
  isFavorite: boolean;
  isFavoriteLoading: boolean;
  onEnd: () => void;
  onPositionChange?: (position: number) => void;
  onPlayStart?: () => void;
  onPlayPause?: () => void;
  onPlayTimeUpdate?: (playTime: number) => void;
  initialPosition?: number;
  onPlayerReady?: (playerControls: { pause: () => void; stop: () => void }) => void;
};

const PlayBar = ({
  style, 
  content, 
  handleToggleFavorite, 
  isFavorite, 
  isFavoriteLoading, 
  onEnd,
  onPositionChange,
  onPlayStart,
  onPlayPause,
  onPlayTimeUpdate,
  initialPosition = 0,
  onPlayerReady
}: PlayBarProps) => {
  // 오디오 플레이어 훅 사용
  const [isRepeat, setIsRepeat] = React.useState(false);
  const isRepeatRef = React.useRef(isRepeat);
  React.useEffect(() => {
    console.log('🎧 isRepeat 상태:', isRepeat);
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  // 실제 재생 시간 추적
  const playTimeRef = React.useRef(0);
  const playTimeIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // 드래그 상태 관리
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragPosition, setDragPosition] = React.useState(0);

  const {
    isPlaying, isLoading, duration, position,
    play, pause, seekTo, rewind, forward,
    setPlaybackRate, playbackRate,
  } = useAudioPlayer({ 
    source: content.audioUrl,
    content: content,
    repeat: isRepeat,
    enableBackgroundControls: false, // 백그라운드 컨트롤 비활성화
    onEnd: () => {
      console.log('🌀 onEnd triggered');
      if (!isRepeatRef.current) {
        console.log('🔁 onEnd and not repeat');
        onEnd();
        //navigation.navigate('PlayMeditationResultScreen'); // TODO: 결과 화면으로 이동
      }
    }
  });

  // 플레이어 제어 함수들을 외부로 노출
  React.useEffect(() => {
    if (onPlayerReady) {
      onPlayerReady({
        pause: pause,
        stop: pause, // stop이 없으므로 pause 사용
      });
    }
  }, [onPlayerReady, pause]);

  // position 변경 감지하여 콜백 호출
  React.useEffect(() => {
    if (onPositionChange) {
      onPositionChange(position);
    }
  }, [position, onPositionChange]);

  // 재생 시간 추적 시작/중지
  React.useEffect(() => {
    if (isPlaying) {
      // 재생 시작 시 1초마다 재생 시간 업데이트
      playTimeIntervalRef.current = setInterval(() => {
        playTimeRef.current += 1;
        if (onPlayTimeUpdate) {
          onPlayTimeUpdate(playTimeRef.current);
        }
        console.log(`⏱️ 실제 재생 시간: ${playTimeRef.current}초`);
      }, 1000);
    } else {
      // 일시정지 시 재생 시간 추적 중지
      if (playTimeIntervalRef.current) {
        clearInterval(playTimeIntervalRef.current);
        playTimeIntervalRef.current = null;
      }
    }

    return () => {
      if (playTimeIntervalRef.current) {
        clearInterval(playTimeIntervalRef.current);
        playTimeIntervalRef.current = null;
      }
    };
  }, [isPlaying, onPlayTimeUpdate]);

  // 재생 상태 변경 감지하여 콜백 호출
  React.useEffect(() => {
    if (isPlaying && onPlayStart) {
      onPlayStart();
    } else if (!isPlaying && onPlayPause) {
      onPlayPause();
    }
  }, [isPlaying, onPlayStart, onPlayPause]);

  // 이어듣기 위치를 저장할 ref
  const pendingInitialPosition = React.useRef<number | null>(null);

  // initialPosition이 설정되면 ref에 저장
  React.useEffect(() => {
    if (initialPosition > 0) {
      pendingInitialPosition.current = initialPosition;
      console.log(`🎯 이어듣기 위치 저장: ${initialPosition}초`);
    }
  }, [initialPosition]);

  // duration이 로드되면 저장된 이어듣기 위치 적용 및 자동 재생
  React.useEffect(() => {
    if (duration > 0) {
      console.log(`🎵 Duration loaded: ${duration / 1000}초`);
      
      if (pendingInitialPosition.current) {
        const position = pendingInitialPosition.current;
        if (position < duration / 1000) {
          console.log(`🎯 이어듣기 위치 설정: ${position}초 (전체: ${duration / 1000}초)`);
          // Track Player는 seekTo 후 자동으로 재생됨
          seekTo(position * 1000); // 초를 밀리초로 변환
          pendingInitialPosition.current = null; // 적용 완료 후 초기화
          console.log(`▶️ 이어듣기 위치 설정 완료`);
          // 이어듣기 자동 재생
          play();
          console.log(`▶️ 이어듣기 자동 재생 시작`);
        } else {
          console.log(`🎯 이어듣기 위치가 전체 길이보다 큼: ${position}초 (전체: ${duration / 1000}초) - 처음부터 재생`);
          pendingInitialPosition.current = null; // 무효한 위치이므로 초기화
          // 처음부터 자동 재생
          play();
          console.log(`▶️ 처음부터 자동 재생 시작`);
        }
      } else {
        // 이어듣기 위치가 없으면 처음부터 자동 재생
        play();
        console.log(`▶️ 처음부터 자동 재생 시작`);
      }
    } else {
      console.log(`🎵 Duration not loaded yet: ${duration}ms`);
    }
  }, [duration, seekTo, play]);

  const [barWidth, setBarWidth] = React.useState(0);
  
  

  // 진행률 계산
  const progress = duration > 0 ? position / duration : 0;

  // 시간 포맷
  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((millis % 60000) / 1000).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <View style={[styles.container, ...(Array.isArray(style) ? style : [style])]}>
      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{content.title}</Text>
            <FavoriteButton onPress={handleToggleFavorite} isFavorite={isFavorite} isLoading={isFavoriteLoading} />
          </View>
          <AuthorInfo
            instructorName={content.author.name}
            guide={content.narrator.name}
            onPressInstructor={() => {}}
          />
        </View>
        {/* 진행 바 */}
        <View style={styles.progressContainer}>{/*커스텀 thumb 이미지 적용 안됨*/}{/* 트랙 height 조절 안됨 */}
          <Slider 
            style={{ width: '100%', height: 24 }} 
            minimumValue={0}
            maximumValue={duration}
            value={isDragging ? dragPosition : position}
            minimumTrackTintColor={colors.primary300}
            maximumTrackTintColor={Platform.OS === 'android' ? colors.primary300 : colors.primary50}
            thumbTintColor={colors.primary300}
            thumbImage={require('../../../../assets/images/play/playBar/thumb.png')}
            onValueChange={(value) => {
              setDragPosition(value);
            }}
            onSlidingStart={() => {
              setIsDragging(true);
              setDragPosition(position);
            }}
            onSlidingComplete={(value) => {
              setIsDragging(false);
              setDragPosition(0);
              seekTo(value);
            }}
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(isDragging ? dragPosition : position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>
      {/* 컨트롤 버튼 */}
      <View style={styles.playbackContainer}>
        <TouchableOpacity onPress={() => {}} style={styles.iconButton} >
          {/* <playIcons.naked.speed width={40} height={40} color={colors.primary200} /> */}{/* 비활성화 상태*/}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => rewind()} style={styles.iconButton}>
          <playIcons.naked.backward width={40} height={40} color={colors.primary200} />
        </TouchableOpacity>
        <TouchableOpacity
            onPress={isPlaying ? pause : play}
            style={[styles.playButton, isPlaying && { backgroundColor: colors.primary400 }]}
            >
            {isLoading ? (
                <ActivityIndicator color={colors.white} />
            ) : (
                isPlaying
                ? <playIcons.circleed.pause width={48} height={48} color={colors.white} />
                : <playIcons.circleed.play width={48} height={48} color={colors.white} />
            )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => forward()} style={styles.iconButton}>
          <playIcons.naked.forward width={40} height={40} color={colors.primary200} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setIsRepeat(prev => !prev);
          }}
          style={styles.iconButton}
        >
          <playIcons.naked.repeat
            width={40}
            height={40}
            color={isRepeat ? colors.primary300 : colors.primary200}
          />
        </TouchableOpacity>
      </View>
      {/* 속도 조절 */}
      {/* <View style={styles.speedRow}>
        {[0.75, 1.0, 1.25, 1.5].map(rate => (
          <TouchableOpacity
            key={rate}
            style={[styles.speedButton, playbackRate === rate && { backgroundColor: colors.primary100 }]}
            onPress={() => setPlaybackRate(rate)}
          >
            <Text style={[styles.speedText, playbackRate === rate && { color: colors.primary400 }]}>{rate}x</Text>
          </TouchableOpacity>
        ))}
      </View> */}
      <View style={styles.adContainer}>
        {/* <Text style={styles.adText}>광고 영역</Text> */}
        <AdBanner size={AD_SIZES.ANCHORED_ADAPTIVE_BANNER as BannerAdSize}/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.r20,
    borderTopRightRadius: radius.r20,
    gap: 10,
    paddingBottom: 0,
  },
  contentContainer: {
    gap: 20,
  },
  infoContainer: {
    gap: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.heading7,
    color: colors.grayScale900,
  },
  progressContainer: {
    gap: 0, // figma에서는 8이지만 progressBar 높이 조절이 안돼서 0으로 조절
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    ...typography.caption2,
    color: colors.grayScale600,
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary400,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  speedButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.grayScale100,
  },
  speedText: {
    fontSize: 13,
    color: colors.grayScale700,
  },
  adContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.grayScale200,
    marginHorizontal: -20,
    marginBottom: -20,
  },
  adText: {
    ...typography.caption2,
    color: colors.grayScale700,
  },
});

export default PlayBar;