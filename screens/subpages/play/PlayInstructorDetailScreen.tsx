import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { radius } from '../../../constants/radius';
import { Button } from '../../../components/common/buttons/Button';
import { Surface } from '../../../components/common/surface/Surface';
import ProgramList from '../../../components/tabs/play/common/ProgramList';
import { usePlayStore } from '../../../stores/playStore';
import { useToast } from '../../../contexts/ToastContext';
import { getInstructorDetail, getInstructorActivities, toggleFollowInstructor, Instructor } from '../../../services/instructorService';
import LoadingSpinner from '../../../components/common/loading/LoadingSpinner';
import ErrorMessage from '../../../components/common/error/ErrorMessage';
import { getActivityDetail, Activity } from '../../../services/contentService';

const PlayInstructorDetailScreen: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
    const route = useRoute<RouteProp<PlayStackParamList, 'PlayInstructorDetailScreen'>>();
    const { instructorId } = route.params;
    // Store는 사용하지 않고 Service Layer만 사용
    const { showToast } = useToast();
    const { followedInstructors } = usePlayStore();

    // 상태 관리
    const [instructor, setInstructor] = useState<Instructor | null>(null);
    const [representativeContentData, setRepresentativeContentData] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleBack = () => {
      navigation.goBack();
    };

    // 강사 정보와 대표 강의 데이터 로드
    useEffect(() => {
      const loadInstructorData = async () => {
        try {
          setIsLoading(true);
          setError(null);

          // 서비스 레이어에서 __DEV__ 분기 처리
          const [instructorData, activitiesData] = await Promise.all([
            getInstructorDetail(instructorId),
            getInstructorActivities(instructorId, { page: 1, size: 10 })
          ]);

          // UI에서 실제 팔로우 상태를 확인하여 설정
          const isFollowing = followedInstructors.some(inst => inst.instructorId === instructorId);
          setInstructor({ ...instructorData, isFollowing });

          // 각 액티비티의 상세 정보를 가져와서 representativeContentData 설정
          const activityDetails = await Promise.all(
            activitiesData.content.map(activity => 
              getActivityDetail(activity.activityId)
            )
          );
          setRepresentativeContentData(activityDetails);
        } catch (err) {
          console.error('강사 데이터 로드 실패:', err);
          setError('강사 정보를 불러오는데 실패했습니다.');
          showToast({
            message: '강사 정보를 불러오지 못했어요.',
            theme: 'dark',
            iconType: 'brokenHeart',
          });
        } finally {
          setIsLoading(false);
        }
      };

      loadInstructorData();
    }, [instructorId, showToast]);

    // 팔로우 상태 변경 시 instructor 상태 업데이트
    useEffect(() => {
      if (instructor) {
        const isFollowing = followedInstructors.some(inst => inst.instructorId === instructorId);
        if (instructor.isFollowing !== isFollowing) {
          setInstructor(prev => prev ? { ...prev, isFollowing } : null);
        }
      }
    }, [followedInstructors, instructorId]);


  // 로딩 중
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <SubpageHeader onBack={handleBack} />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <SubpageHeader onBack={handleBack} />
        <ErrorMessage message={error} onRetry={() => {
          // 재시도 로직
          setError(null);
          setIsLoading(true);
          // useEffect가 다시 실행되도록 instructorId 변경 트리거
        }} />
      </SafeAreaView>
    );
  }

  // 강사 정보가 없는 경우
  if (!instructor) {
    return (
      <SafeAreaView style={styles.container}>
        <SubpageHeader onBack={handleBack} />
        <ErrorMessage message="강사 정보를 찾을 수 없습니다." onRetry={handleBack} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} />
      <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 100}}>
      <View style={styles.contentContainer}>
        <View style={styles.contentHeader}>
            {instructor.profileImageUrl ? (
              <Image 
                source={__DEV__ ? instructor.profileImageUrl as any : { uri: instructor.profileImageUrl }} 
                style={styles.contentHeaderTitleImage} 
              />
            ) : (
              <View style={[styles.contentHeaderTitleImage, { backgroundColor: colors.grayScale200 }]} />
            )}
            <Text style={styles.contentHeaderTitle}>{instructor.name}</Text>
        </View>
        <Text style={styles.bio}>{instructor.bio}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button 
            title={instructor.isFollowing ? '팔로잉' : '팔로우'}
            icon={instructor.isFollowing ? 'check' : undefined}
            variant={instructor.isFollowing ? 'secondary' : 'active'}  
            size='large'
            onPress={async () => {
                try {
                  const wasFollowing = instructor.isFollowing;
                  
                  // 서비스 레이어에서 API 호출과 store 동기화를 모두 처리
                  const { followInstructor, unfollowInstructor } = usePlayStore.getState();
                  await toggleFollowInstructor(instructorId, {
                    followInstructor,
                    unfollowInstructor,
                    isFollowingInstructor: (id) => followedInstructors.some(inst => inst.instructorId === id)
                  });
                  
                  // 팔로우 상태는 useEffect에서 자동으로 업데이트됨
                  
                  showToast({
                    message: wasFollowing ? '선생님 팔로우를 취소했어요' : '새로운 영상이 올라오면, 먼저 알려드릴게요!',
                    iconType: wasFollowing ? 'brokenHeart' : 'alarm',
                    theme: 'dark',
                  });
                } catch (error) {
                  console.error('팔로우 상태 변경 실패:', error);
                  showToast({
                    message: '팔로우 상태 변경에 실패했어요.',
                    theme: 'dark',
                    iconType: 'brokenHeart',
                  });
                }
            }}
        />
      </View>
      <Surface style={{marginTop: 50}}/>
      <View style={styles.representativeContentContainer}>
        <Text style={styles.representativeContentTitle}>대표 프로그램</Text>
        <View style={styles.representativeContentList}>
          <View style={styles.representativeContentItem}>
            {representativeContentData.length > 0 ? (
              <ProgramList programData={representativeContentData} />
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>아직 등록된 프로그램이 없어요</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 30,
    gap: 20,
  },
  contentHeader: {
    alignItems: 'center',
    gap: 16,
  },
  contentHeaderTitle: {
    ...typography.heading7,
    color: colors.grayScale900,
  },
  contentHeaderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
  },
  contentHeaderTitleImage: {
    width: 140,
    height: 140,
    borderRadius: radius.max,
  },
  bio: {
    ...typography.body2,
    color: colors.grayScale500,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    alignItems: 'center',
  },
  representativeContentContainer: {
    paddingHorizontal: 20,
    marginTop: 50,
    gap: 20,
  },
  representativeContentTitle: {
    ...typography.heading9,
    color: colors.grayScale900,
  },
  representativeContentList: {
    gap: 20,
  },
  representativeContentItem: {
    flex: 1,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    ...typography.body3,
    color: colors.grayScale400,
  },
});

export default PlayInstructorDetailScreen;