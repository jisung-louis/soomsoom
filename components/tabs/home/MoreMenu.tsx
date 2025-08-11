import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import FeedIcon from '../../../assets/icons/navigation/topNavigation/feed.svg';
import StorageIcon from '../../../assets/icons/navigation/topNavigation/storage.svg';
import MessageIcon from '../../../assets/icons/navigation/topNavigation/message.svg';
import AnimatedPopup from '../../common/animation/AnimatedPopup';

// 더보기 메뉴

const menuList = [
    {
        icon: <FeedIcon width={40} height={40} />,
        title: '먹이주기',
    },
    {
        icon: <StorageIcon width={40} height={40} />,
        title: '창고',
    },
    {
        icon: <MessageIcon width={40} height={40} />,
        title: '우편함',
    },
];
const MoreMenu = ({visible, style, onClose}: {visible: boolean, style?: ViewStyle, onClose: () => void}) => {
  return (
    <AnimatedPopup visible={visible} style={style}>
      <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
        <View style={styles.container}>
        <View style={styles.menuContainer}>
            <View style={styles.menuItemContainer}>
                {menuList.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.menuItem} onPress={() => {console.log(item.title, '클릭됨')}}>
                        <View style={styles.menuItemIcon}>
                            {item.icon}
                        </View>
                        <Text style={styles.menuItemText}>{item.title}</Text>
                        </TouchableOpacity>
                ))}
            </View>
        </View>
    </View>
      </TouchableWithoutFeedback>
    </AnimatedPopup>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderRadius: radius.r8,

    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  menuItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  menuItem: {
    alignItems: 'center',
  },
  menuItemIcon: {
    /* 그림자 효과 넣기 */
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  menuItemText: {
    ...typography.body4,
    color: colors.grayScale800,
  },
});

export default MoreMenu;