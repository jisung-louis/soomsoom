import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../../navigations/tabs/PlayStackNavigator';
import SubpageHeader from '../../../../components/common/top-navigation/SubpageHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography, syongsyongTypography } from '../../../../constants/typography';
import ProgramList from '../../../../components/tabs/play/common/ProgramList';
import { Activity, getActivitiesByCategory, getActivitiesByType } from '../../../../services/contentService';
import { catIconMap } from '../../../../utils/iconMap';
import { activityRestData } from '../../../../data/activityRestData';
import LoadingSpinner from '../../../../components/common/loading/LoadingSpinner';
import { useScreenAnalytics } from '../../../../hooks/useScreenAnalytics';

const PlayActivityListScreen = ({route}: {route: RouteProp<PlayStackParamList, 'PlayActivityListScreen'>}) => {
  useScreenAnalytics('PlayActivityListScreen');

  const { title: initialTitle, content: initialContent } = route.params;
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  const handleBack = () => {
    console.log('🔍 handleBack');
    navigation.goBack();
  };
  
  const mockProgramData: Activity[] = [
    {
      id: 1,
      title: 'Program 1',
      type: 'MEDITATION',
      category: 'MEDITATION',
      thumbnailImageUrl: require('../../../../assets/images/play/playFavoriteScreen/default_image_1.png'),
      descriptions: [],
      author: {
        id: 1,
        name: 'Author 1',
        bio: 'Author 1 bio',
        profileImageUrl: 'https://via.placeholder.com/150',
      },
      narrator: {
        id: 1,
        name: 'Narrator 1',
        bio: 'Narrator 1 bio',
        profileImageUrl: 'https://via.placeholder.com/150',
      },
      audioUrl: null,
      timeline: [],
      durationInSeconds: 100,
      isFavorited: false,
    },
    {
      id: 2,
      title: 'Program 2',
      type: 'BREATHING',
      category: 'BREATHING',
      thumbnailImageUrl: require('../../../../assets/images/play/playFavoriteScreen/default_image_1.png'),
      descriptions: [],
      author: {
        id: 1,
        name: 'Author 1',
        bio: 'Author 1 bio',
        profileImageUrl: 'https://via.placeholder.com/150',
      },
      narrator: {
        id: 1,
        name: 'Narrator 1',
        bio: 'Narrator 1 bio',
        profileImageUrl: 'https://via.placeholder.com/150',
      },
      audioUrl: null,
      timeline: [],
      durationInSeconds: 100,
      isFavorited: false,
    },
  ];
  

  const [activityList, setActivityList] = useState<Activity[]>([]);
  const [title, setTitle] = useState(initialTitle);
  const [isLoading, setIsLoading] = useState(true);
  const fetchActivityList = async () => {
    setIsLoading(true);
    try {
      if (title === '명상' || title === '호흡' || title === '수면' || title === '쉼') {
        switch (title) {
          case '명상':
          default:
            setActivityList((await getActivitiesByCategory('MEDITATION')).content);
            break;
          case '호흡':
            setActivityList((await getActivitiesByCategory('BREATHING')).content);
            break;
          case '수면':
            setActivityList((await getActivitiesByCategory('SLEEP')).content);
            break;
          case '쉼':
            //setActivityList(activityRestData);
            setActivityList((await getActivitiesByCategory('REST')).content)
            break;
        }
      } else {
        switch (title) {
          case 'SHORT':
            setActivityList(initialContent);
            break;
          case 'RECOMMENDED':
            setActivityList(initialContent);
            break;
          default:
            return;
        }
      }
    } catch (error) {
      console.error('액티비티 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    fetchActivityList();
  }, [title]);

  useEffect(() => {
    if (title === 'SHORT') {
      setTitle('회복을 위한, 짧은 5분!');
    }
    else if (title === 'RECOMMENDED') {
      setTitle('나를 위한 추천 콘텐츠');
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <LoadingSpinner  />
            <Text style={styles.emptyText}>로딩 중...</Text>
          </View>
        ) : activityList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <catIconMap.cry />
            <Text style={styles.emptyText}>컨텐츠를 준비중이에요.</Text>
          </View>
        ) : (
          <FlatList
            data={activityList}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{gap: 10, paddingBottom: 50}}
            renderItem={({item}) => (
              <ProgramList programData={[item]} />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    ...syongsyongTypography.title5,
    paddingLeft: 28,
    marginTop: 30,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 25,
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

export default PlayActivityListScreen;