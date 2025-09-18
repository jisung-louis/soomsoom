import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ButtonSmall } from '../../common/buttons/ButtonSmall';
import CatWriteIcon from '../../../assets/icons/charactors/cat-variation/cat_write.svg';
import { syongsyongTypography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';

interface RecordEmptyStateWithButtonProps {
  onButtonPress: () => void;
}

const RecordEmptyStateWithButton: React.FC<RecordEmptyStateWithButtonProps> = ({
  onButtonPress
}) => {
  return (
    <View style={styles.container}>
      <CatWriteIcon width={100} height={100} />
      <Text style={styles.emptyText}>이 달의 첫 기록, 지금 남겨보세요!</Text>
      <ButtonSmall 
        title="기록 시작하기" 
        variant="active" 
        onPress={onButtonPress} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 30,
  },
  emptyText: {
    ...syongsyongTypography.title6,
    color: colors.grayScale900,
  },
}); 

export default RecordEmptyStateWithButton;