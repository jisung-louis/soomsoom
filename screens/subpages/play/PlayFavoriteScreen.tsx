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
import FollowTeacherList from '../../../components/tabs/play/PlayFavoriteScreen/FollowTeacherList';
import { TabView, SceneMap } from 'react-native-tab-view';
import { TeacherData, contentData, teachersData } from '../../../data/playContentData';
import { usePlayStore } from '../../../stores/playStore';

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
    followedTeachers, 
    toggleFollowTeacher, 
    isFollowingTeacher,
    initializeFavorites,
    initializeFollowedTeachers 
  } = usePlayStore();

  // 초기 데이터 로드 (실제로는 앱 시작 시 한 번만 호출)
  useEffect(() => {
    // TODO: 백엔드에서 초기 데이터를 가져와서 초기화
    // initializeFavorites(initialFavorites);
    // initializeFollowedTeachers(initialFollowedTeachers);
  }, []);

  // 즐겨찾기 데이터 필터링
  const filteredFavoriteContent = contentData.filter((content) => 
    favoriteContents.some((favorite) => favorite.contentId === content.id)
  );

  // 팔로우한 선생님 데이터 필터링
  const followedTeacherIds = followedTeachers.flatMap(followed => followed.teacherId as number[]);
  // local state for followed teachers and refreshing
  const [localFollowedTeachers, setLocalFollowedTeachers] = useState<TeacherData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const followedIds = followedTeachers.flatMap((t) => t.teacherId as number[]);
    const filtered = teachersData.filter((teacher) =>
      followedIds.includes(teacher.id)
    );
    setLocalFollowedTeachers(filtered);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    const followedIds = followedTeachers.flatMap((t) => t.teacherId as number[]);
    const filtered = teachersData.filter((teacher) =>
      followedIds.includes(teacher.id)
    );
    setLocalFollowedTeachers(filtered);
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
              <ProgramList ProgramData={[item]} />
            )}
          />
        )}
      </View>
    );
  };
  const renderFollowTab = () => {
    return (
      <View style={styles.contentContainer}>
        {localFollowedTeachers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../assets/images/play/playFavoriteScreen/empty_follow_image.png')}
              style={styles.emptyFollowImage}
            />
          </View>
        ) : (
          <FlatList
            data={localFollowedTeachers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <FollowTeacherList
                followTeacherData={[item]}
                followedIds={followedTeacherIds}
                onToggleFollow={toggleFollowTeacher}
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