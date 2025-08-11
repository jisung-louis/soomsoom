import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import ShopIcon from '../../../assets/icons/navigation/topNavigation/shop.svg';
import HeartIcon from '../../../assets/icons/navigation/topNavigation/heart.svg';
import AddMenuIcon from '../../../assets/icons/navigation/topNavigation/add_menu.svg';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';

interface TopNavigationProps {
  style?: ViewStyle;
  moreMenuVisible?: boolean;
  onMoreMenuToggle?: (visible: boolean) => void;
  isShopButtonVisible?: boolean;
  isHeartButtonVisible?: boolean;
  isAddMenuButtonVisible?: boolean;
}

const TopNavigation = ({style, moreMenuVisible=false, onMoreMenuToggle, isShopButtonVisible = true, isHeartButtonVisible = true, isAddMenuButtonVisible = true}: TopNavigationProps) => {
  return (
      <View style={[styles.container, style]}>
        <View style={styles.group}>
          <View style={styles.leftGroup}>
            {isShopButtonVisible && (
              <TouchableOpacity onPress={() => {}}>
                <ShopIcon width={40} height={40}/>
              </TouchableOpacity>
            )}
            {isHeartButtonVisible && (
              <TouchableOpacity style={styles.heartContainer} onPress={() => {}}>
              <HeartIcon width={40} height={40}/>
              <Text style={styles.label}>1.5M</Text>
            </TouchableOpacity>
            )}
          </View>
          <View style={styles.rightGroup}>
            {isAddMenuButtonVisible && (
              <TouchableOpacity onPress={() => {onMoreMenuToggle && onMoreMenuToggle(!moreMenuVisible)}}>
              <AddMenuIcon width={40} height={40}/>
            </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    zIndex: 10,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    ...typography.body1,
    color: colors.grayScale900,
    marginLeft: 4,
  },
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});

export default TopNavigation; 