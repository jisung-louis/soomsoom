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

const mockStatusData = [
  { title: '기록', valueType: '회', value: 0 },
  { title: '운동', valueType: '회', value: 0 },
  { title: '시간', valueType: 'mm:ss', value: '00:00' },
];
const statusCardContentItemWidth = 100 / mockStatusData.length;

const MyTab = () => {
  const navigation = useNavigation<StackNavigationProp<MyStackParamList>>();
  const scrollViewRef = useRef<ScrollView>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [isEditMode, setIsEditMode] = useState(false); // 방 꾸미기 모드 
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabPress = (index: number) => {
    setSelectedTab(index);
  };

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
            source={require('../../assets/animations/cat_basic_motion.json')}
            autoPlay
            loop
            style={{ width: '100%', height: '100%' }}
          />
        </View>
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
          <MyRoomDecoration selectedTab={selectedTab} handleTabPress={handleTabPress} />
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
});

export default MyTab;