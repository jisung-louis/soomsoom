import React, { useEffect, useState, useMemo, useCallback } from 'react';
import UserRoom from '../../components/common/userroom/UserRoom';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/radius';
import { typography } from '../../constants/typography';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MyStackParamList } from '../../navigations/tabs/MyStackNavigator';
import { useRef } from 'react';
import { BottomSheetModal, WINDOW_HEIGHT } from '@gorhom/bottom-sheet';
import { ss, sv } from '../../utils/scale';
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
import { getItems } from '../../services/itemService';
import { useOwnedItems } from '../../hooks/useOwnedItems';
import { objectPosition } from '../../constants/roomLayout';
import { useRoomStore } from '../../stores/roomStore';
import CustomAlert from '../../components/common/alert/CustomAlert';
import { bindAchievementNavigationHandler, useAchievementStore } from '../../stores/achievementStore';
import LottieView from 'lottie-react-native';

const mockStatusData = [
    { title: '기록', valueType: '회', value: 0 },
    { title: '운동', valueType: '회', value: 0 },
    { title: '시간', valueType: 'mm:ss', value: '00:00' },
];
const statusCardContentItemWidth = 100 / mockStatusData.length;

const BOTTOM_SHEET_DEFAULT_HEIGHT = (objectPosition.shadow.y + ss(30) + 10) - sv(176);
const BOTTOM_SHEET_HEIGHT = WINDOW_HEIGHT - BOTTOM_SHEET_DEFAULT_HEIGHT; // 고양이 그림자 바로 아래 +10 까지 바텀시트 올림 (Default) + 176(figma 기준) 상단마진
const BOTTOM_SHEET_MIN_HEIGHT = 118 + 20 + 129 + 10 // 바텀시트 탭매뉴 높이(118) + 아이템리스트 컨테이너 패딩 높이(20) + 아이템 칼럼 높이(129) + 아이템 칼럼 하단 마진(10)
const BOTTOM_SHEET_MAX_HEIGHT = 118 + 312 // 바텀시트 탭매뉴 높이(118) + 아이템리스트 컨테이너 높이(312)

const MyTab = () => {
  const navigation = useNavigation<StackNavigationProp<MyStackParamList, 'MyTab'>>();
  const route = useRoute<RouteProp<MyStackParamList, 'MyTab'>>();
  const scrollViewRef = useRef<ScrollView>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // ===== Stores (selectors) =====
  const heartPoints = useCurrencyStore(state => state.heartPoints);
  
  // 업적 데이터
  const { achievementDefinitions, cache, userAchievements, scheduleCheck } = useAchievementStore();

  const placedItems = useRoomStore(state => state.placedItems);
  const isOwned = useRoomStore(state => state.isOwned);
  const clearAllPlacedItems = useRoomStore(state => state.clearAllPlacedItems);
  const placeItem = useRoomStore(state => state.placeItem);
  const clearPlacedItems = useRoomStore(state => state.clearPlacedItems);
  const updatePlacedItems = useRoomStore(state => state.updatePlacedItems);

  const [isEditMode, setIsEditMode] = useState(false); // 방 꾸미기 모드 
  const [selectedTab, setSelectedTab] = useState(0);
  const [editModeSelectedItems, setEditModeSelectedItems] = useState<number[]>([]); // 선택된 아이템 ID들
  const ownedItems = useRoomStore(state => state.ownedItems);
  const [showSaveAlert, setShowSaveAlert] = useState(false); // 저장 알림 표시 여부
  const [itemMap, setItemMap] = useState<Map<number, { positionType: string }>>(new Map());
  const { loadOwnedItems } = useOwnedItems();

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

  // 달성한 업적들 가져오기
  const achievedAchievements = useMemo(() => {
    const achieved: Array<{id: number, name: string, grade: string}> = [];
    
    // cache 우선, userAchievements 백업
    Array.from(achievementDefinitions.keys()).forEach(achievementId => {
      let isAchieved = false;
      
      if (cache.has(achievementId)) {
        const cacheData = cache.get(achievementId);
        isAchieved = cacheData?.isAchieved ?? false;
      } else {
        const userAchievement = userAchievements.get(achievementId);
        isAchieved = userAchievement?.isAchieved ?? false;
      }
      
      if (isAchieved) {
        const achievement = achievementDefinitions.get(achievementId);
        if (achievement) {
          achieved.push({
            id: achievementId,
            name: achievement.name,
            grade: achievement.grade
          });
        }
      }
    });
    
    return achieved;
  }, [achievementDefinitions, cache, userAchievements]);

  // 3의 배수로 맞추기 위한 데이터 (placeholder 포함)
  const achievementDataWithPlaceholders = useMemo(() => {
    const data: Array<{id: number | string, name: string, grade: string}> = [...achievedAchievements];
    const remainder = data.length % 3;
    
    if (remainder !== 0) {
      const placeholdersNeeded = 3 - remainder;
      for (let i = 0; i < placeholdersNeeded; i++) {
        data.push({
          id: `placeholder-${i}`, // 고유한 키를 위한 placeholder ID
          name: '',
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
        return <LottieView
          source={require('../../assets/animations/badge/bronze_action.json')}
          autoPlay
          loop
          style={{ width, height }}
        />;
      case 'SILVER':
        return <LottieView
          source={require('../../assets/animations/badge/silver_action.json')}
          autoPlay
          loop
          style={{ width, height }}
        />;
      case 'GOLD':
        return <LottieView
          source={require('../../assets/animations/badge/gold_action.json')}
          autoPlay
          loop
          style={{ width, height }}
        />;
      case 'SPECIAL':
        return <LottieView
          source={require('../../assets/animations/badge/hidden_action.json')}
          autoPlay
          loop
          style={{ width, height }}
        />;
      case 'PLACEHOLDER':
        return <View style={{ width, height }} />; // 투명 placeholder
      default:
        return <BadgeEmpty width={width} height={height} />;
    }
  };

  useEffect(() => {
    const items: number[] = [];
    Object.entries(placedItems).forEach(([key, value]) => {
      if (key === 'frame' && Array.isArray(value)) {
        // frame 배열의 경우 각 요소를 개별적으로 처리
        value.forEach(item => {
          if (item !== null) items.push(item);
        });
      } else if (value !== null && value !== undefined) {
        // 다른 카테고리는 기존 로직
        items.push(value as number);
      }
    });
    setEditModeSelectedItems(items);
  }, []);

  // 업적 데이터 가져오기 (MyTab 마운트 시)
  useEffect(() => {
    console.log('🏆 MyTab 마운트: 업적 데이터 가져오기 시작');
    scheduleCheck(500); // 500ms 후 업적 체크
  }, [scheduleCheck]);

  // 네비게이션 핸들러 등록 (팝업에서 업적 화면으로 이동할 수 있도록)
  useEffect(() => {
    bindAchievementNavigationHandler(() => {
      console.log('🎯 업적 화면으로 네비게이션 요청됨');
      navigation.navigate('MyAchievementScreen');
    });
  }, [navigation]);

  // 선택된 아이템 중 미보유 아이템
  const purchaseItems = useMemo(() => {
    return editModeSelectedItems.filter(id => !isOwned(id));
  }, [editModeSelectedItems, isOwned]);
  // 선택된 아이템 중 미보유 아이템 개수 (구매 대상 수)
  const purchaseCount = useMemo(() => {
    if (purchaseItems.length === 0) return 0;
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
      // frame의 경우 특별 처리 (2개까지 선택 가능)
      if (itemData.positionType === 'frame') {
        const isAlreadySelected = prev.includes(itemId);
        
        if (isAlreadySelected) {
          // 이미 선택된 경우 제거
          return prev.filter(id => id !== itemId);
        } else {
          // 선택되지 않은 경우 추가 (최대 2개 제한)
            const currentFrameItems = prev.filter(id => {
              const existingItem = itemMap.get(id);
              return existingItem?.positionType === 'frame';
            });
          
          if (currentFrameItems.length < 2) {
            return [...prev, itemId];
          } else {
            // 이미 2개가 선택된 경우 첫 번째 것을 제거하고 새 것으로 교체
            const otherItems = prev.filter(id => {
              const existingItem = itemMap.get(id);
              return existingItem?.positionType !== 'frame';
            });
            return [...otherItems, currentFrameItems[1], itemId];
          }
        }
      } else {
        // 다른 카테고리의 경우 기존 로직 (1개만 선택 가능)
        const filteredItems = prev.filter(id => {
          const existingItem = itemMap.get(id);
          return existingItem?.positionType !== itemData.positionType;
        });

        // 현재 아이템이 이미 선택되어 있다면 제거, 아니면 추가
        const isAlreadySelected = prev.includes(itemId);
        return isAlreadySelected ? filteredItems : [...filteredItems, itemId];
      }
    });
  }, [itemMap]);

  const enterEditMode = () => {
    setIsEditMode(true);
    const items: number[] = [];
    Object.entries(placedItems).forEach(([key, value]) => {
      if (key === 'frame' && Array.isArray(value)) {
        // frame 배열의 경우 각 요소를 개별적으로 처리
        value.forEach(item => {
          if (item !== null) items.push(item);
        });
      } else if (value !== null && value !== undefined) {
        // 다른 카테고리는 기존 로직
        items.push(value as number);
      }
    });
    setEditModeSelectedItems(items);
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setEditModeSelectedItems([]);
    setShowSaveAlert(false);
  };

  const saveOrPurchaseItems = () => {
    // 구매 대상이 하나도 없으면 저장, 있으면 구매 플로우
    if (purchaseCount === 0) { //저장
        setShowSaveAlert(true);
    } else { // 구매
      // TODO: 구매 플로우 열기 (예: 결제 다이얼로그/상점 이동)
      console.log('구매');
      navigation.navigate('MyRoomDecorationPurchaseScreen', { purchaseItems: purchaseItems });
      setIsEditMode(false);
    }
  };

  const saveItems = () => {
    // TODO: 저장 API 연동
    // 1) 선택이 비어 있으면 전체 제거
    if (editModeSelectedItems.length === 0) {
      clearAllPlacedItems();
      setShowSaveAlert(false);
      console.log('저장 완료 (선택 아이템 없음)');
      exitEditMode();
      return;
    }

    // 2) positionType별 nextMap 구성
    const nextMap: Record<string, number | number[]> = {};
    const frameItems: number[] = [];
    
    editModeSelectedItems.forEach((itemId) => {
      const itemData = itemMap.get(itemId);
      if (itemData) {
        if (itemData.positionType === 'frame') {
          frameItems.push(itemId);
        } else {
          nextMap[itemData.positionType as string] = itemId;
        }
      }
    });
    
    // frame 배열 처리
    if (frameItems.length > 0) {
      nextMap.frame = frameItems;
    }

    // 3) 현재 배치와 비교해 변경분만 추출 (제거는 null로 표시)
    const updates: Record<string, number | [number | null, number | null] | null> = {};

    // 제거 대상 (현재에는 있는데 next엔 없는 키)
    Object.keys(placedItems).forEach((pt) => {
      if (!Object.prototype.hasOwnProperty.call(nextMap, pt)) {
        updates[pt] = pt === 'frame' ? [null, null] as [number | null, number | null] : null;
      }
    });
    
    // 업서트 대상 (값이 다르거나 새로 생긴 키)
    Object.entries(nextMap).forEach(([pt, value]) => {
      const currentValue = placedItems[pt as keyof typeof placedItems];
      if (pt === 'frame') {
        const currentFrame = Array.isArray(currentValue) ? currentValue : [null, null];
        const newFrame = Array.isArray(value) ? value : [null, null];
        // 배열 비교
        if (JSON.stringify(currentFrame) !== JSON.stringify(newFrame)) {
          updates[pt] = newFrame as [number | null, number | null];
        }
      } else {
        if (currentValue !== value) {
          updates[pt] = value as number;
        }
      }
    });

    // 4) 부분 갱신
    if (Object.keys(updates).length > 0) {
      updatePlacedItems(updates as any);
    }

    console.log('저장 완료 (부분 갱신)');
    setShowSaveAlert(false);
    exitEditMode();
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
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isEditMode]);

  return (
    <View style={styles.container}>
        <MyTabTopNavigation
            isEditMode={isEditMode}
            onEditModeToggle={() => {exitEditMode()}}
            onSettingPress={() => {navigation.navigate('MySettingScreen')}}
            onHeartPress={() => {}}
            style={styles.topNavigation}
            />
        {__DEV__ && (
          <View style={styles.testContainer}>
              <Text style={styles.test}>모드 : {isEditMode ? '방 꾸미기 모드' : '일반 모드'}</Text>
              <Text style={styles.test}>보유 아이템 : {ownedItems.join(',')}</Text>
              <Text style={styles.test}>선택된 아이템 : {editModeSelectedItems.join(',')}</Text>
              <Text style={styles.test}>배치된 아이템 : {(() => {
                const items: number[] = [];
                Object.entries(placedItems).forEach(([key, value]) => {
                  if (key === 'frame' && Array.isArray(value)) {
                    // frame 배열의 경우 각 요소를 개별적으로 처리
                    value.forEach(item => {
                      if (item !== null) items.push(item);
                    });
                  } else if (value !== null && value !== undefined) {
                    // 다른 카테고리는 기존 로직
                    items.push(value as number);
                  }
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
            >
            <View style={{marginTop: sv(176)}}>{/* 176(figma 기준) 아래로 전체 컨텐츠 이동 */}
                {!isEditMode && (
                <View style={[styles.content, {marginTop: sv(438)}]}>
                    <Button 
                    title="방 꾸미기" 
                    variant='active' 
                    size='large' 
                    style={styles.button} 
                    onPress={() => {enterEditMode()}}
                    />
                    <View style={styles.cardContainer}>
                        <View style={styles.statusCardHeader}>
                            <View style={styles.statusCardHeaderLeft}>
                            <Text style={styles.cardHeaderNameText}>야옹이님</Text>
                            <Text style={styles.cardHeaderIdText}>ID : Timestamp</Text>
                            </View>
                            {/* TODO: 연동 기능 추가 */}
                            <ToggleButton
                              defaultTitle=""
                              activeTitle="연동하기"
                              isActive={true}
                              onPress={() => {}}
                            />
                        </View>
                        <View style={styles.statusCardContent}>
                            {mockStatusData.map((item, index) => (
                            <View style={styles.statusCardContentItem} key={index}>
                                <Text style={styles.statusCardContentItemTitle}>{item.title}</Text>
                                <Text style={styles.statusCardContentItemValue}>{item.valueType === 'mm:ss' ? item.value : `${item.value}${item.valueType}`}</Text>
                            </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.cardContainer}>
                        <TouchableOpacity style={styles.achievementCardHeader} onPress={() => {navigation.navigate('MyAchievementScreen')}}>
                            <Text style={{...syongsyongTypography.title5}}>업적</Text>
                            <ArrowRight width={24} height={24} fill={colors.grayScale800} />
                        </TouchableOpacity>
                        {achievedAchievements.length > 0 ? (
                          <View style={styles.achievementCardContent}>
                            <FlatList
                              data={achievementDataWithPlaceholders}
                              renderItem={({ item: achievement }) => (
                                <View style={styles.achievementItem}>
                                  {renderBadgeIcon(achievement.grade, 48, 48)}
                                  {achievement.grade !== 'PLACEHOLDER' && (
                                    <Text style={styles.achievementName} numberOfLines={2}>
                                      {achievement.name}
                                    </Text>
                                  )}
                                </View>
                              )}
                              keyExtractor={(item) => item.id.toString()}
                              numColumns={3}
                              scrollEnabled={false}
                              contentContainerStyle={styles.achievementGrid}
                              columnWrapperStyle={styles.achievementRow}
                            />
                          </View>
                        ) : (
                          <View style={styles.achievementCardNoContent}>
                            <BadgeEmpty width={100} height={100} />
                            <Text style={{...syongsyongTypography.title6}}>완료한 업적이 없어요!</Text>
                          </View>
                        )}
                    </View>
                </View>
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
    backgroundColor: colors.grayScale200, //TODO:추후 UserRoom의 배경이미지의 하단 컬러로 변경
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
    gap: 2,
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
  achievementCardContent: {
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