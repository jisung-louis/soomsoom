import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';

interface TabMenuProps<T extends string> {
  tabs: T[];
  selectedTab: T;
  onPress: (tab: T) => void;
}

export const TabMenu = <T extends string>({
  tabs,
  selectedTab,
  onPress,
}: TabMenuProps<T>) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = selectedTab === tab;

        return (
          <Pressable key={tab} onPress={() => onPress(tab)} style={styles.tab}>
            <View style={styles.tabContent}>
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab}
              </Text>
            </View>
            {isActive && <View style={styles.underline} />}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    height: 57,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: '100%',
    backgroundColor: colors.grayScale900,
    borderRadius: 1,
  },
  tabText: {
    color: colors.grayScale300,
    fontSize: typography.body4.fontSize,
    fontWeight: typography.body4.fontWeight,
    lineHeight: typography.body4.lineHeight,
  },
  activeTabText: {
    color: colors.grayScale900,
  },
});