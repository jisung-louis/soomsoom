import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, LayoutRectangle, Image } from 'react-native';
import LottieView from 'lottie-react-native';
import { getItemPosition, roomItemList } from '../../../data/roomItemData';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HomeStackParamList } from '../../../navigations/tabs/HomeStackNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import HeartPoint from '../../../components/common/heart-point/HeartPoint';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { Button } from '../../../components/common/buttons/Button';
import { CustomAlert } from '../../../components/common/alert';

type ShopItemDetailScreenRouteProp = RouteProp<HomeStackParamList, 'ShopItemDetailScreen'>;

const ShopItemDetailScreen = () => {
    const route = useRoute<ShopItemDetailScreenRouteProp>();
    const { itemId } = route.params;
    const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
    const [catLayout, setCatLayout] = useState<LayoutRectangle>({x: 0, y: 0, width: 0, height: 0});
    const item = roomItemList.find(item => item.id === itemId);
    console.log('item', item);
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const handleBack = () => {
        navigation.goBack();
    };

    const handleBuy = () => {
        if (isLoading) return;
        setIsLoading(true);
        onBuy();
    };
    const onBuy = () => {
        setIsAlertVisible(true);
        // TODO: 구매 로직 추가
        console.log('onBuy');
        setIsLoading(false);
    };
  return (
    <ImageBackground 
        source={require('../../../assets/images/background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <SubpageHeader onBack={handleBack} right={<HeartPoint money="1.5M" onPress={() => {}}/>}/>
            <View style={styles.content}>
                <View style={styles.itemImageContainer}>
                    {item?.image === null ? (
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
            <LottieView
                source={item?.lottieJson}
                autoPlay
                loop
                style={[styles.sunglass, {
                top: getItemPosition(catLayout.x, catLayout.y, 'face').y,
                left: getItemPosition(catLayout.x, catLayout.y, 'face').x,
                }]}
            />
            <LottieView
                key="cat"
                source={require('../../../assets/animations/cat.json')}
                autoPlay
                loop
                style={[styles.cat, {
                }]}
                onLayout={(event) => {
                setCatLayout(event.nativeEvent.layout);
                }}
            />
            
        </SafeAreaView>
        <View style={styles.buttonContainer}>
            <Button icon='heart' title={`${item?.price} 구매하기`} size='large' variant='active' style={{gap: 2}} onPress={handleBuy} />
        </View>
        <CustomAlert
            visible={isAlertVisible}
            message="구매가 완료되었어요!"
            buttons={[{ text: '확인', onPress: () => setIsAlertVisible(false) }]}
        />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  safeArea: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  cat: {
    width: 200,
    height: 200,
    position: 'absolute',
    top: 349,
    left: 106,
    zIndex: 1000,
  },
  sunglass: {
    width: 80,
    height: 80,
    position: 'absolute',
    zIndex: 10000,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
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
  },
  itemDescription: {
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
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
});


export default ShopItemDetailScreen;