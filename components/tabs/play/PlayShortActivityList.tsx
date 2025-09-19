import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { typography } from '../../../constants/typography';
import { radius } from '../../../constants/radius';
import { colors } from '../../../constants/colors';
import TimeIcon from '../../../assets/icons/common/time.svg';
import PlayTitle from './common/PlayTitle';
import { Activity } from '../../../services/contentService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import { titleLineBreaker } from '../../../utils/textUtils';

interface PlayShortActivityListProps {
  onShortActivityPress: () => void;
  shortActivityData: Activity[];
  isLoading: boolean;
}

const CARD_WIDTH = 140;

const PlayShortActivityList = ({ onShortActivityPress, shortActivityData, isLoading }: PlayShortActivityListProps) => {
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  
  return (
  <View style={styles.section}>
    <PlayTitle title='playShortActivityList' onPress={onShortActivityPress} />
    <FlatList
      data={shortActivityData}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={{gap: 10}}
      snapToInterval={CARD_WIDTH + 10} // 카드 너비 + 간격(20)
      snapToAlignment="start"
      decelerationRate="fast"
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => {navigation.navigate('PlayDetailScreen', { activityId: item.id, content: item as Activity })}}>
          <View style={styles.card}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle} numberOfLines={2}>{titleLineBreaker(item.title)}</Text>
            </View>
            <View style={styles.timeContainer}>
              <TimeIcon color={colors.grayScale700} width={16} height={16} />
              <Text style={styles.time}>{Math.floor(item.durationInSeconds / 60)}min</Text>
            </View>
            <Image source={item.thumbnailImageUrl || require('../../../assets/images/play/playFavoriteScreen/default_image_1.png')} style={styles.icon} />
          </View>
        </TouchableOpacity>
      )}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: radius.r8,
    backgroundColor: colors.grayScale50,
    padding: 16,
    alignItems: 'flex-start',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  icon: {
    width: 60,
    height: 60,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  cardTitleContainer: {
    marginBottom: 6,
    height: 14 * 1.3 * 2,
  },
  cardTitle: {
    ...typography.body4,
    color: colors.grayScale900,
  },
  time: {
    ...typography.caption2,
    color: colors.grayScale700,
  },
});

export default PlayShortActivityList;
