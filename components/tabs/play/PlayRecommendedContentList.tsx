import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import PlayTitle from './common/PlayTitle';
import DefaultImage from '../../../assets/images/play/playRecommendedContentList/default_image.svg';
import Badge from '../../common/badge/Badge';
import MoreIcon from '../../../assets/icons/common/more.svg';
import TimeIcon from '../../../assets/icons/common/time.svg';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { Activity, ActivityType } from '../../../services/contentService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import { titleLineBreaker } from '../../../utils/textUtils';

const CARD_WIDTH = 280;

interface PlayRecommendedContentListProps {
  onRecommendedPress: () => void;
  recommendedActivityData: Activity[];
  isLoading: boolean;
}

const PlayRecommendedContentList = ({ onRecommendedPress, recommendedActivityData, isLoading }: PlayRecommendedContentListProps) => {
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  
  const typeToString = (type: ActivityType) => {
    switch (type) {
      case 'BREATHING':
        return '호흡';
      case 'MEDITATION':
        return '명상';
      default:
        return '활동'; //이게 뜬다면 문제가 있음
    }
  }
  return (
  <View style={styles.section}>
    <PlayTitle title='playRecommendedContentList' onPress={onRecommendedPress} />
    <View style={styles.flatList}>
      <FlatList
        data={recommendedActivityData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        snapToInterval={CARD_WIDTH + 14} // 카드 너비 + 간격(14)
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.containerStyle}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => {navigation.navigate('PlayDetailScreen', { activityId: item.id, content: item as Activity })}}>
            <View style={styles.card}>
              <Image
                source={(() => {
                  const src: any = (item as any).thumbnailImageUrl;
                  if (typeof src === 'string' && src.length > 0) {
                    return { uri: src };
                  }
                  if (typeof src === 'number') {
                    return src; // require(...) 결과 (number)
                  }
                  return require('../../../assets/images/play/playFavoriteScreen/default_image_1.png');
                })()}
                style={styles.image}
              />
              <View style={styles.cardContentContainer}>
                <View style={styles.cardContent}>
                  <View style={styles.textHeader}>
                    <Badge title={typeToString(item.type)} />
                  </View>
                  <View style={styles.cardTitleAndTimeContainer}>
                    <View style={styles.cardTitleContainer}>
                      <Text style={styles.cardTitle} numberOfLines={2}>{titleLineBreaker(item.title)}</Text>
                    </View>
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
  containerStyle: {
    gap: 14,
  },
  card: {
    backgroundColor:colors.white,
    width: CARD_WIDTH,
    borderRadius: 16,
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
  cardTitle: {
    color: colors.grayScale900,
    ...typography.heading9,
  },
  cardTitleAndTimeContainer: {
    paddingLeft: 6,
    gap: 8,
  },
  cardTitleContainer: {
    marginBottom: 6,
    height: 18 * 1.3 * 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    ...typography.caption2,
    color: colors.grayScale700,
  },
});

export default PlayRecommendedContentList; 