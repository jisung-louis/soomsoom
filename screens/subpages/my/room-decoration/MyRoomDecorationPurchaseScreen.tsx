import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MyStackParamList } from '../../../../navigations/tabs/MyStackNavigator';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import MyTabTopNavigation from '../../../../components/common/top-navigation/MyTabTopNavigation';
import { colors } from '../../../../constants/colors';
import { sx, sy, sv } from '../../../../utils/scale';
import { radius } from '../../../../constants/radius';
import Badge from '../../../../components/common/badge/Badge';
import HeartIcon from '../../../../assets/icons/common/emotion.svg';
import { useCurrencyStore } from '../../../../stores/currencyStore';
import { typography, syongsyongTypography } from '../../../../constants/typography';
import { getItems } from '../../../../services/itemService';
import type { ImageSourcePropType } from 'react-native';
import PurchaseItemList from '../../../../components/tabs/my/PurchaseItemList';
import { Button } from '../../../../components/common/buttons/Button';
import CustomAlert from '../../../../components/common/alert/CustomAlert';
import { usePurchase } from '../../../../hooks/usePurchase';
import { useRoomStore } from '../../../../stores/roomStore';

const contentStartY = sy(326);

const MyRoomDecorationPurchaseScreen = () => {
    const navigation = useNavigation<StackNavigationProp<MyStackParamList>>();
    const route = useRoute<RouteProp<MyStackParamList, 'MyRoomDecorationPurchaseScreen'>>();
    const purchaseItemsParams = route.params?.purchaseItems ?? [];  
    const [isCheckedItems, setIsCheckedItems] = useState<number[]>(purchaseItemsParams);
    const [purchaseItemsState, setPurchaseItemsState] = useState<number[]>(purchaseItemsParams);
    const [isExitAlertVisible, setIsExitAlertVisible] = useState(false);
    
    const heartPoints = useCurrencyStore(state => state.heartPoints);
    
    const {
        isPurchasing,
        isSuccessAlertVisible,
        isErrorAlertVisible,
        errorTitle,
        errorSubMessage,
        purchaseItems,
        hideSuccessAlert,
        hideErrorAlert,
        resetState,
        addToCart,
    } = usePurchase();

    useEffect(() => {
        setPurchaseItemsState(purchaseItemsParams);
        // 체크된 항목 중 리스트에서 사라진 id 정리
        setIsCheckedItems(prev => prev.filter(id => purchaseItemsParams.includes(id)));
    }, [purchaseItemsParams]);

    // 빠른 조회를 위한 id→item 맵
    const [items, setItems] = useState<Array<{ id: number; title: string; image: ImageSourcePropType | null; price: number }>>([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await getItems({ sort: 'CREATED', page: 1, size: 1000 });
                const mapped = res.content.map((it) => ({
                    id: it.id,
                    title: it.name,
                    image: typeof it.imageUrl === 'string' ? null : (it.imageUrl as any) ?? null,
                    price: it.price,
                }));
                if (mounted) setItems(mapped);
            } catch (e) {
                console.warn('구매 화면 아이템 로드 실패:', e);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const itemMap = useMemo(() => {
        const m = new Map<number, { id: number; title: string; image: ImageSourcePropType | null; price: number }>();
        items.forEach((it) => m.set(it.id, it));
        return m;
    }, [items]);

    // 아이템 목록 로드 후, 목록에 존재하지 않는 선택 항목 정리
    useEffect(() => {
        if (items.length === 0) return;
        setIsCheckedItems(prev => prev.filter(id => itemMap.has(id)));
        setPurchaseItemsState(prev => prev.filter(id => itemMap.has(id)));
    }, [items, itemMap]);

    const itemIdToItem = useCallback((id: number) => itemMap.get(id), [itemMap]);

  const invalidSelectedIds = useMemo(() => isCheckedItems.filter((id) => !itemMap.has(id)), [isCheckedItems, itemMap]);
  const sumPrice = useMemo(() => {
        // 존재하는 아이템만 합산하여 경고 로그 제거
        const validIds = isCheckedItems.filter((id) => itemMap.has(id));
        return validIds.reduce((acc, id) => acc + (itemMap.get(id)?.price || 0), 0);
    }, [isCheckedItems, itemMap]);

    const formattedSumPrice = useMemo(() => sumPrice.toLocaleString(), [sumPrice]);

    const handleCheckPress = useCallback((id: number) => {
        setIsCheckedItems(prev => (
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        ));
    }, []);

    const handleXPress = useCallback((id: number) => {
        // 구매 아이템 리스트에서 제거 + 체크에서도 제거
        setPurchaseItemsState(prev => prev.filter(item => item !== id));
        setIsCheckedItems(prev => prev.filter(item => item !== id));
    }, []);

    const resetLocalState = useCallback(() => {
        resetState();
        setIsCheckedItems([]);
        setPurchaseItemsState([]);
        setIsExitAlertVisible(false);
    }, [resetState]);

    const handleBack = useCallback(() => {
        if(isPurchasing) return;
        resetLocalState();
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.popToTop();
    }, [navigation, isPurchasing, resetLocalState]);
    
  const handlePurchase = useCallback(async () => {
        // 아이템 목록이 아직 로드되지 않은 경우 방어
        if (items.length === 0) {
            console.warn('아이템 목록이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        // 유효한 아이템(id→item 맵에 존재)만 구매 대상으로 사용
        const missingIds = isCheckedItems.filter((id) => !itemMap.has(id));
        if (missingIds.length > 0) {
            console.warn('선택한 아이템 중 목록에 없는 항목이 있어 구매를 중단합니다:', missingIds);
            return;
        }
        const validIds = isCheckedItems.filter((id) => itemMap.has(id));
        if (validIds.length === 0) {
            console.warn('구매 대상으로 사용할 유효 아이템이 없습니다.');
            return;
        }
        const sum = validIds.reduce((acc, id) => acc + (itemMap.get(id)?.price || 0), 0);
        console.log('🧾 구매 요청 파라미터:', { itemIds: validIds, expectedTotalPrice: sum });
        await purchaseItems(validIds, sum);
    }, [isCheckedItems, purchaseItems, itemMap, items.length]);

    const goToChargeTab = useCallback(async () => {
        try {
            // 체크된 아이템들을 장바구니에 추가
            if (isCheckedItems.length > 0) {
                await addToCart(isCheckedItems);
                console.log('🛒 장바구니에 아이템 추가됨:', isCheckedItems);
            }
            
            // 홈 탭의 ShopScreen 충전소 탭으로 이동
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                        {
                            name: 'home' as never,
                            state: {
                                routes: [
                                    { name: 'HomeTab' },
                                    { 
                                        name: 'ShopScreen',
                                        params: { initialTab: 'charge' }
                                    }
                                ],
                                index: 1
                            }
                        }
                    ]
                })
            );
            console.log('충전소로 이동 완료');
        } catch (error) {
            console.error('장바구니 추가 실패:', error);
        }
    }, [isCheckedItems, addToCart, navigation]);
    
    return (
        <>
        <Image source={require('../../../../assets/images/my/MyRoomDecorationPurchaseCharacter.png')} style={styles.image} />
        <MyTabTopNavigation
            isEditMode={true}
            onEditModeToggle={() => {setIsExitAlertVisible(true)}}
            onSettingPress={() => {}}
            onHeartPress={() => {}}
            style={styles.header}
        />
        <View style={styles.contentContainer}>
            <View style={styles.contentHeader}>
                <Text style={styles.contentTitle}>구입할 아이템 목록</Text>
                <View style={styles.heartPointHeldContainer}>
                    <Badge title='보유' />
                    <View style={styles.heartPointHeldValue}>
                        <HeartIcon width={24} height={24} />
                        <Text style={styles.heartPointHeldValueText}>{heartPoints}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.contentItemListContainer}>
                <FlatList
                style={styles.contentItemList}
                contentContainerStyle={styles.contentItemListContentContainer}
                data={purchaseItemsState}
                renderItem={({item: itemId, index}) => {
                    const item = itemIdToItem(itemId);
                    if (!item) return null;
                    return (
                        <PurchaseItemList 
                        item={item} 
                        isChecked={isCheckedItems.includes(itemId)}
                        onCheckPress={() => {handleCheckPress(itemId)}}
                        onXPress={() => {handleXPress(itemId)}}
                        />
                        );
                }}
                keyExtractor={(itemId) => `purchase-${itemId}`}
                />
            </View>
             <View style={styles.contentItemListFooter}>
                {isCheckedItems.length > 0 ? (
                <Button
                  icon='heart'
                  title={` ${formattedSumPrice} 구매하기`}
                  variant={isPurchasing ? 'default' : 'active'}
                  size='large'
                  style={{width: '100%'}}
                  disabled={isPurchasing || sumPrice === 0 || invalidSelectedIds.length > 0 || items.length === 0}
                  loading={isPurchasing}
                  onPress={handlePurchase}
                />
                ) : (
                <Button title='선택된 아이템이 없어요!' variant='default' size='large' style={{width: '100%'}} onPress={() => {setIsExitAlertVisible(true)}} />
                )}
             </View>
        </View>
        <CustomAlert
            visible={isSuccessAlertVisible}
            message="구매가 완료되었어요!"
            buttons={[{ text: '확인', onPress: () => handleBack() }]}
            onClose={() => handleBack()}
        />
        <CustomAlert
            visible={isErrorAlertVisible}
            message={errorTitle || '구매에 실패했어요.'}
            subMessage={errorSubMessage}
            buttons={[
                { text: '나중에', onPress: hideErrorAlert },
                { text: '충전소가기', onPress: async () => {
                    hideErrorAlert();
                    // hideErrorAlert가 완료된 후 goToChargeTab 실행
                    setTimeout(async () => {
                        await goToChargeTab();
                    }, 50);
                }}
            ]}
            onClose={hideErrorAlert}
        />
        <CustomAlert
            visible={isExitAlertVisible}
            message="다음에 아이템을 구매할까요?"
            subMessage="보유하지 않은 아이템은 저장할 수 없어요!"
            buttons={[
                { text: '홈으로', onPress: () => handleBack() },
                { text: '머물기', onPress: () => setIsExitAlertVisible(false) }
            ]}
            onClose={() => setIsExitAlertVisible(false)}
        />
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 60,
        left: 0,
        zIndex: 100,
        width: WINDOW_WIDTH,
    },
    image: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -100,
        width: WINDOW_WIDTH,
        height: WINDOW_WIDTH,
    },
    contentContainer: {
        width: '100%',
        height: '100%',
        marginTop: contentStartY,
        backgroundColor: colors.white,
        padding: 20,
        paddingTop: 30,
        borderTopLeftRadius: radius.r20,
        borderTopRightRadius: radius.r20,
        borderWidth: 1,
        borderColor: colors.grayScale100,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.02,
        shadowRadius: 6,
        elevation: 1,
    },
    contentHeader: {
        gap: 10,
        marginBottom: 20,
    },
    contentTitle: {
        ...syongsyongTypography.title5,
    },
    heartPointHeldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    heartPointHeldValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    heartPointHeldValueText: {
        ...typography.body1,
        color: colors.grayScale900,
    },
    contentItemListContainer: {
        height: sv(248),
    },
    contentItemList: {
        gap: 10,
    },
    contentItemListContentContainer: {
        paddingVertical: 20,
        gap: 8,
    },
    contentItem: {
        flexDirection: 'row',
    },
    contentItemImage: {
        width: 80,
        height: 80,
    },
    contentItemInfo: {
        gap: 4,
    },
    contentItemTitle: {
        ...typography.body4,
        color: colors.grayScale900,
    },
    contentItemDescription: {
        ...typography.body4,
        color: colors.grayScale700,
    },
    contentItemListFooter: {
        paddingVertical: 20,
        gap: 8,
    },
});

export default MyRoomDecorationPurchaseScreen;