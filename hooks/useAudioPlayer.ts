import { useEffect, useRef, useState, useCallback } from 'react';
import { AudioPlayer, createAudioPlayer } from 'expo-audio';

export interface UseAudioPlayerOptions {
  source: any; // require() 또는 { uri: string }
  autoPlay?: boolean;
  onEnd?: () => void;
  repeat?: boolean;
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
  player: AudioPlayer | null;
}

export function useAudioPlayer({ source, autoPlay = false, onEnd, repeat = false }: UseAudioPlayerOptions): UseAudioPlayerResult {
  const [player, setPlayer] = useState<AudioPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1.0);
  const [volume, setVolumeState] = useState(1.0);
  
  const isMounted = useRef(true);
  const repeatRef = useRef(repeat);
  const playerRef = useRef<AudioPlayer | null>(null); // ref 추가

  useEffect(() => {
    isMounted.current = true;
    loadAudio();
    return () => {
      isMounted.current = false;
      playerRef.current?.remove();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  const loadAudio = async () => {
    setIsLoading(true);
    try {
      const audioPlayer = createAudioPlayer(source, 500);
      playerRef.current = audioPlayer; // ref에 저장
      
      audioPlayer.addListener('playbackStatusUpdate', (status: any) => {
        console.log('status', status);
        if (!isMounted.current) return;
        
        setIsPlaying(status.playing);
        setDuration(status.duration * 1000); // ms
        setPosition(status.currentTime * 1000); // ms
        
        if (status.didJustFinish) {
          console.log('didJustFinish');
          console.log('🔁 repeatRef.current:', repeatRef.current);
          console.log('🔁 playerRef exists:', !!playerRef.current);
          console.log('🔁 isMounted.current:', isMounted.current);
          
          if (onEnd) 
          {
            onEnd();
          }
          
          if (repeatRef.current && playerRef.current && isMounted.current) {
            console.log('🔁 repeat enabled, restarting');
            
            const currentPlayer = playerRef.current;
            
            // 즉시 seekTo 실행
            currentPlayer.seekTo(0);
            console.log('✅ Seeked to 0');
            
            // 짧은 딜레이 후 재생
            setTimeout(() => {
              console.log('🔁 setTimeout callback executed');
              console.log('🔁 currentPlayer exists:', !!currentPlayer);
              console.log('🔁 isMounted still true:', isMounted.current);
              
              if (isMounted.current && currentPlayer) {
                console.log('🔁 Actually calling play()');
                currentPlayer.play();
              } else {
                console.log('❌ Cannot play - player or mount status changed');
              }
            }, 100);
          }
        }
      });
      
      setPlayer(audioPlayer); // UI를 위한 state
      if (autoPlay) audioPlayer.play();
    } catch (error) {
      console.error('Audio loading failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 모든 player 조작 함수들을 playerRef 사용하도록 수정
  const play = useCallback(() => { 
    playerRef.current?.play(); 
  }, []);
  
  const pause = useCallback(() => { 
    playerRef.current?.pause(); 
  }, []);
  
  const seekTo = useCallback((millis: number) => { 
    playerRef.current?.seekTo(millis / 1000); 
  }, []);
  
  const rewind = useCallback((sec: number = 5) => {
    if (!playerRef.current) return;
    const newPos = Math.max(0, position - sec * 1000);
    playerRef.current.seekTo(newPos / 1000);
    // setPosition 제거 - playbackStatusUpdate에서 자동으로 업데이트됨
  }, [position]);
  
  const forward = useCallback((sec: number = 5) => {
    if (!playerRef.current) return;
    const newPos = Math.min(duration, position + sec * 1000);
    playerRef.current.seekTo(newPos / 1000);
    // setPosition 제거 - playbackStatusUpdate에서 자동으로 업데이트됨
  }, [position, duration]);
  
  const setPlaybackRate = useCallback((rate: number) => { 
    setPlaybackRateState(rate); 
    playerRef.current?.setPlaybackRate(rate); 
  }, []);
  
  const setVolume = useCallback((vol: number) => { 
    setVolumeState(vol); 
    /* expo-audio는 볼륨 직접 제어 미지원 */ 
  }, []);

  return {
    isPlaying,
    isLoading,
    duration,
    position,
    play,
    pause,
    seekTo,
    rewind,
    forward,
    setPlaybackRate,
    playbackRate,
    setVolume,
    volume,
    player, // UI에서 사용할 수 있도록 state 반환
  };
}