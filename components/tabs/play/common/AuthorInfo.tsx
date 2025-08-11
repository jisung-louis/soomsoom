import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import PersonIcon from '../../../../assets/icons/common/Person.svg';
import { colors } from '../../../../constants/colors';
import { teachersData } from '../../../../data/playContentData';
import { typography } from '../../../../constants/typography';

interface AuthorInfoProps {
  teacherId: number;
  guide: string;
  onPressTeacher?: () => void;
  style?: ViewStyle;
}

const AuthorInfo: React.FC<AuthorInfoProps> = ({ teacherId, guide, onPressTeacher, style }) => {
  const teacher = teachersData.find(t => t.id === teacherId);

  return (
    <View style={[styles.teacherAndAudioContainer, style]}>
      <PersonIcon width={24} height={24} color={colors.grayScale600} />
      <View style={styles.teacherContainer}>
        <TouchableOpacity onPress={onPressTeacher}>
          <Text style={styles.contentInfo}>
            저자 : {teacher?.name} {teacher?.title}
          </Text>
        </TouchableOpacity>
        <Text style={styles.contentInfo}>|</Text>
        <TouchableOpacity>
          <Text style={styles.contentInfo}>안내자 : {guide}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  teacherAndAudioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teacherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentInfo: {
    ...typography.body5,
    color: colors.grayScale400,
  },
});

export default AuthorInfo; 