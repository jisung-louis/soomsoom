import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { roomItemList } from '../../../data/roomItemData';
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
    const item = roomItemList.find(item => item.id === itemId);
    console.log('item', item);
    const heartPoints = useCurrencyStore(state => state.heartPoints);
    const isOwnedSelector = useRoomStore(state => state.isOwned);
    const alreadyOwned = useMemo(() => (item ? isOwnedSelector(item.id) : false), [item, isOwnedSelector]);

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
            return;
        }
        if (!hasValidPrice) {
            return;
        }

        await purchaseSingleItem(itemId);
    }, [alreadyOwned, hasValidPrice, item, itemId, purchaseSingleItem]);

    const handleBuy = useCallback(() => {
        if (isPurchasing) return;
        onBuy();
    }, [isPurchasing, onBuy]);

    const itemIdToPositionType = (itemId: number | null) => {
      if (!itemId) return null;
      const item = roomItemList.find(i => i.id === itemId);
      return item?.positionType;
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
        <View style={styles.itemImageContainer}>
          {item?.image === null || itemIdToPositionType(itemId) === 'background' ? (
            <View style={styles.itemImage} />
          ) : (
              <Image source={item?.image} style={styles.itemImage} />
          )}
        </View>
        <View style={styles.itemInfo}>
          <View style={styles.itemName}>
            <Text style={styles.itemNameText}>{item?.title}</Text>
          </View>
          <View style={styles.itemDescription}>
            <Text style={styles.itemDescriptionText}>{item?.description?.join('\n')}</Text>
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
    marginTop: 50,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
  },
  itemImage: {
    width: '100%',
    height: '100%',
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