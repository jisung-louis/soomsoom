import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlayHeader from '../../components/tabs/play/PlayHeader';
import PlayBanner from '../../components/tabs/play/PlayBanner';
import PlayShortContentList from '../../components/tabs/play/PlayShortActivityList';
import PlayRecommendedContentList from '../../components/tabs/play/PlayRecommendedContentList';
import PlayCategoryList from '../../components/tabs/play/PlayCategoryList';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../navigations/tabs/PlayStackNavigator';
import { colors } from '../../constants/colors';
import { getActivitiesByType, Activity, getActivities } from '../../services/contentService';
import { getActiveBanners } from '../../services/bannerService';
import { Banner } from '../../types';

const PlayTab = () => {
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  
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
        const [shortActivityResponse, allActivitiesResponse, bannersResponse] = await Promise.all([
          getActivitiesByType('BREATHING'), // 호흡 타입 액티비티 가져오기
          getActivities(), // 모든 액티비티를 가져온 후 랜덤으로 5개 선택
          getActiveBanners(), // 활성 배너 목록 가져오기
        ]);
        
        const shuffled = [...allActivitiesResponse.content].sort(() => 0.5 - Math.random());
        const randomFive = shuffled.slice(0, 5);
        
        setShortActivityData(shortActivityResponse.content); // 회복을 위한 짧은 5분!
        setRecommendedActivityData(randomFive); // 나를 위한 추천 콘텐츠
        setBannerData(bannersResponse); // 모든 배너 표시
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
      Alert.alert('미구현 기능입니다.');
    }
  };
  return (
  <SafeAreaView style={styles.container}>
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
            <PlayShortContentList 
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