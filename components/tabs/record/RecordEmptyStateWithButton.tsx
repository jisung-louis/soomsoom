import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ButtonSmall } from '../../common/buttons/ButtonSmall';
import EmptyCurrentMonth from '../../../assets/images/record/currentMonth_empty.svg';

interface RecordEmptyStateWithButtonProps {
  onButtonPress: () => void;
}

export const RecordEmptyStateWithButton: React.FC<RecordEmptyStateWithButtonProps> = ({
  onButtonPress
}) => {
  return (
    <View style={styles.container}>
      <EmptyCurrentMonth style={styles.emptyIcon}/>
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
    flexDirection: 'column',
    alignItems: 'center',
    gap: 30,
  },
  emptyIcon: {
    alignSelf: 'center',
    marginTop: 30,
  },
}); 