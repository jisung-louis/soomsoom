import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import PersonIcon from '../../../../assets/icons/common/Person.svg';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';

interface AuthorInfoProps {
  instructorName: string;
  guide: string;
  onPressInstructor?: () => void;
  onPressGuide?: () => void;
  style?: ViewStyle;
}

const AuthorInfo: React.FC<AuthorInfoProps> = ({ instructorName, guide, onPressInstructor, onPressGuide, style }) => {
  return (
    <View style={[styles.instructorAndAudioContainer, style]}>
      <PersonIcon width={24} height={24} color={colors.grayScale600} />
      <View style={styles.instructorContainer}>
        <TouchableOpacity onPress={onPressInstructor}>
          <Text style={styles.contentInfo}>
            저자 : {instructorName}
          </Text>
        </TouchableOpacity>
        <Text style={styles.contentInfo}>|</Text>
        <TouchableOpacity onPress={onPressGuide}>
          <Text style={styles.contentInfo}>안내자 : {guide}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  instructorAndAudioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructorContainer: {
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