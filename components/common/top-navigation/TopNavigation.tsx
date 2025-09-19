import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import ShopIcon from '../../../assets/icons/navigation/topNavigation/shop.svg';
import HeartIcon from '../../../assets/icons/navigation/topNavigation/heart.svg';
import MessageIcon from '../../../assets/icons/navigation/topNavigation/message.svg';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import StorageIcon from '../../../assets/icons/navigation/topNavigation/storage.svg';
import { useCurrencyStore } from '../../../stores/currencyStore';

interface TopNavigationProps {
  style?: ViewStyle;
  isShopButtonVisible?: boolean;
  isHeartButtonVisible?: boolean;
  isStorageButtonVisible?: boolean;
  isMessageButtonVisible?: boolean;
  shopButtonPress?: () => void;
  heartButtonPress?: () => void;
  storageButtonPress?: () => void;
  messageButtonPress?: () => void;
  isBGColorDark?: boolean;
}

const TopNavigation = ({
  style, 
  isShopButtonVisible = true, 
  isHeartButtonVisible = true, 
  isStorageButtonVisible = true, 
  isMessageButtonVisible = true, 
  shopButtonPress, 
  heartButtonPress, 
  storageButtonPress, 
  messageButtonPress,
  isBGColorDark = false
}: TopNavigationProps) => {
  const { heartPoints } = useCurrencyStore();
  const textColor = isBGColorDark ? colors.grayScale100 : colors.grayScale900;
  const iconFill = isBGColorDark ? colors.grayScale100 : colors.grayScale800;
  return (
      <View style={[styles.container, style]}>
        <View style={styles.group}>
          <View style={styles.leftGroup}>
            {isShopButtonVisible && (
              <TouchableOpacity onPress={() => {shopButtonPress && shopButtonPress()}}>
                <ShopIcon width={40} height={40} style={styles.iconShadow}/>
              </TouchableOpacity>
            )}
            {isHeartButtonVisible && (
              <TouchableOpacity style={styles.heartContainer} onPress={() => {heartButtonPress && heartButtonPress()}}>
                <HeartIcon width={40} height={40} style={styles.iconShadow}/>
                <Text style={[styles.label, {color: textColor}]}>{heartPoints}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.rightGroup}>
            {isStorageButtonVisible && (
            <TouchableOpacity onPress={() => {storageButtonPress && storageButtonPress()}}>
                <StorageIcon width={40} height={40} style={styles.iconShadow}/>
              </TouchableOpacity>
            )}
            {isMessageButtonVisible && (
              <TouchableOpacity onPress={() => {messageButtonPress && messageButtonPress()}}>
                <MessageIcon width={40} height={40} style={styles.iconShadow}/>
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
    gap: 10,
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
  iconShadow: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default TopNavigation; 