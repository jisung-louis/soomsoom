import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import TrackPlayer, { State, Event, Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';
import { 
  setupTrackPlayerEvents, 
  addTrack, 
  playTrack, 
  pauseTrack, 
  stopTrack, 
  seekTo, 
  getPlaybackState, 
  getPosition, 
  setPlaybackRate, 
  setVolume, 
  resetQueue,
  updateTrackMetadata,
  getCurrentTrackDuration
} from '../services/trackPlayerService';

export interface UseAudioPlayerOptions {
  source: any; // require() 또는 { uri: string }
  autoPlay?: boolean;
  content: any;
  onEnd?: () => void;
  repeat?: boolean;
  onJumpForward?: (seconds: number) => void;
  onJumpBackward?: (seconds: number) => void;
  enableBackgroundControls?: boolean; // 제어센터/잠금화면 컨트롤 활성화 여부
}

export interface UseAudioPlayerResult {
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  play: () => void;
  pause: () => void;
  seekTo: (millis: number) => void;
  rewind: (sec?: number) => void;
  forward: (sec?: number) => void;
  setPlaybackRate: (rate: number) => void;
  playbackRate: number;
  setVolume: (vol: number) => void;
  volume: number;
  player: any; // Track Player는 직접 접근하지 않음
}

export function useAudioPlayer({ source, content, autoPlay = false, onEnd, repeat = false, onJumpForward, onJumpBackward, enableBackgroundControls = true }: UseAudioPlayerOptions): UseAudioPlayerResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1.0);
  const [volume, setVolumeState] = useState(1.0);
  
  const isMounted = useRef(true);
  const repeatRef = useRef(repeat);
  const currentTrackId = useRef<string | null>(null);
  const positionUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const appStateListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    isMounted.current = true;
    loadAudio();
    return () => {
      isMounted.current = false;
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (appStateListenerRef.current) {
        try { appStateListenerRef.current(); } catch {}
        appStateListenerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  const loadAudio = async () => {
    setIsLoading(true);
    try {
      if (!source) {
        return;
      }

      // 백그라운드 컨트롤 설정 (화면별 정책 적용)
      if (enableBackgroundControls) {
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
            Capability.SeekTo,
            Capability.JumpForward,
            Capability.JumpBackward,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.JumpForward,
            Capability.JumpBackward,
          ],
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
            Capability.JumpForward,
            Capability.JumpBackward,
          ],
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
          },
          forwardJumpInterval: 5,
          backwardJumpInterval: 5,
        });
        console.log('🔄 백그라운드 컨트롤 활성화');
      } else {
        await TrackPlayer.updateOptions({
          capabilities: [],
          compactCapabilities: [],
          notificationCapabilities: [],
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          },
        });
        console.log('🚫 백그라운드 컨트롤 비활성화');
      }

      // 기존 큐 초기화
      await resetQueue();

      // 소스 URL 생성
      const audioUrl = typeof source === 'string' ? source : source.uri;
      if (!audioUrl) {
        console.warn('No audio URL found');
        return;
      }

      // 트랙 생성
      const track = {
        id: `track_${Date.now()}`,
        url: audioUrl,
        title: content.title,
        artist: content.author.name,
        album: '정신건강 관리',
        artwork: content.thumbnailImageUrl,
        duration: 0, // Track Player가 자동으로 설정
      };

      currentTrackId.current = track.id;
      await addTrack(track);

      // 이벤트 리스너 설정
      const cleanup = setupTrackPlayerEvents(
        (state) => {
          if (!isMounted.current) return;
          console.log('🎵 State changed:', state);
          setIsPlaying(state === State.Playing);
        },
        (track) => {
          if (!isMounted.current) return;
          console.log('🎵 Track changed:', track);
          if (track && track.duration) {
            setDuration(track.duration * 1000); // ms로 변환
            console.log('🎵 Duration set from track:', track.duration, 'seconds');
          }
        },
        (error) => {
          if (!isMounted.current) return;
          console.error('❌ Playback error:', error);
        },
        () => {
          if (!isMounted.current) return;
          console.log('🎵 Track ended');
          if (onEnd) {
            onEnd();
          }
          if (repeatRef.current) {
            console.log('🔁 Repeat enabled, restarting from beginning');
            setTimeout(async () => {
              if (isMounted.current) {
                try {
                  // 처음부터 다시 시작
                  await seekTo(0);
                  await playTrack();
                } catch (error) {
                  console.error('Repeat restart failed:', error);
                }
              }
            }, 100);
          }
        },
        (progress) => {
          if (!isMounted.current) return;
          setPosition(progress.position * 1000); // ms로 변환
          if (progress.duration > 0 && duration === 0) {
            setDuration(progress.duration * 1000); // ms로 변환
            console.log('🎵 Duration set from progress:', progress.duration, 'seconds');
          }
        }
      );

      cleanupRef.current = cleanup;

      // 위치 업데이트를 위한 인터벌 설정 (Progress 이벤트가 불안정할 수 있음)
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
      
      positionUpdateInterval.current = setInterval(async () => {
        if (!isMounted.current) return;
        try {
          const currentPosition = await getPosition();
          setPosition(currentPosition * 1000); // ms로 변환
        } catch (error) {
          console.warn('Position update failed:', error);
        }
      }, 500); // 0.5초마다 업데이트

      // 자동 재생
      if (autoPlay) {
        await playTrack();
      }

      // duration을 한 번만 가져오기
      const loadDuration = async () => {
        if (!isMounted.current) return;
        try {
          const trackDuration = await getCurrentTrackDuration();
          if (trackDuration > 0) {
            setDuration(trackDuration * 1000); // ms로 변환
            console.log('🎵 Duration loaded:', trackDuration, 'seconds');
          }
        } catch (error) {
          console.warn('Duration load failed:', error);
        }
      };

      // 1초 후 duration 로드 시도
      setTimeout(loadDuration, 1000);
      
      // 3초 후에도 duration이 없으면 다시 시도
      setTimeout(() => {
        if (duration === 0) {
          loadDuration();
        }
      }, 3000);

    } catch (error) {
      console.error('Audio loading failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 백그라운드 재생 비활성화 모드: 앱이 비활성/백그라운드로 갈 때 즉시 일시정지
  useEffect(() => {
    if (!enableBackgroundControls) {
      const onChange = (nextState: AppStateStatus) => {
        if (
          //nextState === 'inactive'
           //|| 
           nextState === 'background'
          ) {
          // 백그라운드 진입 시 일시정지만 수행
          pauseTrack().catch(() => {});
        }
      };
      const sub = AppState.addEventListener('change', onChange);
      appStateListenerRef.current = () => sub.remove();
      return () => {
        try { sub.remove(); } catch {}
      };
    }
  }, [enableBackgroundControls]);

  // Track Player API를 사용한 함수들
  const play = useCallback(async () => { 
    try {
      await playTrack();
    } catch (error) {
      console.error('Play failed:', error);
    }
  }, []);
  
  const pause = useCallback(async () => { 
    try {
      await pauseTrack();
    } catch (error) {
      console.error('Pause failed:', error);
    }
  }, []);
  
  const seekToPosition = useCallback(async (millis: number) => { 
    try {
      await seekTo(millis / 1000); // Track Player는 초 단위
      setPosition(millis);
    } catch (error) {
      console.error('Seek failed:', error);
    }
  }, []);
  
  const rewind = useCallback(async (sec: number = 5) => {
    try {
      const newPos = Math.max(0, position - sec * 1000);
      await seekTo(newPos / 1000); // Track Player는 초 단위
      console.log(`⏪ Rewind: ${sec}초 뒤로 (${newPos/1000}초)`);
      
      // 점프 백워드 콜백 호출
      if (onJumpBackward) {
        onJumpBackward(sec);
      }
    } catch (error) {
      console.error('Rewind failed:', error);
    }
  }, [position, seekTo, onJumpBackward]);
  
  const forward = useCallback(async (sec: number = 5) => {
    try {
      const newPos = Math.min(duration, position + sec * 1000);
      await seekTo(newPos / 1000); // Track Player는 초 단위
      console.log(`⏩ Forward: ${sec}초 앞으로 (${newPos/1000}초)`);
      
      // 점프 포워드 콜백 호출
      if (onJumpForward) {
        onJumpForward(sec);
      }
    } catch (error) {
      console.error('Forward failed:', error);
    }
  }, [position, duration, seekTo, onJumpForward]);
  
  const setPlaybackRateCallback = useCallback(async (rate: number) => { 
    try {
      setPlaybackRateState(rate);
      await setPlaybackRate(rate);
    } catch (error) {
      console.error('Set playback rate failed:', error);
    }
  }, []);
  
  const setVolumeCallback = useCallback(async (vol: number) => { 
    try {
      setVolumeState(vol);
      await setVolume(vol);
    } catch (error) {
      console.error('Set volume failed:', error);
    }
  }, []);

  return {
    isPlaying,
    isLoading,
    duration,
    position,
    play,
    pause,
    seekTo: seekToPosition,
    rewind,
    forward,
    setPlaybackRate: setPlaybackRateCallback,
    playbackRate,
    setVolume: setVolumeCallback,
    volume,
    player: null, // Track Player는 직접 접근하지 않음
  };
}