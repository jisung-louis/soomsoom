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
import { Activity } from '../../../services/contentService';
import { usePlayStore } from '../../../stores/playStore';
import { Instructor } from '../../../services/instructorService';
import { useFavorites } from '../../../hooks/useFavorites';
import { useToast } from '../../../contexts/ToastContext';
import { catIconMap } from '../../../utils/iconMap';
import { syongsyongTypography } from '../../../constants/typography';

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

  const { fetchFavoriteActivitiesList, fetchFollowedInstructorsList, toggleFollow } = useFavorites();

  const fetchFavorite = async () => {
    try {
      const activities = await fetchFavoriteActivitiesList();
      setFavoriteActivitiesList(activities);
    } catch (e) {
      showToast({ message: '네트워크 연결을 확인한 뒤 다시 시도해주세요.', iconType: 'alarm', theme: 'dark' });
    }
  };

  const fetchFollowed = async () => {
    try {
      const list = await fetchFollowedInstructorsList();
      setFollowedInstructorsList(list);
    } catch (e) {
      showToast({ message: '네트워크 연결을 확인한 뒤 다시 시도해주세요.', iconType: 'alarm', theme: 'dark' });
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
            <catIconMap.stack />
            <Text style={styles.emptyText}>즐겨찾는 프로그램을{'\n'}추가해보세요!</Text>
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
            <catIconMap.cry />
            <Text style={styles.emptyText}>팔로우한 선생님이 없어요.</Text>
          </View>
        ) : (
          <FlatList
            data={followedInstructorsList}
            keyExtractor={(item) => item.instructorId.toString()}
            contentContainerStyle={{gap: 16, paddingBottom: 50}}
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
                    await toggleFollow(instructorId);
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
    gap: 20,
  },
  emptyText: {
    ...syongsyongTypography.title6,
    textAlign: 'center',
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