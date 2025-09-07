import React, { useEffect, useState, useMemo, useCallback } from 'react';
import UserRoom from '../../components/common/userroom/UserRoom';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
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
import { Button } from '../../components/common/buttons/Button';
import CustomBottomSheet from '../../components/common/bottomsheet/CustomBottomSheet';
import MyRoomDecoration from '../subpages/my/MyRoomDecoration';
import { roomItemList } from '../../data/roomItemData';
import { objectPosition } from '../../constants/roomLayout';
import { useRoomStore } from '../../stores/roomStore';
import CustomAlert from '../../components/common/alert/CustomAlert';

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

  const placedItems = useRoomStore(state => state.placedItems);
  const isOwned = useRoomStore(state => state.isOwned);
  const clearAllPlacedItems = useRoomStore(state => state.clearAllPlacedItems);
  const placeItem = useRoomStore(state => state.placeItem);
  const clearPlacedItems = useRoomStore(state => state.clearPlacedItems);
  const updatePlacedItems = useRoomStore(state => state.updatePlacedItems);

  const [isEditMode, setIsEditMode] = useState(false); // 방 꾸미기 모드 
  const [selectedTab, setSelectedTab] = useState(0);
  const [editModeSelectedItems, setEditModeSelectedItems] = useState<number[]>([]); // 선택된 아이템 ID들
  const [showSaveAlert, setShowSaveAlert] = useState(false); // 저장 알림 표시 여부

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
    const itemData = roomItemList.find(item => item.id === itemId);
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
            const existingItem = roomItemList.find(item => item.id === id);
            return existingItem?.positionType === 'frame';
          });
          
          if (currentFrameItems.length < 2) {
            return [...prev, itemId];
          } else {
            // 이미 2개가 선택된 경우 첫 번째 것을 제거하고 새 것으로 교체
            const otherItems = prev.filter(id => {
              const existingItem = roomItemList.find(item => item.id === id);
              return existingItem?.positionType !== 'frame';
            });
            return [...otherItems, currentFrameItems[1], itemId];
          }
        }
      } else {
        // 다른 카테고리의 경우 기존 로직 (1개만 선택 가능)
        const filteredItems = prev.filter(id => {
          const existingItem = roomItemList.find(item => item.id === id);
          return existingItem?.positionType !== itemData.positionType;
        });

        // 현재 아이템이 이미 선택되어 있다면 제거, 아니면 추가
        const isAlreadySelected = prev.includes(itemId);
        return isAlreadySelected ? filteredItems : [...filteredItems, itemId];
      }
    });
  }, []);

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
      const itemData = roomItemList.find((it) => it.id === itemId);
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
    }
  }, [route.params?.autoEnterEditMode]);

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
                        <View style={styles.achievementCardNoContent}>{/*사용자의 뱃지 유무에 따라서 분기*/}
                            <BadgeEmpty width={100} height={100} />
                            <Text style={{...syongsyongTypography.title6}}>완료한 업적이 없어요!</Text>
                        </View>
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
    alignItems: 'center',
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