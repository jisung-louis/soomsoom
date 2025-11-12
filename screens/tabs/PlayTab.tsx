import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlayHeader from '../../components/tabs/play/PlayHeader';
import PlayBanner from '../../components/tabs/play/PlayBanner';
import PlayShortActivityList from '../../components/tabs/play/PlayShortActivityList';
import PlayRecommendedContentList from '../../components/tabs/play/PlayRecommendedContentList';
import PlayCategoryList from '../../components/tabs/play/PlayCategoryList';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../navigations/tabs/PlayStackNavigator';
import { colors } from '../../constants/colors';
import { getActivitiesByType, Activity, getActivities, getActivitiesByCategory } from '../../services/contentService';
import { getActiveBanners } from '../../services/bannerService';
import { Banner } from '../../types';
import { ButtonSmall } from '../../components/common/buttons/ButtonSmall';
import { useNotificationQueueProcessor } from '../../hooks/useNotificationQueueProcessor';
import { useScreenAnalytics } from '../../hooks/useScreenAnalytics';

const PlayTab = () => {
  useScreenAnalytics('PlayTab');

  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  
  // 알림 큐 처리 (탭 포커스 시 큐에 있는 알림을 순차적으로 표시)
  useNotificationQueueProcessor();
  
  // 데이터 상태 관리
  const [shortActivityData, setShortActivityData] = useState<Activity[]>([]);
  const [recommendedActivityData, setRecommendedActivityData] = useState<Activity[]>([]);
  const [bannerData, setBannerData] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // 병렬로 데이터 로딩
        const [breathingActivitiesResponse, meditationActivitiesResponse, bannersResponse] = await Promise.all([
          getActivitiesByType('BREATHING'), // 호흡 타입 액티비티
          getActivitiesByType('MEDITATION'), // 명상 타입 액티비티
          getActiveBanners(), // 활성 배너 목록 가져오기
        ]);
        // BREATHING과 MEDITATION 액티비티를 합쳐서 랜덤으로 5개 선택
        const combinedActivities = [...breathingActivitiesResponse.content, ...meditationActivitiesResponse.content];
        const shuffled = combinedActivities.sort(() => 0.5 - Math.random());
        const randomFive = shuffled.slice(0, 5);

        // const GET_ALL_ACTIVITIES = await getActivities({ page: 1, size: 1000 });
        // console.log('🔍 모든 액티비티:', JSON.stringify(GET_ALL_ACTIVITIES.content, null, 2));
        
        setShortActivityData(breathingActivitiesResponse.content); // 회복을 위한 짧은 5분!
        console.log('🔍 회복을 위한 짧은 5분:', JSON.stringify(breathingActivitiesResponse.content, null, 2));
        setRecommendedActivityData(randomFive); // 나를 위한 추천 콘텐츠
        setBannerData(bannersResponse); // 모든 배너 표시
        console.log('🔍 배너 데이터:', JSON.stringify(bannersResponse, null, 2));
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  
  const onCategoryPress = (title: string) => {
    navigation.navigate('PlayActivityListScreen', { title, content: [] });
  };
  const onShortActivityPress = () => {
    navigation.navigate('PlayActivityListScreen', { title: 'SHORT', content: shortActivityData });
  };
  const onRecommendedPress = () => {
    navigation.navigate('PlayActivityListScreen', { title: 'RECOMMENDED', content: recommendedActivityData });
  };
  const onBannerPress = (banner: Banner) => {
    if (banner?.linkedActivityId) {
      // 연결된 액티비티로 이동 (배너에서는 content 없이 activityId만 전달)
      navigation.navigate('PlayDetailScreen', { 
        activityId: banner.linkedActivityId
      });
    } else {
      Alert.alert('배너에 연결된 액티비티가 없네요..! 🤔');
    }
  };
  return (
  <SafeAreaView style={styles.container}>
    {/* <ButtonSmall
      title="야옹이강사"
      variant="active"
      onPress={() => navigation.navigate('PlayInstructorDetailScreen', { instructorId: 1 })}
    /> */}
    <FlatList
      data={[]}
      keyExtractor={(_, index) => index.toString()}
      renderItem={null}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <PlayHeader onFavoritePress={() => navigation.navigate('PlayFavoriteScreen')} onHistoryPress={() => navigation.navigate('PlayHistoryScreen')} />
          <View style={styles.contentContainer}>
            <PlayBanner 
              onPress={onBannerPress} 
              banners={bannerData}
              isLoading={isLoading}
            />
            <PlayShortActivityList 
              onShortActivityPress={onShortActivityPress}
              shortActivityData={shortActivityData}
              isLoading={isLoading}
            />
            <PlayRecommendedContentList 
              onRecommendedPress={onRecommendedPress}
              recommendedActivityData={recommendedActivityData}
              isLoading={isLoading}
            />
            <PlayCategoryList onPress={onCategoryPress} />
          </View>
        </>
      }
      ListFooterComponent={<View style={{ height: 120 }} />}
    />
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.white 
  },
  contentContainer: {
    gap: 50,
    paddingHorizontal: 20,
    marginTop: 30,
  },
});

export default PlayTab;