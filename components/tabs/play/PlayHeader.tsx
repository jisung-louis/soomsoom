import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FavoriteIcon from '../../../assets/icons/common/star.svg';
import HistoryIcon from '../../../assets/icons/common/history.svg';
import { colors } from '../../../constants/colors';

type PlayHeaderProps = {
  onFavoritePress: () => void;
  onHistoryPress: () => void;
};

const PlayHeader: React.FC<PlayHeaderProps> = ({ onFavoritePress, onHistoryPress }) => {
  return (
  <View style={styles.container}>
    <View style={styles.icons}>
      <TouchableOpacity onPress={onFavoritePress}>
        <FavoriteIcon width={32} height={32} color={colors.grayScale800} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onHistoryPress}>
        <HistoryIcon width={32} height={32} color={colors.grayScale800} />
      </TouchableOpacity>
    </View>
  </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

export default PlayHeader; 