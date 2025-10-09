import TrackPlayer, { Capability, State, Event, AppKilledPlaybackBehavior, RatingType } from 'react-native-track-player';

// Track Player 서비스 설정
export async function setupTrackPlayer() {
  try {
    await TrackPlayer.setupPlayer({
      // 백그라운드 재생을 위한 설정
      waitForBuffer: false,
      autoHandleInterruptions: true,
    });

    // 기본값은 백그라운드 컨트롤/노티 비활성화 (화면에서 필요 시 활성화)
    await TrackPlayer.updateOptions({
      capabilities: [],
      compactCapabilities: [],
      notificationCapabilities: [],
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        alwaysPauseOnInterruption: false,
      },
      forwardJumpInterval: 5,
      backwardJumpInterval: 5,
    });

    console.log('✅ Track Player 설정 완료');
  } catch (error) {
    console.error('❌ Track Player 설정 실패:', error);
  }
}

// Track Player 이벤트 리스너 설정
export function setupTrackPlayerEvents(
  onPlaybackStateChange?: (state: State) => void,
  onPlaybackTrackChange?: (track: any) => void,
  onPlaybackError?: (error: any) => void,
  onPlaybackQueueEnd?: () => void,
  onPlaybackProgress?: (progress: { position: number; duration: number }) => void
) {
  const subscription = TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
    console.log('🎵 Playback State:', data.state);
    onPlaybackStateChange?.(data.state);
  });

  const trackSubscription = TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async (data) => {
    console.log('🎵 Track Changed:', data.track);
    if (data.track) {
      try {
        // 트랙이 변경될 때 duration 정보 가져오기
        const track = await TrackPlayer.getTrack(data.track);
        if (track) {
          console.log('🎵 Track duration:', track.duration);
          onPlaybackTrackChange?.(track);
        }
      } catch (error) {
        console.warn('Failed to get track details:', error);
        onPlaybackTrackChange?.(data.track);
      }
    }
  });

  const errorSubscription = TrackPlayer.addEventListener(Event.PlaybackError, (data) => {
    console.error('❌ Playback Error:', data);
    onPlaybackError?.(data);
  });

  const queueEndSubscription = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, (data) => {
    console.log('🎵 Queue Ended:', data);
    onPlaybackQueueEnd?.();
  });

  const progressSubscription = TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (data) => {
    if (onPlaybackProgress) {
      onPlaybackProgress({
        position: data.position,
        duration: data.duration
      });
    }
  });

  return () => {
    subscription?.remove();
    trackSubscription?.remove();
    errorSubscription?.remove();
    queueEndSubscription?.remove();
    progressSubscription?.remove();
  };
}

// 트랙 추가 함수
export async function addTrack(track: any) {
  try {
    await TrackPlayer.add(track);
    console.log('✅ 트랙 추가 완료:', track.title);
  } catch (error) {
    console.error('❌ 트랙 추가 실패:', error);
  }
}

// 트랙 재생 함수
export async function playTrack() {
  try {
    await TrackPlayer.play();
    console.log('▶️ 재생 시작');
  } catch (error) {
    console.error('❌ 재생 실패:', error);
  }
}

// 트랙 일시정지 함수
export async function pauseTrack() {
  try {
    await TrackPlayer.pause();
    console.log('⏸️ 일시정지');
  } catch (error) {
    console.error('❌ 일시정지 실패:', error);
  }
}

// 트랙 정지 함수
export async function stopTrack() {
  try {
    await TrackPlayer.stop();
    console.log('⏹️ 정지');
  } catch (error) {
    console.error('❌ 정지 실패:', error);
  }
}

// 위치 이동 함수
export async function seekTo(position: number) {
  try {
    await TrackPlayer.seekTo(position);
    console.log('⏭️ 위치 이동:', position);
  } catch (error) {
    console.error('❌ 위치 이동 실패:', error);
  }
}

// 현재 재생 상태 가져오기
export async function getPlaybackState() {
  try {
    const state = await TrackPlayer.getState();
    return state;
  } catch (error) {
    console.error('❌ 재생 상태 조회 실패:', error);
    return State.None;
  }
}

// 현재 위치 가져오기
export async function getPosition() {
  try {
    const position = await TrackPlayer.getPosition();
    return position;
  } catch (error) {
    console.error('❌ 위치 조회 실패:', error);
    return 0;
  }
}

// 재생 속도 설정
export async function setPlaybackRate(rate: number) {
  try {
    await TrackPlayer.setRate(rate);
    console.log('🎵 재생 속도 설정:', rate);
  } catch (error) {
    console.error('❌ 재생 속도 설정 실패:', error);
  }
}

// 볼륨 설정
export async function setVolume(volume: number) {
  try {
    await TrackPlayer.setVolume(volume);
    console.log('🔊 볼륨 설정:', volume);
  } catch (error) {
    console.error('❌ 볼륨 설정 실패:', error);
  }
}

// 큐 초기화
export async function resetQueue() {
  try {
    await TrackPlayer.reset();
    console.log('🔄 큐 초기화 완료');
  } catch (error) {
    console.error('❌ 큐 초기화 실패:', error);
  }
}

// 트랙 메타데이터 업데이트 (잠금화면 표시용)
export async function updateTrackMetadata(trackId: string, metadata: {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: string;
  duration?: number;
}) {
  try {
    // Track Player는 addTrack 시에 메타데이터를 설정하므로 별도 업데이트 불필요
    console.log('📱 트랙 메타데이터 설정됨:', metadata);
  } catch (error) {
    console.error('❌ 메타데이터 설정 실패:', error);
  }
}

// 현재 트랙 정보 가져오기
export async function getCurrentTrack() {
  try {
    const track = await TrackPlayer.getCurrentTrack();
    return track;
  } catch (error) {
    console.error('❌ 현재 트랙 조회 실패:', error);
    return null;
  }
}

// 현재 트랙의 duration 가져오기
export async function getCurrentTrackDuration() {
  try {
    // 먼저 getDuration() 시도
    const duration = await TrackPlayer.getDuration();
    if (duration > 0) {
      return duration;
    }
    
    // getDuration()이 실패하면 트랙 정보에서 가져오기
    const track = await TrackPlayer.getCurrentTrack();
    if (track) {
      const trackInfo = await TrackPlayer.getTrack(track);
      return trackInfo?.duration || 0;
    }
    return 0;
  } catch (error) {
    console.error('❌ 현재 트랙 duration 조회 실패:', error);
    return 0;
  }
}

// Track Player 완전 정리 (백그라운드 플레이바 제거)
export async function cleanupTrackPlayer() {
  try {
    // 1. 재생 중지
    await TrackPlayer.pause();
    console.log('⏸️ Track Player 일시정지');
    
    // 2. 큐 초기화 (백그라운드 플레이바 제거)
    await TrackPlayer.reset();
    console.log('🔄 Track Player 큐 초기화 완료');
    
    // 3. 옵션 업데이트로 백그라운드 컨트롤 비활성화
    await TrackPlayer.updateOptions({
      capabilities: [],
      compactCapabilities: [],
      notificationCapabilities: [],
    });
    console.log('🚫 백그라운드 컨트롤 비활성화 완료');
  } catch (error) {
    console.error('❌ Track Player 정리 실패:', error);
  }
}
