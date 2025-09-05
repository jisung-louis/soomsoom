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
import { mockContentData } from '../../../data/playContentData';
import { usePlayStore } from '../../../stores/playStore';
import { getFollowedInstructors, toggleFollowInstructor, isFollowingInstructor, FollowedInstructorSummary } from '../../../services/instructorService';
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
    favoriteContents, 
    followedInstructors
  } = usePlayStore();

  const { showToast } = useToast();


  // 즐겨찾기 데이터 필터링
  const filteredFavoriteContent = mockContentData.filter((content) => 
    favoriteContents.some((favorite) => favorite.contentId === content.id)
  );

  // 새로고침 상태 관리
  const [refreshing, setRefreshing] = useState(false);

  const fetchFollowed = async () => {
    try {
      // Service Layer에서 환경 분기 처리
      await getFollowedInstructors({ page: 1, size: 12, sort: 'createdAt,desc' });
    } catch (e) {
      showToast({
        message: '네트워크 연결을 확인한 뒤 다시 시도해주세요.',
        iconType: 'alarm',
        theme: 'dark',
      });
    }
  };

  useEffect(() => {
    fetchFollowed();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFollowed();
    setRefreshing(false);
  };

  const renderFavoriteTab = () => {
    return (
      <View style={styles.contentContainer}>
        {filteredFavoriteContent.length === 0 ? ( // 즐겨찾기 중인 프로그램이 하나도 없을 경우
          <View style={styles.emptyContainer}>
            <Image source={require('../../../assets/images/play/playFavoriteScreen/empty_favorite_image.png')} style={styles.emptyFavoriteImage} />{/* TODO: 컴포넌트로 리팩터링하기 */}
          </View>
        ) : ( 
          <FlatList
            data={filteredFavoriteContent}
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
        {followedInstructors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../assets/images/play/playFavoriteScreen/empty_follow_image.png')}
              style={styles.emptyFollowImage}
            />
          </View>
        ) : (
          <FlatList
            data={followedInstructors}
            keyExtractor={(item) => item.instructorId.toString()}
            renderItem={({ item }) => (
              <FollowInstructorList
                followInstructorData={[{
                  id: item.instructorId,
                  name: item.name,
                  profileImage: normalizeImageSource(item.profileImageUrl),
                  isFollowing: isFollowingInstructor(item.instructorId)
                }]}
                onToggleFollow={async (instructorId: number) => {
                  try {
                    // 서비스 레이어에서 API 호출과 store 동기화를 모두 처리
                    await toggleFollowInstructor(instructorId);
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
            refreshing={refreshing}
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
  favoriteContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  favoriteContentIcon: {
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