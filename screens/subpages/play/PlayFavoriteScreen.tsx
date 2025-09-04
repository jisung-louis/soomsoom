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
import { contentData } from '../../../data/playContentData';
import { usePlayStore } from '../../../stores/playStore';
import { getFollowedInstructors, FollowedInstructorSummary } from '../../../services/instructorService';
import { useToast } from '../../../contexts/ToastContext';

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
    followedInstructorIds, 
    toggleFollowInstructor, 
    isFollowingInstructor,
    initializeFavorites,
    initializeFollowedInstructors 
  } = usePlayStore();

  const { showToast } = useToast();

  // 초기 데이터 로드 (실제로는 앱 시작 시 한 번만 호출)
  useEffect(() => {
    // TODO: 백엔드에서 초기 데이터를 가져와서 초기화
    // initializeFavorites(initialFavorites);
    // initializeFollowedInstructors(initialFollowedInstructors);
  }, []);

  // 즐겨찾기 데이터 필터링
  const filteredFavoriteContent = contentData.filter((content) => 
    favoriteContents.some((favorite) => favorite.contentId === content.id)
  );

  // 팔로우한 강사 목록: 서버 데이터 사용
  const [localFollowedInstructors, setLocalFollowedInstructors] = useState<FollowedInstructorSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFollowed = async () => {
    try {
      const res = await getFollowedInstructors({ page: 1, size: 12, sort: 'createdAt,desc' });
      setLocalFollowedInstructors(res.content);
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
        {localFollowedInstructors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../assets/images/play/playFavoriteScreen/empty_follow_image.png')}
              style={styles.emptyFollowImage}
            />
          </View>
        ) : (
          <FlatList
            data={localFollowedInstructors}
            keyExtractor={(item) => item.instructorId.toString()}
            renderItem={({ item }) => (
              <FollowInstructorList
                followInstructorData={[{
                  id: item.instructorId,
                  name: item.name,
                  title: '',
                  profileImage: item.profileImageUrl ? { uri: item.profileImageUrl } : require('../../../assets/images/play/playFavoriteScreen/default_image_1.png')
                }]}
                followedIds={followedInstructorIds}
                onToggleFollow={toggleFollowInstructor}
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