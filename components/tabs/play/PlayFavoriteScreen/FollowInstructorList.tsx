import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { typography } from '../../../../constants/typography';
import { colors } from '../../../../constants/colors';
import { radius } from '../../../../constants/radius';
import { ToggleButton } from '../../../common/buttons/ToggleButton';

type FollowInstructorData = {
  id: number;
  name: string;
  title: string;
  profileImage: any;
}

type FollowInstructorListProps = {
  followInstructorData: FollowInstructorData[];
  followedIds: number[];
  onToggleFollow: (id: number) => void;
};

const FollowInstructorList = ({ followInstructorData, followedIds, onToggleFollow }: FollowInstructorListProps) => {
  return (
    <View style={styles.listContainer}>
      {
        followInstructorData.map((item) => (
          <View key={item.id} style={styles.cardContainer}>
            <View style={styles.card}>
              <Image source={item.profileImage} style={styles.profileImage} />
              <Text style={styles.name}>{item.name} {item.title}</Text>
            </View>
            <ToggleButton
              defaultTitle="팔로우"
              activeTitle="팔로잉"
              isActive={followedIds.includes(item.id)}
              checkIcon={true}
              onPress={() => onToggleFollow(item.id)}
            />
          </View>
        ))
      }
    </View>
  );
};

export default FollowInstructorList;

const IMAGE_SIZE = 56; // 프로필 이미지 사이즈
const styles = StyleSheet.create({
  listContainer: {
    gap: 16,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    ...typography.body1,
    color: colors.grayScale900,
  },
  profileImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
  },
});