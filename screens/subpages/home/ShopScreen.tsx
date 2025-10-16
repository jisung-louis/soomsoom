import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Image, FlatList, TouchableOpacity, Alert, ActivityIndicator, InteractionManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../../navigations/tabs/HomeStackNavigator';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { colors } from '../../../constants/colors';
import { syongsyongTypography, typography } from '../../../constants/typography';
import HeartPoint from '../../../components/common/heart-point/HeartPoint';
import { TabMenu } from '../../../components/common/tabmenu/TabMenu';
import { TabView } from 'react-native-tab-view';
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
import CustomBottomSheet from '../../../components/common/bottomsheet/CustomBottomSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Button } from '../../../components/common/buttons/Button';
import HeartPointIcon from '../../../assets/icons/common/Heart.svg';
import Badge from '../../../components/common/badge/Badge';
import { useRewardedAds } from '../../../hooks/useRewardedAds';
import { useToast } from '../../../contexts/ToastContext';
import { RewardedAd, RewardedAdEventType, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { useAuthStore } from '../../../stores/authStore';
import { environmentConfig } from '../../../configs/environment';
import { useAppConfigStore } from '../../../stores/appConfigStore';
import { getUserPoints } from '../../../services/userService';
import { useNotificationQueueProcessor } from '../../../hooks/useNotificationQueueProcessor';

type ShopScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'ShopScreen'>;

// ItemList 컴포넌트는 '../../../components/shop/ItemList'로 분리됨

ItemList.displayName = 'ItemList';

const ShopScreen = () => {
  const navigation = useNavigation<ShopScreenNavigationProp>();
  const route = useRoute<RouteProp<HomeStackParamList, 'ShopScreen'>>();
  // 탭 포커스 시 큐에 있는 알림을 순차적으로 표시
  useNotificationQueueProcessor();
  const { ownedItems } = useRoomStore();
  const { loadOwnedItems } = useOwnedItems();
  
  // ownedItems를 Set으로 변환하여 O(1) 검색 최적화
  const ownedItemsSet = useMemo(() => new Set(ownedItems), [ownedItems]);
  const layout = useWindowDimensions();
  const [excludeOwnedItems, setExcludeOwnedItems] = useState(false);
  const [outOfStockItems, setOutOfStockItems] = useState<number[]>([]);
  const { heartPoints, setHeartPoints } = useCurrencyStore();
  const { showToast } = useToast();
  
  // 보상형 광고 관련
  const { availableAds, watchedAds, isLoading: adsLoading, markAsWatched } = useRewardedAds();
  
  // 사용자 ID 가져오기
  const { getAccessToken } = useAuthStore();

  // 안전한 JWT 디코더 (RN에서 atob가 없을 수 있어 Buffer도 시도)
  const safeDecodeJwt = (token?: string): any | null => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      let jsonStr = '';
      if (typeof atob === 'function') {
        jsonStr = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      } else if (typeof Buffer !== 'undefined') {
        // @ts-ignore Buffer may be global in RN metro env
        jsonStr = Buffer.from(base64, 'base64').toString('utf8');
      }
      return jsonStr ? JSON.parse(jsonStr) : null;
    } catch {
      return null;
    }
  };
  
  // 보상형 광고 인스턴스 생성 함수 (선택된 광고의 adUnitId로 생성)
  const lastAdUnitIdRef = useRef<string | null>(null);
  const createRewardedAd = (adUnitIdParam?: string) => {
    console.log('클릭한 광고의 adUnitId:', adUnitIdParam);
    // JWT 토큰에서 사용자 ID 추출
    const accessToken = getAccessToken();
    let userId = 'anonymous';

    if (accessToken) {
      const payload = safeDecodeJwt(accessToken);
      if (payload) {
        userId = payload.sub || payload.userId || 'anonymous';
        console.log('🔑 사용자 ID:', userId);
      } else {
        console.warn('JWT 토큰 디코딩 실패: payload null');
      }
    }

    // 기기 ID 로깅 (AdMob 테스트 기기 등록 확인용)
    import('react-native-device-info').then(DeviceInfo => {
      DeviceInfo.default.getUniqueId().then(deviceId => {
        console.log('📱 기기 ID (AdMob 테스트 기기 등록용):', deviceId);
      });
    });

    // 선택된 카드에서 전달된 adUnitId 사용 (없으면 마지막 사용값 재사용)
    const adUnitId = adUnitIdParam ?? lastAdUnitIdRef.current;
    if (!adUnitId) {
      console.warn('보상형 광고 adUnitId 미지정: 클릭 이벤트에서 adUnitId를 전달해야 합니다.');
      // @ts-ignore 안전장치
      return null;
    }
    lastAdUnitIdRef.current = adUnitId;

    console.log('📺 광고 단위 ID:', adUnitId);

    // const { canRequestPersonalizedAds } = useAppConfigStore.getState();
    // const requestNonPersonalizedAdsOnly = canRequestPersonalizedAds === false;
    const requestNonPersonalizedAdsOnly = false;

    return RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly,
      serverSideVerificationOptions: {
        userId: userId,
        // SSV 콜백 URL 설정 (서버 엔드포인트)
        // customData: JSON.stringify({
        //   userId: userId,
        //   adUnitId: adUnitId,
        //   timestamp: Date.now(),
        //   ssvCallbackUrl: environmentConfig.ads.ssvCallbackUrl,
        // }),
      },
    });
  };
  
  // 현재 광고 인스턴스 (지연 생성)
  const [rewardedAd, setRewardedAd] = useState<ReturnType<typeof RewardedAd.createForAdRequest> | null>(null);
  const [isAdLoading, setIsAdLoading] = useState<boolean>(false);

  // 현재 광고 컨텍스트 (보상 처리/토스트용)
  const currentAdRef = useRef<{ adId: number; rewardAmount: number } | null>(null);
  
  // 광고 이벤트 리스너 설정
  useEffect(() => {
    if (!rewardedAd) return;
    const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('📺 보상형 광고 로드 완료');
      console.log('📺 광고 로드 상태:', rewardedAd.loaded);
    });

    const unsubscribeEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, async (reward) => {
      console.log('🎁 EARNED_REWARD 이벤트 수신:', reward);
      const ctx = currentAdRef.current;

      // // 프로덕션: SSV 이후 서버 잔액 동기화      
      // try {
      //   const res = await getUserPoints();
      //   setHeartPoints(res.points);
      //   showToast({
      //     amount: reward.amount,
      //     message: '하트 획득했어요!',
      //     theme: 'dark',
      //     iconType: 'heart',
      //     hasAnimation: true,
      //   });
      // } catch (e) {
      //   console.warn('하트 동기화 실패:', e);
      // }
      
      // UI 상에서 해당 광고 카드를 "시청 완료"로 표시 (로컬 상태)
      try { if (ctx) { markAsWatched(ctx.adId); } } catch {}

      currentAdRef.current = null;
      // 광고 사용 후 새로운 광고 객체 생성
      setRewardedAd(createRewardedAd());
    });

    const unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('📺 보상형 광고 닫힘');
      currentAdRef.current = null;
      setRewardedAd(createRewardedAd());
    });

    const unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('❌ 보상형 광고 에러:', error);
      console.error('❌ 에러 상세:', JSON.stringify(error, null, 2));
      showToast({
        message: '광고를 불러올 수 없습니다.',
        theme: 'dark',
        iconType: 'brokenHeart',
      });
      currentAdRef.current = null;
      setRewardedAd(createRewardedAd());
    });

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [rewardedAd, showToast, markAsWatched]);

  // 초기엔 생성하지 않고, 클릭 시 선택한 adUnitId로 생성
  
  // 정렬 드롭다운 상태
  type SortKey = 'POPULAR' | 'LATEST' | 'PRICE_DESC' | 'PRICE_ASC';
  const [sortKey, setSortKey] = useState<SortKey>('POPULAR'); // 디폴트: 구매순
  const sortBottomSheetRef = useRef<BottomSheetModal>(null);
  const handleBack = () => {
    navigation.goBack();
  };

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'item', title: '아이템' },
    { key: 'charge', title: '충전소' },
  ]);

  // initialTab 파라미터에 따라 초기 탭 설정
  useEffect(() => {
    if (route.params?.initialTab) {
      const tabIndex = route.params.initialTab === 'charge' ? 1 : 0;
      setIndex(tabIndex);
    }
  }, [route.params?.initialTab]);
  
  // 아이템 카테고리 탭 메뉴
  const [selectedItemTab, setSelectedItemTab] = useState(0);
  const itemTabMenu: TabMenuItem[] = useMemo(() => ([
    { icon: EntireIcon, title: '전체' },
    { icon: CollectionIcon, title: '컬렉션' },
    { icon: AccessoryIcon, title: '악세사리' },
    { icon: HatIcon, title: '모자' },
    { icon: BackgroundIcon, title: '배경' },
    { icon: RugIcon, title: '러그' },
    { icon: ShelfIcon, title: '선반' },
    { icon: OrnamentIcon, title: '장식품' },
  ]), []);

  const handleItemTabPress = (tabIndex: number) => {
    setSelectedItemTab(tabIndex);
  };


  const handleExcludeOwnedItemsToggle = () => {
    setExcludeOwnedItems(!excludeOwnedItems);
    // TODO: 보유중 제외 기능 구현
  };

  // 보상형 광고 시청 핸들러
  const handleWatchAd = async (adId: number, rewardAmount: number) => {
    try {
      currentAdRef.current = { adId, rewardAmount };
      console.log('📺 광고 시청 시작:', adId);

      // 광고 객체 준비 (없으면 생성)
      // 클릭한 카드의 adUnitId 찾기
      const clicked = availableAds.find(a => a.id === adId) || watchedAds.find(a => a.id === adId);
      const adUnitId = clicked?.adUnitId;
      let ad = rewardedAd;
      if (!ad || adUnitId) {
        const created = createRewardedAd(adUnitId);
        if (!created) throw new Error('광고 인스턴스 생성 실패');
        ad = created;
        setRewardedAd(created);
      }

      // 광고가 이미 로드되어 있으면 바로 표시
      if (ad.loaded) {
        console.log('📺 광고 이미 로드됨, 바로 표시');
        await ad.show();
      } else {
        console.log('📺 광고 로드 중...');

        // 로드 완료를 기다리는 Promise
        const loadPromise = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('광고 로드 타임아웃'));
          }, 10000); // 10초 타임아웃

          const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
            clearTimeout(timeout);
            unsubscribeLoaded();
            resolve();
          });

          const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
            clearTimeout(timeout);
            unsubscribeLoaded();
            unsubscribeError();
            reject(error);
          });
        });

        // 광고 로드 시작
        console.log('📺 광고 로드 요청 시작...');
        setIsAdLoading(true);
        ad.load();

        // 로드 완료까지 대기
        await loadPromise;

        // 광고가 로드되었는지 다시 한번 확인
        if (!ad.loaded) {
          throw new Error('광고가 로드되지 않았습니다.');
        }

        console.log('📺 광고 로드 완료, 표시 중...');
        setIsAdLoading(false);
        await ad.show();
      }
      // 보상 획득 이벤트 리스너 (일회성) 제거됨 - 중앙화된 처리로 이동
    } catch (error) {
      console.error('❌ 광고 시청 실패:', error);
      setIsAdLoading(false);
      showToast({
        message: '광고를 시청할 수 없습니다.',
        theme: 'dark',
        iconType: 'brokenHeart',
      });
    }
  };

  const toggleSortBottomSheet = () => {
    setSortOption(sortKey); // 바텀시트 열 때 현재 정렬 기준으로 초기화
    sortBottomSheetRef.current?.expand();
  };

  const [sortOption, setSortOption] = useState<SortKey>(sortKey);

  const handleSelectSortOption = useCallback((option: SortKey) => {
    setSortOption(option);
  }, []);

  const handleApplySort = useCallback(() => {
    setSortKey(sortOption);
    sortBottomSheetRef.current?.close();
  }, [sortOption]);

  const sortLabel = useMemo(() => {
    switch (sortKey) {
      case 'POPULAR':
        return '구매순';
      case 'LATEST':
        return '최신순';
      case 'PRICE_DESC':
        return '높은순';
      case 'PRICE_ASC':
      default:
        return '낮은순';
    }
  }, [sortKey]);

  // 보유 아이템 체크 함수는 스토어에서 가져옴

  // 서비스에서 불러온 아이템 목록 (서버 스펙 → 화면용으로 매핑)
  const [items, setItems] = useState<RoomItemLike[]>([]);
  const [itemsLoading, setItemsLoading] = useState<boolean>(true);
  
  // isOwned 함수 - 서버에서 받은 isOwned 정보를 우선 사용
  const isOwned = useCallback((itemId: number) => {
    const item = items.find(i => i.id === itemId);
    return item?.isOwned ?? ownedItemsSet.has(itemId);
  }, [items, ownedItemsSet]);

  const handleItemPress = useCallback((item: RoomItemLike) => {
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
  }, [isOwned, navigation]);

  const handleCollectionItemPress = useCallback((collection: RoomItemLike) => {
    if (collection.isCollection) {
      navigation.navigate('ShopItemDetailScreen', { itemId: collection.id, isCollection: true });
    } else {
      navigation.navigate('ShopItemDetailScreen', { itemId: collection.id, isCollection: false });
    }
  }, [navigation]);
  
  // 품절 아이템 목록은 서버 isSoldOut으로 초기화하고,
  // 테스트 토글 시에만 outOfStockItems를 사용합니다.

  // 품절 아이템 체크 함수
  const isOutOfStock = useCallback((itemId: number) => {
    const found = items.find(i => i.id === itemId);
    if (found?.isSoldOut) return true;
    return outOfStockItems.includes(itemId);
  }, [items, outOfStockItems]);
  // 컬렉션 데이터 (화면 마운트 시 선로딩)
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const task = InteractionManager.runAfterInteractions(() => {
      (async () => {
        try {
          setItemsLoading(true);
          const res = await getItems({ sort: 'CREATED', page: 1, size: 60 });
          const mapped: RoomItemLike[] = res.content.map((it) => ({
          id: it.id,
          title: it.name,
          image: typeof it.imageUrl === 'string' && it.imageUrl.length > 0 ? ({ uri: it.imageUrl } as any) : null,
          price: it.price,
          isSoldOut: it.isSoldOut,
          isOwned: it.isOwned, // 서버에서 받은 isOwned 정보 사용
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
        } finally {
          if (mounted) setItemsLoading(false);
        }
      })();
    });
    return () => { mounted = false; task.cancel(); };
  }, []);

  // 컬렉션은 탭 선택 여부와 상관없이 화면 마운트 시 한번 로드 (인터랙션 이후)
  useEffect(() => {
    let mounted = true;
    const task = InteractionManager.runAfterInteractions(() => {
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
    });
    return () => { mounted = false; task.cancel(); };
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
        image: collection.imageUrl ? ({ uri: collection.imageUrl } as any) : null,
        price: collection.purchasePrice,
        type: '컬렉션',
        isCollection: true,
        phrase: collection.phrase,
        ownedItemsCount: collection.ownedItemsCount,
        totalItemsCount: collection.totalItemsCount,
        collectionOwned: collection.isOwned,
      }));
    }

    // 0원 아이템은 보유중인 경우를 제외하고 숨김 (컬렉션 제외)
    if (selectedItemTab !== 1) {
      list = list.filter(item => !(item.price === 0 && !isOwned(item.id)));
    }

    if (excludeOwnedItems) {
      list = list.filter(item => !item.isOwned);
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
  }, [items, selectedItemTab, excludeOwnedItems, sortKey, collections, isOwned]);
  

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
            <BannerItemImage width={'100%'} onPress={() => {setIndex(1)}}/>
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
                <TouchableOpacity style={styles.dropdownSort} onPress={toggleSortBottomSheet}>
                  <Text style={styles.dropdownSortText}>{sortLabel}</Text>
                  <ArrowDropDownIcon color={colors.grayScale800} />
                </TouchableOpacity>
              </View>
            </View>
            {itemTabMenu[selectedItemTab].title === '컬렉션' || itemTabMenu[selectedItemTab].title === '배경' ? (
              <View style={{ marginTop: 10 }}>
                {collectionsLoading ? (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <ActivityIndicator color={colors.primary300} />
                    <Text style={[styles.dropdownSortText, { marginTop: 8 }]}>컬렉션 불러오는 중...</Text>
                  </View>
                ) : (
                  <ItemList
                    filteredItems={filteredItems}
                    onItemPress={handleCollectionItemPress}
                    isOutOfStock={() => false}
                    isOwned={() => false}
                    isCollection
                    isBackground={selectedItemTab === 4}
                  />
                )}
              </View>
            ) : (
              itemsLoading ? (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <ActivityIndicator color={colors.primary300} />
                  <Text style={[styles.dropdownSortText, { marginTop: 8 }]}>아이템 불러오는 중...</Text>
                </View>
              ) : (
                <ItemList 
                  filteredItems={filteredItems}
                  onItemPress={handleItemPress}
                  isOutOfStock={isOutOfStock}
                  isOwned={isOwned}
                  isCollection={false}
                />
              )
            )}
        </ScrollView>
      </View>
    );
  };

  const heartCard = [
    {
      id: 1,
      point: 5,
    },
    {
      id: 2,
      point: 10,
    },
    {
      id: 3,
      point: 15,
    },
  ]

  const renderChargeTab = () => (
    <View style={styles.content}>
      <BannerChargeImage width={layout.width} style={{ marginTop: 30 }}/>
      {isAdLoading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary300} />
          <Text style={[styles.dropdownSortText, { marginTop: 8 }]}>광고 불러오는 중...</Text>
        </View>
      ) : (
      <View style={styles.chargeContent}>
        {/* 보상형 광고 목록 */}
        
        {adsLoading ? (
          <Text style={styles.loadingText}>로딩 중...</Text>
        ) : (
          availableAds.map((ad) => (
            <TouchableOpacity 
              key={ad.id} 
              style={styles.heartCard} 
              onPress={() => handleWatchAd(ad.id, ad.rewardAmount)}
            >
              <HeartPointIcon width={40} height={40} />
              <View style={styles.heartCardContent}>
                <Text style={styles.heartCardText}>{ad.rewardAmount} 하트</Text>
                <Badge
                  title={ad.watchedToday ? '시청 완료' : '광고 시청'}
                  variant={'default'}
                />
              </View>
            </TouchableOpacity>
          ))
        )}
        
        {/* 시청 완료된 광고 (비활성화) */}
        {watchedAds.map((ad) => (
          <View key={`watched-${ad.id}`} style={[styles.heartCard, styles.disabledCard]}>
            <HeartPointIcon width={40} height={40} />
            <View style={styles.heartCardContent}>
              <Text style={styles.heartCardText}>{ad.rewardAmount} 하트</Text>
              <Badge
                title="시청 완료"
                variant="default"
                style={{backgroundColor: colors.grayScale200}}
              />
            </View>
          </View>
        ))}
      </View>
      )}
    </View>
  );

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'item':
        return renderItemTab();
      case 'charge':
        return renderChargeTab();
      default:
        return null;
    }
  };



    return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader 
        onBack={handleBack} 
        style={{paddingHorizontal: 20}} 
        right={<HeartPoint money={heartPoints.toString() } onPress={() => setIndex(1)}/>}
      />
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
      
      {/* 정렬 옵션 바텀시트 */}
      <CustomBottomSheet
        bottomSheetModalRef={sortBottomSheetRef}
        hasXButton
      >
        <View style={styles.sortBottomSheetContent}>
          <View style={styles.sortOptionContainer}>
            <TouchableOpacity 
              style={[styles.sortOption, sortOption === 'POPULAR' && styles.sortOptionSelected]} 
              onPress={() => handleSelectSortOption('POPULAR')}
            >
              <Text style={[styles.sortOptionText, sortOption === 'POPULAR' && styles.sortOptionTextSelected]}>
                구매순
              </Text>
            </TouchableOpacity>
          
            <TouchableOpacity 
              style={[styles.sortOption, sortOption === 'LATEST' && styles.sortOptionSelected]} 
              onPress={() => handleSelectSortOption('LATEST')}
            >
              <Text style={[styles.sortOptionText, sortOption === 'LATEST' && styles.sortOptionTextSelected]}>
                최신순
              </Text>
            </TouchableOpacity>
          
            <TouchableOpacity 
              style={[styles.sortOption, sortOption === 'PRICE_DESC' && styles.sortOptionSelected]} 
              onPress={() => handleSelectSortOption('PRICE_DESC')}
            >
              <Text style={[styles.sortOptionText, sortOption === 'PRICE_DESC' && styles.sortOptionTextSelected]}>
                높은순
              </Text>
            </TouchableOpacity>
          
            <TouchableOpacity 
              style={[styles.sortOption, sortOption === 'PRICE_ASC' && styles.sortOptionSelected]} 
              onPress={() => handleSelectSortOption('PRICE_ASC')}
            >
              <Text style={[styles.sortOptionText, sortOption === 'PRICE_ASC' && styles.sortOptionTextSelected]}>
                낮은순
              </Text>
            </TouchableOpacity>
          </View>
          <Button
            title='적용하기'
            size='large'
            variant='active'
            onPress={handleApplySort}
            style={{width: '100%', marginTop: 42,}}
            />
        </View>
        
      </CustomBottomSheet>
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
  // 정렬 바텀시트 스타일
  sortBottomSheetContent: {
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderRadius: radius.r8,
  },
  sortOptionSelected: {
    backgroundColor: colors.primary50,
  },
  sortOptionText: {
    ...typography.heading7,
    color: colors.grayScale900,
  },
  sortOptionTextSelected: {
    color: colors.primary400,
  },
  sortOptionContainer: {
  },
  chargeContent: {
    padding: 20,
    gap: 12,
  },
  heartCard: {
    width: '100%',
    backgroundColor: colors.grayScale50,
    borderRadius: radius.r8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heartCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heartCardText: {
    ...typography.body4,
    color: colors.grayScale900,
  },
  disabledCard: {
    opacity: 0.5,
  },
  loadingText: {
    ...typography.body4,
    color: colors.grayScale600,
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default ShopScreen;
