import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function AudioPlayerScreen() {
  const [player, setPlayer] = useState<AudioPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');

  useEffect(() => {
    loadAudio();
    return () => {
      if (player) {
        player.remove();
      }
    };
  }, []);

  const loadAudio = async () => {
    try {
      setIsLoading(true);
      const audioPlayer = createAudioPlayer(
        require('@/assets/audio/test_audio.mp3'),
        1000 // update interval in milliseconds
      );
      
      // Set up event listeners
      audioPlayer.addListener('playbackStatusUpdate', (status: any) => {
        setIsPlaying(status.playing);
        setDuration(status.duration * 1000); // Convert to milliseconds
        setPosition(status.currentTime * 1000); // Convert to milliseconds
      });
      
      setPlayer(audioPlayer);
    } catch (error) {
      console.error('오디오 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!player) return;
    
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const rewind5Seconds = async () => {
    if (!player) return;
    
    const newPosition = Math.max(0, (position / 1000) - 5); // Convert to seconds
    await player.seekTo(newPosition);
  };

  const forward5Seconds = async () => {
    if (!player) return;
    
    const newPosition = Math.min(duration / 1000, (position / 1000) + 5); // Convert to seconds
    await player.seekTo(newPosition);
  };

  const changeVolume = async (newVolume: number) => {
    if (!player) return;
    setVolume(newVolume);
    // Note: expo-audio doesn't have direct volume control in this version
  };

  const changePlaybackRate = async (newRate: number) => {
    if (!player) return;
    setPlaybackRate(newRate);
    player.setPlaybackRate(newRate);
  };

  const onSeek = async (value: number) => {
    if (!player) return;
    
    const newPosition = (value / 100) * (duration / 1000); // Convert to seconds
    await player.seekTo(newPosition);
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        오디오 플레이어 POC
      </ThemedText>
      
      <View style={styles.audioInfo}>
        <ThemedText type="subtitle" style={styles.songTitle}>
          Test Audio
        </ThemedText>
        <ThemedText style={styles.artist}>
          Audio Rewind POC
        </ThemedText>
      </View>

      {/* 재생 범위 바 */}
      <View style={styles.progressContainer}>
        <TouchableOpacity 
          style={styles.progressBar} 
          onPress={(event) => {
            const { locationX } = event.nativeEvent;
            const progressBarWidth = width - 40;
            const percentage = (locationX / progressBarWidth) * 100;
            onSeek(percentage);
          }}
          activeOpacity={0.8}
        >
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressPercentage}%`,
                backgroundColor: primaryColor 
              }
            ]} 
          />
        </TouchableOpacity>
        <View style={styles.timeContainer}>
          <ThemedText style={styles.timeText}>
            {formatTime(position)}
          </ThemedText>
          <ThemedText style={styles.timeText}>
            {formatTime(duration)}
          </ThemedText>
        </View>
      </View>

      {/* 컨트롤 버튼들 */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={rewind5Seconds}
          disabled={isLoading}
        >
          <Ionicons 
            name="play-back" 
            size={24} 
            color={textColor} 
          />
          <ThemedText style={styles.buttonText}>5초 전</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.playButton, { backgroundColor: primaryColor }]} 
          onPress={togglePlayPause}
          disabled={isLoading}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={32} 
            color="white" 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={forward5Seconds}
          disabled={isLoading}
        >
          <Ionicons 
            name="play-forward" 
            size={24} 
            color={textColor} 
          />
          <ThemedText style={styles.buttonText}>5초 후</ThemedText>
        </TouchableOpacity>
      </View>

      {/* 추가 컨트롤들 */}
      <View style={styles.additionalControls}>
        <View style={styles.controlRow}>
          <ThemedText style={styles.controlLabel}>볼륨</ThemedText>
          <View style={styles.sliderContainer}>
            <TouchableOpacity 
              style={[styles.slider, { backgroundColor: '#e0e0e0' }]}
              onPress={(event) => {
                const { locationX } = event.nativeEvent;
                const sliderWidth = 100;
                const newVolume = Math.max(0, Math.min(1, locationX / sliderWidth));
                changeVolume(newVolume);
              }}
            >
              <View 
                style={[
                  styles.sliderFill, 
                  { 
                    width: `${volume * 100}%`,
                    backgroundColor: primaryColor 
                  }
                ]} 
              />
            </TouchableOpacity>
            <ThemedText style={styles.sliderValue}>{Math.round(volume * 100)}%</ThemedText>
          </View>
        </View>

        <View style={styles.controlRow}>
          <ThemedText style={styles.controlLabel}>재생 속도</ThemedText>
          <View style={styles.speedButtons}>
            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
              <TouchableOpacity
                key={rate}
                style={[
                  styles.speedButton,
                  playbackRate === rate && { backgroundColor: primaryColor }
                ]}
                onPress={() => changePlaybackRate(rate)}
              >
                <ThemedText 
                  style={[
                    styles.speedButtonText,
                    playbackRate === rate && { color: 'white' }
                  ]}
                >
                  {rate}x
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ThemedText>오디오 로딩 중...</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 40,
    textAlign: 'center',
  },
  audioInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  artist: {
    fontSize: 16,
    opacity: 0.7,
  },
  progressContainer: {
    width: width - 40,
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    opacity: 0.7,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: width - 40,
  },
  controlButton: {
    alignItems: 'center',
    padding: 15,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 12,
    marginTop: 5,
  },
  additionalControls: {
    width: width - 40,
    marginTop: 30,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 80,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 20,
  },
  slider: {
    height: 6,
    width: 100,
    borderRadius: 3,
    marginRight: 10,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
  },
  sliderValue: {
    fontSize: 12,
    minWidth: 30,
  },
  speedButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    marginLeft: 20,
  },
  speedButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  speedButtonText: {
    fontSize: 12,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
}); 