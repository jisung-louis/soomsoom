import React from 'react';
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

const PlayMeditationScreen = ({route}: {route: RouteProp<PlayStackParamList, 'PlayMeditationScreen'>}) => {
  const {content} = route.params;
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  const handleBack = () => {
    navigation.goBack();
  };
  const { toggleFavorite, isFavorite } = usePlayStore();
  const handleToggleFavorite = () => {
    toggleFavorite(content.id);
  };
  return (
    <ImageBackground 
      source={require('../../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <SubpageHeader onBack={handleBack} />
        <View style={styles.contentContainer}>
          {/* 컨텐츠 (캐릭터, 캐릭터 꾸미기 아이템 등) */}
        </View>
        <PlayBar 
          style={styles.playBar} 
          content={content} 
          handleToggleFavorite={handleToggleFavorite} 
          isFavorite={isFavorite(content.id)}
          onEnd={() => {
              navigation.navigate('PlayResultScreen');
          }}
            />
      </SafeAreaView>
    </ImageBackground>
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