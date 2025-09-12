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
import { useRoomStore } from '../../../stores/roomStore';
import { normalizeImageSource } from '../../../utils/textUtils';
import { SvgProps } from 'react-native-svg';
import { RoomItemCategory } from '../../../types/room';
import IconTabMenu, { TabMenuItem } from '../../../components/common/tabmenu/IconTabMenu';

const ITEM_IMAGE_WIDTH = 105;
const ITEM_IMAGE_HEIGHT = 105;

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
};

// 3의 배수로 맞추는 패딩 함수
function padToThreeColumns(data: ItemList[]) {
    const remainder = data.length % 3;
    if (remainder === 0) return data;
    const placeholders = Array(3 - remainder).fill(null).map((_, idx) => ({
      __isPlaceholder: true,
      id: 0,
      image: undefined,
      title: '',
      price: null,
    }));
    return [...data, ...placeholders];
  }

const MyRoomDecoration = ({
  selectedTab, 
  handleTabPress, 
  selectedItems, 
  onItemSelection
}: {
  selectedTab: number, 
  handleTabPress: (index: number) => void,
  selectedItems: number[],
  onItemSelection: (itemId: number) => void
}) => {
    const { ownedItems, isOwned } = useRoomStore();
    const [items, setItems] = useState<ItemList[]>([]);
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

    const InPossessionItemData: ItemList[] = items.filter(item => ownedItems.includes(item.id));
    const filteredData = selectedTab === 0
      ? InPossessionItemData
      : items.filter(item => item.type === tabMenu[selectedTab].title);
    const paddedData = padToThreeColumns(filteredData);

    const handleItemPress = (id: number) => {
        onItemSelection(id);
    };

    return (
        <View style={styles.container}>
            <IconTabMenu
                tabs={tabMenu}
                selectedTab={selectedTab}
                onTabPress={handleTabPress}
            />
            <FlatList 
            style={styles.itemListContainer}
            data={paddedData} 
            numColumns={3}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            renderItem={({item, index}) => (
                item.__isPlaceholder ? (
                  <View style={[styles.item, {backgroundColor: 'transparent', elevation: 0, width: ITEM_IMAGE_WIDTH, height: ITEM_IMAGE_HEIGHT}]} key={item.id} />
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
                      <Image source={normalizeImageSource(item.image)} style={styles.itemImage} resizeMode='contain'/>
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
});

export default MyRoomDecoration;