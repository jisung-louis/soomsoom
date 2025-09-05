import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import PlayTitle from './common/PlayTitle';
import DefaultImage from '../../../assets/images/play/playRecommendedContentList/default_image.svg';
import Badge from '../../common/badge/Badge';
import MoreIcon from '../../../assets/icons/common/more.svg';
import TimeIcon from '../../../assets/icons/common/time.svg';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { Activity } from '../../../services/contentService';
import { getActivitiesByType } from '../../../services/contentService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';

const PlayRecommendedContentList = () => {
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  const [meditationData, setMeditationData] = useState<Activity[]>([]);
  
  useEffect(() => {
    const loadMeditationData = async () => {
      try {
        const response = await getActivitiesByType('MEDITATION');
        setMeditationData(response.content);
      } catch (error) {
        console.error('명상 데이터 로드 실패:', error);
      }
    };
    
    loadMeditationData();
  }, []);
  
  return (
  <View style={styles.section}>
    <PlayTitle title='playRecommendedContentList' onPress={() => {}} />
    <View style={styles.flatList}>
      <FlatList
        data={meditationData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => {navigation.navigate('PlayDetailScreen', { content: item as Activity })}}>
            <View style={styles.card}>
              <Image source={item.thumbnailImageUrl || require('../../../assets/images/play/playFavoriteScreen/default_image_1.png')} style={styles.image} />
              <View style={styles.cardContentContainer}>
                <View style={styles.cardContent}>
                  <View style={styles.textHeader}>
                    <Badge title={item.type === 'BREATHING' ? '호흡' : '명상'} />
                    <MoreIcon color={colors.grayScale300} />
                  </View>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={styles.timeRow}>
                      <TimeIcon color={colors.grayScale700} width={16} height={16} />
                      <Text style={styles.time}>{Math.floor(item.durationInSeconds / 60)}min</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 20,
  },
  flatList: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10, // Figma의 blur 20은 RN 기준으로 반값 정도

    elevation: 1, // Android용. 1~2 정도가 4% 불투명한 그림자 느낌
  },
  card: {
    backgroundColor:colors.white,
    width: 280,
    borderRadius: 16,
    marginRight: 14,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
  },
  cardContentContainer: {
    height: 159,
  },
  cardContent: {
    height: 108,
    padding: 16,
    gap: 12,
  },
  textHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tag: {
    backgroundColor: '#FFBC40',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  cardTitle: {
    color: colors.grayScale900,
    ...typography.heading9,
  },
  cardTitleContainer: {
    paddingLeft: 6,
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 13,
    color: '#999',
  },
});

export default PlayRecommendedContentList; 