import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Image, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../../navigations/tabs/HomeStackNavigator';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { colors } from '../../../constants/colors';
import { syongsyongTypography, typography } from '../../../constants/typography';
import HeartPoint from '../../../components/common/heart-point/HeartPoint';
import { TabMenu } from '../../../components/common/tabmenu/TabMenu';
import { SceneMap, TabView } from 'react-native-tab-view';
import { radius } from '../../../constants/radius';
import { getItems, Item, ItemType } from '../../../services/itemService';
import type { ImageSourcePropType } from 'react-native';
import { useRoomStore } from '../../../stores/roomStore';
import { useOwnedItems } from '../../../hooks/useOwnedItems';
import CheckDisableIcon from '../../../assets/icons/common/check_disabled.svg';
import CheckActiveIcon from '../../../assets/icons/common/check_active.svg';
import ArrowDropDownIcon from '../../../assets/icons/common/arrow_dropdown.svg';
import EmotionIcon from '../../../assets/icons/common/emotion.svg';
import IconTabMenu, { TabMenuItem } from '../../../components/common/tabmenu/IconTabMenu';
import EntireIcon from '../../../assets/icons/my/room-decoration/entire.svg';
import AccessoryIcon from '../../../assets/icons/my/room-decoration/accessory.svg';
import CollectionIcon from '../../../assets/icons/my/room-decoration/collection.svg';
import HatIcon from '../../../assets/icons/my/room-decoration/hat.svg';
import BackgroundIcon from '../../../assets/icons/my/room-decoration/background.svg';
import RugIcon from '../../../assets/icons/my/room-decoration/rug.svg';
import ShelfIcon from '../../../assets/icons/my/room-decoration/shelf.svg';
import OrnamentIcon from '../../../assets/icons/my/room-decoration/ornament.svg';

import BannerItemImage from '../../../assets/images/home/shop/banner_item.svg';
import BannerChargeImage from '../../../assets/images/home/shop/banner_charge.svg';
import { useCurrencyStore } from '../../../stores/currencyStore';

type ShopScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'ShopScreen'>;

// 3의 배수로 맞추는 패딩 함수 (MyRoomDecoration과 동일)
type RoomItemLike = {
  id: number;
  title: string;
  image: ImageSourcePropType | null;
  price: number;
  type: string;
  isSoldOut?: boolean;
};

function padToThreeColumns(data: RoomItemLike[]) {
  const remainder = data.length % 3;
  if (remainder === 0) return data;
  const placeholders = Array(3 - remainder).fill(null).map((_, idx) => ({
    __isPlaceholder: true,
    id: 0,
    type: '',
    title: '',
    image: null,
    lottieJson: null,
    price: 0,
    positionType: 'eyewear' as const,
    position: { x: 0, y: 0 },
  }));
  return [...data, ...placeholders];
}

const ITEM_IMAGE_WIDTH = 105;
const ITEM_IMAGE_HEIGHT = 105;

// 아이템 리스트 컴포넌트 (메모이제이션으로 최적화)
const ItemList = React.memo(({ 
  filteredItems, 
  onItemPress, 
  isOutOfStock, 
  isOwned 
}: {
  filteredItems: RoomItemLike[];
  onItemPress: (item: RoomItemLike) => void;
  isOutOfStock: (itemId: number) => boolean;
  isOwned: (itemId: number) => boolean;
}) => {
  return (
    <FlatList 
      style={styles.itemListContainer}
      data={padToThreeColumns(filteredItems)}
      numColumns={3}
      columnWrapperStyle={styles.row}
      scrollEnabled={false}
      renderItem={({item, index}) => (
        item.id === 0 ? (
          <View style={[styles.item, {backgroundColor: 'transparent', elevation: 0, width: ITEM_IMAGE_WIDTH, height: ITEM_IMAGE_HEIGHT}]} key={item.id} />
        ) : (
          <TouchableOpacity style={styles.item} key={item.id} onPress={() => onItemPress(item)}>
            {isOutOfStock(item.id) && (  
              <View style={styles.grayDimmedContainer}>
                <Text style={styles.outOfStockText}>다 팔렸어요!</Text>
              </View>
            )}
            
              <View style={[styles.itemImageContainer]}>
                {item.image !== null && (
                  <Image source={item.image as any} style={styles.itemImage} resizeMode='contain'/>
                )}
              </View>
            
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {!isOwned(item.id) ? (
                <View style={styles.itemPriceContainer}>
                  <EmotionIcon width={16} height={16} />
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
              ) : (
                <View style={styles.itemPriceContainer}>
                  <Text style={styles.ownedText}>보유중</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )
      )} 
      keyExtractor={(item) => item.id.toString()}
    />
  );
});

ItemList.displayName = 'ItemList';

const ShopScreen = () => {
  const navigation = useNavigation<ShopScreenNavigationProp>();
  const { ownedItems } = useRoomStore();
  const { loadOwnedItems } = useOwnedItems();
  
  // isOwned 함수를 직접 정의하여 최신 상태 반영
  const isOwned = (itemId: number) => {
    const result = ownedItems.includes(itemId);
    console.log(`🔍 isOwned 체크: itemId=${itemId}, ownedItems=${JSON.stringify(ownedItems)}, result=${result}`);
    return result;
  };
  const layout = useWindowDimensions();
  const [excludeOwnedItems, setExcludeOwnedItems] = useState(false);
  const [outOfStockItems, setOutOfStockItems] = useState<number[]>([]);
  const { heartPoints } = useCurrencyStore();
  const handleBack = () => {
    navigation.goBack();
  };

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'item', title: '아이템' },
    { key: 'charge', title: '충전소' },
  ]);
  
  // 아이템 카테고리 탭 메뉴
  const [selectedItemTab, setSelectedItemTab] = useState(0);
  const itemTabMenu: TabMenuItem[] = [
    { icon: EntireIcon, title: '전체' },
    { icon: CollectionIcon, title: '컬렉션' },
    { icon: AccessoryIcon, title: '악세사리' },
    { icon: HatIcon, title: '모자' },
    { icon: BackgroundIcon, title: '배경' },
    { icon: RugIcon, title: '러그' },
    { icon: ShelfIcon, title: '선반' },
    { icon: OrnamentIcon, title: '장식품' },
  ];

  const handleItemTabPress = (tabIndex: number) => {
    setSelectedItemTab(tabIndex);
  };

  const handleItemPress = (item: RoomItemLike) => {
    const itemIsOwned = isOwned(item.id);
    navigation.navigate('ShopItemDetailScreen', { itemId: item.id });
    if (itemIsOwned) {
      // 이미 보유한 아이템

      console.log('이미 보유한 아이템:', item.title);
    } else {
      // 구매 가능한 아이템
      console.log('구매 시도:', item.title, item.price);
      // TODO: 구매 로직 구현
    }
  };
  const handleExcludeOwnedItemsToggle = () => {
    setExcludeOwnedItems(!excludeOwnedItems);
    // TODO: 보유중 제외 기능 구현
  };

  // 품절 아이템 목록은 서버 isSoldOut으로 초기화하고,
  // 테스트 토글 시에만 outOfStockItems를 사용합니다.

  // 품절 아이템 체크 함수
  const isOutOfStock = (itemId: number) => {
    const found = items.find(i => i.id === itemId);
    if (found?.isSoldOut) return true;
    return outOfStockItems.includes(itemId);
  };

  // 보유 아이템 체크 함수는 스토어에서 가져옴

  // 서비스에서 불러온 아이템 목록 (서버 스펙 → 화면용으로 매핑)
  const [items, setItems] = useState<RoomItemLike[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getItems({ sort: 'CREATED', page: 1, size: 60 });
        const mapped: RoomItemLike[] = res.content.map((it) => ({
          id: it.id,
          title: it.name,
          image: typeof it.imageUrl === 'string' ? null : (it.imageUrl as any) ?? null,
          price: it.price,
          isSoldOut: it.isSoldOut,
          type:
            it.itemType === 'ACCESSORY' ? '악세사리' :
            it.itemType === 'HAT' ? '모자' :
            it.itemType === 'BACKGROUND' ? '배경' :
            it.itemType === 'FLOOR' ? '러그' :
            it.itemType === 'SHELF' ? '선반' :
            '장식품',
        }));
        if (mounted) {
          setItems(mapped);
          const initialSoldOutIds = mapped.filter(i => i.isSoldOut).map(i => i.id);
          setOutOfStockItems(initialSoldOutIds);
        }
      } catch (e) {
        console.warn('아이템 목록 로드 실패:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 상점 진입 시 소유 아이템 로드
  useEffect(() => {
    loadOwnedItems();
  }, [loadOwnedItems]);

  // 화면 포커스 시 소유 아이템 동기화 (구매 후 돌아왔을 때 반영)
  useFocusEffect(
    React.useCallback(() => {
      loadOwnedItems();
    }, [loadOwnedItems])
  );

  // 테스트용: 모든 아이템을 품절로 만들거나 품절해제
  const handleMakeAllOutOfStock = () => {
    if (outOfStockItems.length === 0) {
      const allItemIds = items.map(item => item.id);
      setOutOfStockItems(allItemIds);
    } else {
      setOutOfStockItems([]);
    }
  };

  // 필터링된 아이템 목록을 메모이제이션으로 최적화
  const filteredItems = useMemo(() => {
    let list = items;
    if (selectedItemTab > 0) {
      const selectedCategory = itemTabMenu[selectedItemTab].title;
      list = items.filter(item => item.type === selectedCategory);
    }
    if (excludeOwnedItems) {
      list = list.filter(item => !isOwned(item.id));
    }
    return list;
  }, [items, selectedItemTab, excludeOwnedItems, ownedItems]);

  const renderItemTab = () => {
    return (
      <View style={styles.content}>
          {/* <Image
            source={require('../../../assets/images/home/shop/banner_item.png')}
            style={[styles.bannerImage, { height: 100 }]}
          /> */}
          {/* 아이템 카테고리 탭 메뉴 위치 */}
          
          {/* 아이템 카테고리 탭 메뉴 */}
          <View style={styles.tabMenuContainer}>
            <IconTabMenu
              tabs={itemTabMenu}
              selectedTab={selectedItemTab}
              onTabPress={handleItemTabPress}
            />
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.innerContent}>
            <BannerItemImage width={'100%'} />
            <View style={styles.filterContainer}>
              <TouchableOpacity style={styles.excludeOwnedItems} onPress={handleExcludeOwnedItemsToggle}>
                {excludeOwnedItems ? <CheckActiveIcon /> : <CheckDisableIcon />}
                <Text style={[styles.excludeOwnedItemsText, {color: excludeOwnedItems ? colors.grayScale900 : colors.grayScale500}]}>보유중 제외</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={{backgroundColor: colors.grayScale100, borderRadius: radius.r16, paddingHorizontal: 10, paddingVertical: 4}} 
              onPress={handleMakeAllOutOfStock}>
                {outOfStockItems.length === 0 ? (
                  <Text style={{...typography.body5, color: colors.grayScale900}}>품절(Test)</Text>
                ) : (
                  <Text style={{...typography.body5, color: colors.grayScale900}}>품절해제(Test)</Text>
                )}
              </TouchableOpacity> */}
              <TouchableOpacity style={styles.dropdownSort} onPress={() => {Alert.alert('추천순 나열','구현중입니다')}}>
                <Text style={styles.dropdownSortText}>추천순</Text>
                <ArrowDropDownIcon />
              </TouchableOpacity>
            </View>
            
            <ItemList 
              filteredItems={filteredItems}
              onItemPress={handleItemPress}
              isOutOfStock={isOutOfStock}
              isOwned={isOwned}
            />
        </ScrollView>
      </View>
    );
  };

  const renderChargeTab = () => (
    <View style={styles.content}>
      {/* <Image
        source={require('../../../assets/images/home/shop/banner_charge.png')}
        style={[styles.bannerImage, { height: 200 }]}
      /> */}
      <BannerChargeImage width={'100%'} />
    </View>
  );

  const renderScene = SceneMap({
    item: renderItemTab,
    charge: renderChargeTab,
  });



    return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} right={<HeartPoint money={heartPoints.toString()} onPress={() => {}}/>}/>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={() => (
          <TabMenu
            tabs={['아이템', '충전소']}
            selectedTab={routes[index].title as '아이템' | '충전소'}
            onPress={(tab) => {
              const i = routes.findIndex(r => r.title === tab);
              if (i !== -1) setIndex(i);
            }}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
  tabMenuContainer: {
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    ...typography.heading4,
    color: colors.grayScale900,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body3,
    color: colors.grayScale600,
    textAlign: 'center',
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    ...typography.heading6,
    color: colors.grayScale800,
    marginBottom: 20,
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  item: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  itemImageContainer: {
    width: ITEM_IMAGE_WIDTH,
    height: ITEM_IMAGE_HEIGHT,
    borderRadius: radius.r8,
    backgroundColor: colors.grayScale50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
  },
  itemPrice: {
    ...typography.caption1,
    color: colors.grayScale900,
  },
  bannerImage: {
    width: '100%',
    borderRadius: radius.r16,
  },
  itemListContainer: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  itemBadgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary100,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.primary300,
    zIndex: 10,
  },
  ownedBadge: {
    ...typography.body5,
    color: colors.primary600,
    fontWeight: '600',
  },
  itemInfo: {
    alignItems: 'center',
    gap: 4,
  },
  itemTitle: {
    ...typography.caption2,
    color: colors.grayScale700,
    textAlign: 'center',
  },
  itemPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heartIcon: {
    fontSize: 16,
  },
  filterContainer: {
    marginTop: 30,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  excludeOwnedItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  excludeOwnedItemsText: {
    ...typography.body5,
    color: colors.grayScale500,
  },
  dropdownSort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dropdownSortText: {
    ...typography.body5,
    color: colors.grayScale900,
  },
  ownedText: {
    ...typography.caption1,
    color: colors.primary300,
  },
  grayDimmedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: ITEM_IMAGE_WIDTH,
    height: ITEM_IMAGE_HEIGHT,
    backgroundColor: '#292A2B',
    borderRadius: radius.r8,
    opacity: 0.6,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    ...syongsyongTypography.title6,
    fontSize: 16,
    color: colors.white,
  },
});

export default ShopScreen;
