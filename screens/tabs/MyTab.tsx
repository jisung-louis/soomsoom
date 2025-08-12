import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '../../constants/colors';
import { Button } from '../../components/common/buttons/Button';
import { radius } from '../../constants/radius';
import { ToggleButton } from '../../components/common/buttons/ToggleButton';
import { syongsyongTypography, typography } from '../../constants/typography';
import ArrowRight from '../../assets/icons/common/arrow_right.svg'; 
import BadgeEmpty from '../../assets/icons/my/badge_empty.svg';
import { MyStackParamList } from '../../navigations/tabs/MyStackNavigator';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LottieView from 'lottie-react-native';
import CustomBottomSheet from '../../components/common/bottomsheet/CustomBottomSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import MyRoomDecoration from '../subpages/my/MyRoomDecoration';
import { ButtonSmall } from '../../components/common/buttons/ButtonSmall';
import MyTabTopNavigation from '../../components/common/top-navigation/MyTabTopNavigation';
import { roomItemList, RoomItem, IN_POSSESSION_ITEMS, getItemPosition } from '../../data/roomItemData';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const cat = {
  x: screenWidth * 0.28,
  y: screenHeight * 0.22,
  height: 200,
  width: 200,
}
const BOTTOM_SHEET_HEIGHT = screenHeight - (cat.y + cat.height)
const BOTTOM_SHEET_MIN_HEIGHT = 300
const BOTTOM_SHEET_MAX_HEIGHT = screenHeight * 0.5

// 아이템 배치 관련 상수
const ITEM_SIZE = 80;

const mockStatusData = [
  { title: '기록', valueType: '회', value: 0 },
  { title: '운동', valueType: '회', value: 0 },
  { title: '시간', valueType: 'mm:ss', value: '00:00' },
];
const statusCardContentItemWidth = 100 / mockStatusData.length;

// 아이템 데이터 타입 (RoomItem에서 필요한 속성만 추출)
type PlacedItem = {
  id: number;
  x: number;
  y: number;
  title: string;
  image: any;
  type: string;
};

const MyTab = () => {
  const navigation = useNavigation<StackNavigationProp<MyStackParamList>>();
  const scrollViewRef = useRef<ScrollView>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const catLottieRef = useRef<LottieView>(null); // 고양이 LottieView ref

  const [isEditMode, setIsEditMode] = useState(false); // 방 꾸미기 모드 
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]); // 선택된 아이템 ID들
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]); // 배치된 아이템들

  const handleTabPress = (index: number) => {
    setSelectedTab(index);
  };

  // 아이템 선택/해제 핸들러 (positionType당 하나만 선택 가능)
  const handleItemSelection = (itemId: number) => {
    const itemData = roomItemList.find(item => item.id === itemId);
    if (!itemData) return;

    setSelectedItems(prev => {
      // 같은 positionType의 기존 아이템 제거
      const filteredItems = prev.filter(id => {
        const existingItem = roomItemList.find(item => item.id === id);
        return existingItem?.positionType !== itemData.positionType;
      });

      // 현재 아이템이 이미 선택되어 있다면 제거, 아니면 추가
      const isAlreadySelected = prev.includes(itemId);
      if (isAlreadySelected) {
        return filteredItems; // 제거만
      } else {
        return [...filteredItems, itemId]; // 기존 것 제거하고 새 것 추가
      }
    });
  };

  useEffect(() => {
    if (isEditMode) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isEditMode]);

  // 컴포넌트 마운트 시 고양이 애니메이션 시작
  useEffect(() => {
    // 고양이 애니메이션 시작
    catLottieRef.current?.play();
  }, []);

  // selectedItems가 변경될 때마다 placedItems 업데이트
  useEffect(() => {
    // 선택된 아이템들을 고정 위치에 배치
    const newPlacedItems: PlacedItem[] = selectedItems.map((itemId, index) => {
      // 실제 아이템 데이터에서 정보 가져오기
      const itemData = roomItemList.find(item => item.id === itemId);
      if (!itemData) return null;
      
      // 아이템의 고정 위치를 동적으로 계산
      const position = getItemPosition(cat.x, cat.y, itemData.positionType, index);
      
      return {
        id: itemId,
        x: position.x,
        y: position.y,
        title: itemData.title,
        image: itemData.image,
        type: itemData.type,
      };
    }).filter(Boolean) as PlacedItem[];
    
    setPlacedItems(newPlacedItems);
    
    // 새로운 아이템들이 배치되면 고양이 애니메이션 재시작
    if (newPlacedItems.length > 0) {
      // 고양이 애니메이션을 처음부터 재시작
      catLottieRef.current?.reset();
      catLottieRef.current?.play();
    }
  }, [selectedItems]);

  return (
  <View style={styles.container}>
    <MyTabTopNavigation
      isEditMode={isEditMode}
      money="1.5M"
      onEditModeToggle={() => {setIsEditMode(!isEditMode)}}
      onSettingPress={() => {navigation.navigate('MySettingScreen')}}
      onHeartPress={() => {}}
      style={styles.topNavigation}
    />
    <ScrollView 
      ref={scrollViewRef}
      style={styles.scrollView} 
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={{ paddingBottom: 150}}
      >
        {/* 배경 이미지 */}
        <View style={{ width:screenWidth, overflow: 'hidden', transform: [{ translateY: -140 }] }}>
          <Image
            source={require('../../assets/images/background.png')}
            style={{ width: screenWidth, height: screenWidth * 2.0302 }}// 배경이미지 비율 : 1:2.0302 
            resizeMode="cover"
          />
        </View>
        <View style={styles.catAnimationContainer}>
          <LottieView
            ref={catLottieRef}
            source={require('../../assets/animations/cat_basic_motion.json')}
            autoPlay={false}
            loop
            style={{ width: '100%', height: '100%' }}
          />
        </View>
        
        {/* 배치된 아이템들 렌더링 */}
        {placedItems.map((item) => (
          <View
            key={item.id}
            style={[
              styles.placedItem,
              {
                left: item.x,
                top: item.y,
              }
            ]}
          >
            {item.image === null ? (
              <View style={styles.placedItemPlaceholder} />
            ) : (
              <LottieView
                source={item.image}
                autoPlay
                loop
                style={styles.placedItemImage}
              />
            )}
          </View>
        ))}

        {!isEditMode && (
          <View style={styles.content}>
            <Button 
            title="방 꾸미기" 
            variant='active' 
            size='large' 
            style={styles.button} 
            onPress={() => {
              setIsEditMode(true);
            }}
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
    </ScrollView>
    {isEditMode && (
      <View style={styles.saveButtonContainer}>
        <ButtonSmall title='저장' variant='active' onPress={() => {
          setIsEditMode(false);
        }} />
      </View>
    )}
    <CustomBottomSheet
      children={
        <View style={styles.bottomSheetContent}>
          <MyRoomDecoration 
            selectedTab={selectedTab} 
            handleTabPress={handleTabPress}
            selectedItems={selectedItems}
            onItemSelection={handleItemSelection}
          />
        </View>
      }
      hasBackDrop={false}
      bottomSheetModalRef={bottomSheetRef}
      enablePanDownToClose={false}
      hasXButton={false}
      enableOverDrag={false}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.backgroundFill
  },
  catAnimationContainer: {
    position: 'absolute',
    top: cat.y,
    left: cat.x,
    width: cat.width,
    height: cat.height,
    backgroundColor: 'red',
  },
  content: {
    flex: 1,
    marginTop: -330,
    paddingHorizontal: 20,
    width: '100%',
  },
  saveButtonContainer: {
    position: 'absolute',
    top: screenHeight - BOTTOM_SHEET_HEIGHT - (42 + 20), // 버튼 높이 42  + margin 20
    right: 20,
    zIndex: 1000000,
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
  topNavigation: {
    position: 'absolute',
    top: 60,
    zIndex: 100,
  },
  bottomSheetContent: { 
    height: BOTTOM_SHEET_HEIGHT,
    minHeight: BOTTOM_SHEET_MIN_HEIGHT,
    maxHeight: BOTTOM_SHEET_MAX_HEIGHT,
  },
  placedItem: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    zIndex: 10, // 다른 요소들 위에 표시
  },
  placedItemImage: {
    width: '100%',
    height: '100%',
  },
  placedItemPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grayScale200,
  },
});

export default MyTab;