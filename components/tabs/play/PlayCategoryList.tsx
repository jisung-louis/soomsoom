import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PlayTitle from './common/PlayTitle';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import DefaultIcon from '../../../assets/icons/common/Heart.svg'; //temp
import ArrowRightIcon from '../../../assets/icons/common/arrow_right.svg';
import { typography } from '../../../constants/typography';

const DATA = [
  { id: '1', title: '명상', desc: '복잡할수록, 잠깐 멈추기', icon: require('../../../assets/icons/default_test_image.png') },
  { id: '2', title: '호흡', desc: '조용히, 천천히, 깊게', icon: require('../../../assets/icons/default_test_image.png') },
  { id: '3', title: '수면', desc: '오늘 밤, 잠자리는 가볍게', icon: require('../../../assets/icons/default_test_image.png') },
  { id: '4', title: '쉼', desc: '잠깐 멈춰 숨 돌리는 순간', icon: require('../../../assets/icons/default_test_image.png') },
];

const PlayCategoryList = () => (
  <View style={styles.section}>
    <PlayTitle title='playCategoryList' showArrow={false} />
    <View style={styles.listContainer}>
      {DATA.map((item, index) => (
        <TouchableOpacity key={item.id} onPress={() => {}}>
          <View key={item.id} style={styles.list}>
            <View style={styles.iconContainer}>
              <DefaultIcon width={48} height={48} />
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.desc}>{item.desc}</Text>
              </View>
              <ArrowRightIcon width={24} height={24} />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  listContainer: {
    gap: 16,
  },
  list: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  contentContainer: {
    flex: 1,
    gap: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    gap: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.r16,
    backgroundColor: colors.grayScale50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  title: {
    ...typography.body1,
    color: colors.grayScale900,
  },
  desc: {
    color: colors.grayScale500,
    ...typography.body5,
  },
});

export default PlayCategoryList; 