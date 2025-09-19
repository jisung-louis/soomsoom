import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import EmotionIcon from '../../assets/icons/common/emotion.svg';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { radius } from '../../constants/radius';
import { ss } from '../../utils/scale';

export type RoomItemLike = {
  id: number;
  title: string;
  image: ImageSourcePropType | null;
  price: number;
  type: string;
  isSoldOut?: boolean;
  isOwned?: boolean; // 서버에서 받은 보유 상태
  isCollection?: boolean;
  // 컬렉션 전용 필드
  phrase?: string;
  ownedItemsCount?: number;
  totalItemsCount?: number;
  collectionOwned?: boolean;
};

type Placeholder = {
  __isPlaceholder: true;
  id: 0;
  type: string;
  title: string;
  image: null;
  lottieJson: null;
  price: number;
  positionType: 'eyewear';
  position: { x: number; y: number };
  isCollection: boolean;
};

function isRealItem(item: RoomItemLike | Placeholder): item is RoomItemLike {
  return item.id !== 0;
}

function padToThreeColumns(data: RoomItemLike[], isCollection: boolean): Array<RoomItemLike | Placeholder> {
  if (isCollection) { // 컬렉션일때는 column 2개로 맞추기
    const remainder = data.length % 2;
    if (remainder === 0) return data;
    const placeholders = Array(2 - remainder)
      .fill(null)
      .map((): Placeholder => ({
        __isPlaceholder: true,
        id: 0 as const,
        type: '',
        title: '',
        image: null,
        lottieJson: null,
        price: 0,
        positionType: 'eyewear',
        position: { x: 0, y: 0 },
        isCollection: false,
      }));
    return [...data, ...placeholders];
  }
  else {
    // 컬렉션이 아닐때는 column 3개로 맞추기
    const remainder = data.length % 3;
    if (remainder === 0) return data;
    const placeholders = Array(3 - remainder)
      .fill(null)
      .map((): Placeholder => ({
        __isPlaceholder: true,
        id: 0 as const,
        type: '',
        title: '',
        image: null,
        lottieJson: null,
        price: 0,
        positionType: 'eyewear',
        position: { x: 0, y: 0 },
        isCollection: false,
      }));
        return [...data, ...placeholders];
  }
}

const ITEM_IMAGE_WIDTH = 105;
const ITEM_IMAGE_HEIGHT = 105;
const COLLECTION_IMAGE_WIDTH = ss(162.5);
const COLLECTION_IMAGE_HEIGHT = 180;


type Props = {
  filteredItems: RoomItemLike[];
  onItemPress: (item: RoomItemLike) => void;
  isOutOfStock: (itemId: number) => boolean;
  isOwned: (itemId: number) => boolean;
  isCollection: boolean;
};

const ItemList: React.FC<Props> = ({ filteredItems, onItemPress, isOutOfStock, isOwned, isCollection }) => {
  return (
    <FlatList<RoomItemLike | Placeholder>
      style={isCollection ? styles.collectionListContainer : styles.itemListContainer}
      data={padToThreeColumns(filteredItems, isCollection)}
      numColumns={isCollection ? 2 : 3}
      columnWrapperStyle={isCollection ? styles.collectionRow : styles.row}
      scrollEnabled={false}
      renderItem={({ item }) =>
        !isRealItem(item) ? (
          <View
            style={[
              isCollection ? styles.collectionCard : styles.item,
              isCollection
                ? { backgroundColor: 'transparent', width: COLLECTION_IMAGE_WIDTH, height: COLLECTION_IMAGE_HEIGHT }
                : { backgroundColor: 'transparent', width: ITEM_IMAGE_WIDTH, height: ITEM_IMAGE_HEIGHT },
            ]}
            key={item.id}
          />
        ) : (
          <TouchableOpacity
            style={isCollection ? styles.collectionCard : styles.item}
            key={item.id}
            onPress={() => onItemPress(item)}
          >
            {!isCollection && isOutOfStock(item.id) && (
              <View style={styles.grayDimmedContainer}>
                <Text style={styles.outOfStockText}>다 팔렸어요!</Text>
              </View>
            )}

            {isCollection ? (
              <>
                <View style={styles.collectionImage}>
                  {item.image !== null && (
                    <Image source={item.image as any} style={styles.collectionImageInner} resizeMode="cover" />
                  )}
                </View>
                <View style={styles.collectionInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                  {(item as RoomItemLike).collectionOwned ? (
                        <View style={styles.itemPriceContainer}>
                        <Text style={styles.ownedText}>보유중</Text>
                        </View>
                    ) : (
                      <View style={styles.itemPriceContainer}>
                        <EmotionIcon width={16} height={16} />
                        <Text style={styles.itemPrice}>{item.price}</Text>
                      </View>
                    )}
                  <View style={styles.collectionOwnedCountContainer}>
                    <Text style={styles.collectionOwnedCount}>
                      ({(item as RoomItemLike).ownedItemsCount ?? 0}/{(item as RoomItemLike).totalItemsCount ?? 0})
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.itemImageContainer}>
                  {item.image !== null && (
                    <Image source={item.image as any} style={[styles.itemImage, item.type === '배경' ? {width: '100%', height: '100%'} : {}]} resizeMode={item.type === '배경' ? "cover" : "contain"} />
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
              </>
            )}
          </TouchableOpacity>
        )
      }
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

const styles = StyleSheet.create({
  collectionListContainer: {
    marginTop: 10,
  },
  itemListContainer: {
    marginTop: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  collectionRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  item: {
    width: ITEM_IMAGE_WIDTH,
  },
  collectionCard: {
    width: COLLECTION_IMAGE_WIDTH,
  },
  grayDimmedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  outOfStockText: {
    color: colors.grayScale50,
    ...typography.caption1,
  },
  itemImageContainer: {
    width: ITEM_IMAGE_WIDTH,
    height: ITEM_IMAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.grayScale50,
    borderRadius: radius.r8,
    overflow: 'hidden',
  },
  itemImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  itemInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  itemTitle: {
    ...typography.caption2,
    color: colors.grayScale700,
  },
  itemPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  itemPrice: {
    ...typography.caption1,
    color: colors.grayScale900,
  },
  ownedText: {
    ...typography.caption1,
    color: colors.primary300,
    fontWeight: 'bold',
  },
  collectionImage: {
    width: '100%',
    height: COLLECTION_IMAGE_HEIGHT,
    backgroundColor: colors.grayScale100,
    borderRadius: radius.r12,
    overflow: 'hidden',
  },
  collectionImageInner: {
    width: '100%',
    height: '100%',
  },
  collectionInfo: {
    padding: 10,
    gap: 4,
    alignItems: 'center',
  },
  collectionPhrase: {
    ...typography.caption2,
    color: colors.grayScale600,
  },
  collectionOwnedCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  collectionOwnedCount: {
    ...typography.caption2,
    color: colors.grayScale600,
  },
});

export default React.memo(ItemList, (prevProps, nextProps) => {
  // items 배열이 실제로 변경되었는지 확인
  if (prevProps.filteredItems.length !== nextProps.filteredItems.length) {
    return false;
  }
  
  // 각 아이템의 id와 isOwned 상태만 비교
  for (let i = 0; i < prevProps.filteredItems.length; i++) {
    const prevItem = prevProps.filteredItems[i];
    const nextItem = nextProps.filteredItems[i];
    
    if (prevItem.id !== nextItem.id || 
        prevItem.isOwned !== nextItem.isOwned ||
        prevItem.isSoldOut !== nextItem.isSoldOut) {
      return false;
    }
  }
  
  // 함수 props는 참조 비교 (useCallback으로 최적화되어 있음)
  return prevProps.onItemPress === nextProps.onItemPress &&
         prevProps.isOutOfStock === nextProps.isOutOfStock &&
         prevProps.isOwned === nextProps.isOwned &&
         prevProps.isCollection === nextProps.isCollection;
});


