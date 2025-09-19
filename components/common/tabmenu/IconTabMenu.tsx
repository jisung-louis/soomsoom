import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';

export interface TabMenuItem {
  icon: React.FC<SvgProps>;
  title: string;
}

interface IconTabMenuProps {
  tabs: TabMenuItem[];
  selectedTab: number;
  onTabPress: (index: number) => void;
  style?: any;
  contentContainerStyle?: any;
}

const IconTabMenu: React.FC<IconTabMenuProps> = ({
  tabs,
  selectedTab,
  onTabPress,
  style,
  contentContainerStyle,
}) => {
  return (
    <FlatList
      style={[styles.tabMenuContainer, style]}
      data={tabs}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.tabMenuContentContainer, contentContainerStyle]}
      renderItem={({ item, index }) => (
        <TouchableOpacity 
          style={styles.tabMenu} 
          key={index} 
          onPress={() => onTabPress(index)}
        >
          <item.icon 
            width={40} 
            height={40} 
            style={selectedTab === index ? styles.tabMenuIcon : styles.tabMenuIconUnselected} 
          />
          <Text style={selectedTab === index ? styles.tabMenuTitle : styles.tabMenuTitleUnselected}>
            {item.title}
          </Text>
        </TouchableOpacity>
      )}
      keyExtractor={(item, index) => `tab-${index}`}
    />
  );
};

const styles = StyleSheet.create({
  tabMenuContainer: {
    paddingVertical: 20,
  },
  tabMenuContentContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  tabMenu: {
    alignItems: 'center',
    gap: 8,
  },
  tabMenuIcon: {
    opacity: 1,
  },
  tabMenuIconUnselected: {
    opacity: 0.3,
  },
  tabMenuTitle: {
    ...typography.body4,
    color: colors.grayScale900,
  },
  tabMenuTitleUnselected: {
    ...typography.body4,
    color: colors.grayScale500,
  },
});

export default IconTabMenu;
