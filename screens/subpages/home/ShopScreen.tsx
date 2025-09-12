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
import { getCollections, type CollectionSummary } from '../../../services/collectionService';
import type { ImageSourcePropType } from 'react-native';
import ItemList, { RoomItemLike } from '../../../components/shop/ItemList';
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

// ItemList 컴포넌트는 '../../../components/shop/ItemList'로 분리됨

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
  // 정렬 드롭다운 상태
  type SortKey = 'POPULAR' | 'LATEST' | 'PRICE_DESC' | 'PRICE_ASC';
  const [sortOpen, setSortOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('PRICE_ASC'); // 디폴트: 가격낮은순
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
    navigation.navigate('ShopItemDetailScreen', { itemId: item.id, isCollection: false });
    if (itemIsOwned) {
      // 이미 보유한 아이템

      console.log('이미 보유한 아이템:', item.title);
    } else {
      // 구매 가능한 아이템
      console.log('구매 시도:', item.title, item.price);
      // TODO: 구매 로직 구현
    }
  };

  const handleCollectionItemPress = (collection: RoomItemLike) => {
    navigation.navigate('ShopItemDetailScreen', { itemId: collection.id, isCollection: true });
  };

  const handleExcludeOwnedItemsToggle = () => {
    setExcludeOwnedItems(!excludeOwnedItems);
    // TODO: 보유중 제외 기능 구현
  };

  const toggleSortOpen = () => setSortOpen(v => !v);
  const handleSelectSort = (key: SortKey) => {
    setSortKey(key);
    setSortOpen(false);
  };

  const sortLabel = useMemo(() => {
    switch (sortKey) {
      case 'POPULAR':
        return '구매순';
      case 'LATEST':
        return '최신순';
      case 'PRICE_DESC':
        return '가격높은순';
      case 'PRICE_ASC':
      default:
        return '가격낮은순';
    }
  }, [sortKey]);

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
  // 컬렉션 데이터 (화면 마운트 시 선로딩)
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

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

  // 컬렉션은 탭 선택 여부와 상관없이 화면 마운트 시 한번 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setCollectionsLoading(true);
        const res = await getCollections({ sort: 'CREATED', page: 1, size: 12 });
        if (!mounted) return;
        setCollections(res.content);
      } catch (e) {
        console.warn('컬렉션 목록 로드 실패:', e);
      } finally {
        if (mounted) setCollectionsLoading(false);
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

  // 필터링 + 정렬 적용된 아이템 목록
  const filteredItems = useMemo(() => {
    let list = items;
    if (selectedItemTab > 1) {
      const selectedCategory = itemTabMenu[selectedItemTab].title;
      list = items.filter(item => item.type === selectedCategory);
    } else if (selectedItemTab === 1) {
      list = collections.map(collection => ({
        id: collection.id,
        title: collection.name,
        image: collection.imageUrl ? require('../../../assets/images/backgrounds/chuseok.png') : null,
        price: collection.purchasePrice,
        type: '컬렉션',
        isCollection: true,
        phrase: collection.phrase,
        ownedItemsCount: collection.ownedItemsCount,
        totalItemsCount: collection.totalItemsCount,
        collectionOwned: collection.isOwned,
      }));
    }
    if (excludeOwnedItems) {
      list = list.filter(item => !isOwned(item.id));
    }
    const sorted = [...list];
    switch (sortKey) {
      case 'POPULAR':
        // 구매순: 서버 지표 부재로 임시로 가격 내림차순을 근사치로 사용
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'LATEST':
        // 최신순: 생성일 정보가 없어 id가 클수록 최신이라고 가정
        sorted.sort((a, b) => b.id - a.id);
        break;
      case 'PRICE_DESC':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'PRICE_ASC':
      default:
        sorted.sort((a, b) => a.price - b.price);
        break;
    }
    return sorted;
  }, [items, selectedItemTab, excludeOwnedItems, ownedItems, sortKey, collections]);
  

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
              <View style={{ position: 'relative' }}>
                <TouchableOpacity style={styles.dropdownSort} onPress={toggleSortOpen}>
                  <Text style={styles.dropdownSortText}>{sortLabel}</Text>
                  <ArrowDropDownIcon color={colors.grayScale800} />
                </TouchableOpacity>
                {sortOpen && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectSort('POPULAR')}>
                      <Text style={styles.dropdownItemText}>구매순</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectSort('LATEST')}>
                      <Text style={styles.dropdownItemText}>최신순</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectSort('PRICE_DESC')}>
                      <Text style={styles.dropdownItemText}>가격높은순</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectSort('PRICE_ASC')}>
                      <Text style={styles.dropdownItemText}>가격낮은순</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
            {itemTabMenu[selectedItemTab].title === '컬렉션' ? (
              <View style={{ marginTop: 10 }}>
                {collectionsLoading ? (
                  <Text style={styles.dropdownItemText}>컬렉션 불러오는 중...</Text>
                ) : (
                  <ItemList
                    filteredItems={filteredItems}
                    onItemPress={handleCollectionItemPress}
                    isOutOfStock={() => false}
                    isOwned={() => false}
                    isCollection
                  />
                )}
              </View>
            ) : (
              <ItemList 
                filteredItems={filteredItems}
                onItemPress={handleItemPress}
                isOutOfStock={isOutOfStock}
                isOwned={isOwned}
                isCollection={false}
              />
            )}
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
  itemPrice: {
    ...typography.caption1,
    color: colors.grayScale900,
  },
  bannerImage: {
    width: '100%',
    borderRadius: radius.r16,
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
  dropdownMenu: {
    position: 'absolute',
    top: 28,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: radius.r12,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.grayScale100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 140,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.r8,
  },
  dropdownItemText: {
    ...typography.body5,
    color: colors.grayScale900,
  },
  collectionCard: {
    width: '48%',
    borderRadius: radius.r12,
    backgroundColor: colors.grayScale50,
    borderWidth: 1,
    borderColor: colors.grayScale100,
    overflow: 'hidden',
  },
  collectionImage: {
    width: '100%',
    height: 100,
    backgroundColor: colors.grayScale100,
  },
  collectionInfo: {
    padding: 10,
    gap: 4,
  },
  collectionTitle: {
    ...typography.body4,
    color: colors.grayScale900,
    fontWeight: '600',
  },
  collectionPhrase: {
    ...typography.caption2,
    color: colors.grayScale600,
  },
  collectionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  collectionMeta: {
    ...typography.caption1,
    color: colors.grayScale700,
  },
  collectionOwned: {
    ...typography.caption1,
    color: colors.primary300,
  },
});

export default ShopScreen;
