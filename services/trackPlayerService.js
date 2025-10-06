import TrackPlayer, { Event } from 'react-native-track-player';

// Track Player 서비스
module.exports = async function() {
  // 이 서비스는 백그라운드에서 실행됩니다
  console.log('🎵 Track Player Service started');
  
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log('🎵 Remote Play');
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log('🎵 Remote Pause');
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    console.log('🎵 Remote Stop');
    TrackPlayer.stop();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (data) => {
    console.log('🎵 Remote Seek:', data.position);
    TrackPlayer.seekTo(data.position);
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    console.log('🎵 Remote Next');
    // 다음 트랙으로 이동 (현재는 구현하지 않음)
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    console.log('🎵 Remote Previous');
    // 이전 트랙으로 이동 (현재는 구현하지 않음)
  });

  TrackPlayer.addEventListener(Event.RemoteJumpForward, (data) => {
    console.log('🎵 Remote Jump Forward:', data.interval);
    console.log('data', JSON.stringify(data, null, 2));
    const jumpInterval = data.interval || 5;
    TrackPlayer.seekBy(jumpInterval);
    
    // React Native 이벤트로 점프 이벤트 전달
    const { DeviceEventEmitter } = require('react-native');
    DeviceEventEmitter.emit('trackPlayerJumpForward', { seconds: jumpInterval });
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, (data) => {
    console.log('🎵 Remote Jump Backward:', data.interval);
    console.log('data', JSON.stringify(data, null, 2));
    const jumpInterval = data.interval || 5;
    TrackPlayer.seekBy(-jumpInterval);
    
    // React Native 이벤트로 점프 이벤트 전달
    const { DeviceEventEmitter } = require('react-native');
    DeviceEventEmitter.emit('trackPlayerJumpBackward', { seconds: jumpInterval });
  });
};
