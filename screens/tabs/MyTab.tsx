import React, { useEffect, useState, useMemo, useCallback } from 'react';
import UserRoom from '../../components/common/userroom/UserRoom';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/radius';
import { typography } from '../../constants/typography';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MyStackParamList } from '../../navigations/tabs/MyStackNavigator';
import { useRef } from 'react';
import { BottomSheetModal, WINDOW_HEIGHT } from '@gorhom/bottom-sheet';
import { ss, sv, sy } from '../../utils/scale';
import MyTabTopNavigation from '../../components/common/top-navigation/MyTabTopNavigation';
import { useCurrencyStore } from '../../stores/currencyStore';
import { syongsyongTypography } from '../../constants/typography';
import { ToggleButton } from '../../components/common/buttons/ToggleButton';
import ArrowRight from '../../assets/icons/common/arrow_right.svg';
import BadgeEmpty from '../../assets/icons/my/badge_empty.svg';
import BadgeBronze from '../../assets/icons/my/badge_bronze.svg';
import BadgeSilver from '../../assets/icons/my/badge_silver.svg';
import BadgeGold from '../../assets/icons/my/badge_gold.svg';
import BadgeHidden from '../../assets/icons/my/badge_hidden.svg';
import { Button } from '../../components/common/buttons/Button';
import CustomBottomSheet from '../../components/common/bottomsheet/CustomBottomSheet';
import MyRoomDecoration from '../subpages/my/MyRoomDecoration';
import { getItems, updateEquippedItems, getEquippedItems } from '../../services/itemService';
import { useOwnedItems } from '../../hooks/useOwnedItems';
import { objectPosition } from '../../constants/roomLayout';
import { useRoomStore } from '../../stores/roomStore';
import CustomAlert from '../../components/common/alert/CustomAlert';
import { getCachedInstallUuid } from '../../utils/deviceId';
import { usePurchase } from '../../hooks/usePurchase';
import { PurchasedItem } from '../../services/purchaseService';
import { bindAchievementNavigationHandler, bindMyDecorationNavigationHandler, useAchievementStore } from '../../stores/achievementStore';
import { useAppConfigStore } from '../../stores/appConfigStore';
import { getUserActivitySummary, UserActivitySummaryResponse } from '../../services/activityLogService';
import { useAuthStore } from '../../stores/authStore';
import { useAuth } from '../../hooks/useAuth';
import { useBackgroundColor, useBgTopColor } from '../../hooks/useBackgroundColor';
import { eventBus, APP_EVENTS } from '../../utils/eventBus';
import { useNotificationQueueProcessor } from '../../hooks/useNotificationQueueProcessor';
import ToastView from '../../components/common/toast/ToastView';
import { logScreenView } from '../../utils/analytics';

const mockStatusData = [
    { title: '기록', valueType: '회', value: null },
    { title: '운동', valueType: '회', value: null },
    { title: '시간', valueType: 'hh:mm', value: null },
];
const statusCardContentItemWidth = 100 / mockStatusData.length;

const BOTTOM_SHEET_DEFAULT_HEIGHT = (objectPosition.shadow.y + ss(30) + 10) - sv(176);
const BOTTOM_SHEET_HEIGHT = WINDOW_HEIGHT - BOTTOM_SHEET_DEFAULT_HEIGHT; // 고양이 그림자 바로 아래 +10 까지 바텀시트 올림 (Default) + 176(figma 기준) 상단마진
const BOTTOM_SHEET_MIN_HEIGHT = 118 + 20 + 129 + 10 // 바텀시트 탭매뉴 높이(118) + 아이템리스트 컨테이너 패딩 높이(20) + 아이템 칼럼 높이(129) + 아이템 칼럼 하단 마진(10)
const BOTTOM_SHEET_MAX_HEIGHT = 118 + 312 // 바텀시트 탭매뉴 높이(118) + 아이템리스트 컨테이너 높이(312)

const MyTab = () => {
  // 알림 큐 처리 (탭 포커스 시 큐에 있는 알림을 순차적으로 표시)
  useNotificationQueueProcessor();
  
  const navigation = useNavigation<StackNavigationProp<MyStackParamList, 'MyTab'>>();
  const route = useRoute<RouteProp<MyStackParamList, 'MyTab'>>();
  const scrollViewRef = useRef<ScrollView>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // ===== Stores (selectors) =====
  const heartPoints = useCurrencyStore(state => state.heartPoints);
  
  // 업적 데이터 (정의 의존 제거: cache와 userAchievements만 사용)
  const { cache, userAchievements } = useAchievementStore();

  const placedItems = useRoomStore(state => state.placedItems);
  const isOwned = useRoomStore(state => state.isOwned);
  const clearAllPlacedItems = useRoomStore(state => state.clearAllPlacedItems);
  const placeItem = useRoomStore(state => state.placeItem);
  const clearPlacedItems = useRoomStore(state => state.clearPlacedItems);
  const updatePlacedItems = useRoomStore(state => state.updatePlacedItems);

  const [isEditMode, setIsEditMode] = useState(false); // 방 꾸미기 모드 
  const [selectedTab, setSelectedTab] = useState(0);
  const [editModeSelectedItems, setEditModeSelectedItems] = useState<number[]>([]); // 선택된 아이템 ID들
  const [initialSelectedItems, setInitialSelectedItems] = useState<number[]>([]); // 편집 모드 진입 시 초기 선택된 아이템
  const ownedItems = useRoomStore(state => state.ownedItems);
  const [showSaveAlert, setShowSaveAlert] = useState(false); // 저장 알림 표시 여부
  const [itemMap, setItemMap] = useState<Map<number, { positionType: string }>>(new Map());
  const { loadOwnedItems } = useOwnedItems();
  const { useMockApi } = useAppConfigStore.getState();
  const { getAccessToken, role } = useAuthStore();
  
  // 탭 포커스 시 리렌더링 및 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      console.log('👤 MyTab 포커스됨 - 데이터 새로고침');
      
      // Analytics: 화면 조회 추적
      logScreenView('MyTab');
      
      // 디바이스 ID 새로고침 (토큰 변경 시 반영)
      const refreshDeviceId = async () => {
        try {
          const accessToken = getAccessToken();
          if (accessToken) {
            const { decodeJwt } = await import('../../utils/jwt');
            const payload = decodeJwt(accessToken);
            if (payload?.deviceId) {
              setDeviceId(payload.deviceId);
              return;
            }
          }
          
          const id = await getCachedInstallUuid();
          setDeviceId(id);
        } catch (error) {
          console.error('디바이스 ID 새로고침 실패:', error);
        }
      };
      
      refreshDeviceId();
      
      // 요약 데이터 새로고침 (최신 상태 반영)
      const refreshSummary = async () => {
        try {
          if (!getAccessToken()) return;
          const res = await getUserActivitySummary();
          setSummary(res);
        } catch (e) {
          // 무시: 비회원/권한 없음 등
        }
      };
      
      refreshSummary();
    }, [getAccessToken])
  );
  // 장바구니 관련 훅
  const { getCartItems, clearAllCartItems } = usePurchase();
  const { logout } = useAuth();
  // 요약 데이터 상태
  const [summary, setSummary] = useState<UserActivitySummaryResponse | null>(null);

  // 아이템 데이터 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getItems({ sort: 'CREATED', page: 1, size: 200 });
        const map = new Map<number, { positionType: string }>();
        res.content.forEach((it) => {
          map.set(it.id, {
            positionType: it.equipSlot?.toLowerCase() || '',
          });
        });
        if (mounted) setItemMap(map);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // 앱 시작 시 소유 아이템 로드
  useEffect(() => {
    loadOwnedItems();
  }, [loadOwnedItems]);

  // 디바이스 ID 로드 (액세스 토큰에서 추출)
  useEffect(() => {
    const loadDeviceId = async () => {
      try {
        // 액세스 토큰에서 deviceId 추출 시도
        const accessToken = getAccessToken();
        if (accessToken) {
          const { decodeJwt } = await import('../../utils/jwt');
          const payload = decodeJwt(accessToken);
          if (payload?.deviceId) {
            setDeviceId(payload.deviceId);
            return;
          }
        }
        
        // 토큰에서 추출 실패 시 로컬 캐시에서 로드
        const id = await getCachedInstallUuid();
        setDeviceId(id);
      } catch (error) {
        console.error('디바이스 ID 로드 실패:', error);
        setDeviceId('로드 실패');
      }
    };
    loadDeviceId();
  }, [getAccessToken]);

  // 사용자 요약 데이터 로드 (/users/me/summary)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!getAccessToken()) return;
        const res = await getUserActivitySummary();
        if (!mounted) return;
        setSummary(res);
      } catch (e) {
        // 무시: 비회원/권한 없음 등
      }
    })();
    return () => { mounted = false; };
  }, [getAccessToken]);

  // 앱 전역 요약 새로고침 이벤트 구독
  useEffect(() => {
    const unsubscribe = eventBus.on(APP_EVENTS.REFRESH_SUMMARY, async () => {
      try {
        if (!getAccessToken()) return;
        const res = await getUserActivitySummary();
        setSummary(res);
      } catch {}
    });
    return unsubscribe;
  }, [getAccessToken]);

  const formatHhMm = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const statusData = useMemo(() => {
    if (!summary) return mockStatusData;
    return [
      { title: '기록', valueType: '회', value: summary.diaryCount },
      { title: '운동', valueType: '회', value: summary.activityCount },
      { title: '시간', valueType: 'hh:mm', value: formatHhMm(summary.totalActivitySeconds) },
    ];
  }, [summary]);

  // 달성한 업적들 가져오기 (cache 기준) - 최신 달성 순으로 최대 3개만
  const achievedAchievements = useMemo(() => {
    const achieved: Array<{id: number, name: string, grade: string, achievedAt: string | null | undefined}> = [];
    for (const a of Array.from(cache.values())) {
      if (a.isAchieved) {
        achieved.push({ 
          id: a.achievementId, 
          name: a.name, 
          grade: a.grade,
          achievedAt: a.achievedAt 
        });
      }
    }
    
    // achievedAt 기준 내림차순 정렬 (최신 달성 순)
    achieved.sort((a, b) => {
      if (!a.achievedAt && !b.achievedAt) return 0;
      if (!a.achievedAt) return 1; // null은 뒤로
      if (!b.achievedAt) return -1; // null은 뒤로
      return new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime();
    });
    
    // 최대 3개만 반환
    return achieved.slice(0, 3);
  }, [cache]);

  // 업적 데이터 로딩 상태 (cache가 비어있으면 아직 로딩 중)
  const isAchievementsLoading = useMemo(() => {
    return cache.size === 0;
  }, [cache.size]);

  // 3의 배수로 맞추기 위한 데이터 (placeholder 포함) - 최대 3개이므로 간소화
  const achievementDataWithPlaceholders = useMemo(() => {
    const data: Array<{id: number | string, name: string, grade: string}> = [...achievedAchievements];
    const remainder = data.length % 3;
    
    // 최대 3개이므로 0, 1, 2개일 때만 placeholder 추가
    if (remainder !== 0) {
      const placeholdersNeeded = 3 - remainder;
      for (let i = 0; i < placeholdersNeeded; i++) {
        data.push({
          id: `placeholder-${i}`, // 고유한 키를 위한 placeholder ID
          name: '-',
          grade: 'PLACEHOLDER'
        });
      }
    }
    
    return data;
  }, [achievedAchievements]);

  // 뱃지 아이콘 렌더링 함수
  const renderBadgeIcon = (grade: string, width: number = 60, height: number = 60) => {
    switch (grade) {
      case 'BRONZE':
        return <BadgeBronze width={width} height={height} />;
      case 'SILVER':
        return <BadgeSilver width={width} height={height} />;
      case 'GOLD':
        return <BadgeGold width={width} height={height} />;
      case 'SPECIAL':
        return <BadgeHidden width={width} height={height} />;
      case 'PLACEHOLDER':
      default:
        return <BadgeEmpty width={width} height={height} />;
    }
  };

  // 편집 모드 진입 시 선택된 아이템 초기화 (장바구니 포함)
  useEffect(() => {
    if (!isEditMode) return; // 편집 모드가 아닐 때는 실행하지 않음
    
    let mounted = true;
    (async () => {
      try {
        // 1. 현재 배치된 아이템들 수집 (frame 포함: 모두 단일 값 처리)
        const placedItemsList: number[] = [];
        Object.entries(placedItems).forEach(([key, value]) => {
          if (typeof value === 'number') {
            placedItemsList.push(value);
          }
        });

        // 2. 장바구니에서 아이템들 조회
        console.log('🛒 MyTab - 편집 모드 진입: 장바구니 조회 시작');
        const cartData = await getCartItems();
        const cartItemIds: number[] = cartData.items?.map((item: PurchasedItem) => item.id) || [];
        
        if (cartItemIds.length > 0) {
          console.log('🛒 MyTab - 장바구니 아이템 발견:', cartItemIds);
        }

        // 3. 배치된 아이템 + 장바구니 아이템 합치기 (중복 제거)
        const allItems = [...new Set([...placedItemsList, ...cartItemIds])];
        
        if (mounted) {
          setEditModeSelectedItems(allItems);
          // 초기 기준은 '보유 아이템'만 포함해 비교 기준으로 사용
          setInitialSelectedItems(allItems.filter(id => isOwned(id))); // 초기 선택된 아이템 저장(보유분만)
        }
      } catch (error) {
        console.warn('🛒 MyTab - 장바구니 조회 실패:', error);
        // 장바구니 조회 실패 시 기존 로직으로 폴백
        const items: number[] = [];
        Object.entries(placedItems).forEach(([key, value]) => {
          if (value !== null && value !== undefined) items.push(value as number);
        });
        if (mounted) {
          setEditModeSelectedItems(items);
          setInitialSelectedItems(items.filter(id => isOwned(id))); // 초기 선택된 아이템 저장(보유분만)
        }
      }
    })();
    
    return () => { mounted = false; };
  }, [isEditMode, getCartItems, placedItems]);

  // 업적 데이터 폴링 제거: 푸시 기반 동기화로 전환

  // 네비게이션 핸들러 등록 (팝업에서 업적 화면으로 이동할 수 있도록)
  useEffect(() => {
    bindAchievementNavigationHandler(() => {
      console.log('🎯 업적 화면으로 네비게이션 요청됨');
      navigation.navigate('MyAchievementScreen');
    });
    bindMyDecorationNavigationHandler((params) => {
      console.log('🎯 My 꾸미기 화면으로 네비게이션 요청됨', params);
      // 탭 루트로 먼저 이동한 뒤, autoEnterEditMode 전달
      navigation.navigate('MyTab', params as any);
    });
  }, [navigation]);

  // 선택된 아이템 중 미보유 아이템
  const purchaseItems = useMemo(() => {
    return editModeSelectedItems.filter(id => !isOwned(id));
  }, [editModeSelectedItems, isOwned]);
  // 선택된 아이템 중 미보유 아이템 개수 (구매 대상 수)
  const purchaseCount = useMemo(() => {
    if (purchaseItems.length === 0) return 0;
    console.log('🛒 MyTab - 구매 대상 아이템:', purchaseItems);
    return purchaseItems.length;
  }, [purchaseItems]);

  // 버튼 제목은 로직과 분리: 숫자 기준으로 표현만 담당
  const topButtonTitle = purchaseCount === 0 ? '저장' : `구매 (${purchaseCount})`;

  const handleTabPress = useCallback((index: number) => {
    setSelectedTab(index);
  }, []);

  const handleItemSelection = useCallback((itemId: number) => {
    const itemData = itemMap.get(itemId);
    if (!itemData) return;

    setEditModeSelectedItems(prev => {
      // 카테고리당 1개 유지
      const filteredItems = prev.filter(id => {
        const existingItem = itemMap.get(id);
        return existingItem?.positionType !== itemData.positionType;
      });
      const isAlreadySelected = prev.includes(itemId);
      return isAlreadySelected ? filteredItems : [...filteredItems, itemId];
    });
  }, [itemMap]);

  // 컬렉션 아이템들을 한꺼번에 처리하는 함수
  const handleCollectionSelection = useCallback((itemIds: number[]) => {
    console.log('🎨 컬렉션 선택 시작:', itemIds);

    setEditModeSelectedItems(prev => {
      console.log('🔍 컬렉션 선택 상태 확인:', {
        itemIds,
        prev,
        allSelected: itemIds.every(itemId => prev.includes(itemId))
      });
      
      //만약 컬렉션 아이템들이 이미 모두 선택되어 있으면 제거
      if (itemIds.every(itemId => prev.includes(itemId))) {
        const newItems = prev.filter(id => !itemIds.includes(id));
        console.log('✅ 컬렉션 아이템들이 이미 모두 선택되어 있으면 제거:', {
          before: prev,
          after: newItems
        });
        return newItems;
      }
      
      console.log('📋 기존 선택된 아이템들:', prev);
      
      // 컬렉션 아이템들의 positionType을 확인하여 기존 선택된 같은 카테고리 아이템들을 제거
      let newItems = [...prev];
      
      itemIds.forEach(itemId => {
        const itemData = itemMap.get(itemId);
        console.log(`🔍 아이템 ${itemId} 데이터:`, itemData);
        
        if (!itemData) return;
        
        // 같은 카테고리의 기존 아이템들을 제거
        newItems = newItems.filter(id => {
          const existingItem = itemMap.get(id);
          return existingItem?.positionType !== itemData.positionType;
        });
        
        // 카테고리는 1개만 선택 가능
        newItems = [...newItems, itemId];
      });
      
      console.log('✅ 최종 선택된 아이템들:', newItems);
      return newItems;
    });
  }, [itemMap]);

  const enterEditMode = () => {
    setIsEditMode(true);
    setSelectedTab(0);
    const items: number[] = [];
    Object.entries(placedItems).forEach(([key, value]) => {
      if (typeof value === 'number') items.push(value);
    });
    setEditModeSelectedItems(items);
  };

  const exitEditMode = async () => {
    // 장바구니 초기화
    try {
      console.log('🛒 MyTab - 편집 모드 종료: 장바구니 초기화');
      await clearAllCartItems();
    } catch (error) {
      console.warn('🛒 MyTab - 장바구니 초기화 실패:', error);
    }
    
    setIsEditMode(false);
    setSelectedTab(0);
    setEditModeSelectedItems([]);
    setInitialSelectedItems([]);
    setShowSaveAlert(false);
  };

  const saveOrPurchaseItems = () => {
    // 구매 대상이 하나도 없으면 저장, 있으면 구매 플로우
    if (purchaseCount === 0) { //저장
        saveItems();
    } else { // 구매
      // TODO: 구매 플로우 열기 (예: 결제 다이얼로그/상점 이동)
      console.log('구매');
      navigation.navigate('MyRoomDecorationPurchaseScreen', { purchaseItems: purchaseItems });
      setIsEditMode(false);
    }
  };

  const saveItems = async () => {
    try {
      // 인증 토큰 확인 (비로그인/만료 상태 방지)
      if (!getAccessToken()) {
        console.warn('❌ 아이템 저장 불가: 인증 토큰 없음');
        setShowSaveAlert(false);
        exitEditMode();
        return;
      }

      // 1) 보유 아이템만 필터링
      const ownedSelections = editModeSelectedItems.filter(id => isOwned(id));
      
      // 2) positionType별 매핑 (서버에 전송할 형태)
      const itemsToEquip: Partial<Record<'BACKGROUND' | 'EYEWEAR' | 'HAT' | 'FRAME' | 'FLOOR' | 'SHELF', number>> = {};
      const slotKeyMap: Record<string, 'BACKGROUND' | 'EYEWEAR' | 'HAT' | 'FRAME' | 'FLOOR' | 'SHELF'> = {
        background: 'BACKGROUND',
        eyewear: 'EYEWEAR',
        hat: 'HAT',
        frame: 'FRAME',
        floor: 'FLOOR',
        shelf: 'SHELF',
      };
      
      ownedSelections.forEach((itemId) => {
        const itemData = itemMap.get(itemId);
        if (itemData?.positionType) {
          const slot = slotKeyMap[itemData.positionType];
          if (slot) {
            itemsToEquip[slot] = itemId;
          }
        }
      });

      // 3) 서버에 PUT 요청
      await updateEquippedItems({ itemsToEquip });
      
      // 4) 서버에서 최신 상태 GET
      const response = await getEquippedItems();
      
      // 5) 로컬 스토어 업데이트 (EquippedItemsResponse를 placedItems 형태로 변환)
      const equippedItems = {
        background: response.background?.id || null,
        eyewear: response.eyewear?.id || null,
        hat: response.hat?.id || null,
        floor: response.floor?.id || null,
        shelf: response.shelf?.id || null,
        frame: response.frame?.id || null,
      };
      updatePlacedItems(equippedItems);

      console.log('저장 완료 (서버 동기화)');
      setShowSaveAlert(false);
      exitEditMode();
    } catch (error) {
      console.error('아이템 저장 실패:', error);
      // TODO: 에러 처리 (토스트 메시지 등)
    }
  };


  // autoEnterEditMode 파라미터 확인하여 자동으로 편집 모드 시작
  useEffect(() => {
    if (route.params?.autoEnterEditMode) {
      enterEditMode();
      // 파라미터 사용 후 즉시 초기화 (다음 클릭을 위해)
      navigation.setParams({ autoEnterEditMode: undefined });
    }
  }, [route.params?.autoEnterEditMode, navigation]);

  useEffect(() => {
    if (isEditMode) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      // ref가 준비될 때까지 약간의 지연
      setTimeout(() => {
        bottomSheetRef.current?.expand();
      }, 100);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isEditMode]);

  const onBackButtonClick = () => {
    // 비교는 '보유 아이템'만 대상으로 수행
    const ownedCurrent = editModeSelectedItems.filter(id => isOwned(id));
    // 배열을 정렬해서 비교 (순서 무관하게)
    const sortedInitial = [...initialSelectedItems].sort((a, b) => a - b);
    const sortedCurrent = [...ownedCurrent].sort((a, b) => a - b);
    
    // 배열 길이와 내용이 모두 같은지 확인
    const isUnchanged = sortedInitial.length === sortedCurrent.length && 
                       sortedInitial.every((item, index) => item === sortedCurrent[index]);
    
    if (isUnchanged) {
      console.log('🛒 MyTab - 변경사항 없음: 바로 편집 모드 종료');
      exitEditMode();
    } else {
      console.log('🛒 MyTab - 변경사항 있음: 저장 확인 알림 표시');
      setShowSaveAlert(true);
    }
  };

  const isSocialLogin = useMemo(() => {
    return role === 'ROLE_USER';
  }, [role]);

  const [roomBgUri, setRoomBgUri] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const dynamicBgColor = useBackgroundColor(roomBgUri);

  const isBGColorDark = useBgTopColor(roomBgUri);

  const achievementCardHeight = useMemo(() => {
    // 로딩 중이면 기본 높이 사용 (레이아웃 점프 방지)
    if (isAchievementsLoading) {
      return 239; // 빈 업적 카드 높이(239)
    }
    
    const length = achievedAchievements.length;
    if (length === 0) return 239; // 빈 업적 카드 높이(239)
    else {
      const rowCount = Math.ceil(length / 3);
      return 72 + ( 94 * (rowCount)); // 업적 카드 높이(72) + 업적 카드 개수(94) * 행 개수(rowCount)
    }
  }, [achievedAchievements, isAchievementsLoading]);

  return (
    <View style={[styles.container, { backgroundColor: dynamicBgColor }]}>
        <MyTabTopNavigation
            isEditMode={isEditMode}
            onEditModeToggle={onBackButtonClick}
            onSettingPress={() => {navigation.navigate('MySettingScreen')}}
            onHeartPress={() => {}}
            style={styles.topNavigation}
            isBGColorDark={isBGColorDark}
            />
        {useMockApi && (
          <View style={styles.testContainer}>
              <Text style={styles.test}>모드 : {isEditMode ? '방 꾸미기 모드' : '일반 모드'}</Text>
              <Text style={styles.test}>보유 아이템 : {ownedItems.join(',')}</Text>
              <Text style={styles.test}>선택된 아이템 : {editModeSelectedItems.join(',')}</Text>
              <Text style={styles.test}>배치된 아이템 : {(() => {
                const items: number[] = [];
                Object.entries(placedItems).forEach(([key, value]) => {
                  if (typeof value === 'number') items.push(value);
                });
                return items.join(',');
              })()}</Text>
          </View>
        )}
        <UserRoom 
            cropTop={176} 
            scrollable={true}
            scrollViewRef={scrollViewRef as React.RefObject<ScrollView>}
            previewMode={isEditMode}
            previewItemIds={isEditMode ? editModeSelectedItems : []}
            onBackgroundImageUri={setRoomBgUri}
            myTabEditMode={isEditMode}
            achievementCardHeight={achievementCardHeight}
            >
            <View style={{marginTop: sv(176)}}>{/* 176(figma 기준) 아래로 전체 컨텐츠 이동 */}
                {!isEditMode && (
                  <>
                  {!isSocialLogin && (
                    <ToastView
                      message="계정을 연동하면 데이터를 안전하게 저장할 수 있어요!"
                      theme="dark"
                      iconType="none"
                      hasAnimation={false}
                      style={styles.nonmemberToast}
                    />
                  )}
                  <View style={[styles.content, {marginTop: sv(438)}]}>
                      <Button 
                      title="방 꾸미기" 
                      variant='active' 
                      size='large' 
                      textStyle={{...typography.body1}}
                      style={styles.button} 
                      onPress={() => {enterEditMode()}}
                      />
                      <View style={styles.cardContainer}>
                          <View style={styles.statusCardHeader}>
                              <View style={styles.statusCardHeaderLeft}>
                                <Text style={styles.cardHeaderNameText}>야옹이님</Text>
                                <Text style={styles.cardHeaderIdText}>ID : {deviceId || '로드 중...'}</Text>
                              </View>
                              {/* TODO: 연동 기능 추가 */}
                              <View style={styles.statusCardHeaderRight}>
                                <ToggleButton
                                  defaultTitle=""
                                  activeTitle={isSocialLogin ? "연동완료" : "연동하기"}
                                  isActive
                                  checkIcon={isSocialLogin}
                                  onPress={!isSocialLogin ? logout : () => {}}
                                  />
                              </View>
                          </View>
                          <View style={styles.statusCardContent}>
                              {statusData.map((item, index) => (
                              <View style={styles.statusCardContentItem} key={index}>
                                  <Text style={styles.statusCardContentItemTitle}>{item.title}</Text>
                                  <Text style={styles.statusCardContentItemValue}>{item.valueType === 'hh:mm' ? (item.value === '00:00' ? '-' : item.value) : (item.value === 0 ? '-' : `${item.value}${item.valueType}`)}</Text>
                              </View>
                              ))}
                          </View>
                      </View>

                      <View style={styles.cardContainer}>
                          <TouchableOpacity style={styles.achievementCardHeader} onPress={() => {navigation.navigate('MyAchievementScreen')}}>
                              <Text style={{...syongsyongTypography.title5}}>업적</Text>
                              <ArrowRight width={28} height={28} fill={colors.grayScale800} />
                          </TouchableOpacity>
                          {achievedAchievements.length > 0 ? (
                              <FlatList
                                data={achievementDataWithPlaceholders}
                                renderItem={({ item: achievement }) => (
                                  <View style={styles.achievementItem}>
                                    {renderBadgeIcon(achievement.grade, 48, 48)}
                                    <Text style={styles.achievementName} numberOfLines={1}>
                                      {achievement.name}
                                    </Text>
                                  </View>
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                numColumns={3}
                                scrollEnabled={false}
                                contentContainerStyle={styles.achievementGrid}
                                columnWrapperStyle={styles.achievementRow}
                              />
                          ) : (
                            <View style={styles.achievementCardNoContent}>
                              <BadgeEmpty width={100} height={100} />
                              <Text style={{...syongsyongTypography.title6}}>완료한 업적이 없어요!</Text>
                            </View>
                          )}
                      </View>
                  </View>
                  </>
                )}
            </View>
        </UserRoom>
        
      <CustomBottomSheet
        children={
          <View style={styles.bottomSheetContent}>
            <MyRoomDecoration 
              selectedTab={selectedTab} 
              handleTabPress={handleTabPress}
              selectedItems={editModeSelectedItems}
              onItemSelection={handleItemSelection}
              onCollectionSelection={handleCollectionSelection}
            />
          </View>
        }
        hasBackDrop={false}
        bottomSheetModalRef={bottomSheetRef}
        enablePanDownToClose={false}
        hasXButton={false}
        enableOverDrag={false}
        hasTopButton = {isEditMode}
        topButtonTitle={topButtonTitle}
        onTopButtonPress={() => {saveOrPurchaseItems()}}
        topButtonOffset={20}
      />
      <CustomAlert
        visible={showSaveAlert}
        message="변경사항을 저장할까요?"
        buttons={[
          { text: '저장 안하기', onPress: () => { exitEditMode(); } },
          { text: '저장하기', onPress: () => { saveItems(); } }
        ]}
        onClose={() => setShowSaveAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topNavigation: {
    position: 'absolute',
    top: 60,
    zIndex: 100,
  },
  testContainer:{
    position: 'absolute',
    top: 100,
    left: 20,
    zIndex: 100,
    backgroundColor: colors.white,
  },
  test:{
    ...typography.body6,
    color: colors.grayScale900,
  },
  button: {
    marginBottom: 10,
    width: '100%',
  },
  nonmemberToast: {
    position: 'absolute',
    top: sy(386),
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  cardContainer: {
    marginTop: 10,
    backgroundColor: colors.white,
    padding: 20,
    gap: 20,
    borderRadius: radius.r12,
  },
  statusCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusCardHeaderLeft: {
    flexShrink: 1,
    gap: 2,
  },
  statusCardHeaderRight: {
  },
  cardHeaderNameText: {
    ...typography.heading9,
    color: colors.grayScale900,
  },
  cardHeaderIdText: {
    ...typography.body5,
    color: colors.grayScale600,
  },
  statusCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achievementGrid: {
    gap: 20,
  },
  achievementRow: {
    justifyContent: 'flex-start',
    gap: 20,
  },
  achievementItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  achievementName: {
    ...typography.body5,
    color: colors.grayScale800,
    textAlign: 'center',
  },
  achievementCardNoContent: {
    alignItems: 'center',
    gap: 20,
  },
  statusCardContentItem: {
    alignItems: 'center',
    width: `${statusCardContentItemWidth}%`,
  },
  statusCardContentItemTitle: {
    ...typography.body4,
    color: colors.grayScale800,
  },
  statusCardContentItemValue: {
    ...typography.body1,
    color: colors.grayScale800,
  },
  bottomSheetContent: { 
    height: BOTTOM_SHEET_HEIGHT,
    minHeight: BOTTOM_SHEET_MIN_HEIGHT,
    maxHeight: BOTTOM_SHEET_MAX_HEIGHT,
  },
});


export default MyTab;