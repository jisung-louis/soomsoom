import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, useWindowDimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import { colors } from '../../../constants/colors';
import { TabView } from 'react-native-tab-view';
import { TabMenu } from '../../../components/common/tabmenu/TabMenu';
import { Activity, getActivityDetail } from '../../../services/contentService';
import { useVisitedActivityStore } from '../../../stores/visitedActivityStore';
import ProgramList from '../../../components/tabs/play/common/ProgramList';
import { catIconMap } from '../../../utils/iconMap';
import { syongsyongTypography, typography } from '../../../constants/typography';
import { useScreenAnalytics } from '../../../hooks/useScreenAnalytics';

const PlayHistoryScreen = () => {
  useScreenAnalytics('PlayHistoryScreen');

  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  const handleBack = () => {
    navigation.goBack();
  };
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'history', title: '히스토리' },
  ]);


  const [historyActivitiesList, setHistoryActivitiesList] = useState<Activity[]>([]);
  const visits = useVisitedActivityStore(state => state.visits);

  const fetchHistoryActivities = async () => {
    // rear → front 순서로 최신부터 보여주기 위해 뒤에서부터 순회
    const ids = visits.map(v => v.activityId);
    const orderedIds = [...ids];
    // rear(마지막 요소)가 최신이므로 뒤에서 앞으로
    const reversed = orderedIds.reverse();
    // 상세 병렬 로드
    console.log('🔍 상세 병렬 로드:', reversed);
    const results = await Promise.allSettled(reversed.map(id => getActivityDetail(id)));
    const list: Activity[] = [];
    results.forEach((r) => { if (r.status === 'fulfilled' && r.value) list.push(r.value); });
    setHistoryActivitiesList(list);
  };

  useEffect(() => {
    fetchHistoryActivities();
  }, [visits]);

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'history':
        return renderHistoryTab();
      default:
        return null;
    }
  };

  const renderHistoryTab = () => {
    return (
      <View style={styles.contentContainer}>
        {historyActivitiesList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <catIconMap.cry />
            <Text style={styles.emptyText}>이전에 진행한{'\n'}호흡/명상이 없어요.</Text>
          </View>
        ) : (
          <FlatList
            data={historyActivitiesList}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{gap: 10, paddingBottom: 50}}
            renderItem={({ item }) => (
              <ProgramList programData={[item]} />
            )}
          />
        )}
      </View>
    );
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
            tabs={['히스토리']}
            selectedTab={routes[index].title as '히스토리'}
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

export default PlayHistoryScreen;

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
});