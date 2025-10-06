import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useVisitedActivityStore } from '../../../stores/visitedActivityStore';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import FavoriteIcon from '../../../assets/icons/common/star.svg';
import { typography } from '../../../constants/typography';
import PersonIcon from '../../../assets/icons/common/Person.svg';
import AudioIcon from '../../../assets/icons/common/Vol.svg';
import { mockInstructorsData } from '../../../data/playContentData';
import ToastView from '../../../components/common/toast/ToastView';
import { Button } from '../../../components/common/buttons/Button';
import { usePlayStore } from '../../../stores/playStore';
import AuthorInfo from '../../../components/tabs/play/common/AuthorInfo';
import { toggleFavoriteActivity } from '../../../services/contentService';
import { useToast } from '../../../contexts/ToastContext';
import FavoriteButton from '../../../components/common/buttons/FavoriteButton';
import { getActivityProgress } from '../../../services/activityLogService';
import CustomAlert from '../../../components/common/alert/CustomAlert';
import { getActivityDetail, Activity } from '../../../services/contentService';
  
const PlayDetailScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  const route = useRoute<RouteProp<PlayStackParamList, 'PlayDetailScreen'>>();
  const { activityId, content: initialContent } = route.params;
  const { favoriteActivities } = usePlayStore();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<Activity | null>(initialContent || null);
  
  // CustomAlert 상태
  const [showResumeAlert, setShowResumeAlert] = useState(false);
  const [resumeProgress, setResumeProgress] = useState<number | null>(null);

  // 액티비티 상세 정보 조회 (initialContent가 없을 때만)
  useEffect(() => {
    // 이미 content가 있으면 서버 조회 생략
    // if (initialContent) {
    //   console.log('🔍 이미 content가 있으면 서버 조회 생략');
    //   return;
    // }

    const loadActivityDetail = async () => {
      try {
        setIsLoading(true);
        const activityDetail = await getActivityDetail(activityId);
        console.log('🔍 액티비티 상세 정보:', JSON.stringify(activityDetail, null, 2));
        setContent(activityDetail);
      } catch (error) {
        console.error('액티비티 상세 정보 조회 실패:', error);
        showToast({
          message: '액티비티 정보를 불러오는데 실패했습니다.',
          theme: 'dark',
          iconType: 'brokenHeart',
        });
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    loadActivityDetail();
  }, [activityId, initialContent, showToast, navigation]);

  const handleBack = () => {
    navigation.goBack();
  };
  
  const isFavorite = content ? favoriteActivities.some(fav => fav.activityId === content.id) : false;
  
  const handleToggleFavorite = async () => {
    if (!content) return;
    
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

  // 호흡 액티비티 시작
  const handleStartBreathing = async () => {
    if (!content) return;
    try {
      // 방문 기록: 재생 진입 시점에 방문으로 기록
      useVisitedActivityStore.getState().addVisited(content.id);
    } catch {}
    navigation.navigate('PlayBreathScreen', { content: content });
  };

  // 명상 액티비티 시작
  // 명상 액티비티 시작 시 이전 진행상황 확인 및 이어듣기 팝업
  const handleStartMeditation = async () => {
    if (!content) return;
    
    try {
      // 명상 타입이 아니면 바로 시작
      if (content.type !== 'MEDITATION') {
        try { useVisitedActivityStore.getState().addVisited(content.id); } catch {}
        navigation.navigate('PlayMeditationScreen', { content });
        return;
      }

      // 이전 진행상황 조회
      const progress = await getActivityProgress(content.id);
      
      if (progress && progress.progressSeconds > 0) {
        // 이전 기록이 있는 경우 CustomAlert 표시
        setResumeProgress(progress.progressSeconds);
        setShowResumeAlert(true);
      } else {
        // 이전 기록이 없는 경우 바로 시작
        try { useVisitedActivityStore.getState().addVisited(content.id); } catch {}
        navigation.navigate('PlayMeditationScreen', { content });
      }
    } catch (error) {
      console.error('이전 진행상황 조회 실패:', error);
      // 에러가 발생해도 바로 시작
      try { useVisitedActivityStore.getState().addVisited(content.id); } catch {}
      navigation.navigate('PlayMeditationScreen', { content });
    }
  };

  // 이어듣기 알림 버튼 핸들러
  const handleResumeFromStart = () => {
    if (!content) return;
    setShowResumeAlert(false);
    navigation.navigate('PlayMeditationScreen', { 
      content,
      initialPosition: 0  // 처음부터 시작하도록 명시적으로 0 전달
    });
  };

  const handleResumeFromProgress = () => {
    if (!content) return;
    setShowResumeAlert(false);
    if (resumeProgress !== null) {
      navigation.navigate('PlayMeditationScreen', { 
        content,
        initialPosition: resumeProgress 
      });
    }
  };

  const handleCloseResumeAlert = () => {
    setShowResumeAlert(false);
    setResumeProgress(null);
  };

  // 컨텐츠가 없을 때만 로딩 화면 표시 (작은 액션 로딩으로 화면 전체를 교체하지 않음)
  if (!content) {
    return (
      <SafeAreaView style={styles.container}>
        <SubpageHeader onBack={handleBack} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 200}}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: content.thumbnailImageUrl || require('../../../assets/images/play/playFavoriteScreen/default_image_1.png')}} style={styles.image} resizeMode='cover' />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.contentHeader}>
            <View style={styles.contentHeaderTitleContainer}>
              <Text style={styles.contentHeaderTitle}>{content.title}</Text>
              {/* <TouchableOpacity onPress={handleToggleFavorite}>
                <FavoriteIcon 
                  width={32} 
                  height={32} 
                  color={isFavorite ? colors.primary300 : colors.grayScale500} 
                />
              </TouchableOpacity> */}
              <FavoriteButton onPress={handleToggleFavorite} isFavorite={isFavorite} isLoading={isLoading} />
            </View>
            <View style={styles.contentInfoContainer}>
              <AuthorInfo
                instructorName={content.author.name}
                guide={content.narrator.name}
                onPressInstructor={() => {navigation.navigate('PlayInstructorDetailScreen', { instructorId: content.author.id })}}
                onPressGuide={() => {navigation.navigate('PlayInstructorDetailScreen', { instructorId: content.narrator.id })}}
              />
              <View style={styles.instructorAndAudioContainer}>
                <AudioIcon width={24} height={24} color={colors.grayScale600} />
                <View>
                  {/* <Text style={styles.contentInfo}>{content.type} • {Math.floor(content.durationInSeconds / 60)}min</Text> */}
                  <Text style={styles.contentInfo}>마음운동 • {Math.floor(content.durationInSeconds / 60)}min</Text>
                </View>
              </View>
            </View>
          </View>
          <Text style={styles.contentDescription}>{Array.isArray(content.descriptions) ? content.descriptions.join('\n') : content.descriptions}</Text>
        </View>
      </ScrollView>
      
      {/* 이어듣기 CustomAlert */}
      <CustomAlert
        visible={showResumeAlert}
        message="이전에 들었던 기록이 있어요!"
        subMessage={
          resumeProgress !== null 
            ? `${Math.floor(resumeProgress / 60)}분 ${(resumeProgress % 60).toFixed(0)}초 지점부터 이어 들을까요?`
            : '이어 들을까요?'
        }
        buttons={[
          {
            text: '처음부터',
            onPress: handleResumeFromStart,
            buttonVariants: 'default'
          },
          {
            text: '이어듣기',
            onPress: handleResumeFromProgress,
            buttonVariants: 'active'
          }
        ]}
        onClose={handleCloseResumeAlert}
      />
    </SafeAreaView>
          <View style={styles.buttonContainer}>
            <ToastView
              message='잠깐! 시작전에 소리를 키워주세요!'
              theme='light'
              iconType='help'
              textStyle={styles.toastText}
              iconSize={24}
              style={styles.toastContainer}
            />
            <Button
              title='마음운동 시작하기'
              variant='active'
              size='large'
              textStyle={{...typography.heading9}}
              onPress={() => {
                content.type === 'BREATHING' ? handleStartBreathing() : handleStartMeditation()
              }}
              style={styles.button}
            />
          </View>
    </>
  );
};

export default PlayDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  imageContainer: {
    marginHorizontal: 20,
    overflow: 'hidden',
    height: 193,
    borderRadius: radius.r16,
    marginTop: 30,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    paddingHorizontal: 20,
    gap: 30,
    marginTop: 20,
  },
  contentHeader: {
    gap:10,
  },
  contentHeaderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentHeaderTitle: {
    ...typography.heading7,
    color: colors.grayScale900,
  },
  contentInfoContainer: {
    gap: 2,
  },
  contentInfo: {
    ...typography.body5,
    color: colors.grayScale400,
  },
  instructorAndAudioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentBody: {
    flex: 1,
  },
  contentDescription: {
    ...typography.body2,
    color: colors.grayScale500,
  },
  toastContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    width: 'auto',
    height: 'auto',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 50,
  },
  button: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    color: colors.grayScale600,
  },
  toastText: {
    ...typography.body5,
  },
});