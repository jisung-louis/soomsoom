import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import PlayTitle from './common/PlayTitle';
import DefaultImage from '../../../assets/images/play/playRecommendedContentList/default_image.svg';
import Badge from '../../common/badge/Badge';
import MoreIcon from '../../../assets/icons/common/more.svg';
import TimeIcon from '../../../assets/icons/common/time.svg';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { contentData } from '../../../data/playContentData';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import { ContentData } from '../../../data/playContentData';

const PlayRecommendedContentList = () => {
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  
  // meditation 타입만 필터링
  const meditationData = contentData.filter(item => item.type === 'meditation');
  
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
          <TouchableOpacity onPress={() => {navigation.navigate('PlayDetailScreen', { content: item as ContentData })}}>
            <View style={styles.card}>
              <DefaultImage width="100%" height={150} preserveAspectRatio="xMidYMid slice" style={styles.image} />
              <View style={styles.cardContentContainer}>
                <View style={styles.cardContent}>
                  <View style={styles.textHeader}>
                    <Badge title={item.type === 'breath' ? '호흡' : '명상'} />
                    <MoreIcon color={colors.grayScale300} />
                  </View>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>{item.title.join('\n')}</Text>
                    <View style={styles.timeRow}>
                      <TimeIcon color={colors.grayScale700} width={16} height={16} />
                      <Text style={styles.time}>{item.time}</Text>
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