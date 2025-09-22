import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import PlayBar from '../../../components/tabs/play/PlayMeditationScreen/PlayBar';
import { usePlayStore } from '../../../stores/playStore';
import { toggleFavoriteActivity } from '../../../services/contentService';
import { useToast } from '../../../contexts/ToastContext';
import UserRoom from '../../../components/common/userroom/UserRoom';
import { 
  completeActivity, 
  updateActivityProgress, 
  getActivityProgress 
} from '../../../services/activityLogService';

const PlayMeditationScreen = ({route}: {route: RouteProp<PlayStackParamList, 'PlayMeditationScreen'>}) => {
  const {content, initialPosition} = route.params;
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  const { favoriteActivities } = usePlayStore();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 액티비티 진행상황 기록을 위한 상태
  const [lastPosition, setLastPosition] = useState<number>(0);
  const [actualPlayTime, setActualPlayTime] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const progressUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  
  // 플레이어 제어 함수들
  const playerControls = useRef<{ pause: () => void; stop: () => void } | null>(null);

  // lastPosition 상태 변경 디버깅
  useEffect(() => {
    console.log(`📍 lastPosition 상태 변경: ${lastPosition/1000}초`);
  }, [lastPosition]);

  // 컴포넌트 마운트 시 이전 진행상황 조회
  useEffect(() => {
    const loadPreviousProgress = async () => {
      try {
        // initialPosition이 있으면 그것을 사용 (이어듣기)
        if (initialPosition !== undefined) {
          console.log(`📖 이어듣기 위치 설정: ${initialPosition/1000}초`);
          setLastPosition(initialPosition);
          return;
        }

        // initialPosition이 없으면 이전 진행상황 조회
        const progress = await getActivityProgress(content.id);
        if (progress) {
          console.log(`📖 이전 진행상황 로드: ${progress.progressSeconds/1000}초`);
          setLastPosition(progress.progressSeconds);
        } else {
          console.log(`📖 이전 진행상황 없음 - 처음부터 시작`);
          setLastPosition(0);
        }
      } catch (error) {
        console.error('이전 진행상황 조회 실패:', error);
        setLastPosition(0);
      }
    };

    loadPreviousProgress();
  }, [content.id, initialPosition]);

  // 진행상황 기록 함수
  const saveProgress = async (position: number, playTime: number) => {
    let lastPlaybackPositionInSeconds = Math.floor(position / 1000);
    try {
      await updateActivityProgress(content.id, {
        lastPlaybackPosition: lastPlaybackPositionInSeconds,
        actualPlayTimeInSeconds: playTime,
      });
      console.log(`💾 진행상황 저장: ${lastPlaybackPositionInSeconds/1000}초, 재생시간: ${playTime/1000}초`);
    } catch (error) {
      console.error('진행상황 저장 실패:', error);
    }
  };

  // 주기적으로 진행상황 저장 (30초마다)
  const startProgressTracking = () => {
    if (progressUpdateInterval.current) {
      clearInterval(progressUpdateInterval.current);
    }
    
    progressUpdateInterval.current = setInterval(() => {
      saveProgress(lastPosition, actualPlayTime);
    }, 30000); // 30초마다 저장
  };

  // 진행상황 추적 중지
  const stopProgressTracking = () => {
    if (progressUpdateInterval.current) {
      clearInterval(progressUpdateInterval.current);
      progressUpdateInterval.current = null;
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopProgressTracking();
    };
  }, []);

  const handleBack = async () => {
    try {
      // 1. 오디오 플레이어 먼저 중지
      if (playerControls.current) {
        console.log('⏹️ 오디오 플레이어 중지');
        playerControls.current.pause();
      }
      
      // 2. 진행상황 추적 중지
      stopProgressTracking();
      
      // 3. 액티비티 진행 상황 기록
      await saveProgress(lastPosition, actualPlayTime);
      
      // 4. 이전 화면으로 이동
      navigation.goBack();
    } catch (error) {
      console.error('뒤로가기 처리 중 오류:', error);
      // 오류가 발생해도 화면은 이동
      navigation.goBack();
    }
  };
  
  const isFavorite: boolean = favoriteActivities.some(fav => fav.activityId === content.id);
  const CROP_TOP = 100;
  
  const handleToggleFavorite = async () => {
    setIsLoading(true);
    try {
      const { favoriteActivity, unfavoriteActivity, favoriteActivities } = usePlayStore.getState();
      await toggleFavoriteActivity(content.id, {
        favoriteActivity,
        unfavoriteActivity,
        isFavorite: (activityId: number) => favoriteActivities.some(fav => fav.activityId === activityId)
      });
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
      showToast({
        message: '즐겨찾기 상태 변경에 실패했어요.',
        theme: 'dark',
        iconType: 'brokenHeart',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnEnd = async () => {
    try {
      // 진행상황 추적 중지
      stopProgressTracking();
      
      // 액티비티 완료 처리
      await completeActivity(content.id);
      setIsCompleted(true);
      // TODO: 액티비티 완료 처리 후 오는 응답(하트 보상, 효과 3줄)을 받아서 처리하기(효과 3줄은 PlayResult에 prop으로 넘겨서 처리하면 됨)
      
      console.log(`🎉 액티비티 완료 처리: ${content.id}`);
      navigation.navigate('PlayResultScreen');
    } catch (error) {
      console.error('액티비티 완료 처리 실패:', error);
      showToast({
        message: '완료 처리에 실패했어요.',
        theme: 'dark',
        iconType: 'brokenHeart',
      });
    }
  };

  // PlayBar에서 position이 변경될 때 호출되는 콜백
  const handlePositionChange = (position: number) => {
    console.log(`🎵 Position 변경: ${position/1000}초`);
    setLastPosition(position);
  };

  // PlayBar에서 재생이 시작될 때 호출되는 콜백
  const handlePlayStart = () => {
    startProgressTracking();
    console.log(`▶️ 재생 시작`);
  };

  // PlayBar에서 재생이 일시정지될 때 호출되는 콜백
  const handlePlayPause = () => {
    stopProgressTracking();
    console.log(`⏸️ 재생 일시정지`);
  };

  // PlayBar에서 실제 재생 시간이 업데이트될 때 호출되는 콜백
  const handlePlayTimeUpdate = (playTime: number) => {
    setActualPlayTime(playTime);
  };

  // PlayBar에서 플레이어 제어 함수들을 받는 콜백
  const handlePlayerReady = (controls: { pause: () => void; stop: () => void }) => {
    playerControls.current = controls;
    console.log('🎮 플레이어 제어 함수 준비 완료');
  };
  return (
    <>
      <UserRoom cropTop={CROP_TOP}>
        <SubpageHeader onBack={handleBack} style={{transform: [{translateY: CROP_TOP}]}} />
      </UserRoom>
      <PlayBar 
        style={styles.playBar} 
        content={content} 
        handleToggleFavorite={handleToggleFavorite} 
        isFavorite={isFavorite}
        isFavoriteLoading={isLoading}
        onEnd={handleOnEnd}
        onPositionChange={handlePositionChange}
        onPlayStart={handlePlayStart}
        onPlayPause={handlePlayPause}
        onPlayTimeUpdate={handlePlayTimeUpdate}
        initialPosition={lastPosition}
        onPlayerReady={handlePlayerReady}
        />
      </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  playBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default PlayMeditationScreen;