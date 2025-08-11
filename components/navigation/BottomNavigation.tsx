import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/radius';
import HomeIcon from '../../assets/icons/navigation/bottomNavigation/home.svg';
import RecordIcon from '../../assets/icons/navigation/bottomNavigation/record.svg';
import PlayIcon from '../../assets/icons/navigation/bottomNavigation/play.svg';
import AlarmIcon from '../../assets/icons/navigation/bottomNavigation/alarm.svg';
import MyIcon from '../../assets/icons/navigation/bottomNavigation/my.svg';
import { typography } from '../../constants/typography';

// 탭 타입 정의
export type BottomTabKey = 'home' | 'record' | 'play' | 'alarm' | 'my';

interface BottomNavigationProps {
  selectedTab: BottomTabKey;
  onTabPress: (tab: BottomTabKey) => void;
  style?: ViewStyle;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = (props) => {
  const { selectedTab, onTabPress, style } = props;
  return (
    <SafeAreaView edges={["bottom"]} style={[styles.safeArea, style]}>
      <View style={styles.container}>
        {tabList.map(({ key, label, Icon }) => {
          const focused = selectedTab === key;
          return (
            <TouchableOpacity
              key={key}
              style={styles.tab}
              onPress={() => onTabPress(key)}
              activeOpacity={0.7}
            >
              <Icon width={36} height={36} fill={focused ? colors.grayScale800 : colors.grayScale500} />
              <Text style={[styles.label, { color: focused ? colors.grayScale800 : colors.grayScale500 }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const tabList: { key: BottomTabKey; label: string; Icon: React.FC<any> }[] = [
  { key: 'home', label: '홈', Icon: HomeIcon },
  { key: 'play', label: '놀기', Icon: PlayIcon },
  { key: 'record', label: '기록', Icon: RecordIcon },
  { key: 'alarm', label: '알람', Icon: AlarmIcon },
  { key: 'my', label: '마이', Icon: MyIcon },
];

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.r12,
    borderTopRightRadius: radius.r12,

    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.grayScale100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,

    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tab: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    ...typography.body2,
  },
}); 