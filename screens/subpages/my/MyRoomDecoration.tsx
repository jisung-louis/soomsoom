import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList, ImageSourcePropType } from 'react-native';
import InPossessionIcon from '../../../assets/icons/my/room-decoration/in_possession.svg';
import AccessoryIcon from '../../../assets/icons/my/room-decoration/accessory.svg';
import CollectionIcon from '../../../assets/icons/my/room-decoration/collection.svg';
import HatIcon from '../../../assets/icons/my/room-decoration/hat.svg';
import BackgroundIcon from '../../../assets/icons/my/room-decoration/background.svg';
import FurnitureIcon from '../../../assets/icons/my/room-decoration/furniture.svg';
import RugIcon from '../../../assets/icons/my/room-decoration/rug.svg';
import ShelfIcon from '../../../assets/icons/my/room-decoration/shelf.svg';
import OrnamentIcon from '../../../assets/icons/my/room-decoration/ornament.svg';
import WallPaperIcon from '../../../assets/icons/my/room-decoration/wallpaper.svg';
import { typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import EmotionIcon from '../../../assets/icons/common/emotion.svg';
import Badge from '../../../components/common/badge/Badge';
import CheckIcon from '../../../assets/icons/common/stroke_check copy.svg';
import { getItems } from '../../../services/itemService';
import { getCollections, getCollectionDetail, type CollectionSummary, type CollectionDetail } from '../../../services/collectionService';
import { useRoomStore } from '../../../stores/roomStore';
import { normalizeImageSource } from '../../../utils/textUtils';
import { SvgProps } from 'react-native-svg';
import { RoomItemCategory } from '../../../types/room';
import IconTabMenu, { TabMenuItem } from '../../../components/common/tabmenu/IconTabMenu';
import { ss } from '../../../utils/scale';

const ITEM_IMAGE_WIDTH = 105;
const ITEM_IMAGE_HEIGHT = 105;
const COLLECTION_IMAGE_WIDTH = ss(162.5);
const COLLECTION_IMAGE_HEIGHT = 180;

const tabMenu: TabMenuItem[] = [
  {
    icon: InPossessionIcon,
    title: '보유중',
  },
  {
    icon: CollectionIcon,
    title: '컬렉션',
  },
  {
    icon: AccessoryIcon,
    title: '악세사리',
  },
  {
    icon: HatIcon,
    title: '모자',
  },
  {
    icon: BackgroundIcon,
    title: '배경',
  },
  {
    icon: RugIcon,
    title: '러그',
  },
  {
    icon: ShelfIcon,
    title: '선반',
  },
  {
    icon: OrnamentIcon,
    title: '장식품',
  },
];

type ItemList = {
  id: number;
  type?: RoomItemCategory;
  title?: string;
  image?: ImageSourcePropType;
  price?: number | null;
  __isPlaceholder?: boolean;
  // 컬렉션 관련 필드
  isCollection?: boolean;
  phrase?: string;
  ownedItemsCount?: number;
  totalItemsCount?: number;
  collectionOwned?: boolean;
};

// 3의 배수로 맞추는 패딩 함수
function padToThreeColumns(data: ItemList[], isCollection: boolean) {
  if (isCollection) {
    const remainder = data.length % 2;
    if (remainder === 0) return data;
    const placeholders = Array(2 - remainder).fill(null).map((_, idx) => ({
      __isPlaceholder: true,
      id: 0,
      image: undefined,
      type: '',
      title: '',
      price: null,
      isCollection: false,
      collectionOwned: false,
      ownedItemsCount: 0,
      totalItemsCount: 0,
    }));
    return [...data, ...placeholders];
  } else {
      const remainder = data.length % 3;
      if (remainder === 0) return data;
      const placeholders = Array(3 - remainder).fill(null).map((_, idx) => ({
        __isPlaceholder: true,
        id: 0,
        image: undefined,
        type: '',
        title: '',
        price: null,
        isCollection: false,
        collectionOwned: false,
        ownedItemsCount: 0,
        totalItemsCount: 0,
      }));
      return [...data, ...placeholders];
    }
  }

const MyRoomDecoration = ({
  selectedTab, 
  handleTabPress, 
  selectedItems, 
  onItemSelection,
  onCollectionSelection
}: {
  selectedTab: number, 
  handleTabPress: (index: number) => void,
  selectedItems: number[],
  onItemSelection: (itemId: number) => void,
  onCollectionSelection: (itemIds: number[]) => void
}) => {
    const { ownedItems, isOwned } = useRoomStore();
    const [items, setItems] = useState<ItemList[]>([]);
    const [collections, setCollections] = useState<CollectionSummary[]>([]);
    const [collectionsLoading, setCollectionsLoading] = useState(false);
    // 컬렉션 상세 정보를 저장하는 Map (id -> CollectionDetail)
    const [collectionDetails, setCollectionDetails] = useState<Map<number, CollectionDetail>>(new Map());

    // 컬렉션 상세 정보를 가져오는 함수
    const getCollectionDetailById = async (collectionId: number): Promise<CollectionDetail | null> => {
        // 이미 캐시된 상세 정보가 있으면 반환
        if (collectionDetails.has(collectionId)) {
            return collectionDetails.get(collectionId)!;
        }

        try {
            const detail = await getCollectionDetail(collectionId);
            // 캐시에 저장
            setCollectionDetails(prev => new Map(prev).set(collectionId, detail));
            return detail;
        } catch (error) {
            console.error('❌ 컬렉션 상세 정보 로드 실패:', error);
            return null;
        }
    };

    // 아이템 데이터 로딩
    React.useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          const res = await getItems({ sort: 'CREATED', page: 1, size: 200 });
          const mapped: ItemList[] = res.content.map((it) => ({
            id: it.id,
            type: (it.itemType === 'ACCESSORY' ? '악세사리' : it.itemType === 'HAT' ? '모자' : it.itemType === 'BACKGROUND' ? '배경' : it.itemType === 'FLOOR' ? '러그' : it.itemType === 'SHELF' ? '선반' : '장식품') as any,
            title: it.name,
            image: typeof it.imageUrl === 'string' ? undefined : (it.imageUrl as any),
            price: it.price,
          }));
          if (mounted) setItems(mapped);
        } catch {}
      })();
      return () => { mounted = false; };
    }, []);

    // 컬렉션 데이터 로딩
    React.useEffect(() => {
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

    const InPossessionItemData: ItemList[] = items.filter(item => ownedItems.includes(item.id));
    
    // 필터링 로직
    let filteredData: ItemList[] = [];
    if (selectedTab === 0) {
      // 보유중 탭
      filteredData = InPossessionItemData;
    } else if (selectedTab === 1) {
      // 컬렉션 탭
      filteredData = collections.map(collection => ({
        id: collection.id,
        title: collection.name,
        image: collection.imageUrl ? require('../../../assets/images/backgrounds/chuseok.png') : undefined,
        price: collection.purchasePrice,
        type: '컬렉션' as any,
        isCollection: true,
        phrase: collection.phrase,
        ownedItemsCount: collection.ownedItemsCount,
        totalItemsCount: collection.totalItemsCount,
        collectionOwned: collection.isOwned,
      }));
    } else {
      // 기타 카테고리 탭
      filteredData = items.filter(item => item.type === tabMenu[selectedTab].title);
    }

    const isCollection = selectedTab === 1;
    const isBackground = selectedTab === 4;
    
    const paddedData = padToThreeColumns(filteredData, isCollection || isBackground);

    // 컬렉션이 선택되었는지 확인하는 함수
    const isCollectionSelected = (collectionId: number) => {
        if (selectedTab !== 1) return false; // 컬렉션 탭이 아니면 false
        
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) {
            console.log('❌ 컬렉션을 찾을 수 없음:', collectionId);
            return false;
        }
        
        // 컬렉션 상세 정보에서 아이템 ID들을 가져옴
        const collectionDetail = collectionDetails.get(collectionId);
        if (!collectionDetail || !collectionDetail.items) {
            console.log('❌ 컬렉션 상세 정보를 찾을 수 없음:', collectionId);
            return false;
        }
        
        // 컬렉션을 구성하는 모든 아이템들이 선택되었는지 확인
        const collectionItemIds = collectionDetail.items.map(item => item.id);
        const isSelected = collectionItemIds.every(itemId => selectedItems.includes(itemId));
        
        console.log('🔍 컬렉션 선택 상태 확인:', {
            collectionId,
            collectionItemIds,
            selectedItems,
            isSelected,
            everyCheck: collectionItemIds.map(itemId => ({
                itemId,
                isIncluded: selectedItems.includes(itemId)
            }))
        });
        
        return isSelected;
    };

    const handleItemPress = async (id: number) => {
        console.log('🔍 아이템 클릭:', { id, selectedTab, isCollection: selectedTab === 1 });
        
        // 컬렉션 탭인 경우 컬렉션 상세 정보를 가져와서 아이템 ID들을 추출
        if (selectedTab === 1) {
            const collection = collections.find(c => c.id === id);
            console.log('📦 찾은 컬렉션:', collection);
            
            if (collection) {
                // 컬렉션 상세 정보를 가져옴
                const collectionDetail = await getCollectionDetailById(id);
                if (collectionDetail && collectionDetail.items) {
                    const itemIds = collectionDetail.items.map(item => item.id);
                    console.log('🎯 컬렉션 아이템 IDs:', itemIds);
                    // 컬렉션의 모든 아이템들을 한꺼번에 선택
                    onCollectionSelection(itemIds);
                } else {
                    console.warn('❌ 컬렉션 상세 정보를 가져올 수 없습니다:', id);
                }
            } else {
                console.warn('❌ 컬렉션을 찾을 수 없습니다:', id, 'collections:', collections.length);
            }
        } else {
            // 일반 아이템인 경우 기존 로직
            console.log('🔧 일반 아이템 선택:', id);
            onItemSelection(id);
        }
    };


    return (
        <View style={styles.container}>
            <IconTabMenu
                tabs={tabMenu}
                selectedTab={selectedTab}
                onTabPress={handleTabPress}
            />
            <FlatList 
            key={isCollection || isBackground ? 'collection' : 'items'}
            style={styles.itemListContainer}
            data={paddedData} 
            numColumns={isCollection || isBackground ? 2 : 3}
            columnWrapperStyle={isCollection || isBackground ? styles.collectionRow : styles.row}
            showsVerticalScrollIndicator={false}
            renderItem={({item, index}) => (
                item.__isPlaceholder ? (
                  <View style={[styles.item, {backgroundColor: 'transparent', elevation: 0, width: ITEM_IMAGE_WIDTH, height: ITEM_IMAGE_HEIGHT}]} key={item.id} />
                ) : 
                  isCollection ? (
                       <TouchableOpacity style={styles.item} key={item.id} onPress={() => handleItemPress(item.id)}>
                         {/* 컬렉션 보유 상태 배지 */}
                         {item.collectionOwned && (
                           <View style={styles.itemBadgeContainer}>
                             <Badge title='보유중' variant='small' />
                           </View>
                         )}
                         <View style={styles.collectionItemImageContainer}>
                           <Image source={normalizeImageSource(item.image)} style={styles.collectionItemImage} resizeMode='cover'/>
                           {isCollectionSelected(item.id) && (  
                             <View style={styles.collectionYellowDimmedContainer}>
                                 <CheckIcon width={56} height={56} color={colors.white} />
                             </View>
                         )}
                         </View>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          {!item.collectionOwned && (
                            <>
                              <View style={styles.itemPriceContainer}>
                                <EmotionIcon width={16} height={16} />
                                <Text style={styles.itemPrice}>{item.price}</Text>
                              </View>
                              <Text style={styles.collectionOwnedCount}>({item.ownedItemsCount}/{item.totalItemsCount})</Text>
                            </>
                          )}
                        </View>
                      </TouchableOpacity>
                    ):
                    isBackground ? (
                      <TouchableOpacity style={styles.item} key={item.id} onPress={() => handleItemPress(item.id)}>
                        {isOwned(item.id) && (
                            <View style={styles.itemBadgeContainer}>
                              <Badge title='보유중' variant='small' />
                            </View>
                        )}
                        {selectedItems.includes(item.id) && (  
                            <View style={styles.collectionYellowDimmedContainer}>
                                <CheckIcon width={56} height={56} color={colors.white} />
                            </View>
                        )}
                        <View style={styles.collectionItemImageContainer}>
                          <Image source={normalizeImageSource(item.image)} style={styles.collectionItemImage} resizeMode="cover"/>
                        </View>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          {!isOwned(item.id) && (
                            <View style={styles.itemPriceContainer}>
                              <EmotionIcon width={16} height={16} />
                              <Text style={styles.itemPrice}>{item.price}</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.item} key={item.id} onPress={() => handleItemPress(item.id)}>
                        {isOwned(item.id) && (
                            <View style={styles.itemBadgeContainer}>
                              <Badge title='보유중' variant='small' />
                            </View>
                        )}
                        {selectedItems.includes(item.id) && (  
                            <View style={styles.yellowDimmedContainer}>
                                <CheckIcon width={56} height={56} color={colors.white} />
                            </View>
                        )}
                        <View style={styles.itemImageContainer}>
                          <Image source={normalizeImageSource(item.image)} style={styles.itemImage} resizeMode="contain"/>
                        </View>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          {!isOwned(item.id) && (
                            <View style={styles.itemPriceContainer}>
                              <EmotionIcon width={16} height={16} />
                              <Text style={styles.itemPrice}>{item.price}</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    )
            )} 
            keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  itemBadgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
  },
  itemImageContainer: {
    width: ITEM_IMAGE_WIDTH,
    height: ITEM_IMAGE_HEIGHT,
    borderRadius: radius.r8,
    backgroundColor: colors.grayScale50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  collectionItemImageContainer: {
    width: COLLECTION_IMAGE_WIDTH,
    height: COLLECTION_IMAGE_HEIGHT,
    borderRadius: radius.r8,
    backgroundColor: colors.grayScale50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  collectionItemImage: {
    width: '100%',
    height: '100%',
  },
  itemImage: {
    width: 80,
    height: 80,
  },
  itemListContainer: {
    padding: 20,
    gap: 10,
    height: 312,
  },
  collectionRow: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  itemInfo: {
    gap: 4,
  },
  itemTitle: {
    color: colors.grayScale700,
    textAlign: 'center',
  },
  itemPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  itemPrice: {
    ...typography.caption1,
    color: colors.grayScale900,
    textAlign: 'center',
  },
  yellowDimmedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: ITEM_IMAGE_WIDTH,
    height: ITEM_IMAGE_HEIGHT,
    backgroundColor: '#FFAA33',
    opacity: 0.6,
    borderRadius: radius.r8,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionProgressContainer: {
    marginTop: 2,
  },
  collectionProgressText: {
    ...typography.caption2,
    color: colors.grayScale600,
    textAlign: 'center',
  },
  collectionOwnedCount: {
    ...typography.caption2,
    color: colors.grayScale600,
    textAlign: 'center',
  },
  collectionYellowDimmedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: COLLECTION_IMAGE_WIDTH,
    height: COLLECTION_IMAGE_HEIGHT,
    backgroundColor: '#FFAA33',
    opacity: 0.6,
    borderRadius: radius.r8,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MyRoomDecoration;