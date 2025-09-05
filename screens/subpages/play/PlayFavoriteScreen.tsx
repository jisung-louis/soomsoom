import React, { useState, useEffect } from 'react';
import { View, Text, Image, useWindowDimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../constants/colors';
import { StyleSheet } from 'react-native';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import { TabMenu } from '../../../components/common/tabmenu/TabMenu';
import ProgramList from '../../../components/tabs/play/common/ProgramList';
import FollowInstructorList from '../../../components/tabs/play/PlayFavoriteScreen/FollowInstructorList';
import { TabView, SceneMap } from 'react-native-tab-view';
import { Activity, getActivityDetail, getUserFavoriteActivities } from '../../../services/contentService';
import { usePlayStore } from '../../../stores/playStore';
import { toggleFollowInstructor, getInstructorDetail, getFollowedInstructors, Instructor } from '../../../services/instructorService';
import { useToast } from '../../../contexts/ToastContext';

const normalizeImageSource = (url?: string | null) =>
  url ? { uri: url } : require('../../../assets/images/play/playFavoriteScreen/default_image_1.png');

const PlayFavoriteScreen = () => {
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  const handleBack = () => {
    navigation.goBack();
  };

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'favorite', title: '즐겨찾기' },
    { key: 'follow', title: '팔로우' },
  ]);

  // zustand store 사용
  const { 
    favoriteActivities, 
    followedInstructors
  } = usePlayStore();


  const { showToast } = useToast();
  // 팔로우한 강사 상세 정보 상태 관리
  const [followedInstructorsList, setFollowedInstructorsList] = useState<Instructor[]>([]);
  // 즐겨찾기 액티비티 상태 관리
  const [favoriteActivitiesList, setFavoriteActivitiesList] = useState<Activity[]>([]);

  // 새로고침 상태 관리
  const [followRefreshing, setFollowRefreshing] = useState(false);  

  const fetchFavorite = async () => {
    try {
      if (__DEV__) {
        // 개발 환경: Store에서 직접 즐겨찾기 상태를 가져와서 상세 정보 조회
        const activities = await Promise.all(
          favoriteActivities.map(async (fav) => {
            try {
              const activityDetail = await getActivityDetail(fav.activityId);
              return activityDetail;
            } catch (error) {
              console.error(`액티비티 ${fav.activityId} 상세 정보 로드 실패:`, error);
              // 상세 정보 로드 실패 시 기본 정보만으로 Activity 객체 생성
              return {
                id: fav.activityId,
                title: '알 수 없음',
                type: 'MEDITATION',
                thumbnailImageUrl: null,
                descriptions: ['상세 정보를 불러올 수 없습니다.'],
                author: { id: 0, name: '알 수 없음', bio: '', profileImageUrl: null },
                narrator: { id: 0, name: '알 수 없음', bio: '', profileImageUrl: null },
                durationInSeconds: 0,
                audioUrl: null,
                timeline: [],
                isFavorited: true,
              } as Activity;
            }
          })
        );
        
        setFavoriteActivitiesList(activities);
      } else {
        // 프로덕션 환경: 서버에서 가져와서 store 동기화 후 조회
        const response = await getUserFavoriteActivities({ page: 1, size: 12, sort: 'createdAt,desc' });
        
        // Store 동기화
        usePlayStore.setState({
          favoriteActivities: response.content.map(fav => ({ activityId: fav.activityId }))
        });
        
        // 상세 정보 조회
        const activities = await Promise.all(
          response.content.map(async (fav) => {
            try {
              const activityDetail = await getActivityDetail(fav.activityId);
              return activityDetail;
            } catch (error) {
              console.error(`액티비티 ${fav.activityId} 상세 정보 로드 실패:`, error);
              // 상세 정보 로드 실패 시 기본 정보만으로 Activity 객체 생성
              return {
                id: fav.activityId,
                title: fav.title,
                type: fav.type,
                thumbnailImageUrl: fav.thumbnailImageUrl,
                descriptions: ['상세 정보를 불러올 수 없습니다.'],
                author: { id: 0, name: '알 수 없음', bio: '', profileImageUrl: null },
                narrator: { id: 0, name: '알 수 없음', bio: '', profileImageUrl: null },
                durationInSeconds: fav.durationInSeconds,
                audioUrl: null,
                timeline: [],
                isFavorited: true,
              } as Activity;
            }
          })
        );
        
        setFavoriteActivitiesList(activities);
      }
    } catch (e) {
      showToast({
        message: '네트워크 연결을 확인한 뒤 다시 시도해주세요.',
        iconType: 'alarm',
        theme: 'dark',
      });
    }
  };

  const fetchFollowed = async () => {
    try {
      if (__DEV__) {
        // 개발 환경: Store에서 팔로우한 강사 ID 목록을 가져와서 상세 정보 조회
        const instructorDetails = await Promise.all(
          followedInstructorsList.map(async (followed) => {
            try {
              const instructorDetail = await getInstructorDetail(followed.instructorId);
              return instructorDetail;
            } catch (error) {
              console.error(`강사 ${followed.instructorId} 상세 정보 로드 실패:`, error);
              // 상세 정보 로드 실패 시 기본 정보만으로 Instructor 객체 생성
              return {
                instructorId: followed.instructorId,
                name: '알 수 없음',
                bio: '',
                profileImageUrl: null,
                isFollowing: true,
                createdAt: '',
                modifiedAt: '',
                deletedAt: null,
              } as Instructor;
            }
          })
        );
        
        setFollowedInstructorsList(instructorDetails);
      } else {
        // 프로덕션 환경: 서버에서 가져와서 store 동기화 후 조회
        const response = await getFollowedInstructors({ page: 1, size: 12, sort: 'createdAt,desc' });
        
        // Store 동기화
        usePlayStore.setState({
          followedInstructors: response.content.map(inst => ({ instructorId: inst.instructorId }))
        });
        
        // 상세 정보 조회
        const instructorDetails = await Promise.all(
          response.content.map(async (inst) => {
            try {
              const instructorDetail = await getInstructorDetail(inst.instructorId);
              return instructorDetail;
            } catch (error) {
              console.error(`강사 ${inst.instructorId} 상세 정보 로드 실패:`, error);
              // 상세 정보 로드 실패 시 기본 정보만으로 Instructor 객체 생성
              return {
                instructorId: inst.instructorId,
                name: inst.name,
                bio: '',
                profileImageUrl: inst.profileImageUrl,
                isFollowing: true,
                createdAt: '',
                modifiedAt: '',
                deletedAt: null,
              } as Instructor;
            }
          })
        );
        
        setFollowedInstructorsList(instructorDetails);
      }
    } catch (e) {
      showToast({
        message: '네트워크 연결을 확인한 뒤 다시 시도해주세요.',
        iconType: 'alarm',
        theme: 'dark',
      });
    }
  };

  useEffect(() => {
    fetchFavorite();
    fetchFollowed(); //팔로우 fetch
  }, []);

  const onRefresh = async () => {
    setFollowRefreshing(true);
    await fetchFollowed();
    setFollowRefreshing(false);
  };

  const renderFavoriteTab = () => {
    return (
      <View style={styles.contentContainer}>
        {favoriteActivitiesList.length === 0 ? ( // 즐겨찾기 중인 프로그램이 하나도 없을 경우
          <View style={styles.emptyContainer}>
            <Image source={require('../../../assets/images/play/playFavoriteScreen/empty_favorite_image.png')} style={styles.emptyFavoriteImage} />{/* TODO: 컴포넌트로 리팩터링하기 */}
          </View>
        ) : ( 
          <FlatList
            data={favoriteActivitiesList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ProgramList programData={[item]} />
            )}
          />
        )}
      </View>
    );
  };
  const renderFollowTab = () => {
    return (
      <View style={styles.contentContainer}>
        {followedInstructorsList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../assets/images/play/playFavoriteScreen/empty_follow_image.png')}
              style={styles.emptyFollowImage}
            />
          </View>
        ) : (
          <FlatList
            data={followedInstructorsList}
            keyExtractor={(item) => item.instructorId.toString()}
            renderItem={({ item }) => (
              <FollowInstructorList
                followInstructorData={[{
                  id: item.instructorId,
                  name: item.name,
                  profileImage: normalizeImageSource(item.profileImageUrl),
                  isFollowing: followedInstructors.some(inst => inst.instructorId === item.instructorId)
                }]}
                onToggleFollow={async (instructorId: number) => {
                  try {
                    // 서비스 레이어에서 API 호출과 store 동기화를 모두 처리
                    const { followInstructor, unfollowInstructor } = usePlayStore.getState();
                    await toggleFollowInstructor(instructorId, {
                      followInstructor,
                      unfollowInstructor,
                      isFollowingInstructor: (id) => followedInstructors.some(inst => inst.instructorId === id)
                    });
                    // 팔로우 상태 변경 후 목록 새로고침
                    await fetchFollowed();
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
            )}
            refreshing={followRefreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    );
  };

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'favorite':
        return renderFavoriteTab();
      case 'follow':
        return renderFollowTab();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={() => (
          <TabMenu
            tabs={['즐겨찾기', '팔로우']}
            selectedTab={routes[index].title as '즐겨찾기' | '팔로우'}
            onPress={(tab) => {
              const i = routes.findIndex(r => r.title === tab);
              if (i !== -1) setIndex(i);
            }}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default PlayFavoriteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 30,
  },
  favoriteActivityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  favoriteActivityIcon: {
    width: 40,
    height: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFavoriteImage: {
    width: 226,
    height: 160,
  },
  emptyFollowImage: {
    width: 179,
    height: 138,
  },
});