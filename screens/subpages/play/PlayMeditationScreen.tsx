import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import PlayBar from '../../../components/tabs/play/PlayMeditationScreen/PlayBar';
import { usePlayStore } from '../../../stores/playStore';
import { toggleFavoriteActivity } from '../../../services/contentService';
import { useToast } from '../../../contexts/ToastContext';
import UserRoom from '../../../components/common/userroom/UserRoom';

const PlayMeditationScreen = ({route}: {route: RouteProp<PlayStackParamList, 'PlayMeditationScreen'>}) => {
  const {content} = route.params;
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  const { favoriteActivities } = usePlayStore();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleBack = () => {
    navigation.goBack();
  };
  
  const isFavorite: boolean = favoriteActivities.some(fav => fav.activityId === content.id);
  const CROP_TOP = 100;
  
  const handleToggleFavorite = async () => {
    setIsLoading(true);
    try {
      const { favoriteActivity, unfavoriteActivity, favoriteActivities } = usePlayStore.getState();
      await toggleFavoriteActivity(content.id, {
        favoriteActivity,
        unfavoriteActivity,
        isFavorite: (activityId: number) => favoriteActivities.some(fav => fav.activityId === activityId)
      });
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
      showToast({
        message: '즐겨찾기 상태 변경에 실패했어요.',
        theme: 'dark',
        iconType: 'brokenHeart',
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    // <ImageBackground 
    //   source={require('../../../assets/images/background.png')}
    //   style={styles.container}
    //   resizeMode="cover"
    // >
    //   <SafeAreaView style={styles.container}>
    //     <SubpageHeader onBack={handleBack} />
    //     <View style={styles.contentContainer}>
    //       {/* 컨텐츠 (캐릭터, 캐릭터 꾸미기 아이템 등) */}
    //     </View>
    //     <PlayBar 
    //       style={styles.playBar} 
    //       content={content} 
    //       handleToggleFavorite={handleToggleFavorite} 
    //       isFavorite={isFavorite}
    //       isFavoriteLoading={isLoading}
    //       onEnd={() => {
    //           navigation.navigate('PlayResultScreen');
    //       }}
    //         />
    //   </SafeAreaView>
    // </ImageBackground>
    <>
      <UserRoom cropTop={CROP_TOP}>
        <SubpageHeader onBack={handleBack} style={{transform: [{translateY: CROP_TOP}]}} />
          <View style={styles.contentContainer}>
            {/* 컨텐츠 (캐릭터, 캐릭터 꾸미기 아이템 등) */}
          </View>
      </UserRoom>
      <PlayBar 
        style={styles.playBar} 
        content={content} 
        handleToggleFavorite={handleToggleFavorite} 
        isFavorite={isFavorite}
        isFavoriteLoading={isLoading}
        onEnd={() => {
            navigation.navigate('PlayResultScreen');
        }}
        />
      </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  playBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default PlayMeditationScreen;