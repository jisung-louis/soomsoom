import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { radius } from '../../../../constants/radius';
import Badge from '../../../common/badge/Badge';
import MoreIcon from '../../../../assets/icons/common/more.svg';
import TimeIcon from '../../../../assets/icons/common/time.svg';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../../navigations/tabs/PlayStackNavigator';
import { Activity } from '../../../../services/contentService';

const ProgramList = ({ programData }: { programData: Activity[] }) => {
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  return(
    <View style={styles.container}>
      {
        programData.map((item) => (
          <TouchableOpacity key={item.id} style={styles.cardContainer} onPress={() => {navigation.navigate('PlayDetailScreen', { content: item })}}> 
            <View style={styles.card}>
              <Image source={item.thumbnailImageUrl || require('../../../../assets/images/play/playFavoriteScreen/default_image_1.png')} style={styles.image} resizeMode='contain' />
              <View style={styles.cardContent}>
                <View style={styles.textHeader}>
                  <Badge title={item.type === 'BREATHING' ? '호흡' : '명상'} />
                  <MoreIcon color={colors.grayScale300} />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  <View style={styles.timeRow}>
                    <TimeIcon color={colors.grayScale700} width={16} height={16} />
                    <Text style={styles.time}>{Math.floor(item.durationInSeconds / 60)}min</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))
      }
    </View>
  )
};

export default ProgramList;

const styles = StyleSheet.create({
  container: {
    gap: 10,
    shadowColor: colors.grayScale900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 5,
  },
  cardContainer: {
    gap: 10,
    padding: 10,
    borderRadius: radius.r8,
    backgroundColor: colors.white,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  image: {
    width: 130,
    height: 130,
    borderRadius: radius.r8,
  },
  cardContent: {
    width: 165,
    height: 108,
    justifyContent: 'space-between',
  },
  textHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.body1,
    color: colors.grayScale900,
  },
  cardTitleContainer: {
    gap: 8,
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