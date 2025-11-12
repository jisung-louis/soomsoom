import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
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
  useBottomSheetList?: boolean; // 바텀시트 내부에서 사용 시 true
}

const IconTabMenu: React.FC<IconTabMenuProps> = ({
  tabs,
  selectedTab,
  onTabPress,
  style,
  contentContainerStyle,
  useBottomSheetList = false,
}) => {
  const listRef = React.useRef<FlatList | null>(null);

  // 선택 탭이 '보유중'(인덱스 0)으로 바뀔 때 리스트 스크롤을 항상 맨 앞으로 초기화
  React.useEffect(() => {
    if (selectedTab === 0) {
      try {
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      } catch {}
    }
  }, [selectedTab]);

  const commonProps = {
    ref: listRef as any,
    style: [styles.tabMenuContainer, style] as any,
    data: tabs,
    horizontal: true,
    showsHorizontalScrollIndicator: false,
    contentContainerStyle: [styles.tabMenuContentContainer, contentContainerStyle] as any,
    renderItem: ({ item, index }: any) => (
      <TouchableOpacity 
        style={styles.tabMenu}
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
    ),
    keyExtractor: (item: TabMenuItem) => `tab-${item.title}`,
  } as const;

  return useBottomSheetList ? (
    <BottomSheetFlatList {...(commonProps as any)} />
  ) : (
    <FlatList {...(commonProps as any)} />
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
    gap: 6,
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

export default React.memo(IconTabMenu);
