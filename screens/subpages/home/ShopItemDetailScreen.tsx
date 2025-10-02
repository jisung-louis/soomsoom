import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Pressable, TouchableWithoutFeedback } from 'react-native';
import { getItemDetail, Item } from '../../../services/itemService';
import { getCollectionDetail, CollectionDetail } from '../../../services/collectionService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HomeStackParamList } from '../../../navigations/tabs/HomeStackNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import HeartPoint from '../../../components/common/heart-point/HeartPoint';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { Button } from '../../../components/common/buttons/Button';
import { CustomAlert } from '../../../components/common/alert';
import { useCurrencyStore } from '../../../stores/currencyStore';
import { useRoomStore } from '../../../stores/roomStore';
import { usePurchase } from '../../../hooks/usePurchase';
import UserRoom from '../../../components/common/userroom/UserRoom';
import InPossessionItemList from '../../../components/tabs/home/InPossessionItemList';
import { radius } from '../../../constants/radius';
import { Alert } from 'react-native';

type ShopItemDetailScreenRouteProp = RouteProp<HomeStackParamList, 'ShopItemDetailScreen'>;

const ShopItemDetailScreen = () => {
    const route = useRoute<ShopItemDetailScreenRouteProp>();
    const { itemId, isCollection } = route.params;
    const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
    const [catLayout, setCatLayout] = useState({x: 0, y: 0, width: 0, height: 0});
    const [item, setItem] = useState<Item | null>(null);
    const [collection, setCollection] = useState<CollectionDetail | null>(null);
    const [isPossessionModalVisible, setPossessionModalVisible] = useState(false);
    console.log('item', item);
    console.log('collection', collection);
    const heartPoints = useCurrencyStore(state => state.heartPoints);
    const isOwnedSelector = useRoomStore(state => state.isOwned);
    const alreadyOwned = useMemo(() => {
        if (isCollection && collection) {
            return collection.isOwned;
        }
        return item ? isOwnedSelector(item.id) : false;
    }, [item, collection, isCollection, isOwnedSelector]);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (isCollection) {
                    const data = await getCollectionDetail(itemId);
                    if (mounted) setCollection(data);
                } else {
                    const data = await getItemDetail(itemId);
                    if (mounted) setItem(data);
                }
            } catch (e) {
                console.warn(isCollection ? '컬렉션 상세 로드 실패:' : '아이템 상세 로드 실패:', e);
            }
        })();
        return () => { mounted = false; };
    }, [itemId, isCollection]);

    const {
        isPurchasing,
        isSuccessAlertVisible,
        isErrorAlertVisible,
        errorTitle,
        errorSubMessage,
        purchaseSingleItem,
        hideSuccessAlert,
        hideErrorAlert,
    } = usePurchase();

    const handleBack = useCallback(() => {
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.popToTop();
    }, [navigation]);

    const priceText = useMemo(() => {
        const p = isCollection ? (collection?.purchasePrice ?? 0) : (item?.price ?? 0);
        return p.toLocaleString();
    }, [item, collection, isCollection]);

    const hasValidPrice = useMemo(() => {
        if (isCollection) {
            return typeof collection?.purchasePrice === 'number' && (collection?.purchasePrice ?? 0) >= 0;
        }
        return typeof item?.price === 'number' && (item?.price ?? 0) >= 0;
    }, [item, collection, isCollection]);

    const onBuy = useCallback(async () => {
        if (isCollection) {
            if (!collection) {
                console.warn('컬렉션 데이터 없음');
                Alert.alert('컬렉션 데이터 로딩 실패');
                return;
            }
            if (alreadyOwned) {
                console.log('이미 보유한 컬렉션:', collection.name);
                return;
            }
            if (!hasValidPrice) {
                console.log('가격 정보 없음:', collection.name);
                Alert.alert('가격 정보 없음');
                return;
            }
            console.log('컬렉션 구매 시도:', collection.name, collection.purchasePrice);
            await purchaseSingleItem(itemId, collection.purchasePrice ?? 0);
        } else {
            if (!item) {
                console.warn('아이템 데이터 없음');
                Alert.alert('아이템 데이터 로딩 실패');
                return;
            }
            if (alreadyOwned) {
                console.log('이미 보유한 아이템:', item.name);
                return;
            }
            if (!hasValidPrice) {
                console.log('가격 정보 없음:', item.name);
                Alert.alert('가격 정보 없음');
                return;
            }
            console.log('아이템 구매 시도:', item.name, item.price);
            await purchaseSingleItem(itemId, item.price ?? 0);
        }
    }, [alreadyOwned, hasValidPrice, item, collection, isCollection, itemId, purchaseSingleItem]);

    const handleBuy = useCallback(() => {
        if (isPurchasing) return;
        console.log('🛒 구매 버튼 클릭:', { 
            isPurchasing, 
            alreadyOwned, 
            hasValidPrice, 
            heartPoints,
            itemPrice: item?.price,
            collectionPrice: collection?.purchasePrice
        });
        onBuy();
    }, [isPurchasing, onBuy, alreadyOwned, hasValidPrice, heartPoints, item?.price, collection?.purchasePrice]);


    const onPurchaseSuccess = useCallback(async () => {
        await hideSuccessAlert();
        handleBack();
    }, [hideSuccessAlert, handleBack]);

    const goToChargeTab = useCallback(() => {
        // 홈 탭 스택을 초기화하고 ShopScreen의 충전소 탭으로 이동
        navigation.reset({
            index: 1,
            routes: [
                { name: 'HomeTab' },
                { 
                    name: 'ShopScreen',
                    params: { initialTab: 'charge' } // 충전소 탭으로 직접 이동
                }
            ],
        });
    }, [navigation]);

  return (
    <>
    <UserRoom
      previewMode={true}
      previewItemIds={isCollection ? (collection?.items?.map(it => it.id) ?? []) : [itemId]}
      showPlacedItems={true}
    >
      <SubpageHeader 
        onBack={handleBack} 
        style={{paddingHorizontal: 20}}
        right={<HeartPoint money={heartPoints.toString()} onPress={() => {}}/>}
      />
      
      <View style={styles.content}>
        {alreadyOwned ? (
          <View style={styles.collectionInfo}>
            <View style={[styles.collectionCountContainer, {backgroundColor: colors.primary300}]}>
              <Text style={styles.collectionCount}>
                보유중
              </Text>
            </View>
          </View>
        ):(
          !isCollection ? (
          <View style={styles.itemImageContainer}>
            {(() => {
              const placeholder = require('../../../assets/icons/default_test_image.png');
              let src;
              src = typeof item?.imageUrl === 'string'
                ? { uri: item.imageUrl }
                : (item?.imageUrl || placeholder);
              return (
                <Image source={src as any} style={styles.itemImage} resizeMode='contain' />
              );
            })()}
          </View>
        ) : (
            <View style={styles.collectionInfo}>
              <TouchableOpacity style={styles.collectionCountContainer} onPress={() => setPossessionModalVisible(true)}>
                <Text style={styles.collectionCount}>
                  보유현황 보기 ({collection?.ownedItemsCount}/{collection?.totalItemsCount})
                </Text>
              </TouchableOpacity>
            </View>
          )
        )}
        <View style={styles.itemInfo}>
          <View style={styles.itemName}>
            <Text style={styles.itemNameText}>
              {isCollection 
                ? (collection?.name || '컬렉션 이름이 없습니다.') 
                : (item?.name || '아이템 이름이 없습니다.')
              }
            </Text>
          </View>
          <View style={styles.itemDescription}>
            <Text style={styles.itemDescriptionText}>
              {isCollection 
                ? (collection?.description || '컬렉션 설명이 없습니다.') 
                : (item?.description || '아이템 설명이 없습니다.')
              }
            </Text>
          </View>
          {isCollection && collection && (
            <View style={styles.collectionInfo}>
              <Text style={styles.collectionPhrase}>{collection.phrase}</Text>
              <Text style={styles.collectionCount}>
                보유: {collection.ownedItemsCount}/{collection.totalItemsCount}개
              </Text>
            </View>
          )}
        </View>
      </View>
      
    </UserRoom>

    <Modal
      visible={isPossessionModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setPossessionModalVisible(false)}
    >
      <Pressable style={styles.modalBackdrop} onPress={() => setPossessionModalVisible(false)}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <InPossessionItemList collection={collection!}/>
        </Pressable>
      </Pressable>
    </Modal>

    {!alreadyOwned && (
      <View style={styles.buttonContainer}>
          <Button 
            icon={'heart'}
            price={priceText}
            title={hasValidPrice ? `${isCollection ? '컬렉션' : ''} 구매하기` : ' 가격 정보 없음'}
            size='large' 
            variant={isPurchasing || alreadyOwned || !hasValidPrice ? 'default' : 'active'} 
            style={{width: '100%'}} 
            disabled={isPurchasing || alreadyOwned || !hasValidPrice}
            loading={isPurchasing}
            onPress={handleBuy} 
          />
      </View>
    )}
    
    <CustomAlert
      visible={isSuccessAlertVisible}
      message="구매가 완료되었어요!"
      buttons={[{ text: '확인', onPress: onPurchaseSuccess }]}
      onClose={onPurchaseSuccess}
    />
    <CustomAlert
      visible={isErrorAlertVisible}
      message={errorTitle || '구매에 실패했어요.'}
      subMessage={errorSubMessage}
      buttons={
        errorTitle?.includes('하트') && errorTitle?.includes('부족')
          ? [
              { text: '나중에', onPress: hideErrorAlert },
              { text: '충전소가기', onPress: async () => {
                hideErrorAlert();
                goToChargeTab();
                console.log('충전소로 이동');
              }}
            ]
          : [{ text: '확인', onPress: hideErrorAlert }]
      }
      onClose={hideErrorAlert}
    />
  
  </>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: '80%',
    height: '80%',
  },
  itemInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  itemName: {
    marginBottom: 8,
  },
  itemDescription: {
    paddingHorizontal: 20,
  },
  itemNameText: {
    ...typography.heading9,
    color: colors.grayScale900,
  },
  itemDescriptionText: {
    ...typography.body2,
    color: colors.grayScale700,
    textAlign: 'center',
  },
  collectionInfo: {
    alignItems: 'center',
    height: 80,
  },
  collectionPhrase: {
    ...typography.caption1,
    color: colors.grayScale600,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  collectionCountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: radius.max,
    backgroundColor: colors.grayScale800,
    paddingHorizontal: 16,
  },
  collectionCount: {
    ...typography.body5,
    color: colors.white,
  },
  previewItem: {
    width: 80,
    height: 80,
    position: 'absolute',
    zIndex: 10000,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 20,
    width: '100%',
    zIndex: 1000,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
});


export default ShopItemDetailScreen;