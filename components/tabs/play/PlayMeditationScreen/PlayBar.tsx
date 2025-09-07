import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, ActivityIndicator } from 'react-native';
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

// type 정의는 그대로 유지

type PlayBarProps = {
  style: ViewStyle;
  content: Activity;
  handleToggleFavorite: () => void;
  isFavorite: boolean;
  isFavoriteLoading: boolean;
  onEnd: () => void;
};

const PlayBar = ({style, content, handleToggleFavorite, isFavorite, isFavoriteLoading, onEnd}: PlayBarProps) => {
  // 오디오 플레이어 훅 사용
  const [isRepeat, setIsRepeat] = React.useState(false);
  const isRepeatRef = React.useRef(isRepeat);
  React.useEffect(() => {
    console.log('🎧 isRepeat 상태:', isRepeat);
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  const {
    isPlaying, isLoading, duration, position,
    play, pause, seekTo, rewind, forward,
    setPlaybackRate, playbackRate,
  } = useAudioPlayer({ 
    source: content.audioUrl,
    repeat: isRepeat,
    onEnd: () => {
      console.log('🌀 onEnd triggered');
      if (!isRepeatRef.current) {
        console.log('🔁 onEnd and not repeat');
        onEnd();
        //navigation.navigate('PlayMeditationResultScreen'); // TODO: 결과 화면으로 이동
      }
    }
  });

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
    <View style={[styles.container, style]}>
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
            value={position}
            minimumTrackTintColor={colors.primary300}
            maximumTrackTintColor={colors.primary50}
            thumbTintColor={colors.primary300}
            thumbImage={require('../../../../assets/images/play/playBar/thumb.png')}
            onSlidingComplete={seekTo}
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
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
            color={isRepeat ? colors.primary400 : colors.primary200}
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
        <Text style={styles.adText}>광고 영역</Text>
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
    paddingBottom: 40, // iOS 홈 인디케이터 대응
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.grayScale200,
    marginHorizontal: -20,
    height: 70,
    marginBottom: -20,
  },
  adText: {
    ...typography.caption2,
    color: colors.grayScale700,
  },
});

export default PlayBar;