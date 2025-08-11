import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlayHeader from '../../components/tabs/play/PlayHeader';
import PlayMainCard from '../../components/tabs/play/PlayMainCard';
import PlayShortMeditationList from '../../components/tabs/play/PlayShortMeditationList';
import PlayRecommendedContentList from '../../components/tabs/play/PlayRecommendedContentList';
import PlayCategoryList from '../../components/tabs/play/PlayCategoryList';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../navigations/tabs/PlayStackNavigator';
import { colors } from '../../constants/colors';

const PlayTab = () => {
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  return (
  <SafeAreaView style={styles.container}>
    <FlatList
      data={[]}
      keyExtractor={(_, index) => index.toString()}
      renderItem={null}
      ListHeaderComponent={
        <>
          <PlayHeader onFavoritePress={() => navigation.navigate('PlayFavoriteScreen')} onHistoryPress={() => navigation.navigate('PlayHistoryScreen')} />
          <View style={styles.contentContainer}>
            <PlayMainCard />
            <PlayShortMeditationList/>
            <PlayRecommendedContentList />
            <PlayCategoryList />
          </View>
        </>
      }
      ListFooterComponent={<View style={{ height: 100 }} />}
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