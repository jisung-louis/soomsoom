import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getItemDetail, Item } from '../../../services/itemService';
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

type ShopItemDetailScreenRouteProp = RouteProp<HomeStackParamList, 'ShopItemDetailScreen'>;

const ShopItemDetailScreen = () => {
    const route = useRoute<ShopItemDetailScreenRouteProp>();
    const { itemId } = route.params;
    const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
    const [catLayout, setCatLayout] = useState({x: 0, y: 0, width: 0, height: 0});
    const [item, setItem] = useState<Item | null>(null);
    console.log('item', item);
    const heartPoints = useCurrencyStore(state => state.heartPoints);
    const isOwnedSelector = useRoomStore(state => state.isOwned);
    const alreadyOwned = useMemo(() => (item ? isOwnedSelector(item.id) : false), [item, isOwnedSelector]);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await getItemDetail(itemId);
                if (mounted) setItem(data);
            } catch (e) {
                console.warn('아이템 상세 로드 실패:', e);
            }
        })();
        return () => { mounted = false; };
    }, [itemId]);

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
        const p = item?.price ?? 0;
        return p.toLocaleString();
    }, [item]);

    const hasValidPrice = useMemo(() => typeof item?.price === 'number' && (item?.price ?? 0) >= 0, [item]);

    const onBuy = useCallback(async () => {
        if (!item) {
            // usePurchase 훅의 showErrorAlert 사용
            return;
        }
        if (alreadyOwned) {
            console.log('이미 보유한 아이템:', item?.name);
            return;
        }
        if (!hasValidPrice) {
            console.log('가격 정보 없음:', item?.name);
            return;
        }

        console.log('구매 시도:', item?.name, item.price);
        await purchaseSingleItem(itemId, item.price ?? 0);
    }, [alreadyOwned, hasValidPrice, item, itemId, purchaseSingleItem]);

    const handleBuy = useCallback(() => {
        if (isPurchasing) return;
        onBuy();
    }, [isPurchasing, onBuy]);

    const itemIdToPositionType = (itemId: number | null) => {
      if (!itemId) return null;
      // 서버 스펙에는 positionType이 없으므로, 이미지 컨테이너 처리만 위해 background 추정 로직 생략
      return null;
    };
  return (
    <>
    <UserRoom
      previewItemIds={[itemId]}
    >
      <SubpageHeader 
        onBack={handleBack} 
        right={<HeartPoint money={heartPoints.toString()} onPress={() => {}}/>}
      />
      
      <View style={styles.content}>
        {/* <View style={styles.itemImageContainer}>
          {item?.image === null || itemIdToPositionType(itemId) === 'background' ? (
            <View style={styles.itemImage} />
          ) : (
              <Image source={item?.image} style={styles.itemImage} resizeMode='contain'/>
          )}
        </View> */}
        <View style={styles.itemImageContainer}>
          {(() => {
            const placeholder = require('../../../assets/icons/default_test_image.png');
            const src =
              typeof item?.imageUrl === 'string'
                ? { uri: item.imageUrl }
                : (item?.imageUrl || placeholder);
            return (
              <Image source={src as any} style={styles.itemImage} resizeMode='contain' />
            );
          })()}
        </View>
        <View style={styles.itemInfo}>
          <View style={styles.itemName}>
            <Text style={styles.itemNameText}>{item?.name || '아이템 이름이 없습니다.'}</Text>
          </View>
          <View style={styles.itemDescription}>
            <Text style={styles.itemDescriptionText}>{item?.description || '아이템 설명이 없습니다.'}</Text>
          </View>
        </View>
      </View>
      
    </UserRoom>

    <View style={styles.buttonContainer}>
        <Button 
          icon={alreadyOwned ? undefined : 'heart'}
          title={alreadyOwned ? ' 보유중' : (hasValidPrice ? ` ${priceText} 구매하기` : ' 가격 정보 없음')}
          size='large' 
          variant={isPurchasing || alreadyOwned || !hasValidPrice ? 'default' : 'active'} 
          style={{gap: 2, width: '100%'}} 
          disabled={isPurchasing || alreadyOwned || !hasValidPrice}
          loading={isPurchasing}
          onPress={handleBuy} 
        />
    </View>
    
    <CustomAlert
      visible={isSuccessAlertVisible}
      message="구매가 완료되었어요!"
      buttons={[{ text: '확인', onPress: hideSuccessAlert }]}
      onClose={hideSuccessAlert}
    />
    <CustomAlert
      visible={isErrorAlertVisible}
      message={errorTitle || '구매에 실패했어요.'}
      subMessage={errorSubMessage}
      buttons={[{ text: '확인', onPress: hideErrorAlert }]}
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
});


export default ShopItemDetailScreen;