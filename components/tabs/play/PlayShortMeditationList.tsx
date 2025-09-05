import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { typography } from '../../../constants/typography';
import { radius } from '../../../constants/radius';
import { colors } from '../../../constants/colors';
import TimeIcon from '../../../assets/icons/common/time.svg';
import PlayTitle from './common/PlayTitle';
import { Activity } from '../../../services/contentService';
import { getActivitiesByType } from '../../../services/contentService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';

const PlayShortMeditationList = () => {
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  const [breathData, setBreathData] = useState<Activity[]>([]);
  
  useEffect(() => {
    const loadBreathData = async () => {
      try {
        const response = await getActivitiesByType('BREATHING');
        setBreathData(response.content);
      } catch (error) {
        console.error('호흡 데이터 로드 실패:', error);
      }
    };
    
    loadBreathData();
  }, []);
  
  return (
  <View style={styles.section}>
    <PlayTitle title='playShortMeditationList' onPress={() => {}} />
    <FlatList
      data={breathData}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={{gap: 10}}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => {navigation.navigate('PlayDetailScreen', { content: item as Activity })}}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
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
    width: 140,
    height: 140,
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
  cardTitle: {
    ...typography.body4,
    color: colors.grayScale900,
    marginBottom: 6,
  },
  time: {
    ...typography.caption2,
    color: colors.grayScale500,
  },
});

export default PlayShortMeditationList;
